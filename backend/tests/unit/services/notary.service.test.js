const httpStatus = require('http-status');
const { StatusTracking, SessionStatusTracking, ApproveHistory, ApproveSessionHistory } = require('../../../src/models');
const ApiError = require('../../../src/utils/ApiError');
const notaryService = require('../../../src/services/notary.service');

jest.mock('../../../src/models', () => ({
  StatusTracking: {
    countDocuments: jest.fn(),
  },
  SessionStatusTracking: {
    countDocuments: jest.fn(),
  },
  ApproveHistory: {
    countDocuments: jest.fn(),
  },
  ApproveSessionHistory: {
    countDocuments: jest.fn(),
  },
}));

jest.mock('../../../src/utils/ApiError', () => {
  return jest.fn().mockImplementation((statusCode, message) => {
    const error = new Error(message || 'Error');
    error.statusCode = statusCode || 500;
    return error;
  });
});

describe('Notary Service', () => {
  describe('getSignatureSessionsDocuments', () => {
    it('should return total and change for signature sessions and documents', async () => {
      const mockCount = 5;
      SessionStatusTracking.countDocuments.mockResolvedValue(mockCount);
      StatusTracking.countDocuments.mockResolvedValue(mockCount);

      const result = await notaryService.getSignatureSessionsDocuments();

      expect(result).toEqual({ total: 10, change: 0 });
      expect(SessionStatusTracking.countDocuments).toHaveBeenCalledTimes(3);
      expect(StatusTracking.countDocuments).toHaveBeenCalledTimes(3);
    });

    it('should throw an error if there is an issue fetching the metrics', async () => {
      SessionStatusTracking.countDocuments.mockRejectedValueOnce(new Error('Error fetching metrics'));

      await expect(notaryService.getSignatureSessionsDocuments()).rejects.toThrow(
        'An error occurred while fetching the metrics'
      );
    });
  });

  describe('getProcessingSessionsDocuments', () => {
    it('should return total and growthPercent for processing sessions and documents', async () => {
      const mockCount = 5;
      SessionStatusTracking.countDocuments.mockResolvedValue(mockCount);
      StatusTracking.countDocuments.mockResolvedValue(mockCount);

      const result = await notaryService.getProcessingSessionsDocuments();

      expect(result).toEqual({ total: 10, growthPercent: 0 });
      expect(SessionStatusTracking.countDocuments).toHaveBeenCalledTimes(9);
      expect(StatusTracking.countDocuments).toHaveBeenCalledTimes(9);
    });

    it('should throw an error if there is an issue fetching the processing metrics', async () => {
      SessionStatusTracking.countDocuments.mockRejectedValueOnce(new Error('Error fetching metrics'));

      await expect(notaryService.getProcessingSessionsDocuments()).rejects.toThrow(
        'An error occurred while fetching the processing metrics'
      );
    });
  });

  describe('getNotaryApproved', () => {
    it('should return total and growthPercent for notary approved sessions and documents', async () => {
      const mockCount = 5;
      ApproveSessionHistory.countDocuments.mockResolvedValue(mockCount);
      ApproveHistory.countDocuments.mockResolvedValue(mockCount);

      const result = await notaryService.getNotaryApproved('userId');

      expect(result).toEqual({ total: 10, growthPercent: 0 });
      expect(ApproveSessionHistory.countDocuments).toHaveBeenCalledTimes(3);
      expect(ApproveHistory.countDocuments).toHaveBeenCalledTimes(3);
    });

    it('should throw an error if there is an issue fetching the approval metrics', async () => {
      ApproveSessionHistory.countDocuments.mockRejectedValueOnce(new Error('Error fetching metrics'));

      await expect(notaryService.getNotaryApproved('userId')).rejects.toThrow('Error fetching metrics');
    });
  });

  describe('getAcceptanceRate', () => {
    it('should return acceptanceRate and growthPercent', async () => {
      const mockCount = 5;
      ApproveSessionHistory.countDocuments.mockResolvedValue(mockCount);
      ApproveHistory.countDocuments.mockResolvedValue(mockCount);

      const result = await notaryService.getAcceptanceRate();

      expect(result).toEqual({ acceptanceRate: 0, growthPercent: 0 });
      expect(ApproveSessionHistory.countDocuments).toHaveBeenCalledTimes(12);
      expect(ApproveHistory.countDocuments).toHaveBeenCalledTimes(12);
    });

    it('should throw an error if there is an issue fetching the acceptance rate', async () => {
      ApproveSessionHistory.countDocuments.mockRejectedValueOnce(new Error('Error fetching metrics'));

      await expect(notaryService.getAcceptanceRate()).rejects.toThrow('Error fetching metrics');
    });
  });
});
