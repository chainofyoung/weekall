'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { WeeklyMealPlan } from '@/types'

interface PlanRecord {
  id: string
  plan: WeeklyMealPlan
  createdAt: Date
}

interface Props {
  user: User
  onClose: () => void
  onLoadPlan: (plan: WeeklyMealPlan) => void
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

export default function HistoryCalendar({ user, onClose, onLoadPlan }: Props) {
  const [plans, setPlans] = useState<PlanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedPlan, setSelectedPlan] = useState<PlanRecord | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('meal_plans')
      .select('id, plan_data, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setPlans(data.map(r => ({
            id: r.id,
            plan: r.plan_data as WeeklyMealPlan,
            createdAt: new Date(r.created_at),
          })))
        }
        setLoading(false)
      })
  }, [user])

  // 현재 달에 해당하는 날짜 그리드 생성
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()  // 0=일
    const lastDate = new Date(year, month + 1, 0).getDate()

    const days: (Date | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= lastDate; d++) days.push(new Date(year, month, d))
    while (days.length % 7 !== 0) days.push(null)
    return days
  }, [viewDate])

  // 날짜별 plan 매핑
  const planByDate = useMemo(() => {
    const map = new Map<string, PlanRecord>()
    for (const p of plans) {
      const key = `${p.createdAt.getFullYear()}-${p.createdAt.getMonth()}-${p.createdAt.getDate()}`
      if (!map.has(key)) map.set(key, p)
    }
    return map
  }, [plans])

  function getPlanForDay(day: Date): PlanRecord | undefined {
    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`
    return planByDate.get(key)
  }

  const today = new Date()
  const isToday = (day: Date) =>
    day.getFullYear() === today.getFullYear() &&
    day.getMonth() === today.getMonth() &&
    day.getDate() === today.getDate()

  function prevMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    setSelectedPlan(null)
  }
  function nextMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    setSelectedPlan(null)
  }

  const MEAL_SLOTS = [
    { key: 'breakfast' as const, label: '아침', emoji: '🌅' },
    { key: 'lunch'     as const, label: '점심', emoji: '☀️' },
    { key: 'dinner'    as const, label: '저녁', emoji: '🌙' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F5F0E4]">
      {/* 헤더 */}
      <div className="flex-shrink-0 border-b-2 border-[#C8B99A] bg-[#F5F0E4]">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <button onClick={onClose} className="text-[#B0A090] text-sm flex items-center gap-1 hover:text-[#7A6855] transition-colors">
            ← 돌아가기
          </button>
          <span className="text-base font-bold text-[#1E1810]">📅 식단 히스토리</span>
          <div className="w-16" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5">

          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-full bg-[#FFFDF6] border-2 border-[#C8B99A] shadow-[2px_2px_0_#C8B99A] flex items-center justify-center text-[#7A6855] hover:border-[#E84040] hover:text-[#E84040] transition-all active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
            >
              ‹
            </button>
            <div className="text-center">
              <p className="text-xs text-[#B0A090] mb-0.5">{viewDate.getFullYear()}</p>
              <p className="text-xl font-bold text-[#1E1810]">{MONTHS[viewDate.getMonth()]}</p>
            </div>
            <button
              onClick={nextMonth}
              disabled={viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth()}
              className="w-9 h-9 rounded-full bg-[#FFFDF6] border-2 border-[#C8B99A] shadow-[2px_2px_0_#C8B99A] flex items-center justify-center text-[#7A6855] hover:border-[#E84040] hover:text-[#E84040] transition-all active:shadow-none active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-3xl animate-pulse mb-3">📅</p>
              <p className="text-sm text-[#B0A090]">불러오는 중...</p>
            </div>
          ) : (
            <>
              {/* 캘린더 그리드 */}
              <div className="bg-[#FFFDF6] rounded-2xl border-2 border-[#C8B99A] shadow-[3px_3px_0_#C8B99A] overflow-hidden mb-4">
                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 border-b-2 border-[#E8DFD0]">
                  {WEEKDAYS.map((d, i) => (
                    <div
                      key={d}
                      className={`py-2.5 text-center text-xs font-bold
                        ${i === 0 ? 'text-[#E84040]' : i === 6 ? 'text-blue-500' : 'text-[#B0A090]'}`}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* 날짜 셀 */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, idx) => {
                    const plan = day ? getPlanForDay(day) : undefined
                    const todayDay = day && isToday(day)
                    const isSelected = day && selectedPlan && plan?.id === selectedPlan.id
                    const col = idx % 7

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (plan) setSelectedPlan(isSelected ? null : plan)
                        }}
                        disabled={!plan}
                        className={`relative aspect-square flex flex-col items-center justify-center gap-0.5 transition-all border-b border-r border-[#F0E8D8]
                          ${plan
                            ? isSelected
                              ? 'bg-[#FFF0EE] border-b-[#E84040]'
                              : 'hover:bg-[#FFF8F7] cursor-pointer'
                            : 'cursor-default'
                          }`}
                      >
                        {day ? (
                          <>
                            <span className={`text-sm font-bold leading-none
                              ${todayDay
                                ? 'w-6 h-6 rounded-full bg-[#E84040] text-white flex items-center justify-center text-xs'
                                : col === 0 ? 'text-[#E84040]'
                                : col === 6 ? 'text-blue-500'
                                : isSelected ? 'text-[#E84040]' : 'text-[#1E1810]'
                              }`}
                            >
                              {day.getDate()}
                            </span>
                            {plan && (
                              <span className={`text-[8px] font-bold px-1 py-0.5 rounded-full
                                ${isSelected
                                  ? 'bg-[#E84040] text-white'
                                  : 'bg-[#FFF0EE] text-[#E84040]'
                                }`}
                              >
                                🍱
                              </span>
                            )}
                          </>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 선택된 식단 상세 */}
              {selectedPlan ? (
                <div className="bg-[#FFFDF6] rounded-2xl border-2 border-[#E84040] shadow-[3px_3px_0_#E84040] overflow-hidden">
                  <div className="px-5 py-4 border-b-2 border-[#E8DFD0] flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#B0A090]">
                        {selectedPlan.createdAt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 생성
                      </p>
                      <p className="text-base font-bold text-[#1E1810] mt-0.5">일주일 식단 ({selectedPlan.plan.days.length}일)</p>
                    </div>
                    <button
                      onClick={() => { onLoadPlan(selectedPlan.plan); onClose() }}
                      className="px-4 py-2 bg-[#E84040] text-white text-sm font-bold rounded-xl border-2 border-[#E84040] shadow-[2px_2px_0_#8A1A1A] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      이어 보기 →
                    </button>
                  </div>
                  <div className="px-5 py-4 flex flex-col gap-3">
                    {selectedPlan.plan.days.map((day, i) => (
                      <div key={i}>
                        <p className="text-xs font-bold text-[#B0A090] mb-1.5">{day.day}</p>
                        <div className="flex flex-col gap-1">
                          {MEAL_SLOTS.map(({ key, label, emoji }) => (
                            <div key={key} className="flex items-center gap-2 text-sm">
                              <span className="text-xs w-4 flex-shrink-0">{emoji}</span>
                              <span className="text-xs text-[#B0A090] w-6 flex-shrink-0">{label}</span>
                              <span className="text-[#1E1810] truncate">{day[key].name}</span>
                              <span className="text-xs text-[#B0A090] flex-shrink-0 ml-auto">~{day[key].calories}kcal</span>
                            </div>
                          ))}
                        </div>
                        {i < selectedPlan.plan.days.length - 1 && (
                          <div className="mt-3 border-b border-[#E8DFD0]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                plans.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-3">📅</p>
                    <p className="font-bold text-[#7A6855]">아직 생성된 식단이 없어요</p>
                    <p className="text-sm text-[#B0A090] mt-1">식단을 만들면 여기서 확인할 수 있어요</p>
                  </div>
                ) : (
                  <p className="text-center text-sm text-[#B0A090] py-4">
                    🍱 표시된 날짜를 탭하면 식단을 볼 수 있어요
                  </p>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
