-- Additive account inactivity state machine.
-- This migration intentionally leaves the legacy account_status column in place
-- while enforcing that it remains synchronized with the new canonical state.

alter table public.account_activity
  add column if not exists activity_version bigint not null default 0,
  add column if not exists purge_claimed_at timestamptz,
  add column if not exists purge_committed_at timestamptz,
  add column if not exists state public.account_status not null default 'active';

-- Durable purge intent. This table intentionally has no foreign key to
-- auth.users: an auth deletion must not erase the recovery record.
create table if not exists public.account_purge_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  anonymous_user_hash text not null,
  activity_version bigint not null,
  purge_claimed_at timestamptz not null,
  purge_committed_at timestamptz not null,
  kakao_provider_user_id text,
  status text not null default 'pending'
    check (status in ('pending', 'completed')),
  auth_deleted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (anonymous_user_hash, purge_claimed_at),
  check (
    (status = 'pending' and user_id is not null and completed_at is null)
    or
    (
      status = 'completed'
      and user_id is null
      and kakao_provider_user_id is null
      and auth_deleted_at is not null
      and completed_at is not null
    )
  )
);

create unique index if not exists account_purge_outbox_pending_user_idx
  on public.account_purge_outbox (user_id)
  where status = 'pending';

create index if not exists account_purge_outbox_pending_created_idx
  on public.account_purge_outbox (created_at, id)
  where status = 'pending';

revoke all on table public.account_purge_outbox from public;
revoke all on table public.account_purge_outbox from anon;
revoke all on table public.account_purge_outbox from authenticated;

update public.account_activity
set state = account_status,
    purge_claimed_at = case
      when account_status = 'purge_pending' then coalesce(purge_claimed_at, now())
      else null
    end,
    purge_committed_at = case
      when account_status = 'deleted' then coalesce(purge_committed_at, updated_at)
      else null
    end;

-- Existing learner accounts receive a fresh 168-hour window at deployment.
update public.account_activity as a
set last_activity_at = now(),
    purge_after = now() + interval '168 hours',
    account_status = 'active',
    state = 'active',
    purge_claimed_at = null,
    purge_committed_at = null,
    activity_version = a.activity_version + 1,
    last_touch_bucket = date_trunc('hour', now()),
    updated_at = now()
from public.profiles as p
where p.id = a.user_id
  and p.role = 'learner';

insert into public.account_activity (
  user_id,
  last_activity_at,
  purge_after,
  account_status,
  state,
  purge_claimed_at,
  activity_version,
  last_touch_bucket
)
select
  p.id,
  now(),
  now() + interval '168 hours',
  'active',
  'active',
  null,
  1,
  date_trunc('hour', now())
from public.profiles as p
where p.role = 'learner'
on conflict (user_id) do nothing;

-- OAuth and username accounts share the same learner lifecycle. Provider
-- metadata never grants administrator privileges; a later admin promotion is
-- controlled only by the protected profiles.role column.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles(id)
  values (new.id)
  on conflict do nothing;

  insert into public.account_activity(user_id)
  values (new.id)
  on conflict do nothing;

  return new;
end;
$$;

alter table public.account_activity
  add constraint account_activity_version_nonnegative
    check (activity_version >= 0) not valid,
  add constraint account_activity_state_sync
    check (state = account_status) not valid,
  add constraint account_activity_claim_timestamp
    check (state <> 'purge_pending' or purge_claimed_at is not null) not valid,
  add constraint account_activity_commit_timestamp
    check (state <> 'deleted' or purge_committed_at is not null) not valid;

alter table public.account_activity
  validate constraint account_activity_version_nonnegative;
alter table public.account_activity
  validate constraint account_activity_state_sync;
alter table public.account_activity
  validate constraint account_activity_claim_timestamp;
alter table public.account_activity
  validate constraint account_activity_commit_timestamp;

create index if not exists account_activity_purge_candidate_idx
  on public.account_activity (purge_after, user_id)
  where state = 'active';

