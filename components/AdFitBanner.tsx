'use client'

import { useEffect, useRef } from 'react'

interface Props {
  unitId?: string
  width?: number
  height?: number
  className?: string
}

/**
 * Kakao AdFit 배너
 * unitId: NEXT_PUBLIC_KAKAO_ADFIT_UNIT_ID_1 등 전달
 * 가입: https://adfit.kakao.com (개인 주민번호로 가입 가능, 사업자 불필요)
 */
export default function AdFitBanner({
  unitId,
  width = 320,
  height = 50,
  className = '',
}: Props) {
  const insRef = useRef<HTMLModElement>(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (!unitId) return
    if (scriptLoaded.current) return
    scriptLoaded.current = true

    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/kas/static/ba.min.js'
    script.async = true
    document.head.appendChild(script)
  }, [unitId])

  if (!unitId) {
    return (
      <div className={`bg-[#F5F0E4] border border-dashed border-[#C8B99A] rounded-xl px-4 py-2.5 text-center ${className}`}>
        <p className="text-[10px] text-[#C8B99A]">
          📢 광고 영역 · <span className="font-bold">adfit.kakao.com</span> 가입 후<br/>
          <code className="bg-[#E8DFD0] px-1 rounded text-[9px]">NEXT_PUBLIC_KAKAO_ADFIT_UNIT_ID_1</code> 환경변수 설정
        </p>
      </div>
    )
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <ins
        ref={insRef}
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={unitId}
        data-ad-width={String(width)}
        data-ad-height={String(height)}
      />
    </div>
  )
}
