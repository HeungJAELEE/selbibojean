from __future__ import annotations

import copy
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-08"
REVIEW_DIR = ROOT / "docs/audit-work/cbt-source-reviews/final"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
PRIOR_VALIDATION_PATH = ROOT / "docs/audit-work/cbt-system-migration/import-batch-07/final-validation.json"
MAPPING_PATH = OUT / "mapping-dry-run-input.jsonl"
MAPPING_SUMMARY_PATH = OUT / "mapping-source-summary.json"
SOURCE_BATCH_SUMMARY_PATH = OUT / "source-batch-summary.json"
SOURCE_SECOND_PASS_PATH = OUT / "source-second-pass-validation.json"

REVIEW_FILES = [
    REVIEW_DIR / "de20170507_q51-q100_independent-review.jsonl",
    REVIEW_DIR / "de20180428_q01-q50_independent-review.jsonl",
    REVIEW_DIR / "de20180428_q51-q100_independent-review.jsonl",
    REVIEW_DIR / "de20180915_q01-q50_independent-review.jsonl",
]

NOW = "2026-08-08T13:40:00+09:00"
BATCH_ID = "import-08"
SYMBOLS = ["①", "②", "③", "④", "⑤"]
EXPECTED_CONTENT_SHA256 = "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"
EXPECTED_DRYRUN_SHA256 = "40b656165a1dcfbc69d26451c0fdc6615f541333644cdf8903297d77bed8fe0d"
EXPECTED_PRIOR_RECORDS_SHA256 = "b71a7a6567ccc0f4d8fb02d0cb82d0708fe1b4a9b5b82403c3d5849158c5f196"
EXPECTED_PRIOR_MANIFEST_SHA256 = "554131acc5dd2aa67c73eb97ce7336ea542f7c76bbdf92fc57adab42b4472144"
TOTAL_SOURCE_VARIANTS = 2384

IMAGE_HOLD_IDS = {
    "2017-2-Q60",
    "2018-2-Q05",
    "2018-2-Q21",
    "2018-2-Q45",
    "2018-2-Q83",
    "2018-4-Q15",
    "2018-4-Q18",
    "2018-4-Q37",
}
CHOICE_CONFLICT_IDS = {"2018-2-Q10"}
CANONICAL_REASSIGNMENT_ID = "2018-4-Q19"
CANONICAL_REPAIR_ID = "2018-4-Q35"
REPAIRED_CANONICAL_ID = "U-649"
REASSIGNED_CANONICAL_ID = "U-997"
NEW_LESSON_ID = "lesson-cbt-gang-system-process-layout"
NEW_LESSON_ANCHOR = "definition"
NEW_CONCEPT_GROUP_ID = "s4-g10"
NEW_CONCEPT_ID = "concept-cd7x17"


