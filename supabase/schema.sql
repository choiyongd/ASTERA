-- ============================================================
-- ASTERA 기본 스키마
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 붙여넣고 실행하세요.
-- ============================================================

-- 1) 회원 프로필 (auth.users 1:1) -------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  is_member boolean not null default false,
  membership_expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 로그인한 본인만 자신의 프로필을 조회할 수 있습니다.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- 멤버십 필드는 오직 서버(service_role)에서만 갱신합니다.
-- 사용자가 직접 is_member 를 true로 바꿀 수 없도록 update 정책을 두지 않습니다.

-- 회원가입 시 자동으로 프로필 행을 만들어주는 트리거 ------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) 주문 / 결제 내역 ---------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,          -- 토스페이먼츠에 전달하는 주문 ID
  user_id uuid not null references auth.users (id) on delete cascade,
  order_name text not null,
  amount integer not null,
  status text not null default 'pending', -- pending | paid | failed
  payment_key text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.orders enable row level security;

-- 로그인한 본인의 주문만 조회할 수 있습니다.
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

-- 주문 생성/결제 승인 반영은 오직 서버(service_role)에서만 수행합니다.

-- 3) 뉴스레터 구독 -------------------------------------------------------------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;
-- 구독 등록은 서버(service_role)의 /api/subscribe 를 통해서만 이루어집니다.
-- 별도의 select/insert 정책을 열어두지 않아 외부에서 이메일 목록을 조회할 수 없습니다.
