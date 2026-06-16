'use client'

import { useState } from 'react'
import { UserPreference, DietGoal } from '@/types'
import AdGateModal from '@/components/AdGateModal'
import type { User } from '@supabase/supabase-js'

const GOALS: { key: DietGoal; label: string; desc: string; kcal: string; emoji: string }[] = [
  { key: 'lose',     label: '가볍게',   desc: '저칼로리 위주',  kcal: '~1,500 kcal', emoji: '🥗' },
  { key: 'maintain', label: '균형있게', desc: '탄단지 균형',    kcal: '~1,800 kcal', emoji: '🍱' },
  { key: 'bulk',     label: '든든하게', desc: '고단백 위주',    kcal: '~2,200 kcal', emoji: '💪' },
]

const ACTIVITY: { key: UserPreference['activityLevel']; label: string; desc: string; emoji: string }[] = [
  { key: 'low',    label: '적음', desc: '주로 앉아있어요', emoji: '🪑' },
  { key: 'medium', label: '보통', desc: '주 2~3회 운동',   emoji: '🚶' },
  { key: 'high',   label: '많음', desc: '매일 운동해요',   emoji: '🏃' },
]

interface Props {
  onBack: () => void
  onGenerate: (preference: UserPreference) => void
  user: User | null
  onLoginRequired: () => void
}

