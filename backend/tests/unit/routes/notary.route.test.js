const mockGet = jest.fn();
const mockRouter = {
  get: mockGet,
};

jest.mock('express', () => ({
  Router: jest.fn(() => mockRouter),
}));

jest.mock('../../../src/middlewares/auth', () => jest.fn((right) => `auth_${right}`));

jest.mock('../../../src/controllers', () => ({
  notaryController: {
    getProcessingSessionsDocuments: jest.fn(),
    getSignatureSessionsDocuments: jest.fn(),
    getNotaryApproved: jest.fn(),
    getAcceptanceRate: jest.fn(),
  },
}));

describe('Notary Route Setup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../../../src/routes/v1/notary.route');
  });

  test('should register routes in correct order with auth middleware', () => {
    const { notaryController } = require('../../../src/controllers');

    expect(mockGet.mock.calls).toEqual([
      ['/metrics/processing', 'auth_notaryDashboard', notaryController.getProcessingSessionsDocuments],
      ['/metrics/digitalSignature', 'auth_notaryDashboard', notaryController.getSignatureSessionsDocuments],
      ['/metrics/notaryApprovals', 'auth_notaryDashboard', notaryController.getNotaryApproved],
      ['/metrics/acceptanceRate', 'auth_notaryDashboard', notaryController.getAcceptanceRate],
    ]);

    expect(mockGet).toHaveBeenCalledTimes(4);
  });
});
