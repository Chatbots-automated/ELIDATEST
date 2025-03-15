import { Order } from './orderService';

interface TransactionRequest {
  amount: number;
  reference: string;
  email: string;
  orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;
}

interface TransactionResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  payment_methods?: {
    other?: Array<{ name: string; url: string }>;
  };
}

const API_URL = 'https://api.maksekeskus.ee/v1/transactions';

// ✅ Securely encode credentials
const getEncodedCredentials = (): string => {
  const storeId = import.meta.env.VITE_MAKECOMMERCE_STORE_ID;
  const secretKey = import.meta.env.VITE_MAKECOMMERCE_SECRET_KEY;

  if (!storeId || !secretKey) {
    console.error('🚨 Missing MakeCommerce credentials.');
    throw new Error('MakeCommerce credentials are missing.');
  }

  const credentials = `${storeId}:${secretKey}`;
  return btoa(credentials);
};

export const createTransaction = async ({
  amount,
  reference,
  email,
  orderData
}: TransactionRequest): Promise<string> => {
  try {
    // ✅ Get user's IP address
    const ipResponse = await fetch('https://api64.ipify.org?format=json');
    const { ip } = await ipResponse.json();

    // ✅ Encode credentials securely
    const encodedCredentials = getEncodedCredentials();

    // ✅ Prepare request data
    const requestData = {
      transaction: {
        amount: amount.toFixed(2),
        currency: 'EUR',
        reference,
        merchant_data: `Order ID: ${reference}`,
        recurring_required: false,
        transaction_url: {
          return_url: { url: `https://elida.lt/payment-success?reference=${reference}`, method: "GET" },
          cancel_url: { url: `https://elida.lt/payment-failed`, method: "GET" },
          notification_url: { url: `https://elida.lt/api/payment-webhook?reference=${reference}`, method: "POST" } // ✅ Sends Webhook to Server
        }
      },
      customer: {
        email,
        country: 'LT',
        locale: 'LT',
        ip,
        name: orderData?.shipping?.name || 'Unknown',
        phone: orderData?.shipping?.phone || '',
        address: orderData?.shipping?.method === 'shipping'
          ? {
              street: orderData?.shipping?.address || 'Not provided',
              city: orderData?.shipping?.city || 'Not provided',
              postal_code: orderData?.shipping?.postalCode || 'Not provided',
              country: 'LT'
            }
          : undefined
      },
      order: {
        reference,
        amount: amount.toFixed(2),
        currency: 'EUR',
        items: (orderData?.items || []).map(item => ({
          name: item.name || 'Unknown Product',
          price: (item.price || 0).toFixed(2),
          quantity: item.quantity || 1
        }))
      }
    };

    console.log('🔄 Sending Payment Request:', JSON.stringify(requestData, null, 2));

    // ✅ Make API request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`
      },
      body: JSON.stringify(requestData)
    });

    // ✅ Handle errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🚨 Payment API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        requestData
      });
      throw new Error(errorData.message || `Payment request failed: ${response.statusText}`);
    }

    const data: TransactionResponse = await response.json();
    console.log('✅ Payment Response:', JSON.stringify(data, null, 2));

    // ✅ Extract payment URL
    const paymentUrl = data.payment_methods?.other?.find(method => method.name === "redirect")?.url;
    if (!paymentUrl) throw new Error("Payment URL missing in response.");

    return paymentUrl;
  } catch (error) {
    console.error('❌ Payment Transaction Error:', error);
    throw new Error(error instanceof Error ? `Payment transaction failed: ${error.message}` : 'Payment transaction failed');
  }
};

export const verifyPayment = async (transactionId: string): Promise<boolean> => {
  try {
    const encodedCredentials = getEncodedCredentials();

    const response = await fetch(`${API_URL}/${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🚨 Payment Verification Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        transactionId
      });
      throw new Error(errorData.message || `Payment verification failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Payment status for ${transactionId}: ${data.status}`);

    return data.status === 'completed';
  } catch (error) {
    console.error('❌ Payment Verification Error:', {
      error,
      transactionId
    });

    throw new Error(error instanceof Error ? `Payment verification failed: ${error.message}` : 'Payment verification failed');
  }
};
