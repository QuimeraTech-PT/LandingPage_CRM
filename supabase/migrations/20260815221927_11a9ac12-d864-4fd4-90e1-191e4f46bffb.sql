-- 1. Enums (crm_lead_status was not found in read_query, but app_role was)
do $$ 
begin
    if not exists (select 1 from pg_type where typname = 'crm_lead_status') then
        create type public.crm_lead_status as enum ('new', 'contacted', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
    end if;
    if not exists (select 1 from pg_type where typname = 'crm_project_status') then
        create type public.crm_project_status as enum ('planning', 'active', 'on_hold', 'completed', 'cancelled');
    end if;
    if not exists (select 1 from pg_type where typname = 'crm_transaction_type') then
        create type public.crm_transaction_type as enum ('income', 'expense');
    end if;
end $$;

-- 2. CRM Leads Table
create table if not exists public.crm_leads (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    name text not null,
    email text,
    phone text,
    company text,
    source text default 'website',
    status crm_lead_status default 'new' not null,
    estimated_value decimal(12, 2) default 0,
    notes text,
    google_drive_folder_id text
);

-- 3. CRM Projects Table
create table if not exists public.crm_projects (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid references public.crm_leads(id) on delete set null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    name text not null,
    status crm_project_status default 'planning' not null,
    start_date date,
    end_date date,
    total_value decimal(12, 2) default 0,
    google_drive_folder_id text
);

-- 4. CRM Finances Table
create table if not exists public.crm_finances (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references public.crm_projects(id) on delete cascade,
    created_at timestamptz default now() not null,
    date date default current_date not null,
    amount decimal(12, 2) not null,
    type crm_transaction_type not null,
    description text not null,
    category text,
    status text default 'pending' -- pending, paid
);

-- 5. User Roles Table (Table check only since app_role enum exists)
create table if not exists public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    unique (user_id, role)
);

-- 6. Grants
grant select, insert, update, delete on public.crm_leads to authenticated;
grant select, insert, update, delete on public.crm_projects to authenticated;
grant select, insert, update, delete on public.crm_finances to authenticated;
grant select on public.user_roles to authenticated;

grant all on public.crm_leads to service_role;
grant all on public.crm_projects to service_role;
grant all on public.crm_finances to service_role;
grant all on public.user_roles to service_role;

-- 7. RLS
alter table public.crm_leads enable row level security;
alter table public.crm_projects enable row level security;
alter table public.crm_finances enable row level security;
alter table public.user_roles enable row level security;

-- Security Definer Function to check roles (or replace if exists)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Admin Policies (Drop before create to be idempotent)
do $$
begin
    drop policy if exists "Admins can manage leads" on public.crm_leads;
    drop policy if exists "Admins can manage projects" on public.crm_projects;
    drop policy if exists "Admins can manage finances" on public.crm_finances;
    drop policy if exists "Admins can view roles" on public.user_roles;
end $$;

create policy "Admins can manage leads" on public.crm_leads
    for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage projects" on public.crm_projects
    for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage finances" on public.crm_finances
    for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can view roles" on public.user_roles
    for select to authenticated using (public.has_role(auth.uid(), 'admin'));
