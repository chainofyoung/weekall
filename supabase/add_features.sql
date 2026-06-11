-- ============================================================
-- weekall 기능 추가 마이그레이션
-- Supabase 대시보드 > SQL Editor에서 실행하세요
-- ============================================================

-- 재료 추가 건의 게시판
create table if not exists public.ingredient_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  name text not null,
  reason text,
  votes integer default 0 not null,
  created_at timestamptz default now()
);

alter table public.ingredient_requests enable row level security;
create policy "누구나 읽기 가능" on public.ingredient_requests for select using (true);
create policy "로그인 사용자 건의 가능" on public.ingredient_requests for insert with check (auth.uid() = user_id);
create policy "누구나 추천 가능" on public.ingredient_requests for update using (true);

-- 즐겨찾기 (개별 메뉴)
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  meal_name text not null,
  meal_data jsonb not null,
  created_at timestamptz default now(),
  unique(user_id, meal_name)
);

alter table public.favorites enable row level security;
create policy "본인 즐겨찾기만 접근" on public.favorites for all using (auth.uid() = user_id);
