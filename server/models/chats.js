const db = require('../database/db');

const queryChats = async () => {
  const [rows] = await db.query(
    'SELECT id, title, created_at, updated_at FROM chats ORDER BY updated_at DESC'
  );
  return rows;
};

const createChat = async (title) => {
  const [result] = await db.query('INSERT INTO chats (title) VALUES (?)', [title]);
  return result.insertId;
};

const touchChat = async (chatId) => {
  await db.query('UPDATE chats SET updated_at = NOW() WHERE id = ?', [chatId]);
};

module.exports = { queryChats, createChat, touchChat };