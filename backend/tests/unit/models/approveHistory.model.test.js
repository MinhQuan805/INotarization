const mongoose = require('mongoose');
const ApproveHistory = require('../../../src/models/approveHistory.model');

describe('ApproveHistory Model', () => {
  it('should have a schema', () => {
    expect(ApproveHistory.schema).toBeDefined();
  });

  it('should have a userId field', () => {
    const userId = ApproveHistory.schema.obj.userId;
    expect(userId).toBeDefined();
    expect(userId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(userId.ref).toBe('User');
  });

  it('should have a documentId field', () => {
    const documentId = ApproveHistory.schema.obj.documentId;
    expect(documentId).toBeDefined();
    expect(documentId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(documentId.ref).toBe('Document');
    expect(documentId.required).toBe(true);
  });

  it('should have a createdDate field', () => {
    const createdDate = ApproveHistory.schema.obj.createdDate;
    expect(createdDate).toBeDefined();
    expect(createdDate.type).toBe(Date);
    expect(createdDate.default).toBeDefined();
  });

  it('should have a beforeStatus field', () => {
    const beforeStatus = ApproveHistory.schema.obj.beforeStatus;
    expect(beforeStatus).toBeDefined();
    expect(beforeStatus.type).toBe(String);
    expect(beforeStatus.required).toBe(true);
  });

  it('should have an afterStatus field', () => {
    const afterStatus = ApproveHistory.schema.obj.afterStatus;
    expect(afterStatus).toBeDefined();
    expect(afterStatus.type).toBe(String);
    expect(afterStatus.required).toBe(true);
  });

  it('should have the correct collection name', () => {
    expect(ApproveHistory.collection.collectionName).toBe('approveHistory');
  });
});
