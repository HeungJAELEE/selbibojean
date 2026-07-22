create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger concepts_updated_at before update on public.concepts for each row execute function public.set_updated_at();
create trigger lessons_updated_at before update on public.lessons for each row execute function public.set_updated_at();
create trigger questions_updated_at before update on public.questions for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger account_activity_updated_at before update on public.account_activity for each row execute function public.set_updated_at();
create trigger mastery_updated_at before update on public.mastery for each row execute function public.set_updated_at();
create trigger review_queue_updated_at before update on public.review_queue for each row execute function public.set_updated_at();
create trigger notes_updated_at before update on public.notes for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id) values (new.id) on conflict do nothing;
  if coalesce(new.raw_user_meta_data ->> 'account_type', '') = 'username' then
    insert into public.account_activity(user_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.validate_answer_choice()
returns trigger language plpgsql as $$
begin
  if not exists(select 1 from public.choices where id = new.correct_choice_id and question_id = new.question_id) then
    raise exception 'correct choice must belong to the question';
  end if;
  return new;
end;
$$;
create trigger answer_choice_belongs_to_question before insert or update on public.answer_keys for each row execute function public.validate_answer_choice();

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'exam_tracks','exam_modes','syllabus_versions','subjects','chapters','concept_groups','concepts','concept_aliases',
    'sources','assets','lessons','lesson_blocks','questions','choices','choice_feedback','answer_keys','rubric_items',
    'question_concepts','question_variants','lesson_questions','theory_coverage','theory_gaps','generation_runs',
    'content_flags','content_versions','content_backlog','import_batches','import_rows','profiles','username_credentials',
    'account_activity','account_purge_events','practice_sessions','practice_session_items','attempts','attempt_error_reasons',
    'mastery','review_queue','bookmarks','notes','review_policies','rate_limit_buckets'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end;
$$;

create policy public_exam_tracks on public.exam_tracks for select using (status = 'published');
create policy public_exam_modes on public.exam_modes for select using (status = 'published');
create policy public_syllabus on public.syllabus_versions for select using (status = 'published');
create policy public_subjects on public.subjects for select using (status = 'published');
create policy public_chapters on public.chapters for select using (status = 'published');
create policy public_concept_groups on public.concept_groups for select using (status = 'published');
create policy public_concepts on public.concepts for select using (status = 'published');
create policy public_concept_aliases on public.concept_aliases for select using (
  exists(select 1 from public.concepts c where c.id = concept_id and c.status = 'published')
);
create policy public_sources on public.sources for select using (true);
create policy public_assets on public.assets for select using (status = 'published');
create policy public_lessons on public.lessons for select using (status = 'published' and source_needed = false);
create policy public_lesson_blocks on public.lesson_blocks for select using (
  status = 'published' and exists(select 1 from public.lessons l where l.id = lesson_id and l.status = 'published' and l.source_needed = false)
);
create policy public_questions on public.questions for select using (
  status = 'published' and answer_validated and explanation_validated and choice_feedback_validated and theory_link_validated
);
create policy public_choices on public.choices for select using (
  exists(select 1 from public.questions q where q.id = question_id and q.status = 'published' and q.answer_validated and q.explanation_validated and q.choice_feedback_validated and q.theory_link_validated)
);
create policy public_question_variants on public.question_variants for select using (status = 'published');
create policy public_lesson_questions on public.lesson_questions for select using (
  exists(select 1 from public.lessons l where l.id = lesson_id and l.status = 'published' and l.source_needed = false)
  and exists(select 1 from public.questions q where q.id = question_id and q.status = 'published')
);
create policy public_review_policy on public.review_policies for select using (active);

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'exam_tracks','exam_modes','syllabus_versions','subjects','chapters','concept_groups','concepts','concept_aliases',
    'sources','assets','lessons','lesson_blocks','questions','choices','choice_feedback','answer_keys','rubric_items',
    'question_concepts','question_variants','lesson_questions','theory_coverage','theory_gaps','generation_runs',
    'content_flags','content_versions','content_backlog','import_batches','import_rows','review_policies'
  ] loop
    execute format('create policy admin_all_%I on public.%I for all using (public.is_admin()) with check (public.is_admin())', table_name, table_name);
  end loop;
end;
$$;

