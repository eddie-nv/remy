const router = require('express').Router();
const { getChats, getChatById, postChat, resendFromMessage } = require('../controllers/chats');
const { postAI } = require('../controllers/ai');
const { getStoreProducts } = require('../controllers/scrape');
const { postRecipe, getRecipes, getRecipeById, putRecipe } = require('../controllers/recipes');

router.get('/chats', (req, res, next) => {
  if (req.query.chatId) return getChatById(req, res, next);
  return getChats(req, res, next);
});
router.post('/chats', postChat);
router.post('/chats/resend', resendFromMessage);

router.post('/ai', postAI);
router.get('/scrape', getStoreProducts);

// recipes
router.get('/recipes', getRecipes);
router.get('/recipes/:id', getRecipeById);
router.put('/recipes/:id', putRecipe);
router.post('/recipes', postRecipe);

module.exports = router;