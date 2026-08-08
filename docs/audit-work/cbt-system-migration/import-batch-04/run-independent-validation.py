from __future__ import annotations

import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path('/mnt/data/cbt_batch04_final_work/repo')
OUT = ROOT / 'docs/audit-work/cbt-system-migration/import-batch-04'
CONTENT = ROOT / 'src/data/generated/content.json'
MANIFEST = ROOT / 'src/data/generated/cbt-reviewed-variants.json'


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha_text(value: str) -> str:
    return sha_bytes(value.encode('utf-8'))


def jd(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]


failures: list[str] = []
content_text = CONTENT.read_text(encoding='utf-8')
content = json.loads(content_text)
manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
questions = {q['id']: q for q in content['questions']}
lessons = {l['id']: l for l in content['lessons']}
groups = {g['id']: g for g in content['conceptGroups']}
variants = {v['externalId']: v for v in content['variants']}

if manifest.get('formatVersion') != 1:
    failures.append('manifest formatVersion is not 1')
if sha_text(jd(manifest['records'])) != manifest['recordsSha256']:
    failures.append('records digest mismatch')
if sha_text(jd(manifest.get('theoryLessonAdditions', []))) != manifest.get('theoryLessonAdditionsSha256'):
    failures.append('theory additions digest mismatch')
if sha_text(jd(manifest.get('canonicalQuestionChanges', []))) != manifest.get('canonicalQuestionChangesSha256'):
    failures.append('canonical changes digest mismatch')
if len(manifest['records']) != 800 or len({r['externalId'] for r in manifest['records']}) != 800:
    failures.append('800-record exact-set/uniqueness failed')
if any(r['review']['runtimeStatus'] == 'published' for r in manifest['records']):
    failures.append('a reviewed record is unexpectedly published')

# Validate all extension identities and build effective content.
for addition in manifest.get('theoryLessonAdditions', []):
    lesson = addition['lesson']
    if lesson['id'] in lessons:
        failures.append(f"duplicate lesson ID: {lesson['id']}")
        continue
    group = groups.get(lesson['conceptGroupId'])
    if not group or group['subjectId'] != lesson['subjectId']:
        failures.append(f"invalid lesson group: {lesson['id']}")
    if lesson.get('contentStatus') == 'published' or lesson.get('publication', {}).get('readiness') == 'ready':
        failures.append(f"new lesson is publish-ready: {lesson['id']}")
    if not addition.get('directExternalIds') or any(eid not in variants for eid in addition['directExternalIds']):
        failures.append(f"invalid lesson directExternalIds: {lesson['id']}")
    if len({b['id'] for b in lesson['blocks']}) != len(lesson['blocks']):
        failures.append(f"duplicate lesson block ID: {lesson['id']}")
    lessons[lesson['id']] = lesson

for change in manifest.get('canonicalQuestionChanges', []):
    question = change['question']
    existing = questions.get(question['id'])
    if change['action'] == 'replace':
        if existing is None:
            failures.append(f"replacement target missing: {question['id']}")
        elif sha_text(jd(existing)) != change['previousQuestionSha256']:
            failures.append(f"replacement previous digest mismatch: {question['id']}")
    elif change['action'] == 'add':
        if existing is not None or change['previousQuestionSha256'] is not None:
            failures.append(f"invalid addition identity: {question['id']}")
    lesson = lessons.get(question['lessonId'])
    if not lesson:
        failures.append(f"question lesson missing: {question['id']}")
    else:
        if lesson['subjectId'] != question['subjectId'] or lesson['conceptGroupId'] != question['conceptGroupId'] or lesson['conceptId'] != question['conceptId']:
            failures.append(f"question/lesson classification mismatch: {question['id']}")
        if not any(b['id'] == question['lessonAnchor'] for b in lesson['blocks']):
            failures.append(f"question lesson anchor missing: {question['id']}")
    choice_ids = [c['id'] for c in question['choices']]
    if len(choice_ids) < 2 or len(set(choice_ids)) != len(choice_ids) or question['correctChoiceId'] not in choice_ids:
        failures.append(f"question choice contract invalid: {question['id']}")
    if question.get('contentStatus') == 'published' or question.get('publication', {}).get('readiness') == 'ready':
        failures.append(f"changed question unexpectedly publish-ready: {question['id']}")
    questions[question['id']] = question

