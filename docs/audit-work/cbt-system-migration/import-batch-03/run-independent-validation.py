from __future__ import annotations

import copy
import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path('/mnt/data/cbt_batch03_final_work/repo')
OUT = ROOT / 'docs/audit-work/cbt-system-migration/import-batch-03'
CONTENT = ROOT / 'src/data/generated/content.json'
MANIFEST = ROOT / 'src/data/generated/cbt-reviewed-variants.json'
EXPECTED_CONTENT_SHA = '7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4'


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha_text(value: str) -> str:
    return sha_bytes(value.encode('utf-8'))


def compact(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]


failures: list[str] = []
checks: dict[str, Any] = {}
content_raw = CONTENT.read_bytes()
content = json.loads(content_raw)
manifest_raw = MANIFEST.read_text(encoding='utf-8')
manifest = json.loads(manifest_raw)


def require(condition: bool, message: str) -> None:
    if not condition:
        failures.append(message)


# Source immutability and top-level digests.
content_sha = sha_bytes(content_raw)
require(content_sha == EXPECTED_CONTENT_SHA, f'content.json SHA changed: {content_sha}')
require(manifest['recordsSha256'] == sha_text(compact(manifest['records'])), 'recordsSha256 mismatch')
require(
    manifest['theoryLessonAdditionsSha256'] == sha_text(compact(manifest['theoryLessonAdditions'])),
    'theoryLessonAdditionsSha256 mismatch',
)
require(
    manifest['canonicalQuestionChangesSha256'] == sha_text(compact(manifest['canonicalQuestionChanges'])),
    'canonicalQuestionChangesSha256 mismatch',
)
require(len(manifest['records']) == 600, 'cumulative record count must be 600')
require(len({r['externalId'] for r in manifest['records']}) == 600, 'cumulative external IDs must be unique')
require([b['batchId'] for b in manifest['batches']] == ['import-01', 'import-02', 'import-03'], 'batch order mismatch')
require('answerKeyConflictScoringAllowed' not in manifest['migrationPolicy'], 'unused answer-key-conflict migration key remains')
require('answerKeyConflictCount' not in manifest['holdResolutionPolicy'], 'unused answer-key-conflict policy count remains')

# Exact cumulative resolution sets derived only from batch metadata.
resolution_sets = {
    'imageVerificationQueueCount': set(),
    'normalizedAndRegisteredCount': set(),
    'choiceConflictNonScoringCount': set(),
    'lowContextRegisteredCount': set(),
}
field_map = {
    'imageVerificationQueueCount': 'imageVerificationQueue',
    'normalizedAndRegisteredCount': 'normalizedAndRegistered',
    'choiceConflictNonScoringCount': 'choiceConflictNonScoring',
    'lowContextRegisteredCount': 'lowContextRegistered',
}
for batch in manifest['batches']:
    for count_key, field in field_map.items():
        resolution_sets[count_key].update(batch['holdResolution'].get(field, []))
for count_key, ids in resolution_sets.items():
    require(manifest['holdResolutionPolicy'][count_key] == len(ids), f'{count_key} exact-set count mismatch')
checks['cumulativeResolutionCounts'] = {k: len(v) for k, v in resolution_sets.items()}

# Build exact batch-03 source set.
batch = next((b for b in manifest['batches'] if b['batchId'] == 'import-03'), None)
require(batch is not None, 'import-03 metadata missing')
assert batch is not None
batch_records = manifest['records'][400:600]
source_rows: list[dict[str, Any]] = []
source_by_id: dict[str, dict[str, Any]] = {}
for source_file in batch['sourceFiles']:
    path = ROOT / source_file['path']
    raw = path.read_bytes()
    require(sha_bytes(raw) == source_file['sha256'], f'source digest mismatch: {source_file["path"]}')
    rows = read_jsonl(path)
    source_rows.extend(rows)
    source_by_id.update({row['externalId']: row for row in rows})
expected_ids = json.loads((OUT / 'external-ids.json').read_text(encoding='utf-8'))
actual_ids = [r['externalId'] for r in batch_records]
require(actual_ids == expected_ids, 'batch-03 ordered external ID set mismatch')
require(set(source_by_id) == set(expected_ids), 'batch-03 review source exact set mismatch')
require(len(source_rows) == 200, 'batch-03 source row count mismatch')

