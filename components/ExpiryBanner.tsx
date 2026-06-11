'use client'

import { useState, useEffect } from 'react'
import { getShelfLife, getDaysLeft, getFreshStatus } from '@/lib/shelf-life-data'

interface FridgeItem { id: string; name: string; emoji: string; addedAt: string }

interface Props {
  onOpenFridge: () => void
}

export default function ExpiryBanner({ onOpenFridge }: Props) {
  const [urgentItems, setUrgentItems] = useState<FridgeItem[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('weekall_fridge')
      if (!saved) return
      const items: FridgeItem[] = JSON.parse(saved)
      const urgent = items.filter(item => {
        const shelf = getShelfLife(item.name)
        const daysLeft = getDaysLeft(item.addedAt, shelf.days)
        return daysLeft <= 1  // 오늘 또는 내일 만료
      })
      setUrgentItems(urgent)
    } catch {}
  }, [])

  if (urgentItems.length === 0 || dismissed) return null

  const expiredCount = urgentItems.filter(item => {
    const shelf = getShelfLife(item.name)
    return getDaysLeft(item.addedAt, shelf.days) <= 0
  }).length

  return (
    <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none">
      <div
        className="max-w-2xl mx-auto bg-[#FFFDF6] border-2 border-[#E84040] rounded-2xl px-4 py-3 shadow-[3px_3px_0_#E84040] pointer-events-auto flex items-center gap-3"
      >
        <span className="text-xl flex-shrink-0">{expiredCount > 0 ? '🚨' : '⚠️'}</span>
        <div className="flex-1 min-w-0">
          <p className="serif text-sm font-bold text-[#E84040]">
            {expiredCount > 0
              ? `${expiredCount}개 재료가 기한이 지났어요`
              : `${urgentItems.length}개 재료가 오늘·내일 상해요`}
          </p>
          <p className="text-[11px] text-[#7A6855] truncate mt-0.5">
            {urgentItems.map(i => i.emoji + i.name).join(' · ')}
          </p>
        </div>
        <button
          onClick={onOpenFridge}
          className="flex-shrink-0 px-3 py-1.5 bg-[#E84040] text-white text-[11px] font-bold rounded-xl shadow-[1px_1px_0_#8A1A1A]"
        >
          확인
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-[#B0A090] text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}
