import { getDb } from '@/lib/db/client'
import { recipes } from '@/lib/db/schema'
import type { Recipe, NewRecipe, Step } from '@/lib/db/schema'
import { eq, like, desc } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { validateRecipeName, validateInputColumns } from '@/lib/utils/validators'

export class RecipeService {
  private db = getDb()

  async findAll(): Promise<Recipe[]> {
    const results = await this.db
      .select()
      .from(recipes)
      .orderBy(desc(recipes.createdAt))
      .all()

    return results || []
  }

  async findById(id: string): Promise<Recipe | null> {
    const result = await this.db.select().from(recipes).where(eq(recipes.id, id)).get()
    return result || null
  }

  async search(query: string): Promise<Recipe[]> {
    if (!query.trim()) {
      return this.findAll()
    }

    const searchQuery = `%${query}%`
    const results = await this.db
      .select()
      .from(recipes)
      .where(like(recipes.name, searchQuery))
      .orderBy(desc(recipes.createdAt))
      .all()

    return results || []
  }

  async create(data: Omit<NewRecipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
    validateRecipeName(data.name)
    validateInputColumns(data.inputColumns || [])

    const now = new Date()
    const newRecipe: NewRecipe = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      tags: JSON.stringify(data.tags || []),
      inputColumns: JSON.stringify(data.inputColumns || []),
      steps: JSON.stringify(data.steps || []),
      createdAt: now,
      updatedAt: now,
      lastRunAt: null,
      runCount: 0,
    }

    await this.db.insert(recipes).values(newRecipe)
    const created = await this.findById(newRecipe.id)
    if (!created) {
      throw new Error('Failed to create recipe')
    }
    return created
  }

  async update(
    id: string,
    data: Partial<Omit<NewRecipe, 'id' | 'createdAt'>>
  ): Promise<Recipe> {
    if (data.name) {
      validateRecipeName(data.name)
    }
    if (data.inputColumns) {
      validateInputColumns(data.inputColumns)
    }

    const now = new Date()
    const updateData = {
      ...data,
      updatedAt: now,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      inputColumns: data.inputColumns ? JSON.stringify(data.inputColumns) : undefined,
      steps: data.steps ? JSON.stringify(data.steps) : undefined,
    }

    await this.db.update(recipes).set(updateData).where(eq(recipes.id, id))

    const updated = await this.findById(id)
    if (!updated) {
      throw new Error('Recipe not found')
    }
    return updated
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(recipes).where(eq(recipes.id, id))
  }

  async recordExecution(
    recipeId: string,
    inputRowCount: number,
    outputRowCount: number
  ): Promise<void> {
    const now = new Date()
    await this.db
      .update(recipes)
      .set({
        lastRunAt: now,
        runCount: (await this.findById(recipeId))?.runCount || 0 + 1,
      })
      .where(eq(recipes.id, recipeId))
  }

  async getStats(): Promise<{
    totalRecipes: number
    totalExecutions: number
    totalRowsProcessed: number
  }> {
    const allRecipes = await this.findAll()
    const totalRecipes = allRecipes.length
    const totalExecutions = allRecipes.reduce((sum, r) => sum + (r.runCount || 0), 0)
    return {
      totalRecipes,
      totalExecutions,
      totalRowsProcessed: 0,
    }
  }
}

export const recipeService = new RecipeService()
