'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getShelfLife, getDaysLeft, getFreshStatus } from '@/lib/shelf-life-data'
import type { User } from '@supabase/supabase-js'
import type { WeeklyMealPlan } from '@/types'

interface FridgeItem {
  name: string
  emoji: string
  addedAt: string
}

interface ExpiryInfo {
  item: FridgeItem
  daysLeft: number
  status: 'fresh' | 'warning' | 'expired'
}

interface Props {
  user: User
  onStart: () => void
  onLoadPlan: (plan: WeeklyMealPlan) => void
  onOpenFridge: () => void
}

export default function Dashboard({ user, onStart, onLoadPlan, onOpenFridge }: Props) {
  const [lastPlan, setLastPlan] = useState<{ plan: WeeklyMealPlan; createdAt: string } | null>(null)
  const [expiryItems, setExpiryItems] = useState<ExpiryInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const [planRes, fridgeRes] = await Promise.all([
        supabase
          .from('meal_plans')
          .select('plan_data, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('fridge_items')
          .select('name, emoji, added_at'),
      ])

      if (planRes.data) {
        setLastPlan({ plan: planRes.data.plan_data as WeeklyMealPlan, createdAt: planRes.data.created_at })
      }

      if (fridgeRes.data) {
        const infos: ExpiryInfo[] = fridgeRes.data
          .map(row => {
            const shelf = getShelfLife(row.name)
            const daysLeft = getDaysLeft(row.added_at, shelf.days)
            const status = getFreshStatus(daysLeft, shelf.warningDays)
            return { item: { name: row.name, emoji: row.emoji, addedAt: row.added_at }, daysLeft, status }
          })
          .filter(i => i.status !== 'fresh' || i.daysLeft <= 5)
          .sort((a, b) => a.daysLeft - b.daysLeft)
          .slice(0, 6)
        setExpiryItems(infos)
      }

      setLoading(false)
    }

    void load()
  }, [user])

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 10) return '좋은 아침이에요'
    if (h < 14) return '점심은 드셨나요'
    if (h < 18) return '오후도 힘내세요'
    return '저녁은 뭐 드실 건가요'
  })()

  const userName = user.email?.split('@')[0] ?? '님'

  const urgentCount = expiryItems.filter(i => i.status === 'expired' || i.status === 'warning').length

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl animate-pulse mb-3">🧊</p>
          <p className="text-sm text-[#B0A090]">불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-10">
      <div className="max-w-2xl mx-auto px-4 pt-24">

        {/* 인사말 */}
        <div className="mb-6">
          <p className="text-sm text-[#B0A090] mb-0.5">{greeting} 👋</p>
          <h1 className="text-2xl font-bold text-[#1E1810]">{userName}<span className="font-normal">의 냉장고</span></h1>
        </div>

        {/* 냉장고 상태 카드 */}
        <button
          onClick={onOpenFridge}
          className="w-full mb-4 text-left bg-[#FFFDF6] border-2 border-[#C8B99A] rounded-2xl p-5 shadow-[3px_3px_0_#C8B99A] hover:border-[#E84040] hover:shadow-[3px_3px_0_#E84040] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧊</span>
              <span className="text-sm font-bold text-[#1E1810]">내 냉장고</span>
            </div>
            {urgentCount > 0 ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFF0EE] text-[#E84040] border border-[#E84040]">
                ⚠️ {urgentCount}개 주의
              </span>
            ) : expiryItems.length === 0 ? (
              <span className="text-xs text-[#B0A090]">비어있음</span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                ✅ 양호
              </span>
            )}
          </div>

          {expiryItems.length === 0 ? (
            <p className="text-sm text-[#B0A090]">재료를 추가하면 유통기한을 관리해드려요 →</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {expiryItems.map(({ item, daysLeft, status }) => (
                <span
                  key={item.name}
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full border
                    ${status === 'expired' ? 'bg-red-50 text-red-700 border-red-300' :
                      status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                      'bg-[#F5F0E4] text-[#7A6855] border-[#C8B99A]'}`}
                >
                  {item.emoji} {item.name}
                  <span className="opacity-70">
                    {daysLeft <= 0 ? '기한초과' : `${daysLeft}일`}
                  </span>
                </span>
              ))}
            </div>
          )}
        </button>

        {/* 마지막 식단 카드 */}
        {lastPlan ? (
          <div className="mb-4 bg-[#FFFDF6] border-2 border-[#C8B99A] rounded-2xl p-5 shadow-[3px_3px_0_#C8B99A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍱</span>
                <span className="text-sm font-bold text-[#1E1810]">지난 식단</span>
              </div>
              <span className="text-xs text-[#B0A090]">
                {new Date(lastPlan.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
              </span>
            </div>

            {/* 식단 미리보기: 처음 3일의 점심만 */}
            <div className="flex flex-col gap-1.5 mb-4">
              {lastPlan.plan.days.slice(0, 3).map((day, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-xs font-bold text-[#B0A090] w-8 flex-shrink-0">{day.day}</span>
                  <span className="text-[#4A3F32] truncate">{day.lunch.name}</span>
                  <span className="text-xs text-[#B0A090] flex-shrink-0">~{day.lunch.calories}kcal</span>
                </div>
              ))}
              {lastPlan.plan.days.length > 3 && (
                <p className="text-xs text-[#B0A090] pl-10">+ {lastPlan.plan.days.length - 3}일 더</p>
              )}
            </div>

            <button
              onClick={() => onLoadPlan(lastPlan.plan)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-[#1E1810] bg-[#F5F0E4] border-2 border-[#C8B99A] shadow-[2px_2px_0_#C8B99A] hover:border-[#E84040] hover:text-[#E84040] transition-all"
            >
              이어서 보기 →
            </button>
          </div>
        ) : (
          <div className="mb-4 bg-[#FFFDF6] border-2 border-dashed border-[#C8B99A] rounded-2xl p-5 text-center">
            <p className="text-3xl mb-2">🍱</p>
            <p className="text-sm font-bold text-[#7A6855]">아직 생성된 식단이 없어요</p>
            <p className="text-xs text-[#B0A090] mt-1">아래 버튼을 눌러 첫 식단을 만들어보세요</p>
          </div>
        )}

        {/* 메인 CTA */}
        <button
          onClick={onStart}
          className="w-full py-5 rounded-2xl font-bold text-lg bg-[#E84040] text-white border-2 border-[#E84040] shadow-[4px_4px_0_#8A1A1A] active:shadow-[1px_1px_0_#8A1A1A] active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          🥬 새 식단 만들기
        </button>
        <p className="text-center text-xs text-[#B0A090] mt-3">냉장고 재료를 고르면 AI가 일주일 식단을 짜드려요</p>

      </div>
    </div>
  )
}
