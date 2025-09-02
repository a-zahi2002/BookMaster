const logger = require('../utils/logger');

class PaymentService {
    static async processCashPayment(amount, tendered) {
        try {
            const change = tendered - amount;
            if (change < 0) {
                throw new Error('Insufficient payment amount');
            }
            return {
                success: true,
                method: 'cash',
                amount,
                tendered,
                change,
                timestamp: new Date()
            };
        } catch (error) {
            logger.error('Cash payment processing error:', error);
            throw error;
        }
    }

    static async processBankTransfer(amount, reference) {
        try {
            return {
                success: true,
                method: 'bank_transfer',
                amount,
                reference,
                timestamp: new Date()
            };
        } catch (error) {
            logger.error('Bank transfer processing error:', error);
            throw error;
        }
    }

    static async processMobilePayment(amount, provider) {
        try {
            return {
                success: true,
                method: 'mobile_payment',
                amount,
                provider,
                timestamp: new Date()
            };
        } catch (error) {
            logger.error('Mobile payment processing error:', error);
            throw error;
        }
    }
}

module.exports = PaymentService; 