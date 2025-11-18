const httpStatus = require('http-status');
const { roleService } = require('../../../src/services');
const roleController = require('../../../src/controllers/role.controller');
const catchAsync = require('../../../src/utils/catchAsync');

jest.mock('../../../src/services/role.service');
jest.mock('../../../src/utils/catchAsync', () => (fn) => (req, res, next) => fn(req, res, next).catch(next));

describe('Role Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
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

  describe('createRole', () => {
    it('should create a new role and return it', async () => {
      const role = { id: 'roleId', name: 'Admin' };
      req.body = { name: 'Admin' };
      roleService.createRole.mockResolvedValue(role);

      await roleController.createRole(req, res, next);

      expect(roleService.createRole).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.send).toHaveBeenCalledWith(role);
    });
  });

  describe('getRoles', () => {
    it('should return all roles', async () => {
      const roles = [{ id: 'roleId1', name: 'Admin' }, { id: 'roleId2', name: 'User' }];
      roleService.getRoles.mockResolvedValue(roles);

      await roleController.getRoles(req, res, next);

      expect(roleService.getRoles).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(roles);
    });
  });

  describe('getRole', () => {
    it('should return a role by ID', async () => {
      const role = { id: 'roleId', name: 'Admin' };
      req.params.roleId = 'roleId';
      roleService.getRole.mockResolvedValue(role);

      await roleController.getRole(req, res, next);

      expect(roleService.getRole).toHaveBeenCalledWith(req.params.roleId);
      expect(res.send).toHaveBeenCalledWith(role);
    });
  });

  describe('updateRole', () => {
    it('should update a role and return it', async () => {
      const role = { id: 'roleId', name: 'Admin' };
      req.params.roleId = 'roleId';
      req.body = { name: 'Admin' };
      roleService.updateRole.mockResolvedValue(role);

      await roleController.updateRole(req, res, next);

      expect(roleService.updateRole).toHaveBeenCalledWith(req.params.roleId, req.body);
      expect(res.send).toHaveBeenCalledWith(role);
    });
  });

  describe('deleteRole', () => {
    it('should delete a role and return no content', async () => {
      req.params.roleId = 'roleId';
      roleService.deleteRole.mockResolvedValue();

      await roleController.deleteRole(req, res, next);

      expect(roleService.deleteRole).toHaveBeenCalledWith(req.params.roleId);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });
});