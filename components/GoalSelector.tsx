'use client'

import { useState } from 'react'
import { UserPreference, DietGoal } from '@/types'

const GOALS: { key: DietGoal; label: string; desc: string; kcal: string }[] = [
  { key: 'lose',     label: '가볍게',   desc: '저칼로리 위주',  kcal: '~1,500 kcal' },
  { key: 'maintain', label: '균형있게', desc: '탄단지 균형',    kcal: '~1,800 kcal' },
  { key: 'bulk',     label: '든든하게', desc: '고단백 위주',    kcal: '~2,200 kcal' },
]

const ACTIVITY: { key: UserPreference['activityLevel']; label: string; desc: string }[] = [
  { key: 'low',    label: '적음', desc: '주로 앉아있어요' },
  { key: 'medium', label: '보통', desc: '주 2~3회 운동' },
  { key: 'high',   label: '많음', desc: '매일 운동해요' },
]

interface Props {
  onBack: () => void
  onGenerate: (preference: UserPreference) => void
}

export default function GoalSelector({ onBack, onGenerate }: Props) {
  const [goal, setGoal] = useState<DietGoal>('maintain')
  const [activityLevel, setActivityLevel] = useState<UserPreference['activityLevel']>('medium')
  const [favCount, setFavCount] = useState(0)

  // 즐겨찾기 개수 로드
  useState(() => {
    try {
      const local = localStorage.getItem('weekall_favorites')
      if (local) setFavCount(JSON.parse(local).length)
    } catch {}
  })

  return (
    <div className="min-h-dvh flex flex-col">
      {/* 헤더 — 고정 로고 아래 공간 확보 */}
      <div className="px-5 pt-16 pb-5 max-w-2xl mx-auto w-full">
        <button onClick={onBack} className="text-[#B0A090] text-sm mb-5 flex items-center gap-1 hover:text-[#7A6855] transition-colors">
          ← 재료 다시 선택
        </button>
        <span className="text-[11px] font-bold text-[#E84040] tracking-widest uppercase block mb-2">STEP 2 / 3</span>
        <h1 className="serif text-2xl text-[#1E1810] mb-1">목표 설정</h1>
        <p className="text-[#7A6855] text-sm">어떻게 먹고 싶으세요?</p>
      </div>

      <div className="flex-1 px-5 overflow-y-auto pb-8 max-w-2xl mx-auto w-full">
        {/* 식단 목표 */}
        <p className="text-xs font-bold text-[#B0A090] uppercase tracking-widest mb-3">식단 목표</p>
        <div className="flex flex-col gap-2 mb-8">
          {GOALS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGoal(g.key)}
              className={`flex items-center px-4 py-4 rounded-xl border-2 text-left transition-all
                ${goal === g.key
                  ? 'border-[#E84040] bg-[#FFFDF6] shadow-[3px_3px_0_#E84040]'
                  : 'border-[#C8B99A] bg-[#FFFDF6] shadow-[1px_1px_0_#C8B99A]'
                }`}
            >
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className={`serif text-base ${goal === g.key ? 'text-[#E84040]' : 'text-[#1E1810]'}`}>
                    {g.label}
                  </span>
                  <span className="text-[#B0A090] text-xs">{g.desc}</span>
                </div>
                <span className="text-[11px] text-[#B0A090] mt-0.5 block">{g.kcal}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${goal === g.key ? 'border-[#E84040] bg-[#E84040]' : 'border-[#C8B99A]'}`}>
                {goal === g.key && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 활동량 */}
        <p className="text-xs font-bold text-[#B0A090] uppercase tracking-widest mb-3">활동량</p>
        <div className="grid grid-cols-3 gap-2 mb-8">
          {ACTIVITY.map((a) => (
            <button
              key={a.key}
              onClick={() => setActivityLevel(a.key)}
              className={`py-4 rounded-xl border-2 text-center transition-all
                ${activityLevel === a.key
                  ? 'border-[#E84040] bg-[#FFFDF6] shadow-[3px_3px_0_#E84040]'
                  : 'border-[#C8B99A] bg-[#FFFDF6] shadow-[1px_1px_0_#C8B99A]'
                }`}
            >
              <p className={`serif text-sm ${activityLevel === a.key ? 'text-[#E84040]' : 'text-[#1E1810]'}`}>
                {a.label}
              </p>
              <p className="text-[#B0A090] text-[10px] mt-0.5 leading-tight px-1">{a.desc}</p>
            </button>
          ))}
        </div>

        {/* 기본 양념 안내 */}
        <div className="bg-[#FFFDF6] rounded-xl px-4 py-3 border border-[#C8B99A] shadow-[1px_1px_0_#C8B99A]">
          <p className="text-[11px] text-[#B0A090] leading-relaxed">
            <span className="font-bold text-[#7A6855]">기본 양념 보유 가정</span><br/>
            소금·간장·참기름·고추장·된장·식용유 등
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 py-4 border-t-2 border-[#C8B99A]">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => {
              let favMeals: string[] = []
              try {
                const local = localStorage.getItem('weekall_favorites')
                if (local) favMeals = JSON.parse(local)
              } catch {}
              onGenerate({ goal, activityLevel, excludeIngredients: [], favoriteMeals: favMeals })
            }}
            className="w-full py-4 rounded-xl bg-[#E84040] text-white serif text-base font-bold
              border-2 border-[#E84040] shadow-[3px_3px_0_#8A1A1A]
              active:shadow-[1px_1px_0_#8A1A1A] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            AI 식단 생성하기
            {favCount > 0 && (
              <span className="block text-xs font-normal opacity-80 mt-0.5">❤️ 즐겨찾기 {favCount}개 반영</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
