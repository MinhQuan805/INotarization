const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../../../src/config/config');
const userService = require('../../../src/services/user.service');
const { Token } = require('../../../src/models');
const ApiError = require('../../../src/utils/ApiError');
const { tokenTypes } = require('../../../src/config/tokens');
const tokenService = require('../../../src/services/token.service');

jest.mock('jsonwebtoken');
jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  return jest.fn(() => {
    const instance = actualMoment();
    instance.add = jest.fn((amount, unit) => {
      const newInstance = actualMoment(instance);
      newInstance.add(amount, unit);
      return newInstance;
    });
    instance.toDate = jest.fn(() => new Date());
    instance.unix = jest.fn(() => Math.floor(new Date().getTime() / 1000));
    return instance;
  });
});
jest.mock('../../../src/config/config', () => ({
  jwt: {
    secret: 'test-secret',
    accessExpirationMinutes: 30,
    refreshExpirationDays: 30,
    resetPasswordExpirationMinutes: 10,
    verifyEmailExpirationMinutes: 10,
  },
}));
jest.mock('../../../src/services/user.service');
jest.mock('../../../src/models', () => ({
  Token: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));
jest.mock('../../../src/utils/ApiError');

describe('Token Service', () => {
  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const userId = 'userId';
      const expires = moment();
      const type = tokenTypes.ACCESS;
      const secret = 'test-secret';

      jwt.sign.mockReturnValue('test-token');
      const token = tokenService.generateToken(userId, expires, type, secret);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          sub: userId,
          iat: expect.any(Number),
          exp: expect.any(Number),
          type,
        },
        secret
      );
      expect(token).toBe('test-token');
    });
  });

  describe('saveToken', () => {
    it('should save a token', async () => {
      const token = 'test-token';
      const userId = 'userId';
      const expires = moment();
      const type = tokenTypes.ACCESS;
      const blacklisted = false;

      const tokenDoc = { token, user: userId, expires: expires.toDate(), type, blacklisted };
      Token.create.mockResolvedValue(tokenDoc);

      const result = await tokenService.saveToken(token, userId, expires, type, blacklisted);

      expect(Token.create).toHaveBeenCalledWith({
        token,
        user: userId,
        expires: expect.any(Date),
        type,
        blacklisted,
      });
      expect(result).toBe(tokenDoc);
    });
  });

  describe('verifyToken', () => {
    it('should verify a token and return token doc', async () => {
      const token = 'test-token';
      const type = tokenTypes.ACCESS;
      const payload = { sub: 'userId' };

      jwt.verify.mockReturnValue(payload);
      const tokenDoc = { token, user: payload.sub, type, blacklisted: false };
      Token.findOne.mockResolvedValue(tokenDoc);

      const result = await tokenService.verifyToken(token, type);

      expect(jwt.verify).toHaveBeenCalledWith(token, config.jwt.secret);
      expect(Token.findOne).toHaveBeenCalledWith({ token, type, user: payload.sub, blacklisted: false });
      expect(result).toBe(tokenDoc);
    });

    it('should throw an error if token is not found', async () => {
      const token = 'test-token';
      const type = tokenTypes.ACCESS;
      const payload = { sub: 'userId' };

      jwt.verify.mockReturnValue(payload);
      Token.findOne.mockResolvedValue(null);

      await expect(tokenService.verifyToken(token, type)).rejects.toThrow('Token not found');
    });
  });

  describe('generateAuthTokens', () => {
    it('should generate auth tokens', async () => {
      const user = { id: 'userId' };

      const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
      const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');

      jwt.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      Token.create.mockResolvedValueOnce({
        token: 'refresh-token',
        user: user.id,
        expires: refreshTokenExpires.toDate(),
        type: tokenTypes.REFRESH,
        blacklisted: false,
      });

      const result = await tokenService.generateAuthTokens(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          sub: user.id,
          iat: expect.any(Number),
          exp: expect.any(Number),
          type: tokenTypes.ACCESS,
        },
        config.jwt.secret
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          sub: user.id,
          iat: expect.any(Number),
          exp: expect.any(Number),
          type: tokenTypes.REFRESH,
        },
        config.jwt.secret
      );
      expect(Token.create).toHaveBeenCalledWith({
        token: 'refresh-token',
        user: user.id,
        expires: expect.any(Date),
        type: tokenTypes.REFRESH,
        blacklisted: false,
      });
      expect(result).toEqual({
        access: {
          token: 'access-token',
          expires: expect.any(Date),
        },
        refresh: {
          token: 'refresh-token',
          expires: expect.any(Date),
        },
      });
    });
  });

  describe('generateResetPasswordToken', () => {
    it('should generate reset password token', async () => {
      const email = 'test@example.com';
      const user = { id: 'userId', email };

      userService.getUserByEmail.mockResolvedValue(user);

      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      jwt.sign.mockReturnValue('reset-password-token');
      Token.create.mockResolvedValue({
        token: 'reset-password-token',
        user: user.id,
        expires: expires.toDate(),
        type: tokenTypes.RESET_PASSWORD,
        blacklisted: false,
      });

      const result = await tokenService.generateResetPasswordToken(email);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          sub: user.id,
          iat: expect.any(Number),
          exp: expect.any(Number),
          type: tokenTypes.RESET_PASSWORD,
        },
        config.jwt.secret
      );
      expect(Token.create).toHaveBeenCalledWith({
        token: 'reset-password-token',
        user: user.id,
        expires: expect.any(Date),
        type: tokenTypes.RESET_PASSWORD,
        blacklisted: false,
      });
      expect(result).toBe('reset-password-token');
    });

    test('should throw an error if user is not found', async () => {
      const email = 'test@example.com';
      
      userService.getUserByEmail.mockResolvedValue(null);
  
      await expect(tokenService.generateResetPasswordToken(email)).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe('generateVerifyEmailToken', () => {
    it('should generate verify email token', async () => {
      const user = { id: 'userId' };
      const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');

      jwt.sign.mockReturnValue('verify-email-token');
      Token.create.mockResolvedValue({
        token: 'verify-email-token',
        user: user.id,
        expires: expires.toDate(),
        type: tokenTypes.VERIFY_EMAIL,
        blacklisted: false,
      });

      const result = await tokenService.generateVerifyEmailToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          sub: user.id,
          iat: expect.any(Number),
          exp: expect.any(Number),
          type: tokenTypes.VERIFY_EMAIL,
        },
        config.jwt.secret
      );
      expect(Token.create).toHaveBeenCalledWith({
        token: 'verify-email-token',
        user: user.id,
        expires: expect.any(Date),
        type: tokenTypes.VERIFY_EMAIL,
        blacklisted: false,
      });
      expect(result).toBe('verify-email-token');
    });
  });
});
