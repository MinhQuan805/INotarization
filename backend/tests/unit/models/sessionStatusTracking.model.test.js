const mongoose = require('mongoose');
const SessionStatusTracking = require('../../../src/models/sessionStatusTracking.model');

describe('SessionStatusTracking Model', () => {
  it('should have a schema', () => {
    expect(SessionStatusTracking.schema).toBeDefined();
  });

  it('should have a sessionId field', () => {
    const sessionId = SessionStatusTracking.schema.obj.sessionId;
    expect(sessionId).toBeDefined();
    expect(sessionId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(sessionId.ref).toBe('Session');
    expect(sessionId.required).toBe(true);
  });

  it('should have a status field', () => {
    const status = SessionStatusTracking.schema.obj.status;
    expect(status).toBeDefined();
    expect(status.type).toBe(String);
    expect(status.required).toBe(true);
  });

  it('should have an updatedAt field', () => {
    const updatedAt = SessionStatusTracking.schema.obj.updatedAt;
    expect(updatedAt).toBeDefined();
    expect(updatedAt.type).toBe(Date);
    expect(updatedAt.required).toBe(true);
  });

  it('should have a feedback field', () => {
    const feedback = SessionStatusTracking.schema.obj.feedback;
    expect(feedback).toBeDefined();
    expect(feedback.type).toBe(String);
    expect(feedback.required).toBe(false);
  });

  it('should have the correct collection name', () => {
    expect(SessionStatusTracking.collection.collectionName).toBe('sessionStatusTrackings');
  });
});
