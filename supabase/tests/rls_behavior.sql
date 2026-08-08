begin;
create extension if not exists pgtap;
select plan(17);

-- Stable fixtures for row-level and RPC behavior tests.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'rls-a@example.invalid',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'rls-b@example.invalid',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  );

insert into public.exam_tracks(id, code, title, status)
values (
  '20000000-0000-0000-0000-000000000001',
  'rls-test-track',
  'RLS test track',
  'published'
);
insert into public.exam_modes(id, exam_track_id, code, title, status)
values (
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  'written',
  'Written',
  'published'
);
insert into public.syllabus_versions(id, exam_track_id, title, status)
values (
  '20000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000001',
  'RLS test syllabus',
  'published'
);
insert into public.subjects(
  id,
  syllabus_version_id,
  code,
  title,
  short_title,
  sort_order,
  status
)
values (
  '20000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000003',
  1,
  'RLS test subject',
  'RLS',
  1,
  'published'
);
insert into public.concept_groups(
  id,
  subject_id,
  external_key,
  title,
  sort_order,
  status
)
values (
  '20000000-0000-0000-0000-000000000005',
  '20000000-0000-0000-0000-000000000004',
  'rls-test-group',
  'RLS test group',
  1,
  'published'
);
insert into public.concepts(id, concept_group_id, canonical_name, status)
values (
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000005',
  'RLS test concept',
  'published'
);
insert into public.lessons(
  id,
  concept_id,
  slug,
  title,
  source_needed,
  status
)
values (
  '20000000-0000-0000-0000-000000000007',
  '20000000-0000-0000-0000-000000000006',
  'rls-test-lesson',
  'RLS test lesson',
  false,
  'published'
);
insert into public.questions(
  id,
  external_id,
  exam_track_id,
  exam_mode_id,
  subject_id,
  stem,
  explanation,
  status,
  answer_validated,
  explanation_validated,
  choice_feedback_validated,
  theory_link_validated
)
values
  (
    '20000000-0000-0000-0000-000000000008',
    'RLS-PUBLISHED-Q1',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000004',
    'Published question',
    'Published explanation',
    'published',
    true,
    true,
    true,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000009',
    'RLS-CANDIDATE-Q2',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000004',
    'Candidate question',
    'Candidate explanation',
    'in_review',
    true,
    true,
    true,
    true
  );
insert into public.choices(id, external_id, question_id, label, body, sort_order)
values
  (
    '20000000-0000-0000-0000-000000000010',
    'RLS-PUBLISHED-Q1-C1',
    '20000000-0000-0000-0000-000000000008',
    '1',
    'Correct',
    1
  ),
  (
    '20000000-0000-0000-0000-000000000011',
    'RLS-PUBLISHED-Q1-C2',
    '20000000-0000-0000-0000-000000000008',
    '2',
    'Incorrect',
    2
  );
