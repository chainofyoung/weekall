import { NextRequest, NextResponse } from 'next/server'
import { regenerateDayMeals } from '@/lib/meal-generator'
import { UserIngredient, UserPreference, DayMealPlan } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ingredients, preference, dayIndex, existingDays }: {
      ingredients: UserIngredient[]
      preference: UserPreference
      dayIndex: number
      existingDays: DayMealPlan[]
    } = body

    const day = await regenerateDayMeals(ingredients, preference, dayIndex, existingDays)
    return NextResponse.json(day)
  } catch (error) {
    console.error('재생성 오류:', error)
    return NextResponse.json({ error: '재생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
