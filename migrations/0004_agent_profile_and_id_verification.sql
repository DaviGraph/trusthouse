-- Add phone, avatar_url, id_document_url, and id_verification_status to agents table

alter table agents
  add column if not exists phone text not null default '',
  add column if not exists avatar_url text,
  add column if not exists id_document_url text,
  add column if not exists id_verification_status text not null default 'not_submitted';
