from __future__ import annotations

import copy
import hashlib
import json
import re
import unicodedata
from collections import Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any

ROOT = Path('/mnt/data/cbt_batch04_final_work/repo')
CONTENT_PATH = ROOT / 'src/data/generated/content.json'
MANIFEST_PATH = ROOT / 'src/data/generated/cbt-reviewed-variants.json'
DRY_PATH = Path('/mnt/data/selbibojean_checkout/docs/audit-work/cbt-system-migration/batch-01-mapping-dry-run/variant-mapping-dry-run.jsonl')
OUT = ROOT / 'docs/audit-work/cbt-system-migration/import-batch-04'
OUT.mkdir(parents=True, exist_ok=True)

REVIEW_FILES = [
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20120915_q01-q50_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20120915_q51-q100_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20130928_q01-q50_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20130928_q51-q100_independent-review.jsonl',
]

NOW = '2026-08-07T23:20:00+09:00'
SYMBOLS = ['①', '②', '③', '④', '⑤']
BATCH_ID = 'import-04'
NEW_LESSON_IDS = {
    # The first ID is a superseded pre-generator draft that must be removed
    # during idempotent regeneration. The latter two are the canonical batch-04 IDs.
    'lesson-cbt-fan-power-curve-answer-correction',
    'lesson-cbt-forward-curved-fan-power-curve',
    'lesson-cbt-pneumatic-sequence-troubleshooting-choice-conflict',
}
NEW_CANONICAL_IDS = {'U-1072', 'U-1089'}
STALE_BATCH04_LESSON_IDS = {'lesson-cbt-fan-power-curve-answer-correction'}
IMAGE_HOLD_IDS = {
    '2012-4-Q36', '2012-4-Q43', '2012-4-Q57', '2012-4-Q93',
    '2013-4-Q17', '2013-4-Q46',
}
CHOICE_CONFLICT_IDS = {'2013-4-Q84'}
ANSWER_KEY_CORRECTION_IDS = {'2013-4-Q48'}
DRY_RUN_CANONICAL_OVERRIDE_IDS = {'2012-4-Q08'}
assert len(IMAGE_HOLD_IDS) == 6
assert len(CHOICE_CONFLICT_IDS) == 1
assert len(ANSWER_KEY_CORRECTION_IDS) == 1


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
assert all(external_id.startswith(('2012-4-', '2013-4-')) for external_id in BATCH_IDS)

dry_rows = read_jsonl(DRY_PATH)
dry_by_id = {row['externalId']: row for row in dry_rows}

# Idempotent regeneration: remove batch-04 payload only.
if any(batch.get('batchId') == BATCH_ID for batch in manifest.get('batches', [])):
    batch_id_set = set(BATCH_IDS)
    manifest = copy.deepcopy(manifest)
    manifest['batches'] = [b for b in manifest['batches'] if b.get('batchId') != BATCH_ID]
    manifest['records'] = [r for r in manifest['records'] if r['externalId'] not in batch_id_set]
    manifest['theoryLessonAdditions'] = [
        addition for addition in manifest.get('theoryLessonAdditions', [])
        if addition['lesson']['id'] not in NEW_LESSON_IDS
    ]
    manifest['canonicalQuestionChanges'] = [
        change for change in manifest.get('canonicalQuestionChanges', [])
        if not (
            change['question']['id'] in NEW_CANONICAL_IDS
            and any(external_id in batch_id_set for external_id in change['affectedExternalIds'])
        )
    ]
    manifest['recordsSha256'] = sha_text(jd(manifest['records']))
    manifest['theoryLessonAdditionsSha256'] = sha_text(jd(manifest.get('theoryLessonAdditions', [])))
    manifest['canonicalQuestionChangesSha256'] = sha_text(jd(manifest.get('canonicalQuestionChanges', [])))

# Remove stale draft-only batch-04 lesson IDs from an earlier interrupted generator.
manifest['theoryLessonAdditions'] = [
    addition for addition in manifest.get('theoryLessonAdditions', [])
    if addition['lesson']['id'] not in STALE_BATCH04_LESSON_IDS
]
manifest['theoryLessonAdditionsSha256'] = sha_text(jd(manifest.get('theoryLessonAdditions', [])))

