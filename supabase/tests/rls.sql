begin;
create extension if not exists pgtap;
select plan(8);

select ok((select relrowsecurity from pg_class where oid = 'public.questions'::regclass), 'questions has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.answer_keys'::regclass), 'answer_keys has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.username_credentials'::regclass), 'username_credentials has RLS enabled');
select policies_are('public', 'questions', array['admin_all_questions','public_questions'], 'questions exposes only explicit policies');
select policies_are('public', 'answer_keys', array['admin_all_answer_keys'], 'answer keys have no public read policy');
select policies_are('public', 'username_credentials', array[]::text[], 'username mapping cannot be enumerated through RLS');
select has_function('public', 'record_attempt', array['text','text','boolean','self_rating','error_reason','uuid','attempt_kind','text'], 'server grading attempt RPC exists');
select has_function('public', 'touch_account_activity', array[]::text[], 'throttled activity RPC exists');

select * from finish();
rollback;