create policy profile_self_select on public.profiles for select using (id = auth.uid());
create policy account_activity_self_select on public.account_activity for select using (user_id = auth.uid());
create policy sessions_self on public.practice_sessions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy session_items_self on public.practice_session_items for all using (
  exists(select 1 from public.practice_sessions s where s.id = session_id and s.user_id = auth.uid())
) with check (
  exists(select 1 from public.practice_sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy attempts_self_select on public.attempts for select using (user_id = auth.uid());
create policy attempt_reasons_self_select on public.attempt_error_reasons for select using (
  exists(select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid())
);
create policy mastery_self_select on public.mastery for select using (user_id = auth.uid());
create policy review_queue_self_select on public.review_queue for select using (user_id = auth.uid());
create policy bookmarks_self on public.bookmarks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notes_self on public.notes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy published_assets_storage_select on storage.objects for select using (
  bucket_id = 'content-assets'
  and exists(select 1 from public.assets a where a.storage_path = name and a.status = 'published')
);
create policy admin_assets_storage_insert on storage.objects for insert with check (bucket_id = 'content-assets' and public.is_admin());
create policy admin_assets_storage_update on storage.objects for update using (bucket_id = 'content-assets' and public.is_admin()) with check (bucket_id = 'content-assets' and public.is_admin());
create policy admin_assets_storage_delete on storage.objects for delete using (bucket_id = 'content-assets' and public.is_admin());

create or replace function public.consume_rate_limit(p_fingerprint text, p_action text, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare current_attempts integer;
begin
  if p_action not in ('register','login') or p_limit < 1 or char_length(p_fingerprint) <> 64 then
    return false;
  end if;
  insert into public.rate_limit_buckets(fingerprint, action, bucket_date, attempts)
  values (p_fingerprint, p_action, current_date, 1)
  on conflict (fingerprint, action, bucket_date)
  do update set attempts = public.rate_limit_buckets.attempts + 1, updated_at = now()
  returning attempts into current_attempts;
  delete from public.rate_limit_buckets where bucket_date < current_date - 2;
  return current_attempts <= p_limit;
end;
$$;
revoke all on function public.consume_rate_limit(text,text,integer) from public;
grant execute on function public.consume_rate_limit(text,text,integer) to anon, authenticated, service_role;

create or replace function public.touch_account_activity()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  update public.account_activity
  set last_activity_at = now(),
      purge_after = now() + interval '168 hours',
      account_status = 'active',
      last_touch_bucket = date_trunc('hour', now()),
      updated_at = now()
  where user_id = auth.uid()
    and (last_touch_bucket < date_trunc('hour', now()) or account_status <> 'active');
end;
$$;
revoke all on function public.touch_account_activity() from public;
grant execute on function public.touch_account_activity() to authenticated;

create or replace function public.record_attempt(
  p_question_external_id text,
  p_selected_choice_external_id text,
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
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  attempt_id uuid;
  v_question_id uuid;
  v_choice_id uuid;
  v_concept_id uuid;
  streak integer := 0;
  due_at timestamptz;
  interval_key text;
  policy public.review_policies%rowtype;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  select q.id, c.id into v_question_id, v_choice_id
    from public.questions q join public.choices c on c.question_id = q.id
    where q.external_id = p_question_external_id and c.external_id = p_selected_choice_external_id and q.status = 'published'
      and q.answer_validated and q.explanation_validated and q.choice_feedback_validated and q.theory_link_validated
    limit 1;
  if v_question_id is null or v_choice_id is null then raise exception 'question or choice is not available'; end if;

  select qc.concept_id into v_concept_id from public.question_concepts qc where qc.question_id = v_question_id and qc.role = 'primary';
  select * into policy from public.review_policies where active limit 1;
  insert into public.attempts(user_id, question_id, selected_choice_id, session_id, attempt_kind, is_correct, self_rating)
  values (v_user_id, v_question_id, v_choice_id, p_session_id, p_attempt_kind, p_is_correct, p_self_rating)
  returning id into attempt_id;

  if not p_is_correct and p_error_reason is not null then
    insert into public.attempt_error_reasons(attempt_id, reason, narrative) values (attempt_id, p_error_reason, left(p_error_narrative, 2000));
  end if;

  if v_concept_id is not null then
    select m.correct_known_streak into streak from public.mastery m where m.user_id = v_user_id and m.concept_id = v_concept_id;
    streak := case when p_is_correct and p_self_rating = 'known' then coalesce(streak, 0) + 1 else 0 end;
    insert into public.mastery(user_id, concept_id, correct_known_streak, total_attempts, correct_attempts, last_self_rating, last_attempted_at)
    values (v_user_id, v_concept_id, streak, 1, case when p_is_correct then 1 else 0 end, p_self_rating, now())
    on conflict (user_id, concept_id) do update set
      correct_known_streak = excluded.correct_known_streak,
      total_attempts = public.mastery.total_attempts + 1,
      correct_attempts = public.mastery.correct_attempts + case when p_is_correct then 1 else 0 end,
      last_self_rating = excluded.last_self_rating,
      last_attempted_at = now();
  end if;

  if not p_is_correct then due_at := now() + make_interval(mins => policy.incorrect_minutes); interval_key := 'incorrect';
  elsif p_self_rating = 'unknown' then due_at := now() + make_interval(days => policy.correct_unknown_days); interval_key := 'correct_unknown';
  elsif p_self_rating = 'unsure' then due_at := now() + make_interval(days => policy.correct_unsure_days); interval_key := 'correct_unsure';
  elsif streak >= 3 then due_at := now() + make_interval(days => policy.known_streak_three_days); interval_key := 'known_streak_three';
  elsif streak = 2 then due_at := now() + make_interval(days => policy.known_streak_two_days); interval_key := 'known_streak_two';
  else due_at := now() + make_interval(days => policy.correct_known_days); interval_key := 'correct_known'; end if;

  insert into public.review_queue(user_id, question_id, due_at, interval_key, last_attempt_id)
  values (v_user_id, v_question_id, due_at, interval_key, attempt_id)
  on conflict (user_id, question_id) do update set due_at = excluded.due_at, interval_key = excluded.interval_key, last_attempt_id = excluded.last_attempt_id;

  if p_session_id is not null then
    update public.practice_session_items i set first_answered_at = coalesce(i.first_answered_at, now())
    where i.session_id = p_session_id and i.question_id = v_question_id
      and exists(select 1 from public.practice_sessions s where s.id = i.session_id and s.user_id = v_user_id);
  end if;
  perform public.touch_account_activity();
  return attempt_id;
end;
$$;
revoke all on function public.record_attempt(text,text,boolean,public.self_rating,public.error_reason,uuid,public.attempt_kind,text) from public;
grant execute on function public.record_attempt(text,text,boolean,public.self_rating,public.error_reason,uuid,public.attempt_kind,text) to authenticated;

create or replace function public.merge_guest_learning(p_payload jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare item jsonb; merged integer := 0;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if jsonb_typeof(p_payload) <> 'array' or jsonb_array_length(p_payload) > 500 then raise exception 'invalid guest payload'; end if;
  for item in select value from jsonb_array_elements(p_payload) loop
    begin
      perform public.record_attempt(
        item ->> 'questionId',
        item ->> 'selectedChoiceId',
        coalesce((item ->> 'isCorrect')::boolean, false),
        coalesce((item ->> 'selfRating')::public.self_rating, 'unknown'),
        case when coalesce((item ->> 'isCorrect')::boolean, false) then null else '개념 혼동'::public.error_reason end,
        null,
        coalesce((item ->> 'attemptKind')::public.attempt_kind, 'initial'),
        '게스트 브라우저 기록 병합'
      );
      merged := merged + 1;
    exception when others then
      continue;
    end;
  end loop;
  return merged;
end;
$$;
revoke all on function public.merge_guest_learning(jsonb) from public;
grant execute on function public.merge_guest_learning(jsonb) to authenticated;

create or replace function public.approve_import_batch(p_batch_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'admin required'; end if;
  if not exists(select 1 from public.import_batches where id = p_batch_id and reconciliation_passed and status = 'review') then
    raise exception 'batch reconciliation or review state is invalid';
  end if;
  if exists(select 1 from public.import_rows where import_batch_id = p_batch_id and status not in ('validated','published')) then
    raise exception 'batch contains unvalidated rows';
  end if;
  update public.import_batches set status = 'approved' where id = p_batch_id;
end;
$$;
revoke all on function public.approve_import_batch(uuid) from public;
grant execute on function public.approve_import_batch(uuid) to authenticated;
