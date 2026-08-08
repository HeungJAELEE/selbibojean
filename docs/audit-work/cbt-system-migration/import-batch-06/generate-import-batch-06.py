
from __future__ import annotations

import copy
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path('/mnt/data/cbt_batch06_work/repo')
CONTENT_PATH = ROOT / 'src/data/generated/content.json'
MANIFEST_PATH = ROOT / 'src/data/generated/cbt-reviewed-variants.json'
DRY_PATH = Path('/mnt/data/selbibojean_checkout/docs/audit-work/cbt-system-migration/batch-01-mapping-dry-run/variant-mapping-dry-run.jsonl')
OUT = ROOT / 'docs/audit-work/cbt-system-migration/import-batch-06'
OUT.mkdir(parents=True, exist_ok=True)

REVIEW_FILES = [
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20150531_q01-q50_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20150531_q51-q100_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20150919_q01-q50_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20150919_q51-q100_independent-review.jsonl',
]

NOW = '2026-08-07T21:10:10+09:00'
SYMBOLS = ['①', '②', '③', '④', '⑤']
BATCH_ID = 'import-06'

IMAGE_HOLD_IDS = {
    '2015-2-Q02',
    '2015-4-Q12', '2015-4-Q44', '2015-4-Q84', '2015-4-Q88', '2015-4-Q97',
}
CHOICE_CONFLICT_IDS = {
    '2015-2-Q42',
    '2015-4-Q20', '2015-4-Q46', '2015-4-Q55',
}
LOW_CONTEXT_REGISTERED_IDS = {
    '2015-2-Q49', '2015-2-Q70', '2015-4-Q47', '2015-4-Q91',
}
CANONICAL_REASSIGNMENT_IDS = {'2015-4-Q69'}
ANSWER_KEY_CORRECTION_IDS: set[str] = set()
MANUAL_CHOICE_MAPPING: dict[str, list[str]] = {}

CONFLICT_CONTRACTS = {
    '2015-2-Q42': {
        'conflictType': 'no_incorrect_choice_all_choices_technically_defensible',
        'choiceIndices': [0, 1, 2, 3],
        'reason': '제시된 네 문장은 모두 담금질의 일반 원리와 양립한다. 같은 부피라면 표면적/체적비가 큰 판재가 구형재보다 빨리 냉각되므로 복원 정답 1번도 틀린 문장이 아니다.',
    },
    '2015-4-Q20': {
        'conflictType': 'multiple_incorrect_frequency_range_choices',
        'choiceIndices': [1, 3],
        'reason': '복원 해설이 전제한 동일 기준에서도 보통 소음계 상한과 정밀 소음계 범위가 각각 보기 2와 보기 4에서 모두 다르다. 따라서 4번만 유일한 오답으로 채점할 수 없다.',
    },
    '2015-4-Q46': {
        'conflictType': 'multiple_choices_are_not_direct_safety_valve_functions',
        'choiceIndices': [0, 1, 2, 3],
        'reason': '안전밸브의 직접 기능은 설정압력 초과 시 과압을 방출해 탱크를 보호하는 것이다. 네 보기는 유량조절, 감압, 정상 토출압력 조정, 압축기 정지압력 조정 등 다른 장치의 기능으로서 모두 안전밸브의 직접 역할이 아니다.',
    },
    '2015-4-Q55': {
        'conflictType': 'duplicate_equivalent_correct_choices',
        'choiceIndices': [0, 2],
        'reason': '고온가스용 송풍기는 한쪽을 위치결정 베어링으로 고정하고 반대쪽을 축방향 열팽창이 가능한 자유측으로 둔다. 보기 1의 신장과 보기 3의 신축이 같은 자유측 기능을 뜻하므로 복수정답이 된다.',
    },
}

