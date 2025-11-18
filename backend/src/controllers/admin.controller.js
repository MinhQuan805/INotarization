const httpStatus = require('http-status');
const { adminService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const getDocumentCount = catchAsync(async (req, res) => {
  const { period } = req.params; // Changed from req.query to req.params
  const allowedPeriods = ['today', 'current_week', 'current_month', 'current_year'];
  console.log(period);
  if (!allowedPeriods.includes(period)) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid period parameter' });
  }

  const result = await adminService.getDocumentCount(period);
  res.status(httpStatus.OK).send(result);
});

// Remove specific controller function
// const getToDayUserCount = async (req, res) => {
//   const result = await adminService.getToDayUserCount();
//   res.status(httpStatus.OK).send(result);
// };

// Add a generic controller function
const getUserCount = catchAsync(async (req, res) => {
  const { period } = req.params;
  const allowedPeriods = ['today', 'current_week', 'current_month', 'current_year'];

  if (!allowedPeriods.includes(period)) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid period parameter' });
  }

  const result = await adminService.getUserCount(period);
  res.status(httpStatus.OK).send(result);
});

const getUserMonthly = async (req, res) => {
  const result = await adminService.getUserMonthly();
  res.status(httpStatus.OK).send(result);
};

// const getTodayDocumentsByNotaryField = async (req, res) => {
//   const result = await adminService.getTodayDocumentsByNotaryField();
//   res.status(httpStatus.OK).send(result);
// };

// const getMonthDocumentsByNotaryField = async (req, res) => {
//   const result = await adminService.getMonthDocumentsByNotaryField();
//   res.status(httpStatus.OK).send(result);
// };

const getDocumentsByNotaryField = catchAsync(async (req, res) => {
  const { period } = req.params;
  const allowedPeriods = ['today', 'current_week', 'current_month', 'current_year'];

  if (!allowedPeriods.includes(period)) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid period parameter' });
  }

  const result = await adminService.getDocumentsByNotaryField(period);
  res.status(httpStatus.OK).send(result);
});

// const getDailySessionCount = async (req, res) => {
//   const result = await adminService.getDailySessionCount();
//   res.status(httpStatus.OK).send(result);
// };

// const getMonthlySessionCount = async (req, res) => {
//   const result = await adminService.getMonthlySessionCount();
//   res.status(httpStatus.OK).send(result);
// };

const getSessionCount = catchAsync(async (req, res) => {
  const { period } = req.params;
  const allowedPeriods = ['today', 'current_week', 'current_month', 'current_year'];

  if (!allowedPeriods.includes(period)) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid period parameter' });
  }

  const result = await adminService.getSessionCount(period);
  res.status(httpStatus.OK).send(result);
});

const getEmployeeCount = catchAsync(async (req, res) => {
  const EmployeeCount = await adminService.getEmployeeCount();
  console.log(EmployeeCount);
  res.send(EmployeeCount);
});

const getEmployeeList = catchAsync(async (req, res) => {
  const filter = {};
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const EmployeeList = await adminService.getEmployeeList(filter, options);
  // console.log(EmployeeList);
  res.send(EmployeeList);
});

// const getDailyPaymentTotal = async (req, res) => {
//   const result = await adminService.getDailyPaymentTotal();
//   res.status(httpStatus.OK).send({ dailyPaymentTotal: result });
// };

// const getMonthlyPaymentTotal = async (req, res) => {
//   const result = await adminService.getMonthlyPaymentTotal();
//   res.status(httpStatus.OK).send({ monthlyPaymentTotal: result });
// };

const getPaymentTotalByService = catchAsync(async (req, res) => {
  const { period } = req.params;
  const result = await adminService.getPaymentTotalByService(period);
  res.status(httpStatus.OK).send(result);
});

const getPaymentTotalByNotarizationField = catchAsync(async (req, res) => {
  const { period } = req.params;
  const result = await adminService.getPaymentTotalByNotarizationField(period);
  res.status(httpStatus.OK).send(result);
});

const getPaymentTotal = catchAsync(async (req, res) => {
  const { period } = req.params;
  const allowedPeriods = ['today', 'yesterday', 'current_week', 'current_month', 'current_year'];

  if (!allowedPeriods.includes(period)) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid period parameter' });
  }

  const result = await adminService.getPaymentTotal(period);
  res.status(httpStatus.OK).send(result);
});

const exportMetrics = catchAsync(async (req, res) => {
  const { period } = req.params;
  const allowedPeriods = ['today', 'current_week', 'current_month', 'current_year'];

  if (!allowedPeriods.includes(period)) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid period parameter' });
  }

  const buffer = await adminService.exportMetrics(period);

  res.setHeader('Content-Disposition', `attachment; filename=metrics_${period}.xlsx`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});
module.exports = {
  getDocumentCount,
  getUserCount,
  getUserMonthly,
  getDocumentsByNotaryField,
  getEmployeeCount,
  getEmployeeList,
  getSessionCount,
  getPaymentTotalByService,
  getPaymentTotalByNotarizationField,
  getPaymentTotal,
  exportMetrics,
};
