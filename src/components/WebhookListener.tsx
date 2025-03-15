import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { handlePaymentWebhook } from '../services/webhookService';

export default function WebhookListener() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handlePaymentNotification = async () => {
      const reference = searchParams.get('reference');
      const status = searchParams.get('status');
      const transaction = searchParams.get('transaction');
      const amount = searchParams.get('amount');
      const currency = searchParams.get('currency');
      const customer_name = searchParams.get('customer_name');

      if (reference && status && transaction) {
        try {
          await handlePaymentWebhook({
            reference,
            status: status as 'COMPLETED' | 'FAILED' | 'PENDING',
            transaction,
            amount: amount ? parseFloat(amount) : 0,
            currency: currency || 'EUR',
            customer_name: customer_name || undefined
          });
        } catch (error) {
          console.error('Error handling payment notification:', error);
        }
      }
    };

    handlePaymentNotification();
  }, [searchParams]);

  return null;
}