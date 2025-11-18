/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const {
  Session,
  User,
  SessionStatusTracking,
  ApproveSessionHistory,
  RequestSessionSignature,
  NotarizationField,
  NotarizationService,
  Payment,
} = require('../models');
const ApiError = require('../utils/ApiError');
const { userService, notarizationService } = require('.');
const emailService = require('./email.service');
const { payOS } = require('../config/payos');
const { bucket, downloadFile } = require('../config/firebase');
const { uploadToIPFS, mintDocumentNFT, getTransactionData } = require('../config/blockchain');
const userWalletService = require('./userWallet.service');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const uploadFileToFirebase = async (file, rootFolder, folderName) => {
  const fileName = `${file.originalname}`;
  const fileRef = bucket.file(`${rootFolder}/${folderName}/${fileName}`);

  try {
    await fileRef.save(file.buffer, { contentType: file.mimetype });
    return `https://storage.googleapis.com/${bucket.name}/${rootFolder}/${folderName}/${fileName}`;
  } catch (error) {
    console.error('Error uploading file:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload file');
  }
};

const generateOrderCode = () => {
  const MAX_SAFE_INTEGER = 9007199254740991;
  const MAX_ORDER_CODE = Math.floor(MAX_SAFE_INTEGER / 10);

  return Math.floor(Math.random() * MAX_ORDER_CODE) + 1;
};

