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

-- La puerta general: sin esto la app no puede tocar la tabla, por mucho que las politicas
-- de abajo lo permitan. Supabase lo hacia solo al crear cada tabla, pero desde el
-- 30-10-2026 hay que escribirlo. "anon" (sin sesion iniciada) no recibe nada.
grant select, insert, update, delete on public.cv_versions  to authenticated, service_role;
grant select, insert, update, delete on public.applications to authenticated, service_role;

alter table public.cv_versions  enable row level security;
alter table public.applications enable row level security;

-- Cada usuario solo ve y toca lo suyo. Sin esto, cualquiera leeria todo.
create policy "own cv_versions" on public.cv_versions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own applications" on public.applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Almacen privado de CVs: solo PDF y hasta 5 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

-- Cada usuario solo puede tocar su carpeta: cvs/<su id>/archivo.pdf
create policy "own cvs select" on storage.objects for select
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own cvs insert" on storage.objects for insert
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own cvs delete" on storage.objects for delete
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

-- Mensajes de ayuda y sugerencias. Los usuarios solo pueden escribir (no leer):
-- se leen desde el panel de Supabase. El correo va para poder contestar.
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  email      text,
  kind       text not null check (kind in ('error', 'idea', 'duda')),
  message    text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- Los usuarios solo escriben; leerlas es cosa del panel de Supabase.
grant insert on public.feedback to authenticated;
grant select, insert, update, delete on public.feedback to service_role;

alter table public.feedback enable row level security;

create policy "send own feedback" on public.feedback
  for insert with check (auth.uid() = user_id);

-- Borrar la propia cuenta. Corre con permisos del duenno de la funcion (por eso puede
-- tocar auth.users), pero solo borra la fila de quien llama: auth.uid(). Asi no hace
-- falta guardar en ningun sitio la llave de administrador de Supabase.
-- Al borrar el usuario caen sus candidaturas y sus CVs por cascada; los PDF del almacen
-- los borra la app antes, que esos no van en cascada.
create or replace function public.delete_account()
returns void
language sql
security definer
set search_path = ''
as $$ delete from auth.users where id = auth.uid(); $$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
