'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { WeeklyMealPlan, DayMealPlan } from '@/types'

interface PlanRecord {
  id: string
  plan: WeeklyMealPlan
  createdAt: Date
}

interface DayEntry {
  record: PlanRecord
  dayData: DayMealPlan
  date: Date
}

interface Props {
  user: User
  onClose: () => void
  onLoadPlan: (plan: WeeklyMealPlan) => void
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

const MEAL_SLOTS = [
  { key: 'breakfast' as const, label: '아침' },
  { key: 'lunch'     as const, label: '점심' },
  { key: 'dinner'    as const, label: '저녁' },
]

export default function HistoryCalendar({ user, onClose, onLoadPlan }: Props) {
  const [plans, setPlans] = useState<PlanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selected, setSelected] = useState<DayEntry | null>(null)

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

  // 각 plan의 7일을 실제 날짜에 매핑
  const dayByDate = useMemo(() => {
    const map = new Map<string, DayEntry>()
    for (const record of plans) {
      const start = new Date(record.createdAt)
      start.setHours(0, 0, 0, 0)
      record.plan.days.forEach((dayData, i) => {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        if (!map.has(key)) map.set(key, { record, dayData, date })
      })
    }
    return map
  }, [plans])

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const lastDate = new Date(year, month + 1, 0).getDate()
    const days: (Date | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= lastDate; d++) days.push(new Date(year, month, d))
    while (days.length % 7 !== 0) days.push(null)
    return days
  }, [viewDate])

  function getEntry(day: Date): DayEntry | undefined {
    return dayByDate.get(`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`)
  }

  const today = new Date()
  function isToday(day: Date) {
    return day.getFullYear() === today.getFullYear() &&
      day.getMonth() === today.getMonth() &&
      day.getDate() === today.getDate()
  }

  function prevMonth() { setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); setSelected(null) }
  function nextMonth() { setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); setSelected(null) }
  const isCurrentMonth = viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth()

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F5F0E4]">
      <div className="flex-shrink-0 border-b-2 border-[#C8B99A] bg-[#F5F0E4]">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <button onClick={onClose} className="text-[#B0A090] text-sm hover:text-[#7A6855] transition-colors">
            ← 돌아가기
          </button>
          <span className="text-base font-bold text-[#1E1810]">식단 히스토리</span>
          <div className="w-16" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5">

          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-full bg-[#FFFDF6] border-2 border-[#C8B99A] shadow-[2px_2px_0_#C8B99A] flex items-center justify-center text-[#7A6855] hover:border-[#E84040] hover:text-[#E84040] transition-all"
            >
              ‹
            </button>
            <div className="text-center">
              <p className="text-xs text-[#B0A090]">{viewDate.getFullYear()}</p>
              <p className="text-xl font-bold text-[#1E1810]">{MONTHS[viewDate.getMonth()]}</p>
            </div>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="w-9 h-9 rounded-full bg-[#FFFDF6] border-2 border-[#C8B99A] shadow-[2px_2px_0_#C8B99A] flex items-center justify-center text-[#7A6855] hover:border-[#E84040] hover:text-[#E84040] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-sm text-[#B0A090]">불러오는 중...</p>
            </div>
          ) : (
            <>
              {/* 캘린더 그리드 */}
              <div className="bg-[#FFFDF6] rounded-2xl border-2 border-[#C8B99A] shadow-[3px_3px_0_#C8B99A] overflow-hidden mb-4">
                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 border-b-2 border-[#E8DFD0]">
                  {WEEKDAYS.map((d, i) => (
                    <div key={d} className={`py-2.5 text-center text-xs font-bold
                      ${i === 0 ? 'text-[#E84040]' : i === 6 ? 'text-blue-500' : 'text-[#B0A090]'}`}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* 날짜 셀 */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, idx) => {
                    const entry = day ? getEntry(day) : undefined
                    const todayDay = day && isToday(day)
                    const isSelected = day && selected && entry?.record.id === selected.record.id &&
                      entry.date.toDateString() === selected.date.toDateString()
                    const col = idx % 7

                    return (
                      <button
                        key={idx}
                        onClick={() => entry && setSelected(isSelected ? null : entry)}
                        disabled={!entry}
                        className={`relative aspect-square flex flex-col items-center justify-center gap-0.5 transition-all border-b border-r border-[#F0E8D8] last:border-r-0
                          ${entry ? (isSelected ? 'bg-[#FFF0EE]' : 'hover:bg-[#FFF8F7] cursor-pointer') : 'cursor-default'}`}
                      >
                        {day && (
                          <>
                            <span className={`text-sm font-bold leading-none
                              ${todayDay
                                ? 'w-6 h-6 rounded-full bg-[#E84040] text-white flex items-center justify-center text-xs'
                                : isSelected ? 'text-[#E84040]'
                                : col === 0 ? 'text-[#E84040]'
                                : col === 6 ? 'text-blue-500'
                                : 'text-[#1E1810]'
                              }`}>
                              {day.getDate()}
                            </span>
                            {entry && (
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#E84040]' : 'bg-[#C8B99A]'}`} />
                            )}
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 선택된 날 식단 */}
              {selected ? (
                <div className="bg-[#FFFDF6] rounded-2xl border-2 border-[#E84040] shadow-[3px_3px_0_#E84040] overflow-hidden">
                  <div className="px-5 py-4 border-b-2 border-[#E8DFD0] flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-[#1E1810]">
                        {selected.date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                      </p>
                      <p className="text-xs text-[#B0A090] mt-0.5">
                        {selected.record.createdAt.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 생성된 식단
                      </p>
                    </div>
                    <button
                      onClick={() => { onLoadPlan(selected.record.plan); onClose() }}
                      className="px-4 py-2 bg-[#E84040] text-white text-sm font-bold rounded-xl border-2 border-[#E84040] shadow-[2px_2px_0_#8A1A1A] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      전체 보기 →
                    </button>
                  </div>
                  <div className="px-5 py-4 flex flex-col gap-3">
                    {MEAL_SLOTS.map(({ key, label }) => {
                      const meal = selected.dayData[key]
                      return (
                        <div key={key}>
                          <p className="text-[10px] font-bold text-[#B0A090] uppercase tracking-widest mb-1.5">{label}</p>
                          <div className="bg-[#F5F0E4] rounded-xl px-4 py-3 border border-[#C8B99A]">
                            <p className="text-sm font-bold text-[#1E1810]">{meal.name}</p>
                            <p className="text-xs text-[#B0A090] mt-0.5">{meal.description}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-xs text-[#B0A090]">~{meal.calories}kcal</span>
                              <span className="text-xs text-[#B0A090]">{meal.cookTime}분</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-12">
                  <p className="font-bold text-[#7A6855]">아직 생성된 식단이 없어요</p>
                  <p className="text-sm text-[#B0A090] mt-1">식단을 만들면 여기서 확인할 수 있어요</p>
                </div>
              ) : (
                <p className="text-center text-sm text-[#B0A090] py-4">
                  날짜를 탭하면 그날 식단을 볼 수 있어요
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
