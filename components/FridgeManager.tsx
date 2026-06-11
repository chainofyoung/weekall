'use client'

import { useState, useEffect, useCallback } from 'react'
import { INGREDIENTS_DATA } from '@/lib/ingredients-data'
import { getShelfLife, getDaysLeft, getFreshStatus, SHELF_LIFE } from '@/lib/shelf-life-data'

interface FridgeItem {
  id: string
  name: string
  emoji: string
  addedAt: string  // ISO 날짜
}

const STATUS_STYLE = {
  fresh:   { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-300',  label: '신선',    icon: '✅' },
  warning: { bar: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-300',    label: '주의',    icon: '⚠️' },
  expired: { bar: 'bg-red-400',     text: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-300',      label: '기한초과', icon: '🚨' },
}

function FridgeCard({ item, onRemove }: { item: FridgeItem; onRemove: () => void }) {
  const [open, setOpen] = useState(false)
  const shelf = getShelfLife(item.name)
  const daysLeft = getDaysLeft(item.addedAt, shelf.days)
  const status = getFreshStatus(daysLeft, shelf.warningDays)
  const st = STATUS_STYLE[status]

  // 신선도 바 너비 계산 (0~100%)
  const barPct = Math.max(0, Math.min(100, (daysLeft / shelf.days) * 100))

  const daysLeftLabel = daysLeft <= 0
    ? `${Math.abs(daysLeft)}일 초과`
    : `${daysLeft}일 남음`

  const addedDateLabel = (() => {
    const d = new Date(item.addedAt)
    return `${d.getMonth() + 1}/${d.getDate()} 추가`
  })()

  return (
    <div className={`bg-[#FFFDF6] border rounded-xl overflow-hidden transition-all ${st.border} shadow-[1px_1px_0_#C8B99A]`}>
      {/* 메인 행 */}
      <button className="w-full text-left px-4 py-3 flex items-center gap-3" onClick={() => setOpen(!open)}>
        <span className="text-2xl leading-none flex-shrink-0">{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="serif text-sm font-bold text-[#1E1810]">{item.name}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
              {shelf.storage}
            </span>
          </div>
          {/* 신선도 바 */}
          <div className="mt-1.5 h-1.5 bg-[#E8DFD0] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${st.bar}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-[#B0A090]">{addedDateLabel} · {shelf.days}일 보관</span>
            <span className={`text-[11px] font-bold ${st.text}`}>
              {st.icon} {daysLeftLabel}
            </span>
          </div>
        </div>
        <span className={`text-[#B0A090] text-xs flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* 상세 정보 */}
      {open && (
        <div className="px-4 pb-4 border-t border-[#E8DFD0]">
          <div className={`mt-3 p-3 rounded-xl border ${st.bg} ${st.border}`}>
            <p className="text-[11px] font-bold text-[#4A3F32] mb-1">🚩 이러면 버리세요</p>
            <p className="text-[11px] text-[#4A3F32] leading-relaxed">{shelf.spoilageSign}</p>
          </div>
          {shelf.tip && (
            <div className="mt-2 p-3 bg-[#F5F0E4] rounded-xl border border-[#C8B99A]">
              <p className="text-[11px] font-bold text-[#7A6855] mb-1">💡 보관 팁</p>
              <p className="text-[11px] text-[#7A6855] leading-relaxed">{shelf.tip}</p>
            </div>
          )}
          <button
            onClick={onRemove}
            className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-[#E84040] border border-[#E84040] hover:bg-[#FFF0EE] transition-colors"
          >
            냉장고에서 꺼내기 ×
          </button>
        </div>
      )}
    </div>
  )
}

interface Props {
  onClose: () => void
}

export default function FridgeManager({ onClose }: Props) {
  const [items, setItems] = useState<FridgeItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filter, setFilter] = useState<'all' | 'warning' | 'fresh'>('all')

  // localStorage에서 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('weekall_fridge')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  const save = useCallback((next: FridgeItem[]) => {
    setItems(next)
    localStorage.setItem('weekall_fridge', JSON.stringify(next))
  }, [])

  function addItem(name: string, emoji: string) {
    const existing = items.find(i => i.name === name)
    if (existing) return  // 이미 있으면 무시
    const item: FridgeItem = {
      id: `fridge_${Date.now()}`,
      name,
      emoji,
      addedAt: new Date().toISOString(),
    }
    save([...items, item])
    setSearchQuery('')
    setShowSearch(false)
  }

  function removeItem(id: string) {
    save(items.filter(i => i.id !== id))
  }

  // 검색 결과
  const searchResults = searchQuery.trim()
    ? INGREDIENTS_DATA.filter(i => i.name.includes(searchQuery.trim())).slice(0, 8)
    : []

  // 필터링 + 상태별 정렬
  const sortedItems = [...items]
    .map(item => {
      const shelf = getShelfLife(item.name)
      const daysLeft = getDaysLeft(item.addedAt, shelf.days)
      const status = getFreshStatus(daysLeft, shelf.warningDays)
      return { item, daysLeft, status }
    })
    .filter(({ status }) => {
      if (filter === 'warning') return status === 'warning' || status === 'expired'
      if (filter === 'fresh') return status === 'fresh'
      return true
    })
    .sort((a, b) => {
      // 기한초과 → 주의 → 신선 순
      const order = { expired: 0, warning: 1, fresh: 2 }
      return order[a.status] - order[b.status] || a.daysLeft - b.daysLeft
    })

  // 상태 카운트
  const counts = items.reduce((acc, item) => {
    const shelf = getShelfLife(item.name)
    const daysLeft = getDaysLeft(item.addedAt, shelf.days)
    const status = getFreshStatus(daysLeft, shelf.warningDays)
    acc[status]++
    return acc
  }, { fresh: 0, warning: 0, expired: 0 })

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F5F0E4]">
      {/* 헤더 */}
      <div className="flex-shrink-0 border-b-2 border-[#C8B99A] bg-[#F5F0E4]">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <button onClick={onClose} className="text-[#B0A090] text-sm flex items-center gap-1 hover:text-[#7A6855] transition-colors">
            ← 돌아가기
          </button>
          <span className="serif text-base font-bold text-[#1E1810]">🧊 내 냉장고</span>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-3 py-1.5 bg-[#1E1810] text-[#FFFDF6] text-xs font-bold rounded-xl border-2 border-[#1E1810] shadow-[2px_2px_0_#8A7860] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            + 추가
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-4">

          {/* 재료 추가 검색 */}
          {showSearch && (
            <div className="mb-4 bg-[#FFFDF6] border-2 border-[#C8B99A] rounded-2xl p-4 shadow-[2px_2px_0_#C8B99A]">
              <p className="text-xs font-bold text-[#7A6855] mb-2">냉장고에 넣을 재료 검색</p>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="재료 이름 입력..."
                autoFocus
                className="w-full px-3 py-2.5 bg-[#F5F0E4] border border-[#C8B99A] rounded-xl text-sm text-[#1E1810] placeholder:text-[#B0A090] outline-none focus:border-[#E84040] transition-colors"
              />
              {searchResults.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {searchResults.map(ing => (
                    <button
                      key={ing.id}
                      onClick={() => addItem(ing.name, ing.emoji)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                        ${items.find(i => i.name === ing.name)
                          ? 'bg-[#E8DFD0] border-[#C8B99A] text-[#B0A090] cursor-default'
                          : 'bg-[#FFFDF6] border-[#C8B99A] text-[#1E1810] hover:border-[#E84040] hover:text-[#E84040] shadow-[1px_1px_0_#C8B99A]'
                        }`}
                      disabled={!!items.find(i => i.name === ing.name)}
                    >
                      {ing.emoji} {ing.name}
                      {items.find(i => i.name === ing.name) ? ' ✓' : ' +'}
                    </button>
                  ))}
                </div>
              )}
              {searchQuery.trim() && searchResults.length === 0 && (
                <button
                  onClick={() => addItem(searchQuery.trim(), '🥗')}
                  className="mt-2 w-full py-2 rounded-xl text-xs font-bold text-[#E84040] border border-[#E84040] hover:bg-[#FFF0EE] transition-colors"
                >
                  + '{searchQuery.trim()}' 직접 추가
                </button>
              )}
            </div>
          )}

          {items.length === 0 ? (
            /* 빈 상태 */
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🧊</p>
              <p className="serif text-lg text-[#7A6855]">냉장고가 비어있어요</p>
              <p className="text-sm text-[#B0A090] mt-2 leading-relaxed">
                + 추가 버튼을 눌러<br/>냉장고 재료를 등록해보세요
              </p>
            </div>
          ) : (
            <>
              {/* 상태 요약 */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { key: 'fresh',   label: '신선',    count: counts.fresh,   color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-300', icon: '✅' },
                  { key: 'warning', label: '주의',    count: counts.warning, color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-300',   icon: '⚠️' },
                  { key: 'expired', label: '기한초과', count: counts.expired, color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-300',     icon: '🚨' },
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => setFilter(filter === s.key as typeof filter ? 'all' : s.key as typeof filter)}
                    className={`py-3 rounded-xl border-2 text-center transition-all
                      ${filter === s.key
                        ? `${s.bg} ${s.border} shadow-[2px_2px_0_#C8B99A]`
                        : 'bg-[#FFFDF6] border-[#C8B99A] shadow-[1px_1px_0_#C8B99A]'
                      }`}
                  >
                    <div className="text-base">{s.icon}</div>
                    <div className={`text-lg font-bold ${s.color} serif`}>{s.count}</div>
                    <div className={`text-[10px] font-bold ${s.color}`}>{s.label}</div>
                  </button>
                ))}
              </div>

              {/* 재료 목록 */}
              <div className="flex flex-col gap-2">
                {sortedItems.length === 0 ? (
                  <p className="text-center py-6 text-[#B0A090] text-sm">해당하는 재료가 없어요</p>
                ) : (
                  sortedItems.map(({ item }) => (
                    <FridgeCard
                      key={item.id}
                      item={item}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
