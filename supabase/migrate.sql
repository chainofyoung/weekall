-- ============================================================
-- weekall 전체 마이그레이션 (한 번에 실행)
-- Supabase 대시보드 → SQL Editor → 전체 붙여넣기 → Run
-- ============================================================

-- 1. profiles 테이블
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  goal text check (goal in ('lose', 'maintain', 'bulk')) default 'maintain',
  activity_level text check (activity_level in ('low', 'medium', 'high')) default 'medium',
  exclude_ingredients text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "본인 프로필만 접근" on public.profiles;
create policy "본인 프로필만 접근" on public.profiles for all using (auth.uid() = id);

-- 2. 재료 테이블
create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  emoji text not null default '🥗',
  category text check (category in ('vegetable','meat','seafood','dairy','grain','fruit','other')) not null,
  created_at timestamptz default now()
);
alter table public.ingredients enable row level security;
drop policy if exists "재료 목록 공개 읽기" on public.ingredients;
create policy "재료 목록 공개 읽기" on public.ingredients for select using (true);

-- 3. meal_plans — auth.users 직접 참조 (profiles FK 의존성 제거)
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  plan_data jsonb not null,
  ingredients_used text[] not null default '{}',
  created_at timestamptz default now()
);
alter table public.meal_plans enable row level security;
drop policy if exists "본인 식단만 접근" on public.meal_plans;
create policy "본인 식단만 접근" on public.meal_plans for all using (auth.uid() = user_id);

-- 4. favorites
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  meal_name text not null,
  meal_data jsonb not null,
  created_at timestamptz default now(),
  unique(user_id, meal_name)
);
alter table public.favorites enable row level security;
drop policy if exists "본인 즐겨찾기만 접근" on public.favorites;
create policy "본인 즐겨찾기만 접근" on public.favorites for all using (auth.uid() = user_id);

-- 5. 재료 건의 게시판
create table if not exists public.ingredient_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  name text not null,
  reason text,
  votes integer default 0 not null,
  created_at timestamptz default now()
);
alter table public.ingredient_requests enable row level security;
drop policy if exists "누구나 읽기 가능" on public.ingredient_requests;
drop policy if exists "로그인 사용자 건의 가능" on public.ingredient_requests;
drop policy if exists "누구나 추천 가능" on public.ingredient_requests;
create policy "누구나 읽기 가능" on public.ingredient_requests for select using (true);
create policy "로그인 사용자 건의 가능" on public.ingredient_requests for insert with check (auth.uid() = user_id);
create policy "누구나 추천 가능" on public.ingredient_requests for update using (true);

-- 6. 신규 유저 프로필 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. 기존 유저 프로필 소급 생성 (이미 가입된 유저 포함)
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
