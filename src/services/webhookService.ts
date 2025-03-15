import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Order } from '../types/order';

interface WebhookData {
  reference: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  transaction: string;
  amount: number;
  currency: string;
  customer_name?: string;
}

export const handlePaymentWebhook = async (webhookData: WebhookData): Promise<void> => {
  try {
    console.log("🔄 Processing Payment Webhook:", webhookData);

    const { reference, status, transaction, amount, currency, customer_name } = webhookData;

    // Get existing order from Firestore
    const orderRef = doc(db, "orders", reference);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      console.error(`❌ Order ${reference} not found in Firestore`);
      return;
    }

    const existingOrder = orderSnap.data() as Order;

    // Update order with payment details
    await setDoc(orderRef, {
      ...existingOrder,
      status: status === 'COMPLETED' ? 'completed' : status.toLowerCase(),
      payment: {
        transactionId: transaction,
        amount,
        currency,
        status,
        processedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Order ${reference} updated in Firestore`);

    // If payment is completed, trigger Make.com for email
    if (status === 'COMPLETED') {
      console.log(`📧 Triggering Make.com for order confirmation email`);
      
      await fetch("https://hook.eu2.make.com/v5xjz6qi9ltm225himstcxn0jssqivu7", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: 'ORDER_CONFIRMATION',
          reference,
          order: {
            ...existingOrder,
            payment: {
              transactionId: transaction,
              amount,
              currency,
              status,
              processedAt: new Date().toISOString()
            }
          }
        })
      });

      console.log(`✅ Make.com webhook triggered for order ${reference}`);
    }
  } catch (error) {
    console.error('❌ Error processing payment webhook:', error);
    throw error;
  }
};