create extension if not exists "pgcrypto";

create table if not exists public.matches (
  id text primary key default gen_random_uuid()::text,
  home_team text not null,
  home_flag text not null,
  away_team text not null,
  away_flag text not null,
  group_name text not null,
  match_time timestamptz not null,
  status text not null check (status in ('UPCOMING', 'LIVE', 'FINISHED')),
  score_home integer,
  score_away integer,
  venue text,
  ai_status text default '待生成',
  odds jsonb not null,
  manual jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  match_id text not null references public.matches(id) on delete cascade,
  win_prob_home integer not null,
  draw_prob integer not null,
  win_prob_away integer not null,
  predicted_scores jsonb not null,
  goals_range text not null,
  risk_level text not null check (risk_level in ('低', '中低', '中', '中高', '高')),
  model_reason text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(match_id)
);

create table if not exists public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  match_id text not null references public.matches(id) on delete cascade,
  sections jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(match_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  match_id text not null references public.matches(id) on delete cascade,
  actual_score_home integer not null,
  actual_score_away integer not null,
  hit_result boolean not null,
  hit_goals_range boolean not null,
  hit_score_accuracy text not null check (hit_score_accuracy in ('命中', '接近', '未命中')),
  error_analysis text not null,
  adjustment_suggestion text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(match_id)
);
