const express = require('express');
const auth = require('../../middlewares/auth');
const { adminController } = require('../../controllers');

const router = express.Router();

// Document metrics
router.get('/documents/:period', auth('getDocumentCount'), adminController.getDocumentCount);

// User metrics
router.get('/users/:period', auth('getUserCount'), adminController.getUserCount);

// Document metrics by notary field
router.get('/documents/fields/:period', auth('getDocumentsByNotaryField'), adminController.getDocumentsByNotaryField);

// Employee metrics
router.get('/employees/count', auth('getEmployeeCount'), adminController.getEmployeeCount);

router.get('/employees/list', auth('getEmployeeList'), adminController.getEmployeeList);

// Session metrics
router.get('/sessions/:period', auth('getSessionCount'), adminController.getSessionCount);

// Payment metrics
router.get('/payments/:period', auth('getPaymentTotal'), adminController.getPaymentTotal);

router.get('/payments/:period/service', auth('getPaymentTotalByService'), adminController.getPaymentTotalByService);

router.get(
  '/payments/:period/field',
  auth('getPaymentTotalByNotarizationField'),
  adminController.getPaymentTotalByNotarizationField
);

// export excel file for metrics with period
router.get('/export/:period', auth('exportMetrics'), adminController.exportMetrics);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: Admin management and retrieval
 */

/**
 * @swagger
 * components:
 *   responses:
 *     BadRequest:
 *       description: Bad request due to invalid or missing query parameters
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Invalid request parameters
 *               error:
 *                 type: string
 *                 example: BadRequest
 *     Unauthorized:
 *       description: Unauthorized access - invalid or missing token
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Unauthorized
 *               error:
 *                 type: string
 *                 example: Unauthorized
 *     Forbidden:
 *       description: Forbidden - user does not have permission to access this resource
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Forbidden access
 *               error:
 *                 type: string
 *                 example: Forbidden
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Resource not found
 *               error:
 *                 type: string
 *                 example: NotFound
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: An unexpected error occurred
 *               error:
 *                 type: string
 *                 example: InternalServerError
 */

/**
 * @swagger
 * /admin/metrics/documents/{period}:
 *   get:
 *     summary: Get document count and percent document growth for a specified period
 *     description: Only admins can retrieve document count and growth percentage for the specified period.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, current_week, current_month, current_year]
 *         required: true
 *         description: The period to retrieve document count and growth percentage for
 *     responses:
 *       "200":
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       enum: [today, current_week, current_month, current_year]
 *                       example: "today"
 *                     documentCount:
 *                       type: integer
 *                       example: 20
 *                 previousPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: "previous_today"
 *                     documentCount:
 *                       type: integer
 *                       example: 15
 *                 growthPercent:
 *                   type: number
 *                   example: 33.33
 *       "400":
 *         description: Bad Request - Invalid period parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 *       "401":
 *         description: Unauthorized access - invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden - the user doesn't have access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not found - endpoint does not exist
 */

/**
 * @swagger
 * /admin/metrics/users/{period}:
 *   get:
 *     summary: Get user count and growth percent for a specified period
 *     description: Retrieve user count and growth percentage based on the specified period. Only admins can access this information.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, current_week, current_month, current_year]
 *         required: true
 *         description: The period to retrieve user metrics for
 *     responses:
 *       "200":
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       enum: [today, current_week, current_month, current_year]
 *                       example: "daily"
 *                     userCount:
 *                       type: integer
 *                       example: 25
 *                 previousPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: "previous_daily"
 *                     userCount:
 *                       type: integer
 *                       example: 20
 *                 growthPercent:
 *                   type: number
 *                   example: 25
 *       "400":
 *         description: Bad Request - Invalid period parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 *       "401":
 *         description: Unauthorized access - invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden - the user doesn't have access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not found - endpoint does not exist
 */

/**
 * @swagger
 * /admin/metrics/documents/fields/{period}:
 *   get:
 *     summary: Get document count by notary field for a specified period
 *     description: Retrieve the number of documents created for a given period, grouped by notary fields. Only admins can access this information.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, current_week, current_month, current_year]
 *         required: true
 *         description: The period to filter documents by
 *     responses:
 *       "200":
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       enum: [today, current_week, current_month, current_year]
 *                       example: "daily"
 *                     totals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fieldName:
 *                             type: string
 *                             example: "Example Notary Field"
 *                           count:
 *                             type: integer
 *                             example: 5
 *                 previousPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: "previous_daily"
 *                     totals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fieldName:
 *                             type: string
 *                             example: "Example Notary Field"
 *                           count:
 *                             type: integer
 *                             example: 3
 *       "400":
 *         description: Bad Request - Invalid period parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 *       "401":
 *         description: Unauthorized access - invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden - the user doesn't have access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not found - endpoint does not exist
 */

