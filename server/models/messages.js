const db = require('../database/db');

const getMessagesByChatId = async (chatId) => {
  const [rows] = await db.query(
    'SELECT id, role, content, created_at FROM messages WHERE chat_id = ? ORDER BY id ASC',
    [chatId]
  );
  return rows.map(({ id, role, content, created_at }) => ({ id, role, content, created_at }));
};

const createMessage = async (chatId, role, content) => {
  const [result] = await db.query(
    'INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)',
    [chatId, role, content]
  );
  return result.insertId;
};

module.exports = { getMessagesByChatId, createMessage };