FORMULA_UNIT_SUBSTITUTION_OVERRIDES = {
    '2015-2-Q02': {
        'formula': 'X_rms = √[(1/T)∫_0^T x²(t)dt]',
        'units': 'X_rms는 원 신호 x(t)와 같은 물리 단위',
        'substitution': '정현파 x(t)=X_p sin(ωt)를 한 주기 동안 제곱평균한다.',
        'result': 'X_rms=X_p/√2. 선택지 수식 이미지를 직접 판독하기 전에는 복원 정답 4번을 승인하지 않는다.',
    },
    '2015-2-Q03': {
        'formula': 'P = VI = I²R = V²/R',
        'units': 'V[V], I[A], R[Ω], P[W]',
        'substitution': '옴의 법칙 V=IR을 P=VI에 대입해 등가식을 확인한다.',
        'result': 'P=VR은 차원이 W가 아니므로 3번이 틀린 식이다.',
    },
    '2015-2-Q06': {
        'formula': 'f = 1/T',
        'units': 'f[Hz]=1/s, T[s]',
        'substitution': '한 주기 T초마다 1회 반복하므로 초당 반복횟수는 1/T이다.',
        'result': '주파수는 1초당 사이클 수이므로 60초 동안의 사이클 수라는 2번이 틀리다.',
    },
    '2015-2-Q16': {
        'formula': 'X_rms = X_p/√2',
        'units': '실효값과 피크값은 동일한 진동량 단위',
        'substitution': '정현파의 제곱평균 제곱근을 적용한다.',
        'result': '실효값은 피크값의 약 0.707배이며 2배라는 3번이 틀리다.',
    },
    '2015-2-Q26': {
        'formula': 'OEE = 시간가동률 × 성능가동률 × 양품률',
        'units': '각 항은 무차원 비율이며 결과도 무차원 또는 %',
        'substitution': '세 비율을 소수로 환산해 곱한다.',
        'result': '세 요소의 곱으로 제시된 1번이 옳다.',
    },
    '2015-2-Q82': {
        'formula': 'P₁V₁ = P₂V₂ = 일정',
        'units': 'P는 압력, V는 체적이며 온도는 일정',
        'substitution': '등온 과정에서 압력과 체적의 곱이 일정하다.',
        'result': '압력과 체적이 반비례하므로 보일의 법칙인 1번이다.',
    },
    '2015-2-Q89': {
        'formula': 'P = F/A, F = P×A',
        'units': 'P[Pa=N/m²], F[N], A[m²]',
        'substitution': '압력의 정의를 힘에 대해 정리한다.',
        'result': 'F=P×A인 3번이 옳다.',
    },
    '2015-2-Q98': {
        'formula': 'Q = I×t',
        'units': 'Q[C], I[A], t[s]',
        'substitution': '1 A가 1 s 동안 흐를 때 전하량은 1 C이다.',
        'result': '전하량의 SI 단위는 쿨롱(C)이므로 1번이다.',
    },
    '2015-4-Q12': {
        'formula': '1/k = 1/k₁ + 1/k₂ → k = k₁k₂/(k₁+k₂)',
        'units': 'k, k₁, k₂[N/m]',
        'substitution': '직렬 연결이면 각 스프링 변위가 합산되는 관계를 적용한다.',
        'result': '직렬 합성식이 정답이다. 설치형상과 수식 이미지를 직접 판독하기 전에는 복원 정답 4번을 승인하지 않는다.',
    },
    '2015-4-Q14': {
        'formula': 'f_s ≥ 2f_max, Δt ≤ 1/(2f_max)',
        'units': 'f_s, f_max[Hz], Δt[s]',
        'substitution': '샘플링 주기 Δt=1/f_s를 나이퀴스트 조건에 대입한다.',
        'result': 'Δt≤1/(2f_max)이므로 3번이다.',
    },
    '2015-4-Q15': {
        'formula': 'V = I×R',
        'units': 'V[V], I[A], R[Ω]',
        'substitution': '옴의 법칙을 그대로 적용한다.',
        'result': 'V=IR인 2번이 옳다.',
    },
    '2015-4-Q23': {
        'formula': '생산성 = 산출량/투입량',
        'units': '산출과 투입의 정의에 따라 단위당 산출량',
        'substitution': '동일 기간의 산출량을 투입 자원량으로 나눈다.',
        'result': '산출/투입인 2번이 옳다.',
    },
    '2015-4-Q38': {
        'formula': '설비가동률 = 정미가동시간/부하시간 × 100',
        'units': '시간/시간이므로 무차원 또는 %',
        'substitution': '실제 정미가동시간을 계획된 부하시간으로 나눈다.',
        'result': '해당 관계를 나타낸 2번이 옳다.',
    },
    '2015-4-Q39': {
        'formula': 'A = MTBF/(MTBF+MTTR)',
        'units': '시간/시간이므로 무차원 또는 %',
        'substitution': '평균가동시간을 평균가동시간과 평균수리시간의 합으로 나눈다.',
        'result': 'MTBF/(MTBF+MTTR)인 3번이 옳다.',
    },
    '2015-4-Q44': {
        'formula': 't ≈ pDS/(2σ_aη) + C',
        'units': 'p, σ_a[N/mm²], D, C, t[mm], η와 S는 무차원',
        'substitution': '얇은 원통관의 원주응력 관계에 안전계수와 이음효율, 부식여유를 적용한다.',
        'result': '해당 계열 식이 정답이나 네 수식 이미지를 직접 판독하기 전에는 복원 정답 1번을 승인하지 않는다.',
    },
    '2015-4-Q45': {
        'formula': '줄수 z = 리드/피치 = 14/7',
        'units': '리드와 피치는 동일한 길이 단위, z는 무차원',
        'substitution': 'Tr40×14(P7)에서 리드 14 mm를 피치 7 mm로 나눈다.',
        'result': 'z=2이므로 공칭지름 40 mm의 2줄 나사 설명이 옳다.',
    },
    '2015-4-Q50': {
        'formula': 'F ≤ μP',
        'units': 'F, P[N], μ는 무차원',
        'substitution': '최대 마찰력 μP가 전달하려는 접선력 F 이상이어야 한다.',
        'result': 'F≤μP인 1번이 옳다.',
    },
    '2015-4-Q82': {
        'formula': 'Q = A×v = 일정',
        'units': 'Q[m³/s], A[m²], v[m/s]',
        'substitution': '비압축성 정상유동의 질량보존을 적용한다.',
        'result': '유속은 단면적에 반비례하며 연속의 법칙인 4번이다.',
    },
    '2015-4-Q88': {
        'formula': 'V²/(2g) + p/γ + Z = 일정',
        'units': '각 항은 길이[m]인 수두',
        'substitution': '정상·비압축·비점성 동일 유선에 베르누이 정리를 적용한다.',
        'result': '이 식과 일치하는 선택지가 정답이나 수식 이미지를 직접 판독하기 전에는 복원 정답 2번을 승인하지 않는다.',
    },
    '2015-4-Q91': {
        'formula': 'F = pA; 전진 A=πD²/4, 후진 A=π(D²-d²)/4',
        'units': 'p[Pa], A[m²], F[N], D와 d[m]',
        'substitution': '공기압과 유효 피스톤 면적을 곱한다.',
        'result': '행정거리는 이론추력 계산에 들어가지 않으므로 2번이다. 원문의 로드 내경은 로드 직경 표기 손상으로 해석한다.',
    },
}

