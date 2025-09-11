const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

const delay = ms => new Promise(res => setTimeout(res, ms));

const autoScroll = async (page, { step = 1000, pause = 300, maxScrolls = 60 } = {}) => {
  let lastHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let i = 0; i < maxScrolls; i++) {
    await page.evaluate(y => window.scrollBy(0, y), step);
    await delay(pause);
    const newHeight = await page.evaluate(() => document.body.scrollHeight);
    if (newHeight === lastHeight) break;
    lastHeight = newHeight;
  }
};

const buildUrl = (base, pageNum) => {
  if (pageNum === 1) return `${base}/home/products/category/food-8`;
  const q = encodeURIComponent(JSON.stringify({ page: pageNum }));
  return `${base}/home/products/category/food-8?filters=${q}`;
};

const extractProductsOnPage = async (page, selector) => {
  const { fragment, items } = await page.evaluate(sel => {
    const getText = el => el ? el.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() : null;

    const root = document.querySelector(sel);
    if (!root) return { fragment: null, items: [] };

    const clone = root.cloneNode(true);
    clone.querySelectorAll('script,style,noscript').forEach(n => n.remove());
    const fragment = clone.outerHTML;

    const cards = root.querySelectorAll('[class*="ProductCard_card__"]');
    const items = [];

    const pushIfValid = (category, name, unit) => {
      if (category && name && unit) items.push({ category, name, unit });
    };

    if (cards.length) {
      cards.forEach(card => {
        const category = getText(card.querySelector('.ProductCard_card__category__Hh3rT'));
        const name = getText(card.querySelector('.ProductCard_card__title__301JH'));
        const unit = getText(card.querySelector('.ProductPrice_productPrice__unit__2jvkA'));
        pushIfValid(category, name, unit);
      });
    } else {
      root.querySelectorAll('.ProductCard_card__title__301JH').forEach(titleEl => {
        const card = titleEl.closest('*[class*="ProductCard_card__"]') || root;
        const category = getText(card.querySelector('.ProductCard_card__category__Hh3rT'));
        const name = getText(titleEl);
        const unit = getText(card.querySelector('.ProductPrice_productPrice__unit__2jvkA'));
        pushIfValid(category, name, unit);
      });
    }
    return { fragment, items };
  }, selector);

  return { fragment, items };
};

const isToday = (mtimeMs) => {
  const d = new Date(mtimeMs);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth() === now.getMonth() &&
         d.getDate() === now.getDate();
};

const scrapeProducts = async (opts = {}) => {
  const base = 'https://www.traderjoes.com';
  const selector = opts.selector || process.env.SELECTOR || '.ProductList_productList__list__3-dGs';
  const startPage = Number(opts.startPage ?? process.env.START_PAGE ?? 1);
  const endPage = Number(opts.endPage ?? process.env.END_PAGE ?? 123);
  const force = Boolean(opts.force ?? (process.env.FORCE === '1'));

  const outDir = path.join(__dirname, 'output');
  const jsonTmp = path.join(outDir, 'products.json.tmp');
  const jsonFile = path.join(outDir, 'products.json');
  const userDataDir = path.join(__dirname, '.user-data');

  const isHeadless = Boolean(opts.headless ?? (process.env.HEADLESS === '1'));
  const proxyServer = opts.proxy || process.env.PROXY;
  const userAgent =
    opts.userAgent ||
    process.env.USER_AGENT ||
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  await fs.ensureDir(outDir);
  await fs.ensureDir(userDataDir);

  if (!force) {
    try {
      const stats = await fs.stat(jsonFile);
      if (isToday(stats.mtimeMs)) {
        const cached = await fs.readJson(jsonFile);
        return cached;
      }
    } catch {}
  }

  let context;
  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: isHeadless,
      proxy: proxyServer ? { server: proxyServer } : undefined,
      userAgent,
      viewport: { width: 1366, height: 900 },
      locale: 'en-US',
      timezoneId: 'America/Los_Angeles',
      bypassCSP: true,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
      Object.defineProperty(navigator, 'language', { get: () => 'en-US' });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (param) {
        if (param === 37445) return 'Intel Inc.';
        if (param === 37446) return 'Intel Iris OpenGL Engine';
        return getParameter.apply(this, [param]);
      };
    });

    const page = await context.newPage();
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
    });

    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await delay(700);

    const seen = new Set();
    const all = [];
    let emptyReached = false;

    for (let p = startPage; p <= endPage; p++) {
      const url = buildUrl(base, p);
      let attempt = 0, success = false;

      while (attempt < 3 && !success) {
        attempt++;
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await autoScroll(page);
          await page.waitForSelector(selector, { state: 'attached', timeout: 30000 });

          const { items } = await extractProductsOnPage(page, selector);

          if (!items.length) {
            emptyReached = true;
            success = true;
            break;
          }

          let added = 0;
          for (const it of items) {
            const key = `${it.name}||${it.unit}`;
            if (!seen.has(key)) {
              seen.add(key);
              all.push(it);
              added++;
            }
          }

          success = true;
        } catch (e) {
          if (attempt >= 3) throw e;
          await delay(1500 + Math.random() * 1000);
        }
      }

      if (emptyReached) break;
      await delay(400 + Math.random() * 400);
    }

    await fs.writeJson(jsonTmp, all, { spaces: 2 });
    await fs.move(jsonTmp, jsonFile, { overwrite: true });

    return all;
  } finally {
    if (context) await context.close();
  }
};

if (require.main === module) {
  scrapeProducts().then(data => {
    console.log(`Scraped ${data.length} products`);
  }).catch(err => {
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  });
}

module.exports = { scrapeProducts };