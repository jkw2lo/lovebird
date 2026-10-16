// Keeps your plan and photos as ordinary files in ./data, so they survive the
// browser clearing its storage and are there no matter which browser you open.
// The browser keeps its own copy too, so the app still works if this is offline.
//
//   data/plan.json             the whole plan
//   data/photos/<id>           photos, one file each
//   data/history/<date>.json   the plan as it was at the start of each day (last 30 kept)
//
// data/ is in .gitignore: it is your private wedding info and never goes to GitHub.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const MAX_PLAN_BYTES = 20 * 1024 * 1024;
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const KEEP_DAYS = 30;

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('Too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Write to a temp file and rename, so a crash mid-write never leaves a half-written plan.
async function writeAtomic(file, data) {
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, file);
}

async function snapshotToday(dir, planFile) {
  const day = new Date().toISOString().slice(0, 10);
  const historyDir = path.join(dir, 'history');
  const target = path.join(historyDir, `${day}.json`);
  try { await fs.access(target); return; } catch { /* not yet today */ }
  try {
    await fs.mkdir(historyDir, { recursive: true });
    await fs.copyFile(planFile, target);
    const old = (await fs.readdir(historyDir)).filter((f) => f.endsWith('.json')).sort().slice(0, -KEEP_DAYS);
    await Promise.all(old.map((f) => fs.unlink(path.join(historyDir, f))));
  } catch { /* first save: nothing to snapshot */ }
}

// Other websites open in the same browser can send requests to localhost too.
// Only answer the app itself.
export function fromThisApp(req) {
  const site = req.headers['sec-fetch-site'];
  if (site && site !== 'same-origin' && site !== 'none') return false;
  const origin = req.headers.origin;
  if (origin) {
    try { if (new URL(origin).host !== req.headers.host) return false; } catch { return false; }
  }
  return true;
}

export function storage(dataDir) {
  const planFile = path.join(dataDir, 'plan.json');
  const photoDir = path.join(dataDir, 'photos');
  const safeId = (id) => /^[\w.-]{1,120}$/.test(id) && !id.startsWith('.');

  const handler = async (req, res, next) => {
    const url = new URL(req.url, 'http://x');
    if (!url.pathname.startsWith('/api/')) return next();
    if (!fromThisApp(req)) { res.statusCode = 403; res.end(); return; }
    try {
      if (url.pathname === '/api/plan') {
        if (req.method === 'GET') {
          try {
            res.setHeader('Content-Type', 'application/json');
            res.end(await fs.readFile(planFile));
          } catch {
            res.statusCode = 404;
            res.end('{}');
          }
          return;
        }
        if (req.method === 'PUT') {
          const body = await readBody(req, MAX_PLAN_BYTES);
          JSON.parse(body.toString('utf8')); // refuse anything that isn't valid JSON
          await fs.mkdir(dataDir, { recursive: true });
          await snapshotToday(dataDir, planFile);
          await writeAtomic(planFile, body);
          res.end('{"ok":true}');
          return;
        }
      }

      if (url.pathname === '/api/photos' && req.method === 'GET') {
        let ids = [];
        try { ids = (await fs.readdir(photoDir)).filter(safeId); } catch { /* none yet */ }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(ids));
        return;
      }

      const photo = url.pathname.match(/^\/api\/photos\/([^/]+)$/);
      if (photo) {
        const id = decodeURIComponent(photo[1]);
        if (!safeId(id)) { res.statusCode = 400; res.end(); return; }
        const file = path.join(photoDir, id);
        if (req.method === 'GET') {
          try {
            const data = await fs.readFile(file);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
            res.end(data);
          } catch {
            res.statusCode = 404;
            res.end();
          }
          return;
        }
        if (req.method === 'PUT') {
          const body = await readBody(req, MAX_PHOTO_BYTES);
          await fs.mkdir(photoDir, { recursive: true });
          await writeAtomic(file, body);
          res.end('{"ok":true}');
          return;
        }
      }
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
    next();
  };

  return {
    name: 'lovebird-storage',
    configureServer(server) { server.middlewares.use(handler); },
    configurePreviewServer(server) { server.middlewares.use(handler); },
  };
}
