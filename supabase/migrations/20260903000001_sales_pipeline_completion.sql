-- =====================================================================
-- SALES PIPELINE COMPLETION
-- Adds: crm_opportunities, crm_proposals, crm_proposal_items,
--       crm_audit_logs, contract activation, client health score infra,
--       and DB-side automations (triggers) for the lead -> opportunity ->
--       proposal -> project flow.
--
-- Environment: DEV. No production data to preserve — free to reshape.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'crm_opportunity_status') then
    create type public.crm_opportunity_status as enum
      ('qualified', 'meeting', 'proposal', 'negotiation', 'won', 'lost');
  end if;
end $$;

-- Trim crm_leads down to pure intake/triage states. Leads that qualify
-- become an opportunity; the lead itself just needs to know it converted.
do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'disqualified'
      and enumtypid = (select oid from pg_type where typname = 'crm_lead_status')
  ) then
    alter type public.crm_lead_status add value 'disqualified';
  end if;
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'converted'
      and enumtypid = (select oid from pg_type where typname = 'crm_lead_status')
  ) then
    alter type public.crm_lead_status add value 'converted';
  end if;
end $$;
-- Note: 'proposal', 'negotiation', 'closed_won', 'closed_lost' remain valid
-- historical values on crm_lead_status for backward compatibility with any
-- existing rows, but new code should stop writing them — that pipeline now
-- lives on crm_opportunities.status instead.

-- ---------------------------------------------------------------------
-- 2. OPPORTUNITIES
-- ---------------------------------------------------------------------

create table if not exists public.crm_opportunities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid references public.crm_leads(id) on delete set null,
  company_id uuid references public.crm_companies(id) on delete set null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  name text not null,
  status public.crm_opportunity_status not null default 'qualified',
  estimated_value numeric(12,2) default 0,
  probability smallint not null default 20 check (probability between 0 and 100),
  priority text default 'medium' check (priority in ('low','medium','high')),
  owner_id uuid references auth.users(id),
  expected_close_date date,
  lost_reason text,
  notes text,
  won_at timestamptz,
  lost_at timestamptz
);

create index if not exists idx_opportunities_status on public.crm_opportunities(status);
create index if not exists idx_opportunities_company on public.crm_opportunities(company_id);
create index if not exists idx_opportunities_lead on public.crm_opportunities(lead_id);

grant select, insert, update, delete on public.crm_opportunities to authenticated;
grant all on public.crm_opportunities to service_role;
alter table public.crm_opportunities enable row level security;

create policy "Admins can manage opportunities" on public.crm_opportunities
  for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- 3. PROPOSALS + PROPOSAL ITEMS
-- ---------------------------------------------------------------------
-- crm_proposal_status enum already exists (draft, sent, viewed,
-- negotiation, accepted, rejected, expired) — defined previously but
-- unused. We adopt it here.

create table if not exists public.crm_proposals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  opportunity_id uuid references public.crm_opportunities(id) on delete set null,
  lead_id uuid references public.crm_leads(id) on delete set null,
  company_id uuid references public.crm_companies(id) on delete set null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  project_id uuid references public.crm_projects(id) on delete set null,
  proposal_number serial,
  title text not null,
  status public.crm_proposal_status not null default 'draft',
  total_value numeric(12,2) default 0,
  valid_until date,
  document_url text,
  notes text,
  created_by uuid references auth.users(id),
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  converted_project_id uuid references public.crm_projects(id) on delete set null
);

