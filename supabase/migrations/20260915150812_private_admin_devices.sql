begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and exists (
      select 1 from auth.identities i
      where i.user_id = (select auth.uid())
        and i.provider = 'github'
        and i.provider_id = '147814557'
    )
    and exists (
      select 1 from auth.sessions s
      where s.id::text = (select auth.jwt() ->> 'session_id')
        and s.user_id = (select auth.uid())
        and (s.not_after is null or s.not_after > now())
        and s.created_at > now() - interval '8 hours'
    );
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

create function public.admin_session_active()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select private.is_admin(); $$;
revoke all on function public.admin_session_active() from public, anon;
grant execute on function public.admin_session_active() to authenticated;

create table public.admin_devices (
  id text primary key check (id in ('laptop', 'mac-mini', 'desktop', 'macbook')),
  tailscale_device_id text unique check (tailscale_device_id ~ '^[A-Za-z0-9_-]{1,128}$'),
  ssh_user text check (ssh_user ~ '^[A-Za-z_][A-Za-z0-9_.-]{0,63}$'),
  ssh_port integer not null default 22 check (ssh_port between 1 and 65535),
  snapshot jsonb check (snapshot is null or (jsonb_typeof(snapshot) = 'object' and octet_length(snapshot::text) < 8192)),
  checked_at timestamptz
);
alter table public.admin_devices enable row level security;
alter table public.admin_devices force row level security;
revoke all on public.admin_devices from public, anon, authenticated;
grant select on public.admin_devices to authenticated;
grant update (tailscale_device_id, ssh_user, ssh_port, snapshot, checked_at) on public.admin_devices to authenticated;

create policy "Owner can read machines" on public.admin_devices
  for select to authenticated using ((select private.is_admin()));
create policy "Owner can update machines" on public.admin_devices
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

insert into public.admin_devices (id, ssh_user) values
  ('laptop', null), ('mac-mini', null), ('desktop', 'joaki'), ('macbook', null);

comment on function private.is_admin() is 'Only the verified GitHub identity 147814557 with a live Supabase session under eight hours may access the admin. Never authorize using user_metadata.';
comment on table public.admin_devices is 'Private SSH connection metadata. Never store passwords, SSH private keys or OAuth secrets here.';

commit;
