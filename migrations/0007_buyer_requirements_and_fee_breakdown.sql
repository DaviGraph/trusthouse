-- 0007_buyer_requirements_and_fee_breakdown.sql
-- 1. Add explicit financial columns to listings table
alter table listings
  add column if not exists agency_fee numeric default 0,
  add column if not exists legal_fee numeric default 0,
  add column if not exists caution_fee numeric default 0,
  add column if not exists service_charge numeric default 0;

-- Ensure agents table has a unique UUID id column for foreign key references
alter table agents
  add column if not exists id uuid default gen_random_uuid() unique;

-- 2. Create buyer_requirements table for structured buyer intake
create table if not exists buyer_requirements (
  id                 uuid primary key default gen_random_uuid(),
  agent_id           uuid references agents(id) on delete cascade,
  buyer_name         text not null,
  buyer_phone        text not null,
  buyer_email        text,
  property_type      text not null,
  preferred_location text not null,
  budget_min         numeric default 0,
  budget_max         numeric not null,
  bedrooms           integer default 1,
  timeline           text default 'Immediate',
  status             text default 'New',
  followup_due_date  timestamptz,
  created_at         timestamptz default now()
);

create index if not exists buyer_requirements_agent_id_idx on buyer_requirements (agent_id);
create index if not exists buyer_requirements_status_idx on buyer_requirements (status);
