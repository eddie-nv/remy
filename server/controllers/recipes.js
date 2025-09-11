// server/controllers/recipes.js
const db = require('../database/db');
const { createRecipe, insertIngredients, insertSteps, queryRecipes, getRecipeFullById, updateRecipe } = require('../models/recipes');

const normalizeString = (v) => {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
};

const getRecipes = async (req, res) => {
  try {
    const recipes = await queryRecipes();
    return res.json(recipes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get recipes' });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id is required' });
    const recipe = await getRecipeFullById(id);
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    return res.json(recipe);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get recipe' });
  }
};

const postRecipe = async (req, res) => {
  const raw = req.body?.recipe || {};
  const name = normalizeString(raw.name);
  if (!name) return res.status(400).json({ error: 'name is required' });

  const description = normalizeString(raw.description);
  const servings = Number.isFinite(raw.servings) ? Number(raw.servings) : null;
  const totalTimeMinutes = Number.isFinite(raw.totalTimeMinutes) ? Number(raw.totalTimeMinutes) : null;
  const imageUrl = normalizeString(raw.imageUrl);
  const url = normalizeString(raw.url);
  const sourceChatId = Number.isFinite(raw.sourceChatId) ? Number(raw.sourceChatId) : null;

  const tags = Array.isArray(raw.tags) ? raw.tags.filter(Boolean) : [];
  const notes = normalizeString(raw.notes);

  const ingredients = Array.isArray(raw.ingredients) ? raw.ingredients : [];
  const steps = Array.isArray(raw.steps) ? raw.steps : [];

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const recipeId = await createRecipe(conn, {
      name,
      description,
      servings,
      totalTimeMinutes,
      imageUrl,
      url,
      sourceChatId,
      tags,
      notes,
    });

    await insertIngredients(conn, recipeId, ingredients);
    await insertSteps(conn, recipeId, steps);

    await conn.commit();
    return res.status(201).json({ id: recipeId });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: 'Failed to save recipe' });
  } finally {
    if (conn) conn.release();
  }
};

const putRecipe = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'id is required' });

  const raw = req.body?.recipe || {};
  const name = normalizeString(raw.name);
  if (!name) return res.status(400).json({ error: 'name is required' });

  const payload = {
    name,
    description: normalizeString(raw.description),
    servings: Number.isFinite(raw.servings) ? Number(raw.servings) : null,
    totalTimeMinutes: Number.isFinite(raw.totalTimeMinutes) ? Number(raw.totalTimeMinutes) : null,
    imageUrl: normalizeString(raw.imageUrl),
    url: normalizeString(raw.url),
    sourceChatId: Number.isFinite(raw.sourceChatId) ? Number(raw.sourceChatId) : null,
    tags: Array.isArray(raw.tags) ? raw.tags.filter(Boolean) : [],
    notes: normalizeString(raw.notes),
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
    steps: Array.isArray(raw.steps) ? raw.steps : [],
  };

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    await updateRecipe(conn, id, payload);

    await conn.commit();
    return res.status(200).json({ id });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: 'Failed to update recipe' });
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { postRecipe, getRecipes, getRecipeById, putRecipe };