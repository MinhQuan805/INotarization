const mongoose = require('mongoose');
const NotarizationField = require('../../../src/models/notarizationField.model');

describe('NotarizationField Model', () => {
  it('should have a schema', () => {
    expect(NotarizationField.schema).toBeDefined();
  });

  it('should have a name field', () => {
    const name = NotarizationField.schema.obj.name;
    expect(name).toBeDefined();
    expect(name.type).toBe(String);
    expect(name.required).toBe(true);
    expect(name.unique).toBe(true);
  });

  it('should have a description field', () => {
    const description = NotarizationField.schema.obj.description;
    expect(description).toBeDefined();
    expect(description.type).toBe(String);
    expect(description.required).toBe(true);
  });

  it('should have a name_en field', () => {
    const name_en = NotarizationField.schema.obj.name_en;
    expect(name_en).toBeDefined();
    expect(name_en.type).toBe(String);
    expect(name_en.required).toBe(true);
  });

  it('should have a code field', () => {
    const code = NotarizationField.schema.obj.code;
    expect(code).toBeDefined();
    expect(code.type).toBe(String);
    expect(code.required).toBe(true);
  });

  it('should have the correct collection name', () => {
    expect(NotarizationField.collection.collectionName).toBe('notarizationFields');
  });

  it('should have toJSON and paginate plugins', () => {
    const plugins = NotarizationField.schema.plugins.map((plugin) => plugin.fn.name);
    expect(plugins).toContain('toJSON');
    expect(plugins).toContain('paginate');
  });
});