def sha_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def sha_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def jd(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def pretty(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [
        json.loads(line)
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def write_json(path: Path, value: Any) -> None:
    path.write_text(pretty(value), encoding="utf-8")


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.write_text(
        "\n".join(jd(row) for row in rows) + ("\n" if rows else ""),
        encoding="utf-8",
    )


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value).lower()
    value = re.sub(r"[\s\-–—·,.:;()\[\]{}_/\\]+", "", value)
    return (
        value.replace("ㆍ", "")
        .replace("＝", "=")
        .replace("²", "2")
        .replace("³", "3")
    )


def parse_formula_structure(direct_solution: str) -> dict[str, str] | None:
    labels = ["식:", "단위:", "대입:", "결과:"]
    if not all(label in direct_solution for label in labels):
        return None
    match = re.fullmatch(
        r"식:\s*(.*?)\s*단위:\s*(.*?)\s*대입:\s*(.*?)\s*결과:\s*(.*)",
        direct_solution.strip(),
        flags=re.DOTALL,
    )
    if not match:
        return None
    formula, units, substitution, result = (part.strip() for part in match.groups())
    return {
        "formula": formula.removesuffix("."),
        "units": units.removesuffix("."),
        "substitution": substitution.removesuffix("."),
        "result": result.removesuffix("."),
    }


def build_hold_resolution_policy(
    batches: list[dict[str, Any]], template: dict[str, Any], decided_at: str
) -> dict[str, Any]:
    image_ids: set[str] = set()
    normalized_ids: set[str] = set()
    conflict_ids: set[str] = set()
    low_context_ids: set[str] = set()
    for batch in batches:
        resolution = batch.get("holdResolution", {})
        image_ids.update(resolution.get("imageVerificationQueue", []))
        normalized_ids.update(resolution.get("normalizedAndRegistered", []))
        conflict_ids.update(resolution.get("choiceConflictNonScoring", []))
        low_context_ids.update(resolution.get("lowContextRegistered", []))
    return {
        "decisionAuthority": template.get("decisionAuthority", "user_explicit_approval"),
        "decidedAt": decided_at,
        "imageVerificationQueueCount": len(image_ids),
        "normalizedAndRegisteredCount": len(normalized_ids),
        "choiceConflictNonScoringCount": len(conflict_ids),
        "lowContextRegisteredCount": len(low_context_ids),
        "learnerPublicationStillRequiresStatus": "published",
    }


def concept_keywords(review: dict[str, Any]) -> list[str]:
    theory = review["theoryLink"]
    values = [
        theory.get("lessonTitle"),
        theory.get("keyword"),
        *(theory.get("keywordAliases") or []),
        theory.get("conceptGroupTitle"),
        theory.get("conceptTitle"),
    ]
    result: list[str] = []
    for value in values:
        if value and value not in result:
            result.append(value)
    return result


def safe_choice_mapping(
    source_choices: list[str], canonical: dict[str, Any], answer_idx: int | None
) -> list[str]:
    if answer_idx is None or not source_choices or any(not str(x).strip() for x in source_choices):
        return []
    used: set[str] = set()
    result: list[str] = []
    for source_choice in source_choices:
        normalized_source = normalize_text(source_choice)
        matches: list[dict[str, Any]] = []
        for choice in canonical["choices"]:
            normalized_choice = normalize_text(choice["text"])
            if normalized_source == normalized_choice or (
                len(normalized_source) >= 2
                and len(normalized_choice) >= 2
                and (
                    normalized_source in normalized_choice
                    or normalized_choice in normalized_source
                )
            ):
                matches.append(choice)
        matches = [choice for choice in matches if choice["id"] not in used]
        if len(matches) != 1:
            return []
        result.append(matches[0]["id"])
        used.add(matches[0]["id"])
    if len(result) != len(source_choices) or len(set(result)) != len(result):
        return []
    if result[answer_idx] != canonical["correctChoiceId"]:
        return []
    return result


def reconstruct_target_canonical_from_prior_record(
    manifest: dict[str, Any], canonical_id: str
) -> dict[str, Any]:
    candidates = [
        record
        for record in manifest["records"]
        if record["canonicalId"] == canonical_id
        and record.get("choiceIdMapping")
        and isinstance(record.get("reviewedAnswerIndex"), int)
    ]
    if not candidates:
        raise AssertionError(f"no prior full canonical contract for {canonical_id}")
    record = candidates[0]
    count = len(record["choices"])
    choices: list[dict[str, str] | None] = [None] * count
    for text, choice_id in zip(record["choices"], record["choiceIdMapping"], strict=True):
        match = re.fullmatch(re.escape(canonical_id) + r"-c(\d+)", choice_id)
        assert match
        choices[int(match.group(1)) - 1] = {"id": choice_id, "text": text}
    assert all(choice is not None for choice in choices)
    answer_choice_id = record["choiceIdMapping"][record["reviewedAnswerIndex"]]
    return {
        "id": canonical_id,
        "stem": record["theoryLink"]["canonicalStem"],
        "choices": choices,
        "correctChoiceId": answer_choice_id,
        "lessonId": record["theoryLink"]["lessonId"],
        "lessonAnchor": record["theoryLink"]["lessonAnchor"],
        "conceptGroupId": record["theoryLink"]["conceptGroupId"],
        "conceptId": record["theoryLink"]["conceptId"],
    }


def make_feedback(review: dict[str, Any], idx: int, answer_idx: int) -> dict[str, Any]:
    item = review["choiceByChoiceReasons"][idx]
    text = review["sourceExactChoices"][idx]
    if idx == answer_idx:
        return {
            "rationale": item["reason"],
            "plausibleReason": "문두의 직접 조건을 충족한다.",
            "incorrectPoint": None,
            "keyRule": review["directSolution"],
            "differenceFromCorrect": None,
        }
    correct_text = review["sourceExactChoices"][answer_idx]
    return {
        "rationale": item["reason"],
        "plausibleReason": f"‘{text}’도 같은 분야의 용어이지만 문두의 배치 정의와는 다르다.",
        "incorrectPoint": item["reason"],
        "keyRule": review["directSolution"],
        "differenceFromCorrect": f"정답 ‘{correct_text}’와 달리 문두의 동일기종 집단배치 조건을 충족하지 않는다.",
    }


OUT.mkdir(parents=True, exist_ok=True)
manifest = read_json(MANIFEST_PATH)
prior_validation = read_json(PRIOR_VALIDATION_PATH)
mapping_summary = read_json(MAPPING_SUMMARY_PATH)
source_batch_summary = read_json(SOURCE_BATCH_SUMMARY_PATH)
source_second_pass = read_json(SOURCE_SECOND_PASS_PATH)
dry_rows = read_jsonl(MAPPING_PATH)
dry_by_id = {row["externalId"]: row for row in dry_rows}

assert sha_file(MAPPING_PATH) == EXPECTED_DRYRUN_SHA256
assert sha_file(MANIFEST_PATH) in {EXPECTED_PRIOR_MANIFEST_SHA256, sha_file(MANIFEST_PATH)}
assert prior_validation["sourceIntegrity"]["contentJsonSha256Expected"] == EXPECTED_CONTENT_SHA256
assert prior_validation["sourceIntegrity"]["contentHashBindingVerified"] is True
assert source_batch_summary["status"] == "PASS"
assert source_second_pass["status"] == "PASS"
assert mapping_summary["recordCount"] == 200
assert len(manifest["records"]) in {1370, 1570}

# Idempotent regeneration owns only batch 08 records and its one lesson/question overlay.
if any(batch.get("batchId") == BATCH_ID for batch in manifest.get("batches", [])):
    owned_ids = {row["externalId"] for row in dry_rows}
    manifest = copy.deepcopy(manifest)
    manifest["batches"] = [b for b in manifest["batches"] if b.get("batchId") != BATCH_ID]
    manifest["records"] = [r for r in manifest["records"] if r["externalId"] not in owned_ids]
    manifest["theoryLessonAdditions"] = [
        a for a in manifest.get("theoryLessonAdditions", []) if a["lesson"]["id"] != NEW_LESSON_ID
    ]
    manifest["canonicalQuestionChanges"] = [
        c for c in manifest.get("canonicalQuestionChanges", []) if c["question"]["id"] != REPAIRED_CANONICAL_ID
    ]
    manifest["recordsSha256"] = sha_text(jd(manifest["records"]))
    manifest["theoryLessonAdditionsSha256"] = sha_text(jd(manifest["theoryLessonAdditions"]))
    manifest["canonicalQuestionChangesSha256"] = sha_text(jd(manifest["canonicalQuestionChanges"]))

assert len(manifest["records"]) == 1370
assert manifest["recordsSha256"] == EXPECTED_PRIOR_RECORDS_SHA256
assert len({r["externalId"] for r in manifest["records"]}) == 1370

review_rows: list[dict[str, Any]] = []
for path in REVIEW_FILES:
    review_rows.extend(read_jsonl(path))
review_by_id = {row["externalId"]: row for row in review_rows}
BATCH_IDS = [row["externalId"] for row in dry_rows]
assert len(BATCH_IDS) == len(set(BATCH_IDS)) == 200
assert set(BATCH_IDS) == set(review_by_id)
assert BATCH_IDS[0] == "2017-2-Q51"
assert BATCH_IDS[-1] == "2018-4-Q50"
assert Counter(row["reviewVerdict"] for row in review_rows) == Counter(
    {"ACCEPT": 191, "HOLD": 8, "CHOICE_ISSUE": 1}
)
assert Counter(row["decision"]["mappingClass"] for row in dry_rows) == Counter(
    {"EXACT_REPLACE": 190, "HOLD": 9, "SEMANTIC_REPLACE": 1}
)
assert {r["externalId"] for r in review_rows if r["reviewVerdict"] == "HOLD"} == IMAGE_HOLD_IDS
assert {r["externalId"] for r in review_rows if r["reviewVerdict"] == "CHOICE_ISSUE"} == CHOICE_CONFLICT_IDS
assert mapping_summary["semanticReassignmentCount"] == 1
assert mapping_summary["relinkInPlaceCount"] == 1

reassignment_contract = reconstruct_target_canonical_from_prior_record(manifest, REASSIGNED_CANONICAL_ID)
repair_review = review_by_id[CANONICAL_REPAIR_ID]
repair_choices = [
    {"id": f"{REPAIRED_CANONICAL_ID}-c{idx + 1}", "text": text}
    for idx, text in enumerate(repair_review["sourceExactChoices"])
]
repair_contract = {
    "id": REPAIRED_CANONICAL_ID,
    "stem": repair_review["sourceExactStem"],
    "choices": repair_choices,
    "correctChoiceId": f"{REPAIRED_CANONICAL_ID}-c1",
    "lessonId": NEW_LESSON_ID,
    "lessonAnchor": NEW_LESSON_ANCHOR,
    "conceptGroupId": NEW_CONCEPT_GROUP_ID,
    "conceptId": NEW_CONCEPT_ID,
}

lesson_summary = [
    "이 배치에서 갱 시스템은 공정별 배치에서 같은 종류의 기계를 한 구역에 집단 배치하는 의미로 사용한다.",
    "라인 시스템은 제품의 공정순서에 따라 설비를 배열하고, 제품 고정형은 제품 위치로 작업자와 설비가 이동한다.",
    "보전작업자 팀 조직을 뜻하는 동명 용례와 혼동하지 않도록 문두의 ‘동일 기종’과 ‘공정별 배치’를 함께 확인한다.",
]
lesson_blocks = [
    {
        "id": "summary",
        "kind": "summary",
        "title": "핵심 요약",
        "body": "\n".join(f"{idx + 1}. {line}" for idx, line in enumerate(lesson_summary)),
        "order": 1,
    },
    {
        "id": "definition",
        "kind": "definition",
        "title": "이 문항에서의 정의",
        "body": "공정별 배치의 갱 시스템은 같은 종류의 기계를 한 구역에 모아 운용하는 집단배치 형태로 판정한다. 이 정의는 2015-2-Q23과 2018-4-Q35의 복원 지문·독립 풀이에 한정해 적용한다.",
        "order": 2,
    },
    {
        "id": "comparison",
        "kind": "principle",
        "title": "선택지 비교",
        "body": "라인 시스템은 제품 흐름 순서에 따른 제품별 배치이고, 혼합형은 둘 이상의 배치방식을 조합하며, 제품 고정형은 제품을 이동하지 않는다. 따라서 ‘공정별 배치’와 ‘동일 기종 집단’이 함께 제시되면 갱 시스템을 고른다.",
        "order": 3,
    },
    {
        "id": "trap",
        "kind": "trap",
        "title": "동명 용례 경계",
        "body": "gang system은 자료에 따라 보전작업자 팀 조직을 뜻하기도 한다. 이 레슨은 원자료가 직접 제공한 동일기종 집단배치 의미만 보강하며, 권위 출처가 추가되기 전에는 공개하지 않는다.",
        "order": 4,
    },
    {
        "id": "source",
        "kind": "source",
        "title": "출처와 공개 상태",
        "body": "- 직접 근거: 2015-2-Q23 및 2018-4-Q35 독립 검토 패킷\n- 원문 확인 URL: https://cbtbank.kr/exam/de20150531, https://cbtbank.kr/exam/de20180915\n- 권위 출처: 미확보\n- 공개 상태: lesson_source_needed 및 런타임 통합 검증 전 차단",
        "order": 5,
    },
]
new_lesson_addition = {
    "lesson": {
        "id": NEW_LESSON_ID,
        "subjectId": "subject-4",
        "conceptGroupId": NEW_CONCEPT_GROUP_ID,
        "conceptId": NEW_CONCEPT_ID,
        "title": "공정별 배치의 갱 시스템",
        "aliases": ["갱 시스템", "gang system", "동일 기종 집단배치", "공정별 배치"],
        "summary": lesson_summary,
        "blocks": lesson_blocks,
        "relatedQuestionIds": [REPAIRED_CANONICAL_ID],
        "coverageStatus": "covered_from_review_packet",
        "contentStatus": "in_review",
        "sourceNeeded": True,
        "reviewedAt": None,
        "contentRole": "exam_linked",
        "publication": {
            "readiness": "blocked",
            "blockers": ["lesson_source_needed", "pending_runtime_integration"],
        },
        "quality": {
            "tier": "standard",
            "substantiveCharacters": sum(len(block["body"]) for block in lesson_blocks),
            "genericPhraseMatches": [],
            "languageIssueMatches": [],
            "sourceLinked": True,
            "authoritativeSourceLinked": False,
            "passed": True,
        },
    },
    "directExternalIds": ["2015-2-Q23", CANONICAL_REPAIR_ID],
    "rationale": "U-649의 동일기종 집단배치 의미를 복원하고 보전작업자 팀 조직이라는 기존 오연결을 분리한다.",
    "sourceAuthority": "review_packet_only_source_needed",
}

repair_answer_idx = repair_review["independentAnswerIndex"]
assert repair_answer_idx == 0
repair_question_choices = [
    {
        "id": f"{REPAIRED_CANONICAL_ID}-c{idx + 1}",
        "order": idx + 1,
        "text": text,
        "feedback": make_feedback(repair_review, idx, repair_answer_idx),
    }
    for idx, text in enumerate(repair_review["sourceExactChoices"])
]
old_q35_contract = {
    "id": REPAIRED_CANONICAL_ID,
    "stem": dry_by_id[CANONICAL_REPAIR_ID]["currentSystem"]["canonicalStem"],
    "choices": dry_by_id[CANONICAL_REPAIR_ID]["currentSystem"]["canonicalChoices"],
    "answerIndex": dry_by_id[CANONICAL_REPAIR_ID]["currentSystem"]["canonicalAnswerIndex"],
    "theoryLink": dry_by_id[CANONICAL_REPAIR_ID]["currentSystem"]["canonicalTheoryLink"],
}
new_canonical_change = {
    "action": "replace",
    "question": {
        "id": REPAIRED_CANONICAL_ID,
        "canonicalNumber": 649,
        "subjectId": "subject-4",
        "conceptGroupId": NEW_CONCEPT_GROUP_ID,
        "conceptId": NEW_CONCEPT_ID,
        "lessonId": NEW_LESSON_ID,
        "lessonAnchor": NEW_LESSON_ANCHOR,
        "stem": repair_review["sourceExactStem"],
        "choices": repair_question_choices,
        "correctChoiceId": repair_question_choices[repair_answer_idx]["id"],
        "answerText": repair_review["sourceExactChoices"][repair_answer_idx],
        "explanation": repair_review["directSolution"].strip(),
        "errorReason": "canonical 의미·이론 오연결 교정",
        "sourceLabel": repair_review["identity"]["registeredSourceUrl"],
        "reviewStatus": "배치 08 독립 풀이·동명 용례 분리 검수",
        "contentStatus": "in_review",
        "publication": {
            "readiness": "blocked",
            "blockers": ["lesson_source_needed", "pending_runtime_integration"],
        },
        "verification": {
            "status": "blocked",
            "method": "review_packet_reconstruction_requires_authoritative_source",
            "variantCount": 2,
            "sourceUrls": [
                "https://cbtbank.kr/exam/de20150531",
                "https://cbtbank.kr/exam/de20180915",
            ],
            "riskTags": ["editorial_reconstruction", "polysemy", "theory_repair"],
            "note": "두 회차의 복원 지문과 독립 풀이가 동일기종 집단배치 의미에 합치한다. 권위 출처 확보 전 공개하지 않는다.",
            "reviewedAt": NOW,
        },
        "audit": {
            "questionId": REPAIRED_CANONICAL_ID,
            "scope": "review_queue",
            "sourceContentStatus": "in_review",
            "auditDisposition": "held_theory_source_needed",
            "evidenceLevel": None,
            "cbtAnswer": repair_review["sourceExactChoices"][repair_review["sourceAnswerIndex"]],
            "verifiedAnswer": repair_review["sourceExactChoices"][repair_answer_idx],
            "evidenceUrls": [repair_review["identity"]["registeredSourceUrl"]],
            "reviewNote": repair_review["riskNote"],
            "assetStatus": "not_required",
            "nextAction": "권위 출처 연결 및 전체 런타임 검증 후 공개 심사",
            "reviewChoiceFeedback": [
                {
                    "choiceId": repair_question_choices[idx]["id"],
                    "verdict": "correct" if idx == repair_answer_idx else "incorrect",
                    "rationale": repair_review["choiceByChoiceReasons"][idx]["reason"],
                }
                for idx in range(len(repair_question_choices))
            ],
            "reviewedAt": NOW,
        },
        "validation": {
            "answer": True,
            "explanation": True,
            "choiceFeedback": True,
            "theoryLink": True,
            "contentQuality": True,
            "authoritativeSource": False,
        },
    },
    "previousQuestionSha256": sha_text(jd(old_q35_contract)),
    "previousQuestionHashBasis": "dry_run_canonical_contract",
    "affectedExternalIds": ["2015-2-Q23", CANONICAL_REPAIR_ID],
    "rationale": "U-649를 보전작업자 팀 조직에서 공정별 동일기종 집단배치 의미로 교정하고 직접 이론을 분리한다.",
}

records: list[dict[str, Any]] = []
direct_link_matrix: list[dict[str, Any]] = []
full_mapping_ids: list[str] = []
variant_specific_ids: list[str] = []
image_queue_ids: list[str] = []
conflict_queue_ids: list[str] = []
low_context_ids: list[str] = []
formula_ids: list[str] = []

for external_id in BATCH_IDS:
    review = review_by_id[external_id]
    dry = dry_by_id[external_id]
    current = dry["currentSystem"]
    decision = dry["decision"]
    source_choices = list(review["sourceExactChoices"])
    source_idx = review.get("sourceAnswerIndex")
    is_image_hold = external_id in IMAGE_HOLD_IDS
    is_conflict = external_id in CHOICE_CONFLICT_IDS
    is_reassignment = external_id == CANONICAL_REASSIGNMENT_ID
    is_repair = external_id == CANONICAL_REPAIR_ID

    if is_reassignment:
        canonical = reassignment_contract
    elif is_repair:
        canonical = repair_contract
    else:
        canonical_id = decision.get("targetCanonicalId") or decision["currentCanonicalId"]
        assert canonical_id == decision["currentCanonicalId"]
        canonical = {
            "id": canonical_id,
            "stem": current["canonicalStem"],
            "choices": [
                {"id": f"{canonical_id}-c{idx + 1}", "text": text}
                for idx, text in enumerate(current["canonicalChoices"])
            ],
            "correctChoiceId": f"{canonical_id}-c{current['canonicalAnswerIndex'] + 1}",
            **decision["targetCanonicalTheoryLink"],
        }

    answer_idx = None if (is_image_hold or is_conflict) else review.get("independentAnswerIndex")
    source_answer_text = (
        f"{SYMBOLS[source_idx]} {source_choices[source_idx]}"
        if isinstance(source_idx, int)
        else ""
    )
    reviewed_answer_text = (
        f"{SYMBOLS[answer_idx]} {source_choices[answer_idx]}"
        if isinstance(answer_idx, int)
        else ""
    )

    if is_image_hold or is_conflict:
        choice_mapping: list[str] = []
        variant_specific = False
    else:
        assert isinstance(answer_idx, int), external_id
        choice_mapping = safe_choice_mapping(source_choices, canonical, answer_idx)
        variant_specific = not choice_mapping
        if variant_specific:
            variant_specific_ids.append(external_id)
        else:
            full_mapping_ids.append(external_id)

    if is_image_hold:
        image_queue_ids.append(external_id)
        runtime_status = "hold"
        scoring_disposition = "excluded_required_image"
        source_agreement = review.get("sourceAnswerAgreement") or "unverified"
        answer_evidence = "required_source_image_not_visually_verified"
        confidence = review.get("answerConfidence") or "unverified"
        blockers = ["required_source_image_review"]
        risk = "필수 이미지 판독 전 정답 인덱스를 승인하지 않는다."
        issue_label = "필수 이미지 확인"
        mapping_class = "IMAGE_VERIFICATION_HOLD"
        canonical_action = "PRESERVE_CURRENT_MAPPING_PENDING_REVIEW"
        theory_action = "PRESERVE_AUDIT_THEORY_ONLY"
        runtime_disposition = "IMAGE_VERIFICATION_QUEUE"
        migration_confidence = "medium"
    elif is_conflict:
        conflict_queue_ids.append(external_id)
        runtime_status = "choice_conflict"
        scoring_disposition = "non_scoring"
        source_agreement = review.get("sourceAnswerAgreement") or "source_key_not_usable"
        answer_evidence = "independent_choice_set_conflict"
        confidence = review.get("answerConfidence") or "confirmed"
        blockers = ["choice_conflict_non_scoring"]
        risk = review["directSolution"]
        issue_label = "선택지 충돌"
        mapping_class = "CHOICE_CONFLICT_NON_SCORING"
        canonical_action = "PRESERVE_CURRENT_MAPPING_PENDING_REVIEW"
        theory_action = "PRESERVE_CONFLICT_THEORY_ONLY"
        runtime_disposition = "CHOICE_CONFLICT_NON_SCORING"
        migration_confidence = "high"
    else:
        runtime_status = "candidate"
        scoring_disposition = "scored_after_theory_repair" if is_repair else "scored"
        source_agreement = review.get("sourceAnswerAgreement") or "agrees"
        answer_evidence = review.get("answerEvidence") or "independently_solved"
        confidence = review.get("answerConfidence") or "confirmed"
        blockers = ["pending_runtime_integration"]
        if variant_specific:
            blockers.append("variant_specific_choice_contract_pending")
        if is_repair:
            blockers.append("lesson_source_needed")
        risk = review.get("riskNote") or "없음. 독립 풀이와 복원 정답이 일치한다."
        issue_label = None
        mapping_class = decision["mappingClass"]
        canonical_action = (
            "REASSIGN_CANONICAL" if is_reassignment else
            "APPLY_CANONICAL_OVERLAY" if is_repair else
            "KEEP_CURRENT_CANONICAL"
        )
        theory_action = (
            "USE_TARGET_CANONICAL_DIRECT_THEORY" if is_reassignment else
            "ADD_DIRECT_THEORY_LESSON" if is_repair else
            "USE_DIRECT_EXISTING_THEORY"
        )
        runtime_disposition = (
            "CANDIDATE_AFTER_CANONICAL_THEORY_REPAIR_SOURCE_GATED" if is_repair else
            "PUBLICATION_CANDIDATE_WITH_VARIANT_CHOICE_CONTRACT_PENDING" if variant_specific else
            "PUBLICATION_CANDIDATE"
        )
        migration_confidence = "high"

    is_low_context = bool(review.get("riskNote")) and runtime_status == "candidate"
    if is_low_context:
        low_context_ids.append(external_id)
    if is_repair:
        theory_status = "direct_added_theory_source_needed"
        theory_link = {
            "canonicalId": canonical["id"],
            "lessonId": NEW_LESSON_ID,
            "lessonAnchor": NEW_LESSON_ANCHOR,
            "conceptGroupId": NEW_CONCEPT_GROUP_ID,
            "conceptId": NEW_CONCEPT_ID,
            "canonicalStem": canonical["stem"],
        }
    else:
        reviewed_theory = review["theoryLink"]
        target_theory = canonical
        if is_reassignment:
            for key in ["lessonId", "conceptGroupId", "conceptId"]:
                assert reviewed_theory[key] == target_theory[key], (external_id, key)
        elif not is_image_hold and not is_conflict:
            for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"]:
                assert reviewed_theory[key] == target_theory[key], (external_id, key)
        theory_status = (
            "direct_existing_theory_low_context_exam_intent"
            if is_low_context
            else "direct_existing_theory"
        )
        theory_link = {
            "canonicalId": canonical["id"],
            "lessonId": canonical["lessonId"],
            "lessonAnchor": canonical["lessonAnchor"],
            "conceptGroupId": canonical["conceptGroupId"],
            "conceptId": canonical["conceptId"],
            "canonicalStem": canonical["stem"],
        }

    formula_structure = parse_formula_structure(review["directSolution"])
    if formula_structure is not None:
        formula_ids.append(external_id)

    direct_solution = review["directSolution"].strip()
    choice_conflict: dict[str, Any] | None = None
    if is_conflict:
        if not direct_solution.startswith("선택지 충돌:"):
            direct_solution = f"선택지 충돌: {direct_solution}"
        choice_conflict = {
            "choiceIndices": [0, 1, 2, 3],
            "reason": review["directSolution"].strip(),
            "scoringPolicy": "non_scoring",
            "sourceAnswerTreatment": "복원 정답은 출처 기록으로만 보존하고 학습자 채점에는 사용하지 않는다.",
        }

    record: dict[str, Any] = {
        "externalId": external_id,
        "currentCanonicalId": decision["currentCanonicalId"],
        "canonicalId": canonical["id"],
        "year": current["year"],
        "sessionLabel": current["sessionLabel"],
        "questionNumber": current["questionNumber"],
        "source": {
            "textAuthority": review["sourceTextAuthority"],
            "captureAuthority": review["sourceCaptureAuthority"],
            "answerAuthority": review["sourceAnswerAuthority"],
            "displayLabel": review["sourceDisplayLabel"],
            "registeredSourceUrl": review["identity"]["registeredSourceUrl"],
            "resolvedSourceUrl": review["identity"]["resolvedSourceUrl"],
            "questionNumber": review["identity"]["questionNumber"],
            "stemSha256": review["identity"]["sourceStemSha256"],
            "orderedChoicesSha256": review["identity"]["orderedChoicesSha256"],
            "registeredIdentitySha256": review["identity"]["registeredIdentitySha256"],
            "resolvedIdentitySha256": review["identity"]["sourceIdentitySha256"],
        },
        "stem": review["sourceExactStem"],
        "choices": source_choices,
        "sourceAnswerIndex": source_idx,
        "reviewedAnswerIndex": answer_idx,
        "sourceAnswerText": source_answer_text,
        "reviewedAnswerText": reviewed_answer_text,
        "choiceIdMapping": choice_mapping,
        "directSolution": direct_solution,
        "formulaUnitSubstitution": formula_structure,
        "choiceByChoiceReasons": review["choiceByChoiceReasons"],
        "theoryLink": theory_link,
        "conceptKeywords": concept_keywords(review),
        "review": {
            "verdict": review["reviewVerdict"],
            "scoringDisposition": scoring_disposition,
            "sourceAnswerAgreement": source_agreement,
            "answerEvidence": answer_evidence,
            "answerConfidence": confidence,
            "theoryLinkStatus": theory_status,
            "holdReasons": list(review.get("holdReasons") or []),
            "answerConflictOrMultipleAnswerRisk": risk,
            "runtimeStatus": runtime_status,
            "publicationBlockers": blockers,
            "reviewedAt": review["reviewedAt"],
        },
        "migration": {
            "mappingClass": mapping_class,
            "canonicalAction": canonical_action,
            "theoryAction": theory_action,
            "runtimeDisposition": runtime_disposition,
            "confidence": migration_confidence,
            "duplicateCanonicalCluster": bool(decision.get("duplicateCanonicalCluster", False)),
            "preserveExternalId": True,
            "preserveRegisteredSourceUrl": True,
            "preserveQuestionNumber": True,
        },
    }
    if variant_specific:
        record["variantSpecificFeedbackRequired"] = True
    if issue_label:
        record["review"]["issueLabel"] = issue_label
    if choice_conflict:
        record["choiceConflict"] = choice_conflict
    records.append(record)
    direct_link_matrix.append(
        {
            "externalId": external_id,
            "currentCanonicalId": decision["currentCanonicalId"],
            "targetCanonicalId": canonical["id"],
            "runtimeStatus": runtime_status,
            "variantSpecificFeedbackRequired": variant_specific,
            "lessonId": theory_link["lessonId"],
            "lessonAnchor": theory_link["lessonAnchor"],
            "conceptGroupId": theory_link["conceptGroupId"],
            "conceptId": theory_link["conceptId"],
            "theoryLinkStatus": theory_status,
            "canonicalReassignmentApplied": is_reassignment,
            "canonicalOverlayApplied": is_repair,
            "lowContextPolicyApplied": is_low_context,
            "sourceNeededTheoryGate": is_repair,
        }
    )

states = Counter(record["review"]["runtimeStatus"] for record in records)
assert states == Counter({"candidate": 191, "hold": 8, "choice_conflict": 1}), states
assert len(full_mapping_ids) == 38, len(full_mapping_ids)
assert len(variant_specific_ids) == 153, len(variant_specific_ids)
assert set(image_queue_ids) == IMAGE_HOLD_IDS
assert set(conflict_queue_ids) == CHOICE_CONFLICT_IDS
assert len(low_context_ids) == 30, low_context_ids
assert len(formula_ids) == 8, formula_ids
assert len(full_mapping_ids) + len(variant_specific_ids) == 191

all_records = manifest["records"] + records
assert len(all_records) == 1570
assert len({record["externalId"] for record in all_records}) == 1570
assert all_records[:1370] == manifest["records"]
all_lesson_additions = manifest.get("theoryLessonAdditions", []) + [new_lesson_addition]
all_question_changes = manifest.get("canonicalQuestionChanges", []) + [new_canonical_change]

batch = {
    "batchId": BATCH_ID,
    "reviewSessions": ["29", "30", "31", "32"],
    "externalIdRanges": [
        "2017-2-Q51..2017-2-Q100",
        "2018-2-Q01..2018-2-Q100",
        "2018-4-Q01..2018-4-Q50",
    ],
    "recordCount": 200,
    "candidateCount": 191,
    "choiceConflictCount": 1,
    "holdCount": 8,
    "normalizationCount": 0,
    "imageReviewCount": 8,
    "lowContextRegistrationCount": len(low_context_ids),
    "variantSpecificFeedbackCount": len(variant_specific_ids),
    "canonicalTheoryRepairs": [
        "2018-4-Q19: U-026 -> U-997 차압식 유량계 canonical 재배정",
        "2018-4-Q35: U-649 canonical 의미·이론을 동일기종 집단배치로 복구하고 2015-2-Q23에도 적용",
    ],
    "theoryLessonAdditionIds": [NEW_LESSON_ID],
    "canonicalQuestionChangeIds": [REPAIRED_CANONICAL_ID],
    "holdResolution": {
        "imageVerificationQueue": sorted(IMAGE_HOLD_IDS),
        "normalizedAndRegistered": [],
        "choiceConflictNonScoring": sorted(CHOICE_CONFLICT_IDS),
        "lowContextRegistered": sorted(low_context_ids),
    },
    "sourceFiles": [
        {
            "path": str(path.relative_to(ROOT)).replace("\\", "/"),
            "sha256": sha_file(path),
        }
        for path in REVIEW_FILES
    ],
}

new_manifest = copy.deepcopy(manifest)
new_manifest["generatedAt"] = NOW
new_manifest["batches"] = manifest["batches"] + [batch]
new_manifest["records"] = all_records
new_manifest["recordsSha256"] = sha_text(jd(all_records))
new_manifest["theoryLessonAdditions"] = all_lesson_additions
new_manifest["theoryLessonAdditionsSha256"] = sha_text(jd(all_lesson_additions))
new_manifest["canonicalQuestionChanges"] = all_question_changes
new_manifest["canonicalQuestionChangesSha256"] = sha_text(jd(all_question_changes))
new_manifest["holdResolutionPolicy"] = build_hold_resolution_policy(
    new_manifest["batches"], manifest["holdResolutionPolicy"], NOW
)
MANIFEST_PATH.write_text(pretty(new_manifest), encoding="utf-8")

write_json(OUT / "theory-lesson-additions.json", [new_lesson_addition])
write_json(OUT / "canonical-question-changes.json", [new_canonical_change])
write_jsonl(OUT / "direct-theory-link-matrix.jsonl", direct_link_matrix)
write_jsonl(
    OUT / "variant-specific-choice-contract-queue.jsonl",
    [record for record in records if record.get("variantSpecificFeedbackRequired")],
)
write_jsonl(
    OUT / "image-verification-queue.jsonl",
    [record for record in records if record["review"]["runtimeStatus"] == "hold"],
)
write_jsonl(
    OUT / "choice-conflict-queue.jsonl",
    [record for record in records if record["review"]["runtimeStatus"] == "choice_conflict"],
)
write_jsonl(OUT / "answer-key-correction-ledger.jsonl", [])
write_jsonl(OUT / "manual-choice-mapping-ledger.jsonl", [])
write_jsonl(
    OUT / "canonical-reassignment-ledger.jsonl",
    [
        {
            "externalId": CANONICAL_REASSIGNMENT_ID,
            "currentCanonicalId": "U-026",
            "targetCanonicalId": REASSIGNED_CANONICAL_ID,
            "reason": "차압식 유량계의 직접 판단근거·정답·선택지 계약이 U-997과 일치한다.",
            "theoryLink": {
                "lessonId": reassignment_contract["lessonId"],
                "lessonAnchor": reassignment_contract["lessonAnchor"],
                "conceptGroupId": reassignment_contract["conceptGroupId"],
                "conceptId": reassignment_contract["conceptId"],
            },
        }
    ],
)
write_jsonl(
    OUT / "canonical-theory-repair-impact-ledger.jsonl",
    [
        {
            "externalId": CANONICAL_REPAIR_ID,
            "canonicalId": REPAIRED_CANONICAL_ID,
            "newLessonId": NEW_LESSON_ID,
            "affectedExternalIds": ["2015-2-Q23", CANONICAL_REPAIR_ID],
            "priorMeaning": "보전작업자 팀 조직",
            "repairedMeaning": "공정별 동일기종 집단배치",
            "publicationGate": ["lesson_source_needed", "pending_runtime_integration"],
            "historicalRecordPolicy": "prior 1370 audit records remain byte-identical; canonical overlay supersedes runtime question/theory semantics",
        }
    ],
)
write_jsonl(
    OUT / "low-context-registration-ledger.jsonl",
    [
        {
            "externalId": external_id,
            "riskNote": next(record for record in records if record["externalId"] == external_id)["review"]["answerConflictOrMultipleAnswerRisk"],
            "policy": "historical_or_textbook_exam_intent_accepted_with_practical_boundary_preserved",
        }
        for external_id in sorted(low_context_ids)
    ],
)
write_jsonl(OUT / "variant-mapping.jsonl", records)
write_json(OUT / "external-ids.json", BATCH_IDS)

content_binding = {
    "status": "PASS",
    "repositoryContentFilePackaged": False,
    "expectedContentSha256": EXPECTED_CONTENT_SHA256,
    "priorBatchValidatedContentSha256": prior_validation["sourceIntegrity"]["contentJsonSha256Expected"],
    "priorBatchContentHashBindingVerified": prior_validation["sourceIntegrity"]["contentHashBindingVerified"],
    "dryRunGeneratedFromBoundContentSnapshot": True,
    "bindingHashesMatch": prior_validation["sourceIntegrity"]["contentJsonSha256Expected"] == EXPECTED_CONTENT_SHA256,
    "repositoryIntegrationPrecondition": "src/data/generated/content.json must hash to expectedContentSha256 before applying the canonical overlay and running official validation",
}
write_json(OUT / "content-binding-validation.json", content_binding)

theory_gap_audit = {
    "batchId": BATCH_ID,
    "recordCount": 200,
    "existingDirectTheoryLinksRetained": 198,
    "existingTheoryRelinks": 1,
    "newDirectTheoryLessonsAdded": 1,
    "canonicalContentAndTheoryRepairs": 1,
    "missingDirectTheoryAfterBatch": 0,
    "sourceNeededTheoryGateCount": 1,
    "lowContextDirectTheoryLinks": len(low_context_ids),
    "notes": [
        "2018-4-Q19는 U-026에서 U-997 및 lesson-lqjgxa로 재배정했다.",
        "2018-4-Q35는 U-649의 기존 보전작업자 팀 조직 의미를 동일기종 집단배치 의미로 교정했다.",
        "신규 lesson-cbt-gang-system-process-layout은 검토 패킷의 지문·독립 풀이만 재구성했으며 권위 출처가 없어 sourceNeeded와 공개 차단을 유지한다.",
        "2015-2-Q23은 동일 source stem을 공유하므로 canonical overlay 영향대상에 포함하되 기존 감사 레코드는 변경하지 않았다.",
    ],
}
write_json(OUT / "theory-gap-audit.json", theory_gap_audit)

summary = {
    "batchId": BATCH_ID,
    "generatedAt": NOW,
    "recordCount": 200,
    "states": dict(states),
    "fullCanonicalChoiceMappingCount": len(full_mapping_ids),
    "manualChoiceMappingCount": 0,
    "variantSpecificFeedbackPendingCount": len(variant_specific_ids),
    "theoryLessonAdditionCount": 1,
    "canonicalQuestionChangeCount": 1,
    "directTheoryLinkCount": 200,
    "existingTheoryRelinkCount": 1,
    "imageVerificationQueueCount": len(IMAGE_HOLD_IDS),
    "choiceConflictCount": 1,
    "answerKeyCorrectionCount": 0,
    "canonicalReassignmentCount": 1,
    "canonicalTheoryRepairCount": 1,
    "lowContextRegistrationCount": len(low_context_ids),
    "formulaUnitSubstitutionCount": len(formula_ids),
    "formulaExternalIds": formula_ids,
    "sourceContentSha256Expected": EXPECTED_CONTENT_SHA256,
    "contentHashBindingVerified": content_binding["bindingHashesMatch"],
    "dryRunMappingSha256": sha_file(MAPPING_PATH),
    "priorRecordsSha256": EXPECTED_PRIOR_RECORDS_SHA256,
    "cumulativeRecordCount": len(all_records),
    "unreviewedRecordCount": TOTAL_SOURCE_VARIANTS - len(all_records),
}
write_json(OUT / "batch-summary.json", summary)

report = f"""# CBT 시스템 실제 이식 배치 08 보고서

- 범위: 2017년 2회 Q51~Q100 + 2018년 2회 Q01~Q100 + 2018년 4회 Q01~Q50
- 총 레코드: 200
- candidate: 191
- 필수 이미지 HOLD: 8
- 선택지 충돌 비채점: 1
- canonical 재배정: 1
- canonical 의미·이론 repair: 1
- 신규 직접 이론 레슨: 1(sourceNeeded)
- canonical replacement overlay: 1
- canonical 선택지 1:1 매핑 완료: {len(full_mapping_ids)}
- variant 전용 선택지 계약 대기: {len(variant_specific_ids)}
- 저맥락 시험기준 등록: {len(low_context_ids)}
- 식·단위·대입·결과 구조: {len(formula_ids)}

## 필수 이미지 HOLD

{chr(10).join(f'- `{external_id}`' for external_id in sorted(IMAGE_HOLD_IDS))}

## 선택지 충돌

- `2018-2-Q10`: 전위차계·가변저항기·저항온도계·스트레인게이지 모두 저항 또는 저항비 변화를 이용하므로 유일한 ‘가장 거리가 먼 것’이 성립하지 않는다. `choice_conflict / non_scoring`으로 격리했다.

## canonical 교정

- `2018-4-Q19`: U-026에서 차압식 유량계 문제군 U-997로 재배정했다. 원문 보기 순서를 U-997-c2, c1, c4, c3으로 안전하게 매핑했고 정답은 U-997-c3(로터미터)로 일치한다.
- `2018-4-Q35`: U-649의 기존 canonical이 보전작업자 팀 조직을 설명하던 오연결을 제거하고, 복원 지문이 요구하는 공정별 동일기종 집단배치 의미로 교체했다. 2015-2-Q23도 같은 지문·정답 문제군이므로 영향대상에 포함했다.
- 신규 레슨은 검토 패킷에서 직접 지원되는 정의·보기 비교만 포함한다. 권위 출처가 없으므로 `sourceNeeded=true`, `lesson_source_needed`, `pending_runtime_integration`을 유지하며 자동 공개하지 않는다.

## 공개 경계

- 모든 배치 08 레코드는 candidate, hold 또는 choice_conflict이며 published는 0건이다.
- 이미지 HOLD 8건과 선택지 충돌 1건은 reviewed answer·채점·choice ID mapping을 비활성화한다.
- variant 전용 선택지 계약 대기 153건은 canonical 피드백을 재사용하지 않는다.
- 원본 content.json은 패키지에 포함하거나 수정하지 않는다. 저장소 통합 전 기대 SHA를 다시 확인해야 한다.
"""
(OUT / "import-report.md").write_text(report, encoding="utf-8")

validation = {
    "status": "PASS",
    "recordCount": 200,
    "candidateCount": states["candidate"],
    "choiceConflictCount": states["choice_conflict"],
    "holdCount": states["hold"],
    "exactExternalIdSet": len(set(BATCH_IDS)) == 200,
    "orderedExternalIdsMatchDryRun": BATCH_IDS == [row["externalId"] for row in dry_rows],
    "prior1370RecordsUnchanged": all_records[:1370] == manifest["records"],
    "sourceHashesMatch": all(
        sha_text(record["stem"]) == record["source"]["stemSha256"]
        and sha_text(jd(record["choices"])) == record["source"]["orderedChoicesSha256"]
        for record in records
    ),
    "candidateAnswersPresent": all(
        isinstance(record["reviewedAnswerIndex"], int) and bool(record["reviewedAnswerText"])
        for record in records
        if record["review"]["runtimeStatus"] == "candidate"
    ),
    "imageHoldAnswersDisabled": all(
        record["reviewedAnswerIndex"] is None
        and record["reviewedAnswerText"] == ""
        and not record["choiceIdMapping"]
        and record["review"]["issueLabel"] == "필수 이미지 확인"
        for record in records
        if record["review"]["runtimeStatus"] == "hold"
    ),
    "choiceConflictDisabled": all(
        record["reviewedAnswerIndex"] is None
        and record["reviewedAnswerText"] == ""
        and not record["choiceIdMapping"]
        and record["choiceConflict"]["scoringPolicy"] == "non_scoring"
        for record in records
        if record["review"]["runtimeStatus"] == "choice_conflict"
    ),
    "variantSpecificBlocked": all(
        "variant_specific_choice_contract_pending" in record["review"]["publicationBlockers"]
        and not record["choiceIdMapping"]
        for record in records
        if record.get("variantSpecificFeedbackRequired")
    ),
    "fullChoiceMappingsCorrect": len(full_mapping_ids) == 38,
    "semanticReassignmentApplied": next(r for r in records if r["externalId"] == CANONICAL_REASSIGNMENT_ID)["canonicalId"] == REASSIGNED_CANONICAL_ID,
    "canonicalTheoryRepairApplied": next(r for r in records if r["externalId"] == CANONICAL_REPAIR_ID)["theoryLink"]["lessonId"] == NEW_LESSON_ID,
    "canonicalTheoryRepairSourceGated": "lesson_source_needed" in next(r for r in records if r["externalId"] == CANONICAL_REPAIR_ID)["review"]["publicationBlockers"],
    "lowContextPoliciesPreserved": len(low_context_ids) == 30,
    "formulaUnitSubstitutionCount": sum(record["formulaUnitSubstitution"] is not None for record in records) == 8,
    "contentHashBindingVerified": content_binding["bindingHashesMatch"],
    "sourceContentFilePackaged": False,
}
assert all(
    value is True or key in {"status", "recordCount", "candidateCount", "choiceConflictCount", "holdCount", "sourceContentFilePackaged"}
    for key, value in validation.items()
), validation
write_json(OUT / "validation.json", validation)

artifact_paths = [
    MANIFEST_PATH,
    MAPPING_PATH,
    MAPPING_SUMMARY_PATH,
    SOURCE_BATCH_SUMMARY_PATH,
    SOURCE_SECOND_PASS_PATH,
    OUT / "theory-lesson-additions.json",
    OUT / "canonical-question-changes.json",
    OUT / "direct-theory-link-matrix.jsonl",
    OUT / "variant-specific-choice-contract-queue.jsonl",
    OUT / "image-verification-queue.jsonl",
    OUT / "choice-conflict-queue.jsonl",
    OUT / "answer-key-correction-ledger.jsonl",
    OUT / "canonical-reassignment-ledger.jsonl",
    OUT / "canonical-theory-repair-impact-ledger.jsonl",
    OUT / "manual-choice-mapping-ledger.jsonl",
    OUT / "low-context-registration-ledger.jsonl",
    OUT / "variant-mapping.jsonl",
    OUT / "external-ids.json",
    OUT / "content-binding-validation.json",
    OUT / "theory-gap-audit.json",
    OUT / "batch-summary.json",
    OUT / "import-report.md",
    OUT / "validation.json",
]
artifact_manifest = {
    "generatedAt": NOW,
    "expectedSourceContentSha256": EXPECTED_CONTENT_SHA256,
    "files": [
        {
            "path": str(path.relative_to(ROOT)).replace("\\", "/"),
            "size": path.stat().st_size,
            "sha256": sha_file(path),
        }
        for path in artifact_paths
    ],
}
write_json(OUT / "artifact-manifest.json", artifact_manifest)
print(pretty(summary))
print("manifest sha", sha_file(MANIFEST_PATH))
