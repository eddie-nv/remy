const { queryChats, createChat, touchChat } = require('../models/chats');
const { getMessagesByChatId, createMessage } = require('../models/messages');
const { generateRecipeJSON } = require('./ai');

const getChats = async (req, res) => {
  const chats = await queryChats();
  res.json(chats);
};

const getChatById = async (req, res) => {
  const chatId = Number(req.query.chatId);
  if (!chatId) return res.status(400).json({ error: 'chatId is required' });
  const messages = await getMessagesByChatId(chatId);
  res.json({ chatId, messages });
};

const postChat = async (req, res) => {
  try {
    const { chatId: rawChatId, content } = req.body || {};
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'content is required' });
    }
    const text = content.trim();
    const chatId = rawChatId ? Number(rawChatId) : null;

    let targetChatId = chatId;
    if (!targetChatId) {
      const title = text.slice(0, 60) || 'New chat';
      targetChatId = await createChat(title);
    }

    await createMessage(targetChatId, 'user', text);

    // Generate recipe as stringified JSON and store as assistant message
    const aiText = await generateRecipeJSON(text);
    await createMessage(targetChatId, 'assistant', aiText);
    await touchChat(targetChatId);

    const messages = await getMessagesByChatId(targetChatId);
    const status = chatId ? 200 : 201;
    return res.status(status).json({ chatId: targetChatId, messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to post chat' });
  }
};

module.exports = { getChats, getChatById, postChat };