const httpStatus = require('http-status');
const { Payment } = require('../../../src/models');
const ApiError = require('../../../src/utils/ApiError');
const { payOS } = require('../../../src/config/payos');
const paymentService = require('../../../src/services/payment.service');

jest.mock('../../../src/models', () => ({
  Payment: jest.fn(),
}));

jest.mock('../../../src/config/payos', () => ({
  payOS: {
    createPaymentLink: jest.fn(),
    getPaymentLinkInformation: jest.fn(),
  },
}));

jest.mock('../../../src/utils/ApiError', () => {
  return jest.fn().mockImplementation((statusCode, message) => {
    const error = new Error(message || 'Error');
    error.statusCode = statusCode || 500;
    return error;
  });
});

describe('Payment Service', () => {
  describe('createPayment', () => {
    it('should create a new payment and return it', async () => {
      const paymentData = {
        amount: 100,
        description: 'Test Payment',
        returnUrl: 'http://localhost:3100/success.html',
        cancelUrl: 'http://localhost:3100/cancel.html',
        userId: 'userId',
      };
      const mockPayment = {
        ...paymentData,
        orderCode: 749381123078087,
        save: jest.fn().mockResolvedValueOnce(),
      };
      Payment.mockImplementation(() => mockPayment);
      payOS.createPaymentLink.mockResolvedValueOnce({ checkoutUrl: 'http://example.com/checkout' });

      const result = await paymentService.createPayment(paymentData);

      expect(result).toEqual(mockPayment);
      expect(Payment).toHaveBeenCalledWith(expect.objectContaining({ ...paymentData, orderCode: expect.any(Number) }));
      expect(mockPayment.save).toHaveBeenCalledTimes(2);
      expect(payOS.createPaymentLink).toHaveBeenCalledWith(expect.objectContaining({ orderCode: expect.any(Number) }));
    });

    it('should throw an error if required fields are missing', async () => {
      const paymentData = {
        amount: 100,
        description: 'Test Payment',
        returnUrl: 'http://example.com/return',
      };

      await expect(paymentService.createPayment(paymentData)).rejects.toThrow('Failed to create payment');
    });
  });

  describe('getPaymentById', () => {
    it('should return payment by ID', async () => {
      const mockPayment = { _id: 'paymentId', amount: 100 };
      Payment.findById = jest.fn().mockResolvedValueOnce(mockPayment);

      const result = await paymentService.getPaymentById('paymentId');

      expect(result).toEqual(mockPayment);
      expect(Payment.findById).toHaveBeenCalledWith('paymentId');
    });

    it('should throw an error if payment is not found', async () => {
      Payment.findById = jest.fn().mockResolvedValueOnce(null);

      await expect(paymentService.getPaymentById('paymentId')).rejects.toThrow('Failed to get payment');
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status and return the updated payment', async () => {
      const mockPayment = { _id: 'paymentId', amount: 100, status: 'pending' };
      Payment.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(mockPayment);

      const result = await paymentService.updatePaymentStatus('paymentId', 'success');

      expect(result).toEqual(mockPayment);
      expect(Payment.findByIdAndUpdate).toHaveBeenCalledWith(
        'paymentId',
        { status: 'success', updatedAt: expect.any(Date) },
        { new: true }
      );
    });

    it('should throw an error if payment is not found', async () => {
      Payment.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(null);

      await expect(paymentService.updatePaymentStatus('paymentId', 'success')).rejects.toThrow(
        'Failed to update payment status'
      );
    });
  });

  describe('getPaymentStatus', () => {
    it('should return SKIPPED status if no checkoutUrl', async () => {
      const mockPayment = { _id: 'paymentId', orderCode: 12345, checkoutUrl: null };
      Payment.findById = jest.fn().mockResolvedValueOnce(mockPayment);

      const result = await paymentService.getPaymentStatus('paymentId');

      expect(result).toEqual({ status: 'SKIPPED', message: 'No checkoutUrl' });
      expect(Payment.findById).toHaveBeenCalledWith('paymentId');
    });

    it('should throw an error if payment is not found', async () => {
      Payment.findById = jest.fn().mockResolvedValueOnce(null);

      await expect(paymentService.getPaymentStatus('paymentId')).rejects.toThrow('Failed to get payment status');
    });
  });

  describe('updateAllPayments', () => {
    it('should update all payments and return stats', async () => {
      const mockPayments = [
        { _id: 'paymentId1', checkoutUrl: 'http://example.com/checkout1' },
        { _id: 'paymentId2', checkoutUrl: 'http://example.com/checkout2' },
        { _id: 'paymentId3', checkoutUrl: null },
      ];
      Payment.find = jest.fn().mockResolvedValueOnce(mockPayments);
      paymentService.getPaymentStatus = jest.fn().mockResolvedValueOnce();

      const result = await paymentService.updateAllPayments();

      expect(result).toEqual({
        message: 'Payments update completed',
        stats: {
          total: 3,
          processed: 0,
          skipped: 1,
          failed: 2,
        },
      });
      expect(Payment.find).toHaveBeenCalled();
      expect(paymentService.getPaymentStatus).not.toHaveBeenCalled();
    });

    it('should throw an error if there is an issue updating payments', async () => {
      Payment.find = jest.fn().mockRejectedValueOnce(new Error('Error fetching payments'));

      await expect(paymentService.updateAllPayments()).rejects.toThrow('Failed to update payments');
    });
  });
});
