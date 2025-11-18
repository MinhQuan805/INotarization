const express = require('express');
const auth = require('../../../src/middlewares/auth');
const validate = require('../../../src/middlewares/validate');
const notarizationController = require('../../../src/controllers/notarization.controller');

// Mock router instance
const mockRouter = {
  route: jest.fn((path) => ({
    post: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    patch: jest.fn().mockReturnThis(),
  })),
  post: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  patch: jest.fn().mockReturnThis(),
};

// Mock upload middleware
const mockUpload = {
  array: jest.fn().mockReturnValue('upload.array middleware'),
  single: jest.fn().mockReturnValue('upload.single middleware'),
  none: jest.fn().mockReturnValue('upload.none middleware'),
};

jest.mock('express', () => ({
  Router: jest.fn(() => mockRouter),
}));

jest.mock('multer', () => {
  const multer = jest.fn(() => mockUpload);
  multer.memoryStorage = jest.fn(() => 'memoryStorage');
  return multer;
});

jest.mock('../../../src/middlewares/auth', () => jest.fn((right) => `auth_${right}`));

jest.mock('../../../src/middlewares/validate', () => jest.fn((schema) => `validate_${schema}`));

jest.mock('../../../src/controllers/notarization.controller', () => ({
  createDocument: jest.fn(),
  getDocumentById: jest.fn(),
  getHistory: jest.fn(),
  getHistoryByUserId: jest.fn(),
  getDocumentStatus: jest.fn(),
  getDocumentByRole: jest.fn(),
  approveSignatureByUser: jest.fn(),
  approveSignatureByNotary: jest.fn(),
}));

describe('Notarization Routes', () => {
  let router;

  beforeEach(() => {
    jest.clearAllMocks();
    router = require('../../../src/routes/v1/notarization.route');
  });

  it('should setup all routes correctly', () => {
    expect(mockRouter.route).toHaveBeenCalledWith('/upload-files');
    expect(mockRouter.route).toHaveBeenCalledWith('/document/:documentId');
    expect(mockRouter.route).toHaveBeenCalledWith('/history');
    expect(mockRouter.route).toHaveBeenCalledWith('/getStatusById/:documentId');
    expect(mockRouter.route).toHaveBeenCalledWith('/getDocumentByRole');
    expect(mockRouter.route).toHaveBeenCalledWith('/approve-signature-by-notary');
  });
});