# Effective lessons/questions after overlays.
lessons = {x['id']: copy.deepcopy(x) for x in content['lessons']}
for addition in manifest['theoryLessonAdditions']:
    lesson = addition['lesson']
    require(lesson['id'] not in lessons or lesson['id'].startswith('lesson-cbt-'), f'non-CBT lesson overwritten: {lesson["id"]}')
    lessons[lesson['id']] = copy.deepcopy(lesson)
questions = {x['id']: copy.deepcopy(x) for x in content['questions']}
original_questions = copy.deepcopy(questions)
for change in manifest['canonicalQuestionChanges']:
    question = change['question']
    prior = questions.get(question['id'])
    if change['action'] == 'add':
        require(prior is None, f'canonical add target already exists: {question["id"]}')
        require(change.get('previousQuestionSha256') is None, f'canonical add has previous SHA: {question["id"]}')
    elif change['action'] == 'replace':
        require(prior is not None, f'canonical change target missing: {question["id"]}')
        if prior is not None:
            require(sha_text(compact(prior)) == change['previousQuestionSha256'], f'canonical previous SHA mismatch: {question["id"]}')
    else:
        require(False, f'unsupported canonical action: {change.get("action")}')
    questions[question['id']] = copy.deepcopy(question)

# Per-record source, state, theory and choice-contract validation.
states = Counter()
full_mapping_ids: list[str] = []
variant_specific_ids: list[str] = []
for record in batch_records:
    eid = record['externalId']
    source = source_by_id[eid]
    states[record['review']['runtimeStatus']] += 1
    require(record['stem'] == source['sourceExactStem'], f'{eid}: stem differs from reviewed source')
    require(record['choices'] == source['sourceExactChoices'], f'{eid}: choices differ from reviewed source')
    require(record['sourceAnswerIndex'] == source.get('sourceAnswerIndex'), f'{eid}: source answer index drift')
    require(record['source']['stemSha256'] == sha_text(record['stem']), f'{eid}: stem SHA mismatch')
    require(record['source']['orderedChoicesSha256'] == sha_text(compact(record['choices'])), f'{eid}: choice SHA mismatch')
    require(record['source']['registeredSourceUrl'] == source['identity']['registeredSourceUrl'], f'{eid}: registered URL drift')
    require(record['source']['questionNumber'] == source['identity']['questionNumber'], f'{eid}: question number drift')
    require(record['migration']['preserveExternalId'] is True, f'{eid}: external ID preservation disabled')
    require(record['migration']['preserveRegisteredSourceUrl'] is True, f'{eid}: source URL preservation disabled')
    require(record['migration']['preserveQuestionNumber'] is True, f'{eid}: question number preservation disabled')

    presentation_choices = record.get('normalizedPresentation', {}).get('choices', record['choices'])
    presentation_stem = record.get('normalizedPresentation', {}).get('stem', record['stem'])
    require(len(record['choiceByChoiceReasons']) == len(presentation_choices), f'{eid}: choice reason count mismatch')
    for idx, reason in enumerate(record['choiceByChoiceReasons']):
        require(reason['choiceIndex'] == idx, f'{eid}: choice reason index mismatch at {idx}')
        require(reason['choiceText'] == presentation_choices[idx], f'{eid}: choice reason text mismatch at {idx}')
        require(bool(reason['reason'].strip()), f'{eid}: empty choice reason at {idx}')

    theory = record['theoryLink']
    require(theory['canonicalId'] == record['canonicalId'], f'{eid}: theory canonical mismatch')
    require(theory['lessonId'] in lessons, f'{eid}: lesson missing: {theory["lessonId"]}')
    if theory['lessonId'] in lessons:
        lesson = lessons[theory['lessonId']]
        require(theory['conceptGroupId'] == lesson['conceptGroupId'], f'{eid}: concept group mismatch')
        require(theory['conceptId'] == lesson['conceptId'], f'{eid}: concept mismatch')
        require(theory['lessonAnchor'] in {b['id'] for b in lesson['blocks']}, f'{eid}: lesson anchor missing')
    require(record['canonicalId'] in questions, f'{eid}: effective canonical missing')

    state = record['review']['runtimeStatus']
    mapping = record['choiceIdMapping']
    if state == 'candidate':
        idx = record['reviewedAnswerIndex']
        require(isinstance(idx, int) and 0 <= idx < len(presentation_choices), f'{eid}: candidate answer index invalid')
        if isinstance(idx, int) and 0 <= idx < len(presentation_choices):
            expected_text = f'{["①", "②", "③", "④", "⑤"][idx]} {presentation_choices[idx]}'
            require(record['reviewedAnswerText'] == expected_text, f'{eid}: reviewed answer text mismatch')
        require(bool(record['directSolution'].strip()), f'{eid}: candidate direct solution missing')
        require('pending_runtime_integration' in record['review']['publicationBlockers'], f'{eid}: runtime publication blocker missing')
        if record.get('variantSpecificFeedbackRequired'):
            variant_specific_ids.append(eid)
            require(mapping == [], f'{eid}: variant-specific record has active canonical mapping')
            require('variant_specific_choice_contract_pending' in record['review']['publicationBlockers'], f'{eid}: variant-specific blocker missing')
        else:
            full_mapping_ids.append(eid)
            require(len(mapping) == len(presentation_choices), f'{eid}: full mapping length mismatch')
            canonical = questions[record['canonicalId']]
            canonical_choice_ids = {c['id'] for c in canonical['choices']}
            require(set(mapping).issubset(canonical_choice_ids), f'{eid}: mapped choice ID absent from canonical')
            if isinstance(idx, int) and idx < len(mapping):
                require(mapping[idx] == canonical['correctChoiceId'], f'{eid}: mapped answer differs from canonical correct choice')
    elif state == 'hold':
        require(record['review']['issueLabel'] == '필수 이미지 확인', f'{eid}: hold is not image-gated')
        require(record['reviewedAnswerIndex'] is None, f'{eid}: hold answer index active')
        require(record['reviewedAnswerText'] == '', f'{eid}: hold answer text active')
        require(mapping == [], f'{eid}: hold choice mapping active')
        require('required_source_image_review' in record['review']['publicationBlockers'], f'{eid}: image blocker missing')
    elif state == 'choice_conflict':
        require(record['review']['issueLabel'] == '선택지 충돌', f'{eid}: conflict label mismatch')
        require(record['reviewedAnswerIndex'] is None, f'{eid}: conflict answer index active')
        require(record['reviewedAnswerText'] == '', f'{eid}: conflict answer text active')
        require(mapping == [], f'{eid}: conflict mapping active')
        require(record['directSolution'].startswith('선택지 충돌:'), f'{eid}: conflict explanation prefix missing')
        require(record['choiceConflict']['scoringPolicy'] == 'non_scoring', f'{eid}: conflict scoring enabled')
    else:
        failures.append(f'{eid}: unexpected batch-03 runtime state {state}')

