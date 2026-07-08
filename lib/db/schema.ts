import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'

// 레시피 테이블
export const recipes = sqliteTable(
  'recipes',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    tags: text('tags').default('[]').notNull(), // JSON 배열 문자열
    inputColumns: text('input_columns').default('[]').notNull(), // JSON 배열
    steps: text('steps').default('[]').notNull(), // JSON 배열 (Step[])
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    lastRunAt: integer('last_run_at', { mode: 'timestamp' }),
    runCount: integer('run_count').default(0).notNull(),
  },
  (table) => ({
    nameIndex: uniqueIndex('recipes_name_idx').on(table.name),
  })
)

// 실행 로그 테이블
export const executions = sqliteTable(
  'executions',
  {
    id: text('id').primaryKey(),
    recipeId: text('recipe_id').notNull(),
    fileName: text('file_name').notNull(),
    inputRowCount: integer('input_row_count').notNull(),
    outputRowCount: integer('output_row_count').notNull(),
    status: text('status', { enum: ['success', 'failed'] }).notNull(),
    errorMessage: text('error_message'),
    executedAt: integer('executed_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    duration: integer('duration').notNull(), // 밀리초
  }
)

export type Recipe = typeof recipes.$inferSelect
export type NewRecipe = typeof recipes.$inferInsert
export type Execution = typeof executions.$inferSelect
export type NewExecution = typeof executions.$inferInsert

// Step Types
export type FilterStep = {
  type: 'filter'
  column: string
  operator: '=' | '!=' | '>' | '<' | 'contains'
  value: string
}

export type SelectStep = {
  type: 'select'
  columns: string[]
}

export type CopyStep = {
  type: 'copy'
  from: string
  to: string
}

export type CalculateStep = {
  type: 'calculate'
  resultColumn: string
  function: 'sum' | 'avg' | 'count'
  range: string
}

export type SortStep = {
  type: 'sort'
  column: string
  order: 'asc' | 'desc'
}

export type Step = FilterStep | SelectStep | CopyStep | CalculateStep | SortStep