# Validate batches and source exact sets.
offset = 0
for batch in manifest['batches']:
    batch_records = manifest['records'][offset:offset + batch['recordCount']]
    offset += batch['recordCount']
    source_ids: list[str] = []
    for source_file in batch['sourceFiles']:
        path = ROOT / source_file['path']
        raw = path.read_text(encoding='utf-8')
        if sha_text(raw) != source_file['sha256']:
            failures.append(f"{batch['batchId']} source digest mismatch: {source_file['path']}")
        source_ids.extend(row['externalId'] for row in read_jsonl(path))
    if batch['batchId'] == 'import-04' and (
        len(source_ids) != len(batch_records)
        or set(source_ids) != {r['externalId'] for r in batch_records}
    ):
        failures.append(f"{batch['batchId']} source exact-set mismatch")
    states = Counter(r['review']['runtimeStatus'] for r in batch_records)
    if states.get('candidate', 0) != batch['candidateCount'] or states.get('choice_conflict', 0) != batch['choiceConflictCount'] or states.get('hold', 0) != batch['holdCount']:
        failures.append(f"{batch['batchId']} state count mismatch")
    if sum(states.values()) != batch['recordCount']:
        failures.append(f"{batch['batchId']} state total mismatch")
if offset != len(manifest['records']):
    failures.append('batch offsets do not cover all records')

# Validate every record against source and effective theory/canonical contracts.
generic_fragments = ['정답과 다름', '같은 세부항목군', '문제의 핵심어']
for record in manifest['records'][600:800]:
    eid = record['externalId']
    variant = variants.get(eid)
    if not variant:
        failures.append(f"variant missing: {eid}")
        continue
    if record['year'] != variant['year'] or record['questionNumber'] != variant['questionNumber']:
        failures.append(f"year/question number changed: {eid}")
    if record['source']['registeredSourceUrl'] != variant['sourceUrl']:
        failures.append(f"registered source URL changed: {eid}")
    if sha_text(record['stem']) != record['source']['stemSha256']:
        failures.append(f"stem digest mismatch: {eid}")
    if sha_text(jd(record['choices'])) != record['source']['orderedChoicesSha256']:
        failures.append(f"ordered choices digest mismatch: {eid}")
    if len(record['choices']) != len(record['choiceByChoiceReasons']):
        failures.append(f"choice feedback length mismatch: {eid}")
    for index, reason in enumerate(record['choiceByChoiceReasons']):
        if reason['choiceIndex'] != index or reason['choiceText'] != record['choices'][index] or not reason['reason'].strip():
            failures.append(f"choice feedback alignment mismatch: {eid}:{index + 1}")
        if any(fragment in reason['reason'] for fragment in generic_fragments):
            failures.append(f"generic choice feedback remains: {eid}:{index + 1}")
    theory = record.get('theoryLink')
    if not theory:
        failures.append(f"theory link missing: {eid}")
    else:
        lesson = lessons.get(theory['lessonId'])
        canonical = questions.get(theory['canonicalId'])
        if not lesson or not canonical:
            failures.append(f"theory target missing: {eid}")
        else:
            if theory['conceptGroupId'] != lesson['conceptGroupId'] or theory['conceptId'] != lesson['conceptId']:
                failures.append(f"theory classification mismatch: {eid}")
            if not any(block['id'] == theory['lessonAnchor'] for block in lesson['blocks']):
                failures.append(f"theory anchor missing: {eid}")
            if theory['canonicalId'] != record['canonicalId']:
                failures.append(f"theory canonical mismatch: {eid}")
    status = record['review']['runtimeStatus']
    if status == 'candidate':
        answer_idx = record['reviewedAnswerIndex']
        if not isinstance(answer_idx, int) or not (0 <= answer_idx < len(record['choices'])):
            failures.append(f"candidate answer missing: {eid}")
        elif not record['reviewedAnswerText'].endswith(record['choices'][answer_idx]):
            failures.append(f"candidate answer text mismatch: {eid}")
        if record.get('variantSpecificFeedbackRequired'):
            if record['choiceIdMapping'] or 'variant_specific_choice_contract_pending' not in record['review']['publicationBlockers']:
                failures.append(f"variant-specific candidate is not blocked: {eid}")
        else:
            canonical = questions[record['canonicalId']]
            if len(record['choiceIdMapping']) != len(record['choices']):
                failures.append(f"ready choice mapping incomplete: {eid}")
            elif record['choiceIdMapping'][answer_idx] != canonical['correctChoiceId']:
                failures.append(f"ready choice mapping answer mismatch: {eid}")
    elif status == 'hold':
        if record['reviewedAnswerIndex'] is not None or record['reviewedAnswerText'] or record['choiceIdMapping']:
            failures.append(f"image hold exposes answer contract: {eid}")
        if record['review'].get('issueLabel') != '필수 이미지 확인':
            failures.append(f"image hold label missing: {eid}")
    elif status == 'choice_conflict':
        if record['reviewedAnswerIndex'] is not None or record['reviewedAnswerText'] or record['choiceIdMapping']:
            failures.append(f"choice conflict exposes answer contract: {eid}")
        if record.get('choiceConflict', {}).get('scoringPolicy') != 'non_scoring' or not record['directSolution'].startswith('선택지 충돌:'):
            failures.append(f"choice conflict contract invalid: {eid}")
    else:
        failures.append(f"unexpected reviewed status {status}: {eid}")

