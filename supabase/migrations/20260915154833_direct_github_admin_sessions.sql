begin;

create table public.admin_sessions (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  github_id text not null check (github_id = '147814557'),
  login text not null check (login ~ '^[A-Za-z0-9-]{1,39}$'),
  csrf_token text not null check (csrf_token ~ '^[A-Za-z0-9_-]{43}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null check (expires_at <= created_at + interval '8 hours 1 minute')
);
create index admin_sessions_expiry on public.admin_sessions (expires_at);
alter table public.admin_sessions enable row level security;
alter table public.admin_sessions force row level security;
revoke all on public.admin_sessions from public, anon, authenticated;
grant select, insert, delete on public.admin_sessions to service_role;

drop policy "Owner can read machines" on public.admin_devices;
drop policy "Owner can update machines" on public.admin_devices;
revoke all on public.admin_devices from public, anon, authenticated;
revoke update (tailscale_device_id, ssh_user, ssh_port, snapshot, checked_at) on public.admin_devices from authenticated;
grant select on public.admin_devices to service_role;
grant update (tailscale_device_id, ssh_user, ssh_port, snapshot, checked_at) on public.admin_devices to service_role;
drop function public.admin_session_active();
drop function private.is_admin();
revoke usage on schema private from authenticated;

comment on table public.admin_sessions is 'Direct GitHub OAuth sessions. Only origin-bound SHA-256 token hashes are stored. Browser and Supabase Auth roles have no access. The server verifies the GitHub owner before creating a session and checks the session on every private request.';

commit;
