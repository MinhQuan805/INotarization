const express = require('express');
const userWalletController = require('../../controllers/userWallet.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: UserWallet
 *   description: UserWallet management and retrieval
 */

/**
 * @swagger
 * /userWallet/wallet:
 *   get:
 *     summary: Get user wallet
 *     tags: [UserWallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserWallet'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /userWallet/wallet/transfer:
 *   post:
 *     summary: Transfer a specific amount of an NFT from the user's wallet to another user
 *     tags: [UserWallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionHash
 *               - toUserEmail
 *               - amount
 *             properties:
 *               transactionHash:
 *                 type: string
 *                 description: The transaction hash of the NFT to transfer
 *               toUserEmail:
 *                 type: string
 *                 description: The email of the recipient
 *               amount:
 *                 type: number
 *                 description: The amount of NFTs to transfer
 *             example:
 *               transactionHash: '0x06c1e35477e2f84f17fb64cb37779c173dd04033150a4903c74ff23ced618f60'
 *               toUserEmail: 'truonglevinhphuc2006@gmail.com'
 *               amount: 2
 *     responses:
 *       "200":
 *         description: NFT transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: NFT transferred successfully
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
 * /userWallet/wallet/purchase:
 *   post:
 *     summary: Purchase a document and add it to the user's wallet
 *     tags: [UserWallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - amount
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: The ID of the document to purchase
 *               amount:
 *                 type: number
 *                 description: The amount of the document to purchase
 *             example:
 *               itemId: '60f1b8b4c0b4f00015e7f8f2'
 *               amount: 1
 *     responses:
 *       "200":
 *         description: Document purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Document purchased successfully
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
 * @route GET /userWallet/wallet
 * @desc Get user wallet
 */
router.route('/wallet').get(auth('getWallet'), userWalletController.getWallet);

/**
 * @route POST /userWallet/wallet/transfer
 * @desc Transfer a specific amount of an NFT to another user
 */
router.route('/wallet/transfer').post(auth('transferNFT'), userWalletController.transferNFT);

/**
 * @route POST /userWallet/wallet/purchase
 * @desc Purchase a document and add it to the user's wallet
 */
router.route('/wallet/purchase').post(auth('purchaseDocument'), userWalletController.purchaseDocument);

module.exports = router;
