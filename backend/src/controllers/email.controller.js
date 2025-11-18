const emailService = require('../services/email.service');

/**
 * Controller to send reset password email
 */
const sendResetPassword = async (req, res) => {
  const { to, token } = req.body;
  await emailService.sendResetPasswordEmail(to, token);
  res.status(200).send({ message: 'Reset password email sent' });
};

/**
 * Controller to send verification email
 */
const sendVerification = async (req, res) => {
  const { to, token } = req.body;
  await emailService.sendVerificationEmail(to, token);
  res.status(200).send({ message: 'Verification email sent' });
};

/**
 * Controller to send invitation email
 */
const sendInvitation = async (req, res) => {
  const { to, sessionId } = req.body;
  await emailService.sendInvitationEmail(to, sessionId);
  res.status(200).send({ message: 'Invitation email sent' });
};

/**
 * Controller to send document status update email
 */
const sendDocumentStatusUpdate = async (req, res) => {
  const { email, documentId, currentStatus, newStatus, feedback } = req.body;
  await emailService.sendDocumentStatusUpdateEmail(email, documentId, currentStatus, newStatus, feedback);
  res.status(200).send({ message: 'Document status update email sent' });
};

/**
 * Controller to send payment email
 */
const sendPayment = async (req, res) => {
  const { email, documentId, paymentLinkResponse } = req.body;
  await emailService.sendPaymentEmail(email, documentId, paymentLinkResponse);
  res.status(200).send({ message: 'Payment email sent' });
};

/**
 * Controller to send document upload confirmation email
 */
const sendDocumentUpload = async (req, res) => {
  const { to, userName, documentId } = req.body;

  // Validate input
  if (!to || !userName || !documentId) {
    return res.status(400).send({ message: 'Missing required fields: to, userName, documentId' });
  }

  // Log received data for debugging
  console.log(`Sending Document Upload Email to: ${to}, UserName: ${userName}, DocumentId: ${documentId}`);

  try {
    await emailService.sendDocumentUploadEmail(to, userName, documentId);
    res.status(200).send({ message: 'Document upload confirmation email sent' });
  } catch (error) {
    console.error('Error sending document upload email:', error);
    res.status(500).send({ message: 'Failed to send document upload confirmation email' });
  }
};

module.exports = {
  sendResetPassword,
  sendVerification,
  sendInvitation,
  sendDocumentStatusUpdate,
  sendPayment,
  sendDocumentUpload,
};
