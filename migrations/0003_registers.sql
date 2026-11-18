-- Registers added after the core ledger. Germany obligations are not rewritten here.
-- No balances, cards-on-scheme, or evidence are seeded.

alter table payment_instructions add column if not exists exception_by text;

create table if not exists approval_limits (
  id text primary key,
  institution text not null check (institution in ('ashcombe', 'vantoris')),
  currency text not null,
  max_cents integer not null check (max_cents > 0),
  status text not null,
  maker_user_id text not null,
  checker_user_id text,
  created_at timestamptz not null default now()
);

create table if not exists cards (
  id text primary key,
  account_id text not null references accounts (id),
  client_user_id text not null,
  label text not null,
  status text not null,
  maker_user_id text not null,
  checker_user_id text,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id text primary key,
  institution text not null check (institution in ('ashcombe', 'vantoris')),
  owner_user_id text not null,
  title text not null,
  kind text not null,
  body text not null,
  classification text not null check (classification in ('client', 'internal')),
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists complaints (
  id text primary key,
  institution text not null check (institution in ('ashcombe', 'vantoris')),
  reference text not null unique,
  complainant text not null,
  subject text not null,
  detail text not null,
  status text not null default 'open',
  owner_user_id text,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists institution_risks (
  id text primary key,
  institution text not null check (institution in ('ashcombe', 'vantoris')),
  title text not null,
  detail text not null,
  status text not null default 'open',
  owner_user_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists incidents (
  id text primary key,
  institution text not null check (institution in ('ashcombe', 'vantoris')),
  title text not null,
  detail text not null,
  severity text not null,
  status text not null default 'open',
  reported_by text not null,
  closed_by text,
  created_at timestamptz not null default now()
);

create table if not exists policies (
  id text primary key,
  institution text not null check (institution in ('ashcombe', 'vantoris')),
  title text not null,
  body text not null,
  status text not null default 'draft',
  owner_user_id text not null,
  approved_by text,
  created_at timestamptz not null default now()
);

create table if not exists publications (
  id text primary key,
  institution text not null check (institution in ('ashcombe', 'vantoris')),
  title text not null,
  summary text not null,
  status text not null default 'draft',
  author_user_id text not null,
  published_by text,
  created_at timestamptz not null default now()
);

create table if not exists departments (
  id text primary key,
  institution text not null check (institution in ('ashcombe', 'vantoris')),
  name text not null,
  purpose text not null,
  created_by text not null,
  created_at timestamptz not null default now(),
  unique (institution, name)
);

create table if not exists delegations (
  id text primary key,
  institution text not null check (institution in ('ashcombe', 'vantoris')),
  from_user_id text not null,
  to_user_id text not null,
  scope text not null,
  status text not null default 'proposed',
  maker_user_id text not null,
  checker_user_id text,
  created_at timestamptz not null default now()
);

create table if not exists statement_issues (
  id text primary key,
  account_id text not null references accounts (id),
  period_label text not null,
  opening_cents integer not null,
  closing_cents integer not null,
  line_count integer not null,
  issued_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists institution_obligations (
  code text primary key,
  institution text not null check (institution = 'vantoris'),
  title text not null,
  description text not null,
  owner_user_id text,
  status text not null default 'open',
  evidence_reference text,
  approval_status text not null default 'unapproved',
  reviewer_user_id text
);

insert into institution_obligations (code, institution, title, description)
values
  ('VP-01', 'vantoris', 'Conflicts', 'An officer declares an interest before approving a matter that touches them.'),
  ('VP-02', 'vantoris', 'Personal data', 'Member and staff records stay with Vantoris and are not copied into the Ashcombe ledger.'),
  ('VP-03', 'vantoris', 'Records', 'Institutional decisions stay attributable to the officer who made them.'),
  ('VP-04', 'vantoris', 'Delegation', 'A delegation note does not, by itself, transfer authority.'),
  ('VP-05', 'vantoris', 'Research integrity', 'A publication is released only after a second officer confirms it.')
on conflict (code) do nothing;
