'use client'

import { useState, useEffect, useCallback } from 'react'

function adminFetch(url: string, options?: RequestInit) {
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
}

interface IngredientRequest {
  id: string
  name: string
  emoji: string
  category: string
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user_id: string
}

interface Stats {
  users: number
  plans: number
  requests: number
  favorites: number
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [loginId, setLoginId] = useState('')
  const [loginPw, setLoginPw] = useState('')
  const [loginError, setLoginError] = useState(false)
  const [tab, setTab] = useState<'requests' | 'stats' | 'ingredients'>('requests')
  const [requests, setRequests] = useState<IngredientRequest[]>([])
  const [stats, setStats] = useState<Stats>({ users: 0, plans: 0, requests: 0, favorites: 0 })
  const [newIngredient, setNewIngredient] = useState({ name: '', emoji: '', category: 'vegetable' })
  const [addStatus, setAddStatus] = useState<string | null>(null)

  useEffect(() => {
    adminFetch('/api/admin?type=stats')
      .then(res => { if (res.ok) setAuthed(true) })
      .finally(() => setCheckingSession(false))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: loginId, password: loginPw }),
    })
    if (res.ok) {
      setAuthed(true)
      setLoginError(false)
    } else {
      setLoginError(true)
    }
  }

  const loadRequests = useCallback(async () => {
    const res = await adminFetch('/api/admin?type=requests')
    const data = await res.json()
    if (Array.isArray(data)) setRequests(data as IngredientRequest[])
  }, [])

  const loadStats = useCallback(async () => {
    const res = await adminFetch('/api/admin?type=stats')
    const data = await res.json()
    if (data.users !== undefined) setStats(data)
  }, [])

  useEffect(() => {
    if (authed) {
      void loadRequests()
      void loadStats()
    }
  }, [authed, loadRequests, loadStats])

  async function handleRequestStatus(id: string, status: 'approved' | 'rejected') {
    const req = requests.find(r => r.id === id)
    await adminFetch('/api/admin', {
      method: 'PATCH',
      body: JSON.stringify({ id, status, name: req?.name, emoji: req?.emoji, category: req?.category }),
    })
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  async function handleAddIngredient() {
    if (!newIngredient.name.trim() || !newIngredient.emoji.trim()) return
    const res = await adminFetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify(newIngredient),
    })
    const data = await res.json()
    if (data.error) {
      setAddStatus(`오류: ${data.error}`)
    } else {
      setAddStatus(`✓ '${newIngredient.name}' 추가됨`)
      setNewIngredient({ name: '', emoji: '', category: 'vegetable' })
    }
    setTimeout(() => setAddStatus(null), 3000)
  }

  if (checkingSession) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-[#B0A090]">불러오는 중...</p>
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4 bg-[#F5F0E4]">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-[#FFFDF6] border-2 border-[#C8B99A] rounded-2xl p-8 shadow-[4px_4px_0_#C8B99A]"
        >
          <p className="text-4xl text-center mb-2">🔐</p>
          <h1 className="text-xl text-center text-[#1E1810] mb-6">관리자 로그인</h1>
          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              placeholder="아이디"
              autoFocus
              className="w-full px-4 py-3 bg-[#F5F0E4] border-2 border-[#C8B99A] rounded-xl text-sm text-[#1E1810] outline-none focus:border-[#E84040] transition-colors"
            />
            <input
              type="password"
              value={loginPw}
              onChange={e => setLoginPw(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-4 py-3 bg-[#F5F0E4] border-2 border-[#C8B99A] rounded-xl text-sm text-[#1E1810] outline-none focus:border-[#E84040] transition-colors"
            />
          </div>
          {loginError && (
            <p className="text-sm text-[#E84040] text-center mb-3">아이디 또는 비밀번호가 틀렸어요</p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-[#E84040] text-white font-bold rounded-xl border-2 border-[#E84040] shadow-[2px_2px_0_#8A1A1A]"
          >
            로그인
          </button>
        </form>
      </div>
    )
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')

  return (
    <div className="min-h-dvh bg-[#F5F0E4]">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 bg-[#1E1810] border-b-2 border-[#8A7860]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-[#B0A090] text-sm hover:text-[#FFFDF6] transition-colors">← 홈</a>
            <span className="text-[#8A7860]">|</span>
            <h1 className="text-[#FFFDF6] font-bold">관리자 페이지</h1>
          </div>
          <span className="text-xs text-[#8A7860]">관리자</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'requests', label: `건의사항 ${pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}` },
            { key: 'stats', label: '통계' },
            { key: 'ingredients', label: '재료 추가' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all
                ${tab === t.key
                  ? 'bg-[#E84040] text-white border-[#E84040] shadow-[2px_2px_0_#8A1A1A]'
                  : 'bg-[#FFFDF6] text-[#7A6855] border-[#C8B99A] shadow-[2px_2px_0_#C8B99A]'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 건의사항 탭 */}
        {tab === 'requests' && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-16 text-[#B0A090]">건의사항이 없어요</div>
            ) : (
              requests.map(req => (
                <div
                  key={req.id}
                  className={`bg-[#FFFDF6] rounded-2xl border-2 p-4 shadow-[2px_2px_0_#C8B99A]
                    ${req.status === 'pending' ? 'border-[#C8B99A]' :
                      req.status === 'approved' ? 'border-emerald-400 opacity-70' : 'border-[#E84040] opacity-50'}
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-3xl flex-shrink-0">{req.emoji || '❓'}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-[#1E1810]">{req.name}</p>
                        <p className="text-xs text-[#B0A090]">{req.category} · {new Date(req.created_at).toLocaleDateString('ko-KR')}</p>
                        {req.reason && <p className="text-sm text-[#7A6855] mt-1 truncate">{req.reason}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleRequestStatus(req.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-bold rounded-xl border-2 border-emerald-600 shadow-[2px_2px_0_#047857]"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleRequestStatus(req.id, 'rejected')}
                            className="px-3 py-1.5 bg-[#F5F0E4] text-[#7A6855] text-sm font-bold rounded-xl border-2 border-[#C8B99A]"
                          >
                            거절
                          </button>
                        </>
                      ) : (
                        <span className={`text-sm font-bold ${req.status === 'approved' ? 'text-emerald-600' : 'text-[#B0A090]'}`}>
                          {req.status === 'approved' ? '✓ 승인됨' : '✗ 거절됨'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 통계 탭 */}
        {tab === 'stats' && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: '전체 사용자', value: stats.users, emoji: '👤' },
                { label: '생성된 식단', value: stats.plans, emoji: '🍱' },
                { label: '재료 건의', value: stats.requests, emoji: '💬' },
                { label: '즐겨찾기', value: stats.favorites, emoji: '❤️' },
              ].map(s => (
                <div key={s.label} className="bg-[#FFFDF6] rounded-2xl border-2 border-[#C8B99A] p-5 shadow-[2px_2px_0_#C8B99A]">
                  <p className="text-3xl mb-2">{s.emoji}</p>
                  <p className="text-3xl font-bold text-[#1E1810]">{s.value.toLocaleString()}</p>
                  <p className="text-sm text-[#B0A090] mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#FFFDF6] rounded-2xl border-2 border-[#C8B99A] p-4 shadow-[2px_2px_0_#C8B99A]">
              <p className="text-sm font-bold text-[#7A6855] mb-3">환경 변수 상태</p>
              {[
                { key: 'NEXT_PUBLIC_SUPABASE_URL', val: process.env.NEXT_PUBLIC_SUPABASE_URL },
                { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', val: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
                { key: 'NEXT_PUBLIC_COUPANG_PARTNER_ID', val: process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID },
                { key: 'NEXT_PUBLIC_KAKAO_ADFIT_UNIT_ID_1', val: process.env.NEXT_PUBLIC_KAKAO_ADFIT_UNIT_ID_1 },
                { key: 'NEXT_PUBLIC_ADMIN_EMAIL', val: process.env.NEXT_PUBLIC_ADMIN_EMAIL },
              ].map(env => (
                <div key={env.key} className="flex items-center justify-between py-2 border-b border-[#E8DFD0] last:border-0">
                  <code className="text-xs text-[#7A6855]">{env.key}</code>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg
                    ${env.val ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {env.val ? '✓ 설정됨' : '✗ 미설정'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { void loadStats() }}
              className="mt-4 w-full py-3 bg-[#1E1810] text-[#FFFDF6] text-sm font-bold rounded-2xl border-2 border-[#1E1810] shadow-[2px_2px_0_#8A7860]"
            >
              새로고침
            </button>
          </div>
        )}

        {/* 재료 추가 탭 */}
        {tab === 'ingredients' && (
          <div className="bg-[#FFFDF6] rounded-2xl border-2 border-[#C8B99A] p-5 shadow-[2px_2px_0_#C8B99A]">
            <h2 className="text-base font-bold text-[#1E1810] mb-4">DB에 재료 직접 추가</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#B0A090] uppercase tracking-wider block mb-1.5">재료 이름</label>
                <input
                  type="text"
                  value={newIngredient.name}
                  onChange={e => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 아스파라거스"
                  className="w-full px-4 py-3 bg-[#F5F0E4] border-2 border-[#C8B99A] rounded-xl text-sm text-[#1E1810] outline-none focus:border-[#E84040] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#B0A090] uppercase tracking-wider block mb-1.5">이모지</label>
                <input
                  type="text"
                  value={newIngredient.emoji}
                  onChange={e => setNewIngredient(prev => ({ ...prev, emoji: e.target.value }))}
                  placeholder="예: 🌿"
                  className="w-full px-4 py-3 bg-[#F5F0E4] border-2 border-[#C8B99A] rounded-xl text-sm text-[#1E1810] outline-none focus:border-[#E84040] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#B0A090] uppercase tracking-wider block mb-1.5">카테고리</label>
                <select
                  value={newIngredient.category}
                  onChange={e => setNewIngredient(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#F5F0E4] border-2 border-[#C8B99A] rounded-xl text-sm text-[#1E1810] outline-none focus:border-[#E84040] transition-colors"
                >
                  <option value="vegetable">채소</option>
                  <option value="meat">육류·달걀</option>
                  <option value="seafood">해산물</option>
                  <option value="dairy">유제품</option>
                  <option value="grain">곡류</option>
                  <option value="fruit">과일</option>
                  <option value="other">기타</option>
                </select>
              </div>
              {addStatus && (
                <p className={`text-sm font-bold py-2 px-3 rounded-xl
                  ${addStatus.startsWith('✓') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                  {addStatus}
                </p>
              )}
              <button
                onClick={handleAddIngredient}
                disabled={!newIngredient.name.trim() || !newIngredient.emoji.trim()}
                className={`w-full py-4 rounded-2xl text-base font-bold border-2 transition-all
                  ${newIngredient.name.trim() && newIngredient.emoji.trim()
                    ? 'bg-[#E84040] text-white border-[#E84040] shadow-[2px_2px_0_#8A1A1A]'
                    : 'bg-[#E8E0D4] text-[#B0A090] border-[#C8B99A] cursor-not-allowed'
                  }`}
              >
                DB에 추가하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
