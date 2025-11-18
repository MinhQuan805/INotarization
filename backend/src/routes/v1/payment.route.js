const express = require('express');
const paymentController = require('../../controllers/payment.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Testing route for payment API
 */

router.post('/create-payment', paymentController.createPayment);
router.get('/get-payment/:paymentId', paymentController.getPayment);
router.put('/update-payment-status/:paymentId', paymentController.updatePaymentStatus);
router.get('/get-payment-status/:paymentId', paymentController.getPaymentStatus);
router.get('/update-all-payments', paymentController.updateAllPayments);

module.exports = router;

/**
 * @swagger
 * /payments/create-payment:
 *   post:
 *     summary: Create a new payment
 *     description: Create a new payment with the specified amount, description, and URLs for success or cancellation.
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *               - returnUrl
 *               - cancelUrl
 *               - userId
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount of the payment
 *                 format: float
 *               description:
 *                 type: string
 *                 description: The description of the payment
 *               returnUrl:
 *                 type: string
 *                 description: URL to redirect to after payment success
 *               cancelUrl:
 *                 type: string
 *                 description: URL to redirect to after payment cancellation
 *               userId:
 *                 type: string
 *                 description: The ID of the user making the payment
 *             example:
 *               amount: 2000
 *               description: "abcxyz"
 *               returnUrl: "http://localhost:3100/success.html"
 *               cancelUrl: "http://localhost:3100/cancel.html"
 *               userId: "670a2a40c5006536cc5f92d2"
 *     responses:
 *       201:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payments/get-payment/{paymentId}:
 *   get:
 *     summary: Get a payment by ID
 *     description: Retrieve details of a specific payment by its ID.
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment to retrieve
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payments/update-payment-status/{paymentId}:
 *   put:
 *     summary: Update the status of a payment
 *     description: Update the status of a payment by its ID.
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the payment
 *                 enum: [pending, success, failed, cancelled]
 *             example:
 *               status: "success"
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payments/get-payment-status/{paymentId}:
 *   get:
 *     summary: Get the status of a payment
 *     description: Get the status of a payment by its ID.
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment to retrieve
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payments/update-all-payments:
 *   get:
 *     summary: Update all payments
 *     description: Update the status of all payments in the database
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Payments updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payments updated successfully"
 *       500:
 *         description: Internal server error
 */
