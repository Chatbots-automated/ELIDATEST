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
const WEBHOOK_URL = 'https://elida.lt/payment-webhook'; // ✅ Centralized webhook URL

// ✅ Securely encode credentials
const getEncodedCredentials = (): string => {
  const storeId = import.meta.env.VITE_MAKECOMMERCE_STORE_ID;
  const secretKey = import.meta.env.VITE_MAKECOMMERCE_SECRET_KEY;

  if (!storeId || !secretKey) {
    console.error('🚨 Missing MakeCommerce credentials.');
    throw new Error('MakeCommerce credentials are missing.');
  }

  return btoa(`${storeId}:${secretKey}`);
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

    // ✅ Step 1: Create the transaction
    const requestData = {
      transaction: {
        amount: amount.toFixed(2),
        currency: 'EUR',
        reference,
        merchant_data: `Order ID: ${reference}`,
        recurring_required: false
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

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🚨 Payment API Error:', errorData);
      throw new Error(errorData.message || 'Payment request failed.');
    }

    const data: TransactionResponse = await response.json();
    console.log('✅ Payment Response:', JSON.stringify(data, null, 2));

    // ✅ Extract transaction ID
    if (!data.id) throw new Error("Transaction ID missing in response.");
    console.log(`🆔 Transaction ID: ${data.id}`);

    // ✅ Step 2: Update transaction with final URLs
    const returnUrl = `https://elida.lt/payment-success?reference=${reference}&transaction=${data.id}`;
    const cancelUrl = `https://elida.lt/payment-failed`;
    const webhookUrl = `${WEBHOOK_URL}?reference=${reference}&transaction=${data.id}`;

    const updateResponse = await fetch(`${API_URL}/${data.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`
      },
      body: JSON.stringify({
        transaction: {
          transaction_url: {
            return_url: { url: returnUrl, method: "GET" },
            cancel_url: { url: cancelUrl, method: "GET" },
            notification_url: { url: webhookUrl, method: "POST" }
          }
        }
      })
    });

    if (!updateResponse.ok) {
      const updateError = await updateResponse.json().catch(() => ({}));
      console.error('🚨 Failed to update transaction URLs:', updateError);
      throw new Error('Failed to update transaction.');
    }

    console.log('✅ Transaction URLs updated successfully.');

    // ✅ Extract payment URL
    const paymentUrl = data.payment_methods?.other?.find(method => method.name === "redirect")?.url;
    if (!paymentUrl) throw new Error("Payment URL missing in response.");

    return paymentUrl;
  } catch (error) {
    console.error('❌ Payment Transaction Error:', error);
    throw new Error(error instanceof Error ? `Payment transaction failed: ${error.message}` : 'Payment transaction failed');
  }
};

// ✅ Fetch transaction details when redirected
export const fetchTransactionDetails = async (transactionId: string): Promise<any> => {
  try {
    const encodedCredentials = getEncodedCredentials();
    console.log(`🔍 Fetching transaction for ID: ${transactionId}`);

    const response = await fetch(`${API_URL}/${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🚨 Fetch Transaction Error:', errorData);
      throw new Error('Transaction not found.');
    }

    const data = await response.json();
    console.log(`✅ Transaction found:`, data);
    return data;
  } catch (error) {
    console.error('❌ Transaction Fetch Error:', error);
    return null;
  }
};

// ✅ Verify payment status
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
      console.error('🚨 Payment Verification Error:', errorData);
      throw new Error('Payment verification failed.');
    }

    const data = await response.json();
    console.log(`✅ Payment status for ${transactionId}: ${data.status}`);

    return data.status === 'completed';
  } catch (error) {
    console.error('❌ Payment Verification Error:', error);
    return false;
  }
};
