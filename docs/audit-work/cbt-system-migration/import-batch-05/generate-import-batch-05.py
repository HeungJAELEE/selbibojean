from __future__ import annotations

import copy
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path('/mnt/data/cbt_batch05_final_work/repo')
CONTENT_PATH = ROOT / 'src/data/generated/content.json'
MANIFEST_PATH = ROOT / 'src/data/generated/cbt-reviewed-variants.json'
DRY_PATH = Path('/mnt/data/selbibojean_checkout/docs/audit-work/cbt-system-migration/batch-01-mapping-dry-run/variant-mapping-dry-run.jsonl')
OUT = ROOT / 'docs/audit-work/cbt-system-migration/import-batch-05'
OUT.mkdir(parents=True, exist_ok=True)

REVIEW_FILES = [
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20140525_q01-q50_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20140525_q51-q100_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20140920_q01-q50_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20140920_q51-q100_independent-review.jsonl',
]

NOW = '2026-08-07T20:20:00+09:00'
SYMBOLS = ['①', '②', '③', '④', '⑤']
BATCH_ID = 'import-05'
IMAGE_HOLD_IDS = {
    '2014-2-Q26', '2014-2-Q50', '2014-2-Q90', '2014-2-Q96',
    '2014-4-Q54', '2014-4-Q90', '2014-4-Q91', '2014-4-Q97',
}
CHOICE_CONFLICT_IDS = {'2014-2-Q40'}
ANSWER_KEY_CORRECTION_IDS = {'2014-4-Q87'}
CANONICAL_REASSIGNMENT_IDS = {'2014-4-Q51'}
MANUAL_CHOICE_MAPPING = {
    # source order: high speed, no-noise, continuous discharge, oil management
    # canonical order: continuous discharge, high speed, no-noise, oil management
    '2014-4-Q87': ['U-990-c2', 'U-990-c3', 'U-990-c1', 'U-990-c4'],
}
FORMULA_UNIT_SUBSTITUTION_OVERRIDES = {
    '2014-2-Q26': {
        'formula': 't_e = (a + 4m + b) / 6',
        'units': 'a, m, b, t_e는 모두 동일한 시간 단위',
        'substitution': '수치 대입 없이 낙관시간 a, 최빈시간 m, 비관시간 b의 가중평균식을 선택한다.',
        'result': 't_e=(a+4m+b)/6이며 선택지 이미지를 직접 판독하기 전에는 번호를 승인하지 않는다.',
    },
    '2014-2-Q96': {
        'formula': 'C/R = G / (1 + G)',
        'units': '전달함수의 차원은 입출력 물리량에 따르며 동일 단위 입출력에서는 무차원',
        'substitution': '단위 부궤환이고 피드백 부호가 음(-)인 경우 전향전달함수 G를 대입한다.',
        'result': 'G/(1+G). 다만 블록선도의 부호와 경로를 이미지로 확인하기 전에는 2번을 승인하지 않는다.',
    },
    '2014-4-Q57': {
        'formula': 'L_10 = (C/P)^3',
        'units': 'C와 P는 동일 하중 단위이므로 C/P와 수명비는 무차원',
        'substitution': 'P_2=P_1/2 → L_2/L_1=(P_1/P_2)^3=(P_1/(P_1/2))^3=2^3',
        'result': '수명은 8배이므로 3번',
    },
    '2014-4-Q97': {
        'formula': 'S = h × a / 360',
        'units': 'h와 S는 길이 단위, a는 degree, 360은 1회전의 각도',
        'substitution': '1회전(360°)에서 h만큼 이동하므로 a°의 이동거리는 비례식으로 계산한다.',
        'result': 'S=h·a/360이며 수식 이미지와 선택지 번호를 직접 대조하기 전에는 승인하지 않는다.',
    },
}
assert len(IMAGE_HOLD_IDS) == 8
assert len(CHOICE_CONFLICT_IDS) == 1
assert len(ANSWER_KEY_CORRECTION_IDS) == 1
assert len(CANONICAL_REASSIGNMENT_IDS) == 1


