const mongoose = require('mongoose');
const Token = require('../../../src/models/token.model');
const { tokenTypes } = require('../../../src/config/tokens');

describe('Token Model', () => {
  it('should have a schema', () => {
    expect(Token.schema).toBeDefined();
  });

  it('should have a token field', () => {
    const token = Token.schema.obj.token;
    expect(token).toBeDefined();
    expect(token.type).toBe(String);
    expect(token.required).toBe(true);
    expect(token.index).toBe(true);
  });

  it('should have a user field', () => {
    const user = Token.schema.obj.user;
    expect(user).toBeDefined();
    expect(user.type).toBe(mongoose.SchemaTypes.ObjectId);
    expect(user.ref).toBe('User');
    expect(user.required).toBe(true);
  });

  it('should have a type field', () => {
    const type = Token.schema.obj.type;
    expect(type).toBeDefined();
    expect(type.type).toBe(String);
    expect(type.enum).toEqual([tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL]);
    expect(type.required).toBe(true);
  });

  it('should have an expires field', () => {
    const expires = Token.schema.obj.expires;
    expect(expires).toBeDefined();
    expect(expires.type).toBe(Date);
    expect(expires.required).toBe(true);
  });

  it('should have a blacklisted field', () => {
    const blacklisted = Token.schema.obj.blacklisted;
    expect(blacklisted).toBeDefined();
    expect(blacklisted.type).toBe(Boolean);
    expect(blacklisted.default).toBe(false);
  });

  it('should have timestamps', () => {
    const timestamps = Token.schema.options.timestamps;
    expect(timestamps).toBe(true);
  });

  it('should have toJSON plugin', () => {
    const plugins = Token.schema.plugins.map((plugin) => plugin.fn.name);
    expect(plugins).toContain('toJSON');
  });
});