assert len(IMAGE_HOLD_IDS) == 6
assert len(CHOICE_CONFLICT_IDS) == 4
assert len(LOW_CONTEXT_REGISTERED_IDS) == 4
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

review_rows: list[dict[str, Any]] = []
for path in REVIEW_FILES:
    review_rows.extend(read_jsonl(path))
review_by_id = {row['externalId']: row for row in review_rows}
assert len(review_by_id) == 200

BATCH_IDS = sorted(
    review_by_id,
    key=lambda external_id: (
        int(external_id[:4]),
        2 if '-2-' in external_id else 4,
        int(re.search(r'Q(\d+)$', external_id).group(1)),
    ),
)
assert len(BATCH_IDS) == 200
assert all(external_id.startswith(('2015-2-', '2015-4-')) for external_id in BATCH_IDS)

dry_rows = read_jsonl(DRY_PATH)
dry_by_id = {row['externalId']: row for row in dry_rows}

if any(batch.get('batchId') == BATCH_ID for batch in manifest.get('batches', [])):
    batch_id_set = set(BATCH_IDS)
    manifest = copy.deepcopy(manifest)
    manifest['batches'] = [b for b in manifest['batches'] if b.get('batchId') != BATCH_ID]
    manifest['records'] = [r for r in manifest['records'] if r['externalId'] not in batch_id_set]
    manifest['recordsSha256'] = sha_text(jd(manifest['records']))

