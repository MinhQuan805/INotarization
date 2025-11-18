const httpStatus = require('http-status');
const tokenService = require('../../../src/services/token.service');
const userService = require('../../../src/services/user.service');
const Token = require('../../../src/models/token.model');
const { Document } = require('../../../src/models');
const ApiError = require('../../../src/utils/ApiError');
const { tokenTypes } = require('../../../src/config/tokens');
const authService = require('../../../src/services/auth.service');


jest.mock('../../../src/services/token.service');
jest.mock('../../../src/services/user.service');
jest.mock('../../../src/models/token.model');
jest.mock('../../../src/models/document.model');

describe('Auth Service Test Suite', () => {
  describe('loginUserWithEmailAndPassword', () => {
    it('should return user if email and password match', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { id: 'userId', email, isPasswordMatch: jest.fn().mockResolvedValue(true) };

      userService.getUserByEmail.mockResolvedValue(user);

      const result = await authService.loginUserWithEmailAndPassword(email, password);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(user.isPasswordMatch).toHaveBeenCalledWith(password);
      expect(result).toBe(user);
    });

    it('should throw an error if email or password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { id: 'userId', email, isPasswordMatch: jest.fn().mockResolvedValue(false) };

      userService.getUserByEmail.mockResolvedValue(user);

      await expect(authService.loginUserWithEmailAndPassword(email, password)).rejects.toThrow(
        new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password')
      );
    });
  });

  describe('logout', () => {
    it('should remove refresh token if it exists', async () => {
      const refreshToken = 'refreshToken';
      const refreshTokenDoc = { token: refreshToken, remove: jest.fn().mockResolvedValue() };

      Token.findOne.mockResolvedValue(refreshTokenDoc);

      await authService.logout(refreshToken);

      expect(Token.findOne).toHaveBeenCalledWith({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
      expect(refreshTokenDoc.remove).toHaveBeenCalled();
    });

    it('should throw an error if refresh token does not exist', async () => {
      const refreshToken = 'refreshToken';

      Token.findOne.mockResolvedValue(null);

      await expect(authService.logout(refreshToken)).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
    });
  });

  describe('refreshAuth', () => {
    it('should return new auth tokens if refresh token is valid', async () => {
      const refreshToken = 'refreshToken';
      const user = { id: 'userId' };
      const refreshTokenDoc = { user: user.id, remove: jest.fn().mockResolvedValue() };
      const newTokens = { access: 'newAccessToken', refresh: 'newRefreshToken' };

      tokenService.verifyToken.mockResolvedValue(refreshTokenDoc);
      userService.getUserById.mockResolvedValue(user);
      tokenService.generateAuthTokens.mockResolvedValue(newTokens);

      const result = await authService.refreshAuth(refreshToken);

      expect(tokenService.verifyToken).toHaveBeenCalledWith(refreshToken, tokenTypes.REFRESH);
      expect(userService.getUserById).toHaveBeenCalledWith(user.id);
      expect(refreshTokenDoc.remove).toHaveBeenCalled();
      expect(tokenService.generateAuthTokens).toHaveBeenCalledWith(user);
      expect(result).toBe(newTokens);
    });

    it('should throw an error if refresh token is invalid', async () => {
      const refreshToken = 'refreshToken';

      tokenService.verifyToken.mockRejectedValue(new Error());

      await expect(authService.refreshAuth(refreshToken)).rejects.toThrow(
        new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate')
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password if reset password token is valid', async () => {
      const resetPasswordToken = 'resetPasswordToken';
      const newPassword = 'newPassword123';
      const user = { id: 'userId' };
      const resetPasswordTokenDoc = { user: user.id };

      tokenService.verifyToken.mockResolvedValue(resetPasswordTokenDoc);
      userService.getUserById.mockResolvedValue(user);
      userService.updateUserById.mockResolvedValue();
      Token.deleteMany.mockResolvedValue();

      await authService.resetPassword(resetPasswordToken, newPassword);

      expect(tokenService.verifyToken).toHaveBeenCalledWith(resetPasswordToken, tokenTypes.RESET_PASSWORD);
      expect(userService.getUserById).toHaveBeenCalledWith(user.id);
      expect(userService.updateUserById).toHaveBeenCalledWith(user.id, { password: newPassword });
      expect(Token.deleteMany).toHaveBeenCalledWith({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    });

    it('should throw an error if reset password token is invalid', async () => {
      const resetPasswordToken = 'resetPasswordToken';
      const newPassword = 'newPassword123';

      tokenService.verifyToken.mockRejectedValue(new Error());

      await expect(authService.resetPassword(resetPasswordToken, newPassword)).rejects.toThrow(
        new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed')
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email if verify email token is valid', async () => {
      const verifyEmailToken = 'verifyEmailToken';
      const user = { id: 'userId' };
      const verifyEmailTokenDoc = { user: user.id };

      tokenService.verifyToken.mockResolvedValue(verifyEmailTokenDoc);
      userService.getUserById.mockResolvedValue(user);
      Token.deleteMany.mockResolvedValue();
      userService.updateUserById.mockResolvedValue();

      await authService.verifyEmail(verifyEmailToken);

      expect(tokenService.verifyToken).toHaveBeenCalledWith(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
      expect(userService.getUserById).toHaveBeenCalledWith(user.id);
      expect(Token.deleteMany).toHaveBeenCalledWith({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
      expect(userService.updateUserById).toHaveBeenCalledWith(user.id, { isEmailVerified: true });
    });

    it('should throw an error if verify email token is invalid', async () => {
      const verifyEmailToken = 'verifyEmailToken';

      tokenService.verifyToken.mockRejectedValue(new Error());

      await expect(authService.verifyEmail(verifyEmailToken)).rejects.toThrow(
        new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed')
      );
    });
  });

  describe('getHistoryByUuid', () => {
    it('should return history if userId is valid', async () => {
      const userId = 'userId';
      const history = { id: 'historyId', userId };

      Document.findOne.mockResolvedValue(history);

      const result = await authService.getHistoryByUuid(userId);

      expect(Document.findOne).toHaveBeenCalledWith({ userId });
      expect(result).toBe(history);
    });

    it('should throw an error if history is not found', async () => {
      const userId = 'userId';

      Document.findOne.mockResolvedValue(null);

      await expect(authService.getHistoryByUuid(userId)).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, 'History not found')
      );
    });

    it('should throw an error if an unexpected error occurs', async () => {
      const userId = 'userId';

      Document.findOne.mockRejectedValue(new Error());

      await expect(authService.getHistoryByUuid(userId)).rejects.toThrow(
        new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'The error occurred while retrieving the history')
      );
    });
  });
});
