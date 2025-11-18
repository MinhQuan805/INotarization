// Mock external dependencies
jest.mock('../../../src/config/blockchain', () => ({
  uploadToIPFS: jest.fn().mockResolvedValue('ipfs://mockHash'),
  mintDocumentNFT: jest.fn().mockResolvedValue({
    transactionHash: 'mockTransactionHash',
  }),
  getTransactionData: jest.fn().mockResolvedValue({
    transactionHash: 'mockTransactionHash',
    tokenId: 'mockTokenId',
    tokenURI: 'mockTokenURI',
    contractAddress: 'mockContractAddress',
  }),
}));

jest.mock('../../../src/config/firebase', () => ({
  bucket: {
    file: jest.fn().mockReturnValue({
      save: jest.fn().mockResolvedValue(true),
    }),
  },
  downloadFile: jest.fn().mockResolvedValue(Buffer.from('mock file content')),
}));

jest.mock('../../../src/models', () => ({
  Session: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
  User: {
    find: jest.fn(),
    findById: jest.fn(),
  },
  SessionStatusTracking: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
  },
  NotarizationField: {
    findById: jest.fn(),
  },
  NotarizationService: {
    findById: jest.fn(),
  },
  Payment: {
    create: jest.fn(),
  },
}));

jest.mock('../../../src/services/email.service');
jest.mock('../../../src/services/userWallet.service');
jest.mock('../../../src/config/payos');

const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Session, User, SessionStatusTracking, NotarizationField, NotarizationService } = require('../../../src/models');
const sessionService = require('../../../src/services/session.service');

describe('Session Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEmails', () => {
    test('should validate correct email array', async () => {
      const emails = ['test@example.com', 'valid@email.com'];
      const result = await sessionService.validateEmails(emails);
      expect(result).toBe(true);
    });

    test('should throw error for invalid email', async () => {
      const emails = ['invalid-email', 'test@example.com'];
      await expect(sessionService.validateEmails(emails)).rejects.toThrow('Invalid email format: invalid-email');
    });
  });

  describe('findBySessionId', () => {
    test('should find session by id', async () => {
      const mockSession = { _id: 'mockId', name: 'Test Session' };
      Session.findById.mockResolvedValue(mockSession);

      const result = await sessionService.findBySessionId('mockId');
      expect(result).toEqual(mockSession);
    });

    test('should throw error if session not found', async () => {
      Session.findById.mockResolvedValue(null);
      await expect(sessionService.findBySessionId('nonexistentId')).rejects.toThrow('Session not found');
    });
  });

  describe('createSession', () => {
    const mockSessionData = {
      sessionName: 'Test Session',
      notaryField: { id: new mongoose.Types.ObjectId() },
      notaryService: { id: new mongoose.Types.ObjectId() },
      startTime: '10:00',
      startDate: '2024-03-20',
      endTime: '11:00',
      endDate: '2024-03-20',
      users: [{ email: 'test@example.com' }],
      createdBy: new mongoose.Types.ObjectId(),
      amount: 1,
    };

    test('should create session successfully', async () => {
      const mockField = {
        _id: mockSessionData.notaryField.id,
        name: 'Test Field',
      };
      const mockService = {
        _id: mockSessionData.notaryService.id,
        fieldId: mockField._id,
      };

      NotarizationField.findById.mockResolvedValue(mockField);
      NotarizationService.findById.mockResolvedValue(mockService);
      User.find.mockResolvedValue([{ _id: 'userId', email: 'test@example.com' }]);
      Session.create.mockResolvedValue({ ...mockSessionData, _id: 'newSessionId' });

      const result = await sessionService.createSession(mockSessionData);
      expect(result).toHaveProperty('_id', 'newSessionId');
    });
  });

  describe('getSessionStatus', () => {
    const mockSessionId = new mongoose.Types.ObjectId();

    test('should return session status', async () => {
      const mockStatus = { sessionId: mockSessionId, status: 'pending' };
      Session.findById.mockResolvedValue({ _id: mockSessionId });
      SessionStatusTracking.findOne.mockResolvedValue(mockStatus);

      const result = await sessionService.getSessionStatus(mockSessionId.toString());
      expect(result).toEqual({ status: mockStatus });
    });

    test('should throw error for invalid session id', async () => {
      await expect(sessionService.getSessionStatus('invalid-id')).rejects.toThrow('Invalid session ID');
    });
  });
});