/**
 * @swagger
 * /admin/metrics/employees/count:
 *   get:
 *     summary: Get the count of employees with role 'notary'
 *     description: Retrieve the total number of employees with the role of 'notary'.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notaryCount:
 *                   type: integer
 *                   description: The number of employees with the role 'notary'
 *                   example: 10
 *       "401":
 *         description: Unauthorized access - invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden - the user doesn't have access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not found - endpoint does not exist
 */

/**
 * @swagger
 * /admin/metrics/employees/list:
 *   get:
 *     summary: Get a paginated list of employees with role 'notary' and 'secretary'
 *     description: Retrieve a list of employees with the role of 'notary' and 'secretary', including pagination and sorting options.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by in the form of `field:asc` or `field:desc` (e.g., `name:asc`, `email:desc`)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Maximum number of employees per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       "200":
 *         description: Successful retrieval of employee list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalResults:
 *                   type: integer
 *                   example: 50
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
 * /admin/metrics/sessions/{period}:
 *   get:
 *     summary: Get session count and growth percent for a specified period
 *     description: Retrieve session count and growth percentage based on the specified period. Only admins can access this information.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, current_week, current_month, current_year]
 *         required: true
 *         description: The period to retrieve session metrics for
 *     responses:
 *       "200":
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       enum: [today, current_week, current_month, current_year]
 *                       example: "daily"
 *                     sessionCount:
 *                       type: integer
 *                       example: 15
 *                 previousPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: "previous_daily"
 *                     sessionCount:
 *                       type: integer
 *                       example: 10
 *                 growthPercent:
 *                   type: number
 *                   example: 50
 *       "400":
 *         description: Bad Request - Invalid period parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 *       "401":
 *         description: Unauthorized access - invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden - the user doesn't have access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not found - endpoint does not exist
 */

/**
 * @swagger
 * /admin/metrics/payments/{period}:
 *   get:
 *     summary: Get total payment value and growth percent for a specified period
 *     description: Retrieve the total value of payments and growth percentage based on the specified period. Only admins can access this information.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, current_week, current_month, current_year]
 *         required: true
 *         description: The period to retrieve payment metrics for
 *     responses:
 *       "200":
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: "today"
 *                     totalAmount:
 *                       type: number
 *                       example: 1000
 *                 previousPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: "previous_today"
 *                     totalAmount:
 *                       type: number
 *                       example: 800
 *                 growthPercent:
 *                   type: number
 *                   example: 25
 *       "400":
 *         description: Bad Request - Invalid period parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BadRequest'
 *       "401":
 *         description: Unauthorized access - invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden - the user doesn't have access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not found - endpoint does not exist
 */

/**
 * @swagger
 * /admin/metrics/payments/{period}/service:
 *   get:
 *     summary: Get total payment value by service
 *     description: Retrieve the total value of payments created by service for a given period. Only admins can access this information.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, current_week, current_month, current_year]
 *         required: true
 *         description: The period to filter payments by
 *     responses:
 *       "200":
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       enum: [today, current_week, current_month, current_year]
 *                       example: "daily"
 *                     totals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           serviceName:
 *                             type: string
 *                             example: "Example Notarization Service"
 *                           totalAmount:
 *                             type: number
 *                             example: 1000
 *                 previousPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: "previous_daily"
 *                     totals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           serviceName:
 *                             type: string
 *                             example: "Example Notarization Service"
 *                           totalAmount:
 *                             type: number
 *                             example: 900
 *       "401":
 *         description: Unauthorized access - invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden - the user doesn't have access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not found - endpoint does not exist
 */

/**
 * @swagger
 * /admin/metrics/payments/{period}/field:
 *   get:
 *     summary: Get total payment value by notarization field
 *     description: Retrieve the total value of payments created by notarization field for a given period. Only admins can access this information.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, current_week, current_month, current_year]
 *         required: true
 *         description: The period to filter payments by
 *     responses:
 *       "200":
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       enum: [today, current_week, current_month, current_year]
 *                       example: "daily"
 *                     totals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fieldName:
 *                             type: string
 *                             example: "Example Notarization Field"
 *                           totalAmount:
 *                             type: number
 *                             example: 5000
 *                 previousPeriod:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: "previous_daily"
 *                     totals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fieldName:
 *                             type: string
 *                             example: "Example Notarization Field"
 *                           totalAmount:
 *                             type: number
 *                             example: 4500
 *       "401":
 *         description: Unauthorized access - invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden - the user doesn't have access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not found - endpoint does not exist
 */

/**
 * @swagger
 * /admin/metrics/export/{period}:
 *   get:
 *     summary: Export metrics to Excel file
 *     description: Export metrics data to an Excel file for the specified period. Only admins can access this information.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, current_week, current_month, current_year]
 *         required: true
 *         description: The period to export metrics data for
 *     responses:
 *       "200":
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Metrics data exported successfully
 *       "400":
 *         description: Bad Request - Invalid period parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request parameters
 *                 error:
 *                   type: string
 *                   example: BadRequest
 *       "401":
 *         description: Unauthorized access - invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden - the user doesn't have access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not found - endpoint does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/InternalServerError'
 */
