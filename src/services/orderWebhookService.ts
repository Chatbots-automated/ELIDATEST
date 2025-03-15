import { Order } from '../types/order';

const WEBHOOK_URL = 'https://hook.eu2.make.com/v5xjz6qi9ltm225himstcxn0jssqivu7';

export const sendOrderWebhook = async (orderData: Order): Promise<void> => {
  try {
    if (!orderData) {
      throw new Error('❌ No order data provided.');
    }

    // ✅ Log the order data before sending
    console.log('📤 Preparing Webhook Data:', JSON.stringify(orderData, null, 2));

    const webhookData = {
      type: 'NEW_ORDER',
      order: {
        reference: orderData.reference || 'N/A',
        customer: {
          name: orderData?.shipping?.name || 'Unknown',
          email: orderData?.email || 'No email provided',
          phone: orderData?.shipping?.phone || 'No phone provided',
          address:
            orderData?.shipping?.method === 'shipping'
              ? {
                  street: orderData?.shipping?.address || 'No address',
                  city: orderData?.shipping?.city || 'No city',
                  postalCode: orderData?.shipping?.postalCode || 'No postal code',
                  country: 'LT'
                }
              : 'Pickup in store'
        },
        items: orderData.items?.map(item => ({
          name: item.name || 'Unknown Product',
          quantity: item.quantity || 1,
          price: item.price || 0,
          total: (item.price || 0) * (item.quantity || 1)
        })) || [],
        shipping: {
          method: orderData?.shipping?.method || 'unknown',
          cost: orderData?.shipping?.cost || 0 // Set shipping cost properly
        },
        payment: {
          total: orderData?.total || 0,
          currency: 'EUR',
          status: orderData?.status || 'pending'
        },
        createdAt: orderData?.createdAt || new Date().toISOString()
      }
    };

    // ✅ Log the final webhook payload before sending
    console.log('📤 Sending Webhook:', JSON.stringify(webhookData, null, 2));

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🚨 Webhook failed with status: ${response.status}, Response: ${errorText}`);
      throw new Error(`Webhook failed with status: ${response.status}, Response: ${errorText}`);
    }

    console.log('✅ Order webhook sent successfully');
  } catch (error) {
    console.error('❌ Error sending order webhook:', error);
    throw error;
  }
};
