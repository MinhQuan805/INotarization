const express = require('express');
const multer = require('multer');
const httpStatus = require('http-status');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const sessionValidation = require('../../validations/session.validation');
const sessionController = require('../../controllers/session.controller');
const ApiError = require('../../utils/ApiError');
const parseJson = require('../../middlewares/parseJson');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|pdf/;
    const mimeType = allowedFileTypes.test(file.mimetype);
    const extname = allowedFileTypes.test(file.originalname.split('.').pop());

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only images and PDFs are allowed'));
  },
});

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Sessions management API
 */

router
  .route('/createSession')
  .post(auth('createSession'), validate(sessionValidation.createSession), sessionController.createSession);

router
  .route('/addUser/:sessionId')
  .patch(auth('addUserToSession'), validate(sessionValidation.addUserToSession), sessionController.addUserToSession);

router
  .route('/deleteUser/:sessionId')
  .patch(
    auth('deleteUserOutOfSession'),
    validate(sessionValidation.deleteUserOutOfSession),
    sessionController.deleteUserOutOfSession
  );

router
  .route('/joinSession/:sessionId')
  .post(auth('joinSession'), validate(sessionValidation.joinSession), sessionController.joinSession);

router.route('/getAllSessions').get(auth('getSessions'), sessionController.getAllSessions);

router
  .route('/getSessionsByDate')
  .get(auth('getSessions'), validate(sessionValidation.getSessionsByDate), sessionController.getSessionsByDate);

router
  .route('/getSessionsByMonth')
  .get(auth('getSessions'), validate(sessionValidation.getSessionsByMonth), sessionController.getSessionsByMonth);

router.route('/getActiveSessions').get(auth('getSessions'), sessionController.getActiveSessions);

router.route('/getSessionsByUserId').get(auth('getSessionsByUserId'), sessionController.getSessionsByUserId);

router
  .route('/getSessionBySessionId/:sessionId')
  .get(
    auth('getSessionBySessionId'),
    validate(sessionValidation.getSessionBySessionId),
    sessionController.getSessionBySessionId
  );

router.route('/upload-session-document/:sessionId').post(
  auth('uploadSessionDocument'),
  upload.array('files'),
  parseJson,
  (req, res, next) => {
    req.body.files = req.files.map((file) => file.originalname);
    req.body.fileIds = req.body.fileIds ? JSON.parse(req.body.fileIds) : [];
    req.body.customFileNames = req.body.customFileNames ? JSON.parse(req.body.customFileNames) : [];
    next();
  },
  validate(sessionValidation.uploadSessionDocument),
  sessionController.uploadSessionDocument
);

router
  .route('/send-session-for-notarization/:sessionId')
  .post(auth('sendSessionForNotarization'), sessionController.sendSessionForNotarization);

router.route('/get-session-status/:sessionId').get(auth('getSessionStatus'), sessionController.getSessionStatus);

router.route('/get-sessions-by-status').get(auth('getSessionsByStatus'), sessionController.getSessionsByStatus);

router.route('/forward-session-status/:sessionId').patch(
  auth('forwardSessionStatus'),
  upload.array('files'),
  (req, res, next) => {
    const files = req.files || [];
    req.body.files = files;
    next();
  },
  validate(sessionValidation.forwardSessionStatus),
  sessionController.forwardSessionStatus
);

router.post(
  '/approve-signature-session-by-user',
  auth('approveSignatureSessionByUser'),
  upload.single('signatureImage'),
  validate(sessionValidation.approveSignatureSessionByUser),
  sessionController.approveSignatureSessionByUser
);

router.post(
  '/approve-signature-session-by-notary',
  auth('approveSignatureSessionByNotary'),
  validate(sessionValidation.approveSignatureSessionByNotary),
  sessionController.approveSignatureSessionByNotary
);

router
  .route('/:sessionId/files/:fileId')
  .delete(auth(), validate(sessionValidation.deleteFile), sessionController.deleteFile);

/**
 * @swagger
 * /session/createSession:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionName:
 *                 type: string
 *                 description: Name of the session
 *                 example: "Notarization Session"
 *               notaryField:
 *                 $ref: '#/components/schemas/NotarizationField'
 *               notaryService:
 *                 $ref: '#/components/schemas/NotarizationService'
 *               startTime:
 *                 type: string
 *                 format: time
 *                 description: Start time of the session (HH:MM format)
 *                 example: "09:00"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the session
 *                 example: "2024-10-10"
 *               endTime:
 *                 type: string
 *                 format: time
 *                 description: End time of the session (HH:MM format)
 *                 example: "17:00"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the session
 *                 example: "2024-10-10"
 *               amount:
 *                 type: number
 *                 description: Amount of the session
 *                 example: 10
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                 description: List of users related to the session
 *                 example: [{email: "22521137@gm.uit.edu.vn"}, {email: "def@gmail.com"}]
 *             required:
 *               - sessionName
 *               - notaryField
 *               - notaryService
 *               - startTime
 *               - startDate
 *               - endTime
 *               - endDate
 *               - users
 *               - amount
 *     responses:
 *       "201":
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 400
 *               message: "Invalid input data"
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: "Please authenticate"
 *       "500":
 *         description: Internal Server Error - Failed to create session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 500
 *               message: "Internal server error"
 */

