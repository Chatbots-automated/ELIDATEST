import express from 'express';

const router = express.Router();

// Mock database for now (replace with Firestore or any DB)
const ordersDatabase: Record<string, any> = {}; // Example DB storage

// ✅ Receive Webhook from MakeCommerce
router.post('/api/payment-webhook', async (req, res) => {
    try {
        const paymentData = req.body;
        console.log('🔄 Received Payment Webhook:', paymentData);

        // Validate required fields
        if (!paymentData.reference || !paymentData.status) {
            console.error('❌ Invalid webhook data:', paymentData);
            return res.status(400).json({ error: 'Invalid webhook data' });
        }

        // ✅ Fetch Order Details using reference
        const orderDetails = ordersDatabase[paymentData.reference]; // Replace with DB query

        if (!orderDetails) {
            console.error('❌ Order not found for reference:', paymentData.reference);
            return res.status(404).json({ error: 'Order not found' });
        }

        // ✅ Merge Payment Data with Full Order Details
        const enrichedData = {
            ...paymentData, // Original MakeCommerce data
            order: orderDetails, // Full order details
        };

        console.log('✅ Sending Enriched Webhook to Make.com:', enrichedData);

        // ✅ Forward to Make.com Webhook
        await fetch('https://hook.eu2.make.com/v5xjz6qi9ltm225himstcxn0jssqivu7', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(enrichedData),
        });

        return res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('❌ Webhook processing failed:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
