const mongoose = require('mongoose');
const Payment = require('../../../src/models/payment.model');

describe('Payment Model', () => {
  it('should have a schema', () => {
    expect(Payment.schema).toBeDefined();
  });

  it('should have an orderCode field', () => {
    const orderCode = Payment.schema.obj.orderCode;
    expect(orderCode).toBeDefined();
    expect(orderCode.type).toBe(Number);
    expect(orderCode.required).toBe(true);
    expect(orderCode.unique).toBe(true);
  });

  it('should have an amount field', () => {
    const amount = Payment.schema.obj.amount;
    expect(amount).toBeDefined();
    expect(amount.type).toBe(Number);
    expect(amount.required).toBe(true);
  });

  it('should have a description field', () => {
    const description = Payment.schema.obj.description;
    expect(description).toBeDefined();
    expect(description.type).toBe(String);
    expect(description.required).toBe(true);
  });

  it('should have a returnUrl field', () => {
    const returnUrl = Payment.schema.obj.returnUrl;
    expect(returnUrl).toBeDefined();
    expect(returnUrl.type).toBe(String);
    expect(returnUrl.required).toBe(true);
  });

  it('should have a cancelUrl field', () => {
    const cancelUrl = Payment.schema.obj.cancelUrl;
    expect(cancelUrl).toBeDefined();
    expect(cancelUrl.type).toBe(String);
    expect(cancelUrl.required).toBe(true);
  });

  it('should have a checkoutUrl field', () => {
    const checkoutUrl = Payment.schema.obj.checkoutUrl;
    expect(checkoutUrl).toBeDefined();
    expect(checkoutUrl.type).toBe(String);
    expect(checkoutUrl.required).toBe(false);
  });

  it('should have a status field', () => {
    const status = Payment.schema.obj.status;
    expect(status).toBeDefined();
    expect(status.type).toBe(String);
    expect(status.enum).toEqual(['pending', 'success', 'failed', 'cancelled']);
    expect(status.default).toBe('pending');
  });

  it('should have a userId field', () => {
    const userId = Payment.schema.obj.userId;
    expect(userId).toBeDefined();
    expect(userId.type).toBe(String);
  });

  it('should have a createdAt field', () => {
    const createdAt = Payment.schema.obj.createdAt;
    expect(createdAt).toBeDefined();
    expect(createdAt.type).toBe(Date);
    expect(createdAt.default).toBeDefined();
  });

  it('should have an updatedAt field', () => {
    const updatedAt = Payment.schema.obj.updatedAt;
    expect(updatedAt).toBeDefined();
    expect(updatedAt.type).toBe(Date);
    expect(updatedAt.default).toBeDefined();
  });

  it('should have a documentId field', () => {
    const documentId = Payment.schema.obj.documentId;
    expect(documentId).toBeDefined();
    expect(documentId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(documentId.ref).toBe('Document');
  });

  it('should have a serviceId field', () => {
    const serviceId = Payment.schema.obj.serviceId;
    expect(serviceId).toBeDefined();
    expect(serviceId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(serviceId.ref).toBe('NotarizationService');
  });

  it('should have a fieldId field', () => {
    const fieldId = Payment.schema.obj.fieldId;
    expect(fieldId).toBeDefined();
    expect(fieldId.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(fieldId.ref).toBe('NotarizationField');
  });
});