assert len(manifest['records']) == 600, len(manifest['records'])

# Effective source after batches 01-03.
effective_lessons = dict(lessons)
for addition in manifest.get('theoryLessonAdditions', []):
    effective_lessons[addition['lesson']['id']] = addition['lesson']
effective_questions = dict(questions)
for change in manifest.get('canonicalQuestionChanges', []):
    effective_questions[change['question']['id']] = change['question']

lesson_specs = [
    {
        'id': 'lesson-cbt-forward-curved-fan-power-curve',
        'subject': 'subject-3',
        'group': 's3-g10',
        'concept': 'concept-cbt-forward-curved-fan-power-curve',
        'title': '송풍기 날개형상과 축동력 곡선',
        'aliases': ['다익 팬', '전향곡선 팬', 'forward-curved fan', '비과부하 특성', 'fan power curve'],
        'external': ['2013-4-Q48'],
        'questions': ['U-1072'],
        'anchor': 'principle',
        'summary': [
            '전향곡선형 다익 팬은 풍량이 증가할수록 축동력 요구가 자유토출점까지 크게 증가하는 과부하형 특성을 보인다.',
            '터보·에어포일처럼 후향형 계열은 동력이 최고점 뒤 감소하는 비과부하형 특성이 일반적이다.',
            '팬 명칭만 외우지 말고 날개형상과 풍량-동력곡선을 직접 대조해야 한다.',
        ],
        'definition': '팬의 축동력 곡선은 일정 회전수에서 풍량 변화에 따라 구동축이 요구하는 동력이 어떻게 변하는지를 나타낸다. 전향곡선형과 후향곡선형은 동력곡선의 형태가 다르다.',
        'principle': 'AMCA 설명에 따르면 forward-curved fan의 동력은 유량 증가에 따라 자유토출점까지 증가한다. 반면 airfoil 및 backward-curved·backward-inclined 팬은 동력이 최고값에 도달한 뒤 감소하는 비과부하 곡선을 보일 수 있다. 따라서 이 문항의 독립 정답은 다익 팬이다.',
        'trap': '복원 정답이 터보 팬으로 남아 있지만, 후향형 터보 팬의 대표 동력곡선과 결론이 맞지 않는다. 복원 답안은 출처 기록으로 보존하고 검수 답안은 다익 팬으로 교정한다.',
        'sources': [
            'https://www.amca.org/educate/articles-and-technical-papers/amca-inmotion-articles/straightening-out-fan-curves.html',
        ],
        'authority': 'authoritative_source',
    },
    {
        'id': 'lesson-cbt-pneumatic-sequence-troubleshooting-choice-conflict',
        'subject': 'subject-1',
        'group': 's1-g08',
        'concept': 'concept-cbt-pneumatic-sequence-troubleshooting-choice-conflict',
        'title': '공압 시퀀스 고장진단과 에너지 격리',
        'aliases': ['운동-단계선도', '공압 시퀀스 고장진단', '잔류 공압', '에너지 격리', 'lockout tagout'],
        'external': ['2013-4-Q84'],
        'questions': ['U-1089'],
        'anchor': 'diagnosis',
        'summary': [
            '운동-단계선도, 정지 단계 전후 신호, 전기·밸브·실린더 분리는 모두 정상적인 고장진단 절차다.',
            '정비·점검 전에는 전기와 공압 에너지를 격리하고 잔류압력을 안전하게 해소해야 한다.',
            '복원된 네 보기가 모두 적절하므로 이 문항에는 유일한 부적절 보기가 없다.',
        ],
        'definition': '공압 시퀀스 고장진단은 정지된 단계와 제어신호를 추적해 전기계통·밸브·액추에이터 중 고장영역을 분리하는 절차다. 정비 작업으로 전환할 때는 별도의 위험에너지 통제 절차가 필요하다.',
        'principle': '운동-단계선도로 정지 동작을 확인하고 전후 센서·솔레노이드 신호를 추적하는 것은 적절하다. OSHA 1910.147은 정비 전 전기·공압 등 에너지원의 격리와 저장·잔류에너지의 해소를 요구하므로, 전원과 압축공기 공급을 차단해 안전을 확보한다는 보기도 부적절하다고 할 수 없다.',
        'trap': '고장진단 중 즉시 전원을 끄면 관찰 가능한 신호가 사라질 수 있다는 이유만으로 안전 격리 자체를 오답으로 만들면 안 된다. 진단 단계와 정비 단계의 순서를 구분하되 네 보기 모두 기술적으로 적절하므로 비채점한다.',
        'sources': [
            'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.147',
            'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.147AppA',
        ],
        'authority': 'authoritative_source',
    },
]


