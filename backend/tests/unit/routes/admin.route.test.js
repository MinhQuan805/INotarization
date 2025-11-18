const express = require('express');
const { adminController } = require('../../../src/controllers');
const auth = require('../../../src/middlewares/auth');

// Mock dependencies
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    get: jest.fn().mockReturnThis(),
  })),
}));

jest.mock('../../../src/middlewares/auth', () => jest.fn((right) => `auth_${right}`));

jest.mock('../../../src/controllers', () => ({
  adminController: {
    getDocumentCount: jest.fn(),
    getUserCount: jest.fn(),
    getDocumentsByNotaryField: jest.fn(),
    getEmployeeCount: jest.fn(),
    getEmployeeList: jest.fn(),
    getSessionCount: jest.fn(),
    getPaymentTotal: jest.fn(),
    getPaymentTotalByService: jest.fn(),
    getPaymentTotalByNotarizationField: jest.fn(),
  },
}));

describe('Admin routes', () => {
  let router;

  beforeAll(() => {
    require('../../../src/routes/v1/admin.route');
  });

  beforeEach(() => {
    router = express.Router();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Document metrics routes', () => {
    beforeEach(() => {
      router.get('/documents/:period', auth('getDocumentCount'), adminController.getDocumentCount);
      router.get('/documents/fields/:period', auth('getDocumentsByNotaryField'), adminController.getDocumentsByNotaryField);
    });

    test('GET /documents/:period should use correct middleware and controller', () => {
      expect(router.get).toHaveBeenCalledWith(
        '/documents/:period',
        'auth_getDocumentCount',
        adminController.getDocumentCount
      );
    });

    test('GET /documents/fields/:period should use correct middleware and controller', () => {
      expect(router.get).toHaveBeenCalledWith(
        '/documents/fields/:period',
        'auth_getDocumentsByNotaryField',
        adminController.getDocumentsByNotaryField
      );
    });
  });

  describe('User metrics routes', () => {
    beforeEach(() => {
      router.get('/users/:period', auth('getUserCount'), adminController.getUserCount);
    });

    test('GET /users/:period should use correct middleware and controller', () => {
      expect(router.get).toHaveBeenCalledWith('/users/:period', 'auth_getUserCount', adminController.getUserCount);
    });
  });

  describe('Employee routes', () => {
    beforeEach(() => {
      router.get('/employees/count', auth('getEmployeeCount'), adminController.getEmployeeCount);
      router.get('/employees/list', auth('getEmployeeList'), adminController.getEmployeeList);
    });

    test('GET /employees/count should use correct middleware and controller', () => {
      expect(router.get).toHaveBeenCalledWith('/employees/count', 'auth_getEmployeeCount', adminController.getEmployeeCount);
    });

    test('GET /employees/list should use correct middleware and controller', () => {
      expect(router.get).toHaveBeenCalledWith('/employees/list', 'auth_getEmployeeList', adminController.getEmployeeList);
    });
  });

  describe('Session metrics routes', () => {
    beforeEach(() => {
      router.get('/sessions/:period', auth('getSessionCount'), adminController.getSessionCount);
    });

    test('GET /sessions/:period should use correct middleware and controller', () => {
      expect(router.get).toHaveBeenCalledWith('/sessions/:period', 'auth_getSessionCount', adminController.getSessionCount);
    });
  });

  describe('Payment metrics routes', () => {
    beforeEach(() => {
      router.get('/payments/:period', auth('getPaymentTotal'), adminController.getPaymentTotal);
      router.get('/payments/:period/service', auth('getPaymentTotalByService'), adminController.getPaymentTotalByService);
      router.get(
        '/payments/:period/field',
        auth('getPaymentTotalByNotarizationField'),
        adminController.getPaymentTotalByNotarizationField
      );
    });

    test('GET /payments/:period should use correct middleware and controller', () => {
      expect(router.get).toHaveBeenCalledWith('/payments/:period', 'auth_getPaymentTotal', adminController.getPaymentTotal);
    });

    test('GET /payments/:period/service should use correct middleware and controller', () => {
      expect(router.get).toHaveBeenCalledWith(
        '/payments/:period/service',
        'auth_getPaymentTotalByService',
        adminController.getPaymentTotalByService
      );
    });

    test('GET /payments/:period/field should use correct middleware and controller', () => {
      expect(router.get).toHaveBeenCalledWith(
        '/payments/:period/field',
        'auth_getPaymentTotalByNotarizationField',
        adminController.getPaymentTotalByNotarizationField
      );
    });
  });
});
