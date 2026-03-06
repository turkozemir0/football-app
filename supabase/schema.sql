create extension if not exists "uuid-ossp";

create table public.leagues (
  id bigint primary key,
  name text not null,
  country text,
  logo_url text,
  flag_url text,
  season int not null default 2025,
  is_featured boolean default false,
  created_at timestamptz default now()
);

create table public.teams (
  id bigint primary key,
  name text not null,
  short_name text,
  logo_url text,
  country text,
  league_id bigint references public.leagues(id),
  venue_name text,
  venue_city text,
  created_at timestamptz default now()
);

create table public.fixtures (
  id bigint primary key,
  league_id bigint references public.leagues(id),
  season int not null,
  round text,
  date timestamptz not null,
  status_short text,
  status_long text,
  home_team_id bigint references public.teams(id),
  away_team_id bigint references public.teams(id),
  home_goals int,
  away_goals int,
  stats jsonb,
  ai_preview text,
  ai_prediction jsonb,
  ai_review text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
