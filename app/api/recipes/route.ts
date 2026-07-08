import { recipeService } from '@/lib/services/recipeService'
import { getErrorMessage } from '@/lib/utils/errors'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    let recipes
    if (query) {
      recipes = await recipeService.search(query)
    } else {
      recipes = await recipeService.findAll()
    }

    return NextResponse.json({
      success: true,
      data: recipes,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const recipe = await recipeService.create(body)

    return NextResponse.json(
      {
        success: true,
        data: recipe,
      },
      { status: 201 }
    )
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
