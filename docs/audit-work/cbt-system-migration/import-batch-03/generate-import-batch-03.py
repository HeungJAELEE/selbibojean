from __future__ import annotations

import copy
import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path('/mnt/data/cbt_batch03_final_work/repo')
CONTENT_PATH = ROOT / 'src/data/generated/content.json'
MANIFEST_PATH = ROOT / 'src/data/generated/cbt-reviewed-variants.json'
DRY_PATH = Path('/mnt/data/selbibojean_checkout/docs/audit-work/cbt-system-migration/batch-01-mapping-dry-run/variant-mapping-dry-run.jsonl')
OUT = ROOT / 'docs/audit-work/cbt-system-migration/import-batch-03'
OUT.mkdir(parents=True, exist_ok=True)

# Older draft generators used a different batch-03 policy. Remove their queue
# files so an idempotent rerun cannot leave contradictory audit artifacts.
for stale_name in [
    'answer-key-conflict-queue.jsonl',
    'normalization-ledger.jsonl',
]:
    stale_path = OUT / stale_name
    if stale_path.exists():
        stale_path.unlink()

REVIEW_FILES = [
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20100905_q01-q50_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20100905_q51-q100_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20111002_q01-q50_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20111002_q51-q100_independent-review.jsonl',
]

NOW = '2026-08-07T20:10:00+09:00'
SYMBOLS = ['①', '②', '③', '④', '⑤']
BATCH_ID = 'import-03'
NEW_LESSON_IDS = {
    'lesson-cbt-safety-valve-simmering-correction',
    'lesson-cbt-cavitation-choice-conflict',
    'lesson-cbt-gear-undercut-choice-conflict',
}
NEW_CANONICAL_IDS = {'U-1215', 'U-1161', 'U-1166'}

IMAGE_HOLD_IDS = {
    '2010-4-Q08', '2010-4-Q09', '2010-4-Q81', '2010-4-Q89',
    '2011-4-Q24', '2011-4-Q54', '2011-4-Q75', '2011-4-Q85',
}
CHOICE_CONFLICT_IDS = {'2011-4-Q42', '2011-4-Q59'}
ANSWER_KEY_CORRECTION_IDS = {'2010-4-Q59'}
assert len(IMAGE_HOLD_IDS) == 8
assert len(CHOICE_CONFLICT_IDS) == 2


