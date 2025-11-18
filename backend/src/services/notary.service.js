const httpStatus = require('http-status');
const { StatusTracking, SessionStatusTracking, ApproveHistory, ApproveSessionHistory } = require('../models');
const ApiError = require('../utils/ApiError');

const getDateRanges = (unit, subtractValue) => {
  const now = new Date();
  let start;
  let end;
  let previousStart;
  let previousEnd;

  if (unit === 'day') {
    const today = new Date(now);
    start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - subtractValue));
    end = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - subtractValue, 23, 59, 59, 999)
    );
    previousStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - subtractValue - 1));
    previousEnd = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - subtractValue - 1, 23, 59, 59, 999)
    );
  }

  if (unit === 'week') {
    const firstDayOfWeek = now.getDate() - now.getDay();
    const currentStart = new Date(now);
    currentStart.setDate(firstDayOfWeek - subtractValue * 7);
    start = currentStart;
    const currentEnd = new Date(now);
    currentEnd.setDate(firstDayOfWeek + 6 - subtractValue * 7);
    end = currentEnd;
    const prevFirstDayOfWeek = firstDayOfWeek - 7;
    const previousStartDate = new Date(now);
    previousStartDate.setDate(prevFirstDayOfWeek - subtractValue * 7);
    previousStart = previousStartDate;
    const previousEndDate = new Date(now);
    previousEndDate.setDate(prevFirstDayOfWeek + 6 - subtractValue * 7);
    previousEnd = previousEndDate;
  }

  if (unit === 'month') {
    const currentMonthStart = new Date(now);
    start = new Date(Date.UTC(currentMonthStart.getUTCFullYear(), currentMonthStart.getUTCMonth() - subtractValue, 1));
    end = new Date(
      Date.UTC(currentMonthStart.getUTCFullYear(), currentMonthStart.getUTCMonth() - subtractValue + 1, 0, 23, 59, 59, 999)
    );
    previousStart = new Date(
      Date.UTC(currentMonthStart.getUTCFullYear(), currentMonthStart.getUTCMonth() - subtractValue - 1, 1)
    );
    previousEnd = new Date(
      Date.UTC(currentMonthStart.getUTCFullYear(), currentMonthStart.getUTCMonth() - subtractValue, 0, 23, 59, 59, 999)
    );
  }
  return {
    crtStart: start,
    crtEnd: end,
    prsStart: previousStart,
    prsEnd: previousEnd,
  };
};

const getSignatureSessionsDocuments = async () => {
  try {
    const status = 'digitalSignature';
    const { crtStart, crtEnd, prsStart, prsEnd } = getDateRanges('day', 0);
    const [crtSessions, prsSessions, crtDocuments, prsDocuments, totalSessions, totalDocuments] = await Promise.all([
      SessionStatusTracking.countDocuments({
        status,
        updatedAt: { $gte: crtStart, $lte: crtEnd },
      }),
      SessionStatusTracking.countDocuments({
        status,
        updatedAt: { $gte: prsStart, $lte: prsEnd },
      }),
      StatusTracking.countDocuments({
        status,
        updatedAt: { $gte: crtStart, $lte: crtEnd },
      }),
      StatusTracking.countDocuments({
        status,
        updatedAt: { $gte: prsStart, $lte: prsEnd },
      }),
      SessionStatusTracking.countDocuments({ status }),
      StatusTracking.countDocuments({ status }),
    ]);

    const currentTotal = crtSessions + crtDocuments;
    const previousTotal = prsSessions + prsDocuments;
    const change = currentTotal - previousTotal;
    const total = totalSessions + totalDocuments;
    return { total, change };
  } catch (error) {
    console.error('Error in getSignatureSessionsDocuments:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred while fetching the metrics');
  }
};

const getProcessingSessionsDocuments = async () => {
  try {
    const status = 'processing';
    const { crtStart, crtEnd, prsStart, prsEnd } = getDateRanges('month', 0);
    const [crtSessions, prsSessions, crtDocuments, prsDocuments, totalSessions, totalDocuments] = await Promise.all([
      SessionStatusTracking.countDocuments({ status, updatedAt: { $gte: crtStart, $lte: crtEnd } }),
      SessionStatusTracking.countDocuments({ status, updatedAt: { $gte: prsStart, $lte: prsEnd } }),
      StatusTracking.countDocuments({ status, updatedAt: { $gte: crtStart, $lte: crtEnd } }),
      StatusTracking.countDocuments({ status, updatedAt: { $gte: prsStart, $lte: prsEnd } }),
      SessionStatusTracking.countDocuments({ status }),
      StatusTracking.countDocuments({ status }),
    ]);

    const currentTotal = crtSessions + crtDocuments;
    const previousTotal = prsSessions + prsDocuments;
    const growthPercent =
      // eslint-disable-next-line no-nested-ternary
      previousTotal === 0 && currentTotal === 0
        ? 0
        : previousTotal === 0
        ? 100
        : ((currentTotal - previousTotal) / previousTotal) * 100;

    const total = totalSessions + totalDocuments;
    return { total, growthPercent };
  } catch (error) {
    console.error('Error in getProcessingSessionsDocuments:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred while fetching the processing metrics');
  }
};

