export interface Ingredient {
  id: string
  name: string
  emoji: string
  category: 'vegetable' | 'meat' | 'seafood' | 'dairy' | 'grain' | 'fruit' | 'other'
  expiresInDays?: number
}

export interface UserIngredient {
  ingredient: Ingredient
  expiresAt?: string
  isExpiringSoon: boolean
}

export interface Meal {
  name: string
  description: string
  ingredients: string[]
  calories: number
  cookTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  recipe: string[]
  portionGuide?: string // 자연어 섭취량 가이드 e.g. "밥 공기 1개 + 국 한 그릇"
}

export interface DayMealPlan {
  day: string
  breakfast: Meal
  lunch: Meal
  dinner: Meal
}

export interface WeeklyMealPlan {
  days: DayMealPlan[]
  missingIngredients: string[]
  generatedAt: string
}

export type DietGoal = 'lose' | 'maintain' | 'bulk'

export interface UserPreference {
  goal: DietGoal
  activityLevel: 'low' | 'medium' | 'high'
  excludeIngredients: string[]
  favoriteMeals?: string[]  // 즐겨찾기 기반 추천
}
