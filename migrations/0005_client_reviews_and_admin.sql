-- 0005_client_reviews_and_admin.sql
-- Adds client reviews table, admin moderation columns, and sample agents/reviews.

-- 1. Create reviews table
create table if not exists reviews (
  id                  serial primary key,
  agent_user_id       text not null,
  listing_id          integer references listings (id) on delete set null,
  client_name         text not null,
  client_email        text not null default '',
  client_phone        text not null default '',
  client_role         text not null default 'Tenant', -- 'Tenant', 'Buyer', 'Landlord', 'Visitor'
  rating              integer not null check (rating >= 1 and rating <= 5),
  title               text not null,
  comment             text not null,
  status              text not null default 'published', -- 'pending', 'published', 'flagged'
  is_verified_client  boolean not null default true,
  admin_notes         text default '',
  created_at          timestamptz not null default now()
);

create index if not exists reviews_agent_user_id_idx on reviews (agent_user_id);
create index if not exists reviews_status_idx on reviews (status);

-- 2. Add admin review metadata to agents
alter table agents
  add column if not exists id_rejection_reason text default '',
  add column if not exists id_reviewed_at timestamptz,
  add column if not exists is_suspended boolean not null default false,
  add column if not exists admin_role text not null default 'agent';

-- 3. Add moderation and featured flags to listings
alter table listings
  add column if not exists is_featured boolean not null default false,
  add column if not exists moderation_status text not null default 'approved';

-- 4. Seed demo agents with diverse verification states for ID review testing
insert into agents (user_id, slug, display_name, phone, bio, avatar_url, id_document_url, id_verification_status, created_at)
values
(
  'agent-emeka-okafor',
  'emeka-okafor',
  'Emeka Okafor',
  '08031234567',
  'Realtor specializing in commercial and residential leases across Victoria Island and Ikoyi.',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  'pending_review',
  now() - interval '2 days'
),
(
  'agent-bolanle-lawal',
  'bolanle-lawal',
  'Bolanle Lawal',
  '08129876543',
  'Certified Lagos property agent with focus on family homes in Ikeja GRA and Magodo Phase 2.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
  'verified',
  now() - interval '14 days'
),
(
  'agent-tunde-bakare',
  'tunde-bakare',
  'Tunde Bakare',
  '09087654321',
  'Yaba & Surulere rental specialist. Student apartments, tech cluster housing and serviced flats.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  null,
  'not_submitted',
  now() - interval '5 days'
)
on conflict (user_id) do nothing;

-- 5. Seed realistic client reviews for showcase and new agents
insert into reviews (agent_user_id, listing_id, client_name, client_email, client_phone, client_role, rating, title, comment, status, is_verified_client, created_at)
values
(
  'showcase-adeola',
  null,
  'Kelechi Nwosu',
  'kelechi.n@example.com',
  '08035559988',
  'Tenant',
  5,
  'Honest walk-through and smooth key handover!',
  'Adeola personally walked me through the 3-bed duplex in Lekki Phase 1 on a Saturday morning. Everything in the description matched reality — water was running, inverter was functional, and deed verification gave my family total peace of mind.',
  'published',
  true,
  now() - interval '3 days'
),
(
  'showcase-adeola',
  null,
  'Dr. Folake Davies',
  'folake.d@example.com',
  '08172223344',
  'Tenant',
  5,
  'Zero agency drama. Highly recommended!',
  'Finding a genuine apartment in Ikoyi without dealing with fake caretakers is almost impossible in Lagos. Adeola showed legitimate ownership papers within 24 hours. Rent payment went directly to the confirmed landlord account.',
  'published',
  true,
  now() - interval '8 days'
),
(
  'showcase-adeola',
  null,
  'Babatunde Alabi',
  'b.alabi@example.com',
  '07081112233',
  'Buyer',
  4,
  'Very professional and responsive on WhatsApp',
  'Communicated clearly about estate service charges and power schedules before we made a deposit. Solid inspection experience.',
  'published',
  true,
  now() - interval '12 days'
),
(
  'agent-emeka-okafor',
  null,
  'Simi Adeleke',
  'simi.adeleke@example.com',
  '08169990011',
  'Tenant',
  5,
  'Speedy verification and genuine listing',
  'Emeka was prompt and courteous. Inspected the flat on Friday afternoon and concluded lease agreement by Tuesday.',
  'published',
  true,
  now() - interval '1 day'
),
(
  'agent-bolanle-lawal',
  null,
  'Oluwaseun Balogun',
  'seun.balogun@example.com',
  '09094445566',
  'Landlord',
  5,
  'Found verified tenants in under 2 weeks',
  'Bolanle handled tenant screening with extreme care. Both tenants provided valid employment confirmation and government IDs.',
  'published',
  true,
  now() - interval '6 days'
),
(
  'showcase-adeola',
  null,
  'Anonymous Visitor',
  'spam.bot@test.com',
  '08000000000',
  'Visitor',
  1,
  'Spam inquiry or duplicate',
  'Call me back urgently with crypto discounts.',
  'flagged',
  false,
  now() - interval '4 hours'
);