require(states == Counter({'candidate': 190, 'hold': 8, 'choice_conflict': 2}), f'batch-03 state counts mismatch: {states}')
require(len(full_mapping_ids) == 23, f'full canonical mapping count mismatch: {len(full_mapping_ids)}')
require(len(variant_specific_ids) == 167, f'variant-specific count mismatch: {len(variant_specific_ids)}')

# Exact queue sets.
queue_expectations = {
    'variant-specific-choice-contract-queue.jsonl': set(variant_specific_ids),
    'image-verification-queue.jsonl': set(batch['holdResolution']['imageVerificationQueue']),
    'choice-conflict-queue.jsonl': set(batch['holdResolution']['choiceConflictNonScoring']),
    'answer-key-correction-ledger.jsonl': {'2010-4-Q59'},
}
for name, expected in queue_expectations.items():
    rows = read_jsonl(OUT / name)
    ids = [r['externalId'] for r in rows]
    require(len(ids) == len(set(ids)), f'{name}: duplicate external ID')
    require(set(ids) == expected, f'{name}: exact set mismatch')

# High-load special cases.
by_id = {r['externalId']: r for r in batch_records}
q59 = by_id['2010-4-Q59']
require(q59['sourceAnswerIndex'] == 0 and q59['reviewedAnswerIndex'] == 2, '2010-4-Q59 correction indices mismatch')
require(q59['review']['verdict'] == 'REVISE' and q59['review']['runtimeStatus'] == 'candidate', '2010-4-Q59 correction state mismatch')
require(q59['theoryLink']['lessonId'] == 'lesson-cbt-safety-valve-simmering-correction', '2010-4-Q59 direct lesson mismatch')
require(q59['choiceIdMapping'][2] == 'U-1215-c3', '2010-4-Q59 corrected mapping mismatch')
require(questions['U-1215']['correctChoiceId'] == 'U-1215-c3', 'U-1215 canonical corrected answer mismatch')
require(questions['U-1215']['publication']['readiness'] == 'blocked', 'U-1215 correction unexpectedly publishable')
require(by_id['2011-4-Q42']['choiceConflict']['choiceIndices'] == [0, 1, 2, 3], '2011-4-Q42 conflict set mismatch')
require(by_id['2011-4-Q59']['choiceConflict']['choiceIndices'] == [1, 2], '2011-4-Q59 conflict set mismatch')
require(by_id['2010-4-Q92']['currentCanonicalId'] == 'U-561' and by_id['2010-4-Q92']['canonicalId'] == 'U-1342', '2010-4-Q92 semantic reassignment mismatch')
require(by_id['2011-4-Q65']['currentCanonicalId'] == 'U-849' and by_id['2011-4-Q65']['canonicalId'] == 'U-736', '2011-4-Q65 semantic reassignment mismatch')

