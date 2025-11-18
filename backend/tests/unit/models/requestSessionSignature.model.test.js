const mongoose = require('mongoose');
const RequestSessionSignature = require('../../../src/models/requestSessionSignature.model');

describe('RequestSessionSignature Model', () => {
  it('should have a schema', () => {
    expect(RequestSessionSignature.schema).toBeDefined();
  });

  it('should have a sessionId field', () => {
    const sessionId = RequestSessionSignature.schema.obj.sessionId;
    expect(sessionId).toBeDefined();
    expect(sessionId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(sessionId.ref).toBe('Session');
    expect(sessionId.required).toBe(true);
  });

  it('should have an approvalStatus field', () => {
    const approvalStatus = RequestSessionSignature.schema.obj.approvalStatus;
    expect(approvalStatus).toBeDefined();
    expect(approvalStatus.notary).toBeDefined();
    expect(approvalStatus.notary.approved.type).toBe(Boolean);
    expect(approvalStatus.notary.approved.default).toBe(false);
    expect(approvalStatus.notary.approvedAt.type).toBe(Date);
    expect(approvalStatus.notary.approvedAt.default).toBe(null);

    expect(approvalStatus.users).toBeDefined();
    expect(approvalStatus.users[0].email.type).toBe(String);
    expect(approvalStatus.users[0].approved.type).toBe(Boolean);
    expect(approvalStatus.users[0].approved.default).toBe(false);
    expect(approvalStatus.users[0].approvedAt.type).toBe(Date);
    expect(approvalStatus.users[0].approvedAt.default).toBe(null);
    expect(approvalStatus.users[0].signatureImage.type).toBe(String);
    expect(approvalStatus.users[0].signatureImage.default).toBe(null);

    expect(approvalStatus.creator).toBeDefined();
    expect(approvalStatus.creator.approved.type).toBe(Boolean);
    expect(approvalStatus.creator.approved.default).toBe(false);
    expect(approvalStatus.creator.approvedAt.type).toBe(Date);
    expect(approvalStatus.creator.approvedAt.default).toBe(null);
    expect(approvalStatus.creator.signatureImage.type).toBe(String);
    expect(approvalStatus.creator.signatureImage.default).toBe(null);
  });

  it('should have timestamps', () => {
    const timestamps = RequestSessionSignature.schema.options.timestamps;
    expect(timestamps).toBe(true);
  });

  it('should have the correct collection name', () => {
    expect(RequestSessionSignature.collection.collectionName).toBe('requestSessionSignature');
  });

  it('should have toJSON and paginate plugins', () => {
    const plugins = RequestSessionSignature.schema.plugins.map((plugin) => plugin.fn.name);
    expect(plugins).toContain('toJSON');
    expect(plugins).toContain('paginate');
  });
});