assert len(manifest['records']) == 1000, len(manifest['records'])

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
    used: set[str] = set()
    result: list[str] = []
    for source_choice in source_choices:
        normalized_source = normalize_text(source_choice)
        matches = []
        for choice in canonical['choices']:
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
        'direct_existing_theory_low_context_exam_intent'
        if external_id in LOW_CONTEXT_REGISTERED_IDS
        else 'direct_existing_theory'
    )


records: list[dict[str, Any]] = []
variant_specific_ids: list[str] = []
full_mapping_ids: list[str] = []
direct_link_matrix: list[dict[str, Any]] = []
image_queue: list[str] = []
conflict_queue: list[str] = []
canonical_reassignment_queue: list[str] = []

for external_id in BATCH_IDS:
    review = review_by_id[external_id]
    source_variant = variants[external_id]
    current_canonical = source_variant['canonicalId']
    target_id = target_canonical_id(external_id)
    canonical = effective_questions[target_id]
    source_choices = list(review['sourceExactChoices'])
    source_idx = review.get('sourceAnswerIndex')
    source_answer_text = (
        f"{SYMBOLS[source_idx]} {source_choices[source_idx]}"
        if isinstance(source_idx, int)
        else ''
    )

    is_image = external_id in IMAGE_HOLD_IDS
    is_conflict = external_id in CHOICE_CONFLICT_IDS
    is_reassignment = external_id in CANONICAL_REASSIGNMENT_IDS
    answer_idx = None if (is_image or is_conflict) else review.get('independentAnswerIndex')
    reviewed_answer_text = (
        f"{SYMBOLS[answer_idx]} {source_choices[answer_idx]}"
        if isinstance(answer_idx, int)
        else ''
    )

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
        risk = '필수 이미지 판독 전 정답 인덱스를 승인하지 않는다.'
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
        contract = CONFLICT_CONTRACTS[external_id]
        choice_conflict = {
            'label': '선택지 충돌',
            'conflictType': contract['conflictType'],
            'choiceIndices': contract['choiceIndices'],
            'reason': contract['reason'],
            'scoringPolicy': 'non_scoring',
            'sourceAnswerTreatment': '복원 정답은 출처 기록으로만 보존하고 학습자 채점에는 사용하지 않는다.',
        }
        conflict_queue.append(external_id)
        risk = contract['reason']
    else:
        runtime_status = 'candidate'
        verdict = review.get('reviewVerdict', 'ACCEPT')
        scoring = 'scored'
        blockers = ['pending_runtime_integration']
        if variant_specific:
            blockers.append('variant_specific_choice_contract_pending')
        hold_reasons = []
        source_agreement = review.get('sourceAnswerAgreement') or 'agrees'
        evidence = 'independently_solved'
        confidence = review.get('answerConfidence') or 'confirmed'
        migration_class = dry_by_id[external_id]['decision']['mappingClass']
        runtime_disposition = (
            'PUBLICATION_CANDIDATE_WITH_VARIANT_CHOICE_CONTRACT_PENDING'
            if variant_specific
            else 'PUBLICATION_CANDIDATE'
        )
        if is_reassignment:
            canonical_reassignment_queue.append(external_id)
            risk = '2019-2-Q75와 동일한 윤활유 첨가제 성질 문제군으로 확인되어 U-390으로 재연결한다. 원문 선택지와 canonical 선택지 의미가 완전히 동일하지 않아 variant 전용 선택지 계약을 유지한다.'
        else:
            risk = review.get('riskNote') or '없음. 독립 풀이와 복원 정답이 일치한다.'

    canonical_action = (
        'REASSIGN_CANONICAL' if current_canonical != target_id else 'KEEP_CURRENT_CANONICAL'
    )
    theory_action = (
        'RELINK_TO_TARGET_CANONICAL_DIRECT_THEORY'
        if is_reassignment
        else 'USE_DIRECT_EXISTING_THEORY'
    )

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
        'formulaUnitSubstitution': FORMULA_UNIT_SUBSTITUTION_OVERRIDES.get(external_id),
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
            'duplicateCanonicalCluster': bool(
                dry_by_id[external_id]['decision'].get('duplicateCanonicalCluster', False)
            ),
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
        'canonicalReassignmentApplied': is_reassignment,
        'lowContextPolicyApplied': external_id in LOW_CONTEXT_REGISTERED_IDS,
    })

