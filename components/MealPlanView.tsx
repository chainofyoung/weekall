'use client'

import { useState, useEffect, useCallback } from 'react'
import { WeeklyMealPlan, DayMealPlan, Meal, UserIngredient, UserPreference } from '@/types'
import { createClient } from '@/lib/supabase/client'
import ShoppingList from '@/components/ShoppingList'
import AdFitBanner from '@/components/AdFitBanner'
import type { User } from '@supabase/supabase-js'

interface Props {
  plan: WeeklyMealPlan | null
  isLoading: boolean
  onBack: () => void
  user: User | null
  onLoginRequired: () => void
  ingredients?: UserIngredient[]
  preference?: UserPreference
  onPlanUpdate?: (plan: WeeklyMealPlan) => void
}

const MEAL_SLOTS = [
  { key: 'breakfast' as const, label: '아침', emoji: '🌅' },
  { key: 'lunch'     as const, label: '점심', emoji: '☀️' },
  { key: 'dinner'    as const, label: '저녁', emoji: '🌙' },
]

const DIFF = {
  easy:   { label: '쉬움',   bg: 'bg-emerald-50 text-emerald-700' },
  medium: { label: '보통',   bg: 'bg-amber-50 text-amber-700' },
  hard:   { label: '어려움', bg: 'bg-red-50 text-red-700' },
}

