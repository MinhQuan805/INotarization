const httpStatus = require('http-status');
const { NotarizationField } = require('../../../src/models');
const ApiError = require('../../../src/utils/ApiError');
const notarizationFieldService = require('../../../src/services/notarizationField.service');

jest.mock('../../../src/models', () => ({
  NotarizationField: {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock('../../../src/utils/ApiError', () => {
  return jest.fn().mockImplementation((statusCode, message) => {
    const error = new Error(message || 'Error');
    error.statusCode = statusCode || 500;
    return error;
  });
});

describe('NotarizationField Service', () => {
  describe('createNotarizationField', () => {
    it('should create a new notarization field', async () => {
      const notarizationFieldBody = { name: 'Test Field' };
      NotarizationField.findOne.mockResolvedValueOnce(null);
      NotarizationField.create.mockResolvedValueOnce(notarizationFieldBody);

      const result = await notarizationFieldService.createNotarizationField(notarizationFieldBody);

      expect(result).toEqual(notarizationFieldBody);
      expect(NotarizationField.findOne).toHaveBeenCalledWith({ name: notarizationFieldBody.name });
      expect(NotarizationField.create).toHaveBeenCalledWith(notarizationFieldBody);
    });

    it('should throw an error if notarization field name already exists', async () => {
      const notarizationFieldBody = { name: 'Test Field' };
      NotarizationField.findOne.mockResolvedValueOnce(notarizationFieldBody);

      await expect(notarizationFieldService.createNotarizationField(notarizationFieldBody)).rejects.toThrow(
        'Error creating notarization field'
      );
    });
  });

  describe('getAllNotarizationFields', () => {
    it('should return all notarization fields', async () => {
      const notarizationFields = [{ name: 'Field 1' }, { name: 'Field 2' }];
      NotarizationField.find.mockResolvedValueOnce(notarizationFields);

      const result = await notarizationFieldService.getAllNotarizationFields();

      expect(result).toEqual(notarizationFields);
      expect(NotarizationField.find).toHaveBeenCalled();
    });

    it('should throw an error if no notarization fields are found', async () => {
      NotarizationField.find.mockResolvedValueOnce([]);

      await expect(notarizationFieldService.getAllNotarizationFields()).rejects.toThrow(
        'Error fetching notarization fields'
      );
    });
  });

  describe('getNotarizationFieldById', () => {
    it('should return notarization field by ID', async () => {
      const notarizationField = { name: 'Test Field' };
      NotarizationField.findById.mockResolvedValueOnce(notarizationField);

      const result = await notarizationFieldService.getNotarizationFieldById('fieldId');

      expect(result).toEqual(notarizationField);
      expect(NotarizationField.findById).toHaveBeenCalledWith('fieldId');
    });

    it('should throw an error if notarization field is not found', async () => {
      NotarizationField.findById.mockResolvedValueOnce(null);

      await expect(notarizationFieldService.getNotarizationFieldById('fieldId')).rejects.toThrow(
        'Error fetching notarization field'
      );
    });
  });

  describe('updateNotarizationFieldById', () => {
    it('should update notarization field by ID', async () => {
      const notarizationField = { name: 'Test Field', save: jest.fn().mockResolvedValueOnce() };
      const updateBody = { name: 'Updated Field' };
      NotarizationField.findById.mockResolvedValueOnce(notarizationField);
      NotarizationField.findOne.mockResolvedValueOnce(null);

      const result = await notarizationFieldService.updateNotarizationFieldById('fieldId', updateBody);

      expect(result).toEqual(notarizationField);
      expect(NotarizationField.findById).toHaveBeenCalledWith('fieldId');
      expect(NotarizationField.findOne).toHaveBeenCalledWith({ name: updateBody.name, _id: { $ne: 'fieldId' } });
      expect(notarizationField.save).toHaveBeenCalled();
    });

    it('should throw an error if notarization field name is already taken', async () => {
      const notarizationField = { name: 'Test Field' };
      const updateBody = { name: 'Updated Field' };
      NotarizationField.findById.mockResolvedValueOnce(notarizationField);
      NotarizationField.findOne.mockResolvedValueOnce(updateBody);

      await expect(notarizationFieldService.updateNotarizationFieldById('fieldId', updateBody)).rejects.toThrow(
        'Error updating notarization field'
      );
    });

    it('should throw an error if notarization field is not found', async () => {
      NotarizationField.findById.mockResolvedValueOnce(null);

      await expect(
        notarizationFieldService.updateNotarizationFieldById('fieldId', { name: 'Updated Field' })
      ).rejects.toThrow('Error updating notarization field');
    });
  });

  describe('deleteNotarizationFieldById', () => {
    it('should delete notarization field by ID', async () => {
      const notarizationField = { name: 'Test Field', remove: jest.fn().mockResolvedValueOnce() };
      NotarizationField.findById.mockResolvedValueOnce(notarizationField);

      const result = await notarizationFieldService.deleteNotarizationFieldById('fieldId');

      expect(result).toEqual(notarizationField);
      expect(NotarizationField.findById).toHaveBeenCalledWith('fieldId');
      expect(notarizationField.remove).toHaveBeenCalled();
    });

    it('should throw an error if notarization field is not found', async () => {
      NotarizationField.findById.mockResolvedValueOnce(null);

      await expect(notarizationFieldService.deleteNotarizationFieldById('fieldId')).rejects.toThrow(
        'Error deleting notarization field'
      );
    });
  });
});
