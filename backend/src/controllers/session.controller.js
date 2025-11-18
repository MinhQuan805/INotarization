const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { sessionService, emailService } = require('../services');
const { addUserToSession: addUserToSessionValidation } = require('../validations/session.validation');

const createSession = catchAsync(async (req, res) => {
  const { sessionName, notaryField, notaryService, startTime, startDate, endTime, endDate, users, amount } = req.body;
  const createdBy = req.user.id;
  await sessionService.validateEmails(users.map((u) => u.email));
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDateTime = new Date(startDate);
  startDateTime.setUTCHours(hours, minutes, 0, 0);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const endDateTime = new Date(endDate);
  endDateTime.setUTCHours(endHours, endMinutes, 0, 0);
  const session = await sessionService.createSession({
    sessionName,
    notaryField,
    notaryService,
    startTime,
    startDate: startDateTime,
    endTime,
    endDate: endDateTime,
    users,
    amount,
    createdBy,
  });
  await Promise.all(session.users.map((userItem) => emailService.sendInvitationEmail(userItem.email, session._id)));
  res.status(httpStatus.CREATED).send(session);
});

const addUserToSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { emails } = req.body;

  await addUserToSessionValidation.body.validateAsync(req.body);

  const updatedSession = await sessionService.addUserToSession(sessionId, emails);
  await Promise.all(emails.map((email) => emailService.sendInvitationEmail(email, sessionId)));
  res.status(httpStatus.OK).send(updatedSession);
});

const deleteUserOutOfSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { email } = req.body;
  const userId = req.user.id;
  const updatedSession = await sessionService.deleteUserOutOfSession(sessionId, email, userId); // Pass single email
  res.status(httpStatus.OK).send(updatedSession);
});

const joinSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { action } = req.body;
  const userId = req.user.id;

  const updatedSession = await sessionService.joinSession(sessionId, action, userId);
  res.status(httpStatus.OK).send(updatedSession);
});

const getAllSessions = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const getSessions = await sessionService.getAllSessions({}, options);
  res.status(httpStatus.OK).send(getSessions);
});

const getSessionsByDate = catchAsync(async (req, res) => {
  const { date } = req.query;
  const sessions = await sessionService.getSessionsByDate(date);
  res.status(httpStatus.OK).send(sessions);
});

const getSessionsByMonth = catchAsync(async (req, res) => {
  const { date } = req.query;
  const sessions = await sessionService.getSessionsByMonth(date);
  res.status(httpStatus.OK).send(sessions);
});

const getActiveSessions = catchAsync(async (req, res) => {
  const sessions = await sessionService.getActiveSessions();
  res.status(httpStatus.OK).send(sessions);
});

const getSessionsByUserId = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const sessions = await sessionService.getSessionsByUserId(userId);
  res.status(httpStatus.OK).send(sessions);
});

const getSessionBySessionId = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const sessions = await sessionService.getSessionBySessionId(sessionId, userId);
  res.status(httpStatus.OK).send(sessions);
});

const uploadSessionDocument = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.params;

  const sessionDocument = await sessionService.uploadSessionDocument(
    sessionId,
    { ...req.body },
    req.files,
    req.body.fileIds,
    req.body.customFileNames,
    userId
  );

  res.status(httpStatus.CREATED).send(sessionDocument);
});

const sendSessionForNotarization = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const session = await sessionService.sendSessionForNotarization(sessionId, userId);
  res.status(httpStatus.OK).send(session);
});

const getSessionStatus = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const sessionStatusTracking = await sessionService.getSessionStatus(sessionId);
  res.status(httpStatus.OK).send(sessionStatusTracking);
});

const getSessionsByStatus = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['limit', 'page']);

  const result = await sessionService.getSessionsByStatus({
    ...filter,
    ...options,
  });

  res.status(httpStatus.OK).send(result);
});

const forwardSessionStatus = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { action, feedback, files } = req.body;
  const { role } = req.user;
  const userId = req.user.id;
  const updatedStatus = await sessionService.forwardSessionStatus(sessionId, action, role, userId, feedback, files);
  res.status(httpStatus.OK).send(updatedStatus);
});

const approveSignatureSessionByUser = catchAsync(async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user.id;
  const requestApproved = await sessionService.approveSignatureSessionByUser(sessionId, userId, req.file);
  res.status(httpStatus.CREATED).send(requestApproved);
});

const approveSignatureSessionByNotary = catchAsync(async (req, res) => {
  const requestApproved = await sessionService.approveSignatureSessionByNotary(req.body.sessionId, req.user.id);
  res.status(httpStatus.OK).send(requestApproved);
});

const deleteFile = catchAsync(async (req, res) => {
  const { sessionId, fileId } = req.params;
  const userId = req.user.id;

  await sessionService.deleteFile(sessionId, fileId, userId);

  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSession,
  addUserToSession,
  deleteUserOutOfSession,
  joinSession,
  getAllSessions,
  getSessionsByDate,
  getSessionsByMonth,
  getActiveSessions,
  getSessionsByUserId,
  getSessionBySessionId,
  uploadSessionDocument,
  sendSessionForNotarization,
  getSessionStatus,
  getSessionsByStatus,
  forwardSessionStatus,
  approveSignatureSessionByUser,
  approveSignatureSessionByNotary,
  deleteFile,
};
