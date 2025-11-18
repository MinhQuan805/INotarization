const mongoose = require('mongoose');
const Document = require('../../../src/models/document.model');

describe('Document Model', () => {
  it('should have a schema', () => {
    expect(Document.schema).toBeDefined();
  });

  it('should have a files field', () => {
    const files = Document.schema.obj.files;
    expect(files).toBeDefined();
    expect(files[0].filename.type).toBe(String);
    expect(files[0].filename.required).toBe(true);
    expect(files[0].firebaseUrl.type).toBe(String);
    expect(files[0].firebaseUrl.required).toBe(true);
  });

  it('should have a notarizationService field', () => {
    const notarizationService = Document.schema.obj.notarizationService;
    expect(notarizationService).toBeDefined();
    expect(notarizationService.id.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(notarizationService.id.ref).toBe('NotarizationService');
    expect(notarizationService.id.required).toBe(true);
    expect(notarizationService.name.type).toBe(String);
    expect(notarizationService.name.required).toBe(true);
    expect(notarizationService.fieldId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(notarizationService.fieldId.ref).toBe('NotarizationField');
    expect(notarizationService.fieldId.required).toBe(true);
    expect(notarizationService.description.type).toBe(String);
    expect(notarizationService.description.required).toBe(true);
    expect(notarizationService.price.type).toBe(Number);
    expect(notarizationService.price.required).toBe(true);
    expect(notarizationService.required_documents).toBeDefined();
    expect(notarizationService.required_documents).toBeInstanceOf(Object);
    expect(notarizationService.code.type).toBe(String);
    expect(notarizationService.code.required).toBe(true);
  });

  it('should have a notarizationField field', () => {
    const notarizationField = Document.schema.obj.notarizationField;
    expect(notarizationField).toBeDefined();
    expect(notarizationField.id.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(notarizationField.id.ref).toBe('NotarizationField');
    expect(notarizationField.id.required).toBe(true);
    expect(notarizationField.name.type).toBe(String);
    expect(notarizationField.name.required).toBe(true);
    expect(notarizationField.name.unique).toBe(true);
    expect(notarizationField.description.type).toBe(String);
    expect(notarizationField.description.required).toBe(true);
    expect(notarizationField.name_en.type).toBe(String);
    expect(notarizationField.name_en.required).toBe(true);
    expect(notarizationField.code.type).toBe(String);
    expect(notarizationField.code.required).toBe(true);
  });

  it('should have a requesterInfo field', () => {
    const requesterInfo = Document.schema.obj.requesterInfo;
    expect(requesterInfo).toBeDefined();
    expect(requesterInfo.fullName.type).toBe(String);
    expect(requesterInfo.fullName.required).toBe(true);
    expect(requesterInfo.citizenId.type).toBe(String);
    expect(requesterInfo.citizenId.required).toBe(true);
    expect(requesterInfo.phoneNumber.type).toBe(String);
    expect(requesterInfo.phoneNumber.required).toBe(true);
    expect(requesterInfo.email.type).toBe(String);
    expect(requesterInfo.email.required).toBe(true);
  });

  it('should have a userId field', () => {
    const userId = Document.schema.obj.userId;
    expect(userId).toBeDefined();
    expect(userId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(userId.ref).toBe('User');
    expect(userId.required).toBe(true);
  });

  it('should have an amount field', () => {
    const amount = Document.schema.obj.amount;
    expect(amount).toBeDefined();
    expect(amount.type).toBe(Number);
    expect(amount.required).toBe(true);
  });

  it('should have an output field', () => {
    const output = Document.schema.obj.output;
    expect(output).toBeDefined();
    expect(output[0].filename.type).toBe(String);
    expect(output[0].filename.required).toBe(true);
    expect(output[0].firebaseUrl.type).toBe(String);
    expect(output[0].firebaseUrl.required).toBe(true);
    expect(output[0].transactionHash.type).toBe(String);
    expect(output[0].transactionHash.default).toBe(null);
    expect(output[0].uploadedAt.type).toBe(Date);
    expect(output[0].uploadedAt.default).toBeDefined();
  });

  it('should have timestamps', () => {
    const timestamps = Document.schema.options.timestamps;
    expect(timestamps).toBe(true);
  });

  it('should have toJSON and paginate plugins', () => {
    expect(Document.schema.plugins).toEqual(
      expect.arrayContaining([expect.objectContaining({ fn: expect.any(Function), opts: undefined })])
    );
  });
});