create table if not exists public.crm_proposal_items (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.crm_proposals(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  sort_order int not null default 0,
  total numeric(12,2) generated always as (quantity * unit_price) stored
);

create index if not exists idx_proposals_status on public.crm_proposals(status);
create index if not exists idx_proposals_opportunity on public.crm_proposals(opportunity_id);
create index if not exists idx_proposal_items_proposal on public.crm_proposal_items(proposal_id);

grant select, insert, update, delete on public.crm_proposals to authenticated;
grant select, insert, update, delete on public.crm_proposal_items to authenticated;
grant all on public.crm_proposals to service_role;
grant all on public.crm_proposal_items to service_role;
grant usage, select on sequence public.crm_proposals_proposal_number_seq to authenticated;

alter table public.crm_proposals enable row level security;
alter table public.crm_proposal_items enable row level security;

create policy "Admins can manage proposals" on public.crm_proposals
  for all to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can manage proposal items" on public.crm_proposal_items
  for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Keep total_value on the proposal in sync with its items automatically.
create or replace function public.fn_sync_proposal_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.crm_proposals
  set total_value = coalesce((
    select sum(total) from public.crm_proposal_items
    where proposal_id = coalesce(new.proposal_id, old.proposal_id)
  ), 0),
  updated_at = now()
  where id = coalesce(new.proposal_id, old.proposal_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_proposal_total on public.crm_proposal_items;
create trigger trg_sync_proposal_total
after insert or update or delete on public.crm_proposal_items
for each row execute function public.fn_sync_proposal_total();

-- ---------------------------------------------------------------------
-- 4. AUDIT LOGS (separate from crm_activity_logs)
-- ---------------------------------------------------------------------
-- crm_activity_logs = human-readable feed ("Lead converted", "Note added").
-- crm_audit_logs   = compliance-grade field-level diff, written
--                    automatically by trigger, never by app code.

create table if not exists public.crm_audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null check (action in ('insert', 'update', 'delete')),
  field_name text,
  old_value jsonb,
  new_value jsonb
);

create index if not exists idx_audit_entity on public.crm_audit_logs(entity_type, entity_id);
create index if not exists idx_audit_created on public.crm_audit_logs(created_at desc);

grant select, insert on public.crm_audit_logs to authenticated;
grant all on public.crm_audit_logs to service_role;
alter table public.crm_audit_logs enable row level security;

create policy "Admins can view audit logs" on public.crm_audit_logs
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "System can insert audit logs" on public.crm_audit_logs
  for insert to authenticated with check (true);

-- Generic row-diff trigger function. Attach to any table; it compares
-- OLD vs NEW column-by-column and writes one crm_audit_logs row per
-- changed column. Uses to_jsonb() so it works on any table shape.
create or replace function public.fn_audit_row_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_row jsonb;
  new_row jsonb;
  key text;
  actor uuid;
begin
  actor := auth.uid();

  if tg_op = 'INSERT' then
    insert into public.crm_audit_logs (user_id, entity_type, entity_id, action, new_value)
    values (actor, tg_table_name, new.id, 'insert', to_jsonb(new));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.crm_audit_logs (user_id, entity_type, entity_id, action, old_value)
    values (actor, tg_table_name, old.id, 'delete', to_jsonb(old));
    return old;
  else
    old_row := to_jsonb(old);
    new_row := to_jsonb(new);
    for key in select jsonb_object_keys(new_row) loop
      if key in ('updated_at') then
        continue;
      end if;
      if old_row -> key is distinct from new_row -> key then
        insert into public.crm_audit_logs
          (user_id, entity_type, entity_id, action, field_name, old_value, new_value)
        values (actor, tg_table_name, new.id, 'update', key, old_row -> key, new_row -> key);
      end if;
    end loop;
    return new;
  end if;
end;
$$;

-- Attach to the tables that matter for compliance/history.
do $$
declare
  t text;
begin
  foreach t in array array[
    'crm_leads', 'crm_opportunities', 'crm_proposals',
    'crm_projects', 'crm_contracts', 'crm_companies', 'crm_finances'
  ] loop
    execute format('drop trigger if exists trg_audit_%1$s on public.%1$s;', t);
    execute format(
      'create trigger trg_audit_%1$s after insert or update or delete on public.%1$s
       for each row execute function public.fn_audit_row_changes();', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 5. CONTRACTS — activate (RLS was missing; table existed unused)
-- ---------------------------------------------------------------------

grant select, insert, update, delete on public.crm_contracts to authenticated;
grant all on public.crm_contracts to service_role;
alter table public.crm_contracts enable row level security;

drop policy if exists "Admins can manage contracts" on public.crm_contracts;
create policy "Admins can manage contracts" on public.crm_contracts
  for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- 6. CLIENT HEALTH SCORE (persisted, computed asynchronously by cron)
-- ---------------------------------------------------------------------

alter table public.crm_companies
  add column if not exists health_score_numeric int,
  add column if not exists health_status text
    check (health_status in ('Healthy', 'At Risk', 'Critical')),
  add column if not exists health_rationale jsonb default '[]'::jsonb,
  add column if not exists health_calculated_at timestamptz;

-- Computes and persists health score for every active/prospective company.
-- Mirrors the rule-based scoring already used for projects
-- (calculateProjectHealth in crm.functions.ts) but aggregated at client level.
create or replace function public.calculate_all_client_health_scores()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  c record;
  score int;
  rationale jsonb;
  recent_activity_count int;
  overdue_tasks_count int;
  overdue_invoices_count int;
  open_proposals_count int;
  active_projects_count int;
  status text;
begin
  for c in select id from public.crm_companies where status <> 'inactive' loop
    score := 70;
    rationale := '[]'::jsonb;

    select count(*) into recent_activity_count
    from public.crm_activity_logs
    where entity_id = c.id and created_at > now() - interval '14 days';

    if recent_activity_count = 0 then
      score := score - 15;
      rationale := rationale || jsonb_build_array('Sem atividade registada nos últimos 14 dias');
    else
      score := score + 5;
    end if;

    select count(*) into overdue_tasks_count
    from public.crm_tasks t
    join public.crm_projects p on p.id = t.project_id
    where p.company_id = c.id and t.due_date < current_date and t.status <> 'done';

    if overdue_tasks_count > 0 then
      score := score - least(overdue_tasks_count * 5, 20);
      rationale := rationale || jsonb_build_array(overdue_tasks_count || ' tarefa(s) em atraso');
    end if;

    select count(*) into overdue_invoices_count
    from public.crm_finances f
    join public.crm_projects p on p.id = f.project_id
    where p.company_id = c.id and f.type = 'income' and f.status = 'overdue';

    if overdue_invoices_count > 0 then
      score := score - least(overdue_invoices_count * 8, 25);
      rationale := rationale || jsonb_build_array(overdue_invoices_count || ' fatura(s) em atraso');
    end if;

    select count(*) into open_proposals_count
    from public.crm_proposals
    where company_id = c.id and status in ('sent', 'viewed', 'negotiation');

    if open_proposals_count > 0 then
      score := score + 5;
    end if;

    select count(*) into active_projects_count
    from public.crm_projects
    where company_id = c.id and status = 'active';

    if active_projects_count = 0 then
      score := score - 10;
      rationale := rationale || jsonb_build_array('Sem projetos ativos neste momento');
    end if;

    score := greatest(0, least(100, score));

    status := case
      when score < 40 then 'Critical'
      when score < 70 then 'At Risk'
      else 'Healthy'
    end;

    update public.crm_companies
    set health_score_numeric = score,
        health_status = status,
        health_rationale = rationale,
        health_calculated_at = now()
    where id = c.id;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 7. AUTOMATIONS (triggers for synchronous, event-driven workflows)
-- ---------------------------------------------------------------------

-- 7a. Opportunity -> WON: mark lead as converted, promote company to
--     'active' (i.e. it becomes a real client), log an activity entry.
--     Does NOT create a project automatically — that only happens when a
--     proposal is explicitly converted (see 7b), to avoid empty/duplicate
--     projects.
create or replace function public.fn_handle_opportunity_won()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'won' and old.status is distinct from 'won' then
    new.won_at := now();

    if new.lead_id is not null then
      update public.crm_leads set status = 'converted' where id = new.lead_id;
    end if;

    if new.company_id is not null then
      update public.crm_companies set status = 'active' where id = new.company_id;
    end if;

    insert into public.crm_activity_logs (user_id, action, entity_type, entity_id, details, status)
    values (auth.uid(), 'opportunity_won', 'opportunity', new.id,
      jsonb_build_object('name', new.name, 'value', new.estimated_value), 'success');

  elsif new.status = 'lost' and old.status is distinct from 'lost' then
    new.lost_at := now();
    insert into public.crm_activity_logs (user_id, action, entity_type, entity_id, details, status)
    values (auth.uid(), 'opportunity_lost', 'opportunity', new.id,
      jsonb_build_object('name', new.name, 'reason', new.lost_reason), 'warning');
  end if;

  return new;
end;
$$;

drop trigger if exists trg_opportunity_won on public.crm_opportunities;
create trigger trg_opportunity_won
before update on public.crm_opportunities
for each row execute function public.fn_handle_opportunity_won();

-- 7b. Proposal -> ACCEPTED: stamp timestamp, push linked opportunity to
--     'negotiation' minimum (does not auto-win it — a human still
--     confirms the deal via the opportunity), log activity. The actual
--     "Convert to Project" is an explicit RPC (see fn_convert_proposal_to_project)
--     so the user controls project naming/dates rather than it firing blind.
create or replace function public.fn_handle_proposal_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    new.accepted_at := now();
    insert into public.crm_activity_logs (user_id, action, entity_type, entity_id, details, status)
    values (auth.uid(), 'proposal_accepted', 'proposal', new.id,
      jsonb_build_object('title', new.title, 'value', new.total_value), 'success');
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    new.rejected_at := now();
    insert into public.crm_activity_logs (user_id, action, entity_type, entity_id, details, status)
    values (auth.uid(), 'proposal_rejected', 'proposal', new.id,
      jsonb_build_object('title', new.title), 'warning');
  elsif new.status = 'sent' and old.status is distinct from 'sent' then
    new.sent_at := now();
  elsif new.status = 'viewed' and old.status is distinct from 'viewed' then
    new.viewed_at := coalesce(old.viewed_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_proposal_status_change on public.crm_proposals;
create trigger trg_proposal_status_change
before update on public.crm_proposals
for each row execute function public.fn_handle_proposal_status_change();

-- 7c. Explicit, atomic "Convert to Project" RPC. Called from the app when
--     the user clicks the action on an ACCEPTED proposal. Runs as a single
--     transaction: creates the project, links it back to the proposal,
--     copies proposal items as a budget reference, and logs activity.
--     Raises if the proposal is not accepted or already converted, so the
--     app can surface a clear error instead of silently duplicating.
create or replace function public.fn_convert_proposal_to_project(
  p_proposal_id uuid,
  p_project_name text,
  p_start_date date default current_date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal record;
  v_project_id uuid;
begin
  select * into v_proposal from public.crm_proposals where id = p_proposal_id for update;

  if v_proposal is null then
    raise exception 'Proposal % not found', p_proposal_id;
  end if;
  if v_proposal.status <> 'accepted' then
    raise exception 'Proposal must be accepted before conversion (current status: %)', v_proposal.status;
  end if;
  if v_proposal.converted_project_id is not null then
    raise exception 'Proposal already converted to project %', v_proposal.converted_project_id;
  end if;

  insert into public.crm_projects (name, company_id, status, start_date, total_value)
  values (p_project_name, v_proposal.company_id, 'planning', p_start_date, v_proposal.total_value)
  returning id into v_project_id;

  update public.crm_proposals
  set converted_project_id = v_project_id, project_id = v_project_id
  where id = p_proposal_id;

  if v_proposal.opportunity_id is not null then
    update public.crm_opportunities set status = 'won' where id = v_proposal.opportunity_id and status <> 'won';
  end if;

  insert into public.crm_activity_logs (user_id, action, entity_type, entity_id, details, status)
  values (auth.uid(), 'convert_proposal', 'project', v_project_id,
    jsonb_build_object('proposalId', p_proposal_id, 'proposalTitle', v_proposal.title), 'success');

  return v_project_id;
end;
$$;

grant execute on function public.fn_convert_proposal_to_project(uuid, text, date) to authenticated;
grant execute on function public.calculate_all_client_health_scores() to service_role;

-- ---------------------------------------------------------------------
-- 8. TIME-BASED MAINTENANCE (contract expiry, invoice overdue) — runs
--    via pg_cron -> this SQL function, called hourly from an Edge
--    Function trigger OR directly via pg_cron if the extension is
--    available on this Supabase project.
-- ---------------------------------------------------------------------

create or replace function public.crm_run_scheduled_maintenance()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Mark overdue income as 'overdue'
  update public.crm_finances
  set status = 'overdue'
  where type = 'income'
    and status = 'pending'
    and due_date is not null
    and due_date < current_date;

  -- Notify owners of contracts expiring within 14 days (idempotent: only
  -- if a similar notification wasn't already created for this contract in
  -- the last 7 days).
  insert into public.crm_notifications (user_id, type, title, message, link)
  select
    c.company_id, -- placeholder; app maps company owner separately if needed
    'warning',
    'Contrato a expirar',
    format('O contrato %s expira em %s.', coalesce(c.contract_number, c.id::text), c.end_date),
    '/admin/companies'
  from public.crm_contracts c
  where c.status = 'active'
    and c.end_date is not null
    and c.end_date between current_date and current_date + interval '14 days'
    and not exists (
      select 1 from public.crm_notifications n
      where n.link = '/admin/companies'
        and n.title = 'Contrato a expirar'
        and n.message like '%' || coalesce(c.contract_number, c.id::text) || '%'
        and n.created_at > now() - interval '7 days'
    );

  -- Recompute client health scores in the same maintenance pass.
  perform public.calculate_all_client_health_scores();
end;
$$;

grant execute on function public.crm_run_scheduled_maintenance() to service_role;

comment on function public.crm_run_scheduled_maintenance() is
  'Invoked hourly by the cron-crm-maintenance Edge Function (see supabase/functions/cron-crm-maintenance). Not scheduled via pg_cron directly to keep infra portable across Supabase plans that may not expose the extension.';
