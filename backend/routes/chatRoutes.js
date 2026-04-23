const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createChat, getChats, updateChat, deleteChat } = require('../controllers/chatController');

router.use(authMiddleware);
router.route('/').get(getChats).post(createChat);
router.route('/:id').put(updateChat).delete(deleteChat);

module.exports = router;
