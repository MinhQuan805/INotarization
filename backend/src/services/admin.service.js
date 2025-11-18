const moment = require('moment');
const httpStatus = require('http-status');
const { Document, User, Session, Payment } = require('../models');
const ApiError = require('../utils/ApiError');
const ExcelJS = require('exceljs');
const { getUserById } = require('./user.service');

const getDocumentCount = async (period) => {
  let start;
  let end;
  let subtractValue;
  let subtractUnit;

  switch (period) {
    case 'today':
      start = moment().startOf('day').toDate();
      end = moment().endOf('day').toDate();
      subtractValue = 1;
      subtractUnit = 'day';
      break;
    case 'yesterday':
      start = moment().subtract(1, 'day').startOf('day').toDate();
      end = moment().subtract(1, 'day').endOf('day').toDate();
      subtractValue = 1;
      subtractUnit = 'day';
      break;
    case 'current_week':
      start = moment().startOf('week').toDate();
      end = moment().endOf('week').toDate();
      subtractValue = 1;
      subtractUnit = 'week';
      break;
    case 'current_month':
      start = moment().startOf('month').toDate();
      end = moment().endOf('month').toDate();
      subtractValue = 1;
      subtractUnit = 'month';
      break;
    case 'current_year':
      start = moment().startOf('year').toDate();
      end = moment().endOf('year').toDate();
      subtractValue = 1;
      subtractUnit = 'year';
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  const previousStart = moment(start).subtract(subtractValue, subtractUnit).toDate();
  const previousEnd = moment(end).subtract(subtractValue, subtractUnit).toDate();

  const [currentCount, previousCount] = await Promise.all([
    Document.count({
      createdAt: { $gte: start, $lte: end },
    }),
    Document.count({
      createdAt: { $gte: previousStart, $lte: previousEnd },
    }),
  ]);

  const growthPercent = previousCount ? ((currentCount - previousCount) / previousCount) * 100 : 100;

  return {
    currentPeriod: {
      period,
      documentCount: currentCount,
    },
    previousPeriod: {
      period: `previous_${period}`,
      documentCount: previousCount,
    },
    growthPercent,
  };
};

const getUserCount = async (period) => {
  let start;
  let end;
  let subtractValue;
  let subtractUnit;

  switch (period) {
    case 'today':
      start = moment().startOf('day').toDate();
      end = moment().endOf('day').toDate();
      subtractValue = 1;
      subtractUnit = 'day';
      break;
    case 'current_week':
      start = moment().startOf('week').toDate();
      end = moment().endOf('week').toDate();
      subtractValue = 1;
      subtractUnit = 'week';
      break;
    case 'current_month':
      start = moment().startOf('month').toDate();
      end = moment().endOf('month').toDate();
      subtractValue = 1;
      subtractUnit = 'month';
      break;
    case 'current_year':
      start = moment().startOf('year').toDate();
      end = moment().endOf('year').toDate();
      subtractValue = 1;
      subtractUnit = 'year';
      break;
    case 'yesterday':
      start = moment().subtract(1, 'day').startOf('day').toDate();
      end = moment().subtract(1, 'day').endOf('day').toDate();
      subtractValue = 1;
      subtractUnit = 'day';
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  const previousStart = moment(start).subtract(subtractValue, subtractUnit).toDate();
  const previousEnd = moment(end).subtract(subtractValue, subtractUnit).toDate();

  const [currentCount, previousCount] = await Promise.all([
    User.countDocuments({
      createdAt: { $gte: start, $lte: end },
    }),
    User.countDocuments({
      createdAt: { $gte: previousStart, $lte: previousEnd },
    }),
  ]);

  const growthPercent = previousCount ? ((currentCount - previousCount) / previousCount) * 100 : 100;

  return {
    currentPeriod: {
      period,
      userCount: currentCount,
    },
    previousPeriod: {
      period: `previous_${period}`,
      userCount: previousCount,
    },
    growthPercent,
  };
};

const getDocumentsByNotaryField = async (period) => {
  let start;
  let end;
  let subtractValue;
  let subtractUnit;

  switch (period) {
    case 'today':
      start = moment().startOf('day').toDate();
      end = moment().endOf('day').toDate();
      subtractValue = 1;
      subtractUnit = 'day';
      break;
    case 'current_week':
      start = moment().startOf('week').toDate();
      end = moment().endOf('week').toDate();
      subtractValue = 1;
      subtractUnit = 'week';
      break;
    case 'current_month':
      start = moment().startOf('month').toDate();
      end = moment().endOf('month').toDate();
      subtractValue = 1;
      subtractUnit = 'month';
      break;
    case 'current_year':
      start = moment().startOf('year').toDate();
      end = moment().endOf('year').toDate();
      subtractValue = 1;
      subtractUnit = 'year';
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  const previousStart = moment(start).subtract(subtractValue, subtractUnit).toDate();
  const previousEnd = moment(end).subtract(subtractValue, subtractUnit).toDate();
  console.log('start', start);
  console.log('end', end);
  console.log('previousStart', previousStart);
  console.log('previousEnd', previousEnd);

  const [currentDocuments, previousDocuments] = await Promise.all([
    Document.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $lookup: {
          from: 'notarizationFields',
          localField: 'notarizationField.id',
          foreignField: '_id',
          as: 'fieldInfo',
        },
      },
      { $unwind: '$fieldInfo' },
      {
        $group: {
          _id: '$fieldInfo.name',
          amount: { $sum: 1 },
        },
      },
      {
        $project: {
          notarizationFieldName: '$_id',
          amount: 1,
          _id: 0,
        },
      },
    ]),
    Document.aggregate([
      { $match: { createdAt: { $gte: previousStart, $lte: previousEnd } } },
      {
        $lookup: {
          from: 'notarizationFields',
          localField: 'notarizationField.id',
          foreignField: '_id',
          as: 'fieldInfo',
        },
      },
      { $unwind: '$fieldInfo' },
      {
        $group: {
          _id: '$fieldInfo.name',
          amount: { $sum: 1 },
        },
      },
      {
        $project: {
          notarizationFieldName: '$_id',
          amount: 1,
          _id: 0,
        },
      },
    ]),
  ]);

  return {
    currentPeriod: {
      period,
      totals: currentDocuments,
    },
    previousPeriod: {
      period: `previous_${period}`,
      totals: previousDocuments,
    },
  };
};

