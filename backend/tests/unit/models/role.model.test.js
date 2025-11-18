const mongoose = require('mongoose');
const Role = require('../../../src/models/role.model');

describe('Role Model', () => {
  it('should have a schema', () => {
    expect(Role.schema).toBeDefined();
  });

  it('should have a name field', () => {
    const name = Role.schema.obj.name;
    expect(name).toBeDefined();
    expect(name.type).toBe(String);
    expect(name.required).toBe(true);
    expect(name.unique).toBe(true);
  });

  it('should have a permissions field', () => {
    const permissions = Role.schema.obj.permissions;
    expect(permissions).toBeDefined();
    expect(permissions.type).toStrictEqual([String]);
    expect(permissions.required).toBe(true);
  });

  it('should have the correct collection name', () => {
    expect(Role.collection.collectionName).toBe('roles');
  });

  it('should have a static method isRoleNameTaken', () => {
    expect(typeof Role.isRoleNameTaken).toBe('function');
  });

  it('isRoleNameTaken should return false if role name is not taken', async () => {
    Role.findOne = jest.fn().mockResolvedValue(null);
    const result = await Role.isRoleNameTaken('admin');
    expect(result).toBe(false);
  });

  it('isRoleNameTaken should return true if role name is taken', async () => {
    Role.findOne = jest.fn().mockResolvedValue({ name: 'admin' });
    const result = await Role.isRoleNameTaken('admin');
    expect(result).toBe(true);
  });
});
