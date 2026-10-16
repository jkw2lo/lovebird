// IndexedDB: one record for the whole plan, plus a store for photos.
// Everything stays in this browser on this computer.

const DB_NAME = 'lovebird';
let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('images')) db.createObjectStore('images', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function promisify(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function store(name, mode = 'readonly') {
  return (await openDb()).transaction(name, mode).objectStore(name);
}

export async function loadState() {
  return promisify((await store('kv')).get('state'));
}

export async function saveState(state) {
  return promisify((await store('kv', 'readwrite')).put(state, 'state'));
}

export async function putImage(record) {
  await promisify((await store('images', 'readwrite')).put(record));
  return record.id;
}

export async function getImage(id) {
  return promisify((await store('images')).get(id));
}

export async function getAllImages() {
  return promisify((await store('images')).getAll());
}

export async function deleteImage(id) {
  return promisify((await store('images', 'readwrite')).delete(id));
}

export async function clearAll() {
  const db = await openDb();
  const tx = db.transaction(['kv', 'images'], 'readwrite');
  tx.objectStore('kv').clear();
  tx.objectStore('images').clear();
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