const getEmployeeCount = async () => {
  const notaryCount = await User.countDocuments({ role: 'notary' });
  const secretaryCount = await User.countDocuments({ role: 'secretary' });
  return {
    notaryCount,
    secretaryCount,
  };
};

const getEmployeeList = async (filter, options) => {
  try {
    const { sortBy = 'name', order = 'asc', limit = 10, page = 1 } = options || {};

    const sortOrder = order === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const queryFilter = { ...filter, role: { $in: ['notary', 'secretary'] } };

    const totalResults = await User.countDocuments(queryFilter);

    const totalPages = Math.ceil(totalResults / limit);

    const employeeList = await User.find(queryFilter)
      .sort({ [sortBy]: sortOrder, _id: 1 })
      .skip(skip)
      .limit(Number(limit));

    return {
      results: employeeList,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      totalResults,
    };
  } catch (error) {
    console.error('Error retrieving employee list:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve employee list');
  }
};

const getSessionCount = async (period) => {
  let start;
  let end;
  let subtractValue;
  let subtractUnit;

  switch (period) {
    case 'today':
      start = moment().startOf('day').toDate();
      end = moment().endOf('day').toDate();
      subtractValue = 1;
      subtractUnit = 'day';
      break;
    case 'current_week':
      start = moment().startOf('week').toDate();
      end = moment().endOf('week').toDate();
      subtractValue = 1;
      subtractUnit = 'week';
      break;
    case 'current_month':
      start = moment().startOf('month').toDate();
      end = moment().endOf('month').toDate();
      subtractValue = 1;
      subtractUnit = 'month';
      break;
    case 'current_year':
      start = moment().startOf('year').toDate();
      end = moment().endOf('year').toDate();
      subtractValue = 1;
      subtractUnit = 'year';
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  const previousStart = moment(start).subtract(subtractValue, subtractUnit).toDate();
  const previousEnd = moment(end).subtract(subtractValue, subtractUnit).toDate();

  const [currentCount, previousCount] = await Promise.all([
    Session.countDocuments({
      $or: [{ startDate: { $gte: start, $lte: end } }, { endDate: { $gte: start, $lte: end } }],
    }),
    Session.countDocuments({
      $or: [
        { startDate: { $gte: previousStart, $lte: previousEnd } },
        { endDate: { $gte: previousStart, $lte: previousEnd } },
      ],
    }),
  ]);

  const growthPercent = previousCount ? ((currentCount - previousCount) / previousCount) * 100 : 100;

  return {
    currentPeriod: {
      period,
      sessionCount: currentCount,
    },
    previousPeriod: {
      period: `previous_${period}`,
      sessionCount: previousCount,
    },
    growthPercent,
  };
};

const getPaymentTotalByService = async (period) => {
  let currentStart;
  let currentEnd;
  let previousStart;
  let previousEnd;

  switch (period) {
    case 'today':
      currentStart = moment().startOf('day').toDate();
      currentEnd = moment().endOf('day').toDate();
      previousStart = moment().subtract(1, 'day').startOf('day').toDate();
      previousEnd = moment().subtract(1, 'day').endOf('day').toDate();
      break;
    case 'current_week':
      currentStart = moment().startOf('week').toDate();
      currentEnd = moment().endOf('week').toDate();
      previousStart = moment().subtract(1, 'week').startOf('week').toDate();
      previousEnd = moment().subtract(1, 'week').endOf('week').toDate();
      break;
    case 'current_month':
      currentStart = moment().startOf('month').toDate();
      currentEnd = moment().endOf('month').toDate();
      previousStart = moment().subtract(1, 'month').startOf('month').toDate();
      previousEnd = moment().subtract(1, 'month').endOf('month').toDate();
      break;
    case 'current_year':
      currentStart = moment().startOf('year').toDate();
      currentEnd = moment().endOf('year').toDate();
      previousStart = moment().subtract(1, 'year').startOf('year').toDate();
      previousEnd = moment().subtract(1, 'year').endOf('year').toDate();
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  const [currentPayments, previousPayments] = await Promise.all([
    Payment.aggregate([
      { $match: { createdAt: { $gte: currentStart, $lte: currentEnd } } },
      {
        $lookup: {
          from: 'notarizationServices',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'serviceInfo',
        },
      },
      { $unwind: '$serviceInfo' },
      {
        $group: {
          _id: '$serviceInfo.name',
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          serviceName: '$_id',
          totalAmount: 1,
        },
      },
    ]),
    Payment.aggregate([
      { $match: { createdAt: { $gte: previousStart, $lte: previousEnd } } },
      {
        $lookup: {
          from: 'notarizationServices',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'serviceInfo',
        },
      },
      { $unwind: '$serviceInfo' },
      {
        $group: {
          _id: '$serviceInfo.name',
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          serviceName: '$_id',
          totalAmount: 1,
        },
      },
    ]),
  ]);

  return {
    currentPeriod: {
      period,
      totals: currentPayments,
    },
    previousPeriod: {
      period: `previous_${period}`,
      totals: previousPayments,
    },
  };
};

const getPaymentTotalByNotarizationField = async (period) => {
  let currentStart;
  let currentEnd;
  let previousStart;
  let previousEnd;

  switch (period) {
    case 'today':
      currentStart = moment().startOf('day').toDate();
      currentEnd = moment().endOf('day').toDate();
      previousStart = moment().subtract(1, 'day').startOf('day').toDate();
      previousEnd = moment().subtract(1, 'day').endOf('day').toDate();
      break;
    case 'current_week':
      currentStart = moment().startOf('week').toDate();
      currentEnd = moment().endOf('week').toDate();
      previousStart = moment().subtract(1, 'week').startOf('week').toDate();
      previousEnd = moment().subtract(1, 'week').endOf('week').toDate();
      break;
    case 'current_month':
      currentStart = moment().startOf('month').toDate();
      currentEnd = moment().endOf('month').toDate();
      previousStart = moment().subtract(1, 'month').startOf('month').toDate();
      previousEnd = moment().subtract(1, 'month').endOf('month').toDate();
      break;
    case 'current_year':
      currentStart = moment().startOf('year').toDate();
      currentEnd = moment().endOf('year').toDate();
      previousStart = moment().subtract(1, 'year').startOf('year').toDate();
      previousEnd = moment().subtract(1, 'year').endOf('year').toDate();
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  const [currentFields, previousFields] = await Promise.all([
    Payment.aggregate([
      { $match: { createdAt: { $gte: currentStart, $lte: currentEnd } } },
      {
        $lookup: {
          from: 'notarizationFields',
          localField: 'fieldId',
          foreignField: '_id',
          as: 'fieldInfo',
        },
      },
      { $unwind: '$fieldInfo' },
      {
        $group: {
          _id: '$fieldInfo.name',
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          fieldName: '$_id',
          totalAmount: 1,
        },
      },
    ]),
    Payment.aggregate([
      { $match: { createdAt: { $gte: previousStart, $lte: previousEnd } } },
      {
        $lookup: {
          from: 'notarizationFields',
          localField: 'fieldId',
          foreignField: '_id',
          as: 'fieldInfo',
        },
      },
      { $unwind: '$fieldInfo' },
      {
        $group: {
          _id: '$fieldInfo.name',
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          fieldName: '$_id',
          totalAmount: 1,
        },
      },
    ]),
  ]);

  return {
    currentPeriod: {
      period,
      totals: currentFields,
    },
    previousPeriod: {
      period: `previous_${period}`,
      totals: previousFields,
    },
  };
};

const getPaymentTotal = async (period) => {
  let currentStart;
  let currentEnd;
  let subtractValue;
  let subtractUnit;

  switch (period) {
    case 'today':
      currentStart = moment().startOf('day').toDate();
      currentEnd = moment().endOf('day').toDate();
      subtractValue = 1;
      subtractUnit = 'day';
      break;
    case 'yesterday':
      currentStart = moment().subtract(1, 'day').startOf('day').toDate();
      currentEnd = moment().subtract(1, 'day').endOf('day').toDate();
      subtractValue = 1;
      subtractUnit = 'day';
      break;
    case 'current_week':
      currentStart = moment().startOf('week').toDate();
      currentEnd = moment().endOf('week').toDate();
      subtractValue = 1;
      subtractUnit = 'week';
      break;
    case 'current_month':
      currentStart = moment().startOf('month').toDate();
      currentEnd = moment().endOf('month').toDate();
      subtractValue = 1;
      subtractUnit = 'month';
      break;
    case 'current_year':
      currentStart = moment().startOf('year').toDate();
      currentEnd = moment().endOf('year').toDate();
      subtractValue = 1;
      subtractUnit = 'year';
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  const previousStart = moment(currentStart).subtract(subtractValue, subtractUnit).toDate();
  const previousEnd = moment(currentEnd).subtract(subtractValue, subtractUnit).toDate();

  const [currentTotalResult, previousTotalResult] = await Promise.all([
    Payment.aggregate([
      { $match: { createdAt: { $gte: currentStart, $lte: currentEnd } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { createdAt: { $gte: previousStart, $lte: previousEnd } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]),
  ]);

  const currentTotal = currentTotalResult.length > 0 ? currentTotalResult[0].totalAmount : 0;
  const previousTotal = previousTotalResult.length > 0 ? previousTotalResult[0].totalAmount : 0;

  const growthPercent = previousTotal ? ((currentTotal - previousTotal) / previousTotal) * 100 : 100;

  return {
    currentPeriod: {
      period,
      totalAmount: currentTotal,
    },
    previousPeriod: {
      period: `previous_${period}`,
      totalAmount: previousTotal,
    },
    growthPercent,
  };
};

const getDocuments = async (period) => {
  let start;
  let end;

  switch (period) {
    case 'today':
      start = moment().startOf('day').toDate();
      end = moment().endOf('day').toDate();
      break;
    case 'current_week':
      start = moment().startOf('week').toDate();
      end = moment().endOf('week').toDate();
      break;
    case 'current_month':
      start = moment().startOf('month').toDate();
      end = moment().endOf('month').toDate();
      break;
    case 'current_year':
      start = moment().startOf('year').toDate();
      end = moment().endOf('year').toDate();
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  const documents = await Document.find({ createdAt: { $gte: start, $lte: end } }).populate('notarizationField');

  return documents;
};

const getPayments = async (period) => {
  let start;
  let end;

  switch (period) {
    case 'today':
      start = moment().startOf('day').toDate();
      end = moment().endOf('day').toDate();
      break;
    case 'current_week':
      start = moment().startOf('week').toDate();
      end = moment().endOf('week').toDate();
      break;
    case 'current_month':
      start = moment().startOf('month').toDate();
      end = moment().endOf('month').toDate();
      break;
    case 'current_year':
      start = moment().startOf('year').toDate();
      end = moment().endOf('year').toDate();
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  const payments = await Payment.find({ createdAt: { $gte: start, $lte: end } })
    .populate('service')
    .populate('field');

  return payments;
};

const getSessions = async (period) => {
  let start;
  let end;

  switch (period) {
    case 'today':
      start = moment().startOf('day').toDate();
      end = moment().endOf('day').toDate();
      break;
    case 'current_week':
      start = moment().startOf('week').toDate();
      end = moment().endOf('week').toDate();
      break;
    case 'current_month':
      start = moment().startOf('month').toDate();
      end = moment().endOf('month').toDate();
      break;
    case 'current_year':
      start = moment().startOf('year').toDate();
      end = moment().endOf('year').toDate();
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  const sessions = await Session.find({
    $or: [{ startDate: { $gte: start, $lte: end } }, { endDate: { $gte: start, $lte: end } }],
  });

  return sessions;
};

const exportMetrics = async (period) => {
  const [documents, payments, sessions] = await Promise.all([
    getDocuments(period),
    getPayments(period),
    getSessions(period),
  ]);

  const workbook = new ExcelJS.Workbook();
  const exportDate = moment().format('YYYY-MM-DD HH:mm:ss');

  // Add Documents Sheet
  const documentsSheet = workbook.addWorksheet('Documents');
  documentsSheet.columns = [
    { header: 'Document ID', key: 'id', width: 30 },
    { header: 'Notarization Field', key: 'notarizationField', width: 30 },
    { header: 'Requester Name', key: 'requesterName', width: 30 },
    { header: 'Requester Email', key: 'requesterEmail', width: 30 },
    { header: 'Price', key: 'price', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 30 },
  ];
  documentsSheet.mergeCells('A1:F1');
  documentsSheet.getCell('A1').value = 'Documents List';
  documentsSheet.getCell('A1').alignment = { horizontal: 'center' };
  documentsSheet.addRow(['Export Date:', exportDate]);
  documentsSheet.addRow(['Period:', period]);
  documentsSheet.addRow([]);
  documentsSheet.addRow(documentsSheet.columns.map((col) => col.header));
  documents.forEach((doc) => {
    documentsSheet.addRow({
      id: doc._id,
      notarizationField: doc.notarizationField.name,
      requesterName: doc.requesterInfo.fullName,
      requesterEmail: doc.requesterInfo.email,
      price: doc.notarizationService.price,
      createdAt: doc.createdAt,
    });
  });

  // Add Payments Sheet
  const paymentsSheet = workbook.addWorksheet('Payments');
  paymentsSheet.columns = [
    { header: 'Payment ID', key: 'id', width: 30 },
    { header: 'User Full Name', key: 'userFullName', width: 30 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 30 },
  ];
  paymentsSheet.mergeCells('A1:D1');
  paymentsSheet.getCell('A1').value = 'Payments List';
  paymentsSheet.getCell('A1').alignment = { horizontal: 'center' };
  paymentsSheet.addRow(['Export Date:', exportDate]);
  paymentsSheet.addRow(['Period:', period]);
  paymentsSheet.addRow([]);
  paymentsSheet.addRow(paymentsSheet.columns.map((col) => col.header));

  for (const payment of payments) {
    const user = await getUserById(payment.userId);
    paymentsSheet.addRow({
      id: payment._id,
      userFullName: user ? user.name : 'Unknown',
      amount: payment.amount,
      createdAt: payment.createdAt,
    });
  }

  // Add Sessions Sheet
  const sessionsSheet = workbook.addWorksheet('Sessions');
  sessionsSheet.columns = [
    { header: 'Session ID', key: 'id', width: 30 },
    { header: 'Created By', key: 'createdBy', width: 30 },
    { header: 'Start Date', key: 'startDate', width: 30 },
    { header: 'End Date', key: 'endDate', width: 30 },
  ];
  sessionsSheet.mergeCells('A1:D1');
  sessionsSheet.getCell('A1').value = 'Sessions List';
  sessionsSheet.getCell('A1').alignment = { horizontal: 'center' };
  sessionsSheet.addRow(['Export Date:', exportDate]);
  sessionsSheet.addRow(['Period:', period]);
  sessionsSheet.addRow([]);
  sessionsSheet.addRow(sessionsSheet.columns.map((col) => col.header));

  for (const session of sessions) {
    const createdByUsers = await getUserById(session.createdBy);
    sessionsSheet.addRow({
      id: session._id,
      createdBy: createdByUsers ? createdByUsers.name : 'Unknown',
      startDate: session.startDate,
      endDate: session.endDate,
      createdAt: session.createdAt,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};

module.exports = {
  getDocumentCount,
  getUserCount,
  getDocumentsByNotaryField,
  getEmployeeCount,
  getEmployeeList,
  getSessionCount,
  getPaymentTotalByService,
  getPaymentTotalByNotarizationField,
  getPaymentTotal,
  exportMetrics,
};
