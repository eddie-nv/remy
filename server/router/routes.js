const router = require('express').Router();
const { getChats } = require('../controllers');

router.get('/chats', getChats);

module.exports = router;