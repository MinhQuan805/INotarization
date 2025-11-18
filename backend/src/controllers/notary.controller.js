const httpStatus = require('http-status');
const notaryService = require('../services/notary.service');
const catchAsync = require('../utils/catchAsync');

const getProcessingSessionsDocuments = catchAsync(async (req, res) => {
  const documents = await notaryService.getProcessingSessionsDocuments();
  res.status(httpStatus.OK).send(documents);
});

const getSignatureSessionsDocuments = catchAsync(async (req, res) => {
  const documents = await notaryService.getSignatureSessionsDocuments();
  res.status(httpStatus.OK).send(documents);
});

const getNotaryApproved = catchAsync(async (req, res) => {
  const approvedNotary = await notaryService.getNotaryApproved(req.user.id);
  res.status(httpStatus.OK).send(approvedNotary);
});

const getAcceptanceRate = catchAsync(async (req, res) => {
  const acceptanceRate = await notaryService.getAcceptanceRate();
  res.status(httpStatus.OK).send(acceptanceRate);
});

module.exports = {
  getProcessingSessionsDocuments,
  getSignatureSessionsDocuments,
  getNotaryApproved,
  getAcceptanceRate,
};