# Batch-04 exact queues and special contracts.
batch4 = next((b for b in manifest['batches'] if b['batchId'] == 'import-04'), None)
if not batch4:
    failures.append('import-04 batch metadata missing')
else:
    batch4_records = manifest['records'][600:800]
    expected_ids = json.loads((OUT / 'external-ids.json').read_text(encoding='utf-8'))
    if [r['externalId'] for r in batch4_records] != expected_ids:
        failures.append('batch-04 ordered exact-set mismatch')
    queue_specs = {
        'image-verification-queue.jsonl': set(batch4['holdResolution']['imageVerificationQueue']),
        'choice-conflict-queue.jsonl': set(batch4['holdResolution']['choiceConflictNonScoring']),
        'answer-key-correction-ledger.jsonl': {'2013-4-Q48'},
        'dry-run-decision-overrides.jsonl': {'2012-4-Q08'},
    }
    for filename, expected in queue_specs.items():
        actual = {row['externalId'] for row in read_jsonl(OUT / filename)}
        if actual != expected:
            failures.append(f"{filename} exact-set mismatch: {actual} != {expected}")
    variant_specific = {r['externalId'] for r in batch4_records if r.get('variantSpecificFeedbackRequired')}
    actual_variant_specific = {row['externalId'] for row in read_jsonl(OUT / 'variant-specific-choice-contract-queue.jsonl')}
    if actual_variant_specific != variant_specific or len(variant_specific) != 158:
        failures.append('batch-04 variant-specific queue mismatch')

special = {r['externalId']: r for r in manifest['records'][600:800]}
q48 = special['2013-4-Q48']
if not (
    q48['sourceAnswerIndex'] == 0
    and q48['reviewedAnswerIndex'] == 2
    and q48['choiceIdMapping'][2] == 'U-1072-c3'
    and q48['theoryLink']['lessonId'] == 'lesson-cbt-forward-curved-fan-power-curve'
    and questions['U-1072']['correctChoiceId'] == 'U-1072-c3'
):
    failures.append('2013-4-Q48 correction contract failed')
