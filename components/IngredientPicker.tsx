'use client'

import { useState, useEffect } from 'react'
import { Ingredient, UserIngredient } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { INGREDIENTS_DATA } from '@/lib/ingredients-data'
import IngredientBoard from '@/components/IngredientBoard'
import AdFitBanner from '@/components/AdFitBanner'
import { getShelfLife, getDaysLeft, getFreshStatus } from '@/lib/shelf-life-data'
import type { User } from '@supabase/supabase-js'

const CATEGORIES = [
  { key: 'all',       label: '전체' },
  { key: 'vegetable', label: '채소' },
  { key: 'meat',      label: '육류·달걀' },
  { key: 'seafood',   label: '해산물' },
  { key: 'dairy',     label: '유제품' },
  { key: 'grain',     label: '곡류' },
  { key: 'fruit',     label: '과일' },
]

interface Props {
  selected: UserIngredient[]
  onSelect: (ingredients: UserIngredient[]) => void
  onNext: () => void
  user: User | null
  onLoginRequired: () => void
}

export default function IngredientPicker({ selected, onSelect, onNext, user, onLoginRequired }: Props) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(INGREDIENTS_DATA)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showBoard, setShowBoard] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    void supabase
      .from('ingredients')
      .select('*')
      .order('category')
      .then(({ data, error }) => {
        if (data && !error && data.length > 0) {
          const localIds = new Set(INGREDIENTS_DATA.map(i => i.id))
          const extra = (data as Ingredient[]).filter(i => !localIds.has(i.id))
          if (extra.length > 0) setIngredients([...INGREDIENTS_DATA, ...extra])
        }
      })
  }, [])

  const filtered = (() => {
    let list = activeCategory === 'all'
      ? ingredients
      : ingredients.filter(i => i.category === activeCategory || (activeCategory === 'meat' && i.name === '달걀'))
    if (searchQuery.trim()) {
      list = list.filter(i => i.name.includes(searchQuery.trim()))
    }
    return list
  })()

  const hasExactMatch = ingredients.some(i => i.name === searchQuery.trim())

  function toggle(ingredient: Ingredient) {
    const exists = selected.find(s => s.ingredient.id === ingredient.id)
    if (exists) {
      onSelect(selected.filter(s => s.ingredient.id !== ingredient.id))
    } else {
      onSelect([...selected, { ingredient, isExpiringSoon: false }])
    }
  }

  function toggleExpiry(id: string) {
    onSelect(selected.map(s =>
      s.ingredient.id === id ? { ...s, isExpiringSoon: !s.isExpiringSoon } : s
    ))
  }

  function addCustom(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const custom: Ingredient = {
      id: `custom_${Date.now()}`,
      name: trimmed,
      emoji: '🥗',
      category: 'other',
    }
    onSelect([...selected, { ingredient: custom, isExpiringSoon: false }])
    setSearchQuery('')
  }

  function loadFromFridge() {
    try {
      const saved = localStorage.getItem('weekall_fridge')
      if (!saved) return
      const fridgeItems: { name: string; emoji: string; addedAt: string }[] = JSON.parse(saved)
      const toAdd: UserIngredient[] = []
      for (const fi of fridgeItems) {
        const found = ingredients.find(i => i.name === fi.name)
        if (!found) continue
        if (selected.find(s => s.ingredient.id === found.id)) continue
        const shelf = getShelfLife(fi.name)
        const daysLeft = getDaysLeft(fi.addedAt, shelf.days)
        const status = getFreshStatus(daysLeft, shelf.warningDays)
        toAdd.push({ ingredient: found, isExpiringSoon: status !== 'fresh' })
      }
      if (toAdd.length > 0) onSelect([...selected, ...toAdd])
    } catch {}
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const name = searchQuery.trim()
      if (!name) return
      const exact = ingredients.find(i => i.name === name)
      if (exact) { toggle(exact); setSearchQuery('') }
      else addCustom(name)
    }
  }

  return (
    <>
      <div className="min-h-dvh flex flex-col">
        {/* 헤더 */}
        <div className="px-4 pt-20 pb-4 max-w-2xl mx-auto w-full">
          <span className="text-xs font-bold text-[#E84040] tracking-widest uppercase block mb-2">STEP 1 / 3</span>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h1 className="text-2xl text-[#1E1810] mb-0.5">냉장고 재료 선택</h1>
              <p className="text-sm text-[#7A6855]">지금 있는 재료를 골라주세요</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadFromFridge}
                className="flex items-center gap-1 px-3 py-2 bg-[#FFFDF6] border-2 border-[#C8B99A] rounded-full text-sm font-bold text-[#7A6855] hover:border-[#E84040] hover:text-[#E84040] transition-colors shadow-[2px_2px_0_#C8B99A]"
              >
                🧊 불러오기
              </button>
              <button
                onClick={() => setShowBoard(true)}
                className="flex items-center gap-1 px-3 py-2 bg-[#FFFDF6] border-2 border-[#C8B99A] rounded-full text-sm text-[#7A6855] hover:border-[#E84040] hover:text-[#E84040] transition-colors shadow-[2px_2px_0_#C8B99A]"
              >
                💬 건의
              </button>
            </div>
          </div>

          {/* 검색 */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0A090]">✏️</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="재료 검색 또는 직접 입력 후 Enter"
              className="w-full pl-10 pr-16 py-3 bg-[#FFFDF6] border-2 border-[#C8B99A] rounded-2xl text-base text-[#1E1810] placeholder:text-[#B0A090] outline-none focus:border-[#E84040] transition-colors shadow-[2px_2px_0_#C8B99A]"
            />
            {searchQuery.trim() && !hasExactMatch && (
              <button
                onClick={() => addCustom(searchQuery)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#E84040] text-white text-sm font-bold rounded-xl shadow-[1px_1px_0_#8A1A1A]"
              >
                추가
              </button>
            )}
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="px-4 mb-3 max-w-2xl mx-auto w-full">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border-2
                  ${activeCategory === cat.key
                    ? 'bg-[#1E1810] text-[#FFFDF6] border-[#1E1810] shadow-[2px_2px_0_#8A7860]'
                    : 'bg-[#FFFDF6] text-[#7A6855] border-[#C8B99A] shadow-[2px_2px_0_#C8B99A]'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 재료 그리드 */}
        <div className="flex-1 overflow-y-auto px-4 pb-52 max-w-2xl mx-auto w-full">
          {searchQuery.trim() && filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#B0A090] text-base mb-4">'{searchQuery}' 검색 결과 없음</p>
              <button
                onClick={() => addCustom(searchQuery)}
                className="px-6 py-3 bg-[#E84040] text-white text-base font-bold rounded-2xl shadow-[2px_2px_0_#8A1A1A]"
              >
                + '{searchQuery}' 직접 추가
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
              {filtered.map(ingredient => {
                const sel = selected.find(s => s.ingredient.id === ingredient.id)
                const isSelected = !!sel
                return (
                  <div key={ingredient.id} className="flex flex-col gap-1.5">
                    <button
                      onClick={() => toggle(ingredient)}
                      className={`relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all
                        ${isSelected
                          ? 'bg-[#FFF0EE] border-2 border-[#E84040] shadow-[2px_2px_0_#E84040]'
                          : 'bg-[#FFFDF6] border-2 border-[#C8B99A] shadow-[2px_2px_0_#C8B99A] hover:border-[#8A7860]'
                        }`}
                    >
                      <span className="text-3xl leading-none">{ingredient.emoji}</span>
                      <span className={`text-xs font-bold leading-none text-center px-1
                        ${isSelected ? 'text-[#E84040]' : 'text-[#1E1810]'}`}>
                        {ingredient.name}
                      </span>
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#E84040] flex items-center justify-center">
                          <svg width="8" height="6" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </button>
                    {isSelected && (
                      <button
                        onClick={() => toggleExpiry(ingredient.id)}
                        className={`w-full py-1 rounded-lg text-xs font-bold transition-all border-2
                          ${sel?.isExpiringSoon
                            ? 'bg-[#E84040] text-white border-[#E84040]'
                            : 'bg-[#FFFDF6] text-[#B0A090] border-[#C8B99A]'
                          }`}
                      >
                        {sel?.isExpiringSoon ? '⚠ 곧 상함' : '유통기한?'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* 광고 */}
          <AdFitBanner
            unitId={process.env.NEXT_PUBLIC_KAKAO_ADFIT_UNIT_ID_1}
            width={300}
            height={250}
            className="mt-6"
          />
        </div>

        {/* 하단 바 */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#F5F0E4]/95 backdrop-blur-sm border-t-2 border-[#C8B99A] px-4 pt-3 safe-bottom">
          <div className="max-w-2xl mx-auto">
            {/* 선택된 재료 태그 */}
            {selected.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
                {selected.map(s => (
                  <span
                    key={s.ingredient.id}
                    onClick={() => toggle(s.ingredient)}
                    className={`flex-shrink-0 cursor-pointer flex items-center gap-1 pl-2.5 pr-2 py-1.5 rounded-full text-sm font-bold border-2
                      ${s.isExpiringSoon
                        ? 'bg-[#E84040] border-[#E84040] text-white'
                        : 'bg-[#FFFDF6] border-[#C8B99A] text-[#1E1810]'
                      }`}
                  >
                    {s.ingredient.emoji} {s.ingredient.name}
                    <span className="opacity-50 text-xs ml-0.5">×</span>
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={onNext}
              disabled={selected.length === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all
                ${selected.length > 0
                  ? 'bg-[#1E1810] text-[#FFFDF6] border-2 border-[#1E1810] shadow-[3px_3px_0_#8A7860] active:shadow-[1px_1px_0_#8A7860] active:translate-x-0.5 active:translate-y-0.5'
                  : 'bg-[#E8E0D4] text-[#B0A090] border-2 border-[#C8B99A] cursor-not-allowed'
                }`}
            >
              {selected.length > 0 ? `${selected.length}가지 재료로 다음 →` : '재료를 선택해주세요'}
            </button>
          </div>
        </div>
      </div>

      {showBoard && (
        <IngredientBoard
          user={user}
          onClose={() => setShowBoard(false)}
          onLoginRequired={() => { setShowBoard(false); onLoginRequired() }}
        />
      )}
    </>
  )
}
