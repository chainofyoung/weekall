'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { WeeklyMealPlan, Meal } from '@/types'

interface SavedPlan {
  id: string
  created_at: string
  plan_data: WeeklyMealPlan
  ingredients_used: string[]
}

interface FavoriteMeal {
  id: string
  meal_name: string
  meal_data: Meal
  created_at: string
}

interface Props {
  user: User
  onClose: () => void
  onLoadPlan: (plan: WeeklyMealPlan) => void
  onLogout: () => void
}

export default function UserSheet({ user, onClose, onLoadPlan, onLogout }: Props) {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([])
  const [tab, setTab] = useState<'plans' | 'favorites'>('plans')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]).then(([plans, favs]) => {
      if (plans.data) setSavedPlans(plans.data as SavedPlan[])
      if (favs.data) setFavorites(favs.data as FavoriteMeal[])
      setLoading(false)
    })
  }, [user.id])

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#FFFDF6] rounded-2xl border-2 border-[#C8B99A] shadow-[4px_4px_0_#C8B99A] flex flex-col"
        style={{ maxHeight: '82dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 유저 정보 */}
        <div className="px-5 pt-5 pb-4 border-b-2 border-[#E8DFD0] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E84040] text-white text-sm font-bold flex items-center justify-center border-2 border-[#8A1A1A] shadow-[2px_2px_0_#8A1A1A] flex-shrink-0">
              {(user.email?.[0] ?? '?').toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="serif text-sm text-[#1E1810] font-bold truncate">{user.email}</p>
              <p className="text-[11px] text-[#B0A090]">냉장고 구조대 멤버 ✏️</p>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b-2 border-[#E8DFD0] flex-shrink-0">
          <button
            onClick={() => setTab('plans')}
            className={`flex-1 py-3 text-xs font-bold transition-all
              ${tab === 'plans'
                ? 'text-[#E84040] border-b-2 border-[#E84040] -mb-0.5 bg-[#FFF0EE]'
                : 'text-[#B0A090]'
              }`}
          >
            💾 저장 식단 {savedPlans.length > 0 && `(${savedPlans.length})`}
          </button>
          <button
            onClick={() => setTab('favorites')}
            className={`flex-1 py-3 text-xs font-bold transition-all
              ${tab === 'favorites'
                ? 'text-[#E84040] border-b-2 border-[#E84040] -mb-0.5 bg-[#FFF0EE]'
                : 'text-[#B0A090]'
              }`}
          >
            ❤️ 즐겨찾기 {favorites.length > 0 && `(${favorites.length})`}
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ minHeight: 0 }}>
          {loading ? (
            <div className="text-center py-10">
              <div className="flex gap-1.5 justify-center">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#E84040] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-[#B0A090] text-xs mt-3">불러오는 중...</p>
            </div>
          ) : tab === 'plans' ? (
            savedPlans.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-3">📋</p>
                <p className="serif text-sm text-[#7A6855]">저장된 식단이 없어요</p>
                <p className="text-[11px] text-[#B0A090] mt-1 leading-relaxed">
                  식단 결과 화면에서<br/>💾 버튼으로 저장해보세요
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {savedPlans.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => onLoadPlan(plan.plan_data)}
                    className="text-left px-4 py-3 bg-[#F5F0E4] border border-[#C8B99A] rounded-xl shadow-[1px_1px_0_#C8B99A] hover:border-[#E84040] hover:shadow-[2px_2px_0_#E84040] transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="serif text-sm text-[#1E1810] group-hover:text-[#E84040] transition-colors truncate">
                        {plan.plan_data.days?.[0]?.breakfast?.name?.split('+')[0].trim() ?? '식단'} 외…
                      </p>
                      <span className="text-[10px] text-[#B0A090] flex-shrink-0">{formatDate(plan.created_at)}</span>
                    </div>
                    {plan.ingredients_used?.length > 0 && (
                      <p className="text-[10px] text-[#B0A090] mt-1 truncate">
                        재료: {plan.ingredients_used.slice(0, 6).join(', ')}
                      </p>
                    )}
                    <p className="text-[10px] text-[#E84040] mt-1 font-bold group-hover:underline">
                      눌러서 다시 보기 →
                    </p>
                  </button>
                ))}
              </div>
            )
          ) : (
            favorites.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-3">🤍</p>
                <p className="serif text-sm text-[#7A6855]">즐겨찾기가 없어요</p>
                <p className="text-[11px] text-[#B0A090] mt-1 leading-relaxed">
                  식단 카드의 ❤️ 버튼으로<br/>마음에 드는 메뉴를 저장해보세요
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {favorites.map(fav => (
                  <div
                    key={fav.id}
                    className="px-4 py-3 bg-[#F5F0E4] border border-[#C8B99A] rounded-xl shadow-[1px_1px_0_#C8B99A]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="serif text-sm text-[#1E1810]">{fav.meal_name}</p>
                      <span className="text-[10px] text-[#B0A090] flex-shrink-0">{formatDate(fav.created_at)}</span>
                    </div>
                    {fav.meal_data?.description && (
                      <p className="text-[10px] text-[#B0A090] mt-0.5 line-clamp-1">{fav.meal_data.description}</p>
                    )}
                    <div className="flex gap-2 mt-1">
                      {fav.meal_data?.calories && (
                        <span className="text-[10px] text-[#B0A090]">~{fav.meal_data.calories}kcal</span>
                      )}
                      {fav.meal_data?.cookTime && (
                        <span className="text-[10px] text-[#B0A090]">⏱ {fav.meal_data.cookTime}분</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="px-4 py-4 border-t-2 border-[#E8DFD0] flex gap-2 flex-shrink-0">
          <button
            onClick={onLogout}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#7A6855] bg-[#F5F0E4] border border-[#C8B99A] shadow-[1px_1px_0_#C8B99A] hover:border-[#E84040] hover:text-[#E84040] transition-all"
          >
            로그아웃
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#FFFDF6] bg-[#1E1810] border-2 border-[#1E1810] shadow-[2px_2px_0_#8A7860] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