states = Counter(record['review']['runtimeStatus'] for record in records)
assert states == Counter({'candidate': 190, 'hold': 6, 'choice_conflict': 4}), states
assert len(variant_specific_ids) + len(full_mapping_ids) == 190
assert len(full_mapping_ids) == 25, len(full_mapping_ids)
assert len(variant_specific_ids) == 165, len(variant_specific_ids)
assert set(image_queue) == IMAGE_HOLD_IDS
assert set(conflict_queue) == CHOICE_CONFLICT_IDS
assert set(canonical_reassignment_queue) == CANONICAL_REASSIGNMENT_IDS

all_records = manifest['records'] + records
assert len(all_records) == 1200
assert len({record['externalId'] for record in all_records}) == 1200

batch6 = {
    'batchId': BATCH_ID,
    'reviewSessions': ['21', '22', '23', '24'],
    'externalIdRanges': ['2015-2-Q01..2015-2-Q100', '2015-4-Q01..2015-4-Q100'],
    'recordCount': 200,
    'candidateCount': 190,
    'choiceConflictCount': 4,
    'holdCount': 6,
    'normalizationCount': 0,
    'imageReviewCount': 6,
    'lowContextRegistrationCount': len(LOW_CONTEXT_REGISTERED_IDS),
    'variantSpecificFeedbackCount': len(variant_specific_ids),
    'canonicalTheoryRepairs': ['2015-4-Q69:U-889->U-390'],
    'theoryLessonAdditionIds': [],
    'canonicalQuestionChangeIds': [],
    'holdResolution': {
        'imageVerificationQueue': sorted(IMAGE_HOLD_IDS),
        'normalizedAndRegistered': [],
        'choiceConflictNonScoring': sorted(CHOICE_CONFLICT_IDS),
        'lowContextRegistered': sorted(LOW_CONTEXT_REGISTERED_IDS),
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
new_manifest['batches'] = manifest['batches'] + [batch6]
new_manifest['records'] = all_records
new_manifest['recordsSha256'] = sha_text(jd(all_records))
new_manifest['holdResolutionPolicy'] = build_hold_resolution_policy(
    new_manifest['batches'],
    manifest['holdResolutionPolicy'],
    NOW,
)
MANIFEST_PATH.write_text(pretty(new_manifest), encoding='utf-8')

(OUT / 'theory-lesson-additions.json').write_text(pretty([]), encoding='utf-8')
(OUT / 'canonical-question-changes.json').write_text(pretty([]), encoding='utf-8')
(OUT / 'direct-theory-link-matrix.jsonl').write_text(
    '\n'.join(jd(row) for row in direct_link_matrix) + '\n',
    encoding='utf-8',
)
(OUT / 'variant-specific-choice-contract-queue.jsonl').write_text(
    '\n'.join(
        jd(next(record for record in records if record['externalId'] == external_id))
        for external_id in variant_specific_ids
    ) + ('\n' if variant_specific_ids else ''),
    encoding='utf-8',
)
(OUT / 'image-verification-queue.jsonl').write_text(
    '\n'.join(
        jd(next(record for record in records if record['externalId'] == external_id))
        for external_id in sorted(IMAGE_HOLD_IDS)
    ) + '\n',
    encoding='utf-8',
)
(OUT / 'choice-conflict-queue.jsonl').write_text(
    '\n'.join(
        jd(next(record for record in records if record['externalId'] == external_id))
        for external_id in sorted(CHOICE_CONFLICT_IDS)
    ) + '\n',
    encoding='utf-8',
)
(OUT / 'answer-key-correction-ledger.jsonl').write_text('', encoding='utf-8')
(OUT / 'manual-choice-mapping-ledger.jsonl').write_text('', encoding='utf-8')
(OUT / 'canonical-reassignment-ledger.jsonl').write_text(
    '\n'.join(jd({
        'externalId': external_id,
        'currentCanonicalId': next(
            record for record in records if record['externalId'] == external_id
        )['currentCanonicalId'],
        'targetCanonicalId': next(
            record for record in records if record['externalId'] == external_id
        )['canonicalId'],
        'duplicateOfExternalId': '2019-2-Q75',
        'reason': '윤활유 첨가제의 수용성·기유 용해성·상용성을 묻는 동일 문제군이므로 직접 이론을 공유하는 U-390으로 재연결한다.',
        'choiceContract': 'variant_specific_choice_contract_pending',
    }) for external_id in sorted(CANONICAL_REASSIGNMENT_IDS)) + '\n',
    encoding='utf-8',
)
(OUT / 'low-context-registration-ledger.jsonl').write_text(
    '\n'.join(jd({
        'externalId': external_id,
        'riskNote': next(
            record for record in records if record['externalId'] == external_id
        )['review']['answerConflictOrMultipleAnswerRisk'],
        'policy': 'historical_or_textbook_exam_intent_accepted_with_practical_boundary_preserved',
    }) for external_id in sorted(LOW_CONTEXT_REGISTERED_IDS)) + '\n',
    encoding='utf-8',
)
(OUT / 'variant-mapping.jsonl').write_text(
    '\n'.join(jd(record) for record in records) + '\n',
    encoding='utf-8',
)
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
            'externalId': '2015-4-Q69',
            'fromCanonicalId': 'U-889',
            'toCanonicalId': 'U-390',
            'lessonId': 'lesson-18pfbo5',
            'reason': '2019-2-Q75와 같은 윤활유 첨가제 성질 문제군으로 직접 이론을 공유한다.',
        }
    ],
    'notes': [
        '2015-2-Q42와 2015-4-Q20·Q46·Q55는 기존 직접 이론이 충돌 원인을 설명하므로 신규 이론을 중복 생성하지 않았다.',
        '2015-4-Q69는 dry-run의 중복기출 재배정에 따라 U-390과 lesson-18pfbo5로 재연결했다.',
        '필수 이미지 HOLD 6건도 계산·판단 원리와 직접 이론 연결은 보존하되 정답 번호와 채점을 비활성화했다.',
        '나머지 189문항은 검수본의 lesson·anchor·conceptGroup·concept가 현재 effective content와 직접 일치한다.',
    ],
}
(OUT / 'theory-gap-audit.json').write_text(pretty(theory_gap_audit), encoding='utf-8')

