const mongoose = require('mongoose');
const ApproveSessionHistory = require('../../../src/models/approveSessionHistory.model');

describe('ApproveSessionHistory Model', () => {
  it('should have a schema', () => {
    expect(ApproveSessionHistory.schema).toBeDefined();
  });

  it('should have a userId field', () => {
    const userId = ApproveSessionHistory.schema.obj.userId;
    expect(userId).toBeDefined();
    expect(userId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(userId.ref).toBe('User');
    expect(userId.required).toBe(false);
  });

  it('should have a sessionId field', () => {
    const sessionId = ApproveSessionHistory.schema.obj.sessionId;
    expect(sessionId).toBeDefined();
    expect(sessionId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(sessionId.ref).toBe('Session');
    expect(sessionId.required).toBe(true);
  });

  it('should have a createdDate field', () => {
    const createdDate = ApproveSessionHistory.schema.obj.createdDate;
    expect(createdDate).toBeDefined();
    expect(createdDate.type).toBe(Date);
    expect(createdDate.default).toBeDefined();
  });

  it('should have a beforeStatus field', () => {
    const beforeStatus = ApproveSessionHistory.schema.obj.beforeStatus;
    expect(beforeStatus).toBeDefined();
    expect(beforeStatus.type).toBe(String);
    expect(beforeStatus.required).toBe(true);
  });

  it('should have an afterStatus field', () => {
    const afterStatus = ApproveSessionHistory.schema.obj.afterStatus;
    expect(afterStatus).toBeDefined();
    expect(afterStatus.type).toBe(String);
    expect(afterStatus.required).toBe(true);
  });

  it('should have the correct collection name', () => {
    expect(ApproveSessionHistory.collection.collectionName).toBe('approveSessionHistory');
  });
});
