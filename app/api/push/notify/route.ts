import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import { getShelfLife, getDaysLeft, getFreshStatus } from '@/lib/shelf-life-data'

webpush.setVapidDetails(
  'mailto:admin@weekall.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// Vercel Cron: 매일 오전 8시 실행
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // push_subscriptions와 fridge_items를 user_id로 조인
  const { data: subs } = await supabase.from('push_subscriptions').select('user_id, subscription')
  if (!subs?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  for (const sub of subs) {
    const { data: items } = await supabase
      .from('fridge_items')
      .select('name, emoji, added_at')
      .eq('user_id', sub.user_id)

    if (!items?.length) continue

    const expiring = items.filter(item => {
      const shelf = getShelfLife(item.name)
      const daysLeft = getDaysLeft(item.added_at, shelf.days)
      const status = getFreshStatus(daysLeft, shelf.warningDays)
      return status === 'warning' || status === 'expired'
    })

    if (!expiring.length) continue

    const names = expiring.slice(0, 3).map(i => `${i.emoji}${i.name}`).join(', ')
    const body = expiring.length > 3
      ? `${names} 외 ${expiring.length - 3}개`
      : names

    try {
      await webpush.sendNotification(
        sub.subscription,
        JSON.stringify({
          title: '⚠️ 곧 상하는 재료가 있어요',
          body: `${body} — 오늘 식단에 활용해보세요!`,
          url: '/',
        })
      )
      sent++
    } catch {
      // 만료된 구독은 삭제
      await supabase.from('push_subscriptions').delete().eq('user_id', sub.user_id)
    }
  }

  return NextResponse.json({ sent })
}