const getNotaryApproved = async (id) => {
  try {
    const userid = id;
    const afterStatus = 'completed';
    const { crtStart, crtEnd, prsStart, prsEnd } = getDateRanges('month', 0);

    console.log('Date Ranges:', { crtStart, crtEnd, prsStart, prsEnd });

    const [
      crtApprovedSessions,
      prsApprovedSessions,
      crtApprovedDocuments,
      prsApprovedDocuments,
      totalApprovedSessions,
      totalApprovedDocuments,
    ] = await Promise.all([
      ApproveSessionHistory.countDocuments({ afterStatus, createdDate: { $gte: crtStart, $lte: crtEnd }, userId: userid }),
      ApproveSessionHistory.countDocuments({ afterStatus, createdDate: { $gte: prsStart, $lte: prsEnd }, userId: userid }),
      ApproveHistory.countDocuments({ afterStatus, createdDate: { $gte: crtStart, $lte: crtEnd }, userId: userid }),
      ApproveHistory.countDocuments({ afterStatus, createdDate: { $gte: prsStart, $lte: prsEnd }, userId: userid }),
      ApproveSessionHistory.countDocuments({ afterStatus, userId: userid }),
      ApproveHistory.countDocuments({ afterStatus, userId: userid }),
    ]);
    const currentTotal = crtApprovedSessions + crtApprovedDocuments;
    const previousTotal = prsApprovedSessions + prsApprovedDocuments;
    const growthPercent =
      // eslint-disable-next-line no-nested-ternary
      previousTotal === 0 && currentTotal === 0
        ? 0
        : previousTotal === 0
        ? 100
        : ((currentTotal - previousTotal) / previousTotal) * 100;

    const total = totalApprovedSessions + totalApprovedDocuments;

    return { total, growthPercent };
  } catch (error) {
    console.error('Error in getNotaryApproved:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'An error occurred while fetching the approval metrics'
    );
  }
};

const getAcceptanceRate = async () => {
  try {
    const afterStatus = 'rejected';
    const { crtStart, crtEnd, prsStart, prsEnd } = getDateRanges('week', 0);
    const [
      crtRejectedSessions,
      prsRejectedSessions,
      totalRejectedSessions,
      crtTotalSessions,
      prsTotalSessions,
      totalTotalSessions,
      crtRejectedDocuments,
      prsRejectedDocuments,
      totalRejectedDocuments,
      crtTotalDocuments,
      prsTotalDocuments,
      totalTotalDocuments,
    ] = await Promise.all([
      ApproveSessionHistory.countDocuments({
        afterStatus,
        createdDate: { $gte: crtStart, $lte: crtEnd },
      }),
      ApproveSessionHistory.countDocuments({
        afterStatus,
        createdDate: { $gte: prsStart, $lte: prsEnd },
      }),
      ApproveSessionHistory.countDocuments({
        afterStatus,
      }),
      ApproveSessionHistory.countDocuments({
        createdDate: { $gte: crtStart, $lte: crtEnd },
      }),
      ApproveSessionHistory.countDocuments({
        createdDate: { $gte: prsStart, $lte: prsEnd },
      }),
      ApproveSessionHistory.countDocuments({}),
      ApproveHistory.countDocuments({
        afterStatus,
        createdDate: { $gte: crtStart, $lte: crtEnd },
      }),
      ApproveHistory.countDocuments({
        afterStatus,
        createdDate: { $gte: prsStart, $lte: prsEnd },
      }),
      ApproveHistory.countDocuments({
        afterStatus,
      }),
      ApproveHistory.countDocuments({
        createdDate: { $gte: crtStart, $lte: crtEnd },
      }),
      ApproveHistory.countDocuments({
        createdDate: { $gte: prsStart, $lte: prsEnd },
      }),
      ApproveHistory.countDocuments({}),
    ]);
    const crtTotalRejected = crtRejectedDocuments + crtRejectedSessions;
    const prsTotalRejected = prsRejectedDocuments + prsRejectedSessions;
    const crtTotal = crtTotalDocuments + crtTotalSessions;
    const prsTotal = prsTotalDocuments + prsTotalSessions;
    const total = totalTotalDocuments + totalTotalSessions;
    const totalRejected = totalRejectedDocuments + totalRejectedSessions;
    const crtAcceptanceRate = crtTotal === 0 ? 100 : parseFloat(((1 - crtTotalRejected / crtTotal) * 100).toFixed(2));
    const prsAcceptanceRate = prsTotal === 0 ? 100 : parseFloat(((1 - prsTotalRejected / prsTotal) * 100).toFixed(2));
    const acceptanceRate = total === 0 ? 100 : parseFloat(((1 - totalRejected / total) * 100).toFixed(2));
    const growthPercent = crtAcceptanceRate - prsAcceptanceRate;
    return {
      acceptanceRate,
      growthPercent,
    };
  } catch (error) {
    console.error('Error in getAcceptanceRate:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'An error occurred while fetching the acceptance rate'
    );
  }
};

module.exports = {
  getProcessingSessionsDocuments,
  getSignatureSessionsDocuments,
  getNotaryApproved,
  getAcceptanceRate,
};
