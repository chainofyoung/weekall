'use client'

import { useState, useEffect } from 'react'
import AdFitBanner from '@/components/AdFitBanner'

interface Props {
  onConfirm: () => void
  onClose: () => void
}

export default function AdGateModal({ onConfirm, onClose }: Props) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="w-full max-w-sm bg-[#FFFDF6] rounded-2xl border-2 border-[#C8B99A] shadow-[4px_4px_0_#C8B99A] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-5 py-4 border-b-2 border-[#E8DFD0] text-center">
          <p className="text-2xl mb-1">📺</p>
          <h2 className="text-lg text-[#1E1810]">광고 보고 식단 생성</h2>
          <p className="text-sm text-[#7A6855] mt-1 leading-relaxed">
            광고 수익으로 서비스가 유지돼요 🙏<br/>잠깐만 기다려주세요!
          </p>
        </div>

        {/* 광고 영역 */}
        <div className="px-5 py-4 bg-[#F5F0E4] flex flex-col items-center gap-3">
          <AdFitBanner
            unitId={process.env.NEXT_PUBLIC_KAKAO_ADFIT_UNIT_ID_1}
            width={320}
            height={100}
          />
          {/* 카운트다운 */}
          <div className="flex items-center gap-2">
            {countdown > 0 ? (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-[#E84040] flex items-center justify-center">
                  <span className="text-sm font-bold text-[#E84040]">{countdown}</span>
                </div>
                <span className="text-sm text-[#7A6855]">초 후 생성 가능해요</span>
              </>
            ) : (
              <span className="text-sm font-bold text-emerald-600">✓ 준비됐어요!</span>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="px-5 py-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-[#7A6855] bg-[#F5F0E4] border-2 border-[#C8B99A] shadow-[2px_2px_0_#C8B99A]"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={countdown > 0}
            className={`flex-2 flex-1 py-3 rounded-2xl text-sm font-bold transition-all border-2
              ${countdown <= 0
                ? 'bg-[#E84040] text-white border-[#E84040] shadow-[2px_2px_0_#8A1A1A] active:shadow-none active:translate-x-0.5 active:translate-y-0.5'
                : 'bg-[#E8E0D4] text-[#B0A090] border-[#C8B99A] cursor-not-allowed'
              }`}
          >
            {countdown > 0 ? `${countdown}초...` : '🍱 식단 생성하기!'}
          </button>
        </div>
      </div>
    </div>
  )
}
