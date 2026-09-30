-- 0006_admin_auth.sql
-- Dedicated Admin Users table for separate admin authentication

create table if not exists admin_users (
  id serial primary key,
  email text not null unique,
  password text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

insert into admin_users (email, password, role)
values ('admin@admin.com', 'admin123', 'admin')
on conflict (email) do update
set password = 'admin123', role = 'admin';
