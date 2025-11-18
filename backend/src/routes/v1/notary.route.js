const express = require('express');
const auth = require('../../middlewares/auth');
const { notaryController } = require('../../controllers');

const router = express.Router();

router.get('/metrics/processing', auth('notaryDashboard'), notaryController.getProcessingSessionsDocuments);

router.get('/metrics/digitalSignature', auth('notaryDashboard'), notaryController.getSignatureSessionsDocuments);

router.get('/metrics/notaryApprovals', auth('notaryDashboard'), notaryController.getNotaryApproved);

router.get('/metrics/acceptanceRate', auth('notaryDashboard'), notaryController.getAcceptanceRate);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Notary Dashboard
 *   description: Notary management
 */

/**
 * @swagger
 * /notary/metrics/processing:
 *   get:
 *     summary: Get total combined session and document counts for "processing" status
 *     description: Retrieve the total combined counts of sessions and documents (from the beginning until now) with "processing" status, and the percentage change between the current month and the previous month. Accessible only to notary.
 *     tags: [Notary Dashboard]
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
 *                 total:
 *                   type: integer
 *                   description: Total count of sessions and documents with "processing" status
 *                   example: 1200
 *                 growthPercent:
 *                   type: number
 *                   description: Growth percentage of the total sessions and documents between the current month and previous month
 *                   example: 11.11
 *       "401":
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 *       "500":
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /notary/metrics/digitalSignature:
 *   get:
 *     summary: Get total combined session and document counts for "digitalSignature" status
 *     description: Retrieve the total combined counts of sessions and documents (from the beginning until now) with "digitalSignature" status, and the amount change between today and yesterday. Accessible only to notary.
 *     tags: [Notary Dashboard]
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
 *                 total:
 *                   type: integer
 *                   description: Total count of sessions and documents with "digitalSignature" status
 *                   example: 1200
 *                 change:
 *                   type: number
 *                   description: Growth percentage of the total sessions and documents between today and yesterday
 *                   example: 11
 *       "401":
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 *       "500":
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /notary/metrics/notaryApprovals:
 *   get:
 *     summary: Get total approved sessions and documents for notary
 *     description: Retrieve the total count of approved sessions and documents for the notary, including growth percentage between the current month and the previous month. Accessible only to notary users.
 *     tags: [Notary Dashboard]
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
 *                 total:
 *                   type: integer
 *                   description: Total approved sessions and documents from the beginning until now
 *                   example: 1500
 *                 growthPercent:
 *                   type: number
 *                   description: Growth percentage of approved sessions and documents between the current and previous months
 *                   example: 25.50
 *       "401":
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 *       "500":
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /notary/metrics/acceptanceRate:
 *   get:
 *     summary: Get total approved sessions and documents for notary
 *     description: Retrieve the acceptance rate of approved sessions and documents for the notary, including the percentage between the current week and the previous week. Accessible only to notary.
 *     tags: [Notary Dashboard]
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
 *                 acceptanceRate:
 *                   type: integer
 *                   description: Acceptance rate of approved sessions and documents
 *                   example: 97
 *                 growthPercent:
 *                   type: number
 *                   description: Percentage of approved sessions and documents between the current and previous week
 *                   example: 25.50
 *       "401":
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 *       "500":
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/InternalServerError'
 */
