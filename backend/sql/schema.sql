-- Run this in Supabase SQL Editor (Project > SQL Editor > New Query)
create extension if not exists pgcrypto;

-- Drop existing tables if recreating the schema
drop table if exists applications cascade;
drop table if exists amendments cascade;
drop table if exists audit_log cascade;
drop table if exists documents cascade;
drop table if exists duplicate_flags cascade;
drop table if exists family_members cascade;
drop table if exists families cascade;
drop table if exists schemes cascade;
drop table if exists officers cascade;
drop table if exists citizens_registry cascade;

create table citizens_registry (
    citizen_ref     uuid primary key default gen_random_uuid(),
    aadhaar_hash    text unique not null,
    aadhaar_last4   char(4) not null,
    full_name       text not null,
    dob             date not null,
    gender          text,
    photo_url       text,
    mobile_number   text
);

create table families (
    family_id        uuid primary key default gen_random_uuid(),
    head_citizen_ref uuid references citizens_registry(citizen_ref),
    status           text check (status in ('DRAFT','PENDING_VERIFICATION','VERIFIED','FLAGGED')) default 'DRAFT',
    district         text,
    annual_income    integer default 0,
    created_at       timestamptz default now(),
    verified_at      timestamptz
);

create table family_members (
    member_id           uuid primary key default gen_random_uuid(),
    family_id           uuid references families(family_id),
    citizen_ref         uuid references citizens_registry(citizen_ref),
    relationship_type   text not null,
    verification_status text check (verification_status in ('GREEN','YELLOW','RED')) default 'YELLOW',
    attributes          jsonb default '{}',
    added_at            timestamptz default now(),
    removed_at          timestamptz,
    removal_reason      text,
    unique (citizen_ref, family_id)
);

create table duplicate_flags (
    flag_id          uuid primary key default gen_random_uuid(),
    citizen_ref      uuid references citizens_registry(citizen_ref),
    family_id_a      uuid references families(family_id),
    family_id_b      uuid references families(family_id),
    similarity_score numeric,
    status           text check (status in ('PENDING_REVIEW','RESOLVED')) default 'PENDING_REVIEW',
    sla_deadline     timestamptz default (now() + interval '72 hours'),
    escalation_tier  integer default 0,
    detected_at      timestamptz default now()
);

create table documents (
    document_id  uuid primary key default gen_random_uuid(),
    member_id    uuid references family_members(member_id),
    doc_type     text,
    file_url     text,
    verified_by  uuid,
    verified_at  timestamptz,
    uploaded_at  timestamptz default now()
);

create table audit_log (
    log_id        bigserial primary key,
    family_id     uuid references families(family_id),
    member_id     uuid,
    field_changed text,
    old_value     text,
    new_value     text,
    changed_by    text,
    reason        text,
    prev_hash     text default '0000000000000000000000000000000000000000000000000000000000000000',
    entry_hash    text,
    timestamp     timestamptz default now()
);

create table amendments (
    amendment_id   uuid primary key default gen_random_uuid(),
    family_id      uuid references families(family_id),
    member_id      uuid,
    amendment_type text check (amendment_type in ('ADD','REMOVE','EDIT')),
    payload        jsonb,
    status         text check (status in ('PENDING','APPROVED','REJECTED')) default 'PENDING',
    sla_deadline   timestamptz,
    submitted_at   timestamptz default now(),
    resolved_at    timestamptz,
    resolved_by    uuid
);

create table officers (
    officer_id   uuid primary key default gen_random_uuid(),
    name         text,
    role         text,
    jurisdiction text
);

create table schemes (
    scheme_id           uuid primary key default gen_random_uuid(),
    name                text,
    department          text,
    eligibility_rules   jsonb,
    benefit_description text
);

create table applications (
    application_id uuid primary key default gen_random_uuid(),
    family_id      uuid references families(family_id),
    scheme_id      uuid references schemes(scheme_id),
    status         text check (status in ('SUBMITTED','APPROVED','REJECTED')) default 'SUBMITTED',
    applied_at     timestamptz default now(),
    decided_at     timestamptz,
    unique (family_id, scheme_id)
);

-- Make the audit log genuinely append-only: no one can UPDATE or DELETE rows,
-- even with the anon/service key, at the database level.
revoke update, delete on audit_log from public, anon, authenticated;
