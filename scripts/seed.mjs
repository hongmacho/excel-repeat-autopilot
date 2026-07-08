#!/usr/bin/env node

import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '../data.db')

console.log(`📦 데이터베이스 시드 시작: ${dbPath}`)

try {
  // 데이터베이스 연결
  const db = new Database(dbPath)

  // 시드 데이터: 3개 레시피
  const recipes = [
  {
    id: uuidv4(),
    name: '판매 데이터 필터링',
    description: '월별 판매액이 100만원 이상인 거래만 추출',
    tags: JSON.stringify(['필터', '판매', '분석']),
    inputColumns: JSON.stringify(['거래날짜', '상품명', '판매량', '판매액']),
    steps: JSON.stringify([
      {
        type: 'filter',
        config: { column: '판매액', operator: '>', value: '1000000' }
      },
      {
        type: 'select',
        config: { columns: ['거래날짜', '상품명', '판매액'] }
      },
      {
        type: 'sort',
        config: { column: '판매액', order: 'desc' }
      }
    ]),
    runCount: 5
  },
  {
    id: uuidv4(),
    name: '중복 제거 및 집계',
    description: '상품별 총 판매량 계산 (중복 제거)',
    tags: JSON.stringify(['집계', '상품', '통계']),
    inputColumns: JSON.stringify(['상품명', '판매량', '판매액']),
    steps: JSON.stringify([
      {
        type: 'dedup',
        config: { column: '상품명' }
      },
      {
        type: 'aggregate',
        config: { column: '판매량', function: 'sum', groupBy: '상품명' }
      },
      {
        type: 'sort',
        config: { column: '판매량_sum', order: 'desc' }
      }
    ]),
    runCount: 3
  },
  {
    id: uuidv4(),
    name: '비용 계산 및 복사',
    description: '판매액 기준으로 수수료 계산',
    tags: JSON.stringify(['계산', '수수료', '비용']),
    inputColumns: JSON.stringify(['거래번호', '판매액', '수수료율']),
    steps: JSON.stringify([
      {
        type: 'calculate',
        config: { resultColumn: '수수료액', function: 'sum', range: ['판매액'] }
      },
      {
        type: 'copy',
        config: { from: '판매액', to: '원본판매액' }
      },
      {
        type: 'select',
        config: { columns: ['거래번호', '원본판매액', '수수료액'] }
      }
    ]),
    runCount: 4
  }
  ]

  const now = Math.floor(Date.now() / 1000)

  // 레시피 삽입
  const insertRecipe = db.prepare(`
    INSERT INTO recipes
    (id, name, description, tags, input_columns, steps, created_at, updated_at, last_run_at, run_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const recipe of recipes) {
    insertRecipe.run(
      recipe.id,
      recipe.name,
      recipe.description,
      recipe.tags,
      recipe.inputColumns,
      recipe.steps,
      now - Math.floor(Math.random() * 86400 * 30), // 최근 30일 내
      now,
      now - Math.floor(Math.random() * 86400 * 7), // 최근 7일 내
      recipe.runCount
    )
  }

  console.log(`✅ 레시피 ${recipes.length}개 삽입됨`)

  // 실행 로그 삽입 (5개 이상)
  const insertExecution = db.prepare(`
    INSERT INTO executions
    (id, recipe_id, file_name, input_row_count, output_row_count, status, error_message, executed_at, duration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const executionLogs = [
    {
      recipeId: recipes[0].id,
      fileName: 'sales_2024_01.csv',
      inputRowCount: 50,
      outputRowCount: 12,
      status: 'success',
      duration: 245
    },
    {
      recipeId: recipes[0].id,
      fileName: 'sales_2024_02.csv',
      inputRowCount: 48,
      outputRowCount: 10,
      status: 'success',
      duration: 198
    },
    {
      recipeId: recipes[1].id,
      fileName: 'products_all.csv',
      inputRowCount: 100,
      outputRowCount: 25,
      status: 'success',
      duration: 567
    },
    {
      recipeId: recipes[1].id,
      fileName: 'products_batch2.csv',
      inputRowCount: 80,
      outputRowCount: 22,
      status: 'success',
      duration: 423
    },
    {
      recipeId: recipes[2].id,
      fileName: 'transactions_001.csv',
      inputRowCount: 120,
      outputRowCount: 120,
      status: 'success',
      duration: 654
    },
    {
      recipeId: recipes[2].id,
      fileName: 'transactions_002.csv',
      inputRowCount: 95,
      outputRowCount: 95,
      status: 'success',
      duration: 512
    },
    {
      recipeId: recipes[0].id,
      fileName: 'sales_2024_03.csv',
      inputRowCount: 52,
      outputRowCount: 15,
      status: 'success',
      duration: 287
    }
  ]

  for (const log of executionLogs) {
    insertExecution.run(
      uuidv4(),
      log.recipeId,
      log.fileName,
      log.inputRowCount,
      log.outputRowCount,
      log.status,
      null,
      now - Math.floor(Math.random() * 86400 * 7),
      log.duration
    )
  }

  console.log(`✅ 실행 로그 ${executionLogs.length}개 삽입됨`)

  db.close()
  console.log('✅ 데이터베이스 시드 완료!')
  process.exit(0)
} catch (error) {
  console.error('❌ 데이터베이스 시드 실패:', error.message)
  process.exit(1)
}
