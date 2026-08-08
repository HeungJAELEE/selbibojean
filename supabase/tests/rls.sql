begin;
create extension if not exists pgtap;
select plan(20);

select ok((select relrowsecurity from pg_class where oid = 'public.questions'::regclass), 'questions has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.answer_keys'::regclass), 'answer_keys has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.username_credentials'::regclass), 'username_credentials has RLS enabled');
select policies_are('public', 'questions', array['admin_all_questions','public_questions'], 'questions exposes only explicit policies');
select policies_are('public', 'answer_keys', array['admin_all_answer_keys'], 'answer keys have no public read policy');
select policies_are('public', 'username_credentials', array[]::text[], 'username mapping cannot be enumerated through RLS');
select policies_are('public', 'profiles', array['profile_self_select'], 'profile role remains read-only to its owner');
select policies_are('public', 'account_activity', array['account_activity_self_select'], 'account activity has no client mutation policy');
select has_function('public', 'record_attempt', array['text','text','boolean','self_rating','error_reason','uuid','attempt_kind','text','uuid'], 'idempotent server grading attempt RPC exists');
select hasnt_function('public', 'record_attempt', array['text','text','boolean','self_rating','error_reason','uuid','attempt_kind','text'], 'legacy non-idempotent attempt RPC was removed');
select has_column('public', 'attempts', 'client_attempt_id', 'attempt idempotency key column exists');
select has_index('public', 'attempts', 'attempts_user_client_attempt_unique', 'per-user attempt idempotency index exists');
select has_function('public', 'touch_account_activity', array[]::text[], 'throttled activity RPC exists');
select has_function('public', 'touch_account_activity', array['uuid','text','uuid'], 'proof-carrying activity RPC exists');
select has_function('public', 'claim_inactive_account', array['uuid','bigint','timestamp with time zone'], 'CAS purge claim RPC exists');
select has_function('public', 'verify_account_purge_claim', array['uuid','bigint','timestamp with time zone'], 'purge claim readback RPC exists');
select has_function('public', 'release_account_purge_claim', array['uuid','bigint','timestamp with time zone'], 'purge claim release RPC exists');
select has_column('public', 'account_activity', 'activity_version', 'activity version column exists');
select has_column('public', 'account_activity', 'purge_claimed_at', 'purge claim timestamp column exists');
select has_column('public', 'account_activity', 'state', 'purge state column exists');

select * from finish();
rollback;
