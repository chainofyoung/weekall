'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Request {
  id: string
  name: string
  reason: string | null
  votes: number
}

interface Props {
  user: User | null
  onClose: () => void
  onLoginRequired: () => void
}

export default function IngredientBoard({ user, onClose, onLoginRequired }: Props) {
  const [requests, setRequests] = useState<Request[]>([])
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => { loadRequests() }, [])

  async function loadRequests() {
    const supabase = createClient()
    const { data } = await supabase
      .from('ingredient_requests')
      .select('id, name, reason, votes')
      .order('votes', { ascending: false })
      .limit(50)
    if (data) setRequests(data)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { onLoginRequired(); return }
    setSubmitting(true)
    const supabase = createClient()
    await supabase.from('ingredient_requests').insert({
      name: name.trim(),
      reason: reason.trim() || null,
      votes: 0,
      user_id: user.id,
    })
    setName('')
    setReason('')
    setSubmitted(true)
    await loadRequests()
    setSubmitting(false)
    setTimeout(() => setSubmitted(false), 2000)
  }

  async function vote(id: string) {
    if (!user) { onLoginRequired(); return }
    const supabase = createClient()
    const req = requests.find(r => r.id === id)
    if (!req) return
    await supabase.from('ingredient_requests').update({ votes: req.votes + 1 }).eq('id', id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, votes: r.votes + 1 } : r))
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-3xl max-h-[82vh] flex flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 핸들 + 헤더 */}
        <div className="px-5 pt-4 pb-3 border-b border-[#F3F4F6] flex-shrink-0">
          <div className="w-8 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="serif text-lg text-[#171717]">재료 추가 건의</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">원하는 재료를 건의하고 추천해 주세요!</p>
            </div>
            <button onClick={onClose} className="text-[#9CA3AF] text-xl leading-none">×</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* 건의 폼 */}
          <form onSubmit={submit} className="flex flex-col gap-2 mb-5 p-4 bg-[#F8F9F8] rounded-2xl">
            <input
              type="text"
              placeholder="재료 이름 (예: 아보카도)"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="px-3 py-2.5 border border-[#E8EBE8] rounded-xl text-sm bg-white outline-none focus:border-[#FF5252] transition-colors"
            />
            <input
              type="text"
              placeholder="왜 필요한지 알려주세요 (선택)"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="px-3 py-2.5 border border-[#E8EBE8] rounded-xl text-sm bg-white outline-none focus:border-[#FF5252] transition-colors"
            />
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all
                ${submitted ? 'bg-emerald-500 text-white' : 'bg-[#171717] text-white disabled:opacity-40'}`}
            >
              {submitted ? '✓ 건의 완료!' : user ? '건의하기' : '로그인 후 건의하기'}
            </button>
          </form>

          {/* 건의 목록 */}
          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-3">
            건의 목록 ({requests.length})
          </p>
          <div className="flex flex-col gap-2">
            {requests.length === 0 ? (
              <p className="text-center text-sm text-[#9CA3AF] py-8">
                첫 번째 건의를 올려보세요!
              </p>
            ) : (
              requests.map(req => (
                <div key={req.id} className="flex items-center gap-3 border border-[#E8EBE8] rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#171717]">{req.name}</p>
                    {req.reason && (
                      <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">{req.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => vote(req.id)}
                    className="flex flex-col items-center gap-0.5 text-[#FF5252] flex-shrink-0 px-2"
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="currentColor">
                      <path d="M5 0L10 8H0L5 0Z"/>
                    </svg>
                    <span className="text-xs font-bold">{req.votes}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
