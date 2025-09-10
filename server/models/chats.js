const db = require('../database/db');

const queryChats = async () => {
  const [rows] = await db.query('SELECT * FROM chats');
  return rows;
};

module.exports = { queryChats };