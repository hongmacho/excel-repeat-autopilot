import 'server-only'

import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import path from 'path'

let db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data.db')
    const sqlite = new Database(dbPath)
    db = drizzle(sqlite, { schema })
  }
  return db
}

export type Database = ReturnType<typeof getDb>
