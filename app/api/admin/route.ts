import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_TOKEN = 'choi:1111'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function isAuthed(req: NextRequest) {
  return req.headers.get('x-admin-token') === ADMIN_TOKEN
}

// GET /api/admin?type=stats|requests
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = req.nextUrl.searchParams.get('type')
  const supabase = getServiceClient()

  if (type === 'stats') {
    const [
      { count: users },
      { count: plans },
      { count: requests },
      { count: favorites },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('meal_plans').select('*', { count: 'exact', head: true }),
      supabase.from('ingredient_requests').select('*', { count: 'exact', head: true }),
      supabase.from('favorites').select('*', { count: 'exact', head: true }),
    ])
    return NextResponse.json({ users, plans, requests, favorites })
  }

  if (type === 'requests') {
    const { data, error } = await supabase
      .from('ingredient_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'invalid type' }, { status: 400 })
}

// PATCH /api/admin  { id, status }
export async function PATCH(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, name, emoji, category } = await req.json()
  const supabase = getServiceClient()

  const { error } = await supabase
    .from('ingredient_requests')
    .update({ status })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (status === 'approved' && name && emoji && category) {
    await supabase.from('ingredients').insert({
      id: `req_${id}`,
      name,
      emoji,
      category,
    })
  }

  return NextResponse.json({ ok: true })
}

// POST /api/admin  { name, emoji, category }
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, emoji, category } = await req.json()
  if (!name || !emoji || !category) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  const supabase = getServiceClient()
  const { error } = await supabase.from('ingredients').insert({
    id: `admin_${Date.now()}`,
    name,
    emoji,
    category,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
