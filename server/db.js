import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
export const dataDir = path.join(root, 'data')
export const uploadDir = path.join(root, 'uploads')
const jsonFile = path.join(dataDir, 'db.json')
const sqliteFile = path.join(dataDir, 'shop.db')
const KEYS = ['users', 'orders', 'products', 'reviews', 'leads', 'heroSlides', 'guarantee', 'smsLog', 'shipping']

let sqlite

function empty() {
  return {
    users: [],
    orders: [],
    products: [],
    reviews: [],
    leads: [],
    heroSlides: [],
    guarantee: null,
    smsLog: [],
    shipping: null,
  }
}

export function ensureDirs() {
  fs.mkdirSync(dataDir, { recursive: true })
  fs.mkdirSync(uploadDir, { recursive: true })
}

function open() {
  if (sqlite) return sqlite
  ensureDirs()
  sqlite = new DatabaseSync(sqliteFile)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
  migrateJson()
  return sqlite
}

function migrateJson() {
  if (!fs.existsSync(jsonFile)) return
  const count = sqlite.prepare('SELECT COUNT(*) AS n FROM kv').get().n
  if (count) return
  try {
    const parsed = { ...empty(), ...JSON.parse(fs.readFileSync(jsonFile, 'utf8')) }
    save(parsed)
    fs.renameSync(jsonFile, path.join(dataDir, 'db.json.bak'))
  } catch {
    /* keep empty sqlite */
  }
}

export function load() {
  const db = empty()
  const rows = open().prepare('SELECT key, value FROM kv').all()
  for (const row of rows) {
    try {
      db[row.key] = JSON.parse(row.value)
    } catch {
      /* skip bad row */
    }
  }
  return db
}

export function save(db) {
  const conn = open()
  const upsert = conn.prepare(
    'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  )
  conn.exec('BEGIN')
  try {
    for (const key of KEYS) {
      const fallback = key === 'guarantee' || key === 'shipping' ? null : []
      upsert.run(key, JSON.stringify(db[key] ?? fallback))
    }
    conn.exec('COMMIT')
  } catch (err) {
    conn.exec('ROLLBACK')
    throw err
  }
}

export function update(mutator) {
  const db = load()
  const result = mutator(db)
  save(db)
  return result
}
