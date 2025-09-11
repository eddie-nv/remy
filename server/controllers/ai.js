
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = 'You are Remy, a helpful cooking assistant. Keep answers concise, practical, and actionable.';

const generateAssistantReply = async (messages) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.7,
  });
  const content = completion.choices?.[0]?.message?.content?.trim() || '';
  return content;
};

const postAI = async (req, res) => {
  try {
    const { messages, prompt } = req.body || {};
    let msgs = Array.isArray(messages) ? messages : [];
    if (prompt && (!msgs.length || msgs[msgs.length - 1]?.role !== 'user')) {
      msgs = [...msgs, { role: 'user', content: String(prompt) }];
    }
    const content = await generateAssistantReply(msgs);
    res.json({ content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI generation failed' });
  }
};

module.exports = { postAI, generateAssistantReply };


// // server/controllers/ai.js
// import OpenAI from "openai";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export const generateRecipe = async (req, res) => {
// 	try {
// 		const { prompt } = req.body;

// 		const schema = {
// 			type: "object",
// 			additionalProperties: false,
// 			required: ["kind", "textBefore", "recipe", "textAfter"],
// 			properties: {
// 				kind: { const: "recipe" },
// 				textBefore: { type: "string" },
// 				textAfter: { type: "string" },
// 				recipe: {
// 					type: "object",
// 					additionalProperties: false,
// 					required: ["name", "description", "ingredients", "steps"],
// 					properties: {
// 						name: { type: "string" },
// 						description: { type: "string" },
// 						servings: { type: "integer", minimum: 1 },
// 						totalTimeMinutes: { type: "integer", minimum: 0 },
// 						ingredients: {
// 							type: "array",
// 							items: {
// 								type: "object",
// 								additionalProperties: false,
// 								required: ["name", "quantity", "unit"],
// 								properties: {
// 									name: { type: "string" },
// 									quantity: { type: "number" },
// 									unit: { type: "string" }
// 								}
// 							}
// 						},
// 						steps: { type: "array", items: { type: "string" } },
// 						tags: { type: "array", items: { type: "string" } },
// 						notes: { type: "string" }
// 					}
// 				}
// 			}
// 		};

// 		const completion = await openai.chat.completions.create({
// 			model: "gpt-4o-mini",
// 			response_format: {
// 				type: "json_schema",
// 				json_schema: { name: "recipe_payload", schema, strict: true }
// 			},
// 			messages: [
// 				{
// 					role: "system",
// 					content: "You are a helpful chef. Return strictly valid JSON that matches the provided schema. No code fences."
// 				},
// 				{
// 					role: "user",
// 					content: `Create a recipe from scratch from this request. Keep textBefore and textAfter short and conversational.\nRequest: ${prompt}`
// 				}
// 			],
// 			temperature: 0.7
// 		});

// 		const raw = completion.choices[0]?.message?.content ?? "{}";
// 		const data = JSON.parse(raw);
// 		res.json(data);
// 	} catch (err) {
// 		console.error(err);
// 		res.status(500).json({ error: "Failed to generate recipe" });
// 	}
// };