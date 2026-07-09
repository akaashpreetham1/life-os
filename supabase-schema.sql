create table if not exists public.life_os_state (
  key text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.life_os_state enable row level security;

-- The app uses a server-side Supabase service role key, so users never see
-- database credentials in the browser. Sites access control protects the app.
