// tests/unit/services/email.service.test.js

// First mock all external dependencies
jest.mock('nodemailer');
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));
jest.mock('../../../src/config/logger');
jest.mock('../../../src/config/config', () => ({
  email: {
    smtp: {
      host: 'smtp.test.com',
      port: 587,
      auth: {
        user: 'test@example.com',
        pass: 'password123',
      },
    },
    from: 'test@example.com',
  },
  env: 'test',
}));

// Then import dependencies
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../../src/config/config');

// Create mock transport before importing email service
const mockTransport = {
  sendMail: jest.fn().mockResolvedValue(true),
  verify: jest.fn().mockResolvedValue(true),
};

nodemailer.createTransport.mockReturnValue(mockTransport);

// Now import email service
const emailService = require('../../../src/services/email.service');

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const html = '<p>Test content</p>';

      await emailService.sendEmail(to, subject, html);

      expect(mockTransport.sendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to,
        subject,
        html,
      });
    });

    it('should throw error when email sending fails', async () => {
      const error = new Error('Failed to send email');
      mockTransport.sendMail.mockRejectedValueOnce(error);

      await expect(emailService.sendEmail('test@example.com', 'subject', 'html')).rejects.toThrow('Failed to send email');
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should send reset password email', async () => {
      const to = 'test@example.com';
      const token = 'reset-token';
      const templateHtml = '<p>Reset password {{resetPasswordUrl}}</p>';

      fs.readFile.mockResolvedValueOnce(templateHtml);

      await emailService.sendResetPasswordEmail(to, token);

      expect(mockTransport.sendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to,
        subject: 'Reset password',
        html: expect.stringContaining(token),
      });
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email', async () => {
      const to = 'test@example.com';
      const token = 'verify-token';
      const templateHtml = '<p>Verify email {{verificationEmailUrl}}</p>';

      fs.readFile.mockResolvedValueOnce(templateHtml);

      await emailService.sendVerificationEmail(to, token);

      expect(mockTransport.sendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to,
        subject: 'Email Verification',
        html: expect.stringContaining(token),
      });
    });
  });

  describe('sendInvitationEmail', () => {
    it('should send invitation email', async () => {
      const to = 'test@example.com';
      const sessionId = 'session-123';
      const templateHtml = '<p>Join session {{joinSessionURL}}</p>';

      fs.readFile.mockResolvedValueOnce(templateHtml);

      await emailService.sendInvitationEmail(to, sessionId);

      expect(mockTransport.sendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to,
        subject: 'Session Invitation',
        html: expect.stringContaining(sessionId),
      });
    });
  });

  describe('sendDocumentUploadEmail', () => {
    it('should send document upload email', async () => {
      const to = 'test@example.com';
      const userName = 'John Doe';
      const documentId = 'doc-123';
      const templateHtml = '<p>Document {{documentId}} uploaded by {{userName}}</p>';

      fs.readFile.mockResolvedValueOnce(templateHtml);

      await emailService.sendDocumentUploadEmail(to, userName, documentId);

      expect(mockTransport.sendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to,
        subject: 'Document Upload Confirmation',
        html: expect.stringContaining(documentId),
      });
    });

    it('should throw error when required parameters are missing', async () => {
      await expect(emailService.sendDocumentUploadEmail()).rejects.toThrow('Missing required parameters');
    });
  });

  describe('sendDocumentStatusUpdateEmail', () => {
    it('should send status update email with feedback', async () => {
      const email = 'test@example.com';
      const documentId = 'doc-123';
      const currentStatus = 'pending';
      const newStatus = '<p>Status changed from pending to approved</p>';
      const feedback = 'Looks good';
      const templateHtml = '<p>Status changed from {{currentStatus}} to {{newStatus}}</p>';

      fs.readFile.mockResolvedValueOnce(templateHtml);

      await emailService.sendDocumentStatusUpdateEmail(email, documentId, currentStatus, newStatus, feedback);

      expect(mockTransport.sendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to: email,
        subject: 'Document Status Updated',
        html: '<p>Status changed from pending to <p>Status changed from pending to approved</p></p>',
      });
    });

    it('should use rejected subject when status is rejected', async () => {
      const templateHtml = '<p>Document rejected</p>';
      fs.readFile.mockResolvedValueOnce(templateHtml);

      await emailService.sendDocumentStatusUpdateEmail(
        'test@example.com',
        'doc-123',
        'pending',
        'rejected',
        'Rejected feedback'
      );

      expect(mockTransport.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'test@example.com',
          html: '<p>Document rejected</p>',
          subject: 'Document Rejected',
          to: 'test@example.com',
        })
      );
    });
  });

  describe('sendPaymentEmail', () => {
    test('should send payment email', async () => {
      const email = 'test@example.com';
      const documentId = 'documentId';
      const paymentLinkResponse = { checkoutUrl: 'http://payment.url' };

      // Mock fs.readFile to return a template string
      const templateHtml = '<p>Payment link: {{paymentLink}}</p>';
      fs.readFile.mockResolvedValueOnce(templateHtml);

      await emailService.sendPaymentEmail(email, documentId, paymentLinkResponse);

      expect(mockTransport.sendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to: email,
        subject: 'Payment Required',
        html: '<p>Payment link: http://payment.url</p>',
      });
    });
  });
});
