-- 사용자 프로필 (auth.users 연동)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  goal text check (goal in ('lose', 'maintain', 'bulk')) default 'maintain',
  activity_level text check (activity_level in ('low', 'medium', 'high')) default 'medium',
  exclude_ingredients text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 재료 마스터 테이블
create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  emoji text not null default '🥗',
  category text check (category in ('vegetable', 'meat', 'seafood', 'dairy', 'grain', 'fruit', 'other')) not null,
  created_at timestamptz default now()
);

-- 사용자 냉장고 재료
create table if not exists public.user_ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  ingredient_id uuid references public.ingredients on delete cascade not null,
  expires_at date,
  added_at timestamptz default now(),
  unique(user_id, ingredient_id)
);

-- 생성된 식단 저장
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  plan_data jsonb not null,
  ingredients_used text[] not null,
  created_at timestamptz default now()
);

-- RLS 정책
alter table public.profiles enable row level security;
alter table public.user_ingredients enable row level security;
alter table public.meal_plans enable row level security;

create policy "본인 프로필만 접근" on public.profiles
  for all using (auth.uid() = id);

create policy "본인 재료만 접근" on public.user_ingredients
  for all using (auth.uid() = user_id);

create policy "본인 식단만 접근" on public.meal_plans
  for all using (auth.uid() = user_id);

-- ingredients는 누구나 읽기 가능
alter table public.ingredients enable row level security;
create policy "재료 목록 공개 읽기" on public.ingredients
  for select using (true);

-- 자동 updated_at 트리거
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- 신규 유저 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 기본 재료 데이터 (한식 특화)
insert into public.ingredients (name, emoji, category) values
  -- 채소
  ('양파', '🧅', 'vegetable'),
  ('마늘', '🧄', 'vegetable'),
  ('대파', '🌿', 'vegetable'),
  ('당근', '🥕', 'vegetable'),
  ('감자', '🥔', 'vegetable'),
  ('고추', '🌶️', 'vegetable'),
  ('애호박', '🥒', 'vegetable'),
  ('시금치', '🥬', 'vegetable'),
  ('배추', '🥬', 'vegetable'),
  ('버섯', '🍄', 'vegetable'),
  ('토마토', '🍅', 'vegetable'),
  ('브로콜리', '🥦', 'vegetable'),
  ('콩나물', '🌱', 'vegetable'),
  ('두부', '⬜', 'vegetable'),
  -- 육류
  ('닭가슴살', '🍗', 'meat'),
  ('돼지고기', '🥩', 'meat'),
  ('소고기', '🥩', 'meat'),
  ('달걀', '🥚', 'meat'),
  -- 해산물
  ('새우', '🍤', 'seafood'),
  ('오징어', '🦑', 'seafood'),
  ('참치캔', '🐟', 'seafood'),
  ('멸치', '🐟', 'seafood'),
  -- 유제품
  ('우유', '🥛', 'dairy'),
  ('치즈', '🧀', 'dairy'),
  -- 곡류
  ('쌀', '🍚', 'grain'),
  ('면', '🍜', 'grain'),
  ('빵', '🍞', 'grain'),
  -- 과일
  ('사과', '🍎', 'fruit'),
  ('바나나', '🍌', 'fruit'),
  ('레몬', '🍋', 'fruit')
on conflict (name) do nothing;
