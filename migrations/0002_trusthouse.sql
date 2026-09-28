-- TrustHouse agents, listings, and buyer inquiries.

create table if not exists agents (
  user_id      text primary key,
  slug         text not null unique,
  display_name text not null,
  phone        text not null default '',
  bio          text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists agents_slug_idx on agents (slug);

create table if not exists listings (
  id                   serial primary key,
  user_id              text not null,
  title                text not null,
  area                 text not null,
  yearly_rent          integer not null,
  bedrooms             integer not null default 1,
  bathrooms            integer not null default 1,
  description          text not null default '',
  photo_url            text not null,
  proof_id_checked     boolean not null default false,
  proof_ownership_seen boolean not null default false,
  proof_onsite_visit   boolean not null default false,
  proof_owner_phone    boolean not null default false,
  created_at           timestamptz not null default now()
);

create index if not exists listings_user_id_idx on listings (user_id);

create table if not exists inquiries (
  id            serial primary key,
  listing_id    integer not null references listings (id) on delete cascade,
  agent_user_id text not null,
  buyer_name    text not null,
  buyer_phone   text not null,
  message       text not null default '',
  status        text not null default 'new',
  follow_up_due timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists inquiries_agent_idx on inquiries (agent_user_id);
create index if not exists inquiries_listing_idx on inquiries (listing_id);

-- Showcase agent so the public marketplace is browseable before anyone signs up.
insert into agents (user_id, slug, display_name, phone, bio)
values (
  'showcase-adeola',
  'adeola',
  'Adeola Okonkwo',
  '08025550148',
  'Independent agent covering Lekki, Ikoyi, and the Island. I only list homes I have walked through.'
);

insert into listings (
  user_id, title, area, yearly_rent, bedrooms, bathrooms, description, photo_url,
  proof_id_checked, proof_ownership_seen, proof_onsite_visit, proof_owner_phone
) values
(
  'showcase-adeola',
  'Serviced 3-bed duplex, Lekki Phase 1',
  'Lekki Phase 1',
  8000000,
  3,
  3,
  'Quiet street off Admiralty. POP ceilings, fitted kitchen, prepaid meter, and 24-hour estate security. Compound can take two cars. I checked the owner''s ID, saw the deed of assignment, walked the house, and confirmed the owner on a live call.',
  '/listings/lekki-duplex.jpg',
  true, true, true, true
),
(
  'showcase-adeola',
  'Lagoon-view 2-bed in Ikoyi',
  'Ikoyi',
  15000000,
  2,
  2,
  'High floor with a wide lagoon aspect. Serviced building, backup power, treated water. Ideal for someone who wants to be on the Island without a long commute. All four proofs completed.',
  '/listings/ikoyi-apartment.jpg',
  true, true, true, true
),
(
  'showcase-adeola',
  'Victoria Island penthouse with terrace',
  'Victoria Island',
  25000000,
  4,
  4,
  'Top-floor residence with a private terrace facing the lagoon. Generator, inverter, and a doorman building. Ownership papers seen; site visit and photos done. Owner ID still being confirmed.',
  '/listings/vi-penthouse.jpg',
  false, true, true, true
),
(
  'showcase-adeola',
  'Bright studio near Yaba Tech',
  'Yaba',
  2400000,
  1,
  1,
  'Compact, newly painted studio within a short walk of the market and BRT. Prepaid meter, water in the flat. I have visited and photographed it; documents and owner ID are pending.',
  '/listings/yaba-studio.jpg',
  false, false, true, false
),
(
  'showcase-adeola',
  'Family bungalow in Ikeja GRA',
  'Ikeja GRA',
  5500000,
  3,
  2,
  'Single-level home with a garden and a wide veranda. Good for a family that wants space without a staircase. ID checked, papers seen, visit done, owner confirmed.',
  '/listings/ikeja-bungalow.jpg',
  true, true, true, true
),
(
  'showcase-adeola',
  '2-bed apartment, Surulere',
  'Surulere',
  3200000,
  2,
  2,
  'First-floor flat on a residential street near National Stadium. Tiled throughout, good natural light, borehole and tank. Partly verified — visit and owner phone done; papers still with the lawyer.',
  '/listings/surulere-apartment.jpg',
  false, false, true, true
),
(
  'showcase-adeola',
  'New mini-flat in Ajah',
  'Ajah',
  2800000,
  1,
  1,
  'Recently finished block off the Addax road. Gated compound, parking for one car. Listed from photos the owner sent — I have not visited yet, so this one is unverified.',
  '/listings/ajah-miniflat.jpg',
  false, false, false, false
),
(
  'showcase-adeola',
  '4-bed duplex, Magodo GRA',
  'Magodo',
  7500000,
  4,
  4,
  'Corner unit with a two-car garage and a small BQ. Estate security, tarred streets. I have seen the owner''s ID and walked the house; the deed is with the family lawyer this week.',
  '/listings/magodo-duplex.jpg',
  true, false, true, true
);

insert into inquiries (listing_id, agent_user_id, buyer_name, buyer_phone, message, status, follow_up_due, created_at)
select id, 'showcase-adeola', 'Chinedu Eze', '08034452210',
  'Good afternoon. Is the Lekki duplex still available for April? I can view this weekend.',
  'new', now() - interval '6 hours', now() - interval '2 days'
from listings where title = 'Serviced 3-bed duplex, Lekki Phase 1' limit 1;

insert into inquiries (listing_id, agent_user_id, buyer_name, buyer_phone, message, status, follow_up_due, created_at)
select id, 'showcase-adeola', 'Fatima Bello', '07018893344',
  'Please send a video of the lagoon view and confirm if two parking spots are included.',
  'contacted', now() + interval '18 hours', now() - interval '1 day'
from listings where title = 'Lagoon-view 2-bed in Ikoyi' limit 1;

insert into inquiries (listing_id, agent_user_id, buyer_name, buyer_phone, message, status, follow_up_due, created_at)
select id, 'showcase-adeola', 'Tosin Adeyemi', '08162201199',
  'We are relocating from Abuja in June. Can we book a viewing for the GRA bungalow?',
  'viewing_booked', now() + interval '2 days', now() - interval '8 hours'
from listings where title = 'Family bungalow in Ikeja GRA' limit 1;

insert into inquiries (listing_id, agent_user_id, buyer_name, buyer_phone, message, status, follow_up_due, created_at)
select id, 'showcase-adeola', 'Ngozi Umeh', '09055501820',
  'Is the rent negotiable if we pay two years upfront?',
  'new', now() - interval '1 day', now() - interval '3 days'
from listings where title = '2-bed apartment, Surulere' limit 1;

insert into inquiries (listing_id, agent_user_id, buyer_name, buyer_phone, message, status, follow_up_due, created_at)
select id, 'showcase-adeola', 'Ibrahim Sule', '08091127730',
  'Thank you — we have taken another place.',
  'closed', now() - interval '5 days', now() - interval '10 days'
from listings where title = 'New mini-flat in Ajah' limit 1;

insert into inquiries (listing_id, agent_user_id, buyer_name, buyer_phone, message, status, follow_up_due, created_at)
select id, 'showcase-adeola', 'Amaka Obi', '08145330912',
  'Does the Magodo duplex have a BQ, and is the estate service charge included?',
  'contacted', now() + interval '4 hours', now() - interval '12 hours'
from listings where title = '4-bed duplex, Magodo GRA' limit 1;
