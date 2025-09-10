const { queryChats } = require('../models');

const getChats = async (req, res) => {
  const chats = await queryChats();
  res.json(chats);
};

module.exports = { getChats };