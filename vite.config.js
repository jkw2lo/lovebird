import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Browsers can't read other sites' pages (CORS), so the dev/preview server
// fetches a pasted link on the app's behalf and returns its title, photo and
// description. Only runs when you paste a link; nothing is stored here.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141 Safari/537.36';

function unfurl() {
  const handler = async (req, res, next) => {
    if (req.url.startsWith('/api/image')) return proxyImage(req, res);
    if (!req.url.startsWith('/api/unfurl')) return next();
    const target = new URL(req.url, 'http://x').searchParams.get('url') || '';
    res.setHeader('Content-Type', 'application/json');
    try {
      const url = new URL(target);
      if (!/^https?:$/.test(url.protocol)) throw new Error('Only web links can be previewed.');
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': UA, Accept: 'text/html' },
      });
      const html = (await response.text()).slice(0, 600_000);
      res.end(JSON.stringify(parseMeta(html, response.url || url.href)));
    } catch (err) {
      res.statusCode = 200;
      res.end(JSON.stringify({ error: err.message || String(err) }));
    }
  };
  return {
    name: 'lovebird-unfurl',
    configureServer(server) { server.middlewares.use(handler); },
    configurePreviewServer(server) { server.middlewares.use(handler); },
  };
}

// Fetches a link's photo so the app can keep its own copy (listings get taken down).
async function proxyImage(req, res) {
  try {
    const url = new URL(new URL(req.url, 'http://x').searchParams.get('url') || '');
    if (!/^https?:$/.test(url.protocol)) throw new Error('bad url');
    const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { 'User-Agent': UA, Accept: 'image/*' } });
    const type = response.headers.get('content-type') || '';
    if (!response.ok || !type.startsWith('image/')) throw new Error('not an image');
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 12_000_000) throw new Error('too large');
    res.setHeader('Content-Type', type);
    res.end(bytes);
  } catch {
    res.statusCode = 404;
    res.end();
  }
}

function decode(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ').trim();
}

function parseMeta(html, pageUrl) {
  const meta = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const key = (tag.match(/\b(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i) || [])[1];
    const content = (tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i) || [])[1];
    if (key && content && !meta[key.toLowerCase()]) meta[key.toLowerCase()] = decode(content);
  }
  const titleTag = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  const pick = (...keys) => keys.map((k) => meta[k]).find(Boolean) || '';
  const abs = (u) => { try { return u ? new URL(u, pageUrl).href : ''; } catch { return ''; } };
  const host = new URL(pageUrl).hostname.replace(/^www\./, '');
  return {
    url: pageUrl,
    title: pick('og:title', 'twitter:title') || (titleTag ? decode(titleTag) : ''),
    description: pick('og:description', 'description', 'twitter:description'),
    image: abs(pick('og:image', 'og:image:url', 'twitter:image', 'twitter:image:src')),
    siteName: pick('og:site_name') || host,
    price: pick('product:price:amount', 'og:price:amount'),
  };
}

export default defineConfig({
  plugins: [react(), unfurl()],
  server: { port: 5190 },
  build: { chunkSizeWarningLimit: 1000 },
});