const validateEmails = async (emails) => {
  if (!Array.isArray(emails)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Emails must be an array');
  }
  emails.forEach((emailItem) => {
    if (!emailRegex.test(emailItem)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid email format: ${emailItem}`);
    }
  });
  return true;
};

const isValidFullDate = async (input) => {
  const fullDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const isValidFormat = fullDateRegex.test(input);
  if (!isValidFormat) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date format');
  }
  const date = new Date(input);
  if (!(date instanceof Date) || Number.isNaN(date)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date');
  }
  return true;
};

const isValidMonth = async (input) => {
  const monthRegex = /^\d{4}-\d{2}$/;
  const isValidFormat = monthRegex.test(input);
  if (!isValidFormat) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date format');
  }
  const date = new Date(input);
  if (!(date instanceof Date) || Number.isNaN(date)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date');
  }
  return true;
};

const findBySessionId = async (sessionId) => {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }
  return session;
};

const createSession = async (sessionBody) => {
  const { sessionName, notaryField, notaryService, startTime, startDate, endTime, endDate, users, createdBy, amount } =
    sessionBody;

  if (
    !sessionName ||
    !notaryField ||
    !notaryService ||
    !startTime ||
    !startDate ||
    !endTime ||
    !endDate ||
    !users ||
    !amount
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required fields');
  }

  const startDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);

  if (endDateTime <= startDateTime) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'End time must be after start time');
  }

  if (!mongoose.Types.ObjectId.isValid(notaryField.id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid notaryField ID');
  }

  const fieldExists = await NotarizationField.findById(notaryField.id);
  if (!fieldExists) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notarization Field not found');
  }

  if (!mongoose.Types.ObjectId.isValid(notaryService.id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid notaryService ID');
  }

  const serviceExists = await NotarizationService.findById(notaryService.id);
  if (!serviceExists) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notarization Service not found');
  }

  if (serviceExists.fieldId.toString() !== fieldExists._id.toString()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Notarization Service does not belong to the specified Field');
  }

  const notaryFieldObj = {
    _id: fieldExists._id,
    name: fieldExists.name,
    description: fieldExists.description,
    name_en: fieldExists.name_en,
    code: fieldExists.code,
  };

  const notaryServiceObj = {
    _id: serviceExists._id,
    name: serviceExists.name,
    fieldId: serviceExists.fieldId,
    description: serviceExists.description,
    price: serviceExists.price,
    required_documents: serviceExists.required_documents,
    code: serviceExists.code,
  };

  if (!Array.isArray(users) || users.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'At least one user is required');
  }

  const userEmails = users.map((u) => u.email);
  const existingUsers = await User.find({ email: { $in: userEmails } });

  if (existingUsers.length !== userEmails.length) {
    const existingEmails = existingUsers.map((u) => u.email);
    const missingEmails = userEmails.filter((email) => !existingEmails.includes(email));
    throw new ApiError(httpStatus.BAD_REQUEST, `Users not found for emails: ${missingEmails.join(', ')}`);
  }

  const usersWithIds = existingUsers.map((user) => ({
    _id: user._id,
    email: user.email,
    status: 'pending',
  }));

  try {
    const sessionData = {
      sessionName,
      notaryField: notaryFieldObj,
      notaryService: notaryServiceObj,
      startTime,
      startDate,
      endTime,
      endDate,
      users: usersWithIds,
      createdBy,
      amount,
      status: 'scheduled',
      createdAt: new Date(),
    };

    const session = await Session.create(sessionData);
    return session;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error creating session', error);
  }
};

const addUserToSession = async (sessionId, emails) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid session ID');
    }

    const session = await findBySessionId(sessionId);

    if (!session) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
    }

    if (!Array.isArray(emails) || emails.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Emails must be a non-empty array');
    }

    const invalidEmails = emails.filter((email) => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid email format for: ${invalidEmails.join(', ')}`);
    }

    const existingUsers = await User.find({ email: { $in: emails } });

    if (existingUsers.length !== emails.length) {
      const existingEmails = existingUsers.map((u) => u.email);
      const missingEmails = emails.filter((email) => !existingEmails.includes(email));
      throw new ApiError(httpStatus.BAD_REQUEST, `Users not found for emails: ${missingEmails.join(', ')}`);
    }

    const alreadyAddedEmails = session.users.filter((user) => emails.includes(user.email)).map((user) => user.email);

    if (alreadyAddedEmails.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Users already added to this session: ${alreadyAddedEmails.join(', ')}`);
    }

    const usersToAdd = existingUsers.map((user) => ({
      _id: user._id,
      email: user.email,
      status: 'pending',
    }));

    session.users.push(...usersToAdd);
    await session.save();

    return session;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error adding users to session:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add users to session');
  }
};

const deleteUserOutOfSession = async (sessionId, email, userId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid session ID');
  }
  const session = await findBySessionId(sessionId);
  if (session.createdBy.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to delete users from this session');
  }

  const userIndex = session.users.findIndex((user) => user.email === email);
  if (userIndex !== -1) {
    session.users.splice(userIndex, 1);
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found in session');
  }

  await session.save();
  return session;
};

const joinSession = async (sessionId, action, userId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid session ID');
  }
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const userIndex = session.users.findIndex((userItem) => userItem.email === user.email);
  if (userIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found in session');
  }
  const userStatus = session.users[userIndex].status;
  if (userStatus === 'accepted' || userStatus === 'rejected') {
    throw new ApiError(httpStatus.BAD_REQUEST, `User already ${userStatus}`);
  }
  if (action === 'accept') {
    session.users[userIndex].status = 'accepted';
  } else if (action === 'reject') {
    session.users[userIndex].status = 'rejected';
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid action');
  }
  await session.save();
  return session;
};

const getAllSessions = async (filter, options) => {
  const { page, limit } = options;

  try {
    const sessions = await Session.find(filter);

    if (!sessions || sessions.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No sessions found');
    }

    const sessionCreators = await Promise.all(
      sessions.map(async (session) => {
        const creator = await userService.getUserById(session.createdBy);
        return {
          _id: session._id,
          sessionName: session.sessionName,
          notaryField: session.notaryField,
          notaryService: session.notaryService,
          startTime: session.startTime,
          startDate: session.startDate,
          endTime: session.endTime,
          endDate: session.endDate,
          users: session.users,
          files: session.files,
          creator: creator ? { _id: creator._id, email: creator.email, name: creator.name } : null,
        };
      })
    );

    const totalResults = sessionCreators.length;
    const totalPages = Math.ceil(totalResults / limit);
    const paginatedResults = sessionCreators.slice((page - 1) * limit, page * limit);

    return {
      results: paginatedResults,
      page,
      limit,
      totalPages,
      totalResults,
    };
  } catch (error) {
    console.error('Error retrieving all sessions:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred while retrieving sessions');
  }
};

const getSessionsByDate = async (date) => {
  try {
    if (!date) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Date is required');
    }
    await isValidFullDate(date);
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const sessions = await Session.find({
      startDate: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    if (!sessions || sessions.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No sessions found for the specified date');
    }

    return sessions;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred while retrieving sessions');
  }
};

const getSessionsByMonth = async (date) => {
  try {
    if (!date) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Date is required');
    }
    await isValidMonth(date);
    const givenDate = new Date(date);
    const startOfMonth = new Date(givenDate.getFullYear(), givenDate.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(givenDate.getFullYear(), givenDate.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    const sessions = await Session.find({
      startDate: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    });

    if (!sessions || sessions.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No sessions found for the specified month');
    }

    return sessions;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred while retrieving sessions');
  }
};

const getActiveSessions = async () => {
  try {
    const sessions = await Session.find({
      endDate: {
        $gte: new Date(),
      },
    });

    if (!sessions || sessions.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No sessions found at present');
    }

    return sessions;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error retrieving active sessions:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred while retrieving sessions');
  }
};

const getSessionsByUserId = async (userId) => {
  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const sessionsCreated = await Session.find({
      createdBy: userId,
    }).lean();

    const joinedSessions = await Session.find({
      'users.email': user.email,
    }).lean();

    const allSessions = [...sessionsCreated, ...joinedSessions];

    const sessionDetails = await Promise.all(
      allSessions.map(async (session) => {
        const creator = await userService.getUserById(session.createdBy);
        const status = await SessionStatusTracking.findOne({ sessionId: session._id });
        const signature = await RequestSessionSignature.findOne({ sessionId: session._id });

        let filteredFiles = session.files;
        if (session.createdBy.toString() !== userId.toString()) {
          filteredFiles = session.files.filter((file) => file.userId && file.userId.toString() === userId.toString());
        }

        return {
          ...session,
          creator: creator ? { _id: creator._id, email: creator.email, name: creator.name } : null,
          status: status
            ? status
            : {
                status: 'unknown',
              },
          signature: signature ? signature.approvalStatus : {},
          files: filteredFiles,
        };
      })
    );

    return { results: sessionDetails };
  } catch (err) {
    console.error('Error retrieving sessions by user ID:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred while retrieving sessions');
  }
};
const getSessionBySessionId = async (sessionId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid session ID');
  }
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const isSessionCreator = session.createdBy && session.createdBy.toString() === userId.toString();
  const isSessionUser = session.users.some((u) => u.email === user.email);
  if (!isSessionCreator && !isSessionUser) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have access to this session');
  }
  const status = await SessionStatusTracking.findOne({ sessionId });
  const signature = await RequestSessionSignature.findOne({ sessionId });

  const files = isSessionCreator
    ? session.files
    : session.files.filter((file) => file.userId && file.userId.toString() === userId.toString());

  return {
    session: {
      ...session.toObject(),
      files,
    },
    status,
    signature,
  };
};

const uploadSessionDocument = async (sessionId, documentBody, files, fileIds, customFileNames, userId) => {
  try {
    if ((!files || files.length === 0) && (!fileIds || fileIds.length === 0)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No files provided');
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
    }

    const newDocument = {
      userId,
      files: [],
      createdAt: Date.now(),
    };

    // Handle files from user wallet
    if (fileIds && fileIds.length > 0) {
      const userWallet = await userWalletService.getWallet(userId);
      const walletItems = userWallet.nftItems.filter((item) => fileIds.includes(item._id.toString()));

      if (walletItems.length !== fileIds.length) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Some files are not found in the user wallet');
      }

      const walletFiles = walletItems.map((item, index) => ({
        _id: item._id,
        userId,
        filename: customFileNames && customFileNames[index] ? customFileNames[index] : item.filename,
        firebaseUrl: item.tokenURI,
        createdAt: Date.now(),
      }));

      newDocument.files.push(...walletFiles);

      // Decrease the amount of NFTs in the user's wallet
      await userWalletService.decreaseNFTAmount(userId, fileIds);
    }

    // Handle file uploads to Firebase
    if (files && files.length > 0) {
      const fileUrls = await Promise.all(files.map((file) => uploadFileToFirebase(file, 'session-documents', sessionId)));
      const uploadedFiles = files.map((file, index) => ({
        userId,
        filename: `${file.originalname}`,
        firebaseUrl: fileUrls[index],
        createdAt: Date.now(),
      }));

      newDocument.files.push(...uploadedFiles);
    }

    session.files.push(...newDocument.files);
    await session.save();

    return newDocument;
  } catch (error) {
    console.error('Error uploading session document:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload session document');
  }
};

const createSessionStatusTracking = async (sessionId, status) => {
  try {
    const statusTracking = new SessionStatusTracking({
      sessionId,
      status,
      updatedAt: new Date(),
    });

    await statusTracking.save();
    return statusTracking;
  } catch (error) {
    console.error('Error creating status tracking:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create status tracking');
  }
};

const sendSessionForNotarization = async (sessionId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid session ID');
    }

    const session = await findBySessionId(sessionId);
    if (!session) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
    }

    if (session.createdBy.toString() !== userId.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Only the session creator can send for notarization');
    }

    if (session.files.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No documents to send for notarization');
    }

    const existingStatus = await SessionStatusTracking.findOne({ sessionId });
    if (existingStatus) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Session already sent for notarization');
    }

    const sessionStatusTracking = await createSessionStatusTracking(sessionId, 'pending');

    return {
      message: 'Session sent for notarization successfully',
      session,
      status: sessionStatusTracking.status,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error sending session for notarization:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred while sending session for notarization');
  }
};

const getSessionStatus = async (sessionId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid session ID');
    }

    const session = await findBySessionId(sessionId);
    if (!session) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
    }

    const status = await SessionStatusTracking.findOne({ sessionId });
    if (!status) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Session not ready for notarization');
    }

    return {
      status,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error retrieving session status:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred while retrieving session status');
  }
};

const getTotalSessions = async (status) => {
  const countQueries = {
    processing: () => SessionStatusTracking.countDocuments({ status: 'processing' }),
    readyToSign: () =>
      RequestSessionSignature.countDocuments({
        'approvalStatus.notary.approved': false,
        'approvalStatus.user.approved': true,
      }),
    pendingSignature: () =>
      RequestSessionSignature.countDocuments({
        $or: [{ 'approvalStatus.notary.approved': false }, { 'approvalStatus.user.approved': false }],
      }),
    default: () => Session.countDocuments(),
  };

  return countQueries[status]();
};

const getSessionsByStatus = async ({ status, limit = 10, page = 1 }) => {
  try {
    const parsedLimit = Number(limit);
    const parsedPage = Number(page);

    // Validate limit and page
    const validatedLimit = Number.isNaN(parsedLimit) || parsedLimit <= 0 ? 10 : parsedLimit;
    const validatedPage = Number.isNaN(parsedPage) || parsedPage <= 0 ? 1 : parsedPage;

    const skipSessions = (validatedPage - 1) * validatedLimit;

    const statusQueries = {
      processing: async () => {
        const sessions = await SessionStatusTracking.find({ status: 'processing' })
          .skip(skipSessions)
          .limit(validatedLimit)
          .populate({
            path: 'sessionId',
            populate: {
              path: 'createdBy',
              model: 'User',
            },
          });

        return sessions.map((doc) => ({
          ...doc.toObject(),
          status: 'processing',
        }));
      },
      readyToSign: async () => {
        const sessions = await RequestSessionSignature.find({
          'approvalStatus.notary.approved': false,
          'approvalStatus.creator.approved': true,
          'approvalStatus.users.approved': { $all: [true] },
        })
          .populate({
            path: 'sessionId',
            populate: {
              path: 'createdBy',
              model: 'User',
            },
          })
          .skip(skipSessions)
          .limit(validatedLimit)
          .sort({ createdAt: -1 });

        return sessions.map((doc) => ({
          ...doc.toObject(),
          status: 'readyToSign',
        }));
      },
      pendingSignature: async () => {
        const sessions = await RequestSessionSignature.find({
          $or: [{ 'approvalStatus.creator.approved': false }, { 'approvalStatus.users.approved': { $all: [false] } }],
        })
          .populate({
            path: 'sessionId',
            populate: {
              path: 'createdBy',
              model: 'User',
            },
          })
          .skip(skipSessions)
          .limit(validatedLimit)
          .sort({ createdAt: -1 });

        return sessions.map((doc) => ({
          ...doc.toObject(),
          status: 'pendingSignature',
        }));
      },
      default: async () => {
        const sessions = await Session.find().skip(skipSessions).limit(validatedLimit).populate('createdBy');

        return sessions.map((doc) => ({
          ...doc.toObject(),
          status: 'default',
        }));
      },
    };
    const sessions = await (status && statusQueries[status] ? statusQueries[status]() : statusQueries.default());

    const totalSessions = await getTotalSessions(status || 'default');

    return {
      sessions,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        totalPages: Math.ceil(totalSessions / validatedLimit),
        totalSessions,
      },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error retrieving sessions by role:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve sessions');
  }
};

const forwardSessionStatus = async (sessionId, action, role, userId, feedback, files) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid session ID');
    }

    const validStatuses = ['pending', 'processing', 'digitalSignature', 'completed'];
    const roleStatusMap = {
      notary: ['pending', 'processing', 'digitalSignature'],
    };

    const currentStatus = await SessionStatusTracking.findOne({ sessionId }, 'status');

    if (!currentStatus) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Session status not found');
    }
    if (currentStatus.status === 'rejected') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Session already been rejected');
    }
    if (!roleStatusMap[role]) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to access these sessions');
    }

    let outputFiles = [];
    if (files && files.length > 0) {
      const fileUrls = await Promise.all(files.map((file) => uploadFileToFirebase(file, 'outputs', sessionId)));

      outputFiles = files.map((file, index) => ({
        filename: `${Date.now()}-${file.originalname}`,
        firebaseUrl: fileUrls[index],
        transactionHash: null,
        uploadedAt: new Date(),
      }));

      await Session.findByIdAndUpdate(
        sessionId,
        {
          $push: {
            output: {
              $each: outputFiles,
            },
          },
        },
        { new: true }
      );
    }

    let newStatus;
    if (action === 'accept') {
      if (currentStatus.status === 'rejected') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Session already been rejected');
      }
      const currentStatusIndex = validStatuses.indexOf(currentStatus.status);

      // Disallow forwarding from 'digitalSignature' to 'completed'
      if (currentStatus.status === 'digitalSignature') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot forward from digitalSignature to completed');
      }

      newStatus = validStatuses[currentStatusIndex + 1];
      console.log(feedback);
      if (!newStatus) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Session has already reached final status');
      }
    } else if (action === 'reject') {
      if (!feedback) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Feedback is required for rejection');
      }
      newStatus = 'rejected';
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid action provided');
    }
    if (newStatus === 'digitalSignature') {
      const newRequestSignature = new RequestSessionSignature({
        sessionId,
        signatureImage: null,
        approvalStatus: {
          notary: {
            approved: false,
            approvedAt: null,
          },
          user: {
            approved: false,
            approvedAt: null,
          },
        },
      });
      await newRequestSignature.save();
    }

    const approveSessionHistory = new ApproveSessionHistory({
      userId,
      sessionId,
      beforeStatus: currentStatus.status,
      afterStatus: newStatus,
    });

    await approveSessionHistory.save();

    const updateData = {
      status: newStatus,
      updatedAt: new Date(),
      ...(feedback && { feedback }),
    };

    const email = await Session.findOne({ _id: sessionId }, 'users email createdBy');
    if (!email) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Email not found');
    }

    const userEmails = email.users.map((user) => user.email);

    const creator = await User.findById(email.createdBy);
    if (creator && creator.email) {
      userEmails.push(creator.email);
    }

    await emailService.sendDocumentStatusUpdateEmail(userEmails, sessionId, currentStatus.status, newStatus, feedback);

    const result = await SessionStatusTracking.updateOne({ sessionId }, updateData);

    if (result.nModified === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No status found for this session');
    }

    return {
      message: `Session status updated to ${newStatus}`,
      sessionId,
      outputFiles: outputFiles.length > 0 ? outputFiles : undefined,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error forwarding session status:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An unexpected error occurred');
  }
};

const approveSignatureSessionByUser = async (sessionId, userId, signatureImage) => {
  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const isCreator = session.createdBy.toString() === userId.toString();
    const signature = await RequestSessionSignature.findOne({ sessionId });

    if (!signature) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Signature request not found');
    }

    let uploadedImageUrl = null;
    if (signatureImage) {
      uploadedImageUrl = await notarizationService.uploadFileToFirebase(signatureImage, 'sessionSignatures', sessionId);
    }

    if (isCreator) {
      signature.approvalStatus.creator = {
        approved: true,
        approvedAt: new Date(),
        signatureImage: uploadedImageUrl, // Add signatureImage for creator
      };
    } else {
      // Find or create user in the users array
      const userIndex = signature.approvalStatus.users.findIndex((u) => u.email === user.email);

      if (userIndex === -1) {
        signature.approvalStatus.users.push({
          _id: user._id,
          email: user.email,
          approved: true,
          approvedAt: new Date(),
          signatureImage: uploadedImageUrl,
        });
      } else {
        signature.approvalStatus.users[userIndex] = {
          _id: user._id,
          email: user.email,
          approved: true,
          approvedAt: new Date(),
          signatureImage: uploadedImageUrl,
        };
      }
    }

    await signature.save();
    await session.save();

    return {
      message: 'Signature approved and uploaded successfully',
      signature,
    };
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
    });

    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred while approving the signature');
  }
};

const approveSignatureSessionByNotary = async (sessionId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid session ID');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user ID');
    }

    const sessionStatusTracking = await SessionStatusTracking.findOne({ sessionId });

    if (sessionStatusTracking.status !== 'digitalSignature') {
      throw new ApiError(httpStatus.CONFLICT, 'Session is not ready for digital signature');
    }

    const requestSessionSignature = await RequestSessionSignature.findOne({ sessionId });
    if (!requestSessionSignature) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Signature request not found');
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
    }

    // Check if the creator has signed
    if (!requestSessionSignature.approvalStatus.creator || !requestSessionSignature.approvalStatus.creator.approved) {
      throw new ApiError(httpStatus.CONFLICT, 'Session creator has not approved yet');
    }

    // Check if all users have signed, if there are users
    if (session.users && session.users.length > 0) {
      if (!requestSessionSignature.approvalStatus.users || requestSessionSignature.approvalStatus.users.length === 0) {
        throw new ApiError(httpStatus.CONFLICT, 'No users have signed the session');
      }

      const allUsersSigned = requestSessionSignature.approvalStatus.users.every((user) => user.approved);
      if (!allUsersSigned) {
        throw new ApiError(httpStatus.CONFLICT, 'Not all users have signed the session');
      }
    }

    if (session.payment) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Session has already been paid');
    }

    if (session.output && Array.isArray(session.output) && session.output.length > 0) {
      for (const outputFile of session.output) {
        // Download file from storage
        const fileBuffer = await downloadFile(outputFile.firebaseUrl);
        // Upload to IPFS
        const ipfsUrl = await uploadToIPFS(fileBuffer, outputFile.filename);

        // Mint NFT
        const nftData = await mintDocumentNFT(ipfsUrl);
        const transactionData = await getTransactionData(nftData.transactionHash);

        // Update output file with transaction details
        outputFile.transactionHash = transactionData.transactionHash;

        // Add NFT to wallet of everyone in session
        for (const user of session.users) {
          await userWalletService.addNFTToWallet(user._id, {
            transactionHash: transactionData.transactionHash,
            filename: outputFile.filename,
            amount: session.amount,
            tokenId: transactionData.tokenId,
            tokenURI: transactionData.tokenURI,
            contractAddress: transactionData.contractAddress,
          });
        }

        // Mint NFT for creator
        await userWalletService.addNFTToWallet(session.createdBy, {
          transactionHash: transactionData.transactionHash,
          filename: outputFile.filename,
          amount: session.amount,
          tokenId: transactionData.tokenId,
          tokenURI: transactionData.tokenURI,
          contractAddress: transactionData.contractAddress,
        });
      }

      // Save updated document
      await session.save();
    }

    const payment = new Payment({
      orderCode: generateOrderCode(),
      amount: session.notaryService.price * session.amount * (session.users.length + 1),
      description: `Session: ${sessionId.toString().slice(-15)}`,
      returnUrl: `${process.env.SERVER_URL}/success.html`,
      cancelUrl: `${process.env.SERVER_URL}/cancel.html`,
      userId: session.createdBy,
      sessionId,
      serviceId: session.notaryService.id,
      fieldId: session.notaryField.id,
    });

    await payment.save();

    const paymentLinkResponse = await payOS.createPaymentLink({
      orderCode: payment.orderCode,
      amount: payment.amount,
      description: payment.description,
      returnUrl: payment.returnUrl,
      cancelUrl: payment.cancelUrl,
    });

    payment.checkoutUrl = paymentLinkResponse.checkoutUrl;
    await payment.save();

    await SessionStatusTracking.updateOne(
      { sessionId },
      {
        status: 'completed',
        updatedAt: new Date(),
      }
    );

    const approveSessionHistory = new ApproveSessionHistory({
      userId,
      sessionId,
      beforeStatus: 'digitalSignature',
      afterStatus: 'completed',
    });

    requestSessionSignature.approvalStatus.notary = {
      approved: true,
      approvedAt: new Date(),
    };

    await requestSessionSignature.save();

    await approveSessionHistory.save();

    // send payment link to creator
    const user = await userService.getUserById(session.createdBy);
    await emailService.sendPaymentEmail(user.email, sessionId, paymentLinkResponse);

    // Send email to all users in session
    const sessionUsers = session.users.map((user) => user.email);
    const allEmails = [...new Set([...sessionUsers, user.email])];

    await emailService.sendSessionStatusUpdateEmail(
      allEmails,
      sessionId,
      'digitalSignature',
      'completed',
      'Session has been completed successfully'
    );

    return {
      message: 'Notary approved and signed the session successfully',
      sessionId,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error approve signature by notary:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to approve signature by notary');
  }
};

const autoVerifySession = async () => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

    const pendingDocuments = await SessionStatusTracking.aggregate([
      {
        $match: {
          status: 'pending',
          updatedAt: { $lt: oneMinuteAgo },
        },
      },
      {
        $lookup: {
          from: 'sessions',
          localField: 'sessionId',
          foreignField: '_id',
          as: 'sessionInfo',
        },
      },
      { $unwind: '$sessionInfo' },
    ]);

    const updatePromises = pendingDocuments.map(async (tracking) => {
      const session = tracking.sessionInfo;

      if (!session?.notaryService?.required_documents) {
        console.log(`Session ${tracking._id} lacks notarization requirements`);
        return null;
      }

      const requiredDocs = session.notaryService.required_documents;
      const existingFileNames = session.files.map((file) => file.filename);

      // Check for IPFS files
      const hasIPFSFiles = session.files.some((file) => file.firebaseUrl.startsWith('https://gateway.pinata.cloud/ipfs'));

      if (hasIPFSFiles) {
        // Automatically approve if there are IPFS files
        const newStatus = 'processing';

        await SessionStatusTracking.updateOne(
          { _id: tracking._id },
          {
            $set: {
              status: newStatus,
              updatedAt: new Date(),
              feedback: 'IPFS files detected',
            },
          }
        );

        const sessionUsers = session.users.map((user) => user.email);
        const allEmails = [...new Set([...sessionUsers, session.createdBy.email])];

        emailService.sendSessionStatusUpdateEmail(allEmails, session._id, 'pending', newStatus);

        await new ApproveSessionHistory({
          userId: null,
          sessionId: session._id,
          beforeStatus: 'pending',
          afterStatus: newStatus,
          createdDate: new Date(),
        }).save();

        return {
          sessionId: session._id,
          status: newStatus,
          missingDocs: null,
        };
      }

      const missingDocs = requiredDocs.filter((reqDoc) => !existingFileNames.some((filename) => filename.includes(reqDoc)));
      const newStatus = missingDocs.length === 0 ? 'processing' : 'rejected';

      await SessionStatusTracking.updateOne(
        { _id: tracking._id },
        {
          $set: {
            status: newStatus,
            updatedAt: new Date(),
            feedback: missingDocs.length > 0 ? `Missing documents: ${missingDocs.join(', ')}` : undefined,
          },
        }
      );

      const sessionUsers = session.users.map((user) => user.email);
      const creator = await User.findById(session.createdBy).lean();
      const allEmails = [...new Set([...sessionUsers, creator.email])];

      emailService.sendSessionStatusUpdateEmail(
        allEmails,
        session._id,
        'pending',
        newStatus,
        missingDocs.length > 0 ? `Missing documents: ${missingDocs.join(', ')}` : undefined
      );

      await new ApproveSessionHistory({
        userId: null,
        sessionId: session._id,
        beforeStatus: 'pending',
        afterStatus: newStatus,
        createdDate: new Date(),
      }).save();

      return {
        sessionId: session._id,
        status: newStatus,
        missingDocs: missingDocs.length > 0 ? missingDocs : null,
      };
    });

    const results = (await Promise.all(updatePromises)).filter(Boolean);

    console.log(`Auto-verification completed: ${results.length} sessions processed`);
    return results;
  } catch (error) {
    console.error('Auto-verification error:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Session auto-verification failed');
  }
};

const deleteFile = async (sessionId, fileId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId) || !mongoose.Types.ObjectId.isValid(fileId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid session ID or file ID');
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isSessionCreator = session.createdBy && session.createdBy.toString() === userId.toString();
  const isSessionUser = session.users.some((u) => u.email === user.email);
  if (!isSessionCreator && !isSessionUser) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have access to this session');
  }

  const fileIndex = session.files.findIndex((file) => file._id.toString() === fileId);
  if (fileIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  const file = session.files[fileIndex];
  if (!isSessionCreator && (!file.userId || file.userId.toString() !== userId.toString())) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not have permission to delete this file');
  }

  session.files.splice(fileIndex, 1);

  await session.save();
};

module.exports = {
  validateEmails,
  findBySessionId,
  createSession,
  addUserToSession,
  deleteUserOutOfSession,
  joinSession,
  getAllSessions,
  getSessionsByDate,
  getSessionsByMonth,
  getActiveSessions,
  isValidFullDate,
  isValidMonth,
  getSessionsByUserId,
  getSessionBySessionId,
  uploadSessionDocument,
  sendSessionForNotarization,
  createSessionStatusTracking,
  getSessionStatus,
  getSessionsByStatus,
  forwardSessionStatus,
  approveSignatureSessionByUser,
  approveSignatureSessionByNotary,
  autoVerifySession,
  deleteFile,
};