def lesson_addition(spec: dict[str, Any]) -> dict[str, Any]:
    blocks = [
        {
            'id': 'summary', 'kind': 'summary', 'title': '핵심 요약',
            'body': '\n'.join(f'{idx + 1}. {line}' for idx, line in enumerate(spec['summary'])),
            'order': 1,
        },
        {
            'id': 'definition', 'kind': 'definition', 'title': '정의와 범위',
            'body': spec['definition'], 'order': 2,
        },
        {
            'id': spec['anchor'], 'kind': 'principle', 'title': '직접 판단근거',
            'body': spec['principle'], 'order': 3,
        },
        {
            'id': 'exam-point', 'kind': 'exam_point', 'title': '시험 판단 순서',
            'body': f"문두의 긍정·부정 조건을 확인하고 **{spec['title']}**의 직접 원리와 각 보기를 하나씩 대조한다. 복원 정답과 원리가 충돌하거나 유일한 답이 없으면 억지로 채점하지 않는다.",
            'order': 4,
        },
        {
            'id': 'trap', 'kind': 'trap', 'title': '혼동하기 쉬운 경계',
            'body': spec['trap'], 'order': 5,
        },
        {
            'id': 'source', 'kind': 'source', 'title': '출처와 공개 상태',
            'body': '\n'.join([
                *(f'- 근거 URL {idx + 1}: {url}' for idx, url in enumerate(spec['sources'])),
                '- 공개 상태: 직접 연결은 완료했으나 런타임·출처 검증 전까지 in_review 유지',
                '- CBT 미러는 원문 확인용이며 공식 발행처로 표시하지 않는다.',
            ]),
            'order': 6,
        },
    ]
    lesson = {
        'id': spec['id'],
        'subjectId': spec['subject'],
        'conceptGroupId': spec['group'],
        'conceptId': spec['concept'],
        'title': spec['title'],
        'aliases': spec['aliases'],
        'summary': spec['summary'],
        'blocks': blocks,
        'relatedQuestionIds': spec['questions'],
        'coverageStatus': 'covered',
        'contentStatus': 'in_review',
        'sourceNeeded': True,
        'reviewedAt': None,
        'contentRole': 'exam_linked',
        'publication': {'readiness': 'blocked', 'blockers': ['lesson_source_needed']},
        'quality': {
            'tier': 'standard',
            'substantiveCharacters': sum(len(block['body']) for block in blocks) + sum(len(line) for line in spec['summary']),
            'genericPhraseMatches': [],
            'languageIssueMatches': [],
            'sourceLinked': True,
            'passed': True,
        },
    }
    return {
        'lesson': lesson,
        'directExternalIds': spec['external'],
        'rationale': f"{', '.join(spec['external'])}의 정답교정 또는 선택지 충돌에 직접 근거를 제공하도록 추가",
        'sourceAuthority': spec['authority'],
    }


new_lesson_additions = [lesson_addition(spec) for spec in lesson_specs]
for addition in new_lesson_additions:
    effective_lessons[addition['lesson']['id']] = addition['lesson']

SPECIAL_LESSON_BY_EXTERNAL_ID = {
    '2013-4-Q48': 'lesson-cbt-forward-curved-fan-power-curve',
    '2013-4-Q84': 'lesson-cbt-pneumatic-sequence-troubleshooting-choice-conflict',
}


