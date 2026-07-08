import { getDb } from '@/lib/db/client'
import { executions } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { getErrorMessage } from '@/lib/utils/errors'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const db = getDb()
    const result = await db
      .select()
      .from(executions)
      .orderBy(desc(executions.executedAt))
      .limit(100)
      .all()

    return NextResponse.json({
      success: true,
      data: result || [],
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error),
      },
      { status: 500 }
    )
  }
}
