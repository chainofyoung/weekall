'use client'

import { useState, useEffect, useMemo } from 'react'
import { WeeklyMealPlan } from '@/types'

interface Props {
  plan: WeeklyMealPlan
  onClose: () => void
}

// 쿠팡 파트너스 ID: .env.local에 NEXT_PUBLIC_COUPANG_PARTNER_ID=your_id 설정
const COUPANG_PARTNER_ID = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID

function coupangUrl(item: string) {
  if (COUPANG_PARTNER_ID) {
    return `https://www.coupang.com/np/search?q=${encodeURIComponent(item)}&rocketAll=false&sid=${COUPANG_PARTNER_ID}`
  }
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(item)}`
}

export default function ShoppingList({ plan, onClose }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [fridgeNames, setFridgeNames] = useState<Set<string>>(new Set())

  // 냉장고에 있는 재료 목록 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('weekall_fridge')
      if (saved) {
        const items: { name: string }[] = JSON.parse(saved)
        setFridgeNames(new Set(items.map(i => i.name)))
      }
    } catch {}
  }, [])

  // 식단에서 모든 재료 추출 (중복 제거)
  const allIngredients = useMemo(() => {
    const seen = new Set<string>()
    const result: { name: string; inFridge: boolean }[] = []
    for (const day of plan.days) {
      for (const meal of [day.breakfast, day.lunch, day.dinner]) {
        for (const ing of meal.ingredients) {
          const name = ing.trim()
          if (!seen.has(name)) {
            seen.add(name)
            result.push({ name, inFridge: fridgeNames.has(name) })
          }
        }
      }
    }
    return result.sort((a, b) => {
      // 냉장고에 없는 것 먼저
      if (a.inFridge !== b.inFridge) return a.inFridge ? 1 : -1
      return a.name.localeCompare(b.name)
    })
  }, [plan, fridgeNames])

  // 부족한 재료 (식단 AI가 추천)
  const missingItems = plan.missingIngredients ?? []

  const needToBuy = allIngredients.filter(i => !i.inFridge && !checked.has(i.name))
  const haveAlready = allIngredients.filter(i => i.inFridge || checked.has(i.name))

  function toggle(name: string) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  async function copyList() {
    const text = [
      '🛒 장보기 목록 (냉장고 구조대)',
      '',
      '[ 사야 할 것 ]',
      ...needToBuy.map(i => `□ ${i.name}`),
      ...(missingItems.length > 0 ? ['', '[ 있으면 더 좋은 것 ]', ...missingItems.map(i => `□ ${i}`)] : []),
      '',
      '[ 집에 있는 것 ]',
      ...haveAlready.map(i => `☑ ${i.name}`),
    ].join('\n')

    try {
      if (navigator.share) {
        await navigator.share({ title: '장보기 목록', text })
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {}
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#FFFDF6] rounded-2xl border-2 border-[#C8B99A] shadow-[4px_4px_0_#C8B99A] flex flex-col"
        style={{ maxHeight: '85dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-5 py-4 border-b-2 border-[#E8DFD0] flex-shrink-0 flex items-center justify-between">
          <div>
            <p className="serif text-base font-bold text-[#1E1810]">🛒 장보기 목록</p>
            <p className="text-[11px] text-[#B0A090] mt-0.5">
              {needToBuy.length}개 사야 함 · {haveAlready.length}개 보유
            </p>
          </div>
          <button onClick={onClose} className="text-[#B0A090] text-lg leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ minHeight: 0 }}>
          {/* 사야 할 것 */}
          {needToBuy.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-[#B0A090] uppercase tracking-widest mb-2">사야 할 것 ({needToBuy.length})</p>
              <div className="flex flex-col gap-1.5">
                {needToBuy.map(({ name }) => (
                  <div key={name} className="flex items-center gap-3 bg-[#F5F0E4] border border-[#C8B99A] rounded-xl px-3 py-2.5 shadow-[1px_1px_0_#C8B99A]">
                    <button
                      onClick={() => toggle(name)}
                      className="w-5 h-5 rounded-md border-2 border-[#C8B99A] flex-shrink-0 flex items-center justify-center hover:border-[#E84040] transition-colors"
                    />
                    <span className="flex-1 text-sm font-bold text-[#1E1810]">{name}</span>
                    <a
                      href={coupangUrl(name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-2 py-1 bg-[#E84040] text-white text-[9px] font-bold rounded-lg shadow-[1px_1px_0_#8A1A1A] hover:bg-[#C83030] transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      쿠팡
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 있으면 더 좋은 재료 */}
          {missingItems.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-[#B0A090] uppercase tracking-widest mb-2">⭐ 있으면 더 좋은 것</p>
              <div className="flex flex-wrap gap-1.5">
                {missingItems.map(item => (
                  <a
                    key={item}
                    href={coupangUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#FFFDF6] border border-[#C8B99A] rounded-full text-xs font-bold text-[#7A6855] hover:border-[#E84040] hover:text-[#E84040] transition-colors shadow-[1px_1px_0_#C8B99A]"
                  >
                    {item} →
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 이미 있는 것 */}
          {haveAlready.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#B0A090] uppercase tracking-widest mb-2">집에 있는 것 ({haveAlready.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {haveAlready.map(({ name, inFridge }) => (
                  <button
                    key={name}
                    onClick={() => !inFridge && toggle(name)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#E8DFD0] border border-[#C8B99A] rounded-full text-[11px] text-[#B0A090] line-through"
                  >
                    {inFridge ? '🧊' : '✓'} {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="px-4 py-4 border-t-2 border-[#E8DFD0] flex-shrink-0">
          <button
            onClick={copyList}
            className="w-full py-3 rounded-xl text-sm font-bold bg-[#1E1810] text-[#FFFDF6] border-2 border-[#1E1810] shadow-[3px_3px_0_#8A7860] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            {copied ? '✓ 복사됨!' : (typeof navigator !== 'undefined' && 'share' in navigator) ? '📤 공유하기 (카카오톡 등)' : '📋 목록 복사하기'}
          </button>
          {!COUPANG_PARTNER_ID && (
            <p className="text-center text-[10px] text-[#C8B99A] mt-2">
              💡 .env.local에 NEXT_PUBLIC_COUPANG_PARTNER_ID 설정 시 쿠팡 수익 발생
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
