const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSession = {
  body: Joi.object().keys({
    sessionName: Joi.string().required(),
    notaryField: Joi.object().required(),
    notaryService: Joi.object().required(),
    startDate: Joi.date().required(),
    startTime: Joi.string()
      .pattern(/^\d{2}:\d{2}$/, { name: 'time' })
      .required(),
    endTime: Joi.string()
      .pattern(/^\d{2}:\d{2}$/, { name: 'time' })
      .required(),
    endDate: Joi.date().required(),
    users: Joi.array()
      .items(
        Joi.object().keys({
          email: Joi.string().email().required(),
        })
      )
      .required(),
    amount: Joi.number().required(),
    createdBy: Joi.string(),
  }),
};

const addUserToSession = {
  params: Joi.object().keys({
    sessionId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    emails: Joi.array().items(Joi.string()).required(),
  }),
};

const deleteUserOutOfSession = {
  params: Joi.object().keys({
    sessionId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    email: Joi.string().email().required(), // Changed to require a single email
  }),
};

const joinSession = {
  params: Joi.object().keys({
    sessionId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    action: Joi.string().valid('accept', 'reject').required(),
  }),
};

const getSessionsByDate = {
  query: Joi.object().keys({
    date: Joi.string().required(),
  }),
};

const getSessionsByMonth = {
  query: Joi.object().keys({
    date: Joi.string().required(),
  }),
};

const getSessionBySessionId = {
  params: Joi.object().keys({
    sessionId: Joi.string().required(),
  }),
};
const uploadSessionDocument = {
  params: Joi.object().keys({
    sessionId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    files: Joi.array().optional(),
    userId: Joi.string().custom(objectId),
    fileIds: Joi.array().items(Joi.string().custom(objectId)).optional(),
    customFileNames: Joi.array().items(Joi.string()).optional(),
  }),
};

const forwardSessionStatus = {
  headers: Joi.object().keys({
    userId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    action: Joi.string().valid('accept', 'reject').required(),
    feedback: Joi.string()
      .allow('')
      .when('action', {
        is: 'reject',
        then: Joi.string().min(1).required(),
        otherwise: Joi.optional(),
      }),
    files: Joi.array().items(Joi.object()).optional(),
  }),
};

const approveSignatureSessionByUser = {
  body: Joi.object().keys({
    sessionId: Joi.string().required(),
    signatureImage: Joi.string().allow('', null).optional(),
  }),
};

const approveSignatureSessionByNotary = {
  body: Joi.object().keys({
    sessionId: Joi.string().required(),
  }),
};

const deleteFile = {
  params: Joi.object().keys({
    sessionId: Joi.string().custom(objectId).required(),
    fileId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createSession,
  addUserToSession,
  deleteUserOutOfSession,
  joinSession,
  getSessionsByDate,
  getSessionsByMonth,
  getSessionBySessionId,
  uploadSessionDocument,
  forwardSessionStatus,
  approveSignatureSessionByUser,
  approveSignatureSessionByNotary,
  deleteFile,
};
