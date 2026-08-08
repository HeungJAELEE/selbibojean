create type public.source_authority as enum (
  'official',
  'mirror_capture',
  'user_reconstruction'
);
create type public.content_fidelity as enum (
  'exact',
  'normalized_exact',
  'mismatch',
  'unreachable'
);
create type public.answer_evidence as enum (
  'official',
  'multi_capture_agreement',
  'single_capture_uncontested',
  'conflict',
  'unknown'
);
create type public.track_identity_status as enum (
  'matched',
  'ambiguous',
  'mismatch'
);
create type public.asset_status as enum (
  'complete',
  'missing',
  'mismatch',
  'not_required',
  'rights_hold'
);
create type public.audit_resolution as enum (
  'pending',
  'approved',
  'hold',
  'rejected'
);

insert into public.exam_tracks(code, title, status)
values
  ('facility-maintenance-engineer-current', '설비보전기사(신)', 'draft'),
  ('facility-maintenance-engineer-legacy', '설비보전기사(구)', 'draft'),
  ('facility-maintenance-industrial-current', '설비보전산업기사(신)', 'draft'),
  ('mechanical-maintenance-industrial-legacy', '기계정비산업기사·설비보전산업기사(구)', 'draft'),
  ('welding-engineer', '용접기사', 'draft'),
  ('welding-industrial-engineer', '용접산업기사', 'draft'),
  ('welding-craftsman', '용접기능사', 'draft')
on conflict (code) do update
set title = excluded.title,
    updated_at = now();

