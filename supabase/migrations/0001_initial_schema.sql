create extension if not exists pgcrypto;

create type public.content_status as enum ('draft', 'in_review', 'published', 'archived');
create type public.coverage_status as enum ('covered', 'partial', 'missing', 'blocked');
create type public.self_rating as enum ('unknown', 'unsure', 'known');
create type public.account_status as enum ('active', 'purge_pending', 'deleted');
create type public.attempt_kind as enum ('initial', 'retry');
create type public.practice_status as enum ('active', 'completed', 'abandoned');
create type public.error_reason as enum ('개념 혼동', '부정형 문장', '단위 오류', '공식 적용', '조건 누락', '과거 기준', '용어 혼동', '단순 실수');

create table public.exam_tracks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exam_modes (
  id uuid primary key default gen_random_uuid(),
  exam_track_id uuid not null references public.exam_tracks(id) on delete cascade,
  code text not null,
  title text not null,
  status public.content_status not null default 'draft',
  unique (exam_track_id, code)
);

create table public.syllabus_versions (
  id uuid primary key default gen_random_uuid(),
  exam_track_id uuid not null references public.exam_tracks(id) on delete cascade,
  title text not null,
  effective_from date,
  effective_to date,
  source_url text,
  status public.content_status not null default 'draft',
  unique (exam_track_id, title)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  syllabus_version_id uuid not null references public.syllabus_versions(id) on delete cascade,
  code smallint not null check (code between 1 and 20),
  title text not null,
  short_title text not null,
  description text not null default '',
  sort_order smallint not null,
  status public.content_status not null default 'draft',
  unique (syllabus_version_id, code)
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  sort_order smallint not null,
  status public.content_status not null default 'draft',
  unique (subject_id, sort_order)
);

create table public.concept_groups (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete set null,
  external_key text unique,
  title text not null,
  keywords text[] not null default '{}',
  sort_order smallint not null,
  status public.content_status not null default 'draft',
  unique (subject_id, title)
);

create table public.concepts (
  id uuid primary key default gen_random_uuid(),
  concept_group_id uuid not null references public.concept_groups(id) on delete restrict,
  canonical_name text not null,
  definition text not null default '',
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (concept_group_id, canonical_name)
);

create table public.concept_aliases (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null references public.concepts(id) on delete cascade,
  alias text not null,
  source_label text,
  unique (concept_id, alias)
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('qnet', 'law', 'ncs', 'standard', 'manufacturer', 'workbook', 'notion', 'other')),
  title text not null,
  url text,
  publisher text,
  published_at date,
  checked_at timestamptz,
  checksum text,
  metadata jsonb not null default '{}',
  unique nulls not distinct (url, checksum)
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  storage_path text not null unique,
  mime_type text not null,
  alt_text text not null,
  checksum text not null,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null unique references public.concepts(id) on delete restrict,
  slug text not null unique,
  title text not null,
  summary_lines text[] not null default '{}',
  source_needed boolean not null default true,
  status public.content_status not null default 'draft',
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  anchor text not null,
  kind text not null check (kind in ('summary','definition','purpose','structure','principle','formula','selection','pros_cons','diagnosis','safety','exam_point','trap','source')),
  title text not null,
  body_md text not null,
  sort_order smallint not null,
  status public.content_status not null default 'draft',
  unique (lesson_id, anchor)
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  exam_track_id uuid not null references public.exam_tracks(id) on delete restrict,
  exam_mode_id uuid not null references public.exam_modes(id) on delete restrict,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  stem text not null,
  explanation text not null default '',
  source_label text,
  review_status_raw text,
  status public.content_status not null default 'draft',
  answer_validated boolean not null default false,
  explanation_validated boolean not null default false,
  choice_feedback_validated boolean not null default false,
  theory_link_validated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.choices (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  question_id uuid not null references public.questions(id) on delete cascade,
  label text not null,
  body text not null,
  sort_order smallint not null check (sort_order > 0),
  unique (question_id, sort_order)
);

create table public.choice_feedback (
  choice_id uuid primary key references public.choices(id) on delete cascade,
  rationale text not null,
  plausible_reason text not null,
  incorrect_point text,
  key_rule text not null,
  difference_from_correct text,
  validated boolean not null default false,
  validated_at timestamptz,
  validated_by uuid references auth.users(id) on delete set null
);

create table public.answer_keys (
  question_id uuid primary key references public.questions(id) on delete cascade,
  correct_choice_id uuid not null references public.choices(id) on delete restrict,
  answer_text text not null,
  rationale text not null,
  validated boolean not null default false,
  validated_at timestamptz,
  validated_by uuid references auth.users(id) on delete set null
);

create table public.rubric_items (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  criterion text not null,
  points numeric(6,2) not null check (points >= 0),
  sort_order smallint not null,
  status public.content_status not null default 'draft'
);

create table public.question_concepts (
  question_id uuid not null references public.questions(id) on delete cascade,
  concept_id uuid not null references public.concepts(id) on delete restrict,
  role text not null check (role in ('primary', 'secondary')),
  lesson_anchor text not null default 'principle',
  primary key (question_id, concept_id)
);
create unique index one_primary_concept_per_question on public.question_concepts(question_id) where role = 'primary';

