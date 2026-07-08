#!/usr/bin/env node

import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '../data.db')

console.log(`📦 데이터베이스 초기화 시작: ${dbPath}`)

try {
  const db = new Database(dbPath)

  // 테이블 생성
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      input_columns TEXT NOT NULL DEFAULT '[]',
      steps TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_run_at INTEGER,
      run_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS executions (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      input_row_count INTEGER NOT NULL,
      output_row_count INTEGER NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      executed_at INTEGER NOT NULL,
      duration INTEGER NOT NULL
    );
  `)

  db.close()
  console.log('✅ 데이터베이스 초기화 완료!')
  process.exit(0)
} catch (error) {
  console.error('❌ 데이터베이스 초기화 실패:', error.message)
  process.exit(1)
}
