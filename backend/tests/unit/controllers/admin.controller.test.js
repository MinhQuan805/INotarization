const httpStatus = require('http-status');
const { adminService } = require('../../../src/services');
const adminController = require('../../../src/controllers/admin.controller');
const catchAsync = require('../../../src/utils/catchAsync');
const pick = require('../../../src/utils/pick');

jest.mock('../../../src/services/admin.service');
jest.mock('../../../src/utils/catchAsync', () => (fn) => (req, res, next) => fn(req, res, next).catch(next));
jest.mock('../../../src/utils/pick');

describe('Admin Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDocumentCount', () => {
    it('should return document count for a valid period', async () => {
      req.params.period = 'today';
      const result = { count: 10 };
      adminService.getDocumentCount.mockResolvedValue(result);

      await adminController.getDocumentCount(req, res, next);

      expect(adminService.getDocumentCount).toHaveBeenCalledWith('today');
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it('should return 400 for an invalid period', async () => {
      req.params.period = 'invalid_period';

      await adminController.getDocumentCount(req, res, next);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.send).toHaveBeenCalledWith({ message: 'Invalid period parameter' });
    });
  });

  describe('getUserCount', () => {
    it('should return user count for a valid period', async () => {
      req.params.period = 'today';
      const result = { count: 5 };
      adminService.getUserCount.mockResolvedValue(result);

      await adminController.getUserCount(req, res, next);

      expect(adminService.getUserCount).toHaveBeenCalledWith('today');
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it('should return 400 for an invalid period', async () => {
      req.params.period = 'invalid_period';

      await adminController.getUserCount(req, res, next);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.send).toHaveBeenCalledWith({ message: 'Invalid period parameter' });
    });
  });

  describe('getUserMonthly', () => {
    it('should return monthly user data', async () => {
      const result = [{ month: 'January', count: 10 }];
      adminService.getUserMonthly = jest.fn().mockResolvedValue(result);

      await adminController.getUserMonthly(req, res, next);

      expect(adminService.getUserMonthly).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(result);
    });
  });

  describe('getDocumentsByNotaryField', () => {
    it('should return documents by notary field for a valid period', async () => {
      req.params.period = 'today';
      const result = [{ field: 'Notary Field', count: 3 }];
      adminService.getDocumentsByNotaryField.mockResolvedValue(result);

      await adminController.getDocumentsByNotaryField(req, res, next);

      expect(adminService.getDocumentsByNotaryField).toHaveBeenCalledWith('today');
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it('should return 400 for an invalid period', async () => {
      req.params.period = 'invalid_period';

      await adminController.getDocumentsByNotaryField(req, res, next);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.send).toHaveBeenCalledWith({ message: 'Invalid period parameter' });
    });
  });

  describe('getEmployeeCount', () => {
    it('should return employee count', async () => {
      const result = { count: 20 };
      adminService.getEmployeeCount.mockResolvedValue(result);

      await adminController.getEmployeeCount(req, res, next);

      expect(adminService.getEmployeeCount).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(result);
    });
  });

  describe('getEmployeeList', () => {
    it('should return employee list', async () => {
      const result = [{ name: 'John Doe', position: 'Notary' }];
      const options = { sortBy: 'name', limit: 10, page: 1 };
      pick.mockReturnValue(options);
      adminService.getEmployeeList.mockResolvedValue(result);

      await adminController.getEmployeeList(req, res, next);

      expect(pick).toHaveBeenCalledWith(req.query, ['sortBy', 'limit', 'page']);
      expect(adminService.getEmployeeList).toHaveBeenCalledWith({}, options);
      expect(res.send).toHaveBeenCalledWith(result);
    });
  });

  describe('getSessionCount', () => {
    it('should return session count for a valid period', async () => {
      req.params.period = 'today';
      const result = { count: 15 };
      adminService.getSessionCount.mockResolvedValue(result);

      await adminController.getSessionCount(req, res, next);

      expect(adminService.getSessionCount).toHaveBeenCalledWith('today');
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it('should return 400 for an invalid period', async () => {
      req.params.period = 'invalid_period';

      await adminController.getSessionCount(req, res, next);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.send).toHaveBeenCalledWith({ message: 'Invalid period parameter' });
    });
  });

  describe('getPaymentTotalByService', () => {
    it('should return payment total by service', async () => {
      req.params.period = 'today';
      const result = { total: 1000 };
      adminService.getPaymentTotalByService.mockResolvedValue(result);

      await adminController.getPaymentTotalByService(req, res, next);

      expect(adminService.getPaymentTotalByService).toHaveBeenCalledWith('today');
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(result);
    });
  });

  describe('getPaymentTotalByNotarizationField', () => {
    it('should return payment total by notarization field', async () => {
      req.params.period = 'today';
      const result = { total: 500 };
      adminService.getPaymentTotalByNotarizationField.mockResolvedValue(result);

      await adminController.getPaymentTotalByNotarizationField(req, res, next);

      expect(adminService.getPaymentTotalByNotarizationField).toHaveBeenCalledWith('today');
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(result);
    });
  });

  describe('getPaymentTotal', () => {
    it('should return payment total for a valid period', async () => {
      req.params.period = 'today';
      const result = { total: 1500 };
      adminService.getPaymentTotal.mockResolvedValue(result);

      await adminController.getPaymentTotal(req, res, next);

      expect(adminService.getPaymentTotal).toHaveBeenCalledWith('today');
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it('should return 400 for an invalid period', async () => {
      req.params.period = 'invalid_period';

      await adminController.getPaymentTotal(req, res, next);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.send).toHaveBeenCalledWith({ message: 'Invalid period parameter' });
    });
  });
});
