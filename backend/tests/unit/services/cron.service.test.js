const cron = require('node-cron');
const { autoVerifyDocument } = require('../../../src/services/notarization.service');
const { autoForwardSessionStatus } = require('../../../src/services/session.service');
const cronService = require('../../../src/services/cron.service');

jest.mock('node-cron');
jest.mock('../../../src/services/notarization.service', () => ({
  autoVerifyDocument: jest.fn(),
}));
jest.mock('../../../src/services/session.service', () => ({
  autoForwardSessionStatus: jest.fn(),
}));

describe('Cron Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startCronJob', () => {
    it('should schedule cron jobs', () => {
      cronService.startCronJob();

      expect(cron.schedule).toHaveBeenCalledWith('0 0 * * *', expect.any(Function));
      expect(cron.schedule).toHaveBeenCalledWith('* * * * *', autoVerifyDocument);
      // Uncomment the following line if autoForwardSessionStatus is used
      // expect(cron.schedule).toHaveBeenCalledWith('* * * * *', autoForwardSessionStatus);
    });
  });
});
