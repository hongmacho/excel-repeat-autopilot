import { recipeService } from '@/lib/services/recipeService'
import { getErrorMessage } from '@/lib/utils/errors'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const recipe = await recipeService.findById(id)

    if (!recipe) {
      return NextResponse.json(
        {
          success: false,
          error: '레시피를 찾을 수 없습니다',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: recipe,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const recipe = await recipeService.update(id, body)

    return NextResponse.json({
      success: true,
      data: recipe,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error),
      },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await recipeService.delete(id)

    return NextResponse.json({
      success: true,
      message: '레시피가 삭제되었습니다',
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
