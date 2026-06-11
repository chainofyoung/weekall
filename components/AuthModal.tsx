'use client'

import { createClient } from '@/lib/supabase/client'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ onClose, onSuccess: _onSuccess }: Props) {
  async function signIn(provider: 'google' | 'kakao') {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#FFFDF6] rounded-2xl p-6 border-2 border-[#C8B99A] shadow-[4px_4px_0_#C8B99A]"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <img src="/weekall.png" alt="냉장고 구조대" className="h-16 w-auto mx-auto mb-2" />
          <h2 className="serif text-lg text-[#1E1810]">로그인</h2>
          <p className="text-xs text-[#B0A090] mt-1 leading-relaxed">
            식단 저장, 즐겨찾기, 재료 건의를<br/>이용하려면 로그인이 필요해요
          </p>
        </div>

        {/* 카카오 로그인 */}
        <button
          onClick={() => signIn('kakao')}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#FEE500] rounded-xl mb-3 font-bold text-[#191919] text-sm border-2 border-[#D4C000] shadow-[2px_2px_0_#D4C000] hover:bg-[#F5DA00] transition-all active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M10 1.5C5.306 1.5 1.5 4.52 1.5 8.25c0 2.41 1.522 4.52 3.82 5.727l-.97 3.578a.313.313 0 0 0 .462.349l4.17-2.77c.33.03.663.046 1.018.046 4.694 0 8.5-3.02 8.5-6.75S14.694 1.5 10 1.5z"
              fill="#191919"
            />
          </svg>
          카카오로 계속하기
        </button>

        {/* 구글 로그인 */}
        <button
          onClick={() => signIn('google')}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-[#C8B99A] rounded-xl font-bold text-[#4A3F32] text-sm shadow-[2px_2px_0_#C8B99A] hover:bg-[#FFFDF6] transition-all active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Google로 계속하기
        </button>

        <button onClick={onClose} className="w-full mt-3 py-2 text-xs text-[#B0A090] hover:text-[#7A6855] transition-colors">
          닫기
        </button>
      </div>
    </div>
  )
}