export default function GoalSelector({ onBack, onGenerate, user, onLoginRequired }: Props) {
  const [goal, setGoal] = useState<DietGoal>('maintain')
  const [activityLevel, setActivityLevel] = useState<UserPreference['activityLevel']>('medium')
  const [favCount, setFavCount] = useState(0)
  const [showAdGate, setShowAdGate] = useState(false)
  const [pendingPreference, setPendingPreference] = useState<UserPreference | null>(null)

  useState(() => {
    try {
      const local = localStorage.getItem('weekall_favorites')
      if (local) setFavCount(JSON.parse(local).length)
    } catch {}
  })

  function buildPreference(): UserPreference {
    let favMeals: string[] = []
    try {
      const local = localStorage.getItem('weekall_favorites')
      if (local) favMeals = JSON.parse(local)
    } catch {}
    return { goal, activityLevel, excludeIngredients: [], favoriteMeals: favMeals }
  }

  function isFirstGeneration(): boolean {
    if (!user) return true
    const count = parseInt(localStorage.getItem(`weekall_gen_${user.id}`) ?? '0')
    return count === 0
  }

  function recordGeneration() {
    if (!user) return
    const key = `weekall_gen_${user.id}`
    const count = parseInt(localStorage.getItem(key) ?? '0')
    localStorage.setItem(key, String(count + 1))
  }

  function handleGenerateClick() {
    // 1. 비로그인 → 로그인 유도
    if (!user) {
      onLoginRequired()
      return
    }

    const pref = buildPreference()

    // 2. 첫 번째 생성 → 바로 생성
    if (isFirstGeneration()) {
      recordGeneration()
      onGenerate(pref)
      return
    }

    // 3. 두 번째 이후 → 광고 게이트
    setPendingPreference(pref)
    setShowAdGate(true)
  }

  function handleAdConfirm() {
    if (!pendingPreference) return
    setShowAdGate(false)
    recordGeneration()
    onGenerate(pendingPreference)
  }

  return (
    <>
      <div className="min-h-dvh flex flex-col">
        <div className="px-4 pt-20 pb-4 max-w-2xl mx-auto w-full">
          <button onClick={onBack} className="text-[#B0A090] text-sm mb-4 flex items-center gap-1 hover:text-[#7A6855] transition-colors">
            ← 재료 다시 선택
          </button>
          <span className="text-xs font-bold text-[#E84040] tracking-widest uppercase block mb-2">STEP 2 / 3</span>
          <h1 className="text-2xl text-[#1E1810] mb-0.5">목표 설정</h1>
          <p className="text-sm text-[#7A6855]">어떻게 먹고 싶으세요?</p>
        </div>

        <div className="flex-1 px-4 overflow-y-auto pb-8 max-w-2xl mx-auto w-full">
          <p className="text-xs font-bold text-[#B0A090] uppercase tracking-widest mb-3">식단 목표</p>
          <div className="flex flex-col gap-3 mb-8">
            {GOALS.map((g) => (
              <button
                key={g.key}
                onClick={() => setGoal(g.key)}
                className={`flex items-center px-5 py-4 rounded-2xl border-2 text-left transition-all
                  ${goal === g.key
                    ? 'border-[#E84040] bg-[#FFF0EE] shadow-[3px_3px_0_#E84040]'
                    : 'border-[#C8B99A] bg-[#FFFDF6] shadow-[2px_2px_0_#C8B99A]'
                  }`}
              >
                <span className="text-3xl mr-4 flex-shrink-0">{g.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-lg ${goal === g.key ? 'text-[#E84040]' : 'text-[#1E1810]'}`}>{g.label}</span>
                    <span className="text-[#B0A090] text-sm">{g.desc}</span>
                  </div>
                  <span className="text-xs text-[#B0A090] mt-0.5 block">{g.kcal}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${goal === g.key ? 'border-[#E84040] bg-[#E84040]' : 'border-[#C8B99A]'}`}>
                  {goal === g.key && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs font-bold text-[#B0A090] uppercase tracking-widest mb-3">활동량</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {ACTIVITY.map((a) => (
              <button
                key={a.key}
                onClick={() => setActivityLevel(a.key)}
                className={`py-5 rounded-2xl border-2 text-center transition-all
                  ${activityLevel === a.key
                    ? 'border-[#E84040] bg-[#FFF0EE] shadow-[3px_3px_0_#E84040]'
                    : 'border-[#C8B99A] bg-[#FFFDF6] shadow-[2px_2px_0_#C8B99A]'
                  }`}
              >
                <p className="text-2xl mb-1">{a.emoji}</p>
                <p className={`text-base ${activityLevel === a.key ? 'text-[#E84040]' : 'text-[#1E1810]'}`}>{a.label}</p>
                <p className="text-[#B0A090] text-xs mt-0.5 leading-tight px-1">{a.desc}</p>
              </button>
            ))}
          </div>

          <div className="bg-[#FFFDF6] rounded-2xl px-4 py-3.5 border-2 border-[#C8B99A] shadow-[2px_2px_0_#C8B99A]">
            <p className="text-sm text-[#B0A090] leading-relaxed">
              <span className="font-bold text-[#7A6855]">기본 양념 보유 가정</span><br/>
              소금·간장·참기름·고추장·된장·식용유 등은 있다고 가정해요
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pt-3 border-t-2 border-[#C8B99A] safe-bottom">
          <div className="max-w-2xl mx-auto">
            {!user && (
              <p className="text-center text-xs text-[#B0A090] mb-2">
                로그인 후 AI 식단을 생성할 수 있어요
              </p>
            )}
            <button
              onClick={handleGenerateClick}
              className={`w-full py-4 rounded-2xl text-lg font-bold border-2 transition-all
                ${user
                  ? 'bg-[#E84040] text-white border-[#E84040] shadow-[3px_3px_0_#8A1A1A] active:shadow-[1px_1px_0_#8A1A1A] active:translate-x-0.5 active:translate-y-0.5'
                  : 'bg-[#1E1810] text-[#FFFDF6] border-[#1E1810] shadow-[3px_3px_0_#8A7860] active:shadow-[1px_1px_0_#8A7860] active:translate-x-0.5 active:translate-y-0.5'
                }`}
            >
              {user ? 'AI 식단 생성하기' : '🔐 로그인하고 식단 생성'}
              {user && favCount > 0 && (
                <span className="block text-sm font-bold opacity-80 mt-0.5">❤️ 즐겨찾기 {favCount}개 반영</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {showAdGate && (
        <AdGateModal
          onConfirm={handleAdConfirm}
          onClose={() => setShowAdGate(false)}
        />
      )}
    </>
  )
}