create table public.question_variants (
  id uuid primary key default gen_random_uuid(),
  canonical_question_id uuid not null references public.questions(id) on delete cascade,
  external_id text not null unique,
  year smallint,
  session_label text,
  question_number smallint,
  original_stem text not null,
  payload jsonb not null default '{}',
  source_id uuid references public.sources(id) on delete set null,
  verification_note text,
  status public.content_status not null default 'draft'
);

create table public.lesson_questions (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  sort_order smallint not null default 1,
  primary key (lesson_id, question_id)
);

create table public.theory_coverage (
  question_id uuid not null references public.questions(id) on delete cascade,
  concept_id uuid not null references public.concepts(id) on delete cascade,
  status public.coverage_status not null,
  evidence text,
  checked_at timestamptz not null default now(),
  checked_by text not null,
  primary key (question_id, concept_id)
);

create table public.generation_runs (
  id uuid primary key default gen_random_uuid(),
  model_name text not null,
  model_version text,
  prompt_version text not null,
  input_checksum text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('running','completed','failed')),
  metrics jsonb not null default '{}',
  error_log text
);

create table public.theory_gaps (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  concept_id uuid references public.concepts(id) on delete set null,
  target_lesson_id uuid references public.lessons(id) on delete set null,
  status public.coverage_status not null,
  gap_description text not null,
  proposed_block_kind text,
  proposed_content_md text,
  source_needed boolean not null default true,
  generation_run_id uuid references public.generation_runs(id) on delete set null,
  review_status public.content_status not null default 'draft',
  unique (question_id, concept_id)
);

create table public.content_flags (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  flag_code text not null,
  severity text not null check (severity in ('info','warning','blocker')),
  message text not null,
  source_note text,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.content_versions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  version integer not null,
  snapshot jsonb not null,
  change_note text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, version)
);

create table public.content_backlog (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  payload jsonb not null,
  priority integer not null default 0,
  status public.content_status not null default 'draft',
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  checksum text not null unique,
  filename text not null,
  status text not null check (status in ('staging','reconciling','review','approved','published','failed')),
  expected_counts jsonb not null,
  actual_counts jsonb not null default '{}',
  reconciliation_passed boolean not null default false,
  last_completed_chunk integer not null default 0,
  error_log text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.import_rows (
  id bigserial primary key,
  import_batch_id uuid not null references public.import_batches(id) on delete cascade,
  sheet_name text not null,
  row_number integer not null,
  external_id text,
  payload jsonb not null,
  row_checksum text not null,
  status text not null check (status in ('staged','validated','rejected','published')),
  errors jsonb not null default '[]',
  unique (import_batch_id, sheet_name, row_number)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'learner' check (role in ('learner','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.username_credentials (
  username text primary key check (username = lower(username) and username ~ '^[a-z0-9_]{4,20}$'),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  internal_email text not null unique,
  created_at timestamptz not null default now()
);

create table public.account_activity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_activity_at timestamptz not null default now(),
  purge_after timestamptz not null default (now() + interval '168 hours'),
  account_status public.account_status not null default 'active',
  last_touch_bucket timestamptz not null default date_trunc('hour', now()),
  updated_at timestamptz not null default now()
);

create table public.account_purge_events (
  id bigserial primary key,
  anonymous_user_hash text not null,
  purged_at timestamptz not null default now(),
  reason text not null check (reason in ('inactivity','manual')),
  unique (anonymous_user_hash, purged_at)
);

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filter jsonb not null,
  requested_count integer,
  actual_count integer not null check (actual_count >= 0),
  status public.practice_status not null default 'active',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.practice_session_items (
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  position integer not null check (position > 0),
  first_answered_at timestamptz,
  primary key (session_id, question_id),
  unique (session_id, position)
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  selected_choice_id uuid not null references public.choices(id) on delete restrict,
  session_id uuid references public.practice_sessions(id) on delete set null,
  attempt_kind public.attempt_kind not null default 'initial',
  is_correct boolean not null,
  self_rating public.self_rating not null,
  attempted_at timestamptz not null default now()
);
create index attempts_user_question_idx on public.attempts(user_id, question_id, attempted_at desc);

create table public.attempt_error_reasons (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  reason public.error_reason not null,
  narrative text,
  primary key (attempt_id, reason)
);

create table public.mastery (
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_id uuid not null references public.concepts(id) on delete cascade,
  correct_known_streak integer not null default 0 check (correct_known_streak >= 0),
  total_attempts integer not null default 0 check (total_attempts >= 0),
  correct_attempts integer not null default 0 check (correct_attempts >= 0),
  last_self_rating public.self_rating not null default 'unknown',
  last_attempted_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, concept_id)
);

create table public.review_queue (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  due_at timestamptz not null,
  interval_key text not null,
  last_attempt_id uuid references public.attempts(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('lesson','question')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('lesson','question','general')),
  entity_id uuid,
  body text not null check (char_length(body) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.review_policies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  incorrect_minutes integer not null default 10,
  correct_unknown_days integer not null default 1,
  correct_unsure_days integer not null default 3,
  correct_known_days integer not null default 7,
  known_streak_two_days integer not null default 14,
  known_streak_three_days integer not null default 30,
  active boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
create unique index one_active_review_policy on public.review_policies(active) where active;
insert into public.review_policies(name, active) values ('default', true);

create table public.rate_limit_buckets (
  fingerprint text not null,
  action text not null check (action in ('register','login')),
  bucket_date date not null default current_date,
  attempts integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (fingerprint, action, bucket_date)
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('content-assets', 'content-assets', false, 20971520)
on conflict (id) do nothing;
