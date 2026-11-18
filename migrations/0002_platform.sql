-- Connected platform. Two institutions. Separate financial records.
-- Obligation rows are the Germany-readiness list from Ashcombe issue 32.
-- They start open. No evidence is seeded.

create table if not exists profiles (
  id text primary key,
  user_id text not null,
  institution text not null check (institution in ('ashcombe', 'vantoris')),
  kind text not null check (kind in ('client', 'member', 'staff')),
  role text not null,
  status text not null check (status in ('pending', 'active', 'suspended')),
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, institution, kind)
);

create index if not exists profiles_user_idx on profiles (user_id);

create table if not exists audit_events (
  id text primary key,
  institution text,
  actor_user_id text not null,
  action text not null,
  entity text not null,
  entity_id text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists enquiries (
  id text primary key,
  institution text not null check (institution in ('ashcombe', 'vantoris')),
  reference text not null unique,
  full_name text not null,
  email text not null,
  country text not null,
  topic text not null,
  message text not null,
  status text not null default 'with_operators',
  created_at timestamptz not null default now()
);

create table if not exists kyc_invites (
  id text primary key,
  enquiry_id text not null references enquiries (id),
  token text not null unique,
  status text not null default 'open',
  issued_by text not null,
  expires_at timestamptz not null,
  submitted_at timestamptz
);

create table if not exists kyc_submissions (
  id text primary key,
  invite_id text not null unique references kyc_invites (id),
  legal_name text not null,
  date_of_birth text not null,
  nationality text not null,
  residence text not null,
  source_of_funds text not null,
  created_at timestamptz not null default now()
);

create table if not exists accounts (
  id text primary key,
  client_user_id text not null,
  name text not null,
  currency text not null,
  status text not null,
  iban text,
  iban_status text not null default 'not_issued',
  iban_proposed_by text,
  maker_user_id text not null,
  checker_user_id text,
  created_at timestamptz not null default now()
);

create index if not exists accounts_client_idx on accounts (client_user_id);

create table if not exists ledger_entries (
  id text primary key,
  account_id text not null references accounts (id),
  direction text not null check (direction in ('credit', 'debit')),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null,
  narrative text not null,
  source text not null,
  source_id text not null,
  posted_by text not null,
  checked_by text not null,
  created_at timestamptz not null default now(),
  unique (source, source_id, direction)
);

create table if not exists payment_instructions (
  id text primary key,
  account_id text not null references accounts (id),
  client_user_id text not null,
  idempotency_key text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null,
  beneficiary_name text not null,
  beneficiary_iban text not null,
  reference_text text not null,
  status text not null,
  maker_user_id text,
  checker_user_id text,
  settlement_reference text,
  settlement_by text,
  reconciled_by text,
  created_at timestamptz not null default now(),
  unique (client_user_id, idempotency_key)
);

create table if not exists branch_receipts (
  id text primary key,
  account_id text not null references accounts (id),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null,
  branch_name text not null,
  method text not null,
  narrative text not null,
  status text not null,
  maker_user_id text not null,
  checker_user_id text,
  created_at timestamptz not null default now()
);

create table if not exists obligations (
  code text primary key,
  institution text not null,
  title text not null,
  description text not null,
  owner_user_id text,
  status text not null default 'open',
  evidence_reference text,
  last_verified_on date,
  next_review_on date,
  reviewer_user_id text,
  approval_status text not null default 'unapproved'
);

create table if not exists obligation_history (
  id text primary key,
  code text not null references obligations (code),
  actor_user_id text not null,
  change text not null,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id text primary key,
  institution text not null,
  thread_user_id text not null,
  author_user_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists vantoris_requests (
  id text primary key,
  user_id text not null,
  title text not null,
  body text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists vantoris_risks (
  id text primary key,
  title text not null,
  detail text not null,
  status text not null default 'open',
  owner_user_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  institution text,
  body text not null,
  created_at timestamptz not null default now()
);

insert into obligations (code, institution, title, description)
values
  ('DE-01', 'ashcombe', 'German regulatory perimeter', 'Service-by-service perimeter for the products actually offered, with counsel review still required.'),
  ('DE-02', 'ashcombe', 'ZAG and KWG distinction', 'Payment or e-money permissions are not credit-institution or deposit-taking permissions.'),
  ('DE-03', 'ashcombe', 'Safeguarding', 'Safeguarding of relevant funds, if a payment or e-money activity is undertaken.'),
  ('DE-04', 'ashcombe', 'AML and CFT', 'Anti-money-laundering and counter-terrorist-financing controls.'),
  ('DE-05', 'ashcombe', 'Sanctions', 'Sanctions screening and freeze handling.'),
  ('DE-06', 'ashcombe', 'KYC', 'Customer due diligence before an account is activated.'),
  ('DE-07', 'ashcombe', 'GDPR', 'Personal-data duties for clients, applicants and staff.'),
  ('DE-08', 'ashcombe', 'Complaints', 'Complaint handling and records.'),
  ('DE-09', 'ashcombe', 'Consumer disclosures', 'Disclosures required before a service is offered.'),
  ('DE-10', 'ashcombe', 'Governance', 'Governance arrangements for the German perimeter.'),
  ('DE-11', 'ashcombe', 'Capital', 'Capital or own-funds requirement applicable to the chosen permission.'),
  ('DE-12', 'ashcombe', 'Regulatory reporting', 'Reporting duties once a permission exists.'),
  ('DE-13', 'ashcombe', 'Operational resilience', 'Continuity, incident handling and third-party oversight.')
on conflict (code) do nothing;
