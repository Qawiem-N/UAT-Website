-- UAT schema (run inside Supabase SQL editor)

create table if not exists uat_project (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  test_version text not null,
  month text not null,
  created_at timestamptz not null default now()
);

create table if not exists participant (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references uat_project(id) on delete cascade,
  demo_account text,
  role text,
  name text,
  email text,
  participant_type text,
  created_at timestamptz not null default now()
);

create table if not exists test_case (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references uat_project(id) on delete cascade,
  test_number text,
  category text,
  role text,
  test_scenario text,
  preconditions text,
  test_steps text,
  expected_results text,
  actual_results text,
  status text,
  remarks text
);

create table if not exists approval_signoff (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references uat_project(id) on delete cascade,
  role text,
  name text,
  unit text,
  date text,
  signature_file_path text,
  verified_by text,
  remarks text,
  month text,
  created_at timestamptz not null default now()
);

create table if not exists change_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references uat_project(id) on delete cascade,
  entity text,
  entity_id uuid,
  field text,
  old_value text,
  new_value text,
  user_name text,
  created_at timestamptz not null default now()
);

-- Basic open policies for anon demo (tighten for production)
alter table uat_project enable row level security;
alter table participant enable row level security;
alter table test_case enable row level security;
alter table approval_signoff enable row level security;
alter table change_log enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'uat_project') then
    create policy "anon full access uat_project" on uat_project for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'participant') then
    create policy "anon full access participant" on participant for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'test_case') then
    create policy "anon full access test_case" on test_case for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'approval_signoff') then
    create policy "anon full access approval_signoff" on approval_signoff for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'change_log') then
    create policy "anon full access change_log" on change_log for all using (true) with check (true);
  end if;
end$$;

