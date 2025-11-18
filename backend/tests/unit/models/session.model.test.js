const mongoose = require('mongoose');
const Session = require('../../../src/models/session.model');

describe('Session Model', () => {
  it('should have a schema', () => {
    expect(Session.schema).toBeDefined();
  });

  it('should have a sessionId field', () => {
    const sessionId = Session.schema.obj.sessionId;
    expect(sessionId).toBeDefined();
    expect(sessionId.type).toBe(String);
  });

  it('should have a notaryField field', () => {
    const notaryField = Session.schema.obj.notaryField;
    expect(notaryField).toBeDefined();
    expect(notaryField.type).toBe(Object);
    expect(notaryField.required).toBe(true);
  });

  it('should have a notaryService field', () => {
    const notaryService = Session.schema.obj.notaryService;
    expect(notaryService).toBeDefined();
    expect(notaryService.type).toBe(Object);
    expect(notaryService.required).toBe(true);
  });

  it('should have a sessionName field', () => {
    const sessionName = Session.schema.obj.sessionName;
    expect(sessionName).toBeDefined();
    expect(sessionName.type).toBe(String);
    expect(sessionName.required).toBe(true);
  });

  it('should have a startTime field', () => {
    const startTime = Session.schema.obj.startTime;
    expect(startTime).toBeDefined();
    expect(startTime.type).toBe(String);
    expect(startTime.required).toBe(true);
  });

  it('should have a startDate field', () => {
    const startDate = Session.schema.obj.startDate;
    expect(startDate).toBeDefined();
    expect(startDate.type).toBe(Date);
    expect(startDate.required).toBe(true);
  });

  it('should have an endTime field', () => {
    const endTime = Session.schema.obj.endTime;
    expect(endTime).toBeDefined();
    expect(endTime.type).toBe(String);
    expect(endTime.required).toBe(true);
  });

  it('should have an endDate field', () => {
    const endDate = Session.schema.obj.endDate;
    expect(endDate).toBeDefined();
    expect(endDate.type).toBe(Date);
    expect(endDate.required).toBe(true);
  });

  it('should have a users field', () => {
    const users = Session.schema.obj.users;
    expect(users).toBeDefined();
    expect(users.type).toBeInstanceOf(Array);
    expect(users.default).toEqual([]);
    expect(users.type[0].email.type).toBe(String);
    expect(users.type[0].email.required).toBe(true);
    expect(users.type[0].status.type).toBe(String);
    expect(users.type[0].status.default).toBe('pending');
  });

  it('should have a createdBy field', () => {
    const createdBy = Session.schema.obj.createdBy;
    expect(createdBy).toBeDefined();
    expect(createdBy.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(createdBy.ref).toBe('User');
  });

  it('should have an amount field', () => {
    const amount = Session.schema.obj.amount;
    expect(amount).toBeDefined();
    expect(amount.type).toBe(Number);
    expect(amount.required).toBe(true);
  });

  it('should have a files field', () => {
    const files = Session.schema.obj.files;
    expect(files).toBeDefined();
    expect(files.type).toBeInstanceOf(Array);
    expect(files.type[0].userId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(files.type[0].userId.ref).toBe('User');
    expect(files.type[0].filename.type).toBe(String);
    expect(files.type[0].filename.trim).toBe(true);
    expect(files.type[0].firebaseUrl.type).toBe(String);
    expect(files.type[0].firebaseUrl.trim).toBe(true);
    // Corrected spelling here
    expect(files.type[0].createdAt.type).toBe(Date);
  });

  it('should have an output field', () => {
    const output = Session.schema.obj.output;
    expect(output).toBeDefined();
    expect(output).toBeInstanceOf(Array);
    expect(output[0].filename.type).toBe(String);
    expect(output[0].filename.required).toBe(true);
    expect(output[0].filename.trim).toBe(true);
    expect(output[0].firebaseUrl.type).toBe(String);
    expect(output[0].firebaseUrl.required).toBe(true);
    expect(output[0].firebaseUrl.trim).toBe(true);
    expect(output[0].transactionHash.type).toBe(String);
    expect(output[0].transactionHash.default).toBe(null);
    expect(output[0].uploadedAt.type).toBe(Date);
    expect(output[0].uploadedAt.default).toBeDefined();
  });

  it('should have toJSON and paginate plugins', () => {
    const plugins = Session.schema.plugins.map((plugin) => plugin.fn.name);
    expect(plugins).toContain('toJSON');
    expect(plugins).toContain('paginate');
  });
});