q84 = special['2013-4-Q84']
if not (
    q84['review']['runtimeStatus'] == 'choice_conflict'
    and q84['theoryLink']['lessonId'] == 'lesson-cbt-pneumatic-sequence-troubleshooting-choice-conflict'
    and q84['theoryLink']['conceptGroupId'] == 's1-g08'
    and questions['U-1089']['conceptGroupId'] == 's1-g08'
):
    failures.append('2013-4-Q84 conflict/theory contract failed')
q08 = special['2012-4-Q08']
if not (
    q08['currentCanonicalId'] == 'U-1099'
    and q08['canonicalId'] == 'U-1099'
    and q08['theoryLink']['lessonId'] == 'lesson-eqilq7'
    and q08['migration']['mappingClass'] == 'DRY_RUN_REASSIGNMENT_OVERRIDDEN_BY_DIRECT_CANONICAL_REVIEW'
):
    failures.append('2012-4-Q08 dry-run override failed')

if 'lesson-cbt-fan-power-curve-answer-correction' in lessons:
    failures.append('stale interrupted batch-04 lesson remains')

# Static publication and answer-leak gates are still present in runtime code.
reviewed_code = (ROOT / 'src/lib/content/reviewed-cbt-variants.ts').read_text(encoding='utf-8')
past_exam_code = (ROOT / 'src/lib/content/past-exam-examples.ts').read_text(encoding='utf-8')
practice_code = (ROOT / 'src/lib/content/practice-presentations.ts').read_text(encoding='utf-8')
supabase_code = (ROOT / 'src/lib/content/supabase-materialization.ts').read_text(encoding='utf-8')
if reviewed_code.count('variant.reviewState !== "published"') < 2:
    failures.append('published-only reviewed choice/answer gate missing')
if 'reviewState === "published"' not in supabase_code:
    failures.append('Supabase reviewed publication gate missing')
if 'variant.reviewState' not in past_exam_code or 'published' not in past_exam_code:
    failures.append('past-exam publication gate missing')
if 'isSafeOriginalPracticeVariant' not in practice_code:
    failures.append('practice publication safety gate missing')
for forbidden in ['reviewedAnswerIndex', 'sourceAnswerIndex', 'directSolution', 'choiceByChoiceReasons', 'reviewedAnswerText', 'sourceAnswerText', 'choiceIdMapping']:
    reviewed_payload_section = supabase_code[supabase_code.index('const reviewedPayload'):supabase_code.index('return {', supabase_code.index('const reviewedPayload'))]
    import re
    if re.search(rf'\b{re.escape(forbidden)}\s*:', reviewed_payload_section):
        failures.append(f"Supabase pre-submit reviewed payload includes {forbidden}")

result = {
    'status': 'PASS' if not failures else 'FAIL',
    'recordCount': len(manifest['records']),
    'batch04RecordCount': 200,
    'batch04StateCounts': dict(Counter(r['review']['runtimeStatus'] for r in manifest['records'][600:800])),
    'cumulativeStateCounts': dict(Counter(r['review']['runtimeStatus'] for r in manifest['records'])),
    'theoryLessonAdditionCount': len(manifest.get('theoryLessonAdditions', [])),
    'canonicalQuestionChangeCount': len(manifest.get('canonicalQuestionChanges', [])),
    'batch04VariantSpecificFeedbackCount': sum(bool(r.get('variantSpecificFeedbackRequired')) for r in manifest['records'][600:800]),
    'batch04ReadyChoiceMappingCount': sum(
        r['review']['runtimeStatus'] == 'candidate' and not r.get('variantSpecificFeedbackRequired')
        for r in manifest['records'][600:800]
    ),
    'sourceContentSha256': sha_text(content_text),
    'manifestSha256': sha_text(MANIFEST.read_text(encoding='utf-8')),
    'failures': failures,
}
(OUT / 'independent-validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
raise SystemExit(0 if not failures else 1)