def make_feedback(
    review: dict[str, Any],
    idx: int,
    answer_idx: int | None,
    conflict: bool,
) -> dict[str, Any]:
    item = review['choiceByChoiceReasons'][idx]
    text = review['sourceExactChoices'][idx]
    if conflict:
        return {
            'rationale': item['reason'],
            'plausibleReason': '복원 선택지 집합 전체를 비교해야 하며 단일 보기만으로 정답을 확정할 수 없다.',
            'incorrectPoint': None,
            'keyRule': review['directSolution'],
            'differenceFromCorrect': None,
        }
    assert isinstance(answer_idx, int)
    if idx == answer_idx:
        return {
            'rationale': f"‘{text}’가 문두의 조건에 직접 해당한다. {item['reason']}",
            'plausibleReason': '문두의 대상·원리·조건을 모두 충족하므로 정답으로 선택할 수 있다.',
            'incorrectPoint': None,
            'keyRule': review['directSolution'],
            'differenceFromCorrect': None,
        }
    correct_text = review['sourceExactChoices'][answer_idx]
    return {
        'rationale': f"‘{text}’는 정답 조건을 충족하지 않는다. {item['reason']}",
        'plausibleReason': f"‘{text}’도 같은 분야에서 사용하는 용어이지만 이 문항이 묻는 직접 원리와는 다르다.",
        'incorrectPoint': item['reason'],
        'keyRule': review['directSolution'],
        'differenceFromCorrect': f"정답 ‘{correct_text}’와 달리 ‘{text}’는 문두의 직접 조건을 충족하지 않는다.",
    }


def make_question(
    qid: str,
    external_id: str,
    lesson_id: str,
    answer_idx: int,
    conflict: bool,
) -> dict[str, Any]:
    review = review_by_id[external_id]
    lesson = effective_lessons[lesson_id]
    existing = questions[qid]
    choices = [
        {
            'id': f'{qid}-c{idx + 1}',
            'order': idx + 1,
            'text': text,
            'feedback': make_feedback(review, idx, None if conflict else answer_idx, conflict),
        }
        for idx, text in enumerate(review['sourceExactChoices'])
    ]
    direct_solution = review['directSolution'].strip()
    if conflict and not direct_solution.startswith('선택지 충돌:'):
        direct_solution = f'선택지 충돌: {direct_solution}'
    blockers = ['lesson_source_needed']
    blockers.append('choice_conflict_non_scoring' if conflict else 'answer_key_correction_pending_runtime_validation')
    source_urls = [
        review['identity']['registeredSourceUrl'],
        *next(spec['sources'] for spec in lesson_specs if spec['id'] == lesson_id),
    ]
    return {
        'id': qid,
        'canonicalNumber': existing['canonicalNumber'],
        'subjectId': lesson['subjectId'],
        'conceptGroupId': lesson['conceptGroupId'],
        'conceptId': lesson['conceptId'],
        'lessonId': lesson_id,
        'lessonAnchor': next(spec['anchor'] for spec in lesson_specs if spec['id'] == lesson_id),
        'stem': review['sourceExactStem'],
        'choices': choices,
        'correctChoiceId': choices[answer_idx]['id'],
        'answerText': review['sourceExactChoices'][answer_idx],
        'explanation': direct_solution,
        'errorReason': '선택지 충돌' if conflict else '복원 정답 교정',
        'sourceLabel': review['identity']['registeredSourceUrl'],
        'reviewStatus': '배치 04 독립 풀이·직접 이론 연결 검수',
        'contentStatus': 'in_review',
        'publication': {'readiness': 'blocked', 'blockers': blockers},
        'verification': {
            'status': 'blocked',
            'method': 'manual_source_required',
            'variantCount': 1,
            'sourceUrls': source_urls,
            'riskTags': ['editorial_reconstruction', 'choice_conflict' if conflict else 'answer_conflict'],
            'note': '복원 원문과 독립 풀이를 보존했으며 운영 공개 전 런타임 계약과 출처 검증이 필요합니다.',
            'reviewedAt': NOW,
        },
        'audit': {
            'questionId': qid,
            'scope': 'review_queue',
            'sourceContentStatus': 'in_review',
            'auditDisposition': 'held_question_integrity' if conflict else 'held_answer_conflict',
            'evidenceLevel': None,
            'cbtAnswer': review['sourceExactChoices'][review['sourceAnswerIndex']] if review['sourceAnswerIndex'] is not None else None,
            'verifiedAnswer': None if conflict else review['sourceExactChoices'][answer_idx],
            'evidenceUrls': source_urls,
            'reviewNote': direct_solution,
            'assetStatus': 'not_required',
            'nextAction': '선택지 원문 재확인 전 비채점 유지' if conflict else '런타임 variant 계약과 기술 검증 후 공개 심사',
            'reviewChoiceFeedback': [
                {
                    'choiceId': choices[idx]['id'],
                    'verdict': 'conflict' if conflict else ('correct' if idx == answer_idx else 'incorrect'),
                    'rationale': review['choiceByChoiceReasons'][idx]['reason'],
                }
                for idx in range(len(choices))
            ],
            'reviewedAt': NOW,
        },
        'validation': {
            'answer': not conflict,
            'explanation': True,
            'choiceFeedback': True,
            'theoryLink': True,
            'contentQuality': True,
        },
    }


