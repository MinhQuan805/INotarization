const httpStatus = require('http-status');
const { NotarizationService, NotarizationField } = require('../../../src/models');
const ApiError = require('../../../src/utils/ApiError');
const notarizationService = require('../../../src/services/notarizationService.service');

jest.mock('../../../src/models', () => ({
  NotarizationService: {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  },
  NotarizationField: {
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

describe('NotarizationService Service', () => {
  describe('createNotarizationService', () => {
    it('should create a new notarization service', async () => {
      const notarizationServiceBody = { name: 'Test Service', fieldId: 'fieldId' };
      NotarizationService.findOne.mockResolvedValueOnce(null);
      NotarizationField.findById.mockResolvedValueOnce(true);
      NotarizationService.create.mockResolvedValueOnce(notarizationServiceBody);

      const result = await notarizationService.createNotarizationService(notarizationServiceBody);

      expect(result).toEqual(notarizationServiceBody);
      expect(NotarizationService.findOne).toHaveBeenCalledWith({ name: notarizationServiceBody.name });
      expect(NotarizationField.findById).toHaveBeenCalledWith(notarizationServiceBody.fieldId);
      expect(NotarizationService.create).toHaveBeenCalledWith(notarizationServiceBody);
    });

    it('should throw an error if notarization service name already exists', async () => {
      const notarizationServiceBody = { name: 'Test Service', fieldId: 'fieldId' };
      NotarizationService.findOne.mockResolvedValueOnce(notarizationServiceBody);

      await expect(notarizationService.createNotarizationService(notarizationServiceBody)).rejects.toThrow(
        'Error creating notarization service'
      );
    });

    it('should throw an error if fieldId is invalid', async () => {
      const notarizationServiceBody = { name: 'Test Service', fieldId: 'fieldId' };
      NotarizationService.findOne.mockResolvedValueOnce(null);
      NotarizationField.findById.mockResolvedValueOnce(null);

      await expect(notarizationService.createNotarizationService(notarizationServiceBody)).rejects.toThrow(
        'Error creating notarization service'
      );
    });
  });

  describe('getAllNotarizationServices', () => {
    it('should return all notarization services', async () => {
      const services = [{ name: 'Service 1' }, { name: 'Service 2' }];
      NotarizationService.find.mockResolvedValueOnce(services);

      const result = await notarizationService.getAllNotarizationServices();

      expect(result).toEqual(services);
      expect(NotarizationService.find).toHaveBeenCalled();
    });

    it('should throw an error if no notarization services are found', async () => {
      NotarizationService.find.mockResolvedValueOnce([]);

      await expect(notarizationService.getAllNotarizationServices()).rejects.toThrow('Error fetching notarization services');
    });
  });

  describe('getNotarizationServiceById', () => {
    it('should return notarization service by ID', async () => {
      const service = { name: 'Test Service' };
      NotarizationService.findById.mockResolvedValueOnce(service);

      const result = await notarizationService.getNotarizationServiceById('serviceId');

      expect(result).toEqual(service);
      expect(NotarizationService.findById).toHaveBeenCalledWith('serviceId');
    });

    it('should throw an error if notarization service is not found', async () => {
      NotarizationService.findById.mockResolvedValueOnce(null);

      await expect(notarizationService.getNotarizationServiceById('serviceId')).rejects.toThrow(
        'Error fetching notarization service'
      );
    });
  });

  describe('updateNotarizationServiceById', () => {
    it('should update notarization service by ID', async () => {
      const service = { name: 'Test Service', save: jest.fn().mockResolvedValueOnce() };
      const updateBody = { name: 'Updated Service', fieldId: 'fieldId' };
      NotarizationService.findById.mockResolvedValueOnce(service);
      NotarizationService.findOne.mockResolvedValueOnce(null);
      NotarizationField.findById.mockResolvedValueOnce(true);

      const result = await notarizationService.updateNotarizationServiceById('serviceId', updateBody);

      expect(result).toEqual(service);
      expect(NotarizationService.findById).toHaveBeenCalledWith('serviceId');
      expect(NotarizationService.findOne).toHaveBeenCalledWith({ name: updateBody.name, _id: { $ne: 'serviceId' } });
      expect(NotarizationField.findById).toHaveBeenCalledWith(updateBody.fieldId);
      expect(service.save).toHaveBeenCalled();
    });

    it('should throw an error if service name is already taken', async () => {
      const service = { name: 'Test Service' };
      const updateBody = { name: 'Updated Service' };
      NotarizationService.findById.mockResolvedValueOnce(service);
      NotarizationService.findOne.mockResolvedValueOnce(updateBody);

      await expect(notarizationService.updateNotarizationServiceById('serviceId', updateBody)).rejects.toThrow(
        'Error updating notarization service'
      );
    });

    it('should throw an error if fieldId is invalid', async () => {
      const service = { name: 'Test Service' };
      const updateBody = { name: 'Updated Service', fieldId: 'fieldId' };
      NotarizationService.findById.mockResolvedValueOnce(service);
      NotarizationService.findOne.mockResolvedValueOnce(null);
      NotarizationField.findById.mockResolvedValueOnce(null);

      await expect(notarizationService.updateNotarizationServiceById('serviceId', updateBody)).rejects.toThrow(
        'Error updating notarization service'
      );
    });

    it('should throw an error if notarization service is not found', async () => {
      NotarizationService.findById.mockResolvedValueOnce(null);

      await expect(
        notarizationService.updateNotarizationServiceById('serviceId', { name: 'Updated Service' })
      ).rejects.toThrow('Error updating notarization service');
    });
  });

  describe('deleteNotarizationServiceById', () => {
    it('should delete notarization service by ID', async () => {
      const service = { name: 'Test Service', remove: jest.fn().mockResolvedValueOnce() };
      NotarizationService.findById.mockResolvedValueOnce(service);

      const result = await notarizationService.deleteNotarizationServiceById('serviceId');

      expect(result).toEqual(service);
      expect(NotarizationService.findById).toHaveBeenCalledWith('serviceId');
      expect(service.remove).toHaveBeenCalled();
    });

    it('should throw an error if notarization service is not found', async () => {
      NotarizationService.findById.mockResolvedValueOnce(null);

      await expect(notarizationService.deleteNotarizationServiceById('serviceId')).rejects.toThrow(
        'Error deleting notarization service'
      );
    });
  });

  describe('getNotarizationServicesByFieldId', () => {
    it('should return notarization services by field ID', async () => {
      const services = [{ name: 'Service 1' }, { name: 'Service 2' }];
      NotarizationField.findById.mockResolvedValueOnce(true);
      NotarizationService.find.mockResolvedValueOnce(services);

      const result = await notarizationService.getNotarizationServicesByFieldId('fieldId');

      expect(result).toEqual(services);
      expect(NotarizationField.findById).toHaveBeenCalledWith('fieldId');
      expect(NotarizationService.find).toHaveBeenCalledWith({ fieldId: 'fieldId' });
    });

    it('should throw an error if fieldId is invalid', async () => {
      NotarizationField.findById.mockResolvedValueOnce(null);

      await expect(notarizationService.getNotarizationServicesByFieldId('fieldId')).rejects.toThrow(
        'Error fetching notarization services by field'
      );
    });

    it('should throw an error if no notarization services are found for the given field', async () => {
      NotarizationField.findById.mockResolvedValueOnce(true);
      NotarizationService.find.mockResolvedValueOnce([]);

      await expect(notarizationService.getNotarizationServicesByFieldId('fieldId')).rejects.toThrow(
        'Error fetching notarization services by field'
      );
    });
  });
});
