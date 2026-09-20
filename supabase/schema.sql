-- Esquema de apliknte. Pegar entero en Supabase > SQL Editor > Run.

create table if not exists public.cv_versions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  label      text not null,
  file_path  text,
  created_at timestamptz not null default now(),
  unique (user_id, label)
);

create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  company       text not null,
  role          text not null,
  source        text,
  url           text,
  work_mode     text,
  salary_min    int,
  salary_max    int,
  applied_on    date not null default current_date,
  cv_version_id uuid references public.cv_versions on delete set null,
  status        text not null default 'aplicado',
  follow_up_on  date,
  followed_up   boolean not null default false,
  notes         text,
  created_at    timestamptz not null default now()
);

create index if not exists applications_user_applied_idx
  on public.applications (user_id, applied_on desc);

alter table public.cv_versions  enable row level security;
alter table public.applications enable row level security;

-- Cada usuario solo ve y toca lo suyo. Sin esto, cualquiera leeria todo.
create policy "own cv_versions" on public.cv_versions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own applications" on public.applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
