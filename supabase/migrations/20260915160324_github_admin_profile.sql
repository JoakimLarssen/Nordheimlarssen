begin;

create table public.admin_users (
  github_id text primary key check (github_id = '147814557'),
  login text not null check (login ~ '^[A-Za-z0-9-]{1,39}$'),
  display_name text check (length(display_name) <= 200),
  email text check (length(email) <= 320),
  avatar_url text check (avatar_url ~ '^https://avatars[.]githubusercontent[.]com/' and length(avatar_url) <= 1024),
  updated_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
alter table public.admin_users force row level security;
revoke all on public.admin_users from public, anon, authenticated;
grant select, insert, update on public.admin_users to service_role;

insert into public.admin_users (github_id, login)
select distinct on (github_id) github_id, login from public.admin_sessions order by github_id, created_at desc;
alter table public.admin_sessions add constraint admin_sessions_user_fk foreign key (github_id) references public.admin_users (github_id);

comment on table public.admin_users is 'GitHub account profile, keyed by the verified provider ID. Private GitHub email may be null. Only the backend can access this table.';

commit;
