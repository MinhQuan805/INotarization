const express = require('express');
const emailController = require('../../controllers/email.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Email
 * description: Email API
 */

router.post('/send-reset-password', emailController.sendResetPassword);
router.post('/send-verification', emailController.sendVerification);
router.post('/send-invitation', emailController.sendInvitation);
router.post('/send-document-status-update', emailController.sendDocumentStatusUpdate);
router.post('/send-payment', emailController.sendPayment);
router.post('/send-document-upload', emailController.sendDocumentUpload);

module.exports = router;

/**
 * @swagger
 * /email/send-reset-password:
 *   post:
 *     summary: Send reset password email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: abc123resetToken
 *     responses:
 *       200:
 *         description: Reset password email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset password email sent
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /email/send-verification:
 *   post:
 *     summary: Send verification email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: abc123verificationToken
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email sent
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /email/send-invitation:
 *   post:
 *     summary: Send session invitation email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 example: invitee@example.com
 *               sessionId:
 *                 type: string
 *                 example: session123
 *     responses:
 *       200:
 *         description: Invitation email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invitation email sent
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /email/send-document-status-update:
 *   post:
 *     summary: Send document status update email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               documentId:
 *                 type: string
 *                 example: doc123
 *               currentStatus:
 *                 type: string
 *                 example: pending
 *               newStatus:
 *                 type: string
 *                 example: approved
 *               feedback:
 *                 type: string
 *                 example: Your document has been approved.
 *     responses:
 *       200:
 *         description: Document status update email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Document status update email sent
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /email/send-payment:
 *   post:
 *     summary: Send payment email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: payer@example.com
 *               documentId:
 *                 type: string
 *                 example: doc456
 *               paymentLinkResponse:
 *                 type: object
 *                 properties:
 *                   checkoutUrl:
 *                     type: string
 *                     format: uri
 *                     example: https://paymentgateway.com/checkout?token=xyz789
 *     responses:
 *       200:
 *         description: Payment email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment email sent
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /email/send-document-upload:
 *   post:
 *     summary: Send document upload confirmation email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - userName
 *               - documentId
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               userName:
 *                 type: string
 *                 example: John Doe
 *               documentId:
 *                 type: string
 *                 example: doc789
 *     responses:
 *       200:
 *         description: Document upload confirmation email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Document upload confirmation email sent
 *       400:
 *         description: Bad request - Missing required fields
 *       500:
 *         description: Internal server error
 */