/**
 * @swagger
 * /session/addUser/{sessionId}:
 *   patch:
 *     summary: Add user to session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of email addresses to add to the session
 *                 example: ["abc@gmail.com", "def@gmail.com"]
 *             required:
 *               - emails
 *     responses:
 *       "201":
 *         description: User was added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   example: "66fe4c6b76f99374f4c87165"
 *                 emails:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["abc@gmail.com", "def@gmail.com"]
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request parameters"
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       "500":
 *         description: Internal Server Error - Failed to add user to session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to add user to session"
 */

/**
 * @swagger
 * /session/deleteUser/{sessionId}:
 *   patch:
 *     summary: Delete user from session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email address to delete from the session
 *                 example: "abc@gmail.com"
 *             required:
 *               - email
 *     responses:
 *       "200":
 *         description: User was deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   example: "66fe4c6b76f99374f4c87165"
 *                 email:
 *                   type: string
 *                   example: "abc@gmail.com"
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request parameters"
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       "500":
 *         description: Internal Server Error - Failed to delete user from session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to delete user from session"
 */

/**
 * @swagger
 * /session/joinSession/{sessionId}:
 *   post:
 *     summary: Join session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session
 *     requestBody:
 *       action: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 description: The action of the session
 *                 example: "accept"
 *             required:
 *               - action
 *     responses:
 *       "200":
 *         description: Session joined successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   example: "66fe4c6b76f99374f4c87165"
 *                 email:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: "abc@gmail.com"
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request parameters"
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       "500":
 *         description: Internal Server Error - Failed to join session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to join session"
 */

/**
 * @swagger
 * /session/getAllSessions:
 *   get:
 *     summary: Get all sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of sessions
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: All sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 schema:
 *                   $ref: '#/components/schemas/Session'
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "500":
 *         description: Internal Server Error - Failed to retrieve sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /session/getSessionsByDate:
 *   get:
 *     summary: Get sessions by date
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The date of the sessions
 *         example: "2024-10-10"
 *     responses:
 *       "200":
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 schema:
 *                   $ref: '#/components/schemas/Session'
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "500":
 *         description: Internal Server Error - Failed to retrieve sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /session/getSessionsByMonth:
 *   get:
 *     summary: Get sessions by month
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The month of the sessions
 *         example: "2024-10"
 *     responses:
 *       "200":
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 schema:
 *                   $ref: '#/components/schemas/Session'
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "500":
 *         description: Internal Server Error - Failed to retrieve sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /session/getActiveSessions:
 *   get:
 *     summary: Get active sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Active sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sessionName:
 *                     type: string
 *                     example: "Notarization Session"
 *                   notaryField:
 *                     type: string
 *                     example: "Notary Field"
 *                   notaryService:
 *                     type: string
 *                     example: "Notary Service"
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-10-10T20:00:00Z"
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     example: "2024-10-10"
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-10-10T21:00:00Z"
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     example: "2024-10-10"
 *                   email:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: "abc@gmail.com"
 *                   createdBy:
 *                     type: string
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       "500":
 *         description: Internal Server Error - Failed to retrieve sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve sessions"
 */

/**
 * @swagger
 * /session/getSessionsByUserId:
 *   get:
 *     summary: Get sessions by user id
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 schema:
 *                   $ref: '#/components/schemas/Session'
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "500":
 *         description: Internal Server Error - Failed to retrieve sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /session/getSessionBySessionId/{sessionId}:
 *   get:
 *     summary: Get sessions by session id
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session
 *     responses:
 *       "201":
 *         description: Session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               schema:
 *                 $ref: '#/components/schemas/Session'
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "500":
 *         description: Internal Server Error - Failed to retrieve session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /session/upload-session-document/{sessionId}:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Sessions
 *     summary: Upload documents to a session
 *     description: Uploads files to a specific session and returns URLs of the uploaded files.
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the session to upload documents to.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The files to be uploaded. Supports multiple files.
 *               fileIds:
 *                 type: string
 *                 description: JSON stringified array of file IDs corresponding to the uploaded files.
 *                 example: ["124124242", "124124243"]
 *               customFileNames:
 *                 type: string
 *                 description: JSON stringified array of custom filenames for the uploaded files.
 *                 example: ["document1.pdf", "document2.pdf"]
 *     responses:
 *       '200':
 *         description: Successfully uploaded documents to the session.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Files uploaded successfully"
 *                 uploadedFiles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                         example: "1633972176823-document.pdf"
 *                       firebaseUrl:
 *                         type: string
 *                         example: "https://storage.googleapis.com/bucket-name/folder-name/1633972176823-document.pdf"
 *       '400':
 *
 *                 message:
 *                   type: string
 *                   example: "No files provided"
 *       '403':
 *         description: Forbidden. User is not part of this session.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User is not part of this session"
 *       '404':
 *         description: Not found. Session or user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Session not found"
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while uploading files"
 */