create table public.exam_occurrences (
  id uuid primary key,
  exam_track_id uuid references public.exam_tracks(id) on delete restrict,
  track_identity_status public.track_identity_status not null default 'ambiguous',
  exam_date date,
  date_precision text not null check (date_precision in ('day','month','year','unknown')),
  session_label text not null,
  expected_question_numbers integer[],
  expected_question_count integer check (expected_question_count is null or expected_question_count >= 0),
  expected_numbers_basis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.question_variants
  add column if not exists exam_occurrence_id uuid references public.exam_occurrences(id) on delete set null,
  add column if not exists shuffle_policy text not null default 'all'
    check (shuffle_policy in ('all','none','except_fixed'));

create table public.source_observations (
  id uuid primary key,
  question_variant_id uuid not null references public.question_variants(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  source_authority public.source_authority not null,
  source_url text not null,
  page_title text,
  observed_at timestamptz,
  question_sha256 text not null check (question_sha256 ~ '^[0-9a-f]{64}$'),
  choices_sha256 text not null check (choices_sha256 ~ '^[0-9a-f]{64}$'),
  content_fidelity public.content_fidelity not null,
  source_answer text,
  answer_evidence public.answer_evidence not null default 'unknown',
  answer_choice_id uuid references public.choices(id) on delete set null,
  answer_conflict_note text,
  asset_status public.asset_status not null default 'not_required',
  audit_resolution public.audit_resolution not null default 'pending',
  publication_policy text not null default 'historical_exam_reproduction'
    check (publication_policy = 'historical_exam_reproduction'),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_variant_id, source_url)
);

create or replace function public.validate_source_observation_answer_choice()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.answer_choice_id is not null and not exists (
    select 1
    from public.question_variants as variant
    join public.choices as choice
      on choice.question_id = variant.canonical_question_id
    where variant.id = new.question_variant_id
      and choice.id = new.answer_choice_id
  ) then
    raise exception 'answer choice does not belong to canonical question'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger source_observation_answer_choice_ownership
before insert or update of question_variant_id, answer_choice_id
on public.source_observations
for each row execute function public.validate_source_observation_answer_choice();

alter table public.practice_sessions
  add column if not exists exam_track_id uuid references public.exam_tracks(id) on delete restrict,
  add column if not exists shuffle_choices boolean not null default true,
  add column if not exists session_seed bigint;

alter table public.practice_session_items
  add column if not exists question_variant_id uuid references public.question_variants(id) on delete set null,
  add column if not exists choice_order text[] not null default '{}';

alter table public.attempts
  add column if not exists question_variant_id uuid references public.question_variants(id) on delete set null,
  add column if not exists exam_track_id uuid references public.exam_tracks(id) on delete restrict,
  add column if not exists syllabus_version_id uuid references public.syllabus_versions(id) on delete restrict;

create or replace function public.set_attempt_classification_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_exam_track_id uuid;
  v_syllabus_version_id uuid;
  v_question_variant_id uuid;
begin
  select question.exam_track_id, subject.syllabus_version_id
  into v_exam_track_id, v_syllabus_version_id
  from public.questions as question
  join public.subjects as subject on subject.id = question.subject_id
  where question.id = new.question_id;

  if v_exam_track_id is null or v_syllabus_version_id is null then
    raise exception 'attempt classification snapshot unavailable';
  end if;

  if new.session_id is not null then
    select item.question_variant_id
    into v_question_variant_id
    from public.practice_session_items as item
    join public.practice_sessions as practice_session
      on practice_session.id = item.session_id
    where item.session_id = new.session_id
      and item.question_id = new.question_id
      and practice_session.user_id = new.user_id;
  end if;

  new.exam_track_id := v_exam_track_id;
  new.syllabus_version_id := v_syllabus_version_id;
  new.question_variant_id :=
    coalesce(new.question_variant_id, v_question_variant_id);
  return new;
end;
$$;

create trigger attempts_classification_snapshot
before insert on public.attempts
for each row execute function public.set_attempt_classification_snapshot();

create table public.release_feature_flags (
  key text primary key,
  enabled boolean not null default false,
  note text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.release_feature_flags(key, enabled, note)
select
  'track_bank_' || code,
  false,
  '자격 트랙별 출처 감사와 reconciliation 완료 후 별도 전환'
from public.exam_tracks
where code in (
  'facility-maintenance-engineer-current',
  'facility-maintenance-engineer-legacy',
  'facility-maintenance-industrial-current',
  'mechanical-maintenance-industrial-legacy',
  'welding-engineer',
  'welding-industrial-engineer',
  'welding-craftsman'
)
on conflict (key) do nothing;

insert into public.release_feature_flags(key, enabled, note)
values
  ('mock_choice_shuffle', false, '동일 seed 재개와 stable choice ID 채점 검증 후 활성화'),
  ('google_oauth', false, 'Supabase provider와 callback canary 후 활성화'),
  ('kakao_oauth', false, 'unlink와 삭제 경합 disposable canary 후 활성화'),
  ('account_purge', false, '168시간 경계와 실제 auth delete readback 후 활성화'),
  ('learning_analytics', false, 'attempt snapshot과 RLS 격리 검증 후 활성화'),
  ('busan_kopo_media', false, 'PII·metadata·390px 검증 후 활성화')
on conflict (key) do nothing;

create index exam_occurrences_track_date_idx
  on public.exam_occurrences(exam_track_id, exam_date, session_label);
create index source_observations_variant_idx
  on public.source_observations(question_variant_id, audit_resolution);
create index attempts_track_subject_snapshot_idx
  on public.attempts(user_id, exam_track_id, syllabus_version_id, attempted_at desc);

alter table public.exam_occurrences enable row level security;
alter table public.source_observations enable row level security;
alter table public.release_feature_flags enable row level security;

create policy "admins manage exam occurrences"
on public.exam_occurrences
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create policy "admins manage source observations"
on public.source_observations
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create policy "authenticated users read release flags"
on public.release_feature_flags
for select
to authenticated
using (true);

create policy "admins manage release flags"
on public.release_feature_flags
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create trigger exam_occurrences_updated_at
before update on public.exam_occurrences
for each row execute function public.set_updated_at();

create trigger source_observations_updated_at
before update on public.source_observations
for each row execute function public.set_updated_at();

create trigger release_feature_flags_updated_at
before update on public.release_feature_flags
for each row execute function public.set_updated_at();
