import { NextRequest, NextResponse } from 'next/server'
import { generateMealPlan } from '@/lib/meal-generator'
import { UserIngredient, UserPreference } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ingredients,
      preference,
      recentMeals,
    }: {
      ingredients: UserIngredient[]
      preference: UserPreference
      recentMeals?: string[]
    } = body

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: '재료를 선택해주세요.' }, { status: 400 })
    }

    const plan = await generateMealPlan(ingredients, preference, recentMeals ?? [])
    return NextResponse.json(plan)
  } catch (error) {
    console.error('식단 생성 오류:', error)
    return NextResponse.json({ error: '식단 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
