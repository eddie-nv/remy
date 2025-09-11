const { queryChats, createChat, touchChat } = require('../models/chats');
const { getMessagesByChatId, createMessage } = require('../models/messages');
const { generateRecipeJSON, generateRecipeJSONWithContext } = require('./ai');
const { scrapeRecipeFromUrl } = require('../scaper/recipe');
const db = require('../database/db');

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

    // Optional: detect @link and scrape recipe for context
    let aiText;
    const atLinkMatch = text.match(/(?:^|\s)@(?<url>https?:\/\/\S+)/i);
    console.log('atLinkMatch', atLinkMatch);
    if (atLinkMatch?.groups?.url) {
      try {
        console.log('scraping recipe from url', atLinkMatch.groups.url);
        const scraped = await scrapeRecipeFromUrl(atLinkMatch.groups.url);
        aiText = await generateRecipeJSONWithContext(text, scraped);
      } catch (e) {
        console.error('error scraping recipe from url', e);
        aiText = await generateRecipeJSON(text);
      }
    } else {
      aiText = await generateRecipeJSON(text);
    }

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

// Update a prior user message, remove later messages, regenerate assistant reply
const resendFromMessage = async (req, res) => {
  const { chatId: rawChatId, messageId: rawMessageId, content } = req.body || {};
  const chatId = Number(rawChatId);
  const messageId = Number(rawMessageId);
  if (!chatId || !messageId) return res.status(400).json({ error: 'chatId and messageId are required' });
  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'content is required' });
  }
  const text = content.trim();

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Only allow updating user messages
    const [updateRes] = await conn.query(
      'UPDATE messages SET content = ? WHERE id = ? AND chat_id = ? AND role = "user"',
      [text, messageId, chatId]
    );
    if (!updateRes.affectedRows) {
      throw new Error('Message not found or not a user message');
    }

    // Delete all messages after this one in this chat
    await conn.query('DELETE FROM messages WHERE chat_id = ? AND id > ?', [chatId, messageId]);

    // Regenerate assistant response for the updated message
    const aiText = await generateRecipeJSON(text);
    await conn.query('INSERT INTO messages (chat_id, role, content) VALUES (?, "assistant", ?)', [chatId, aiText]);

    // Touch chat updated_at
    await conn.query('UPDATE chats SET updated_at = NOW() WHERE id = ?', [chatId]);

    await conn.commit();

    // Return the latest messages
    const messages = await getMessagesByChatId(chatId);
    return res.json({ chatId, messages });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: 'Failed to resend message' });
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { getChats, getChatById, postChat, resendFromMessage };


