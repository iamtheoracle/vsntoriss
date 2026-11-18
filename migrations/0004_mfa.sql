-- Second factor for privileged sessions. Not a sign-in method.
-- The shared secret is stored only as ciphertext. Recovery codes are hashed.

create table if not exists mfa_credentials (
  user_id text primary key,
  secret_ciphertext text not null,
  status text not null check (status in ('pending', 'active')),
  last_accepted_step bigint,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table if not exists mfa_recovery_codes (
  id text primary key,
  user_id text not null,
  code_hash text not null,
  used_at timestamptz,
  unique (user_id, code_hash)
);

create table if not exists mfa_step_up (
  session_id text primary key,
  user_id text not null,
  method text not null check (method in ('totp', 'recovery')),
  verified_at timestamptz not null default now()
);

create table if not exists mfa_attempts (
  id text primary key,
  user_id text not null,
  succeeded boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists maintenance_flags (
  name text primary key,
  enabled boolean not null
);

insert into maintenance_flags (name, enabled) values ('allow_restore', false)
on conflict (name) do nothing;

create or replace function ledger_entries_frozen() returns trigger as $$
begin
  if exists (select 1 from maintenance_flags where name = 'allow_restore' and enabled) then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;
  raise exception 'ledger entries are immutable';
end;
$$ language plpgsql;

drop trigger if exists ledger_entries_no_mutate on ledger_entries;
create trigger ledger_entries_no_mutate
before update or delete on ledger_entries
for each row execute function ledger_entries_frozen();

create or replace function audit_events_frozen() returns trigger as $$
begin
  raise exception 'audit events are immutable';
end;
$$ language plpgsql;

drop trigger if exists audit_events_no_mutate on audit_events;
create trigger audit_events_no_mutate
before update or delete on audit_events
for each row execute function audit_events_frozen();

