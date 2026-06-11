import { GoogleGenerativeAI } from '@google/generative-ai'
import { WeeklyMealPlan, DayMealPlan, UserIngredient, UserPreference } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash']

async function generateWithFallback(prompt: string): Promise<string> {
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      })
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('503') || msg.includes('overloaded') || msg.includes('429')) {
        continue
      }
      throw e
    }
  }
  throw new Error('모든 모델이 현재 사용 불가합니다. 잠시 후 다시 시도해주세요.')
}

export const GOAL_LABELS: Record<string, string> = {
  lose: '가볍게 감량 (저칼로리 위주)',
  maintain: '현상 유지 (균형 잡힌 식단)',
  bulk: '든든하게 (고단백 위주)',
}

export const ACTIVITY_LABELS: Record<string, string> = {
  low: '저활동 (하루 대부분 앉아있음)',
  medium: '보통 (주 2-3회 운동)',
  high: '고활동 (매일 운동 또는 육체노동)',
}

export async function generateMealPlan(
  userIngredients: UserIngredient[],
  preference: UserPreference,
  recentMeals: string[] = []
): Promise<WeeklyMealPlan> {
  const expiringIngredients = userIngredients
    .filter((ui) => ui.isExpiringSoon)
    .map((ui) => ui.ingredient.name)

  const allIngredients = userIngredients.map((ui) => ui.ingredient.name)

  const favMeals = preference.favoriteMeals ?? []

  const prompt = `당신은 한식 전문 영양사입니다. 다음 조건에 맞는 일주일 식단을 JSON으로 작성해주세요.

## 보유 재료
${allIngredients.join(', ')}

## 유통기한 임박 재료 (우선 사용 필수)
${expiringIngredients.length > 0 ? expiringIngredients.join(', ') : '없음'}

## 식단 목표
${GOAL_LABELS[preference.goal]}

## 활동량
${ACTIVITY_LABELS[preference.activityLevel]}

## 제외 재료
${preference.excludeIngredients.length > 0 ? preference.excludeIngredients.join(', ') : '없음'}

## 최근 먹은 메뉴 (중복 최소화)
${recentMeals.length > 0 ? recentMeals.join(', ') : '없음'}

## 사용자 선호 메뉴 (즐겨찾기 — 가능하면 이 메뉴들 우선 포함)
${favMeals.length > 0 ? favMeals.join(', ') : '없음'}

## 기본 양념 보유 가정
소금, 후추, 식용유, 참기름, 간장, 된장, 고추장, 설탕, 식초, 다진마늘

## 응답 형식 (JSON 스키마)
{
  "days": [
    {
      "day": "월",
      "breakfast": {
        "name": "메뉴명 (예: 김치볶음밥 + 달걀프라이)",
        "description": "한 줄 설명",
        "ingredients": ["재료1", "재료2"],
        "calories": 400,
        "cookTime": 10,
        "difficulty": "easy",
        "recipe": ["1. 첫 번째 단계", "2. 두 번째 단계"],
        "portionGuide": "공기 1개 분량 + 달걀 1개"
      },
      "lunch": {},
      "dinner": {}
    }
  ],
  "missingIngredients": ["있으면 좋을 재료1"]
}

규칙:
- days는 반드시 월~일 7개
- name에 메인+곁들임 형태로 작성 (예: "된장찌개 + 흰밥", "닭볶음탕 + 공기밥")
- portionGuide: 그램 대신 자연어로 (예: "밥 공기 1개", "주먹 2개 크기", "작은 그릇 가득", "손바닥 크기 1장")
- difficulty: easy(15분 이내), medium(30분 이내), hard(30분 초과)
- 유통기한 임박 재료는 주 초반에 배치
- 한식 위주, 현실적으로 혼자 만들 수 있는 레시피
- 순수 JSON만 반환, 마크다운 없음`

  const text = await generateWithFallback(prompt)
  const plan = JSON.parse(text) as Omit<WeeklyMealPlan, 'generatedAt'>

  return {
    ...plan,
    generatedAt: new Date().toISOString(),
  }
}

const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일']

export async function regenerateDayMeals(
  userIngredients: UserIngredient[],
  preference: UserPreference,
  dayIndex: number,
  existingDays: DayMealPlan[]
): Promise<DayMealPlan> {
  const dayName = DAY_NAMES[dayIndex] ?? '월'

  const existingMeals = existingDays
    .filter((_, i) => i !== dayIndex)
    .flatMap(d => [d.breakfast?.name, d.lunch?.name, d.dinner?.name].filter(Boolean))

  const allIngredients = userIngredients.map(ui => ui.ingredient.name)
  const expiringIngredients = userIngredients
    .filter(ui => ui.isExpiringSoon)
    .map(ui => ui.ingredient.name)

  const prompt = `당신은 한식 전문 영양사입니다. 아래 요일의 하루 식단만 새로 생성해주세요.

## 요일: ${dayName}요일

## 보유 재료
${allIngredients.join(', ')}

## 유통기한 임박 재료 (우선 사용)
${expiringIngredients.length > 0 ? expiringIngredients.join(', ') : '없음'}

## 식단 목표
${GOAL_LABELS[preference.goal]}

## 이미 있는 메뉴 (중복 금지)
${existingMeals.join(', ')}

## 기본 양념 보유 가정
소금, 후추, 식용유, 참기름, 간장, 된장, 고추장, 설탕, 식초, 다진마늘

## 응답 형식 (JSON)
{
  "day": "${dayName}",
  "breakfast": { "name": "메뉴명", "description": "한 줄 설명", "ingredients": [], "calories": 400, "cookTime": 10, "difficulty": "easy", "recipe": ["1. 단계"], "portionGuide": "공기 1개 분량" },
  "lunch": { 동일 구조 },
  "dinner": { 동일 구조 }
}

순수 JSON만 반환, 마크다운 없음`

  const text = await generateWithFallback(prompt)
  return JSON.parse(text) as DayMealPlan
}
