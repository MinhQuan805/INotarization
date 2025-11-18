const httpStatus = require('http-status');
const pick = require('../../../src/utils/pick');
const ApiError = require('../../../src/utils/ApiError');
const catchAsync = require('../../../src/utils/catchAsync');
const { userService } = require('../../../src/services');
const { auth } = require('../../../src/config/firebase');
const Document = require('../../../src/models/document.model');
const userController = require('../../../src/controllers/user.controller');

jest.mock('../../../src/utils/pick');
jest.mock('../../../src/utils/ApiError');
jest.mock('../../../src/utils/catchAsync', () => (fn) => (req, res, next) => fn(req, res, next).catch(next));
jest.mock('../../../src/services/user.service');
jest.mock('../../../src/config/firebase', () => ({
  auth: {
    getUserByEmail: jest.fn(),
    deleteUser: jest.fn(),
  },
}));
jest.mock('../../../src/models/document.model', () => ({
  countDocuments: jest.fn(),
}));

describe('User Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
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

  describe('createUser', () => {
    it('should create a new user and return it', async () => {
      const user = { id: 'userId', email: 'test@example.com' };
      req.body = { email: 'test@example.com', password: 'password123' };
      userService.createUser.mockResolvedValue(user);

      await userController.createUser(req, res, next);

      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.send).toHaveBeenCalledWith(user);
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const users = [
        { id: 'userId1', email: 'test1@example.com' },
        { id: 'userId2', email: 'test2@example.com' },
      ];
      const filter = { name: 'John' };
      const options = { sortBy: 'name', limit: 10, page: 1 };
      pick.mockReturnValueOnce(filter).mockReturnValueOnce(options);
      userService.queryUsers.mockResolvedValue(users);

      await userController.getUsers(req, res, next);

      expect(pick).toHaveBeenCalledWith(req.query, ['name', 'role']);
      expect(pick).toHaveBeenCalledWith(req.query, ['sortBy', 'limit', 'page']);
      expect(userService.queryUsers).toHaveBeenCalledWith(filter, options);
      expect(res.send).toHaveBeenCalledWith(users);
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const user = {
        id: 'userId',
        email: 'test@example.com',
        toJSON: jest.fn().mockReturnValue({ id: 'userId', email: 'test@example.com' }),
      };
      req.params.userId = 'userId';
      userService.getUserById.mockResolvedValue(user);
      Document.countDocuments.mockResolvedValue(5);

      await userController.getUser(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith(req.params.userId);
      expect(Document.countDocuments).toHaveBeenCalledWith({ userId: user.id });
      expect(res.send).toHaveBeenCalledWith({ ...user.toJSON(), documentCount: 5 });
    });

    it('should throw an error if user not found', async () => {
      req.params.userId = 'userId';
      userService.getUserById.mockResolvedValue(null);

      await userController.getUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  describe('updateUser', () => {
    it('should update a user and return it', async () => {
      const user = { id: 'userId', email: 'test@example.com' };
      req.params.userId = 'userId';
      req.body = { email: 'updated@example.com' };
      userService.updateUserById.mockResolvedValue(user);

      await userController.updateUser(req, res, next);

      expect(userService.updateUserById).toHaveBeenCalledWith(req.params.userId, req.body);
      expect(res.send).toHaveBeenCalledWith(user);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return no content', async () => {
      const user = { id: 'userId', email: 'test@example.com' };
      req.params.userId = 'userId';
      userService.getUserById.mockResolvedValue(user);
      auth.getUserByEmail.mockResolvedValue({ uid: 'firebaseUid' });

      await userController.deleteUser(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith(req.params.userId);
      expect(auth.getUserByEmail).toHaveBeenCalledWith(user.email);
      expect(auth.deleteUser).toHaveBeenCalledWith('firebaseUid');
      expect(userService.deleteUserById).toHaveBeenCalledWith(req.params.userId);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it('should skip Firebase deletion if user not found in Firebase', async () => {
      const user = { id: 'userId', email: 'test@example.com' };
      req.params.userId = 'userId';
      userService.getUserById.mockResolvedValue(user);
      auth.getUserByEmail.mockRejectedValue({ code: 'auth/user-not-found' });

      await userController.deleteUser(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith(req.params.userId);
      expect(auth.getUserByEmail).toHaveBeenCalledWith(user.email);
      expect(auth.deleteUser).not.toHaveBeenCalled();
      expect(userService.deleteUserById).toHaveBeenCalledWith(req.params.userId);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it('should log an error if Firebase deletion fails', async () => {
      const user = { id: 'userId', email: 'test@example.com' };
      req.params.userId = 'userId';
      userService.getUserById.mockResolvedValue(user);
      auth.getUserByEmail.mockResolvedValue({ uid: 'firebaseUid' });
      const error = new Error('Firebase deletion failed');
      auth.deleteUser.mockRejectedValue(error);
      console.error = jest.fn();

      await userController.deleteUser(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith(req.params.userId);
      expect(auth.getUserByEmail).toHaveBeenCalledWith(user.email);
      expect(auth.deleteUser).toHaveBeenCalledWith('firebaseUid');
      expect(console.error).toHaveBeenCalledWith('Error deleting user from Firebase:', error);
      expect(userService.deleteUserById).toHaveBeenCalledWith(req.params.userId);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('searchUserByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: 'userId', email: 'test@example.com' };
      req.params.email = 'test@example.com';
      userService.searchUsersByEmail.mockResolvedValue(user);

      await userController.searchUserByEmail(req, res, next);

      expect(userService.searchUsersByEmail).toHaveBeenCalledWith(req.params.email);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(user);
    });
  });
});
