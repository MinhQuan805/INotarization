const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const User = require('../../../src/models/user.model');
const { roles } = require('../../../src/config/roles');

describe('User Model', () => {
  it('should have a schema', () => {
    expect(User.schema).toBeDefined();
  });

  it('should have a name field', () => {
    const name = User.schema.obj.name;
    expect(name).toBeDefined();
    expect(name.type).toBe(String);
    expect(name.required).toBe(true);
    expect(name.trim).toBe(true);
  });

  it('should have an email field', () => {
    const email = User.schema.obj.email;
    expect(email).toBeDefined();
    expect(email.type).toBe(String);
    expect(email.required).toBe(true);
    expect(email.unique).toBe(true);
    expect(email.trim).toBe(true);
    expect(email.lowercase).toBe(true);
    expect(email.validate).toBeDefined();
  });

  it('should validate a valid email', () => {
    const user = new User({ email: 'test@example.com' });
    expect(() => user.validateSync()).not.toThrow();
  });

  it('should throw an error for an invalid email', async () => {
    const user = new User({ email: 'invalid-email' });
    await expect(user.validate()).rejects.toThrow('Invalid email');
  });

  it('should have a password field', () => {
    const password = User.schema.obj.password;
    expect(password).toBeDefined();
    expect(password.type).toBe(String);
    expect(password.required).toBe(true);
    expect(password.trim).toBe(true);
    expect(password.minlength).toBe(8);
    expect(password.validate).toBeDefined();
    expect(password.private).toBe(true);
  });

  it('should validate a valid password', () => {
    const user = new User({ password: 'Password123' });
    expect(() => user.validateSync()).not.toThrow();
  });

  it('should throw an error for a password without a number', async () => {
    const user = new User({ password: 'Password' });
    await expect(user.validate()).rejects.toThrow('Password must contain at least one letter and one number');
  });

  it('should throw an error for a password without a letter', async () => {
    const user = new User({ password: '12345678' });
    await expect(user.validate()).rejects.toThrow('Password must contain at least one letter and one number');
  });

  it('should throw an error for a password shorter than 8 characters', async () => {
    const user = new User({ password: 'Pass1' });
    await expect(user.validate()).rejects.toThrow(
      'password: Path `password` (`Pass1`) is shorter than the minimum allowed length (8).'
    );
  });

  it('should have a role field', () => {
    const role = User.schema.obj.role;
    expect(role).toBeDefined();
    expect(role.type).toBe(String);
    expect(role.enum).toEqual(roles);
    expect(role.default).toBe('user');
  });

  it('should have an isEmailVerified field', () => {
    const isEmailVerified = User.schema.obj.isEmailVerified;
    expect(isEmailVerified).toBeDefined();
    expect(isEmailVerified.type).toBe(Boolean);
    expect(isEmailVerified.default).toBe(false);
  });

  it('should have a citizenId field', () => {
    const citizenId = User.schema.obj.citizenId;
    expect(citizenId).toBeDefined();
    expect(citizenId.type).toBe(String);
    expect(citizenId.trim).toBe(true);
    expect(citizenId.required).toBe(false);
  });

  it('should have a phoneNumber field', () => {
    const phoneNumber = User.schema.obj.phoneNumber;
    expect(phoneNumber).toBeDefined();
    expect(phoneNumber.type).toBe(String);
    expect(phoneNumber.trim).toBe(true);
    expect(phoneNumber.validate).toBeDefined();
    expect(phoneNumber.required).toBe(false);
  });

  it('should validate a valid phone number', () => {
    const user = new User({ phoneNumber: '+84987654321' });
    expect(() => user.validateSync()).not.toThrow();
  });

  it('should throw an error for an invalid phone number', async () => {
    const user = new User({ phoneNumber: 'invalid-phone' });
    await expect(user.validate()).rejects.toThrow('Invalid phone number');
  });

  it('should have an address field', () => {
    const address = User.schema.obj.address;
    expect(address).toBeDefined();
    expect(address.province.type).toBe(String);
    expect(address.province.trim).toBe(true);
    expect(address.province.required).toBe(false);
    expect(address.district.type).toBe(String);
    expect(address.district.trim).toBe(true);
    expect(address.district.required).toBe(false);
    expect(address.town.type).toBe(String);
    expect(address.town.trim).toBe(true);
    expect(address.town.required).toBe(false);
    expect(address.street.type).toBe(String);
    expect(address.street.trim).toBe(true);
    expect(address.street.required).toBe(false);
  });

  it('should have a status field', () => {
    const status = User.schema.obj.status;
    expect(status).toBeDefined();
    expect(status.type).toBe(String);
    expect(status.enum).toEqual(['active', 'inactive', 'suspended', 'deleted']);
    expect(status.default).toBe('active');
  });

  it('should have timestamps', () => {
    const timestamps = User.schema.options.timestamps;
    expect(timestamps).toBe(true);
  });

  it('should have toJSON and paginate plugins', () => {
    const plugins = User.schema.plugins.map((plugin) => plugin.fn.name);
    expect(plugins).toContain('toJSON');
    expect(plugins).toContain('paginate');
  });

  describe('isEmailTaken', () => {
    beforeEach(() => {
      User.findOne = jest.fn();
    });

    it('should return true if email is taken', async () => {
      User.findOne.mockResolvedValue({});
      const isTaken = await User.isEmailTaken('test@example.com');
      expect(isTaken).toBe(true);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com', _id: { $ne: undefined } });
    });

    it('should return false if email is not taken', async () => {
      User.findOne.mockResolvedValue(null);
      const isTaken = await User.isEmailTaken('test@example.com');
      expect(isTaken).toBe(false);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com', _id: { $ne: undefined } });
    });

    it('should exclude a specific user ID', async () => {
      const userId = mongoose.Types.ObjectId();
      User.findOne.mockResolvedValue(null);
      const isTaken = await User.isEmailTaken('test@example.com', userId);
      expect(isTaken).toBe(false);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com', _id: { $ne: userId } });
    });
  });

  // describe('isPasswordMatch', () => {
  //   it('should return true if password matches', async () => {
  //     const password = 'password123';
  //     const hashedPassword = 'hashedPassword'; // Could be any string for this mock

  //     // Mock bcrypt.hash to make user.password have a hashed value
  //     bcrypt.hash.mockResolvedValue(hashedPassword);

  //     // Mock bcrypt.compare to return true
  //     bcrypt.compare.mockResolvedValue(true);

  //     const user = new User({ password }); // Hash will be called because of the pre-save hook
  //     await user.save(); // Ensure pre-save hook is triggered

  //     const isMatch = await user.isPasswordMatch(password);
  //     expect(isMatch).toBe(true);
  //     expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
  //   });

  //   it('should return false if password does not match', async () => {
  //     const password = 'password123';
  //     const hashedPassword = 'hashedPassword'; // Could be any string for this mock

  //     // Mock bcrypt.hash to make user.password have a hashed value
  //     bcrypt.hash.mockResolvedValue(hashedPassword);
  //     // Mock bcrypt.compare to return false
  //     bcrypt.compare.mockResolvedValue(false);

  //     const user = new User({ password });
  //     await user.save();

  //     const isMatch = await user.isPasswordMatch(password);
  //     expect(isMatch).toBe(false);
  //     expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
  //   });
  // });
  //   describe('pre save hook', () => {
  //     it('should hash password before saving', async () => {
  //       const password = 'password123';
  //       const user = new User({ name: 'Test User', email: 'testuser@example.com', password: password });

  //       // Mock bcrypt.hash to return a deterministic value
  //       bcrypt.hash.mockResolvedValue('hashedPassword');

  //       await user.save();

  //       expect(bcrypt.hash).toHaveBeenCalledWith(password, 8);
  //       expect(user.password).toBe('hashedPassword');
  //     });

  //     it('should not re-hash password if not modified', async () => {
  //       const password = 'password123';
  //       const user = new User({ name: 'Test User', email: 'testuser@example.com', password: password });

  //       // Mock bcrypt.hash for the initial save
  //       bcrypt.hash.mockResolvedValue('hashedPassword');
  //       await user.save();

  //       // Reset mock to track subsequent calls
  //       bcrypt.hash.mockReset();
  //       user.name = 'Updated Name';
  //       await user.save();

  //       // Assert that bcrypt.hash was NOT called again
  //       expect(bcrypt.hash).not.toHaveBeenCalled();
  //       expect(user.password).toBe('hashedPassword'); // Password should remain the same
  //     });
  //   });
});
