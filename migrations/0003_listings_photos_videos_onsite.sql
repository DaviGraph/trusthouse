-- Add verification video, multi-photo array, and on-site geotagged capture columns to listings

alter table listings
  add column if not exists verification_video_url text,
  add column if not exists photo_urls text[] not null default '{}'::text[],
  add column if not exists onsite_photo_url text,
  add column if not exists onsite_lat double precision,
  add column if not exists onsite_lng double precision,
  add column if not exists onsite_accuracy_m double precision,
  add column if not exists onsite_captured_at timestamptz;
