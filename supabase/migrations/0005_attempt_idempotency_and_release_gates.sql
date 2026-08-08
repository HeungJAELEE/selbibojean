-- Make practice submissions and guest-record merges retry-safe.
-- The client-supplied UUID is scoped to a user and is never treated as a
-- substitute for server-side answer validation.

alter table public.attempts
  add column if not exists client_attempt_id uuid;

create unique index if not exists attempts_user_client_attempt_unique
  on public.attempts(user_id, client_attempt_id)
  where client_attempt_id is not null;

revoke all on function public.record_attempt(
  text,
  text,
  boolean,
  public.self_rating,
  public.error_reason,
  uuid,
  public.attempt_kind,
  text
) from public, anon, authenticated;

drop function if exists public.record_attempt(
  text,
  text,
  boolean,
  public.self_rating,
  public.error_reason,
  uuid,
  public.attempt_kind,
  text
);

create or replace function public.record_attempt(
  p_question_external_id text,
  p_selected_choice_external_id text,
  p_is_correct boolean,
  p_self_rating public.self_rating,
  p_error_reason public.error_reason default null,
  p_session_id uuid default null,
  p_attempt_kind public.attempt_kind default 'initial',
  p_error_narrative text default null,
  p_client_attempt_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt_id uuid;
  v_existing_attempt public.attempts%rowtype;
  v_question_id uuid;
  v_choice_id uuid;
  v_concept_id uuid;
  v_is_correct boolean;
  v_streak integer := 0;
  v_due_at timestamptz;
  v_interval_key text;
  v_policy public.review_policies%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_client_attempt_id is null then
    raise exception 'client attempt id required' using errcode = '22023';
  end if;

  select
    question.id,
    choice.id,
    question_concept.concept_id,
    answer_key.correct_choice_id = choice.id
  into
    v_question_id,
    v_choice_id,
    v_concept_id,
    v_is_correct
  from public.questions as question
  join public.choices as choice
    on choice.question_id = question.id
  join public.answer_keys as answer_key
    on answer_key.question_id = question.id
   and answer_key.validated
  left join public.question_concepts as question_concept
    on question_concept.question_id = question.id
   and question_concept.role = 'primary'
  where question.external_id = p_question_external_id
    and choice.external_id = p_selected_choice_external_id
    and question.status = 'published'
    and question.answer_validated
    and question.explanation_validated
    and question.choice_feedback_validated
    and question.theory_link_validated
  limit 1;

  if v_question_id is null or v_choice_id is null then
    raise exception 'question or choice is not available';
  end if;

  if p_is_correct is distinct from v_is_correct then
    raise exception 'answer result mismatch' using errcode = '22023';
  end if;

  if p_session_id is not null and not exists (
    select 1
    from public.practice_sessions as practice_session
    join public.practice_session_items as session_item
      on session_item.session_id = practice_session.id
    where practice_session.id = p_session_id
      and practice_session.user_id = v_user_id
      and session_item.question_id = v_question_id
  ) then
    raise exception 'owned practice session item required' using errcode = '22023';
  end if;

  select *
  into v_policy
  from public.review_policies
  where active
  limit 1;

  if not found then
    raise exception 'active review policy required';
  end if;

  insert into public.attempts(
    user_id,
    question_id,
    selected_choice_id,
    session_id,
    attempt_kind,
    is_correct,
    self_rating,
    client_attempt_id
  )
  values (
    v_user_id,
    v_question_id,
    v_choice_id,
    p_session_id,
    p_attempt_kind,
    v_is_correct,
    p_self_rating,
    p_client_attempt_id
  )
  on conflict (user_id, client_attempt_id)
    where client_attempt_id is not null
  do nothing
  returning id into v_attempt_id;

  if v_attempt_id is null then
    select *
    into v_existing_attempt
    from public.attempts
    where user_id = v_user_id
      and client_attempt_id = p_client_attempt_id;

    if not found then
      raise exception 'idempotent attempt lookup failed';
    end if;

    if v_existing_attempt.question_id is distinct from v_question_id
      or v_existing_attempt.selected_choice_id is distinct from v_choice_id
      or v_existing_attempt.session_id is distinct from p_session_id
      or v_existing_attempt.attempt_kind is distinct from p_attempt_kind
      or v_existing_attempt.is_correct is distinct from v_is_correct
      or v_existing_attempt.self_rating is distinct from p_self_rating
    then
      raise exception 'client attempt id payload conflict' using errcode = '22023';
    end if;

    return v_existing_attempt.id;
  end if;

  if not v_is_correct and p_error_reason is not null then
    insert into public.attempt_error_reasons(attempt_id, reason, narrative)
    values (v_attempt_id, p_error_reason, left(p_error_narrative, 2000));
  end if;

  if v_concept_id is not null then
    select mastery.correct_known_streak
    into v_streak
    from public.mastery as mastery
    where mastery.user_id = v_user_id
      and mastery.concept_id = v_concept_id;

    v_streak := case
      when v_is_correct and p_self_rating = 'known'
        then coalesce(v_streak, 0) + 1
      else 0
    end;

    insert into public.mastery(
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
      case when v_is_correct then 1 else 0 end,
      p_self_rating,
      now()
    )
    on conflict (user_id, concept_id) do update set
      correct_known_streak = excluded.correct_known_streak,
      total_attempts = public.mastery.total_attempts + 1,
      correct_attempts = public.mastery.correct_attempts
        + case when v_is_correct then 1 else 0 end,
      last_self_rating = excluded.last_self_rating,
      last_attempted_at = now();
  end if;

  if not v_is_correct then
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

  insert into public.review_queue(
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
    update public.practice_session_items as session_item
    set first_answered_at = coalesce(session_item.first_answered_at, now())
    where session_item.session_id = p_session_id
      and session_item.question_id = v_question_id;
  end if;

  perform public.touch_account_activity();
  return v_attempt_id;
end;
$$;

revoke all on function public.record_attempt(
  text,
  text,
  boolean,
  public.self_rating,
  public.error_reason,
  uuid,
  public.attempt_kind,
  text,
  uuid
) from public, anon;

grant execute on function public.record_attempt(
  text,
  text,
  boolean,
  public.self_rating,
  public.error_reason,
  uuid,
  public.attempt_kind,
  text,
  uuid
) to authenticated;

create or replace function public.merge_guest_learning(p_payload jsonb)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item jsonb;
  v_merged integer := 0;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  if jsonb_typeof(p_payload) <> 'array'
    or jsonb_array_length(p_payload) < 1
    or jsonb_array_length(p_payload) > 500
  then
    raise exception 'invalid guest payload';
  end if;

  for v_item in select value from jsonb_array_elements(p_payload)
  loop
    begin
      if coalesce(v_item ->> 'clientAttemptId', '') = '' then
        raise exception 'client attempt id required';
      end if;

      perform public.record_attempt(
        v_item ->> 'questionId',
        v_item ->> 'selectedChoiceId',
        coalesce((v_item ->> 'isCorrect')::boolean, false),
        coalesce((v_item ->> 'selfRating')::public.self_rating, 'unknown'),
        case
          when coalesce((v_item ->> 'isCorrect')::boolean, false)
            then null
          else '개념 혼동'::public.error_reason
        end,
        null,
        coalesce((v_item ->> 'attemptKind')::public.attempt_kind, 'initial'),
        '게스트 브라우저 기록 병합',
        (v_item ->> 'clientAttemptId')::uuid
      );
      v_merged := v_merged + 1;
    exception when others then
      continue;
    end;
  end loop;

  return v_merged;
end;
$$;

revoke all on function public.merge_guest_learning(jsonb)
  from public, anon;
grant execute on function public.merge_guest_learning(jsonb)
  to authenticated;