/**
 * @swagger
 * /session/send-session-for-notarization/{sessionId}:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Sessions
 *     summary: Send session for notarization
 *     description: Sends a session for notarization if it meets the required criteria, such as having files attached and being requested by the session creator.
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the session to be sent for notarization.
 *     responses:
 *       '200':
 *         description: Successfully sent session for notarization.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Session sent for notarization successfully"
 *                 session:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: "123456789"
 *                     notaryField:
 *                       type: object
 *                       example: {"fieldName": "Sample Field"}
 *                     notaryService:
 *                       type: object
 *                       example: {"serviceName": "Sample Service"}
 *                     sessionName:
 *                       type: string
 *                       example: "Sample Session Name"
 *                     startTime:
 *                       type: string
 *                       example: "10:00 AM"
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-01"
 *                     endTime:
 *                       type: string
 *                       example: "11:00 AM"
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-01"
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                             example: "user@example.com"
 *                           status:
 *                             type: string
 *                             enum: [pending, accepted, rejected]
 *                             example: "pending"
 *                     createdBy:
 *                       type: string
 *                       example: "609dcd123b5f3b001d9e4567"
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           filename:
 *                             type: string
 *                             example: "document.pdf"
 *                           firebaseUrl:
 *                             type: string
 *                             example: "https://example.com/document.pdf"
 *                           createAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-01T10:00:00Z"
 *                 status:
 *                   type: string
 *                   example: "pending"
 *       '400':
 *         description: Bad request. Possible issues include invalid session ID or no documents attached.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid session ID or No documents to send for notarization"
 *       '403':
 *         description: Forbidden. The user is not authorized to send this session for notarization.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Only the session creator can send for notarization"
 *       '404':
 *         description: Not found. The specified session could not be located.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Session not found"
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while sending session for notarization"
 */

/**
 * @swagger
 * /session/get-session-status/{sessionId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Sessions
 *     summary: Retrieve session notarization status
 *     description: Gets the notarization status of a specified session if it has been sent for notarization.
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the session for which to retrieve notarization status.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the session notarization status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123456789"
 *                     sessionId:
 *                       type: string
 *                       example: "123456789"
 *                     status:
 *                       type: string
 *                       example: "notarized"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T11:00:00Z"
 *       '400':
 *         description: Bad request. Invalid session ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid session ID"
 *       '404':
 *         description: Not found. The session is either not found or not yet sent for notarization.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Session not found or not ready for notarization"
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving session status"
 */

/**
 * @swagger
 * /session/get-sessions-by-status:
 *   get:
 *     summary: Get sessions by status
 *     description: Retrieve documents based on status filters
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [processing, readyToSign, pendingSignature]
 *         required: true
 *         description: Filter sessions by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of sessions per page
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 7
 *                     totalSessions:
 *                       type: integer
 *                       example: 66
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: No sessions found for the specified role or status filter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No sessions found for the specified role or status filter"
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /session/forward-session-status/{sessionId}:
 *   patch:
 *     summary: Forward the status of a session by session ID
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session to forward status
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *                 description: The action to perform on the session
 *               feedback:
 *                 type: string
 *                 description: Feedback for rejecting the session (required if action is 'reject')
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Output files to be uploaded
 *     responses:
 *       "200":
 *         description: Successfully updated the session status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sessionId:
 *                   type: string
 *                 outputFiles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                       firebaseUrl:
 *                         type: string
 *                       transactionHash:
 *                         type: string
 *                         nullable: true
 *                       uploadedAt:
 *                         type: string
 *                         format: date-time
 *       "400":
 *         description: Bad request (invalid parameters or missing required fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Feedback is required for rejected status"
 *       "401":
 *         description: Unauthorized
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: "You do not have permission to access this session"
 *       "404":
 *         description: Session not found or invalid status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Session not found or status already updated"
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /session/approve-signature-session-by-user:
 *   post:
 *     summary: Approve signature session by user
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: ID of the session to approve
 *               signatureImage:
 *                 type: string
 *                 format: binary
 *                 description: Signature image of the session to approve
 *     responses:
 *       "200":
 *         description: Signature approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Signature approved successfully"
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /session/approve-signature-session-by-notary:
 *   post:
 *     summary: Approve signature session by notary
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: ID of the session to approve
 *     responses:
 *       "200":
 *         description: Signature approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Signature approved successfully"
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /session/{sessionId}/files/{fileId}:
 *   delete:
 *     summary: Delete file
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the file
 *     responses:
 *       204:
 *         $ref: '#/components/responses/NoContent'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

module.exports = router;
