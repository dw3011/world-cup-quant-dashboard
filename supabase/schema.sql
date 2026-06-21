create extension if not exists "pgcrypto";

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  match_date date not null,
  match_time timestamp with time zone not null,
  home_team text not null,
  away_team text not null,
  home_flag text,
  away_flag text,
  group_name text,
  stage text,
  status text default 'UPCOMING',
  score_home integer,
  score_away integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.odds_snapshots (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade,
  source text default '体彩',
  win_odds numeric,
  draw_odds numeric,
  loss_odds numeric,
  handicap_line numeric,
  handicap_win_odds numeric,
  handicap_draw_odds numeric,
  handicap_loss_odds numeric,
  raw_text text,
  created_at timestamp with time zone default now()
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade,
  odds_snapshot_id uuid references public.odds_snapshots(id) on delete set null,
  win_prob_home numeric,
  draw_prob numeric,
  win_prob_away numeric,
  predicted_scores jsonb,
  goals_range text,
  risk_level text,
  model_reason text,
  created_at timestamp with time zone default now()
);

create table if not exists public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade,
  prediction_id uuid references public.predictions(id) on delete set null,
  report jsonb,
  summary text,
  created_at timestamp with time zone default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade,
  prediction_id uuid references public.predictions(id) on delete set null,
  actual_score_home integer,
  actual_score_away integer,
  hit_result boolean,
  hit_goals_range boolean,
  hit_score_accuracy text,
  error_analysis text,
  adjustment_suggestion text,
  created_at timestamp with time zone default now()
);

create index if not exists matches_match_date_idx on public.matches(match_date);
create index if not exists odds_snapshots_match_id_idx on public.odds_snapshots(match_id);
create index if not exists predictions_match_id_idx on public.predictions(match_id);
create index if not exists ai_reports_match_id_idx on public.ai_reports(match_id);
create index if not exists reviews_match_id_idx on public.reviews(match_id);

create unique index if not exists predictions_match_id_unique_idx on public.predictions(match_id);
create unique index if not exists ai_reports_match_id_unique_idx on public.ai_reports(match_id);
create unique index if not exists reviews_match_id_unique_idx on public.reviews(match_id);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
