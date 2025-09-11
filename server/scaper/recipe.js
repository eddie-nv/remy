// server/scaper/recipe.js
const axios = require('axios');

const iso8601ToMinutes = (iso) => {
  if (!iso || typeof iso !== 'string') return null;
  const m = iso.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!m) return null;
  const days = Number(m[1] || 0);
  const hours = Number(m[2] || 0);
  const minutes = Number(m[3] || 0);
  return days * 24 * 60 + hours * 60 + minutes;
};

const coerceString = (v) => (typeof v === 'string' ? v.trim() : null);

const asArray = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

const parseLD = (json) => {
  // json can be single object, array, or @graph
  const items = [];
  const rootArr = asArray(json);
  for (const node of rootArr) {
    if (!node) continue;
    if (Array.isArray(node['@graph'])) {
      for (const g of node['@graph']) items.push(g);
    } else {
      items.push(node);
    }
  }
  // find recipe-like nodes
  const recipes = items.filter((n) => {
    const t = n['@type'];
    if (!t) return false;
    if (Array.isArray(t)) return t.includes('Recipe');
    return t === 'Recipe';
  });
  return recipes;
};

const parseInstructions = (ri) => {
  const arr = asArray(ri);
  const out = [];
  for (const step of arr) {
    if (!step) continue;
    if (typeof step === 'string') out.push(step.trim());
    else if (typeof step === 'object') {
      if (typeof step.text === 'string') out.push(step.text.trim());
      else if (typeof step.name === 'string') out.push(step.name.trim());
    }
  }
  return out.filter(Boolean);
};

const parseIngredients = (ingArr) => {
  const arr = asArray(ingArr);
  const out = [];
  for (const s of arr) {
    if (!s) continue;
    const text = typeof s === 'string' ? s.trim() : null;
    if (!text) continue;
    // Minimal parsing: keep entire string as name; quantity/unit unknown
    out.push({ name: text, quantity: null, unit: null });
  }
  return out;
};

const toTags = (obj) => {
  const tags = new Set();
  const push = (v) => {
    const s = coerceString(v);
    if (!s) return;
    s.split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => tags.add(t));
  };
  push(obj.keywords);
  push(obj.recipeCategory);
  push(obj.recipeCuisine);
  return Array.from(tags);
};

const toInt = (v) => {
  if (v == null) return null;
  const s = String(v);
  const m = s.match(/(\d+)/);
  return m ? Number(m[1]) : null;
};

const pickFirst = (...vals) => vals.find((v) => v != null && String(v).trim().length > 0) ?? null;

const mapRecipe = (r) => {
  const name = coerceString(r.name) || 'Untitled recipe';
  const description = coerceString(r.description) || null;
  const servings = toInt(pickFirst(r.recipeYield, r.yield, r.servings));
  const totalTimeMinutes = pickFirst(
    iso8601ToMinutes(r.totalTime),
    iso8601ToMinutes(r.cookTime) && iso8601ToMinutes(r.prepTime)
      ? iso8601ToMinutes(r.cookTime) + iso8601ToMinutes(r.prepTime)
      : iso8601ToMinutes(r.cookTime) || iso8601ToMinutes(r.prepTime)
  ) || null;

  const ingredients = parseIngredients(r.recipeIngredient);
  const steps = parseInstructions(r.recipeInstructions);
  const tags = toTags(r);
  const notes = coerceString(r.note) || null;

  return {
    name,
    description,
    servings,
    totalTimeMinutes,
    ingredients,
    steps,
    tags,
    notes,
  };
};

const scrapeRecipeFromUrl = async (url) => {
  const res = await axios.get(url, {
    timeout: 20000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    maxRedirects: 3,
    validateStatus: (s) => s >= 200 && s < 400,
  });
  const html = res.data || '';
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  const candidates = [];
  let m;
  while ((m = scriptRegex.exec(html)) !== null) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    try {
      const json = JSON.parse(raw);
      const recs = parseLD(json);
      for (const r of recs) candidates.push(r);
    } catch {
      // ignore invalid JSON blocks
    }
  }

  if (!candidates.length) {
    // Best-effort fallback: return minimal context; the model will generate from prompt
    return null;
  }
  // Choose the first candidate
  return mapRecipe(candidates[0]);
};

module.exports = { scrapeRecipeFromUrl };