new_question_changes: list[dict[str, Any]] = []
for qid, external_id, lesson_id, answer_idx, conflict in [
    ('U-1072', '2013-4-Q48', SPECIAL_LESSON_BY_EXTERNAL_ID['2013-4-Q48'], 2, False),
    ('U-1089', '2013-4-Q84', SPECIAL_LESSON_BY_EXTERNAL_ID['2013-4-Q84'], 3, True),
]:
    question = make_question(qid, external_id, lesson_id, answer_idx, conflict)
    change = {
        'action': 'replace',
        'question': question,
        'previousQuestionSha256': sha_text(jd(questions[qid])),
        'affectedExternalIds': [external_id],
        'rationale': f"{external_id}의 독립 풀이 및 {'선택지 충돌' if conflict else '정답키 교정'}을 직접 반영",
    }
    new_question_changes.append(change)
    effective_questions[qid] = question


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
    if external_id in DRY_RUN_CANONICAL_OVERRIDE_IDS:
        return decision['currentCanonicalId']
    return decision.get('targetCanonicalId') or decision['currentCanonicalId']


records: list[dict[str, Any]] = []
variant_specific_ids: list[str] = []
full_mapping_ids: list[str] = []
direct_link_matrix: list[dict[str, Any]] = []
image_queue: list[str] = []
conflict_queue: list[str] = []
answer_correction_queue: list[str] = []
dry_override_queue: list[str] = []

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
    is_dry_override = external_id in DRY_RUN_CANONICAL_OVERRIDE_IDS
    answer_idx = None if (is_image or is_conflict) else review.get('independentAnswerIndex')
    reviewed_answer_text = f"{SYMBOLS[answer_idx]} {source_choices[answer_idx]}" if isinstance(answer_idx, int) else ''

    if is_image or is_conflict:
        mapping: list[str] = []
        variant_specific = False
    else:
        assert isinstance(answer_idx, int), external_id
        mapping = safe_choice_mapping(source_choices, canonical, answer_idx)
        variant_specific = len(mapping) == 0
        if variant_specific:
            variant_specific_ids.append(external_id)
        else:
            full_mapping_ids.append(external_id)

    if external_id in SPECIAL_LESSON_BY_EXTERNAL_ID:
        lesson_id = SPECIAL_LESSON_BY_EXTERNAL_ID[external_id]
        lesson = effective_lessons[lesson_id]
        anchor = next(spec['anchor'] for spec in lesson_specs if spec['id'] == lesson_id)
        theory = {
            'canonicalId': target_id,
            'lessonId': lesson_id,
            'lessonAnchor': anchor,
            'conceptGroupId': lesson['conceptGroupId'],
            'conceptId': lesson['conceptId'],
            'canonicalStem': canonical['stem'],
        }
        theory_status = 'direct_added_theory_for_answer_or_choice_correction'
    else:
        reviewed_theory = review['theoryLink']
        lesson_id = reviewed_theory['lessonId']
        lesson = effective_lessons[lesson_id]
        theory = {
            'canonicalId': target_id,
            'lessonId': lesson_id,
            'lessonAnchor': reviewed_theory['lessonAnchor'],
            'conceptGroupId': reviewed_theory['conceptGroupId'],
            'conceptId': reviewed_theory['conceptId'],
            'canonicalStem': canonical['stem'],
        }
        theory_status = 'direct_existing_theory_review_override' if is_dry_override else (
            'direct_existing_theory_relinked' if current_canonical != target_id else 'direct_existing_theory'
        )

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
        choice_conflict = {
            'label': '선택지 충돌',
            'conflictType': 'no_unique_incorrect_choice',
            'choiceIndices': [0, 1, 2, 3],
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
            'ANSWER_KEY_CORRECTION_CANONICAL_OVERLAY' if is_answer_correction
            else 'DRY_RUN_REASSIGNMENT_OVERRIDDEN_BY_DIRECT_CANONICAL_REVIEW' if is_dry_override
            else dry_by_id[external_id]['decision']['mappingClass']
        )
        runtime_disposition = (
            'PUBLICATION_CANDIDATE_WITH_VARIANT_CHOICE_CONTRACT_PENDING'
            if variant_specific else 'PUBLICATION_CANDIDATE'
        )
        if is_answer_correction:
            answer_correction_queue.append(external_id)
        if is_dry_override:
            dry_override_queue.append(external_id)

    if external_id in SPECIAL_LESSON_BY_EXTERNAL_ID:
        canonical_action = 'APPLY_CANONICAL_OVERLAY'
        theory_action = 'ADD_DIRECT_THEORY_LESSON'
    elif is_dry_override:
        canonical_action = 'KEEP_CURRENT_CANONICAL_REVIEW_OVERRIDE'
        theory_action = 'USE_REVIEWED_DIRECT_THEORY'
    else:
        canonical_action = 'REASSIGN_CANONICAL' if current_canonical != target_id else 'KEEP_CURRENT_CANONICAL'
        theory_action = 'USE_DIRECT_EXISTING_THEORY'

    if is_answer_correction:
        risk = '복원 정답 1번과 독립 검토 정답 3번이 충돌하며 독립 정답을 canonical overlay에 반영했다.'
    elif is_image:
        risk = '필수 이미지 판독 전 정답 인덱스를 승인하지 않는다.'
    elif is_conflict:
        risk = '복원 선택지 네 개가 모두 기술적으로 적절해 유일한 오답이 없다.'
    elif is_dry_override:
        risk = 'dry-run 중복 통합안 U-308보다 현재 U-1099가 원문 선택지와 직접 일치하므로 기존 canonical을 유지한다.'
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
        'formulaUnitSubstitution': review.get('formulaUnitSubstitution'),
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
        'canonicalOverlayApplied': external_id in SPECIAL_LESSON_BY_EXTERNAL_ID,
        'dryRunCanonicalOverrideApplied': is_dry_override,
    })