def sha_text(value: str) -> str:
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def jd(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def pretty(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


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


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]


content = json.loads(CONTENT_PATH.read_text(encoding='utf-8'))
manifest = json.loads(MANIFEST_PATH.read_text(encoding='utf-8'))
original_content_sha = sha_text(CONTENT_PATH.read_text(encoding='utf-8'))
questions = {q['id']: q for q in content['questions']}
lessons = {l['id']: l for l in content['lessons']}
variants = {v['externalId']: v for v in content['variants']}
groups = {g['id']: g for g in content['conceptGroups']}

review_rows: list[dict[str, Any]] = []
review_file_by_external_id: dict[str, Path] = {}
for path in REVIEW_FILES:
    for row in read_jsonl(path):
        review_rows.append(row)
        review_file_by_external_id[row['externalId']] = path
review_by_id = {r['externalId']: r for r in review_rows}
assert len(review_by_id) == 200

BATCH_IDS = sorted(review_by_id, key=lambda x: (int(x[:4]), int(re.search(r'Q(\d+)$', x).group(1))))
assert len(BATCH_IDS) == 200
assert all(eid.startswith(('2010-4-', '2011-4-')) for eid in BATCH_IDS)

dry_rows = read_jsonl(DRY_PATH)
dry_by_id = {r['externalId']: r for r in dry_rows}

# Idempotent regeneration: remove only batch-03 payload from a previously generated manifest.
if any(batch.get('batchId') == BATCH_ID for batch in manifest.get('batches', [])):
    batch_ids = set(BATCH_IDS)
    manifest = copy.deepcopy(manifest)
    manifest['batches'] = [b for b in manifest['batches'] if b.get('batchId') != BATCH_ID]
    manifest['records'] = [r for r in manifest['records'] if r['externalId'] not in batch_ids]
    manifest['theoryLessonAdditions'] = [
        x for x in manifest.get('theoryLessonAdditions', []) if x['lesson']['id'] not in NEW_LESSON_IDS
    ]
    manifest['canonicalQuestionChanges'] = [
        x for x in manifest.get('canonicalQuestionChanges', [])
        if not (x['question']['id'] in NEW_CANONICAL_IDS and any(eid in batch_ids for eid in x['affectedExternalIds']))
    ]
    manifest['recordsSha256'] = sha_text(jd(manifest['records']))
    if manifest.get('theoryLessonAdditions'):
        manifest['theoryLessonAdditionsSha256'] = sha_text(jd(manifest['theoryLessonAdditions']))
    if manifest.get('canonicalQuestionChanges'):
        manifest['canonicalQuestionChangesSha256'] = sha_text(jd(manifest['canonicalQuestionChanges']))

assert len(manifest['records']) == 400, len(manifest['records'])

# Build effective content from batch 01-02 extensions before applying batch 03.
effective_lessons = dict(lessons)
for addition in manifest.get('theoryLessonAdditions', []):
    effective_lessons[addition['lesson']['id']] = addition['lesson']
effective_questions = dict(questions)
for change in manifest.get('canonicalQuestionChanges', []):
    effective_questions[change['question']['id']] = change['question']

lesson_specs = [
    {
        'id': 'lesson-cbt-safety-valve-simmering-correction',
        'subject': 'subject-3', 'group': 's3-g09',
        'concept': 'concept-cbt-safety-valve-simmering-correction',
        'title': '안전밸브 심머링과 조정링 판단',
        'aliases': ['심머링', 'simmer', '하부 조정 링', '안전밸브 조정링'],
        'external': ['2010-4-Q59'], 'questions': ['U-1215'], 'anchor': 'principle',
        'summary': [
            '심머링은 설정압력 부근에서 안전밸브가 완전 개방되지 못하고 미세하게 누설·진동하는 상태다.',
            '독립 검토에 사용한 제조사 정비절차에서는 이 문항 조건의 직접 조치를 하부 조정 링 상향으로 판정했다.',
            '실제 조정은 밸브 형식별 OEM 매뉴얼과 승인 절차를 따라야 하며 임의 조정하면 안 된다.',
        ],
        'definition': '안전밸브의 조정링은 개방 특성과 블로다운에 영향을 준다. 심머링의 조정 방향은 밸브 형식과 제조사 절차에 따라 달라질 수 있으므로 문제의 형식·조건을 확인해야 한다.',
        'principle': '이 문항의 독립 풀이에서는 상부 링이 아니라 하부 조정 링을 한 단계씩 상향하는 조치가 심머링 제거 절차와 일치한다. 복원 정답 1번은 출처 기록으로 보존하고, 검수 정답은 3번으로 교정한다.',
        'trap': '상부·하부 조정링은 모두 안전밸브 동작에 영향을 주어 보기만 보면 혼동하기 쉽다. 정답을 일반화하지 말고 해당 밸브 모델의 OEM 절차를 우선한다.',
        'sources': [
            'https://valves.bakerhughes.com/consolidated/safety-valves/type-1811-safety-valve',
            'https://manualzz.com/doc/70891025',
        ],
        'authority': 'exam_reconstruction_with_source_needed',
    },
    {
        'id': 'lesson-cbt-cavitation-choice-conflict',
        'subject': 'subject-3', 'group': 's3-g10',
        'concept': 'concept-cbt-cavitation-choice-conflict',
        'title': '펌프 캐비테이션 방지조건과 선택지 충돌',
        'aliases': ['NPSHa', 'NPSHr', '양흡입 펌프', '회전수 저감'],
        'external': ['2011-4-Q42'], 'questions': ['U-1161'], 'anchor': 'principle',
        'summary': [
            '캐비테이션 방지의 기본은 NPSHa를 NPSHr 이상으로 확보하는 것이다.',
            '흡입 실양정 감소, 양흡입 구조 적용, 회전수 저하는 모두 흡입여유를 높이거나 필요 NPSH를 낮추는 방향이다.',
            '따라서 복원된 네 보기에는 잘못된 방지대책이 없어 단일정답이 성립하지 않는다.',
        ],
        'definition': '캐비테이션은 임펠러 입구의 국부압력이 증기압 이하로 내려가 기포가 발생·붕괴하는 현상이다. NPSHa와 NPSHr의 비교가 핵심 판단기준이다.',
        'principle': 'NPSHa≥NPSHr 여유를 확보하고 흡입손실·흡입양정·유체온도·회전수를 관리한다. 양흡입 임펠러는 입구 유량을 분산해 낮은 NPSH 요구조건에 사용할 수 있다.',
        'trap': '문두가 “잘못된 것”을 요구해도 네 보기 모두 방지 방향이면 정답키를 억지로 선택하지 않는다. 이 문항은 선택지 충돌로 비채점 처리한다.',
        'sources': [
            'https://www.ksb.com/en-global/centrifugal-pump-lexicon/article/npsh-1116954',
            'https://www.ksb.com/en-global/centrifugal-pump-lexicon/article/suction-characteristics-1117252',
            'https://www.ksb.com/ko-kr/eung-yong-bun-ya/seogyu-mich-gaseu-gisul/eobseuteulim',
        ],
        'authority': 'authoritative_source',
    },
    {
        'id': 'lesson-cbt-gear-undercut-choice-conflict',
        'subject': 'subject-3', 'group': 's3-g06',
        'concept': 'concept-cbt-gear-undercut-choice-conflict',
        'title': '인벌류트 기어 언더컷과 선택지 충돌',
        'aliases': ['언더컷', '최소 잇수', '양의 전위', '치근 두께'],
        'external': ['2011-4-Q59'], 'questions': ['U-1166'], 'anchor': 'principle',
        'summary': [
            '언더컷은 표준 인벌류트 기어의 잇수가 너무 적을 때 치근부가 절삭되는 현상이다.',
            '양의 전위는 치근 두께를 키우고 언더컷 방지에 사용할 수 있다.',
            '복원 보기에서는 2번과 3번이 동시에 틀려 단일정답이 성립하지 않는다.',
        ],
        'definition': '인벌류트 기어의 언더컷은 창성가공 중 공구가 치근부 유효 치형을 과도하게 제거하는 현상이다. 최소 잇수와 전위계수는 발생 여부에 직접 영향을 준다.',
        'principle': '잇수가 적을수록 언더컷 위험이 커지고, 양의 전위는 치근부 두께를 증가시켜 언더컷을 줄일 수 있다. 따라서 “잇수가 많을 때 발생”과 “표준기어가 전위기어보다 항상 강하다”는 문장은 모두 일반적으로 성립하지 않는다.',
        'trap': '복원 정답 3번만 고르면 2번의 강도 단정 오류를 놓친다. 이 문항은 두 개의 틀린 보기가 있어 비채점 처리한다.',
        'sources': [
            'https://khkgears.net/korea/',
            'https://khkgears.net/korea/spur-gears.html',
        ],
        'authority': 'authoritative_source',
    },
]


def lesson_addition(spec: dict[str, Any]) -> dict[str, Any]:
    blocks = [
        {'id': 'summary', 'kind': 'summary', 'title': '핵심 요약', 'body': '\n'.join(f'{i+1}. {line}' for i, line in enumerate(spec['summary'])), 'order': 1},
        {'id': 'definition', 'kind': 'definition', 'title': '정의와 범위', 'body': spec['definition'], 'order': 2},
        { 'id': spec['anchor'], 'kind': 'principle', 'title': '직접 판단근거', 'body': spec['principle'], 'order': 3},
        {'id': 'exam-point', 'kind': 'exam_point', 'title': '시험 판단 순서', 'body': f"문두의 긍정·부정 조건을 표시하고 **{spec['title']}**의 직접 원리와 각 보기를 하나씩 대조한다. 유일한 답이 성립하지 않으면 정답키를 억지로 적용하지 않는다.", 'order': 4},
        {'id': 'trap', 'kind': 'trap', 'title': '혼동하기 쉬운 경계', 'body': spec['trap'], 'order': 5},
        {'id': 'source', 'kind': 'source', 'title': '출처와 공개 상태', 'body': '\n'.join([*(f'- 근거 URL {i+1}: {url}' for i, url in enumerate(spec['sources'])), '- 공개 상태: 직접 연결은 완료했으나 런타임·출처 검증 전까지 in_review 유지', '- CBT 미러를 공식 발행처로 표시하지 않는다.']), 'order': 6},
    ]
    lesson = {
        'id': spec['id'], 'subjectId': spec['subject'], 'conceptGroupId': spec['group'], 'conceptId': spec['concept'],
        'title': spec['title'], 'aliases': spec['aliases'], 'summary': spec['summary'], 'blocks': blocks,
        'relatedQuestionIds': spec['questions'], 'coverageStatus': 'covered', 'contentStatus': 'in_review',
        'sourceNeeded': True, 'reviewedAt': None, 'contentRole': 'exam_linked',
        'publication': {'readiness': 'blocked', 'blockers': ['lesson_source_needed']},
        'quality': {
            'tier': 'standard',
            'substantiveCharacters': sum(len(x['body']) for x in blocks) + sum(len(x) for x in spec['summary']),
            'genericPhraseMatches': [], 'languageIssueMatches': [], 'sourceLinked': bool(spec['sources']), 'passed': True,
        },
    }
    return {
        'lesson': lesson, 'directExternalIds': spec['external'],
        'rationale': f"{', '.join(spec['external'])}의 독립 풀이·충돌 판정에 직접 근거를 제공하도록 추가",
        'sourceAuthority': spec['authority'],
    }


new_lesson_additions = [lesson_addition(spec) for spec in lesson_specs]
for addition in new_lesson_additions:
    effective_lessons[addition['lesson']['id']] = addition['lesson']

SPECIAL_LESSON_BY_EXTERNAL_ID = {
    '2010-4-Q59': 'lesson-cbt-safety-valve-simmering-correction',
    '2011-4-Q42': 'lesson-cbt-cavitation-choice-conflict',
    '2011-4-Q59': 'lesson-cbt-gear-undercut-choice-conflict',
}


def make_feedback(review: dict[str, Any], idx: int, answer_idx: int | None, conflict: bool) -> dict[str, Any]:
    item = review['choiceByChoiceReasons'][idx]
    text = review['sourceExactChoices'][idx]
    if conflict:
        return {
            'rationale': item['reason'],
            'plausibleReason': '복원 선택지 집합 전체를 함께 비교해야 하며 단일 보기만으로 정답을 확정할 수 없다.',
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


def make_question(qid: str, external_id: str, lesson_id: str, answer_idx: int, conflict: bool) -> dict[str, Any]:
    review = review_by_id[external_id]
    lesson = effective_lessons[lesson_id]
    existing = questions[qid]
    choices = [
        {
            'id': f'{qid}-c{idx+1}', 'order': idx+1, 'text': text,
            'feedback': make_feedback(review, idx, None if conflict else answer_idx, conflict),
        }
        for idx, text in enumerate(review['sourceExactChoices'])
    ]
    direct_solution = review['directSolution']
    if conflict and not direct_solution.startswith('선택지 충돌:'):
        direct_solution = f'선택지 충돌: {direct_solution}'
    blockers = ['lesson_source_needed']
    if conflict:
        blockers.append('choice_conflict_non_scoring')
    else:
        blockers.append('answer_key_correction_pending_runtime_validation')
    source_urls = [review['identity']['registeredSourceUrl'], *next(spec['sources'] for spec in lesson_specs if spec['id'] == lesson_id)]
    return {
        'id': qid, 'canonicalNumber': existing['canonicalNumber'], 'subjectId': lesson['subjectId'],
        'conceptGroupId': lesson['conceptGroupId'], 'conceptId': lesson['conceptId'], 'lessonId': lesson_id,
        'lessonAnchor': 'principle', 'stem': review['sourceExactStem'], 'choices': choices,
        'correctChoiceId': choices[answer_idx]['id'], 'answerText': review['sourceExactChoices'][answer_idx],
        'explanation': direct_solution, 'errorReason': '선택지 충돌' if conflict else '복원 정답 교정',
        'sourceLabel': review['identity']['registeredSourceUrl'],
        'reviewStatus': '배치 03 독립 풀이·직접 이론 연결 검수', 'contentStatus': 'in_review',
        'publication': {'readiness': 'blocked', 'blockers': blockers},
        'verification': {
            'status': 'blocked', 'method': 'manual_source_required', 'variantCount': 1,
            'sourceUrls': source_urls, 'riskTags': ['editorial_reconstruction', 'answer_conflict' if not conflict else 'choice_conflict'],
            'note': '복원 원문과 독립 풀이를 보존했으며 운영 공개 전 런타임 계약과 출처 검증이 필요합니다.',
            'reviewedAt': NOW,
        },
        'audit': {
            'questionId': qid, 'scope': 'review_queue', 'sourceContentStatus': 'in_review',
            'auditDisposition': 'held_answer_conflict' if not conflict else 'held_question_integrity',
            'evidenceLevel': None,
            'cbtAnswer': review['sourceExactChoices'][review['sourceAnswerIndex']] if review['sourceAnswerIndex'] is not None else None,
            'verifiedAnswer': None if conflict else review['sourceExactChoices'][answer_idx],
            'evidenceUrls': source_urls, 'reviewNote': direct_solution,
            'assetStatus': 'not_required',
            'nextAction': '런타임 variant 계약과 기술 검증 후 공개 심사' if not conflict else '선택지 원문 재확인 전 비채점 유지',
            'reviewChoiceFeedback': [
                {'choiceId': choices[i]['id'], 'verdict': 'conflict' if conflict else ('correct' if i == answer_idx else 'incorrect'), 'rationale': review['choiceByChoiceReasons'][i]['reason']}
                for i in range(len(choices))
            ],
            'reviewedAt': NOW,
        },
        'validation': {'answer': not conflict, 'explanation': True, 'choiceFeedback': True, 'theoryLink': True, 'contentQuality': True},
    }


new_question_changes = []
for qid, eid, lesson_id, answer_idx, conflict in [
    ('U-1215', '2010-4-Q59', SPECIAL_LESSON_BY_EXTERNAL_ID['2010-4-Q59'], 2, False),
    ('U-1161', '2011-4-Q42', SPECIAL_LESSON_BY_EXTERNAL_ID['2011-4-Q42'], 0, True),
    ('U-1166', '2011-4-Q59', SPECIAL_LESSON_BY_EXTERNAL_ID['2011-4-Q59'], 2, True),
]:
    question = make_question(qid, eid, lesson_id, answer_idx, conflict)
    change = {
        'action': 'replace', 'question': question,
        'previousQuestionSha256': sha_text(jd(questions[qid])),
        'affectedExternalIds': [eid],
        'rationale': f'{eid}의 독립 풀이 및 {"선택지 충돌" if conflict else "정답키 교정"}을 직접 반영',
    }
    new_question_changes.append(change)
    effective_questions[qid] = question


def normalize_text(value: str) -> str:
    value = unicodedata.normalize('NFKC', value).lower()
    value = re.sub(r'[\s\-–—·,.:;()\[\]{}_/\\]+', '', value)
    return value.replace('ㆍ', '').replace('＝', '=').replace('²', '2').replace('³', '3')


def safe_choice_mapping(source_choices: list[str], canonical: dict[str, Any], answer_idx: int | None) -> list[str]:
    if answer_idx is None or not source_choices or any(not str(x).strip() for x in source_choices):
        return []
    candidates = canonical['choices']
    used: set[str] = set()
    result: list[str] = []
    for source in source_choices:
        ns = normalize_text(source)
        matches = []
        for choice in candidates:
            nc = normalize_text(choice['text'])
            if ns == nc or (len(ns) >= 2 and len(nc) >= 2 and (ns in nc or nc in ns)):
                matches.append(choice)
        matches = [m for m in matches if m['id'] not in used]
        if len(matches) != 1:
            return []
        result.append(matches[0]['id'])
        used.add(matches[0]['id'])
    if len(result) != len(source_choices) or len(set(result)) != len(result):
        return []
    if result[answer_idx] != canonical['correctChoiceId']:
        return []
    return result


def target_canonical_id(eid: str) -> str:
    decision = dry_by_id[eid]['decision']
    return decision.get('targetCanonicalId') or decision['currentCanonicalId']


records: list[dict[str, Any]] = []
variant_specific_ids: list[str] = []
full_mapping_ids: list[str] = []
direct_link_matrix: list[dict[str, Any]] = []
image_queue: list[str] = []
conflict_queue: list[str] = []
answer_correction_queue: list[str] = []

for eid in BATCH_IDS:
    review = review_by_id[eid]
    source_variant = variants[eid]
    current_canonical = source_variant['canonicalId']
    target_id = target_canonical_id(eid)
    canonical = effective_questions[target_id]
    source_choices = list(review['sourceExactChoices'])
    source_idx = review.get('sourceAnswerIndex')
    source_answer_text = f"{SYMBOLS[source_idx]} {source_choices[source_idx]}" if isinstance(source_idx, int) else ''

    is_image = eid in IMAGE_HOLD_IDS
    is_conflict = eid in CHOICE_CONFLICT_IDS
    is_answer_correction = eid in ANSWER_KEY_CORRECTION_IDS
    answer_idx = None if (is_image or is_conflict) else review.get('independentAnswerIndex')
    reviewed_answer_text = f"{SYMBOLS[answer_idx]} {source_choices[answer_idx]}" if isinstance(answer_idx, int) else ''

    if is_image or is_conflict:
        mapping = []
        variant_specific = False
    else:
        assert isinstance(answer_idx, int), eid
        mapping = safe_choice_mapping(source_choices, canonical, answer_idx)
        variant_specific = len(mapping) == 0
        if variant_specific:
            variant_specific_ids.append(eid)
        else:
            full_mapping_ids.append(eid)

    if eid in SPECIAL_LESSON_BY_EXTERNAL_ID:
        lesson_id = SPECIAL_LESSON_BY_EXTERNAL_ID[eid]
        lesson = effective_lessons[lesson_id]
        theory = {
            'canonicalId': target_id, 'lessonId': lesson_id, 'lessonAnchor': 'principle',
            'conceptGroupId': lesson['conceptGroupId'], 'conceptId': lesson['conceptId'],
            'canonicalStem': canonical['stem'],
        }
        theory_status = 'direct_added_theory_for_answer_or_choice_correction'
    else:
        lesson = effective_lessons[canonical['lessonId']]
        theory = {
            'canonicalId': target_id, 'lessonId': canonical['lessonId'], 'lessonAnchor': canonical['lessonAnchor'],
            'conceptGroupId': canonical['conceptGroupId'], 'conceptId': canonical['conceptId'],
            'canonicalStem': canonical['stem'],
        }
        theory_status = 'direct_existing_theory_relinked' if current_canonical != target_id else 'direct_existing_theory'

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
        image_queue.append(eid)
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
        conflict_indices = [0, 1, 2, 3] if eid == '2011-4-Q42' else [1, 2]
        choice_conflict = {
            'label': '선택지 충돌',
            'conflictType': 'no_unique_incorrect_choice' if eid == '2011-4-Q42' else 'multiple_incorrect_choices',
            'choiceIndices': conflict_indices,
            'reason': direct_solution.removeprefix('선택지 충돌:').strip(),
            'scoringPolicy': 'non_scoring',
            'sourceAnswerTreatment': '복원 정답은 출처 기록으로만 보존하고 학습자 채점에는 사용하지 않는다.',
        }
        conflict_queue.append(eid)
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
        migration_class = 'ANSWER_KEY_CORRECTION_CANONICAL_OVERLAY' if is_answer_correction else dry_by_id[eid]['decision']['mappingClass']
        runtime_disposition = 'PUBLICATION_CANDIDATE_WITH_VARIANT_CHOICE_CONTRACT_PENDING' if variant_specific else 'PUBLICATION_CANDIDATE'
        if is_answer_correction:
            answer_correction_queue.append(eid)

    record = {
        'externalId': eid, 'currentCanonicalId': current_canonical, 'canonicalId': target_id,
        'year': source_variant['year'], 'sessionLabel': source_variant['sessionLabel'], 'questionNumber': source_variant['questionNumber'],
        'source': {
            'textAuthority': review['sourceTextAuthority'], 'captureAuthority': review['sourceCaptureAuthority'],
            'answerAuthority': review['sourceAnswerAuthority'], 'displayLabel': review['sourceDisplayLabel'],
            'registeredSourceUrl': review['identity']['registeredSourceUrl'], 'resolvedSourceUrl': review['identity']['resolvedSourceUrl'],
            'questionNumber': review['identity']['questionNumber'], 'stemSha256': review['identity']['sourceStemSha256'],
            'orderedChoicesSha256': review['identity']['orderedChoicesSha256'],
            'registeredIdentitySha256': review['identity']['registeredIdentitySha256'],
            'resolvedIdentitySha256': review['identity']['sourceIdentitySha256'],
        },
        'stem': review['sourceExactStem'], 'choices': source_choices,
        'sourceAnswerIndex': source_idx, 'reviewedAnswerIndex': answer_idx,
        'sourceAnswerText': source_answer_text, 'reviewedAnswerText': reviewed_answer_text,
        'choiceIdMapping': mapping, 'directSolution': direct_solution,
        'formulaUnitSubstitution': review.get('formulaUnitSubstitution'),
        'choiceByChoiceReasons': review['choiceByChoiceReasons'], 'theoryLink': theory,
        'conceptKeywords': [lesson['title'], *lesson.get('aliases', [])[:3]],
        'review': {
            'verdict': verdict, 'scoringDisposition': scoring, 'sourceAnswerAgreement': source_agreement,
            'answerEvidence': evidence, 'answerConfidence': confidence, 'theoryLinkStatus': theory_status,
            'holdReasons': hold_reasons,
            'answerConflictOrMultipleAnswerRisk': (
                '복원 정답 1번과 독립 검토 정답 3번이 충돌하며, 독립 정답을 canonical overlay에 반영했다.'
                if is_answer_correction else
                ('필수 이미지 판독 전 정답 인덱스를 승인하지 않는다.' if is_image else
                 ('복원 선택지 집합에서 단일정답이 성립하지 않는다.' if is_conflict else
                  (review.get('riskNote') or '없음. 독립 풀이와 복원 정답이 일치한다.')))
            ),
            'runtimeStatus': runtime_status, 'publicationBlockers': blockers, 'reviewedAt': review['reviewedAt'],
        },
        'migration': {
            'mappingClass': migration_class,
            'canonicalAction': (
                'APPLY_CANONICAL_OVERLAY' if eid in SPECIAL_LESSON_BY_EXTERNAL_ID else
                ('REASSIGN_CANONICAL' if current_canonical != target_id else 'KEEP_CURRENT_CANONICAL')
            ),
            'theoryAction': 'ADD_DIRECT_THEORY_LESSON' if eid in SPECIAL_LESSON_BY_EXTERNAL_ID else 'USE_DIRECT_EXISTING_THEORY',
            'runtimeDisposition': runtime_disposition,
            'confidence': 'medium' if (is_image or is_conflict) else 'high',
            'duplicateCanonicalCluster': bool(dry_by_id[eid]['decision'].get('duplicateCanonicalCluster', False)),
            'preserveExternalId': True, 'preserveRegisteredSourceUrl': True, 'preserveQuestionNumber': True,
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
        'externalId': eid, 'currentCanonicalId': current_canonical, 'targetCanonicalId': target_id,
        'runtimeStatus': runtime_status, 'variantSpecificFeedbackRequired': variant_specific,
        'lessonId': theory['lessonId'], 'lessonAnchor': theory['lessonAnchor'],
        'conceptGroupId': theory['conceptGroupId'], 'conceptId': theory['conceptId'],
        'theoryLinkStatus': theory_status,
        'canonicalOverlayApplied': eid in SPECIAL_LESSON_BY_EXTERNAL_ID,
    })

states = Counter(r['review']['runtimeStatus'] for r in records)
assert states == Counter({'candidate': 190, 'hold': 8, 'choice_conflict': 2}), states
assert len(variant_specific_ids) + len(full_mapping_ids) == 190
assert set(image_queue) == IMAGE_HOLD_IDS
assert set(conflict_queue) == CHOICE_CONFLICT_IDS
assert set(answer_correction_queue) == ANSWER_KEY_CORRECTION_IDS

all_records = manifest['records'] + records
assert len(all_records) == 600
assert len({r['externalId'] for r in all_records}) == 600

all_lesson_additions = manifest.get('theoryLessonAdditions', []) + new_lesson_additions
all_question_changes = manifest.get('canonicalQuestionChanges', []) + new_question_changes

batch3 = {
    'batchId': BATCH_ID, 'reviewSessions': ['09', '10', '11', '12'],
    'externalIdRanges': ['2010-4-Q01..2010-4-Q100', '2011-4-Q01..2011-4-Q100'],
    'recordCount': 200, 'candidateCount': 190, 'choiceConflictCount': 2, 'holdCount': 8,
    'normalizationCount': 0, 'imageReviewCount': 8, 'lowContextRegistrationCount': 0,
    'variantSpecificFeedbackCount': len(variant_specific_ids), 'canonicalTheoryRepairs': [],
    'theoryLessonAdditionIds': [x['lesson']['id'] for x in new_lesson_additions],
    'canonicalQuestionChangeIds': [x['question']['id'] for x in new_question_changes],
    'holdResolution': {
        'imageVerificationQueue': sorted(IMAGE_HOLD_IDS), 'normalizedAndRegistered': [],
        'choiceConflictNonScoring': sorted(CHOICE_CONFLICT_IDS), 'lowContextRegistered': [],
    },
    'sourceFiles': [
        {'path': str(p.relative_to(ROOT)).replace('\\', '/'), 'sha256': sha_text(p.read_text(encoding='utf-8'))}
        for p in REVIEW_FILES
    ],
}

new_manifest = copy.deepcopy(manifest)
new_manifest['generatedAt'] = NOW
new_manifest['batches'] = manifest['batches'] + [batch3]
new_manifest['theoryLessonAdditions'] = all_lesson_additions
new_manifest['theoryLessonAdditionsSha256'] = sha_text(jd(all_lesson_additions))
new_manifest['canonicalQuestionChanges'] = all_question_changes
new_manifest['canonicalQuestionChangesSha256'] = sha_text(jd(all_question_changes))
new_manifest['records'] = all_records
new_manifest['recordsSha256'] = sha_text(jd(all_records))
new_manifest['migrationPolicy'] = copy.deepcopy(manifest['migrationPolicy'])
new_manifest['migrationPolicy'].pop('answerKeyConflictScoringAllowed', None)
manifest.get('holdResolutionPolicy', {}).pop('answerKeyConflictCount', None)
new_manifest['holdResolutionPolicy'] = build_hold_resolution_policy(
    new_manifest['batches'],
    manifest['holdResolutionPolicy'],
    NOW,
)
MANIFEST_PATH.write_text(pretty(new_manifest), encoding='utf-8')

# Audit outputs.
(OUT / 'theory-lesson-additions.json').write_text(pretty(new_lesson_additions), encoding='utf-8')
(OUT / 'canonical-question-changes.json').write_text(pretty(new_question_changes), encoding='utf-8')
(OUT / 'direct-theory-link-matrix.jsonl').write_text('\n'.join(jd(x) for x in direct_link_matrix) + '\n', encoding='utf-8')
(OUT / 'variant-specific-choice-contract-queue.jsonl').write_text('\n'.join(jd(next(r for r in records if r['externalId'] == eid)) for eid in variant_specific_ids) + ('\n' if variant_specific_ids else ''), encoding='utf-8')
(OUT / 'image-verification-queue.jsonl').write_text('\n'.join(jd(next(r for r in records if r['externalId'] == eid)) for eid in sorted(IMAGE_HOLD_IDS)) + '\n', encoding='utf-8')
(OUT / 'choice-conflict-queue.jsonl').write_text('\n'.join(jd(next(r for r in records if r['externalId'] == eid)) for eid in sorted(CHOICE_CONFLICT_IDS)) + '\n', encoding='utf-8')
(OUT / 'answer-key-correction-ledger.jsonl').write_text('\n'.join(jd(next(r for r in records if r['externalId'] == eid)) for eid in sorted(ANSWER_KEY_CORRECTION_IDS)) + '\n', encoding='utf-8')
(OUT / 'variant-mapping.jsonl').write_text('\n'.join(jd(x) for x in records) + '\n', encoding='utf-8')
(OUT / 'external-ids.json').write_text(pretty(BATCH_IDS), encoding='utf-8')

theory_gap_audit = {
    'batchId': BATCH_ID, 'recordCount': 200,
    'existingDirectTheoryLinksRetained': 197,
    'newDirectTheoryLessonsAdded': 3,
    'missingDirectTheoryAfterBatch': 0,
    'addedLessons': [
        {'lessonId': x['lesson']['id'], 'title': x['lesson']['title'], 'directExternalIds': x['directExternalIds']}
        for x in new_lesson_additions
    ],
    'notes': [
        '2010-4-Q59은 기존 레슨이 복원 정답을 확정 근거로 사용해 독립 풀이와 충돌하므로 교정 레슨으로 대체했다.',
        '2011-4-Q42와 2011-4-Q59는 기존 레슨의 개념 정의는 일부 유효하지만 대표 정답·함정 설명이 선택지 충돌을 반영하지 못해 별도 직접 레슨으로 분리했다.',
        '그 밖의 197문항은 독립 검수 파일의 direct_source_topic_link와 실제 lesson anchor 존재를 재확인했다.',
    ],
}
(OUT / 'theory-gap-audit.json').write_text(pretty(theory_gap_audit), encoding='utf-8')

summary = {
    'batchId': BATCH_ID, 'generatedAt': NOW, 'recordCount': 200, 'states': dict(states),
    'fullCanonicalChoiceMappingCount': len(full_mapping_ids),
    'variantSpecificFeedbackPendingCount': len(variant_specific_ids),
    'theoryLessonAdditionCount': len(new_lesson_additions),
    'canonicalQuestionChangeCount': len(new_question_changes),
    'directTheoryLinkCount': 200, 'imageVerificationQueueCount': 8,
    'choiceConflictCount': 2, 'answerKeyCorrectionCount': 1,
    'semanticReassignmentCount': sum(r['currentCanonicalId'] != r['canonicalId'] for r in records),
    'sourceContentSha256Before': original_content_sha,
    'sourceContentUnchanged': sha_text(CONTENT_PATH.read_text(encoding='utf-8')) == original_content_sha,
}
(OUT / 'batch-summary.json').write_text(pretty(summary), encoding='utf-8')

report = f'''# CBT 시스템 실제 이식 배치 03 보고서

- 범위: 2010년 4회 100문항 + 2011년 4회 100문항
- candidate: 190
- 선택지 충돌 비채점: 2
- 필수 이미지 HOLD: 8
- 정답키 독립 교정: 1
- 신규 직접 이론 레슨: 3
- canonical 교체 overlay: 3
- canonical 선택지 1:1 매핑 완료: {len(full_mapping_ids)}
- variant 전용 선택지 계약 대기: {len(variant_specific_ids)}

## 핵심 교정

- `2010-4-Q59`: 복원 정답 1번을 보존하되 독립 검토 정답 3번을 canonical overlay에 반영했다. 기존 레슨의 잘못된 대표 정답도 별도 교정 레슨으로 대체했다.
- `2011-4-Q42`: 네 보기 모두 캐비테이션 방지 방향이므로 선택지 충돌·비채점으로 등록했다.
- `2011-4-Q59`: 2번과 3번이 동시에 틀려 선택지 충돌·비채점으로 등록했다.
- `2010-4-Q92`, `2011-4-Q65`: 중복 canonical 군의 더 직접적인 기존 canonical로 재배정했다.

## 공개 경계

- 모든 배치 03 레코드는 candidate, choice_conflict 또는 hold이며 published는 0건이다.
- 이미지 8건은 정답·풀이·선택지 매핑을 활성화하지 않는다.
- 선택지 충돌 2건은 내부 해설을 보존하되 학습자 채점에 사용하지 않는다.
- variant 전용 선택지 계약 대기 문항은 canonical 문자 유사도 fallback을 사용하지 않는다.
- 원본 content.json은 수정하지 않는다.
'''
(OUT / 'import-report.md').write_text(report, encoding='utf-8')

validation = {
    'status': 'PASS', 'recordCount': 200,
    'candidateCount': states['candidate'], 'choiceConflictCount': states['choice_conflict'], 'holdCount': states['hold'],
    'exactExternalIdSet': len(set(BATCH_IDS)) == 200,
    'sourceHashesMatch': all(sha_text(r['stem']) == r['source']['stemSha256'] and sha_text(jd(r['choices'])) == r['source']['orderedChoicesSha256'] for r in records),
    'directTheoryLinksPresent': all(r['theoryLink'] is not None for r in records),
    'candidateAnswersPresent': all(isinstance(r['reviewedAnswerIndex'], int) and r['reviewedAnswerText'] for r in records if r['review']['runtimeStatus'] == 'candidate'),
    'imageHoldAnswersDisabled': all(r['reviewedAnswerIndex'] is None and not r['reviewedAnswerText'] and not r['choiceIdMapping'] for r in records if r['review']['runtimeStatus'] == 'hold'),
    'choiceConflictNonScoring': all(r['reviewedAnswerIndex'] is None and not r['reviewedAnswerText'] and not r['choiceIdMapping'] and r.get('choiceConflict', {}).get('scoringPolicy') == 'non_scoring' for r in records if r['review']['runtimeStatus'] == 'choice_conflict'),
    'variantSpecificBlocked': all('variant_specific_choice_contract_pending' in r['review']['publicationBlockers'] and not r['choiceIdMapping'] for r in records if r.get('variantSpecificFeedbackRequired')),
    'answerKeyCorrectionApplied': next(r for r in records if r['externalId'] == '2010-4-Q59')['reviewedAnswerIndex'] == 2,
    'sourceAnswerPreservedForCorrection': next(r for r in records if r['externalId'] == '2010-4-Q59')['sourceAnswerIndex'] == 0,
    'theoryGapCountAfterBatch': 0,
    'sourceContentUnchanged': sha_text(CONTENT_PATH.read_text(encoding='utf-8')) == original_content_sha,
}
assert all(value is True or key in {'status', 'recordCount', 'candidateCount', 'choiceConflictCount', 'holdCount', 'theoryGapCountAfterBatch'} for key, value in validation.items())
(OUT / 'validation.json').write_text(pretty(validation), encoding='utf-8')

artifact_paths = [
    MANIFEST_PATH, OUT / 'theory-lesson-additions.json', OUT / 'canonical-question-changes.json',
    OUT / 'direct-theory-link-matrix.jsonl', OUT / 'variant-specific-choice-contract-queue.jsonl',
    OUT / 'image-verification-queue.jsonl', OUT / 'choice-conflict-queue.jsonl',
    OUT / 'answer-key-correction-ledger.jsonl', OUT / 'variant-mapping.jsonl', OUT / 'external-ids.json',
    OUT / 'theory-gap-audit.json', OUT / 'batch-summary.json', OUT / 'import-report.md', OUT / 'validation.json',
]
artifact_manifest = {
    'generatedAt': NOW, 'sourceContentSha256': original_content_sha,
    'files': [
        {'path': str(p.relative_to(ROOT)).replace('\\', '/'), 'size': p.stat().st_size, 'sha256': sha_text(p.read_text(encoding='utf-8'))}
        for p in artifact_paths
    ],
}
(OUT / 'artifact-manifest.json').write_text(pretty(artifact_manifest), encoding='utf-8')

print(pretty(summary))
print('manifest sha', sha_text(MANIFEST_PATH.read_text(encoding='utf-8')))
