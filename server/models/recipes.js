// server/models/recipes.js
const db = require('../database/db');

const queryRecipes = async () => {
  const [rows] = await db.query(
    `SELECT
       id,
       source_chat_id,
       name,
       description,
       image_url,
       url,
       servings,
       total_time_minutes,
       tags_json,
       notes,
       created_at,
       updated_at
     FROM recipes
     ORDER BY updated_at DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    sourceChatId: r.source_chat_id,
    name: r.name,
    description: r.description,
    imageUrl: r.image_url,
    url: r.url,
    servings: r.servings,
    totalTimeMinutes: r.total_time_minutes,
    tags: r.tags_json ? JSON.parse(r.tags_json) : [],
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
};

const getRecipeFullById = async (id) => {
  const [rows] = await db.query(
    `SELECT
       id,
       source_chat_id,
       name,
       description,
       image_url,
       url,
       servings,
       total_time_minutes,
       tags_json,
       notes,
       created_at,
       updated_at
     FROM recipes
     WHERE id = ?`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;

  const [ingRows] = await db.query(
    `SELECT name, quantity, unit, ingredient_number
     FROM ingredients
     WHERE recipe_id = ?
     ORDER BY ingredient_number ASC`,
    [id]
  );
  const [stepRows] = await db.query(
    `SELECT description, step_number
     FROM steps
     WHERE recipe_id = ?
     ORDER BY step_number ASC`,
    [id]
  );

  return {
    id: row.id,
    sourceChatId: row.source_chat_id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    url: row.url,
    servings: row.servings,
    totalTimeMinutes: row.total_time_minutes,
    tags: row.tags_json ? JSON.parse(row.tags_json) : [],
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ingredients: ingRows.map(r => ({
      name: r.name,
      quantity: r.quantity == null ? null : Number(r.quantity),
      unit: r.unit || null,
    })),
    steps: stepRows.map(r => r.description),
  };
};

const createRecipe = async (conn, {
  name,
  description = null,
  servings = null,
  totalTimeMinutes = null,
  imageUrl = null,
  url = null,
  sourceChatId = null,
  tags = [],
  notes = null,
}) => {
  const [result] = await conn.query(
    `INSERT INTO recipes
      (source_chat_id, name, description, image_url, url, servings, total_time_minutes, tags_json, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sourceChatId ?? null,
      name,
      description ?? null,
      imageUrl ?? null,
      url ?? null,
      servings ?? null,
      totalTimeMinutes ?? null,
      tags.length ? JSON.stringify(tags) : null,
      notes ?? null,
    ]
  );
  return result.insertId;
};

const updateRecipe = async (conn, id, {
  name,
  description = null,
  servings = null,
  totalTimeMinutes = null,
  imageUrl = null,
  url = null,
  sourceChatId = null,
  tags = [],
  notes = null,
  ingredients = [],
  steps = [],
}) => {
  await conn.query(
    `UPDATE recipes
     SET source_chat_id = ?, name = ?, description = ?, image_url = ?, url = ?, servings = ?, total_time_minutes = ?, tags_json = ?, notes = ?, updated_at = NOW()
     WHERE id = ?`,
    [
      sourceChatId ?? null,
      name,
      description ?? null,
      imageUrl ?? null,
      url ?? null,
      servings ?? null,
      totalTimeMinutes ?? null,
      tags.length ? JSON.stringify(tags) : null,
      notes ?? null,
      id,
    ]
  );

  await conn.query(`DELETE FROM ingredients WHERE recipe_id = ?`, [id]);
  await conn.query(`DELETE FROM steps WHERE recipe_id = ?`, [id]);

  await insertIngredients(conn, id, ingredients);
  await insertSteps(conn, id, steps);
};

const insertIngredients = async (conn, recipeId, ingredients = []) => {
  if (!ingredients.length) return;
  let idx = 0;
  for (const ing of ingredients) {
    idx += 1;
    const name = (ing && typeof ing.name === 'string') ? ing.name.trim() : null;
    if (!name) continue;
    const quantity = Number.isFinite(ing.quantity) ? Number(ing.quantity) : null;
    const unit = ing.unit ? String(ing.unit).trim() : null;
    await conn.query(
      `INSERT INTO ingredients (recipe_id, name, ingredient_number, quantity, unit)
       VALUES (?, ?, ?, ?, ?)`,
      [recipeId, name, idx, quantity, unit]
    );
  }
};

const insertSteps = async (conn, recipeId, steps = []) => {
  if (!steps.length) return;
  let idx = 0;
  for (const step of steps) {
    idx += 1;
    const description = step ? String(step).trim() : null;
    if (!description) continue;
    await conn.query(
      `INSERT INTO steps (recipe_id, step_number, description)
       VALUES (?, ?, ?)`,
      [recipeId, idx, description]
    );
  }
};

module.exports = { queryRecipes, getRecipeFullById, createRecipe, updateRecipe, insertIngredients, insertSteps };