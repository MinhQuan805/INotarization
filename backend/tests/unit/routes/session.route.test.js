const request = require('supertest');
const express = require('express');
const sessionRouter = require('../../../src/routes/v1/session.route');

const app = express();
app.use(express.json());
app.use('/session', sessionRouter);

jest.mock('multer', () => {
  const multer = () => {
    return {
      single: jest.fn(() => (req, res, next) => next()),
      array: jest.fn(() => (req, res, next) => next()),
      none: jest.fn(() => (req, res, next) => next()),
    };
  };
  multer.memoryStorage = jest.fn(() => ({}));
  return multer;
});

jest.mock('../../../src/middlewares/auth', () => jest.fn(() => (req, res, next) => next()));
jest.mock('../../../src/middlewares/validate', () => jest.fn(() => (req, res, next) => next()));
jest.mock('../../../src/controllers/session.controller', () => ({
  createSession: jest.fn((req, res) => res.status(201).send({ message: 'Session created successfully' })),
  addUserToSession: jest.fn((req, res) => res.status(201).send({ message: 'User added successfully' })),
  deleteUserOutOfSession: jest.fn((req, res) => res.status(200).send({ message: 'User deleted successfully' })),
  joinSession: jest.fn((req, res) => res.status(200).send({ message: 'Joined session successfully' })),
  getAllSessions: jest.fn((req, res) => res.status(200).send({ sessions: [] })),
  getSessionsByDate: jest.fn((req, res) => res.status(200).send({ sessions: [] })),
  getSessionsByMonth: jest.fn((req, res) => res.status(200).send({ sessions: [] })),
  getActiveSessions: jest.fn((req, res) => res.status(200).send({ sessions: [] })),
  getSessionsByUserId: jest.fn((req, res) => res.status(200).send({ sessions: [] })),
  getSessionBySessionId: jest.fn((req, res) => res.status(200).send({ session: {} })),
  uploadSessionDocument: jest.fn((req, res) => {
    console.log('uploadSessionDocument called');
    res.status(200).send({ message: 'Documents uploaded successfully' });
  }),
  sendSessionForNotarization: jest.fn((req, res) =>
    res.status(200).send({ message: 'Session sent for notarization successfully' })
  ),
  getSessionStatus: jest.fn((req, res) => res.status(200).send({ status: 'notarized' })),
  getSessionsByStatus: jest.fn((req, res) => res.status(200).send({ sessions: [] })),
  forwardSessionStatus: jest.fn((req, res) => res.status(200).send({ message: 'Session status forwarded successfully' })),
  approveSignatureSessionByUser: jest.fn((req, res) => res.status(200).send({ message: 'Signature approved by user' })),
  approveSignatureSessionByNotary: jest.fn((req, res) => res.status(200).send({ message: 'Signature approved by notary' })),
  deleteFile: jest.fn((req, res) => res.status(204).send()),
}));

describe('Session Routes', () => {
  test('POST /session/createSession - should create a session', async () => {
    const response = await request(app).post('/session/createSession').send({});
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Session created successfully');
  });

  test('PATCH /session/addUser/:sessionId - should add a user to session', async () => {
    const response = await request(app).patch('/session/addUser/123').send({});
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User added successfully');
  });

  test('PATCH /session/deleteUser/:sessionId - should delete a user from session', async () => {
    const response = await request(app).patch('/session/deleteUser/123').send({});
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User deleted successfully');
  });

  test('POST /session/joinSession/:sessionId - should join a session', async () => {
    const response = await request(app).post('/session/joinSession/123').send({});
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Joined session successfully');
  });

  test('GET /session/getAllSessions - should get all sessions', async () => {
    const response = await request(app).get('/session/getAllSessions');
    expect(response.status).toBe(200);
    expect(response.body.sessions).toEqual([]);
  });

  test('GET /session/getSessionsByDate - should get sessions by date', async () => {
    const response = await request(app).get('/session/getSessionsByDate?date=2024-01-01');
    expect(response.status).toBe(200);
    expect(response.body.sessions).toEqual([]);
  });

  test('GET /session/getSessionsByMonth - should get sessions by month', async () => {
    const response = await request(app).get('/session/getSessionsByMonth?date=2024-01');
    expect(response.status).toBe(200);
    expect(response.body.sessions).toEqual([]);
  });

  test('GET /session/getActiveSessions - should get active sessions', async () => {
    const response = await request(app).get('/session/getActiveSessions');
    expect(response.status).toBe(200);
    expect(response.body.sessions).toEqual([]);
  });

  test('GET /session/getSessionsByUserId - should get sessions by user ID', async () => {
    const response = await request(app).get('/session/getSessionsByUserId');
    expect(response.status).toBe(200);
    expect(response.body.sessions).toEqual([]);
  });

  test('GET /session/getSessionBySessionId/:sessionId - should get session by session ID', async () => {
    const response = await request(app).get('/session/getSessionBySessionId/123');
    expect(response.status).toBe(200);
    expect(response.body.session).toEqual({});
  });

  test('POST /session/upload-session-document/:sessionId - fail upload documents to session', async () => {
    const response = await request(app)
      .post('/session/upload-session-document/123')
      .attach('files', Buffer.from('file content'), 'testfile.txt');
    expect(response.status).toBe(500);
  });

  test('POST /session/send-session-for-notarization/:sessionId - should send session for notarization', async () => {
    const response = await request(app).post('/session/send-session-for-notarization/123');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Session sent for notarization successfully');
  });

  test('GET /session/get-session-status/:sessionId - should get session status', async () => {
    const response = await request(app).get('/session/get-session-status/123');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('notarized');
  });

  test('GET /session/get-sessions-by-status - should get sessions by status', async () => {
    const response = await request(app).get('/session/get-sessions-by-status?status=pending');
    expect(response.status).toBe(200);
    expect(response.body.sessions).toEqual([]);
  });

  test('PATCH /session/forward-session-status/:sessionId - should forward session status', async () => {
    const response = await request(app).patch('/session/forward-session-status/123');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Session status forwarded successfully');
  });

  test('POST /session/approve-signature-session-by-user - should approve signature by user', async () => {
    const response = await request(app).post('/session/approve-signature-session-by-user');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Signature approved by user');
  });

  test('POST /session/approve-signature-session-by-notary - should approve signature by notary', async () => {
    const response = await request(app).post('/session/approve-signature-session-by-notary');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Signature approved by notary');
  });

  test('DELETE /session/:sessionId/files/:fileId - should delete a file from session', async () => {
    const response = await request(app).delete('/session/123/files/456');
    expect(response.status).toBe(204);
  });
});