def sha_text(value: str) -> str:
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def jd(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def pretty(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]


def build_hold_resolution_policy(
    batches: list[dict[str, Any]],
    template: dict[str, Any],
    decided_at: str,
) -> dict[str, Any]:
    image_ids: set[str] = set()
    normalized_ids: set[str] = set()
    choice_conflict_ids: set[str] = set()
    low_context_ids: set[str] = set()
    for batch in batches:
        resolution = batch.get('holdResolution', {})
        image_ids.update(resolution.get('imageVerificationQueue', []))
        normalized_ids.update(resolution.get('normalizedAndRegistered', []))
        choice_conflict_ids.update(resolution.get('choiceConflictNonScoring', []))
        low_context_ids.update(resolution.get('lowContextRegistered', []))
    return {
        'decisionAuthority': template.get('decisionAuthority', 'user_explicit_approval'),
        'decidedAt': decided_at,
        'imageVerificationQueueCount': len(image_ids),
        'normalizedAndRegisteredCount': len(normalized_ids),
        'choiceConflictNonScoringCount': len(choice_conflict_ids),
        'lowContextRegisteredCount': len(low_context_ids),
        'learnerPublicationStillRequiresStatus': 'published',
    }


content = json.loads(CONTENT_PATH.read_text(encoding='utf-8'))
manifest = json.loads(MANIFEST_PATH.read_text(encoding='utf-8'))
original_content_text = CONTENT_PATH.read_text(encoding='utf-8')
original_content_sha = sha_text(original_content_text)
questions = {q['id']: q for q in content['questions']}
lessons = {l['id']: l for l in content['lessons']}
variants = {v['externalId']: v for v in content['variants']}
groups = {g['id']: g for g in content['conceptGroups']}

review_rows: list[dict[str, Any]] = []
for path in REVIEW_FILES:
    review_rows.extend(read_jsonl(path))
review_by_id = {row['externalId']: row for row in review_rows}
assert len(review_by_id) == 200

BATCH_IDS = sorted(
    review_by_id,
    key=lambda external_id: (
        int(external_id[:4]),
        int(re.search(r'Q(\d+)$', external_id).group(1)),
    ),
)
assert len(BATCH_IDS) == 200
assert all(external_id.startswith(('2014-2-', '2014-4-')) for external_id in BATCH_IDS)

dry_rows = read_jsonl(DRY_PATH)
dry_by_id = {row['externalId']: row for row in dry_rows}

# Idempotent regeneration: batch 05 owns only its 200 records and audit payload.
if any(batch.get('batchId') == BATCH_ID for batch in manifest.get('batches', [])):
    batch_id_set = set(BATCH_IDS)
    manifest = copy.deepcopy(manifest)
    manifest['batches'] = [b for b in manifest['batches'] if b.get('batchId') != BATCH_ID]
    manifest['records'] = [r for r in manifest['records'] if r['externalId'] not in batch_id_set]
    manifest['recordsSha256'] = sha_text(jd(manifest['records']))

assert len(manifest['records']) == 800, len(manifest['records'])

# Effective source after batches 01-04.
effective_lessons = dict(lessons)
for addition in manifest.get('theoryLessonAdditions', []):
    effective_lessons[addition['lesson']['id']] = addition['lesson']
effective_questions = dict(questions)
for change in manifest.get('canonicalQuestionChanges', []):
    effective_questions[change['question']['id']] = change['question']


def normalize_text(value: str) -> str:
    value = unicodedata.normalize('NFKC', value).lower()
    value = re.sub(r'[\s\-–—·,.:;()\[\]{}_/\\]+', '', value)
    return value.replace('ㆍ', '').replace('＝', '=').replace('²', '2').replace('³', '3')


def safe_choice_mapping(
    source_choices: list[str],
    canonical: dict[str, Any],
    answer_idx: int | None,
) -> list[str]:
    if answer_idx is None or not source_choices or any(not str(choice).strip() for choice in source_choices):
        return []
    candidates = canonical['choices']
    used: set[str] = set()
    result: list[str] = []
    for source_choice in source_choices:
        normalized_source = normalize_text(source_choice)
        matches = []
        for choice in candidates:
            normalized_choice = normalize_text(choice['text'])
            if (
                normalized_source == normalized_choice
                or (
                    len(normalized_source) >= 2
                    and len(normalized_choice) >= 2
                    and (normalized_source in normalized_choice or normalized_choice in normalized_source)
                )
            ):
                matches.append(choice)
        matches = [choice for choice in matches if choice['id'] not in used]
        if len(matches) != 1:
            return []
        result.append(matches[0]['id'])
        used.add(matches[0]['id'])
    if len(result) != len(source_choices) or len(set(result)) != len(result):
        return []
    if result[answer_idx] != canonical['correctChoiceId']:
        return []
    return result


def target_canonical_id(external_id: str) -> str:
    decision = dry_by_id[external_id]['decision']
    return decision.get('targetCanonicalId') or decision['currentCanonicalId']


def build_theory_link(
    external_id: str,
    target_id: str,
    review: dict[str, Any],
) -> tuple[dict[str, Any], str]:
    canonical = effective_questions[target_id]
    if external_id in CANONICAL_REASSIGNMENT_IDS:
        # The exact source duplicates 2008-4-Q53 and is assigned to the same canonical.
        lesson = effective_lessons[canonical['lessonId']]
        return {
            'canonicalId': target_id,
            'lessonId': canonical['lessonId'],
            'lessonAnchor': canonical['lessonAnchor'],
            'conceptGroupId': canonical['conceptGroupId'],
            'conceptId': canonical['conceptId'],
            'canonicalStem': canonical['stem'],
        }, 'direct_existing_theory_relinked_to_duplicate_source_canonical'

    reviewed_theory = review['theoryLink']
    lesson = effective_lessons[reviewed_theory['lessonId']]
    assert lesson['conceptId'] == reviewed_theory['conceptId'], external_id
    return {
        'canonicalId': target_id,
        'lessonId': reviewed_theory['lessonId'],
        'lessonAnchor': reviewed_theory['lessonAnchor'],
        'conceptGroupId': reviewed_theory['conceptGroupId'],
        'conceptId': reviewed_theory['conceptId'],
        'canonicalStem': canonical['stem'],
    }, (
        'direct_existing_theory_answer_key_correction'
        if external_id in ANSWER_KEY_CORRECTION_IDS
        else 'direct_existing_theory'
    )


records: list[dict[str, Any]] = []
variant_specific_ids: list[str] = []
full_mapping_ids: list[str] = []
direct_link_matrix: list[dict[str, Any]] = []
image_queue: list[str] = []
conflict_queue: list[str] = []
answer_correction_queue: list[str] = []
canonical_reassignment_queue: list[str] = []

for external_id in BATCH_IDS:
    review = review_by_id[external_id]
    source_variant = variants[external_id]
    current_canonical = source_variant['canonicalId']
    target_id = target_canonical_id(external_id)
    canonical = effective_questions[target_id]
    source_choices = list(review['sourceExactChoices'])
    source_idx = review.get('sourceAnswerIndex')
    source_answer_text = f"{SYMBOLS[source_idx]} {source_choices[source_idx]}" if isinstance(source_idx, int) else ''

    is_image = external_id in IMAGE_HOLD_IDS
    is_conflict = external_id in CHOICE_CONFLICT_IDS
    is_answer_correction = external_id in ANSWER_KEY_CORRECTION_IDS
    is_reassignment = external_id in CANONICAL_REASSIGNMENT_IDS
    answer_idx = None if (is_image or is_conflict) else review.get('independentAnswerIndex')
    reviewed_answer_text = f"{SYMBOLS[answer_idx]} {source_choices[answer_idx]}" if isinstance(answer_idx, int) else ''

    if is_image or is_conflict:
        mapping: list[str] = []
        variant_specific = False
    else:
        assert isinstance(answer_idx, int), external_id
        mapping = list(MANUAL_CHOICE_MAPPING.get(external_id, []))
        if mapping:
            canonical_choice_ids = {choice['id'] for choice in canonical['choices']}
            assert len(mapping) == len(source_choices), external_id
            assert len(set(mapping)) == len(mapping), external_id
            assert set(mapping).issubset(canonical_choice_ids), external_id
            assert mapping[answer_idx] == canonical['correctChoiceId'], external_id
        else:
            mapping = safe_choice_mapping(source_choices, canonical, answer_idx)
        variant_specific = len(mapping) == 0
        if variant_specific:
            variant_specific_ids.append(external_id)
        else:
            full_mapping_ids.append(external_id)

    theory, theory_status = build_theory_link(external_id, target_id, review)
    lesson = effective_lessons[theory['lessonId']]
    direct_solution = review['directSolution'].strip()
    choice_conflict = None
    issue_label = None

    if is_image:
        runtime_status = 'hold'
        verdict = 'HOLD'
        scoring = 'excluded_required_image'
        issue_label = '필수 이미지 확인'
        blockers = ['required_source_image_review']
        hold_reasons = list(review.get('holdReasons') or ['required_source_image_review'])
        source_agreement = 'not_verified_due_required_image'
        evidence = 'required_source_image_not_visually_verified'
        confidence = 'unknown'
        migration_class = 'IMAGE_VERIFICATION_HOLD'
        runtime_disposition = 'IMAGE_VERIFICATION_QUEUE'
        image_queue.append(external_id)
    elif is_conflict:
        runtime_status = 'choice_conflict'
        verdict = 'CHOICE_ISSUE'
        scoring = 'non_scoring_choice_conflict'
        issue_label = '선택지 충돌'
        blockers = ['choice_conflict_non_scoring']
        hold_reasons = list(review.get('holdReasons') or ['choice_conflict'])
        source_agreement = 'not_scored_due_choice_conflict'
        evidence = 'choice_conflict_documented'
        confidence = review.get('answerConfidence') or 'confirmed'
        migration_class = 'CHOICE_CONFLICT_NON_SCORING'
        runtime_disposition = 'CHOICE_CONFLICT_NON_SCORING'
        if not direct_solution.startswith('선택지 충돌:'):
            direct_solution = f'선택지 충돌: {direct_solution}'
        conflict_indices = [
            item['choiceIndex']
            for item in review['choiceByChoiceReasons']
            if item.get('evaluation') == 'incorrect_statement'
        ]
        assert len(conflict_indices) >= 2, external_id
        choice_conflict = {
            'label': '선택지 충돌',
            'conflictType': 'multiple_incorrect_choices',
            'choiceIndices': conflict_indices,
            'reason': direct_solution.removeprefix('선택지 충돌:').strip(),
            'scoringPolicy': 'non_scoring',
            'sourceAnswerTreatment': '복원 정답은 출처 기록으로만 보존하고 학습자 채점에는 사용하지 않는다.',
        }
        conflict_queue.append(external_id)
    else:
        runtime_status = 'candidate'
        verdict = review.get('reviewVerdict', 'ACCEPT')
        scoring = 'scored_after_answer_key_correction' if is_answer_correction else 'scored'
        blockers = ['pending_runtime_integration']
        if variant_specific:
            blockers.append('variant_specific_choice_contract_pending')
        hold_reasons = []
        source_agreement = review.get('sourceAnswerAgreement') or 'agrees'
        evidence = 'independent_answer_key_correction_applied' if is_answer_correction else 'independently_solved'
        confidence = review.get('answerConfidence') or 'confirmed'
        migration_class = (
            'ANSWER_KEY_CORRECTION_EXISTING_CANONICAL'
            if is_answer_correction
            else dry_by_id[external_id]['decision']['mappingClass']
        )
        runtime_disposition = (
            'PUBLICATION_CANDIDATE_WITH_VARIANT_CHOICE_CONTRACT_PENDING'
            if variant_specific else 'PUBLICATION_CANDIDATE'
        )
        if is_answer_correction:
            answer_correction_queue.append(external_id)
        if is_reassignment:
            canonical_reassignment_queue.append(external_id)

    canonical_action = 'REASSIGN_CANONICAL' if current_canonical != target_id else 'KEEP_CURRENT_CANONICAL'
    theory_action = (
        'RELINK_TO_TARGET_CANONICAL_DIRECT_THEORY'
        if is_reassignment else 'USE_DIRECT_EXISTING_THEORY'
    )

    if is_answer_correction:
        risk = '복원 정답 4번과 독립 검토 정답 2번이 충돌한다. 기존 canonical의 기술적으로 검증된 정답 2번을 사용하고 복원 답안은 출처 기록으로 보존한다.'
    elif is_image:
        risk = '필수 이미지 판독 전 정답 인덱스를 승인하지 않는다.'
    elif is_conflict:
        risk = '복원 지문 그대로라면 2번과 3번이 모두 틀려 유일한 정답이 없다.'
    elif is_reassignment:
        risk = '2008-4-Q53과 동일 원문이므로 동일 canonical U-362로 재연결한다. canonical 선택지 계약은 variant 전용으로 유지한다.'
    else:
        risk = review.get('riskNote') or '없음. 독립 풀이와 복원 정답이 일치한다.'

    record: dict[str, Any] = {
        'externalId': external_id,
        'currentCanonicalId': current_canonical,
        'canonicalId': target_id,
        'year': source_variant['year'],
        'sessionLabel': source_variant['sessionLabel'],
        'questionNumber': source_variant['questionNumber'],
        'source': {
            'textAuthority': review['sourceTextAuthority'],
            'captureAuthority': review['sourceCaptureAuthority'],
            'answerAuthority': review['sourceAnswerAuthority'],
            'displayLabel': review['sourceDisplayLabel'],
            'registeredSourceUrl': review['identity']['registeredSourceUrl'],
            'resolvedSourceUrl': review['identity']['resolvedSourceUrl'],
            'questionNumber': review['identity']['questionNumber'],
            'stemSha256': review['identity']['sourceStemSha256'],
            'orderedChoicesSha256': review['identity']['orderedChoicesSha256'],
            'registeredIdentitySha256': review['identity']['registeredIdentitySha256'],
            'resolvedIdentitySha256': review['identity']['sourceIdentitySha256'],
        },
        'stem': review['sourceExactStem'],
        'choices': source_choices,
        'sourceAnswerIndex': source_idx,
        'reviewedAnswerIndex': answer_idx,
        'sourceAnswerText': source_answer_text,
        'reviewedAnswerText': reviewed_answer_text,
        'choiceIdMapping': mapping,
        'directSolution': direct_solution,
        'formulaUnitSubstitution': FORMULA_UNIT_SUBSTITUTION_OVERRIDES.get(external_id, review.get('formulaUnitSubstitution')),
        'choiceByChoiceReasons': review['choiceByChoiceReasons'],
        'theoryLink': theory,
        'conceptKeywords': [lesson['title'], *lesson.get('aliases', [])[:3]],
        'review': {
            'verdict': verdict,
            'scoringDisposition': scoring,
            'sourceAnswerAgreement': source_agreement,
            'answerEvidence': evidence,
            'answerConfidence': confidence,
            'theoryLinkStatus': theory_status,
            'holdReasons': hold_reasons,
            'answerConflictOrMultipleAnswerRisk': risk,
            'runtimeStatus': runtime_status,
            'publicationBlockers': blockers,
            'reviewedAt': review['reviewedAt'],
        },
        'migration': {
            'mappingClass': migration_class,
            'canonicalAction': canonical_action,
            'theoryAction': theory_action,
            'runtimeDisposition': runtime_disposition,
            'confidence': 'medium' if (is_image or is_conflict) else 'high',
            'duplicateCanonicalCluster': bool(dry_by_id[external_id]['decision'].get('duplicateCanonicalCluster', False)),
            'preserveExternalId': True,
            'preserveRegisteredSourceUrl': True,
            'preserveQuestionNumber': True,
        },
    }
    if variant_specific:
        record['variantSpecificFeedbackRequired'] = True
    if issue_label:
        record['review']['issueLabel'] = issue_label
    if choice_conflict:
        record['choiceConflict'] = choice_conflict
    records.append(record)
    direct_link_matrix.append({
        'externalId': external_id,
        'currentCanonicalId': current_canonical,
        'targetCanonicalId': target_id,
        'runtimeStatus': runtime_status,
        'variantSpecificFeedbackRequired': variant_specific,
        'lessonId': theory['lessonId'],
        'lessonAnchor': theory['lessonAnchor'],
        'conceptGroupId': theory['conceptGroupId'],
        'conceptId': theory['conceptId'],
        'theoryLinkStatus': theory_status,
        'answerKeyCorrectionApplied': is_answer_correction,
        'canonicalReassignmentApplied': is_reassignment,
    })

states = Counter(record['review']['runtimeStatus'] for record in records)
assert states == Counter({'candidate': 191, 'hold': 8, 'choice_conflict': 1}), states
assert len(variant_specific_ids) + len(full_mapping_ids) == 191
assert len(full_mapping_ids) == 37, len(full_mapping_ids)
assert len(variant_specific_ids) == 154, len(variant_specific_ids)
assert set(image_queue) == IMAGE_HOLD_IDS
assert set(conflict_queue) == CHOICE_CONFLICT_IDS
assert set(answer_correction_queue) == ANSWER_KEY_CORRECTION_IDS
assert set(canonical_reassignment_queue) == CANONICAL_REASSIGNMENT_IDS

all_records = manifest['records'] + records
assert len(all_records) == 1000
assert len({record['externalId'] for record in all_records}) == 1000

batch5 = {
    'batchId': BATCH_ID,
    'reviewSessions': ['17', '18', '19', '20'],
    'externalIdRanges': ['2014-2-Q01..2014-2-Q100', '2014-4-Q01..2014-4-Q100'],
    'recordCount': 200,
    'candidateCount': 191,
    'choiceConflictCount': 1,
    'holdCount': 8,
    'normalizationCount': 0,
    'imageReviewCount': 8,
    'lowContextRegistrationCount': 0,
    'variantSpecificFeedbackCount': len(variant_specific_ids),
    'canonicalTheoryRepairs': [],
    'theoryLessonAdditionIds': [],
    'canonicalQuestionChangeIds': [],
    'holdResolution': {
        'imageVerificationQueue': sorted(IMAGE_HOLD_IDS),
        'normalizedAndRegistered': [],
        'choiceConflictNonScoring': sorted(CHOICE_CONFLICT_IDS),
        'lowContextRegistered': [],
    },
    'sourceFiles': [
        {
            'path': str(path.relative_to(ROOT)).replace('\\', '/'),
            'sha256': sha_text(path.read_text(encoding='utf-8')),
        }
        for path in REVIEW_FILES
    ],
}

new_manifest = copy.deepcopy(manifest)
new_manifest['generatedAt'] = NOW
new_manifest['batches'] = manifest['batches'] + [batch5]
new_manifest['records'] = all_records
new_manifest['recordsSha256'] = sha_text(jd(all_records))
new_manifest['holdResolutionPolicy'] = build_hold_resolution_policy(
    new_manifest['batches'],
    manifest['holdResolutionPolicy'],
    NOW,
)
MANIFEST_PATH.write_text(pretty(new_manifest), encoding='utf-8')

# Batch artifacts.
(OUT / 'theory-lesson-additions.json').write_text(pretty([]), encoding='utf-8')
(OUT / 'canonical-question-changes.json').write_text(pretty([]), encoding='utf-8')
(OUT / 'direct-theory-link-matrix.jsonl').write_text('\n'.join(jd(row) for row in direct_link_matrix) + '\n', encoding='utf-8')
(OUT / 'variant-specific-choice-contract-queue.jsonl').write_text(
    '\n'.join(jd(next(record for record in records if record['externalId'] == external_id)) for external_id in variant_specific_ids)
    + ('\n' if variant_specific_ids else ''),
    encoding='utf-8',
)
(OUT / 'image-verification-queue.jsonl').write_text(
    '\n'.join(jd(next(record for record in records if record['externalId'] == external_id)) for external_id in sorted(IMAGE_HOLD_IDS)) + '\n',
    encoding='utf-8',
)
(OUT / 'choice-conflict-queue.jsonl').write_text(
    '\n'.join(jd(next(record for record in records if record['externalId'] == external_id)) for external_id in sorted(CHOICE_CONFLICT_IDS)) + '\n',
    encoding='utf-8',
)
(OUT / 'answer-key-correction-ledger.jsonl').write_text(
    '\n'.join(jd(next(record for record in records if record['externalId'] == external_id)) for external_id in sorted(ANSWER_KEY_CORRECTION_IDS)) + '\n',
    encoding='utf-8',
)
(OUT / 'canonical-reassignment-ledger.jsonl').write_text(
    '\n'.join(jd({
        'externalId': external_id,
        'currentCanonicalId': next(record for record in records if record['externalId'] == external_id)['currentCanonicalId'],
        'targetCanonicalId': next(record for record in records if record['externalId'] == external_id)['canonicalId'],
        'duplicateOfExternalId': '2008-4-Q53',
        'reason': '지문·정답·보기 집합이 같은 기어 표면피로 분류 문항이므로 동일 canonical을 사용한다.',
        'choiceContract': 'variant_specific_choice_contract_pending',
    }) for external_id in sorted(CANONICAL_REASSIGNMENT_IDS)) + '\n',
    encoding='utf-8',
)
(OUT / 'manual-choice-mapping-ledger.jsonl').write_text(
    '\n'.join(jd({
        'externalId': external_id,
        'choiceIdMapping': mapping,
        'reviewedAnswerIndex': next(record for record in records if record['externalId'] == external_id)['reviewedAnswerIndex'],
        'canonicalCorrectChoiceId': effective_questions[next(record for record in records if record['externalId'] == external_id)['canonicalId']]['correctChoiceId'],
        'reason': '문구는 축약·재배열됐지만 네 선택지의 기술적 의미가 canonical 선택지와 1:1로 일치한다.',
    }) for external_id, mapping in sorted(MANUAL_CHOICE_MAPPING.items())) + '\n',
    encoding='utf-8',
)
(OUT / 'variant-mapping.jsonl').write_text('\n'.join(jd(record) for record in records) + '\n', encoding='utf-8')
(OUT / 'external-ids.json').write_text(pretty(BATCH_IDS), encoding='utf-8')

theory_gap_audit = {
    'batchId': BATCH_ID,
    'recordCount': 200,
    'existingDirectTheoryLinksRetained': 199,
    'existingTheoryRelinks': 1,
    'newDirectTheoryLessonsAdded': 0,
    'missingDirectTheoryAfterBatch': 0,
    'relinkedRecords': [
        {
            'externalId': '2014-4-Q51',
            'fromCanonicalId': 'U-100',
            'toCanonicalId': 'U-362',
            'lessonId': 'lesson-w8vtqs',
            'reason': '2008-4-Q53과 동일 원문이므로 기어 표면피로 canonical과 직접 이론으로 통합한다.',
        }
    ],
    'notes': [
        '2014-2-Q40은 기존 설비관리 조직원칙 레슨이 과도한 전문화와 인간을 수단으로만 보는 보기의 동시 오류를 이미 직접 설명하므로 신규 이론을 만들지 않았다.',
        '2014-4-Q87은 기존 스크루압축기 특성 레슨과 canonical U-990이 독립 정답 2번을 이미 직접 설명하므로 복원 답안만 교정 원장에 보존했다.',
        '2014-4-Q51은 dry-run의 중복기출 재배정에 따라 U-362와 lesson-w8vtqs로 직접 재연결했다.',
        '나머지 197문항은 검수본의 lesson·anchor·conceptGroup·concept가 현재 effective content와 직접 일치한다.',
    ],
}
(OUT / 'theory-gap-audit.json').write_text(pretty(theory_gap_audit), encoding='utf-8')

summary = {
    'batchId': BATCH_ID,
    'generatedAt': NOW,
    'recordCount': 200,
    'states': dict(states),
    'fullCanonicalChoiceMappingCount': len(full_mapping_ids),
    'manualChoiceMappingCount': len(MANUAL_CHOICE_MAPPING),
    'variantSpecificFeedbackPendingCount': len(variant_specific_ids),
    'theoryLessonAdditionCount': 0,
    'canonicalQuestionChangeCount': 0,
    'directTheoryLinkCount': 200,
    'existingTheoryRelinkCount': 1,
    'imageVerificationQueueCount': 8,
    'choiceConflictCount': 1,
    'answerKeyCorrectionCount': 1,
    'canonicalReassignmentCount': 1,
    'sourceContentSha256Before': original_content_sha,
    'sourceContentUnchanged': sha_text(CONTENT_PATH.read_text(encoding='utf-8')) == original_content_sha,
}
(OUT / 'batch-summary.json').write_text(pretty(summary), encoding='utf-8')

report = f'''# CBT 시스템 실제 이식 배치 05 보고서

- 범위: 2014년 2회 100문항 + 2014년 4회 100문항
- candidate: 191
- 선택지 충돌 비채점: 1
- 필수 이미지 HOLD: 8
- 정답키 독립 교정: 1
- canonical 재배정: 1
- 신규 직접 이론 레슨: 0
- canonical 교체 overlay: 0
- canonical 선택지 1:1 매핑 완료: {len(full_mapping_ids)}
- variant 전용 선택지 계약 대기: {len(variant_specific_ids)}

## 핵심 교정

- `2014-4-Q87`: 복원 정답 4번을 출처 기록으로 보존하되 독립 검토 정답 2번을 사용한다. 기존 canonical U-990과 스크루압축기 특성 레슨이 이미 같은 기술 결론을 소유하므로 신규 canonical을 만들지 않았다.
- `2014-2-Q40`: 복원 선택지 2번과 3번이 모두 틀려 선택지 충돌·비채점으로 등록한다. 기존 조직원칙 레슨이 충돌 원인을 직접 설명하므로 신규 이론은 불필요하다.
- `2014-4-Q51`: 2008-4-Q53과 같은 원문 기출이므로 U-100에서 U-362로 재연결하고 기어 표면피로 직접 이론을 사용한다.

## 공개 경계

- 모든 배치 05 레코드는 candidate, choice_conflict 또는 hold이며 published는 0건이다.
- 이미지 8건은 정답·풀이·선택지 매핑을 활성화하지 않는다.
- 선택지 충돌 1건은 내부 해설을 보존하되 학습자 채점에 사용하지 않는다.
- variant 전용 선택지 계약 대기 문항은 canonical 문자 유사도 fallback을 사용하지 않는다.
- 원본 content.json은 수정하지 않는다.
'''
(OUT / 'import-report.md').write_text(report, encoding='utf-8')


def lesson_has_anchor(lesson: dict[str, Any], anchor: str) -> bool:
    return any(block['id'] == anchor for block in lesson.get('blocks', []))


validation = {
    'status': 'PASS',
    'recordCount': 200,
    'candidateCount': states['candidate'],
    'choiceConflictCount': states['choice_conflict'],
    'holdCount': states['hold'],
    'exactExternalIdSet': len(set(BATCH_IDS)) == 200,
    'sourceHashesMatch': all(
        sha_text(record['stem']) == record['source']['stemSha256']
        and sha_text(jd(record['choices'])) == record['source']['orderedChoicesSha256']
        for record in records
    ),
    'directTheoryLinksPresent': all(record['theoryLink'] is not None for record in records),
    'directTheoryAnchorsExist': all(
        record['theoryLink'] is not None
        and record['theoryLink']['lessonId'] in effective_lessons
        and lesson_has_anchor(effective_lessons[record['theoryLink']['lessonId']], record['theoryLink']['lessonAnchor'])
        for record in records
    ),
    'candidateCanonicalTheoryConsistent': all(
        effective_questions[record['canonicalId']]['lessonId'] == record['theoryLink']['lessonId']
        and effective_questions[record['canonicalId']]['lessonAnchor'] == record['theoryLink']['lessonAnchor']
        and effective_questions[record['canonicalId']]['conceptGroupId'] == record['theoryLink']['conceptGroupId']
        and effective_questions[record['canonicalId']]['conceptId'] == record['theoryLink']['conceptId']
        for record in records if record['review']['runtimeStatus'] == 'candidate'
    ),
    'candidateAnswersPresent': all(
        isinstance(record['reviewedAnswerIndex'], int) and bool(record['reviewedAnswerText'])
        for record in records if record['review']['runtimeStatus'] == 'candidate'
    ),
    'imageHoldAnswersDisabled': all(
        record['reviewedAnswerIndex'] is None
        and not record['reviewedAnswerText']
        and not record['choiceIdMapping']
        for record in records if record['review']['runtimeStatus'] == 'hold'
    ),
    'choiceConflictNonScoring': all(
        record['reviewedAnswerIndex'] is None
        and not record['reviewedAnswerText']
        and not record['choiceIdMapping']
        and record.get('choiceConflict', {}).get('scoringPolicy') == 'non_scoring'
        for record in records if record['review']['runtimeStatus'] == 'choice_conflict'
    ),
    'variantSpecificBlocked': all(
        'variant_specific_choice_contract_pending' in record['review']['publicationBlockers']
        and not record['choiceIdMapping']
        for record in records if record.get('variantSpecificFeedbackRequired')
    ),
    'answerKeyCorrectionApplied': next(record for record in records if record['externalId'] == '2014-4-Q87')['reviewedAnswerIndex'] == 1,
    'sourceAnswerPreservedForCorrection': next(record for record in records if record['externalId'] == '2014-4-Q87')['sourceAnswerIndex'] == 3,
    'answerKeyCorrectionChoiceContractReady': next(record for record in records if record['externalId'] == '2014-4-Q87')['choiceIdMapping'] == MANUAL_CHOICE_MAPPING['2014-4-Q87'],
    'choiceConflictIndicesExact': next(record for record in records if record['externalId'] == '2014-2-Q40')['choiceConflict']['choiceIndices'] == [1, 2],
    'canonicalReassignmentApplied': next(record for record in records if record['externalId'] == '2014-4-Q51')['canonicalId'] == 'U-362',
    'canonicalReassignmentTheoryApplied': next(record for record in records if record['externalId'] == '2014-4-Q51')['theoryLink']['lessonId'] == 'lesson-w8vtqs',
    'theoryGapCountAfterBatch': 0,
    'sourceContentUnchanged': sha_text(CONTENT_PATH.read_text(encoding='utf-8')) == original_content_sha,
}
assert all(
    value is True or key in {
        'status', 'recordCount', 'candidateCount', 'choiceConflictCount', 'holdCount', 'theoryGapCountAfterBatch'
    }
    for key, value in validation.items()
), validation
(OUT / 'validation.json').write_text(pretty(validation), encoding='utf-8')

artifact_paths = [
    MANIFEST_PATH,
    OUT / 'theory-lesson-additions.json',
    OUT / 'canonical-question-changes.json',
    OUT / 'direct-theory-link-matrix.jsonl',
    OUT / 'variant-specific-choice-contract-queue.jsonl',
    OUT / 'image-verification-queue.jsonl',
    OUT / 'choice-conflict-queue.jsonl',
    OUT / 'answer-key-correction-ledger.jsonl',
    OUT / 'canonical-reassignment-ledger.jsonl',
    OUT / 'manual-choice-mapping-ledger.jsonl',
    OUT / 'variant-mapping.jsonl',
    OUT / 'external-ids.json',
    OUT / 'theory-gap-audit.json',
    OUT / 'batch-summary.json',
    OUT / 'import-report.md',
    OUT / 'validation.json',
]
artifact_manifest = {
    'generatedAt': NOW,
    'sourceContentSha256': original_content_sha,
    'files': [
        {
            'path': str(path.relative_to(ROOT)).replace('\\', '/'),
            'size': path.stat().st_size,
            'sha256': sha_text(path.read_text(encoding='utf-8')),
        }
        for path in artifact_paths
    ],
}
(OUT / 'artifact-manifest.json').write_text(pretty(artifact_manifest), encoding='utf-8')

print(pretty(summary))
print('manifest sha', sha_text(MANIFEST_PATH.read_text(encoding='utf-8')))
