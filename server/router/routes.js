const router = require('express').Router();
const { getChats, getChatById, postChat } = require('../controllers/chats');
const { postAI } = require('../controllers/ai');
const { getStoreProducts } = require('../controllers/scrape');

router.get('/chats', (req, res, next) => {
  if (req.query.chatId) return getChatById(req, res, next);
  return getChats(req, res, next);
});
router.post('/chats', postChat);
router.post('/ai', postAI);
router.get('/scrape', getStoreProducts);

module.exports = router;