const mongoose = require('mongoose');
const StatusTracking = require('../../../src/models/statusTracking.model');

describe('StatusTracking Model', () => {
  it('should have a schema', () => {
    expect(StatusTracking.schema).toBeDefined();
  });

  it('should have a documentId field', () => {
    const documentId = StatusTracking.schema.obj.documentId;
    expect(documentId).toBeDefined();
    expect(documentId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(documentId.ref).toBe('Document');
    expect(documentId.required).toBe(true);
  });

  it('should have a status field', () => {
    const status = StatusTracking.schema.obj.status;
    expect(status).toBeDefined();
    expect(status.type).toBe(String);
    expect(status.required).toBe(true);
  });

  it('should have an updatedAt field', () => {
    const updatedAt = StatusTracking.schema.obj.updatedAt;
    expect(updatedAt).toBeDefined();
    expect(updatedAt.type).toBe(Date);
    expect(updatedAt.required).toBe(true);
  });

  it('should have a feedback field', () => {
    const feedback = StatusTracking.schema.obj.feedback;
    expect(feedback).toBeDefined();
    expect(feedback.type).toBe(String);
    expect(feedback.required).toBe(false);
  });

  it('should have the correct collection name', () => {
    expect(StatusTracking.collection.collectionName).toBe('statustrackings');
  });
});
