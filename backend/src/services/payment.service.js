const httpStatus = require('http-status');
const { Payment } = require('../models');
const ApiError = require('../utils/ApiError');
const { payOS } = require('../config/payos');
require('dotenv').config();

// Define the maximum allowable value for the orderCode and reduce the range to avoid edge cases.
const MAX_SAFE_INTEGER = 9007199254740991;
const MAX_ORDER_CODE = Math.floor(MAX_SAFE_INTEGER / 10); // Reduced range

const generateOrderCode = () => {
  // Generate a number less than MAX_ORDER_CODE
  return Math.floor(Math.random() * MAX_ORDER_CODE) + 1;
};

const createPayment = async (paymentData) => {
  try {
    const { amount, description, returnUrl, cancelUrl, userId } = paymentData;
    if (!amount || !description || !returnUrl || !cancelUrl || !userId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required fields');
    }

    // Create payment object with a valid orderCode
    const payment = new Payment({
      orderCode: generateOrderCode(), // Ensuring a valid orderCode
      amount,
      description,
      returnUrl,
      cancelUrl,
      userId,
    });

    console.log('Payment Data:', payment);
    await payment.save();

    const paymentLinkResponse = await payOS.createPaymentLink({
      orderCode: payment.orderCode,
      amount: payment.amount,
      description: payment.description,
      returnUrl: payment.returnUrl,
      cancelUrl: payment.cancelUrl,
    });

    payment.checkoutUrl = paymentLinkResponse.checkoutUrl;
    await payment.save();
    console.log('Payment Link Response:', paymentLinkResponse);
    return payment;
  } catch (error) {
    console.error('Error creating payment:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create payment');
  }
};

const getPaymentById = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
    }
    return payment;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error getting payment:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get payment');
  }
};

const updatePaymentStatus = async (paymentId, status) => {
  try {
    const payment = await Payment.findByIdAndUpdate(paymentId, { status, updatedAt: new Date() }, { new: true });
    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
    }
    return payment;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error updating payment status:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update payment status');
  }
};

const getPaymentStatus = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
    }

    if (!payment.checkoutUrl) {
      return { status: 'SKIPPED', message: 'No checkoutUrl' };
    }

    const paymentStatusResponse = await payOS.getPaymentLinkInformation(payment.orderCode);

    if (paymentStatusResponse.status === 'PAID') {
      await updatePaymentStatus(paymentId, 'success');
    } else if (paymentStatusResponse.status === 'CANCELLED') {
      await updatePaymentStatus(paymentId, 'cancelled');
    } else if (paymentStatusResponse.status === 'FAILED') {
      await updatePaymentStatus(paymentId, 'failed');
    }
    return paymentStatusResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error getting payment status:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get payment status');
  }
};

const updateAllPayments = async () => {
  try {
    const payments = await Payment.find();
    const delayBetweenRequests = 1000;
    let processed = 0;
    let skipped = 0;
    let failed = 0;

    // Process payments sequentially with delay
    for (const payment of payments) {
      try {
        // Skip if no checkoutUrl
        if (!payment.checkoutUrl) {
          console.log(`Skipping payment ${payment._id}: No checkoutUrl`);
          skipped++;
          continue;
        }

        await getPaymentStatus(payment._id);
        processed++;

        // Add delay between requests
        await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
      } catch (error) {
        console.error(`Error updating payment ${payment._id}:`, error.message);
        failed++;
        continue;
      }
    }

    return {
      message: 'Payments update completed',
      stats: {
        total: payments.length,
        processed,
        skipped,
        failed,
      },
    };
  } catch (error) {
    console.error('Error updating payments:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update payments');
  }
};

module.exports = {
  createPayment,
  getPaymentById,
  updatePaymentStatus,
  getPaymentStatus,
  updateAllPayments,
};
