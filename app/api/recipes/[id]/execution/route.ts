import { getDb } from '@/lib/db/client'
import { executions, recipes } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { getErrorMessage } from '@/lib/utils/errors'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const db = getDb()
    const now = new Date()

    // Record execution
    const execution = {
      id: uuidv4(),
      recipeId: id,
      fileName: body.fileName || 'unknown',
      inputRowCount: body.inputRowCount || 0,
      outputRowCount: body.outputRowCount || 0,
      status: body.status || 'success',
      errorMessage: body.errorMessage || null,
      executedAt: now,
      duration: body.duration || 0,
    }

    await db.insert(executions).values(execution)

    // Update recipe run count and last run time
    const recipe = await db.select().from(recipes).where(eq(recipes.id, id)).get()

    if (recipe) {
      await db
        .update(recipes)
        .set({
          lastRunAt: now,
          runCount: (recipe.runCount || 0) + 1,
          updatedAt: now,
        })
        .where(eq(recipes.id, id))
    }

    return NextResponse.json({
      success: true,
      data: execution,
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDb()

    const result = await db
      .select()
      .from(executions)
      .where(eq(executions.recipeId, id))
      .orderBy(desc(executions.executedAt))
      .limit(50)
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