create or replace function public.touch_account_activity(
  p_user_id uuid,
  p_event text,
  p_reference_id uuid default null
)
returns table (
  activity_version bigint,
  state public.account_status,
  purge_after timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := now();
  v_hour timestamptz := date_trunc('hour', v_now);
begin
  if p_event not in (
    'login',
    'oauth_callback',
    'practice_session',
    'practice_attempt',
    'note',
    'bookmark'
  ) then
    raise exception 'unsupported account activity event' using errcode = '22023';
  end if;

  if p_event in ('login', 'oauth_callback') and p_reference_id is not null then
    raise exception 'authentication activity must not include a reference' using errcode = '22023';
  end if;

  if p_event = 'practice_session' and (
    p_reference_id is null
    or not exists (
      select 1
      from public.practice_sessions as practice_session
      where practice_session.id = p_reference_id
        and practice_session.user_id = p_user_id
        and practice_session.created_at >= v_now - interval '5 minutes'
    )
  ) then
    raise exception 'recent owned practice session required' using errcode = '22023';
  end if;

  if p_event = 'practice_attempt' and (
    p_reference_id is null
    or not exists (
      select 1
      from public.attempts as attempt
      where attempt.id = p_reference_id
        and attempt.user_id = p_user_id
        and attempt.attempted_at >= v_now - interval '5 minutes'
    )
  ) then
    raise exception 'recent owned practice attempt required' using errcode = '22023';
  end if;

  if p_event = 'note' and (
    p_reference_id is null
    or not exists (
      select 1
      from public.notes as note
      where note.id = p_reference_id
        and note.user_id = p_user_id
        and note.updated_at >= v_now - interval '5 minutes'
    )
  ) then
    raise exception 'recent owned note required' using errcode = '22023';
  end if;

  if p_event = 'bookmark' and (
    p_reference_id is null
    or not exists (
      select 1
      from public.bookmarks as bookmark
      where bookmark.id = p_reference_id
        and bookmark.user_id = p_user_id
        and bookmark.created_at >= v_now - interval '5 minutes'
    )
  ) then
    raise exception 'recent owned bookmark required' using errcode = '22023';
  end if;

  return query
  update public.account_activity as a
  set last_activity_at = v_now,
      purge_after = v_now + interval '168 hours',
      last_touch_bucket = v_hour,
      account_status = 'active',
      state = 'active',
      purge_claimed_at = null,
      purge_committed_at = null,
      activity_version = a.activity_version + 1,
      updated_at = v_now
  from public.profiles as p
  where a.user_id = p_user_id
    and p.id = a.user_id
    and p.role = 'learner'
    and a.state <> 'deleted'
    and a.account_status <> 'deleted'
  returning a.activity_version, a.state, a.purge_after;
end;
$$;

revoke all on function public.touch_account_activity(uuid,text,uuid) from public;
revoke all on function public.touch_account_activity(uuid,text,uuid) from anon;
revoke all on function public.touch_account_activity(uuid,text,uuid) from authenticated;
grant execute on function public.touch_account_activity(uuid,text,uuid) to service_role;

-- Existing record_attempt calls remain compatible, but direct authenticated
-- execution is revoked. The function derives proof from the freshly inserted attempt.
create or replace function public.touch_account_activity()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select attempt.id
  into v_attempt_id
  from public.attempts as attempt
  where attempt.user_id = v_user_id
    and attempt.attempted_at >= now() - interval '5 minutes'
  order by attempt.attempted_at desc, attempt.id desc
  limit 1;

  if v_attempt_id is null then
    raise exception 'recent owned practice attempt required' using errcode = '22023';
  end if;

  perform public.touch_account_activity(
    v_user_id,
    'practice_attempt',
    v_attempt_id
  );
end;
$$;

revoke all on function public.touch_account_activity() from public;
revoke all on function public.touch_account_activity() from anon;
revoke all on function public.touch_account_activity() from authenticated;

create or replace function public.claim_inactive_account(
  p_user_id uuid,
  p_expected_activity_version bigint,
  p_cutoff timestamptz
)
returns table (
  activity_version bigint,
  purge_claimed_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_claimed_at timestamptz := now();
begin
  return query
  update public.account_activity as a
  set account_status = 'purge_pending',
      state = 'purge_pending',
      purge_claimed_at = v_claimed_at,
      purge_committed_at = null,
      updated_at = v_claimed_at
  from public.profiles as p
  where a.user_id = p_user_id
    and p.id = a.user_id
    and p.role = 'learner'
    and a.state = 'active'
    and a.account_status = 'active'
    and a.activity_version = p_expected_activity_version
    and a.purge_after <= p_cutoff
  returning a.activity_version, a.purge_claimed_at;
end;
$$;

revoke all on function public.claim_inactive_account(uuid,bigint,timestamptz) from public;
revoke all on function public.claim_inactive_account(uuid,bigint,timestamptz) from anon;
revoke all on function public.claim_inactive_account(uuid,bigint,timestamptz) from authenticated;
grant execute on function public.claim_inactive_account(uuid,bigint,timestamptz) to service_role;

create or replace function public.verify_account_purge_claim(
  p_user_id uuid,
  p_expected_activity_version bigint,
  p_claimed_at timestamptz
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.account_activity as a
    join public.profiles as p on p.id = a.user_id
    where a.user_id = p_user_id
      and p.role = 'learner'
      and a.state = 'purge_pending'
      and a.account_status = 'purge_pending'
      and a.purge_committed_at is null
      and a.activity_version = p_expected_activity_version
      and a.purge_claimed_at = p_claimed_at
  );
$$;

revoke all on function public.verify_account_purge_claim(uuid,bigint,timestamptz) from public;
revoke all on function public.verify_account_purge_claim(uuid,bigint,timestamptz) from anon;
revoke all on function public.verify_account_purge_claim(uuid,bigint,timestamptz) from authenticated;
grant execute on function public.verify_account_purge_claim(uuid,bigint,timestamptz) to service_role;

create or replace function public.release_account_purge_claim(
  p_user_id uuid,
  p_expected_activity_version bigint,
  p_claimed_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row_count bigint;
begin
  update public.account_activity as a
  set account_status = 'active',
      state = 'active',
      purge_claimed_at = null,
      purge_committed_at = null,
      updated_at = now()
  from public.profiles as p
  where a.user_id = p_user_id
    and p.id = a.user_id
    and p.role = 'learner'
    and a.state = 'purge_pending'
    and a.account_status = 'purge_pending'
    and a.purge_committed_at is null
    and a.activity_version = p_expected_activity_version
    and a.purge_claimed_at = p_claimed_at;

  get diagnostics v_row_count = row_count;
  return v_row_count = 1;
end;
$$;

revoke all on function public.release_account_purge_claim(uuid,bigint,timestamptz) from public;
revoke all on function public.release_account_purge_claim(uuid,bigint,timestamptz) from anon;
revoke all on function public.release_account_purge_claim(uuid,bigint,timestamptz) from authenticated;
grant execute on function public.release_account_purge_claim(uuid,bigint,timestamptz) to service_role;

create or replace function public.commit_account_purge_claim(
  p_user_id uuid,
  p_expected_activity_version bigint,
  p_claimed_at timestamptz,
  p_anonymous_user_hash text,
  p_kakao_provider_user_id text default null
)
returns table (
  activity_version bigint,
  purge_claimed_at timestamptz,
  purge_committed_at timestamptz,
  purge_outbox_id uuid
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_committed_at timestamptz := now();
  v_activity_version bigint;
  v_claimed_at timestamptz;
  v_outbox_id uuid;
begin
  update public.account_activity as a
  set account_status = 'deleted',
      state = 'deleted',
      purge_committed_at = v_committed_at,
      updated_at = v_committed_at
  from public.profiles as p
  where a.user_id = p_user_id
    and p.id = a.user_id
    and p.role = 'learner'
    and a.state = 'purge_pending'
    and a.account_status = 'purge_pending'
    and a.activity_version = p_expected_activity_version
    and a.purge_claimed_at = p_claimed_at
    and a.purge_committed_at is null
  returning
    a.activity_version,
    a.purge_claimed_at,
    a.purge_committed_at
  into
    v_activity_version,
    v_claimed_at,
    v_committed_at;

  if not found then
    return;
  end if;

  insert into public.account_purge_outbox (
    user_id,
    anonymous_user_hash,
    activity_version,
    purge_claimed_at,
    purge_committed_at,
    kakao_provider_user_id
  )
  values (
    p_user_id,
    p_anonymous_user_hash,
    v_activity_version,
    v_claimed_at,
    v_committed_at,
    p_kakao_provider_user_id
  )
  returning id into v_outbox_id;

  return query
  select
    v_activity_version,
    v_claimed_at,
    v_committed_at,
    v_outbox_id;
end;
$$;

revoke all on function public.commit_account_purge_claim(uuid,bigint,timestamptz,text,text) from public;
revoke all on function public.commit_account_purge_claim(uuid,bigint,timestamptz,text,text) from anon;
revoke all on function public.commit_account_purge_claim(uuid,bigint,timestamptz,text,text) from authenticated;
grant execute on function public.commit_account_purge_claim(uuid,bigint,timestamptz,text,text) to service_role;

create or replace function public.verify_account_purge_outbox(
  p_outbox_id uuid,
  p_user_id uuid,
  p_expected_activity_version bigint,
  p_claimed_at timestamptz,
  p_committed_at timestamptz
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.account_purge_outbox as o
    where o.id = p_outbox_id
      and o.user_id = p_user_id
      and o.status = 'pending'
      and o.activity_version = p_expected_activity_version
      and o.purge_claimed_at = p_claimed_at
      and o.purge_committed_at = p_committed_at
  );
$$;

revoke all on function public.verify_account_purge_outbox(uuid,uuid,bigint,timestamptz,timestamptz) from public;
revoke all on function public.verify_account_purge_outbox(uuid,uuid,bigint,timestamptz,timestamptz) from anon;
revoke all on function public.verify_account_purge_outbox(uuid,uuid,bigint,timestamptz,timestamptz) from authenticated;
grant execute on function public.verify_account_purge_outbox(uuid,uuid,bigint,timestamptz,timestamptz) to service_role;

create or replace function public.complete_account_purge_outbox(
  p_outbox_id uuid,
  p_user_id uuid
)
returns table (
  purge_outbox_id uuid,
  anonymous_user_hash text,
  purge_claimed_at timestamptz,
  completed_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_hash text;
  v_claimed_at timestamptz;
  v_completed_at timestamptz := now();
begin
  update public.account_purge_outbox as o
  set status = 'completed',
      user_id = null,
      kakao_provider_user_id = null,
      auth_deleted_at = v_completed_at,
      completed_at = v_completed_at,
      updated_at = v_completed_at
  where o.id = p_outbox_id
    and o.user_id = p_user_id
    and o.status = 'pending'
  returning
    o.anonymous_user_hash,
    o.purge_claimed_at
  into
    v_hash,
    v_claimed_at;

  if not found then
    return;
  end if;

  insert into public.account_purge_events (
    anonymous_user_hash,
    purged_at,
    reason
  )
  values (
    v_hash,
    v_claimed_at,
    'inactivity'
  )
  on conflict (anonymous_user_hash, purged_at) do nothing;

  return query
  select
    p_outbox_id,
    v_hash,
    v_claimed_at,
    v_completed_at;
end;
$$;

revoke all on function public.complete_account_purge_outbox(uuid,uuid) from public;
revoke all on function public.complete_account_purge_outbox(uuid,uuid) from anon;
revoke all on function public.complete_account_purge_outbox(uuid,uuid) from authenticated;
grant execute on function public.complete_account_purge_outbox(uuid,uuid) to service_role;
