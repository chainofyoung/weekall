'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import IngredientPicker from '@/components/IngredientPicker'
import GoalSelector from '@/components/GoalSelector'
import MealPlanView from '@/components/MealPlanView'
import AuthModal from '@/components/AuthModal'
import UserSheet from '@/components/UserSheet'
import FridgeManager from '@/components/FridgeManager'
import ExpiryBanner from '@/components/ExpiryBanner'
import { UserIngredient, UserPreference, WeeklyMealPlan } from '@/types'
import type { User } from '@supabase/supabase-js'

type Step = 'ingredients' | 'goal' | 'result'

export default function Home() {
  const [step, setStep] = useState<Step>('ingredients')
  const [selectedIngredients, setSelectedIngredients] = useState<UserIngredient[]>([])
  const [lastPreference, setLastPreference] = useState<UserPreference | null>(null)
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showUserSheet, setShowUserSheet] = useState(false)
  const [showFridge, setShowFridge] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleGenerate(preference: UserPreference) {
    setLastPreference(preference)
    setIsGenerating(true)
    setStep('result')
    try {
      const res = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: selectedIngredients, preference }),
      })
      const data = await res.json()
      if (data.days) setMealPlan(data)
      else console.error('API 오류:', data.error)
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {/* 고정 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#F5F0E4]/95 backdrop-blur-sm border-b-2 border-[#C8B99A]">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <img src="/weekall.png" alt="냉장고 구조대" className="h-10 w-auto" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFridge(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-[#7A6855] bg-[#FFFDF6] border-2 border-[#C8B99A] rounded-full shadow-[2px_2px_0_#C8B99A] hover:border-[#E84040] hover:text-[#E84040] transition-colors"
            >
              🧊 냉장고
            </button>
            {user ? (
              <button
                onClick={() => setShowUserSheet(true)}
                className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 bg-[#FFFDF6] border-2 border-[#C8B99A] rounded-full shadow-[2px_2px_0_#C8B99A] hover:border-[#E84040] transition-all"
              >
                <span className="w-7 h-7 rounded-full bg-[#E84040] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {(user.email?.[0] ?? '?').toUpperCase()}
                </span>
                <span className="text-sm font-bold text-[#7A6855]">마이페이지</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 py-2 text-sm font-bold text-[#FFFDF6] bg-[#E84040] border-2 border-[#E84040] rounded-full shadow-[2px_2px_0_#8A1A1A] hover:bg-[#C83030] transition-colors"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
      {showFridge && <FridgeManager onClose={() => setShowFridge(false)} />}
      {showUserSheet && user && (
        <UserSheet
          user={user}
          onClose={() => setShowUserSheet(false)}
          onLoadPlan={(plan) => { setMealPlan(plan); setStep('result'); setShowUserSheet(false) }}
          onLogout={() => { createClient().auth.signOut(); setShowUserSheet(false) }}
        />
      )}

      {step === 'ingredients' && (
        <IngredientPicker
          selected={selectedIngredients}
          onSelect={setSelectedIngredients}
          onNext={() => setStep('goal')}
          user={user}
          onLoginRequired={() => setShowAuth(true)}
        />
      )}
      {step === 'goal' && (
        <GoalSelector
          onBack={() => setStep('ingredients')}
          onGenerate={handleGenerate}
          user={user}
          onLoginRequired={() => setShowAuth(true)}
        />
      )}
      {step === 'result' && (
        <MealPlanView
          plan={mealPlan}
          isLoading={isGenerating}
          onBack={() => { setStep('ingredients'); setMealPlan(null) }}
          user={user}
          onLoginRequired={() => setShowAuth(true)}
          ingredients={selectedIngredients}
          preference={lastPreference ?? undefined}
          onPlanUpdate={setMealPlan}
        />
      )}

      <ExpiryBanner onOpenFridge={() => setShowFridge(true)} />
    </>
  )
}
