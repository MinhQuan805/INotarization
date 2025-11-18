const moment = require('moment');
const { Document, User, Session, Payment } = require('../../../src/models');
const adminService = require('../../../src/services/admin.service');

jest.mock('../../../src/models', () => ({
  Document: {
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  User: {
    countDocuments: jest.fn(),
    find: jest.fn(),
  },
  Session: {
    countDocuments: jest.fn(),
  },
  Payment: {
    aggregate: jest.fn(),
  },
}));

describe('Admin Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDocumentCount', () => {
    it('should return document count and growth percent for the given period', async () => {
      const period = 'today';
      const start = moment().startOf('day').toDate();
      const end = moment().endOf('day').toDate();
      const previousStart = moment(start).subtract(1, 'day').toDate();
      const previousEnd = moment(end).subtract(1, 'day').toDate();

      Document.count.mockResolvedValueOnce(10).mockResolvedValueOnce(5);

      const result = await adminService.getDocumentCount(period);

      expect(Document.count).toHaveBeenCalledWith({ createdAt: { $gte: start, $lte: end } });
      expect(Document.count).toHaveBeenCalledWith({ createdAt: { $gte: previousStart, $lte: previousEnd } });
      expect(result).toEqual({
        currentPeriod: { period, documentCount: 10 },
        previousPeriod: { period: `previous_${period}`, documentCount: 5 },
        growthPercent: 100,
      });
    });
  });

  describe('getUserCount', () => {
    it('should return user count and growth percent for the given period', async () => {
      const period = 'today';
      const start = moment().startOf('day').toDate();
      const end = moment().endOf('day').toDate();
      const previousStart = moment(start).subtract(1, 'day').toDate();
      const previousEnd = moment(end).subtract(1, 'day').toDate();

      User.countDocuments.mockResolvedValueOnce(20).mockResolvedValueOnce(10);

      const result = await adminService.getUserCount(period);

      expect(User.countDocuments).toHaveBeenCalledWith({ createdAt: { $gte: start, $lte: end } });
      expect(User.countDocuments).toHaveBeenCalledWith({ createdAt: { $gte: previousStart, $lte: previousEnd } });
      expect(result).toEqual({
        currentPeriod: { period, userCount: 20 },
        previousPeriod: { period: `previous_${period}`, userCount: 10 },
        growthPercent: 100,
      });
    });
  });

  describe('getDocumentsByNotaryField', () => {
    it('should return documents by notary field for the given period', async () => {
      const period = 'today';
      const start = moment().startOf('day').toDate();
      const end = moment().endOf('day').toDate();
      const previousStart = moment(start).subtract(1, 'day').toDate();
      const previousEnd = moment(end).subtract(1, 'day').toDate();

      const currentDocuments = [{ notarizationFieldName: 'Field1', amount: 5 }];
      const previousDocuments = [{ notarizationFieldName: 'Field1', amount: 3 }];

      Document.aggregate.mockResolvedValueOnce(currentDocuments).mockResolvedValueOnce(previousDocuments);

      const result = await adminService.getDocumentsByNotaryField(period);

      expect(Document.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        currentPeriod: { period, totals: currentDocuments },
        previousPeriod: { period: `previous_${period}`, totals: previousDocuments },
      });
    });
  });

  describe('getEmployeeCount', () => {
    it('should return notary and secretary count', async () => {
      User.countDocuments.mockResolvedValueOnce(5).mockResolvedValueOnce(3);

      const result = await adminService.getEmployeeCount();

      expect(User.countDocuments).toHaveBeenCalledWith({ role: 'notary' });
      expect(User.countDocuments).toHaveBeenCalledWith({ role: 'secretary' });
      expect(result).toEqual({ notaryCount: 5, secretaryCount: 3 });
    });
  });

  describe('getEmployeeList', () => {
    it('should return paginated employee list', async () => {
      const filter = {};
      const options = { sortBy: 'name', order: 'asc', limit: 10, page: 1 };
      const employees = [{ name: 'John Doe', role: 'notary' }];

      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(employees),
      };

      User.countDocuments.mockResolvedValueOnce(1);
      User.find.mockReturnValue(mockFind);

      const result = await adminService.getEmployeeList(filter, options);

      expect(User.countDocuments).toHaveBeenCalledWith({
        ...filter,
        role: { $in: ['notary', 'secretary'] },
      });
      expect(User.find).toHaveBeenCalledWith({
        ...filter,
        role: { $in: ['notary', 'secretary'] },
      });
      expect(result).toEqual({
        results: mockFind,
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
    });
  });

  describe('getSessionCount', () => {
    it('should return session count and growth percent for the given period', async () => {
      const period = 'today';
      const start = moment().startOf('day').toDate();
      const end = moment().endOf('day').toDate();
      const previousStart = moment(start).subtract(1, 'day').toDate();
      const previousEnd = moment(end).subtract(1, 'day').toDate();

      Session.countDocuments.mockResolvedValueOnce(15).mockResolvedValueOnce(10);

      const result = await adminService.getSessionCount(period);

      expect(Session.countDocuments).toHaveBeenCalledWith({
        $or: [{ startDate: { $gte: start, $lte: end } }, { endDate: { $gte: start, $lte: end } }],
      });
      expect(Session.countDocuments).toHaveBeenCalledWith({
        $or: [
          { startDate: { $gte: previousStart, $lte: previousEnd } },
          { endDate: { $gte: previousStart, $lte: previousEnd } },
        ],
      });
      expect(result).toEqual({
        currentPeriod: { period, sessionCount: 15 },
        previousPeriod: { period: `previous_${period}`, sessionCount: 10 },
        growthPercent: 50,
      });
    });
  });

  describe('getPaymentTotalByService', () => {
    it('should return payment total by service for the given period', async () => {
      const period = 'today';
      const currentPayments = [{ serviceName: 'Service1', totalAmount: 100 }];
      const previousPayments = [{ serviceName: 'Service1', totalAmount: 50 }];

      Payment.aggregate.mockResolvedValueOnce(currentPayments).mockResolvedValueOnce(previousPayments);

      const result = await adminService.getPaymentTotalByService(period);

      expect(Payment.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        currentPeriod: { period, totals: currentPayments },
        previousPeriod: { period: `previous_${period}`, totals: previousPayments },
      });
    });
  });

  describe('getPaymentTotalByNotarizationField', () => {
    it('should return payment total by notarization field for the given period', async () => {
      const period = 'today';
      const currentFields = [{ fieldName: 'Field1', totalAmount: 200 }];
      const previousFields = [{ fieldName: 'Field1', totalAmount: 100 }];

      Payment.aggregate.mockResolvedValueOnce(currentFields).mockResolvedValueOnce(previousFields);

      const result = await adminService.getPaymentTotalByNotarizationField(period);

      expect(Payment.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        currentPeriod: { period, totals: currentFields },
        previousPeriod: { period: `previous_${period}`, totals: previousFields },
      });
    });
  });

  describe('getPaymentTotal', () => {
    it('should return payment total and growth percent for the given period', async () => {
      const period = 'today';
      const currentTotalResult = [{ totalAmount: 300 }];
      const previousTotalResult = [{ totalAmount: 150 }];

      Payment.aggregate.mockResolvedValueOnce(currentTotalResult).mockResolvedValueOnce(previousTotalResult);

      const result = await adminService.getPaymentTotal(period);

      expect(Payment.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        currentPeriod: { period, totalAmount: 300 },
        previousPeriod: { period: `previous_${period}`, totalAmount: 150 },
        growthPercent: 100,
      });
    });
  });
});