function MealCard({
  meal,
  isFavorited,
  onToggleFavorite,
}: {
  meal: Meal
  isFavorited: boolean
  onToggleFavorite: () => void
}) {
  const [open, setOpen] = useState(false)
  const diff = DIFF[meal.difficulty]

  return (
    <div className="bg-[#FFFDF6] rounded-xl overflow-hidden border border-[#C8B99A] shadow-[2px_2px_0_#C8B99A]">
      <div className="px-4 py-3.5 flex items-start gap-2">
        {/* 메인 콘텐츠 (탭해서 열기) */}
        <button className="flex-1 min-w-0 text-left" onClick={() => setOpen(!open)}>
          <p className="serif text-[#1E1810] text-sm leading-snug">{meal.name}</p>
          <p className="text-[#B0A090] text-[11px] mt-0.5 truncate">{meal.description}</p>
          {meal.portionGuide && (
            <p className="text-[11px] text-[#E84040] mt-1 font-bold">🍽 {meal.portionGuide}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diff.bg}`}>{diff.label}</span>
            <span className="text-[10px] text-[#B0A090]">⏱ {meal.cookTime}분</span>
            <span className="text-[10px] text-[#B0A090]">~{meal.calories}kcal</span>
          </div>
        </button>

        {/* 즐겨찾기 버튼 */}
        <button
          onClick={onToggleFavorite}
          className="text-lg leading-none mt-0.5 flex-shrink-0"
          aria-label="즐겨찾기"
        >
          {isFavorited ? '❤️' : '🤍'}
        </button>

        {/* 펼치기 토글 */}
        <button onClick={() => setOpen(!open)} className="text-[#B0A090] text-xs mt-1 flex-shrink-0">
          <span className={`inline-block transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-[#E8DFD0]">
          {/* 재료 태그 */}
          <div className="mt-3 mb-3 flex flex-wrap gap-1.5">
            {meal.ingredients.map((ing, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 bg-[#F5F0E4] border border-[#C8B99A] rounded-full text-[#7A6855]">{ing}</span>
            ))}
          </div>

          {/* 레시피 */}
          <p className="text-[10px] font-bold text-[#B0A090] uppercase tracking-widest mb-2">만드는 법</p>
          <ol className="flex flex-col gap-2 mb-4">
            {meal.recipe.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-[12px] text-[#4A3F32] leading-relaxed">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#E84040] text-white text-[9px] flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                <span>{step.replace(/^\d+\.\s*/, '')}</span>
              </li>
            ))}
          </ol>

          {/* 만개의레시피 링크 */}
          <a
            href={`https://www.10000recipe.com/recipe/list.html?q=${encodeURIComponent(meal.name.split('+')[0].trim())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-2.5 bg-[#F5F0E4] rounded-xl border border-[#C8B99A] shadow-[1px_1px_0_#C8B99A] group hover:border-[#E84040] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🍳</span>
              <div>
                <p className="text-xs font-bold text-[#4A3F32] group-hover:text-[#E84040] transition-colors">만개의레시피에서 더 보기</p>
                <p className="text-[10px] text-[#B0A090]">실제 후기와 다양한 버전 확인</p>
              </div>
            </div>
            <span className="text-[#B0A090] text-xs group-hover:text-[#E84040] transition-colors">→</span>
          </a>
        </div>
      )}
    </div>
  )
}

function DayView({
  day,
  favorites,
  onToggleFavorite,
}: {
  day: DayMealPlan
  favorites: Set<string>
  onToggleFavorite: (meal: Meal) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {MEAL_SLOTS.map(({ key, label, emoji }) => (
        <div key={key}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">{emoji}</span>
            <span className="text-xs font-semibold text-[#6B7280]">{label}</span>
          </div>
          <MealCard
            meal={day[key]}
            isFavorited={favorites.has(day[key].name)}
            onToggleFavorite={() => onToggleFavorite(day[key])}
          />
        </div>
      ))}
    </div>
  )
}

function CalendarView({ days, onSelectDay }: { days: DayMealPlan[], onSelectDay: (idx: number) => void }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div style={{ minWidth: '580px' }}>
        <div className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: '44px repeat(7, 1fr)' }}>
          <div />
          {days.map((d, i) => (
            <div key={i} className="text-center py-2 bg-[#FFFDF6] rounded-xl border border-[#C8B99A] shadow-[1px_1px_0_#C8B99A]">
              <span className="text-xs font-bold text-[#1E1810] serif">{d.day}</span>
            </div>
          ))}
        </div>
        {MEAL_SLOTS.map(({ key, label, emoji }) => (
          <div key={key} className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: '44px repeat(7, 1fr)' }}>
            <div className="flex flex-col items-center justify-center">
              <span className="text-base leading-none">{emoji}</span>
              <span className="text-[9px] text-[#B0A090] mt-0.5 font-bold">{label}</span>
            </div>
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => onSelectDay(i)}
                className="bg-[#FFFDF6] rounded-xl p-2 border border-[#C8B99A] shadow-[1px_1px_0_#C8B99A] text-left hover:border-[#E84040] hover:shadow-[2px_2px_0_#E84040] hover:bg-[#FFF0EE] transition-all group min-h-[60px] flex flex-col justify-between"
              >
                <p className="text-[9px] font-bold text-[#1E1810] leading-tight line-clamp-2 group-hover:text-[#E84040]">
                  {d[key].name}
                </p>
                <p className="text-[8px] text-[#B0A090] mt-1">~{d[key].calories}kcal</p>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-5">
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-4 border-[#C8B99A]" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#E84040] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <img src="/weekall.png" alt="냉장고 구조대" className="w-full h-full object-contain" />
        </div>
      </div>
      <div className="text-center">
        <p className="serif text-[#1E1810] text-lg">식단을 만들고 있어요</p>
        <p className="text-[#7A6855] text-sm mt-1">AI가 최적 조합을 찾는 중</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#E84040] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}

export default function MealPlanView({ plan, isLoading, onBack, user, onLoginRequired, ingredients, preference, onPlanUpdate }: Props) {
  const [activeDay, setActiveDay] = useState(0)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showShopping, setShowShopping] = useState(false)
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null)
  const [shared, setShared] = useState(false)

  // 즐겨찾기 로드 (로컬스토리지 우선, 로그인 시 Supabase 동기화)
  useEffect(() => {
    const local = localStorage.getItem('weekall_favorites')
    if (local) {
      try { setFavorites(new Set(JSON.parse(local))) } catch {}
    }
  }, [])

  // 즐겨찾기 Supabase 동기화
  const syncFavoritesToSupabase = useCallback(async (names: Set<string>, meal?: Meal) => {
    if (!user || !meal) return
    try {
      const supabase = createClient()
      if (names.has(meal.name)) {
        const { error } = await supabase.from('favorites').upsert({
          user_id: user.id,
          meal_name: meal.name,
          meal_data: meal,
        })
        if (error) console.error('즐겨찾기 저장 오류:', error.message)
      } else {
        const { error } = await supabase.from('favorites').delete()
          .eq('user_id', user.id).eq('meal_name', meal.name)
        if (error) console.error('즐겨찾기 삭제 오류:', error.message)
      }
    } catch (e) {
      console.error('즐겨찾기 동기화 실패:', e)
    }
  }, [user])

  function toggleFavorite(meal: Meal) {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(meal.name)) next.delete(meal.name)
      else next.add(meal.name)
      localStorage.setItem('weekall_favorites', JSON.stringify([...next]))
      void syncFavoritesToSupabase(next, meal)
      return next
    })
  }

  async function savePlan() {
    if (!user) { onLoginRequired(); return }
    if (!plan) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('meal_plans').insert({
        user_id: user.id,
        plan_data: plan,
        ingredients_used: plan.days.flatMap(d =>
          [d.breakfast, d.lunch, d.dinner].flatMap(m => m.ingredients)
        ).filter((v, i, a) => a.indexOf(v) === i),
      })
      if (error) {
        console.error('저장 오류:', error)
        alert(`저장 실패: ${error.message}\n\nSupabase SQL Editor에서 migrate.sql을 실행해주세요.`)
        return
      }
      setSaved(true)
    } catch (e) {
      console.error(e)
      alert('저장 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  // 특정 요일 재생성
  async function regenerateDay(dayIndex: number) {
    if (!plan || !ingredients || !preference) return
    setRegeneratingDay(dayIndex)
    try {
      const res = await fetch('/api/regenerate-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          preference,
          dayIndex,
          existingDays: plan.days,
        }),
      })
      const newDay = await res.json()
      if (newDay.day) {
        const updatedDays = plan.days.map((d, i) => i === dayIndex ? newDay : d)
        const updatedPlan = { ...plan, days: updatedDays }
        onPlanUpdate?.(updatedPlan)
        setSaved(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setRegeneratingDay(null)
    }
  }

  // 식단 공유
  async function sharePlan() {
    if (!plan) return
    const text = [
      '🍱 나의 일주일 식단 (냉장고 구조대)',
      '',
      ...plan.days.map(d =>
        `[${d.day}요일]\n아침: ${d.breakfast.name}\n점심: ${d.lunch.name}\n저녁: ${d.dinner.name}`
      ),
      '',
      '냉장고 구조대로 나만의 식단 만들기 →',
    ].join('\n')

    try {
      if (navigator.share) {
        await navigator.share({ title: '나의 일주일 식단', text })
      } else {
        await navigator.clipboard.writeText(text)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      }
    } catch {}
  }

  // 주간 영양 통계
  function calcNutrition() {
    if (!plan) return null
    const meals = plan.days.flatMap(d => [d.breakfast, d.lunch, d.dinner])
    const totalCal = meals.reduce((s, m) => s + (m.calories || 0), 0)
    const avgDaily = Math.round(totalCal / 7)
    const avgBreakfast = Math.round(plan.days.reduce((s, d) => s + d.breakfast.calories, 0) / 7)
    const avgLunch = Math.round(plan.days.reduce((s, d) => s + d.lunch.calories, 0) / 7)
    const avgDinner = Math.round(plan.days.reduce((s, d) => s + d.dinner.calories, 0) / 7)
    return { avgDaily, avgBreakfast, avgLunch, avgDinner }
  }

  function handleCalendarSelect(dayIdx: number) {
    setActiveDay(dayIdx)
    setViewMode('list')
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* 헤더 — 고정 로고 아래 공간 확보 */}
      <div className="px-5 pt-16 pb-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="text-[#B0A090] text-sm flex items-center gap-1 hover:text-[#7A6855] transition-colors">
            ← 처음으로
          </button>
        </div>
        <div className="flex items-end justify-between mb-1">
          <div>
            <span className="text-[11px] font-bold text-[#E84040] tracking-widest uppercase block mb-1">STEP 3 / 3</span>
            <h1 className="serif text-2xl text-[#1E1810]">나의 일주일 식단</h1>
            <p className="text-[#7A6855] text-sm mt-0.5">
              {viewMode === 'list' ? '요일을 탭해서 식단을 확인하세요' : '전체 주간 식단 한눈에 보기'}
            </p>
          </div>

          {!isLoading && plan?.days && (
            <div className="flex flex-col items-end gap-2">
              {/* 버튼 그룹 */}
              <div className="flex gap-1.5 flex-wrap justify-end">
                <button
                  onClick={() => setShowShopping(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-[#FFFDF6] border border-[#C8B99A] text-[#7A6855] hover:border-[#E84040] hover:text-[#E84040] shadow-[1px_1px_0_#C8B99A] transition-all"
                >
                  🛒 장보기
                </button>
                <button
                  onClick={sharePlan}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-[#FFFDF6] border border-[#C8B99A] text-[#7A6855] hover:border-[#E84040] hover:text-[#E84040] shadow-[1px_1px_0_#C8B99A] transition-all"
                >
                  {shared ? '✓ 복사됨' : '📤 공유'}
                </button>
                <button
                  onClick={savePlan}
                  disabled={saving || saved}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all border
                    ${saved
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-[#FFFDF6] border-[#C8B99A] text-[#7A6855] hover:border-[#E84040] hover:text-[#E84040] shadow-[1px_1px_0_#C8B99A]'
                    }`}
                >
                  {saved ? '✓ 저장됨' : saving ? '...' : '💾 저장'}
                </button>
              </div>

              {/* 보기 토글 */}
              <div className="flex bg-[#FFFDF6] border border-[#C8B99A] rounded-xl overflow-hidden shadow-[1px_1px_0_#C8B99A]">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-xs font-bold transition-all
                    ${viewMode === 'list' ? 'bg-[#1E1810] text-[#FFFDF6]' : 'text-[#7A6855]'}`}
                >
                  리스트
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-2 text-xs font-bold transition-all
                    ${viewMode === 'calendar' ? 'bg-[#1E1810] text-[#FFFDF6]' : 'text-[#7A6855]'}`}
                >
                  캘린더
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : plan && plan.days ? (
        <>
          {viewMode === 'list' ? (
            <>
              {/* 요일 탭 */}
              <div className="px-5 mb-4 max-w-5xl mx-auto w-full">
                <div className="grid grid-cols-7 gap-1.5">
                  {plan.days.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveDay(i)}
                      className={`relative py-2.5 rounded-xl text-sm serif font-bold transition-all border
                        ${activeDay === i
                          ? 'bg-[#1E1810] text-[#FFFDF6] border-[#1E1810] shadow-[2px_2px_0_#8A7860]'
                          : 'bg-[#FFFDF6] text-[#7A6855] border-[#C8B99A] shadow-[1px_1px_0_#C8B99A]'
                        }`}
                    >
                      {regeneratingDay === i ? (
                        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : day.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* 식단 카드 */}
              <div className="flex-1 px-5 pb-40 overflow-y-auto max-w-5xl mx-auto w-full">
                {/* 재생성 버튼 */}
                {ingredients && preference && (
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] text-[#B0A090]">
                      {plan.days[activeDay].day}요일 식단
                    </p>
                    <button
                      onClick={() => regenerateDay(activeDay)}
                      disabled={regeneratingDay !== null}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all
                        ${regeneratingDay === activeDay
                          ? 'bg-[#F5F0E4] text-[#B0A090] border-[#C8B99A] cursor-not-allowed'
                          : 'bg-[#FFFDF6] text-[#7A6855] border-[#C8B99A] shadow-[1px_1px_0_#C8B99A] hover:border-[#E84040] hover:text-[#E84040]'
                        }`}
                    >
                      {regeneratingDay === activeDay ? (
                        <>
                          <span className="inline-block w-3 h-3 border-2 border-[#B0A090] border-t-transparent rounded-full animate-spin" />
                          재생성 중…
                        </>
                      ) : '↺ 다시 만들기'}
                    </button>
                  </div>
                )}

                <DayView
                  day={plan.days[activeDay]}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />

                {/* 영양 요약 */}
                {(() => {
                  const n = calcNutrition()
                  if (!n) return null
                  return (
                    <div className="mt-6 bg-[#FFFDF6] border border-[#C8B99A] rounded-2xl overflow-hidden shadow-[2px_2px_0_#C8B99A]">
                      <div className="px-4 py-3 border-b border-[#E8DFD0] flex items-center gap-2">
                        <span className="text-base">📊</span>
                        <p className="serif text-sm font-bold text-[#1E1810]">주간 영양 요약</p>
                        <span className="ml-auto text-[10px] text-[#B0A090]">하루 평균</span>
                      </div>
                      <div className="grid grid-cols-4 divide-x divide-[#E8DFD0]">
                        {[
                          { label: '일 평균', val: n.avgDaily, unit: 'kcal', accent: true },
                          { label: '아침', val: n.avgBreakfast, unit: 'kcal', accent: false },
                          { label: '점심', val: n.avgLunch, unit: 'kcal', accent: false },
                          { label: '저녁', val: n.avgDinner, unit: 'kcal', accent: false },
                        ].map(({ label, val, unit, accent }) => (
                          <div key={label} className="flex flex-col items-center justify-center py-3 px-1">
                            <span className={`serif text-base font-bold ${accent ? 'text-[#E84040]' : 'text-[#1E1810]'}`}>{val}</span>
                            <span className="text-[9px] text-[#B0A090] mt-0.5">{unit}</span>
                            <span className="text-[9px] text-[#B0A090]">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                <AdFitBanner
                  unitId={process.env.NEXT_PUBLIC_KAKAO_ADFIT_UNIT_ID_1}
                  width={320}
                  height={50}
                  className="mt-4"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 px-5 pb-32 overflow-y-auto max-w-5xl mx-auto w-full">
              <CalendarView days={plan.days} onSelectDay={handleCalendarSelect} />
              <p className="text-center text-[11px] text-[#9CA3AF] mt-4">셀을 탭하면 해당 날짜 상세 식단으로 이동해요</p>
            </div>
          )}

          {/* 있으면 좋을 재료 (하단 바) */}
          {plan.missingIngredients?.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-[#F5F0E4]/95 backdrop-blur-sm border-t-2 border-[#C8B99A] px-5 py-3 z-10">
              <p className="text-[10px] font-bold text-[#B0A090] uppercase tracking-widest mb-2">
                🛒 더 있으면 좋을 재료
              </p>
              <div className="flex gap-2 overflow-x-auto max-w-5xl mx-auto" style={{ scrollbarWidth: 'none' }}>
                {plan.missingIngredients.map((item, i) => (
                  <span key={i} className="flex-shrink-0 text-xs px-3 py-1.5 bg-[#FFFDF6] border border-[#C8B99A] rounded-full text-[#4A3F32] shadow-[1px_1px_0_#C8B99A]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 장보기 목록 모달 */}
          {showShopping && (
            <ShoppingList plan={plan} onClose={() => setShowShopping(false)} />
          )}
        </>
      ) : null}
    </div>
  )
}