# No active publication in cumulative reviewed import.
require(all(r['review']['runtimeStatus'] != 'published' for r in manifest['records']), 'reviewed manifest contains published records')
require(not (OUT / 'answer-key-conflict-queue.jsonl').exists(), 'stale answer-key conflict queue remains')
require(not (OUT / 'normalization-ledger.jsonl').exists(), 'stale normalization queue remains')

# Audit matrix and manifest consistency.
direct_matrix = read_jsonl(OUT / 'direct-theory-link-matrix.jsonl')
require(len(direct_matrix) == 200, 'direct theory matrix count mismatch')
require({r['externalId'] for r in direct_matrix} == set(expected_ids), 'direct theory matrix exact set mismatch')
for row in direct_matrix:
    rec = by_id[row['externalId']]
    require(row['lessonId'] == rec['theoryLink']['lessonId'], f'{row["externalId"]}: matrix lesson mismatch')
    require(row['lessonAnchor'] == rec['theoryLink']['lessonAnchor'], f'{row["externalId"]}: matrix anchor mismatch')
    require(bool(row['variantSpecificFeedbackRequired']) == bool(rec.get('variantSpecificFeedbackRequired')), f'{row["externalId"]}: matrix variant-specific mismatch')

# URLs must be concrete and not truncated placeholders.
for addition in manifest['theoryLessonAdditions'][-3:]:
    source_block = next(b for b in addition['lesson']['blocks'] if b['id'] == 'source')
    require('...' not in source_block['body'], f'{addition["lesson"]["id"]}: truncated source URL')

checks.update({
    'contentSha256': content_sha,
    'manifestSha256': sha_text(manifest_raw),
    'recordCount': len(manifest['records']),
    'batch3RecordCount': len(batch_records),
    'cumulativeStates': dict(Counter(r['review']['runtimeStatus'] for r in manifest['records'])),
    'batch3States': dict(states),
    'fullCanonicalChoiceMappingCount': len(full_mapping_ids),
    'variantSpecificFeedbackPendingCount': len(variant_specific_ids),
    'theoryLessonAdditionCount': len(manifest['theoryLessonAdditions']),
    'canonicalQuestionChangeCount': len(manifest['canonicalQuestionChanges']),
    'batch3NewTheoryLessons': batch['theoryLessonAdditionIds'],
    'batch3CanonicalChanges': batch['canonicalQuestionChangeIds'],
    'semanticReassignments': {
        '2010-4-Q92': 'U-561 -> U-1342',
        '2011-4-Q65': 'U-849 -> U-736',
    },
})

result = {
    'status': 'PASS' if not failures else 'FAIL',
    'failureCount': len(failures),
    'failures': failures,
    'checks': checks,
}
(OUT / 'independent-validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
raise SystemExit(1 if failures else 0)
