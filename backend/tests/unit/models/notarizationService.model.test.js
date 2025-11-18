const mongoose = require('mongoose');
const NotarizationService = require('../../../src/models/notarizationService.model');

describe('NotarizationService Model', () => {
  it('should have a schema', () => {
    expect(NotarizationService.schema).toBeDefined();
  });

  it('should have a name field', () => {
    const name = NotarizationService.schema.obj.name;
    expect(name).toBeDefined();
    expect(name.type).toBe(String);
    expect(name.required).toBe(true);
    expect(name.unique).toBe(true);
  });

  it('should have a fieldId field', () => {
    const fieldId = NotarizationService.schema.obj.fieldId;
    expect(fieldId).toBeDefined();
    expect(fieldId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(fieldId.ref).toBe('NotarizationField');
    expect(fieldId.required).toBe(true);
  });

  it('should have a description field', () => {
    const description = NotarizationService.schema.obj.description;
    expect(description).toBeDefined();
    expect(description.type).toBe(String);
    expect(description.required).toBe(true);
  });

  it('should have a price field', () => {
    const price = NotarizationService.schema.obj.price;
    expect(price).toBeDefined();
    expect(price.type).toBe(Number);
    expect(price.required).toBe(true);
  });

  it('should have a code field', () => {
    const code = NotarizationService.schema.obj.code;
    expect(code).toBeDefined();
    expect(code.type).toBe(String);
    expect(code.required).toBe(true);
  });

  it('should have a required_documents field', () => {
    const required_documents = NotarizationService.schema.obj.required_documents;
    expect(required_documents).toBeDefined();
    expect(required_documents.type).toStrictEqual([String]);
    expect(required_documents.required).toBe(true);
    expect(required_documents.default).toEqual([]);
  });

  it('should have the correct collection name', () => {
    expect(NotarizationService.collection.collectionName).toBe('notarizationServices');
  });

  it('should have toJSON and paginate plugins', () => {
    const plugins = NotarizationService.schema.plugins.map((plugin) => plugin.fn.name);
    expect(plugins).toContain('toJSON');
    expect(plugins).toContain('paginate');
  });
});
