const mongoose = require('mongoose');
const RequestSignature = require('../../../src/models/requestSignature.model');

describe('RequestSignature Model', () => {
  it('should have a schema', () => {
    expect(RequestSignature.schema).toBeDefined();
  });

  it('should have a documentId field', () => {
    const documentId = RequestSignature.schema.obj.documentId;
    expect(documentId).toBeDefined();
    expect(documentId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(documentId.ref).toBe('Document');
    expect(documentId.required).toBe(true);
  });

  it('should have a signatureImage field', () => {
    const signatureImage = RequestSignature.schema.obj.signatureImage;
    expect(signatureImage).toBeDefined();
    expect(signatureImage.type).toBe(String);
  });

  it('should have an approvalStatus field', () => {
    const approvalStatus = RequestSignature.schema.obj.approvalStatus;
    expect(approvalStatus).toBeDefined();
    expect(approvalStatus.notary).toBeDefined();
    expect(approvalStatus.notary.approved.type).toBe(Boolean);
    expect(approvalStatus.notary.approved.default).toBe(false);
    expect(approvalStatus.notary.approvedAt.type).toBe(Date);
    expect(approvalStatus.notary.approvedAt.default).toBe(null);

    expect(approvalStatus.user).toBeDefined();
    expect(approvalStatus.user.approved.type).toBe(Boolean);
    expect(approvalStatus.user.approved.default).toBe(false);
    expect(approvalStatus.user.approvedAt.type).toBe(Date);
    expect(approvalStatus.user.approvedAt.default).toBe(null);
  });

  it('should have timestamps', () => {
    const timestamps = RequestSignature.schema.options.timestamps;
    expect(timestamps).toBe(true);
  });

  it('should have the correct collection name', () => {
    expect(RequestSignature.collection.collectionName).toBe('requestSignature');
  });

  it('should have toJSON and paginate plugins', () => {
    const plugins = RequestSignature.schema.plugins.map((plugin) => plugin.fn.name);
    expect(plugins).toContain('toJSON');
    expect(plugins).toContain('paginate');
  });
});