summary = {
    'batchId': BATCH_ID,
    'generatedAt': NOW,
    'recordCount': 200,
    'states': dict(states),
    'fullCanonicalChoiceMappingCount': len(full_mapping_ids),
    'manualChoiceMappingCount': 0,
    'variantSpecificFeedbackPendingCount': len(variant_specific_ids),
    'theoryLessonAdditionCount': 0,
    'canonicalQuestionChangeCount': 0,
    'directTheoryLinkCount': 200,
    'existingTheoryRelinkCount': 1,
    'imageVerificationQueueCount': len(IMAGE_HOLD_IDS),
    'choiceConflictCount': len(CHOICE_CONFLICT_IDS),
    'answerKeyCorrectionCount': 0,
    'canonicalReassignmentCount': len(CANONICAL_REASSIGNMENT_IDS),
    'lowContextRegistrationCount': len(LOW_CONTEXT_REGISTERED_IDS),
    'formulaUnitSubstitutionCount': sum(
        record['formulaUnitSubstitution'] is not None for record in records
    ),
    'sourceContentSha256Before': original_content_sha,
    'sourceContentUnchanged': sha_text(CONTENT_PATH.read_text(encoding='utf-8')) == original_content_sha,
}
(OUT / 'batch-summary.json').write_text(pretty(summary), encoding='utf-8')

