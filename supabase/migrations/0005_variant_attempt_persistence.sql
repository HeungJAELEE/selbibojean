alter table public.attempts
  alter column selected_choice_id drop not null,
  add column if not exists selected_variant_choice_index smallint;

alter table public.attempts
  add constraint attempts_selected_answer_shape_check
  check (
    (
      selected_choice_id is not null
      and selected_variant_choice_index is null
    )
    or
    (
      selected_choice_id is null
      and question_variant_id is not null
      and selected_variant_choice_index is not null
    )
  ),
  add constraint attempts_variant_choice_index_check
  check (
    selected_variant_choice_index is null
    or selected_variant_choice_index >= 0
  );

comment on column public.attempts.selected_variant_choice_index is
  'Zero-based source-choice index for an exact reviewed question variant. Canonical selected_choice_id and this column are mutually exclusive.';

create or replace function public.record_variant_attempt(
  p_question_external_id text,
  p_variant_external_id text,
  p_selected_variant_choice_id text,
  p_is_correct boolean,
  p_self_rating public.self_rating,
  p_error_reason public.error_reason default null,
  p_session_id uuid default null,
  p_attempt_kind public.attempt_kind default 'initial',
  p_error_narrative text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt_id uuid;
  v_question_id uuid;
  v_variant_id uuid;
  v_concept_id uuid;
  v_choice_prefix text;
  v_choice_suffix text;
  v_choice_number integer;
  v_choice_count integer;
  v_session_choice_order text[];
  v_streak integer := 0;
  v_due_at timestamptz;
  v_interval_key text;
  v_policy public.review_policies%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select question.id, variant.id
  into v_question_id, v_variant_id
  from public.questions as question
  join public.question_variants as variant
    on variant.canonical_question_id = question.id
  where question.external_id = p_question_external_id
    and variant.external_id = p_variant_external_id
    and question.status = 'published'
    and question.answer_validated
    and question.explanation_validated
    and question.choice_feedback_validated
    and question.theory_link_validated
    and variant.status = 'published'
  limit 1;

  if v_question_id is null or v_variant_id is null then
    raise exception 'question variant is not available' using errcode = '22023';
  end if;

  v_choice_prefix := p_variant_external_id || ':choice:';
  if left(p_selected_variant_choice_id, char_length(v_choice_prefix)) <> v_choice_prefix then
    raise exception 'variant choice does not belong to the variant' using errcode = '22023';
  end if;

  v_choice_suffix := substring(
    p_selected_variant_choice_id
    from char_length(v_choice_prefix) + 1
  );
  if (
    v_choice_suffix is null
    or v_choice_suffix !~ '^[1-9][0-9]*$'
    or char_length(v_choice_suffix) > 9
  ) then
    raise exception 'variant choice index is invalid' using errcode = '22023';
  end if;
  v_choice_number := v_choice_suffix::integer;

  if p_session_id is not null then
    select item.choice_order
    into v_session_choice_order
    from public.practice_session_items as item
    join public.practice_sessions as practice_session
      on practice_session.id = item.session_id
    where item.session_id = p_session_id
      and item.question_id = v_question_id
      and item.question_variant_id = v_variant_id
      and practice_session.user_id = v_user_id;

    if v_session_choice_order is null then
      raise exception 'owned session item does not match the question variant'
        using errcode = '22023';
    end if;
    if not (p_selected_variant_choice_id = any(v_session_choice_order)) then
      raise exception 'variant choice is not present in the owned session item'
        using errcode = '22023';
    end if;
    v_choice_count := cardinality(v_session_choice_order);
  else
    select count(*)::integer
    into v_choice_count
    from public.choices as choice
    where choice.question_id = v_question_id;
  end if;

  if v_choice_number < 1 or v_choice_number > v_choice_count then
    raise exception 'variant choice index is outside the available choice range'
      using errcode = '22023';
  end if;

  select question_concept.concept_id
  into v_concept_id
  from public.question_concepts as question_concept
  where question_concept.question_id = v_question_id
    and question_concept.role = 'primary';

  select *
  into v_policy
  from public.review_policies
  where active
  limit 1;

  if v_policy.id is null then
    raise exception 'active review policy is unavailable';
  end if;

  insert into public.attempts (
    user_id,
    question_id,
    selected_choice_id,
    question_variant_id,
    selected_variant_choice_index,
    session_id,
    attempt_kind,
    is_correct,
    self_rating
  )
  values (
    v_user_id,
    v_question_id,
    null,
    v_variant_id,
    v_choice_number - 1,
    p_session_id,
    p_attempt_kind,
    p_is_correct,
    p_self_rating
  )
  returning id into v_attempt_id;

  if not p_is_correct and p_error_reason is not null then
    insert into public.attempt_error_reasons(attempt_id, reason, narrative)
    values (
      v_attempt_id,
      p_error_reason,
      left(p_error_narrative, 2000)
    );
  end if;

  if v_concept_id is not null then
    select mastery.correct_known_streak
    into v_streak
    from public.mastery as mastery
    where mastery.user_id = v_user_id
      and mastery.concept_id = v_concept_id;

    v_streak := case
      when p_is_correct and p_self_rating = 'known'
        then coalesce(v_streak, 0) + 1
      else 0
    end;

    insert into public.mastery (
      user_id,
      concept_id,
      correct_known_streak,
      total_attempts,
      correct_attempts,
      last_self_rating,
      last_attempted_at
    )
    values (
      v_user_id,
      v_concept_id,
      v_streak,
      1,
      case when p_is_correct then 1 else 0 end,
      p_self_rating,
      now()
    )
    on conflict (user_id, concept_id) do update set
      correct_known_streak = excluded.correct_known_streak,
      total_attempts = public.mastery.total_attempts + 1,
      correct_attempts =
        public.mastery.correct_attempts
        + case when p_is_correct then 1 else 0 end,
      last_self_rating = excluded.last_self_rating,
      last_attempted_at = now();
  end if;

  if not p_is_correct then
    v_due_at := now() + make_interval(mins => v_policy.incorrect_minutes);
    v_interval_key := 'incorrect';
  elsif p_self_rating = 'unknown' then
    v_due_at := now() + make_interval(days => v_policy.correct_unknown_days);
    v_interval_key := 'correct_unknown';
  elsif p_self_rating = 'unsure' then
    v_due_at := now() + make_interval(days => v_policy.correct_unsure_days);
    v_interval_key := 'correct_unsure';
  elsif v_streak >= 3 then
    v_due_at := now() + make_interval(days => v_policy.known_streak_three_days);
    v_interval_key := 'known_streak_three';
  elsif v_streak = 2 then
    v_due_at := now() + make_interval(days => v_policy.known_streak_two_days);
    v_interval_key := 'known_streak_two';
  else
    v_due_at := now() + make_interval(days => v_policy.correct_known_days);
    v_interval_key := 'correct_known';
  end if;

  insert into public.review_queue (
    user_id,
    question_id,
    due_at,
    interval_key,
    last_attempt_id
  )
  values (
    v_user_id,
    v_question_id,
    v_due_at,
    v_interval_key,
    v_attempt_id
  )
  on conflict (user_id, question_id) do update set
    due_at = excluded.due_at,
    interval_key = excluded.interval_key,
    last_attempt_id = excluded.last_attempt_id;

  if p_session_id is not null then
    update public.practice_session_items as item
    set first_answered_at = coalesce(item.first_answered_at, now())
    where item.session_id = p_session_id
      and item.question_id = v_question_id
      and item.question_variant_id = v_variant_id
      and exists (
        select 1
        from public.practice_sessions as practice_session
        where practice_session.id = item.session_id
          and practice_session.user_id = v_user_id
      );
  end if;

  perform public.touch_account_activity();
  return v_attempt_id;
end;
$$;

revoke all on function public.record_variant_attempt(
  text,
  text,
  text,
  boolean,
  public.self_rating,
  public.error_reason,
  uuid,
  public.attempt_kind,
  text
) from public;
revoke all on function public.record_variant_attempt(
  text,
  text,
  text,
  boolean,
  public.self_rating,
  public.error_reason,
  uuid,
  public.attempt_kind,
  text
) from anon;
grant execute on function public.record_variant_attempt(
  text,
  text,
  text,
  boolean,
  public.self_rating,
  public.error_reason,
  uuid,
  public.attempt_kind,
  text
) to authenticated;

create or replace function public.merge_guest_learning(p_payload jsonb)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  item jsonb;
  merged integer := 0;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  if jsonb_typeof(p_payload) <> 'array' or jsonb_array_length(p_payload) > 500 then
    raise exception 'invalid guest payload';
  end if;

  for item in select value from jsonb_array_elements(p_payload) loop
    begin
      if nullif(item ->> 'variantExternalId', '') is not null then
        perform public.record_variant_attempt(
          item ->> 'questionId',
          item ->> 'variantExternalId',
          item ->> 'selectedChoiceId',
          coalesce((item ->> 'isCorrect')::boolean, false),
          coalesce((item ->> 'selfRating')::public.self_rating, 'unknown'),
          case
            when coalesce((item ->> 'isCorrect')::boolean, false)
              then null
            else '개념 혼동'::public.error_reason
          end,
          null,
          coalesce((item ->> 'attemptKind')::public.attempt_kind, 'initial'),
          '게스트 브라우저 기록 병합'
        );
      else
        perform public.record_attempt(
          item ->> 'questionId',
          item ->> 'selectedChoiceId',
          coalesce((item ->> 'isCorrect')::boolean, false),
          coalesce((item ->> 'selfRating')::public.self_rating, 'unknown'),
          case
            when coalesce((item ->> 'isCorrect')::boolean, false)
              then null
            else '개념 혼동'::public.error_reason
          end,
          null,
          coalesce((item ->> 'attemptKind')::public.attempt_kind, 'initial'),
          '게스트 브라우저 기록 병합'
        );
      end if;
      merged := merged + 1;
    exception when others then
      continue;
    end;
  end loop;
  return merged;
end;
$$;

revoke all on function public.merge_guest_learning(jsonb) from public;
revoke all on function public.merge_guest_learning(jsonb) from anon;
grant execute on function public.merge_guest_learning(jsonb) to authenticated;
