## Remy

A store‑savvy recipe buddy that turns your ideas into clear, shoppable recipes. Chat your cravings, get a structured recipe, and organize what you need.

### What it does
- **Chat to cook**: Ask for a dish or vibe and get a complete, structured recipe.
- **Clean structure**: Recipes follow a strict JSON schema for consistency.
- **Save and browse**: Manage recipes and build shopping lists.
- **Store context**: Optional product scraping to align ingredients to what’s in stock.

### Quick start
1. Install dependencies:
```bashs on port 3000 and serves `client/dist`.
- **client-dev**: builds the React app with webpack in watch mode.
- **build**: production build of the client.

### Environment
Set these in `.env`:
- `DB_HOST` — database host
- `DB_USER` — database user
- `DB_PASSWORD` — database password
- `DB_NAME` — database name
- `OPENAI_API_KEY` — OpenAI key for recipe generation

### API peek
- `POST /api/ai` — `{ prompt }` → `{ content }` where `content` is the recipe JSON.
- `GET /api/chats` — list chats; `?chatId=` to fetch a single chat.
- `POST /api/chats` — create a chat.
- `POST /api/chats/resend` — regenerate from a message.
- `GET /api/recipes` — list recipes.
- `GET /api/recipes/:id` — get a recipe.
- `PUT /api/recipes/:id` — update a recipe.
- `POST /api/recipes` — create a recipe.
- `GET /api/scrape` — fetch store products (when configured).

### Tech stack
- React 19 + Mantine UI
- Express 5
- OpenAI SDK
- MySQL via `mysql2`
- Webpack 5
- Playwright 

### Project layout
- `client/src/` — React app (Chat, Recipes, Shopping Lists).
- `client/dist/` — built bundle and `index.html`.
- `server/` — Express server, routes, controllers, database files.

### Notes
- Static assets are served from `client/dist`; ensure `client-dev` is running so `bundle.js` exists.
- The recipe generator returns strictly valid JSON matching the app’s schema, making it easy to store and render.