insert into public.answer_keys(
  question_id,
  correct_choice_id,
  answer_text,
  rationale,
  validated
)
values (
  '20000000-0000-0000-0000-000000000008',
  '20000000-0000-0000-0000-000000000010',
  'Correct',
  'Server-side answer',
  true
);
insert into public.question_concepts(question_id, concept_id, role)
values (
  '20000000-0000-0000-0000-000000000008',
  '20000000-0000-0000-0000-000000000006',
  'primary'
);
insert into public.practice_sessions(
  id,
  user_id,
  filter,
  requested_count,
  actual_count,
  status
)
values (
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '{}',
  1,
  1,
  'active'
);
insert into public.practice_session_items(session_id, question_id, position)
values (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000008',
  1
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select is(
  (select count(*)::integer from public.questions where external_id = 'RLS-PUBLISHED-Q1'),
  1,
  'authenticated users can read a fully published question'
);
select is(
  (select count(*)::integer from public.questions where external_id = 'RLS-CANDIDATE-Q2'),
  0,
  'candidate questions are hidden by RLS'
);
select is(
  (select count(*)::integer from public.answer_keys),
  0,
  'answer keys are never readable by learners'
);

select throws_ok(
  $$
    select public.record_attempt(
      'RLS-PUBLISHED-Q1',
      'RLS-PUBLISHED-Q1-C1',
      true,
      'known',
      null,
      null,
      'initial',
      null,
      null
    )
  $$,
  '22023',
  'client attempt id required',
  'attempt writes require an idempotency key'
);

select ok(
  public.record_attempt(
    'RLS-PUBLISHED-Q1',
    'RLS-PUBLISHED-Q1-C1',
    true,
    'known',
    null,
    null,
    'initial',
    null,
    '40000000-0000-0000-0000-000000000001'
  ) is not null,
  'a server-validated attempt is recorded'
);
select is(
  public.record_attempt(
    'RLS-PUBLISHED-Q1',
    'RLS-PUBLISHED-Q1-C1',
    true,
    'known',
    null,
    null,
    'initial',
    null,
    '40000000-0000-0000-0000-000000000001'
  )::text,
  (
    select id::text
    from public.attempts
    where client_attempt_id = '40000000-0000-0000-0000-000000000001'
  ),
  'repeating the same client attempt id returns the original attempt'
);
select is(
  (select count(*)::integer from public.attempts),
  1,
  'idempotent retry does not duplicate attempts'
);
select is(
  (
    select total_attempts
    from public.mastery
    where concept_id = '20000000-0000-0000-0000-000000000006'
  ),
  1,
  'idempotent retry does not double-count mastery'
);

select throws_ok(
  $$
    select public.record_attempt(
      'RLS-PUBLISHED-Q1',
      'RLS-PUBLISHED-Q1-C2',
      false,
      'known',
      '개념 혼동',
      null,
      'initial',
      null,
      '40000000-0000-0000-0000-000000000001'
    )
  $$,
  '22023',
  'client attempt id payload conflict',
  'reusing an idempotency key for another payload is rejected'
);
select throws_ok(
  $$
    select public.record_attempt(
      'RLS-PUBLISHED-Q1',
      'RLS-PUBLISHED-Q1-C1',
      false,
      'known',
      null,
      null,
      'initial',
      null,
      '40000000-0000-0000-0000-000000000002'
    )
  $$,
  '22023',
  'answer result mismatch',
  'clients cannot forge correctness'
);
select throws_ok(
  $$
    select public.record_attempt(
      'RLS-PUBLISHED-Q1',
      'RLS-PUBLISHED-Q1-C1',
      true,
      'known',
      null,
      '30000000-0000-0000-0000-000000000001',
      'initial',
      null,
      '40000000-0000-0000-0000-000000000003'
    )
  $$,
  '22023',
  'owned practice session item required',
  'another user session cannot be attached to an attempt'
);

select is(
  public.merge_guest_learning(
    '[{"clientAttemptId":"40000000-0000-0000-0000-000000000004","questionId":"RLS-PUBLISHED-Q1","selectedChoiceId":"RLS-PUBLISHED-Q1-C2","isCorrect":false,"selfRating":"unsure","attemptKind":"initial"}]'::jsonb
  ),
  1,
  'a valid guest attempt is merged'
);
select is(
  public.merge_guest_learning(
    '[{"clientAttemptId":"40000000-0000-0000-0000-000000000004","questionId":"RLS-PUBLISHED-Q1","selectedChoiceId":"RLS-PUBLISHED-Q1-C2","isCorrect":false,"selfRating":"unsure","attemptKind":"initial"}]'::jsonb
  ),
  1,
  'repeating a guest merge is accepted idempotently'
);
select is(
  (select count(*)::integer from public.attempts),
  2,
  'repeated guest merge creates only one additional attempt'
);
select is(
  (
    select total_attempts
    from public.mastery
    where concept_id = '20000000-0000-0000-0000-000000000006'
  ),
  2,
  'repeated guest merge does not double-count mastery'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);
select is(
  (select count(*)::integer from public.attempts),
  0,
  'one learner cannot read another learner attempts'
);
select throws_ok(
  $$
    insert into public.attempts(
      user_id,
      question_id,
      selected_choice_id,
      attempt_kind,
      is_correct,
      self_rating,
      client_attempt_id
    )
    values (
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000008',
      '20000000-0000-0000-0000-000000000010',
      'initial',
      true,
      'known',
      '40000000-0000-0000-0000-000000000005'
    )
  $$,
  '42501',
  null,
  'learners cannot bypass the grading RPC with a direct insert'
);

select * from finish();
rollback;
