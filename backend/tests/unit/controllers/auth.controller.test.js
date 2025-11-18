const httpStatus = require('http-status');
const {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  loginWithGoogle,
} = require('../../../src/controllers/auth.controller');
const { authService, userService, tokenService, emailService } = require('../../../src/services');
const { auth, db } = require('../../../src/config/firebase');
const catchAsync = require('../../../src/utils/catchAsync');

// Mock ethers and related functionalities
jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  return {
    ...originalModule,
    Wallet: jest.fn().mockImplementation(() => ({
      address: '0xMockAddress',
    })),
    Contract: jest.fn().mockImplementation(() => ({
      mintNFT: jest.fn(),
      interface: {
        parseLog: jest.fn(),
      },
      tokenURI: jest.fn(),
    })),
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getTransaction: jest.fn(),
      getTransactionReceipt: jest.fn(),
      getBlock: jest.fn(),
    })),
  };
});

jest.mock('../../../src/services/auth.service');
jest.mock('../../../src/services/user.service');
jest.mock('../../../src/services/token.service');
jest.mock('../../../src/services/email.service');
jest.mock('../../../src/config/firebase');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('register', () => {
    it('should register a new user and send tokens', async () => {
      const user = { id: 'userId', email: 'test@example.com' };
      const tokens = { access: { token: 'accessToken' }, refresh: { token: 'refreshToken' } };

      userService.createUser.mockResolvedValue(user);
      tokenService.generateAuthTokens.mockResolvedValue(tokens);
      emailService.sendEmail.mockResolvedValue(true);

      req.body = { email: 'test@example.com', password: 'password' };

      await register(req, res, next);

      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(tokenService.generateAuthTokens).toHaveBeenCalledWith(user);
    });
  });

  describe('login', () => {
    it('should login a user and send tokens', async () => {
      const user = { id: 'userId', email: 'test@example.com' };
      const tokens = { access: { token: 'accessToken' }, refresh: { token: 'refreshToken' } };

      authService.loginUserWithEmailAndPassword.mockResolvedValue(user);
      tokenService.generateAuthTokens.mockResolvedValue(tokens);

      req.body = { email: 'test@example.com', password: 'password' };

      await login(req, res, next);

      expect(authService.loginUserWithEmailAndPassword).toHaveBeenCalledWith(req.body.email, req.body.password);
      expect(tokenService.generateAuthTokens).toHaveBeenCalledWith(user);
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      authService.logout.mockResolvedValue(true);

      req.body = { refreshToken: 'refreshToken' };

      await logout(req, res, next);

      expect(authService.logout).toHaveBeenCalledWith(req.body.refreshToken);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens', async () => {
      const tokens = { access: { token: 'accessToken' }, refresh: { token: 'refreshToken' } };

      authService.refreshAuth.mockResolvedValue(tokens);

      req.body = { refreshToken: 'refreshToken' };

      await refreshTokens(req, res, next);

      expect(authService.refreshAuth).toHaveBeenCalledWith(req.body.refreshToken);
      expect(res.send).toHaveBeenCalledWith(tokens);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset password email', async () => {
      const resetPasswordToken = 'resetPasswordToken';

      tokenService.generateResetPasswordToken.mockResolvedValue(resetPasswordToken);
      emailService.sendResetPasswordEmail.mockResolvedValue(true);

      req.body = { email: 'test@example.com' };

      await forgotPassword(req, res, next);

      expect(tokenService.generateResetPasswordToken).toHaveBeenCalledWith(req.body.email);
      expect(emailService.sendResetPasswordEmail).toHaveBeenCalledWith(req.body.email, resetPasswordToken);
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      authService.resetPassword.mockResolvedValue(true);

      req.query = { token: 'resetToken' };
      req.body = { password: 'newPassword' };

      await resetPassword(req, res, next);

      expect(authService.resetPassword).toHaveBeenCalledWith(req.query.token, req.body.password);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email', async () => {
      const verifyEmailToken = 'verifyEmailToken';

      tokenService.generateVerifyEmailToken.mockResolvedValue(verifyEmailToken);
      emailService.sendVerificationEmail.mockResolvedValue(true);

      req.user = { id: 'userId', email: 'test@example.com' };

      await sendVerificationEmail(req, res, next);

      expect(tokenService.generateVerifyEmailToken).toHaveBeenCalledWith(req.user);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(req.user.email, verifyEmailToken);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      authService.verifyEmail.mockResolvedValue(true);

      req.query = { token: 'verifyToken' };

      await verifyEmail(req, res, next);

      expect(authService.verifyEmail).toHaveBeenCalledWith(req.query.token);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('loginWithGoogle', () => {
    it('should login with Google and send tokens', async () => {
      const user = { id: 'userId', email: 'test@example.com', password: 'password', name: 'Test User' };
      const tokens = { access: { token: 'accessToken' }, refresh: { token: 'refreshToken' } };

      tokenService.generateAuthTokens.mockResolvedValue(tokens);
      userService.updateUserById.mockResolvedValue(true);
      auth.getUserByEmail.mockRejectedValue({ code: 'auth/user-not-found' });
      auth.createUser.mockResolvedValue({ uid: 'firebaseUserId' });
      db.ref.mockReturnValue({
        set: jest.fn().mockResolvedValue(true),
      });

      req.user = user;

      await loginWithGoogle(req, res, next);

      expect(tokenService.generateAuthTokens).toHaveBeenCalledWith(user);
      expect(auth.getUserByEmail).toHaveBeenCalledWith(user.email);
    });
  });
});