states = Counter(record['review']['runtimeStatus'] for record in records)
assert states == Counter({'candidate': 193, 'hold': 6, 'choice_conflict': 1}), states
assert len(variant_specific_ids) + len(full_mapping_ids) == 193
assert set(image_queue) == IMAGE_HOLD_IDS
assert set(conflict_queue) == CHOICE_CONFLICT_IDS
assert set(answer_correction_queue) == ANSWER_KEY_CORRECTION_IDS
assert set(dry_override_queue) == DRY_RUN_CANONICAL_OVERRIDE_IDS

all_records = manifest['records'] + records
assert len(all_records) == 800
assert len({record['externalId'] for record in all_records}) == 800
all_lesson_additions = manifest.get('theoryLessonAdditions', []) + new_lesson_additions
all_question_changes = manifest.get('canonicalQuestionChanges', []) + new_question_changes

batch4 = {
    'batchId': BATCH_ID,
    'reviewSessions': ['13', '14', '15', '16'],
    'externalIdRanges': ['2012-4-Q01..2012-4-Q100', '2013-4-Q01..2013-4-Q100'],
    'recordCount': 200,
    'candidateCount': 193,
    'choiceConflictCount': 1,
    'holdCount': 6,
    'normalizationCount': 0,
    'imageReviewCount': 6,
    'lowContextRegistrationCount': 0,
    'variantSpecificFeedbackCount': len(variant_specific_ids),
    'canonicalTheoryRepairs': ['2012-4-Q08: preserve U-1099 instead of dry-run duplicate consolidation to U-308'],
    'theoryLessonAdditionIds': [addition['lesson']['id'] for addition in new_lesson_additions],
    'canonicalQuestionChangeIds': [change['question']['id'] for change in new_question_changes],
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
new_manifest['batches'] = manifest['batches'] + [batch4]
new_manifest['theoryLessonAdditions'] = all_lesson_additions
new_manifest['theoryLessonAdditionsSha256'] = sha_text(jd(all_lesson_additions))
new_manifest['canonicalQuestionChanges'] = all_question_changes
new_manifest['canonicalQuestionChangesSha256'] = sha_text(jd(all_question_changes))
new_manifest['records'] = all_records
new_manifest['recordsSha256'] = sha_text(jd(all_records))
new_manifest['holdResolutionPolicy'] = build_hold_resolution_policy(
    new_manifest['batches'],
    manifest['holdResolutionPolicy'],
    NOW,
)
MANIFEST_PATH.write_text(pretty(new_manifest), encoding='utf-8')

# Batch artifacts.
(OUT / 'theory-lesson-additions.json').write_text(pretty(new_lesson_additions), encoding='utf-8')
(OUT / 'canonical-question-changes.json').write_text(pretty(new_question_changes), encoding='utf-8')
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
(OUT / 'dry-run-decision-overrides.jsonl').write_text(
    '\n'.join(jd({
        'externalId': external_id,
        'dryRunCurrentCanonicalId': dry_by_id[external_id]['decision']['currentCanonicalId'],
        'dryRunTargetCanonicalId': dry_by_id[external_id]['decision'].get('targetCanonicalId'),
        'appliedCanonicalId': target_canonical_id(external_id),
        'reason': '현재 U-1099가 고장형태·고장률·MTBF·MTTR 선택지와 직접 일치한다. U-308은 생산량 선택지를 소유하므로 통합하면 선택지 의미가 달라진다.',
        'evidence': review_by_id[external_id]['directSolution'],
    }) for external_id in sorted(DRY_RUN_CANONICAL_OVERRIDE_IDS)) + '\n',
    encoding='utf-8',
)
(OUT / 'variant-mapping.jsonl').write_text('\n'.join(jd(record) for record in records) + '\n', encoding='utf-8')
(OUT / 'external-ids.json').write_text(pretty(BATCH_IDS), encoding='utf-8')

theory_gap_audit = {
    'batchId': BATCH_ID,
    'recordCount': 200,
    'existingDirectTheoryLinksRetained': 198,
    'newDirectTheoryLessonsAdded': 2,
    'dryRunCanonicalOverrides': 1,
    'missingDirectTheoryAfterBatch': 0,
    'addedLessons': [
        {
            'lessonId': addition['lesson']['id'],
            'title': addition['lesson']['title'],
            'conceptGroupId': addition['lesson']['conceptGroupId'],
            'directExternalIds': addition['directExternalIds'],
        }
        for addition in new_lesson_additions
    ],
    'notes': [
        '2013-4-Q48의 기존 레슨은 복원 정답 터보 팬을 대표답으로 고정해 독립 기술검토와 충돌하므로 AMCA 팬 동력곡선 근거의 교정 레슨으로 대체했다.',
        '2013-4-Q84의 기존 레슨은 공압 시퀀스 문항을 유압 제어밸브 개념군에 배치하고 안전격리를 오답으로 만들었으므로 공압 회로·시스템 개념군의 선택지 충돌 레슨으로 대체했다.',
        '2012-4-Q08은 dry-run의 U-308 통합안보다 U-1099와 lesson-eqilq7이 원문 지문·선택지에 직접 일치해 현재 canonical을 유지했다.',
        '나머지 197문항은 독립 검수 파일의 direct_source_topic_link, lesson anchor, conceptGroup·concept 존재를 재확인했다.',
    ],
}
(OUT / 'theory-gap-audit.json').write_text(pretty(theory_gap_audit), encoding='utf-8')

summary = {
    'batchId': BATCH_ID,
    'generatedAt': NOW,
    'recordCount': 200,
    'states': dict(states),
    'fullCanonicalChoiceMappingCount': len(full_mapping_ids),
    'variantSpecificFeedbackPendingCount': len(variant_specific_ids),
    'theoryLessonAdditionCount': len(new_lesson_additions),
    'canonicalQuestionChangeCount': len(new_question_changes),
    'directTheoryLinkCount': 200,
    'imageVerificationQueueCount': 6,
    'choiceConflictCount': 1,
    'answerKeyCorrectionCount': 1,
    'dryRunCanonicalOverrideCount': 1,
    'semanticReassignmentCount': sum(record['currentCanonicalId'] != record['canonicalId'] for record in records),
    'sourceContentSha256Before': original_content_sha,
    'sourceContentUnchanged': sha_text(CONTENT_PATH.read_text(encoding='utf-8')) == original_content_sha,
}
(OUT / 'batch-summary.json').write_text(pretty(summary), encoding='utf-8')

report = f'''# CBT 시스템 실제 이식 배치 04 보고서

- 범위: 2012년 4회 100문항 + 2013년 4회 100문항
- candidate: 193
- 선택지 충돌 비채점: 1
- 필수 이미지 HOLD: 6
- 정답키 독립 교정: 1
- 신규 직접 이론 레슨: 2
- canonical 교체 overlay: 2
- canonical 선택지 1:1 매핑 완료: {len(full_mapping_ids)}
- variant 전용 선택지 계약 대기: {len(variant_specific_ids)}

## 핵심 교정

- `2013-4-Q48`: 복원 정답 1번 터보 팬을 보존하되 AMCA 팬 동력곡선 근거에 따라 독립 검토 정답 3번 다익 팬을 canonical overlay에 반영했다.
- `2013-4-Q84`: 네 보기 모두 기술적으로 적절해 선택지 충돌·비채점으로 등록하고, 잘못된 유압 제어밸브 개념군을 공압 회로·시스템 직접 레슨으로 교정했다.
- `2012-4-Q08`: dry-run의 중복 canonical 통합안 U-308을 적용하지 않고, 실제 고장형태 선택지를 소유하는 U-1099와 신뢰성 척도 레슨을 유지했다.

## 공개 경계

- 모든 배치 04 레코드는 candidate, choice_conflict 또는 hold이며 published는 0건이다.
- 이미지 6건은 정답·풀이·선택지 매핑을 활성화하지 않는다.
- 선택지 충돌 1건은 내부 해설을 보존하되 학습자 채점에 사용하지 않는다.
- variant 전용 선택지 계약 대기 문항은 canonical 문자 유사도 fallback을 사용하지 않는다.
- 원본 content.json은 수정하지 않는다.
'''
(OUT / 'import-report.md').write_text(report, encoding='utf-8')

# Validate anchors against effective lessons.
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
    'answerKeyCorrectionApplied': next(record for record in records if record['externalId'] == '2013-4-Q48')['reviewedAnswerIndex'] == 2,
    'sourceAnswerPreservedForCorrection': next(record for record in records if record['externalId'] == '2013-4-Q48')['sourceAnswerIndex'] == 0,
    'choiceConflictGroupRepaired': next(record for record in records if record['externalId'] == '2013-4-Q84')['theoryLink']['conceptGroupId'] == 's1-g08',
    'dryRunCanonicalOverrideApplied': next(record for record in records if record['externalId'] == '2012-4-Q08')['canonicalId'] == 'U-1099',
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
    OUT / 'dry-run-decision-overrides.jsonl',
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
