const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT =
  'You are a helpful chef. Return strictly valid JSON that matches the provided schema. No code fences.';

const RECIPE_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	required: ['kind', 'textBefore', 'recipe', 'textAfter'],
	properties: {
		kind: { type: 'string', const: 'recipe' },
		textBefore: { type: 'string' },
		textAfter: { type: 'string' },
		recipe: {
		type: 'object',
		additionalProperties: false,
		required: [
			'name',
			'description',
			'servings',
			'totalTimeMinutes',
			'ingredients',
			'steps',
			'tags',
			'notes'
		],
		properties: {
			name: { type: 'string' },
			description: { type: 'string' },
			servings: { type: 'integer', minimum: 1 },
			totalTimeMinutes: { type: 'integer', minimum: 0 },
			ingredients: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: ['name', 'quantity', 'unit'],
				properties: {
				name: { type: 'string' },
				quantity: { type: 'number' },
				unit: { type: 'string' }
				}
			}
			},
			steps: { type: 'array', items: { type: 'string' } },
			tags: { type: 'array', items: { type: 'string' } },
			notes: { type: 'string' }
		}
		}
	}
};

const generateRecipeJSON = async (prompt) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'recipe_payload', schema: RECIPE_SCHEMA, strict: true },
    },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content:
          `Create a recipe from scratch from this request. ` +
          `Keep textBefore and textAfter short and conversational.\nRequest: ${prompt}`,
      },
    ],
    temperature: 0.7,
  });

  const raw = completion.choices?.[0]?.message?.content ?? '{}';
  try {
    return JSON.stringify(JSON.parse(raw));
  } catch {
    return String(raw);
  }
};

// With scraped context: normalize the scraped recipe if present; fill missing fields as needed.
const generateRecipeJSONWithContext = async (prompt, scraped) => {
	console.log('generateRecipeJSONWithContext', prompt, scraped);
  const contextText = scraped ? JSON.stringify(scraped) : '';
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'recipe_payload', schema: RECIPE_SCHEMA, strict: true },
    },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content:
          `If SCRAPED_RECIPE is provided below, normalize it into the target schema. ` +
          `Prefer scraped values; only infer when missing. Preserve the spirit of the content. ` +
          `Keep textBefore and textAfter short and conversational.\n` +
          `REQUEST: ${prompt}\n` +
          `SCRAPED_RECIPE_JSON: ${contextText}`,
      },
    ],
    temperature: 0.4,
  });

  const raw = completion.choices?.[0]?.message?.content ?? '{}';
  try {
    return JSON.stringify(JSON.parse(raw));
  } catch {
    return String(raw);
  }
};

const postAI = async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ error: 'prompt is required' });
    }
    const content = await generateRecipeJSON(String(prompt));
    res.json({ content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI generation failed' });
  }
};

module.exports = { postAI, generateRecipeJSON, generateRecipeJSONWithContext };