report = f'''# CBT 시스템 실제 이식 배치 06 보고서

- 범위: 2015년 2회 100문항 + 2015년 4회 100문항
- candidate: 190
- 선택지 충돌 비채점: 4
- 필수 이미지 HOLD: 6
- canonical 재배정: 1
- 저맥락 시험기준 등록: 4
- 신규 직접 이론 레슨: 0
- canonical 교체 overlay: 0
- canonical 선택지 1:1 매핑 완료: {len(full_mapping_ids)}
- variant 전용 선택지 계약 대기: {len(variant_specific_ids)}

## 핵심 처리

- `2015-2-Q42`: 담금질 보기 네 개가 모두 기술적으로 성립해 유일한 오답이 없으므로 비채점한다.
- `2015-4-Q20`: 동일 복원 기준에서도 보기 2와 4가 함께 틀려 비채점한다.
- `2015-4-Q46`: 네 보기가 모두 안전밸브의 직접 기능이 아니므로 비채점한다.
- `2015-4-Q55`: 신장과 신축이 같은 자유측 베어링 기능을 뜻해 복수정답이므로 비채점한다.
- `2015-4-Q69`: 윤활유 첨가제 성질 직접 이론을 공유하는 U-390으로 재연결한다.
- `2015-2-Q49`, `2015-2-Q70`, `2015-4-Q47`, `2015-4-Q91`: 저맥락 기출의 당시 교재 의도를 인정하되 실무 예외를 risk note로 보존한다.

## 공개 경계

- 모든 배치 06 레코드는 candidate, choice_conflict 또는 hold이며 published는 0건이다.
- 필수 이미지 6건은 정답·풀이·선택지 매핑을 활성화하지 않는다.
- 선택지 충돌 4건은 내부 해설을 보존하되 학습자 채점에 사용하지 않는다.
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
        and lesson_has_anchor(
            effective_lessons[record['theoryLink']['lessonId']],
            record['theoryLink']['lessonAnchor'],
        )
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
        and record['review']['issueLabel'] == '필수 이미지 확인'
        for record in records if record['review']['runtimeStatus'] == 'hold'
    ),
    'choiceConflictNonScoring': all(
        record['reviewedAnswerIndex'] is None
        and not record['reviewedAnswerText']
        and not record['choiceIdMapping']
        and record.get('choiceConflict', {}).get('scoringPolicy') == 'non_scoring'
        and record['directSolution'].startswith('선택지 충돌:')
        for record in records if record['review']['runtimeStatus'] == 'choice_conflict'
    ),
    'variantSpecificBlocked': all(
        'variant_specific_choice_contract_pending' in record['review']['publicationBlockers']
        and not record['choiceIdMapping']
        for record in records if record.get('variantSpecificFeedbackRequired')
    ),
    'canonicalReassignmentApplied': next(
        record for record in records if record['externalId'] == '2015-4-Q69'
    )['canonicalId'] == 'U-390',
    'canonicalReassignmentTheoryApplied': next(
        record for record in records if record['externalId'] == '2015-4-Q69'
    )['theoryLink']['lessonId'] == 'lesson-18pfbo5',
    'choiceConflictContractsExact': all(
        next(record for record in records if record['externalId'] == external_id)
        ['choiceConflict']['choiceIndices'] == contract['choiceIndices']
        for external_id, contract in CONFLICT_CONTRACTS.items()
    ),
    'lowContextPoliciesPreserved': all(
        next(record for record in records if record['externalId'] == external_id)
        ['review']['answerConflictOrMultipleAnswerRisk']
        for external_id in LOW_CONTEXT_REGISTERED_IDS
    ),
    'formulaUnitSubstitutionCount': sum(
        record['formulaUnitSubstitution'] is not None for record in records
    ) == len(FORMULA_UNIT_SUBSTITUTION_OVERRIDES),
    'theoryGapCountAfterBatch': 0,
    'sourceContentUnchanged': sha_text(CONTENT_PATH.read_text(encoding='utf-8')) == original_content_sha,
}
assert all(
    value is True or key in {
        'status', 'recordCount', 'candidateCount', 'choiceConflictCount',
        'holdCount', 'theoryGapCountAfterBatch',
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
    OUT / 'low-context-registration-ledger.jsonl',
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
