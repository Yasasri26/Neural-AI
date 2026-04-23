const Chat = require('../models/Chat');

const createChat = async (req, res, next) => {
  try {
    const title = req.body.title || 'New Chat';
    const userId = req.user.id;
    const result = await Chat.create(userId, title);
    
    const insertId = result.insertId;
    const chatData = await Chat.getById(insertId, userId);
    res.status(201).json({ success: true, data: chatData });
  } catch (err) { next(err); }
};

const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.getByUserId(req.user.id);
    res.status(200).json({ success: true, count: chats.length, data: chats });
  } catch (err) { next(err); }
};

const updateChat = async (req, res, next) => {
  try {
    const { title } = req.body;
    await Chat.updateTitle(req.params.id, req.user.id, title);
    res.status(200).json({ success: true });
  } catch (err) { next(err); }
};

const deleteChat = async (req, res, next) => {
  try {
    await Chat.delete(req.params.id, req.user.id);
    res.status(200).json({ success: true, deletedId: req.params.id });
  } catch (err) { next(err); }
};

module.exports = { createChat, getChats, updateChat, deleteChat };
