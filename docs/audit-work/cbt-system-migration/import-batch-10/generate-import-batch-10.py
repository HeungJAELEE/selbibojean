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
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-10"
REVIEW_DIR = ROOT / "docs/audit-work/cbt-source-reviews/final"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
PRIOR_VALIDATION_PATH = ROOT / "docs/audit-work/cbt-system-migration/import-batch-09/final-validation.json"
MAPPING_PATH = OUT / "mapping-dry-run-input.jsonl"
MAPPING_SUMMARY_PATH = OUT / "mapping-source-summary.json"
SOURCE_BATCH_SUMMARY_PATH = OUT / "source-batch-summary.json"
SOURCE_SECOND_PASS_PATH = OUT / "source-second-pass-validation.json"
CANONICAL_REFERENCE_PATH = OUT / "canonical-reference-ledger.jsonl"

REVIEW_FILES = [
    REVIEW_DIR / "de20190427_q51-q100_independent-review.jsonl",
    REVIEW_DIR / "de20200606_q01-q50_independent-review.jsonl",
    REVIEW_DIR / "de20200606_q51-q100_independent-review.jsonl",
    REVIEW_DIR / "de20200822_q01-q50_independent-review.jsonl",
]

NOW = "2026-08-08T20:40:00+09:00"
BATCH_ID = "import-10"
SYMBOLS = ["①", "②", "③", "④", "⑤"]
EXPECTED_CONTENT_SHA256 = "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"
EXPECTED_DRYRUN_SHA256 = "6a03617e3c2c36973c08b36bdd7c6119c5a73974c9fb2cf641cff246d00c21fc"
EXPECTED_CANONICAL_REFERENCE_SHA256 = "e7deabe7dd47bc328c81fa17cd1428885ab7abaf8f6886dc40eb02f2f800c30e"
EXPECTED_PRIOR_RECORDS_SHA256 = "3e10c692103b8e5e3297b3fec0e6f20f45ef061f21f8b0b21e15e13b5dbe168a"
EXPECTED_PRIOR_MANIFEST_SHA256 = "6deeb56ea7bca091eb33bf7f3fe5c582c66d438e5df42ded9a90854074da0d4a"
TOTAL_SOURCE_VARIANTS = 2384
PRIOR_RECORD_COUNT = 1770
BATCH_RECORD_COUNT = 200

IMAGE_HOLD_IDS = {
    "2019-2-Q94",
    "2019-2-Q99",
    "2020-12B-Q05",
    "2020-12B-Q08",
    "2020-12B-Q10",
    "2020-12B-Q85",
    "2020-12B-Q87",
    "2020-3B-Q04",
    "2020-3B-Q14",
    "2020-3B-Q39",
}
CHOICE_CONFLICT_IDS = {"2019-2-Q86", "2020-12B-Q92"}
CHOICE_CONFLICT_INDICES = {
    "2019-2-Q86": [0, 3],
    "2020-12B-Q92": [2, 3],
}
ANSWER_KEY_CONFLICT_ID = "2020-3B-Q28"
CANONICAL_REASSIGNMENTS = {
    "2020-12B-Q75": ("U-325", "U-787", "2017-2-Q64"),
    "2020-3B-Q26": ("U-060", "U-1109", "2012-4-Q40"),
}
CANONICAL_REPAIR_ID = "2020-12B-Q86"
REPAIRED_CANONICAL_ID = "U-478"
REPAIRED_CONCEPT_GROUP_ID = "s1-g06"
REPAIRED_LESSON_ID = "lesson-qnsesu"
REPAIRED_LESSON_ANCHOR = "trap"
REPAIRED_CONCEPT_ID = "concept-qnsesu"
REPAIR_AFFECTED_EXTERNAL_IDS = ["2007-4-Q84", CANONICAL_REPAIR_ID]


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
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(pretty(value), encoding="utf-8")


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
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


def canonical_contract(reference: dict[str, Any], *, theory_override: dict[str, str] | None = None) -> dict[str, Any]:
    canonical_id = reference["canonicalId"]
    theory = theory_override or reference["canonicalTheoryLink"]
    return {
        "id": canonical_id,
        "stem": reference["canonicalStem"],
        "choices": [
            {"id": f"{canonical_id}-c{idx + 1}", "text": text}
            for idx, text in enumerate(reference["canonicalChoices"])
        ],
        "correctChoiceId": f"{canonical_id}-c{reference['canonicalAnswerIndex'] + 1}",
        **theory,
    }


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


def make_repair_feedback(
    canonical_text: str,
    review_item: dict[str, Any],
    is_correct: bool,
    direct_solution: str,
) -> dict[str, Any]:
    if is_correct:
        return {
            "rationale": review_item["reason"],
            "plausibleReason": "텔레스코프 실린더의 다단 구조와 긴 행정 특성을 함께 고려한다.",
            "incorrectPoint": None,
            "keyRule": direct_solution,
            "differenceFromCorrect": None,
        }
    return {
        "rationale": review_item["reason"],
        "plausibleReason": f"‘{canonical_text}’는 텔레스코프 실린더와 관련된 설명이지만 문두의 예외 조건을 충족하지 않는다.",
        "incorrectPoint": review_item["reason"],
        "keyRule": direct_solution,
        "differenceFromCorrect": "정답은 다단별 유효면적과 속도 차이 때문에 정밀한 중간위치 제어에 가장 적합하다고 볼 수 없다는 점이다.",
    }


OUT.mkdir(parents=True, exist_ok=True)
manifest = read_json(MANIFEST_PATH)
prior_manifest_text = MANIFEST_PATH.read_text(encoding="utf-8")
prior_validation = read_json(PRIOR_VALIDATION_PATH)
mapping_summary = read_json(MAPPING_SUMMARY_PATH)
source_batch_summary = read_json(SOURCE_BATCH_SUMMARY_PATH)
source_second_pass = read_json(SOURCE_SECOND_PASS_PATH)
dry_rows = read_jsonl(MAPPING_PATH)
dry_by_id = {row["externalId"]: row for row in dry_rows}
canonical_references = read_jsonl(CANONICAL_REFERENCE_PATH)
canonical_reference_by_id = {row["canonicalId"]: row for row in canonical_references}

assert sha_file(MAPPING_PATH) == EXPECTED_DRYRUN_SHA256
assert sha_file(CANONICAL_REFERENCE_PATH) == EXPECTED_CANONICAL_REFERENCE_SHA256
has_existing_batch10 = any(
    batch.get("batchId") == BATCH_ID for batch in manifest.get("batches", [])
)
if not has_existing_batch10:
    assert sha_text(prior_manifest_text) == EXPECTED_PRIOR_MANIFEST_SHA256
assert prior_validation["sourceIntegrity"]["contentJsonSha256Expected"] == EXPECTED_CONTENT_SHA256
assert prior_validation["sourceIntegrity"]["contentHashBindingVerified"] is True
assert prior_validation["sourceIntegrity"]["recordsSha256"] == EXPECTED_PRIOR_RECORDS_SHA256
assert source_batch_summary["status"] == "PASS"
assert source_second_pass["status"] == "PASS"
assert mapping_summary["recordCount"] == BATCH_RECORD_COUNT
assert mapping_summary["semanticReassignmentCount"] == 2
assert mapping_summary["relinkInPlaceCount"] == 1
assert mapping_summary["holdCount"] == 13
assert set(canonical_reference_by_id) == {"U-478", "U-787", "U-1109"}

# Idempotent regeneration owns batch 10 records and the U-478 canonical taxonomy overlay.
if any(batch.get("batchId") == BATCH_ID for batch in manifest.get("batches", [])):
    owned_ids = {row["externalId"] for row in dry_rows}
    manifest = copy.deepcopy(manifest)
    manifest["batches"] = [b for b in manifest["batches"] if b.get("batchId") != BATCH_ID]
    manifest["records"] = [r for r in manifest["records"] if r["externalId"] not in owned_ids]
    manifest["canonicalQuestionChanges"] = [
        change
        for change in manifest.get("canonicalQuestionChanges", [])
        if change["question"]["id"] != REPAIRED_CANONICAL_ID
    ]
    manifest["recordsSha256"] = sha_text(jd(manifest["records"]))
    manifest["canonicalQuestionChangesSha256"] = sha_text(jd(manifest["canonicalQuestionChanges"]))
    manifest["theoryLessonAdditionsSha256"] = sha_text(jd(manifest.get("theoryLessonAdditions", [])))

assert len(manifest["records"]) == PRIOR_RECORD_COUNT
assert manifest["recordsSha256"] == EXPECTED_PRIOR_RECORDS_SHA256
assert len({record["externalId"] for record in manifest["records"]}) == PRIOR_RECORD_COUNT
assert REPAIRED_CANONICAL_ID not in {
    change["question"]["id"] for change in manifest.get("canonicalQuestionChanges", [])
}

review_rows: list[dict[str, Any]] = []
for path in REVIEW_FILES:
    review_rows.extend(read_jsonl(path))
review_by_id = {row["externalId"]: row for row in review_rows}
BATCH_IDS = [row["externalId"] for row in dry_rows]

assert len(BATCH_IDS) == len(set(BATCH_IDS)) == BATCH_RECORD_COUNT
assert set(BATCH_IDS) == set(review_by_id)
assert BATCH_IDS[0] == "2019-2-Q51"
assert BATCH_IDS[-1] == "2020-3B-Q50"
assert Counter(row["reviewVerdict"] for row in review_rows) == Counter(
    {"ACCEPT": 187, "HOLD": 10, "CHOICE_ISSUE": 2, "REVISE": 1}
)
assert Counter(row["decision"]["mappingClass"] for row in dry_rows) == Counter(
    {"EXACT_REPLACE": 185, "HOLD": 13, "SEMANTIC_REPLACE": 2}
)
assert {r["externalId"] for r in review_rows if r["reviewVerdict"] == "HOLD"} == IMAGE_HOLD_IDS
assert {r["externalId"] for r in review_rows if r["reviewVerdict"] == "CHOICE_ISSUE"} == CHOICE_CONFLICT_IDS
assert {r["externalId"] for r in review_rows if r["reviewVerdict"] == "REVISE"} == {ANSWER_KEY_CONFLICT_ID}

prior_changed_canonicals = {
    change["question"]["id"] for change in manifest.get("canonicalQuestionChanges", [])
}
assert not {"U-478", "U-787", "U-1109"} & prior_changed_canonicals

reassignment_contracts = {
    canonical_id: canonical_contract(canonical_reference_by_id[canonical_id])
    for canonical_id in ["U-787", "U-1109"]
}
repair_reference = canonical_reference_by_id[REPAIRED_CANONICAL_ID]
repair_contract = canonical_contract(
    repair_reference,
    theory_override={
        "lessonId": REPAIRED_LESSON_ID,
        "lessonAnchor": REPAIRED_LESSON_ANCHOR,
        "conceptGroupId": REPAIRED_CONCEPT_GROUP_ID,
        "conceptId": REPAIRED_CONCEPT_ID,
    },
)
repair_review = review_by_id[CANONICAL_REPAIR_ID]
assert repair_review["independentAnswerIndex"] == 1
assert repair_review["theoryLink"]["lessonId"] == REPAIRED_LESSON_ID
assert repair_review["theoryLink"]["lessonAnchor"] == REPAIRED_LESSON_ANCHOR
assert repair_review["theoryLink"]["conceptGroupId"] == REPAIRED_CONCEPT_GROUP_ID
assert repair_review["theoryLink"]["conceptId"] == REPAIRED_CONCEPT_ID

repair_question_choices = []
for idx, choice in enumerate(repair_contract["choices"]):
    repair_question_choices.append(
        {
            "id": choice["id"],
            "order": idx + 1,
            "text": choice["text"],
            "feedback": make_repair_feedback(
                choice["text"],
                repair_review["choiceByChoiceReasons"][idx],
                idx == 1,
                repair_review["directSolution"].strip(),
            ),
        }
    )

previous_repair_contract = {
    "id": REPAIRED_CANONICAL_ID,
    "stem": repair_reference["canonicalStem"],
    "choices": repair_reference["canonicalChoices"],
    "answerIndex": repair_reference["canonicalAnswerIndex"],
    "theoryLink": repair_reference["canonicalTheoryLink"],
}
new_canonical_change = {
    "action": "replace",
    "question": {
        "id": REPAIRED_CANONICAL_ID,
        "canonicalNumber": 478,
        "subjectId": "subject-1",
        "conceptGroupId": REPAIRED_CONCEPT_GROUP_ID,
        "conceptId": REPAIRED_CONCEPT_ID,
        "lessonId": REPAIRED_LESSON_ID,
        "lessonAnchor": REPAIRED_LESSON_ANCHOR,
        "stem": repair_contract["stem"],
        "choices": repair_question_choices,
        "correctChoiceId": repair_contract["correctChoiceId"],
        "answerText": repair_contract["choices"][1]["text"],
        "explanation": repair_review["directSolution"].strip(),
        "errorReason": "canonical conceptGroup taxonomy 오연결 교정",
        "sourceLabel": repair_review["identity"]["registeredSourceUrl"],
        "reviewStatus": "배치 10 독립 풀이 및 dry-run taxonomy repair 검수",
        "contentStatus": "in_review",
        "publication": {
            "readiness": "blocked",
            "blockers": [
                "pending_runtime_integration",
                "canonical_theory_repair_runtime_validation",
            ],
        },
        "verification": {
            "status": "blocked",
            "method": "review_packet_and_dry_run_taxonomy_repair_pending_runtime_validation",
            "variantCount": 2,
            "sourceUrls": [
                "https://cbtbank.kr/exam/de20070902",
                repair_review["identity"]["registeredSourceUrl"],
            ],
            "riskTags": ["taxonomy_repair", "canonical_overlay", "runtime_validation_pending"],
            "note": "canonical 문항·정답은 유지하고 텔레스코프 실린더를 액추에이터 개념군 s1-g06으로 재연결한다.",
            "reviewedAt": NOW,
        },
        "audit": {
            "questionId": REPAIRED_CANONICAL_ID,
            "scope": "review_queue",
            "sourceContentStatus": "in_review",
            "auditDisposition": "held_runtime_validation_pending",
            "evidenceLevel": None,
            "cbtAnswer": repair_review["sourceExactChoices"][repair_review["sourceAnswerIndex"]],
            "verifiedAnswer": repair_review["sourceExactChoices"][repair_review["independentAnswerIndex"]],
            "evidenceUrls": [repair_review["identity"]["registeredSourceUrl"]],
            "reviewNote": "문항 의미와 정답은 유지하며 conceptGroup만 s1-g02에서 s1-g06으로 교정한다.",
            "assetStatus": "not_required",
            "nextAction": "전체 저장소 런타임·Supabase·브라우저 검증 후 공개 심사",
            "reviewChoiceFeedback": [
                {
                    "choiceId": repair_question_choices[idx]["id"],
                    "verdict": "correct" if idx == 1 else "incorrect",
                    "rationale": repair_review["choiceByChoiceReasons"][idx]["reason"],
                }
                for idx in range(4)
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
    "previousQuestionSha256": sha_text(jd(previous_repair_contract)),
    "previousQuestionHashBasis": "dry_run_canonical_reference_contract",
    "affectedExternalIds": REPAIR_AFFECTED_EXTERNAL_IDS,
    "rationale": "U-478의 문항·정답은 유지하고 conceptGroup을 유압 동력원과 액추에이터(s1-g02)에서 액추에이터(s1-g06)로 교정한다.",
}

records: list[dict[str, Any]] = []
direct_link_matrix: list[dict[str, Any]] = []
full_mapping_ids: list[str] = []
variant_specific_ids: list[str] = []
image_queue_ids: list[str] = []
conflict_queue_ids: list[str] = []
answer_key_conflict_ids: list[str] = []
low_context_ids: list[str] = []
formula_ids: list[str] = []
reassignment_ids: list[str] = []

for external_id in BATCH_IDS:
    review = review_by_id[external_id]
    dry = dry_by_id[external_id]
    current = dry["currentSystem"]
    decision = dry["decision"]
    source_choices = list(review["sourceExactChoices"])
    source_idx = review.get("sourceAnswerIndex")
    is_image_hold = external_id in IMAGE_HOLD_IDS
    is_conflict = external_id in CHOICE_CONFLICT_IDS
    is_answer_key_conflict = external_id == ANSWER_KEY_CONFLICT_ID
    is_reassignment = external_id in CANONICAL_REASSIGNMENTS
    is_repair = external_id == CANONICAL_REPAIR_ID

    target_canonical_id = decision.get("targetCanonicalId") or decision["currentCanonicalId"]
    if is_reassignment:
        expected_current, expected_target, _ = CANONICAL_REASSIGNMENTS[external_id]
        assert decision["currentCanonicalId"] == expected_current
        assert target_canonical_id == expected_target
        canonical = reassignment_contracts[expected_target]
        reassignment_ids.append(external_id)
    elif is_repair:
        assert target_canonical_id == REPAIRED_CANONICAL_ID
        canonical = repair_contract
    else:
        assert target_canonical_id == decision["currentCanonicalId"]
        canonical = {
            "id": target_canonical_id,
            "stem": current["canonicalStem"],
            "choices": [
                {"id": f"{target_canonical_id}-c{idx + 1}", "text": text}
                for idx, text in enumerate(current["canonicalChoices"])
            ],
            "correctChoiceId": f"{target_canonical_id}-c{current['canonicalAnswerIndex'] + 1}",
            **decision["targetCanonicalTheoryLink"],
        }

    answer_idx = None if (is_image_hold or is_conflict or is_answer_key_conflict) else review.get("independentAnswerIndex")
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

    if is_image_hold or is_conflict or is_answer_key_conflict:
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
        theory_status = "direct_existing_theory_image_audit_only"
    elif is_conflict:
        conflict_queue_ids.append(external_id)
        runtime_status = "choice_conflict"
        scoring_disposition = "non_scoring"
        source_agreement = review.get("sourceAnswerAgreement") or "source_key_not_usable"
        answer_evidence = "independent_choice_set_conflict"
        confidence = review.get("answerConfidence") or "confirmed"
        blockers = ["choice_conflict_non_scoring"]
        risk = review["directSolution"].strip()
        issue_label = "선택지 충돌"
        mapping_class = "CHOICE_CONFLICT_NON_SCORING"
        canonical_action = "PRESERVE_CURRENT_MAPPING_PENDING_REVIEW"
        theory_action = "PRESERVE_CONFLICT_THEORY_ONLY"
        runtime_disposition = "CHOICE_CONFLICT_NON_SCORING"
        migration_confidence = "high"
        theory_status = "direct_existing_theory_choice_conflict_audit_only"
    elif is_answer_key_conflict:
        answer_key_conflict_ids.append(external_id)
        runtime_status = "hold"
        scoring_disposition = "excluded_answer_key_conflict"
        source_agreement = review.get("sourceAnswerAgreement") or "disagrees"
        answer_evidence = review.get("answerEvidence") or "independent_technical_solution_conflicts_with_reconstructed_key"
        confidence = review.get("answerConfidence") or "confirmed"
        blockers = [
            "answer_key_correction_pending_runtime_validation",
            *list(review.get("publicationBlockers") or []),
        ]
        blockers = list(dict.fromkeys(blockers))
        risk = review["directSolution"].strip()
        issue_label = "정답키 충돌"
        mapping_class = "ANSWER_KEY_CONFLICT_HOLD"
        canonical_action = "PRESERVE_CURRENT_MAPPING_PENDING_REVIEW"
        theory_action = "PRESERVE_AUDIT_THEORY_ONLY"
        runtime_disposition = "ANSWER_KEY_CORRECTION_QUEUE"
        migration_confidence = "high"
        theory_status = "direct_existing_theory_answer_key_conflict_pending"
    else:
        runtime_status = "candidate"
        scoring_disposition = "scored_after_canonical_theory_repair" if is_repair else "scored"
        source_agreement = review.get("sourceAnswerAgreement") or "agrees"
        answer_evidence = review.get("answerEvidence") or "independently_solved"
        confidence = review.get("answerConfidence") or "confirmed"
        blockers = ["pending_runtime_integration"]
        if variant_specific:
            blockers.append("variant_specific_choice_contract_pending")
        risk = review.get("riskNote") or "없음. 독립 풀이와 복원 정답이 일치한다."
        issue_label = None
        mapping_class = decision["mappingClass"]
        canonical_action = (
            "REASSIGN_CANONICAL"
            if is_reassignment
            else "APPLY_CANONICAL_OVERLAY"
            if is_repair
            else "KEEP_CURRENT_CANONICAL"
        )
        theory_action = (
            "USE_TARGET_CANONICAL_DIRECT_THEORY"
            if is_reassignment
            else "RELINK_CANONICAL_TO_EXISTING_THEORY_GROUP"
            if is_repair
            else "USE_DIRECT_EXISTING_THEORY"
        )
        runtime_disposition = (
            "CANDIDATE_AFTER_CANONICAL_THEORY_REPAIR"
            if is_repair
            else "PUBLICATION_CANDIDATE_WITH_VARIANT_CHOICE_CONTRACT_PENDING"
            if variant_specific
            else "PUBLICATION_CANDIDATE"
        )
        migration_confidence = "high"
        theory_status = (
            "direct_existing_theory_canonical_taxonomy_repair"
            if is_repair
            else "direct_existing_theory_reassigned_canonical"
            if is_reassignment
            else "direct_existing_theory"
        )

    is_low_context = bool(review.get("riskNote")) and runtime_status == "candidate"
    if is_low_context:
        low_context_ids.append(external_id)
        if not is_reassignment and not is_repair:
            theory_status = "direct_existing_theory_low_context_exam_intent"

    if not is_reassignment and not is_repair:
        reviewed_theory = review["theoryLink"]
        for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"]:
            assert reviewed_theory[key] == canonical[key], (external_id, key, reviewed_theory[key], canonical[key])

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
            "choiceIndices": CHOICE_CONFLICT_INDICES[external_id],
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
            "sourceNeededTheoryGate": False,
            "answerKeyConflictPending": is_answer_key_conflict,
        }
    )

states = Counter(record["review"]["runtimeStatus"] for record in records)
assert states == Counter({"candidate": 187, "hold": 11, "choice_conflict": 2}), states
assert len(full_mapping_ids) == 39, full_mapping_ids
assert len(variant_specific_ids) == 148, len(variant_specific_ids)
assert set(image_queue_ids) == IMAGE_HOLD_IDS
assert set(conflict_queue_ids) == CHOICE_CONFLICT_IDS
assert answer_key_conflict_ids == [ANSWER_KEY_CONFLICT_ID]
assert set(reassignment_ids) == set(CANONICAL_REASSIGNMENTS)
assert len(low_context_ids) == 31, low_context_ids
assert len(formula_ids) == 7, formula_ids
assert len(full_mapping_ids) + len(variant_specific_ids) == 187

all_records = manifest["records"] + records
assert len(all_records) == 1970
assert len({record["externalId"] for record in all_records}) == 1970
assert all_records[:PRIOR_RECORD_COUNT] == manifest["records"]
all_lesson_additions = manifest.get("theoryLessonAdditions", [])
all_question_changes = manifest.get("canonicalQuestionChanges", []) + [new_canonical_change]

batch = {
    "batchId": BATCH_ID,
    "reviewSessions": ["37", "38", "39", "40"],
    "externalIdRanges": [
        "2019-2-Q51..2019-2-Q100",
        "2020-12B-Q01..2020-12B-Q100",
        "2020-3B-Q01..2020-3B-Q50",
    ],
    "recordCount": 200,
    "candidateCount": 187,
    "choiceConflictCount": 2,
    "holdCount": 11,
    "normalizationCount": 0,
    "imageReviewCount": 10,
    "lowContextRegistrationCount": len(low_context_ids),
    "variantSpecificFeedbackCount": len(variant_specific_ids),
    "canonicalTheoryRepairs": [
        "2020-12B-Q75: U-325 -> U-787 우발고장기 윤활보전 canonical 재배정",
        "2020-3B-Q26: U-060 -> U-1109 속도저하로스 canonical 재배정",
        "2020-12B-Q86: U-478 conceptGroup s1-g02 -> s1-g06 taxonomy repair",
    ],
    "theoryLessonAdditionIds": [],
    "canonicalQuestionChangeIds": [REPAIRED_CANONICAL_ID],
    "holdResolution": {
        "imageVerificationQueue": sorted(IMAGE_HOLD_IDS),
        "normalizedAndRegistered": [],
        "choiceConflictNonScoring": sorted(CHOICE_CONFLICT_IDS),
        "lowContextRegistered": sorted(low_context_ids),
        "answerKeyCorrectionPending": [ANSWER_KEY_CONFLICT_ID],
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

write_json(OUT / "theory-lesson-additions.json", [])
write_json(OUT / "canonical-question-changes.json", [new_canonical_change])
write_jsonl(OUT / "direct-theory-link-matrix.jsonl", direct_link_matrix)
write_jsonl(
    OUT / "variant-specific-choice-contract-queue.jsonl",
    [record for record in records if record.get("variantSpecificFeedbackRequired")],
)
write_jsonl(
    OUT / "image-verification-queue.jsonl",
    [
        record
        for record in records
        if record["review"]["runtimeStatus"] == "hold"
        and record["review"].get("issueLabel") == "필수 이미지 확인"
    ],
)
write_jsonl(
    OUT / "choice-conflict-queue.jsonl",
    [record for record in records if record["review"]["runtimeStatus"] == "choice_conflict"],
)
write_jsonl(
    OUT / "answer-key-conflict-queue.jsonl",
    [record for record in records if record["externalId"] == ANSWER_KEY_CONFLICT_ID],
)
write_jsonl(
    OUT / "answer-key-correction-ledger.jsonl",
    [
        {
            "externalId": ANSWER_KEY_CONFLICT_ID,
            "sourceAnswerIndex": review_by_id[ANSWER_KEY_CONFLICT_ID]["sourceAnswerIndex"],
            "independentAnswerIndex": review_by_id[ANSWER_KEY_CONFLICT_ID]["independentAnswerIndex"],
            "sourceAnswerText": review_by_id[ANSWER_KEY_CONFLICT_ID]["sourceExactChoices"][review_by_id[ANSWER_KEY_CONFLICT_ID]["sourceAnswerIndex"]],
            "independentAnswerText": review_by_id[ANSWER_KEY_CONFLICT_ID]["sourceExactChoices"][review_by_id[ANSWER_KEY_CONFLICT_ID]["independentAnswerIndex"]],
            "applied": False,
            "runtimeStatus": "hold",
            "reason": review_by_id[ANSWER_KEY_CONFLICT_ID]["directSolution"].strip(),
            "publicationGate": [
                "answer_key_correction_pending_runtime_validation",
                *list(review_by_id[ANSWER_KEY_CONFLICT_ID].get("publicationBlockers") or []),
            ],
        }
    ],
)
write_jsonl(OUT / "manual-choice-mapping-ledger.jsonl", [])
write_jsonl(
    OUT / "canonical-reassignment-ledger.jsonl",
    [
        {
            "externalId": external_id,
            "currentCanonicalId": current_id,
            "targetCanonicalId": target_id,
            "duplicateOfExternalId": duplicate_id,
            "reason": dry_by_id[external_id]["decision"]["reasons"][0],
            "theoryLink": {
                "lessonId": reassignment_contracts[target_id]["lessonId"],
                "lessonAnchor": reassignment_contracts[target_id]["lessonAnchor"],
                "conceptGroupId": reassignment_contracts[target_id]["conceptGroupId"],
                "conceptId": reassignment_contracts[target_id]["conceptId"],
            },
            "choiceContract": (
                "canonical_choice_mapping_complete"
                if next(record for record in records if record["externalId"] == external_id)["choiceIdMapping"]
                else "variant_specific_choice_contract_pending"
            ),
        }
        for external_id, (current_id, target_id, duplicate_id) in CANONICAL_REASSIGNMENTS.items()
    ],
)
write_jsonl(
    OUT / "canonical-theory-repair-ledger.jsonl",
    [
        {
            "externalId": CANONICAL_REPAIR_ID,
            "canonicalId": REPAIRED_CANONICAL_ID,
            "priorTheoryLink": repair_reference["canonicalTheoryLink"],
            "repairedTheoryLink": {
                "lessonId": REPAIRED_LESSON_ID,
                "lessonAnchor": REPAIRED_LESSON_ANCHOR,
                "conceptGroupId": REPAIRED_CONCEPT_GROUP_ID,
                "conceptId": REPAIRED_CONCEPT_ID,
            },
            "contentChange": "none_semantic_equivalent_canonical_text_preserved",
            "reason": "텔레스코프 실린더는 액추에이터 개념군 s1-g06에 속하며 기존 s1-g02 연결은 taxonomy 오연결이다.",
            "publicationGate": [
                "pending_runtime_integration",
                "canonical_theory_repair_runtime_validation",
            ],
        }
    ],
)
write_jsonl(
    OUT / "canonical-theory-repair-impact-ledger.jsonl",
    [
        {
            "canonicalId": REPAIRED_CANONICAL_ID,
            "affectedExternalIds": REPAIR_AFFECTED_EXTERNAL_IDS,
            "priorConceptGroupId": repair_reference["canonicalTheoryLink"]["conceptGroupId"],
            "repairedConceptGroupId": REPAIRED_CONCEPT_GROUP_ID,
            "lessonId": REPAIRED_LESSON_ID,
            "historicalRecordPolicy": "prior 1770 audit records remain byte-identical; canonical overlay supersedes runtime question taxonomy",
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
    "repositoryIntegrationPrecondition": "src/data/generated/content.json must hash to expectedContentSha256 before applying the overlay and running official validation",
}
write_json(OUT / "content-binding-validation.json", content_binding)

theory_gap_audit = {
    "batchId": BATCH_ID,
    "recordCount": 200,
    "existingDirectTheoryLinksRetained": 197,
    "existingTheoryRelinks": 3,
    "newDirectTheoryLessonsAdded": 0,
    "canonicalContentAndTheoryRepairs": 1,
    "missingDirectTheoryAfterBatch": 0,
    "sourceNeededTheoryGateCount": 0,
    "lowContextDirectTheoryLinks": len(low_context_ids),
    "notes": [
        "2020-12B-Q75는 U-325에서 U-787 및 lesson-1kx5x2w로 재배정했다.",
        "2020-3B-Q26은 U-060에서 U-1109 및 lesson-c16ieq로 재배정했다.",
        "2020-12B-Q86은 기존 lesson-qnsesu를 유지하면서 conceptGroup을 s1-g02에서 s1-g06으로 교정했다.",
        "2020-3B-Q28은 독립 정답 4번과 복원 정답 1번이 충돌해 직접 이론은 감사용으로 보존하되 정답·채점은 차단했다.",
        "신규 이론 레슨은 필요하지 않았고 직접 이론 미연결은 0건이다.",
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
    "theoryLessonAdditionCount": 0,
    "canonicalQuestionChangeCount": 1,
    "directTheoryLinkCount": 200,
    "existingTheoryRelinkCount": 3,
    "imageVerificationQueueCount": len(IMAGE_HOLD_IDS),
    "choiceConflictCount": len(CHOICE_CONFLICT_IDS),
    "answerKeyCorrectionCount": 0,
    "answerKeyConflictCount": 1,
    "canonicalReassignmentCount": len(CANONICAL_REASSIGNMENTS),
    "canonicalTheoryRepairCount": 1,
    "lowContextRegistrationCount": len(low_context_ids),
    "formulaUnitSubstitutionCount": len(formula_ids),
    "formulaExternalIds": formula_ids,
    "sourceContentSha256Expected": EXPECTED_CONTENT_SHA256,
    "contentHashBindingVerified": content_binding["bindingHashesMatch"],
    "dryRunMappingSha256": sha_file(MAPPING_PATH),
    "canonicalReferenceSha256": sha_file(CANONICAL_REFERENCE_PATH),
    "priorRecordsSha256": EXPECTED_PRIOR_RECORDS_SHA256,
    "cumulativeRecordCount": len(all_records),
    "unreviewedRecordCount": TOTAL_SOURCE_VARIANTS - len(all_records),
}
write_json(OUT / "batch-summary.json", summary)

report = f"""# CBT 시스템 실제 이식 배치 10 보고서

- 범위: 2019년 2회 Q51~Q100 + 2020년 1·2회 B형 Q01~Q100 + 2020년 3회 B형 Q01~Q50
- 총 레코드: 200
- candidate: 187
- 필수 이미지 HOLD: 10
- 정답키 충돌 HOLD: 1
- 선택지 충돌 비채점: 2
- canonical 재배정: 2
- canonical taxonomy repair: 1
- 신규 직접 이론 레슨: 0
- canonical replacement overlay: 1
- canonical 선택지 1:1 매핑 완료: {len(full_mapping_ids)}
- variant 전용 선택지 계약 대기: {len(variant_specific_ids)}
- 저맥락 시험기준 등록: {len(low_context_ids)}
- 식·단위·대입·결과 구조: {len(formula_ids)}

## 필수 이미지 HOLD

{chr(10).join(f'- `{external_id}`' for external_id in sorted(IMAGE_HOLD_IDS))}

## 선택지 충돌

- `2019-2-Q86`: SVRDY 설명과 PTP 설명이 모두 틀려 1번과 4번이 동시에 오답이다. 단일정답 채점에서 제외한다.
- `2020-12B-Q92`: 원문 최종답안 자체가 3번과 4번을 복수정답으로 처리했으므로 단일정답 채점에서 제외한다.

## 정답키 충돌

- `2020-3B-Q28`: 복원 정답은 1번이나 독립 기술 풀이에서는 4번이다. 검토 패킷도 REVISE·hold로 판정했으므로 독립 답안을 자동 적용하지 않고 `answer_key_correction_pending_runtime_validation` 상태로 격리한다.

## canonical 교정

- `2020-12B-Q75`: U-325에서 우발고장기 윤활보전 문제군 U-787로 재배정한다.
- `2020-3B-Q26`: U-060에서 속도저하로스 문제군 U-1109로 재배정한다.
- `2020-12B-Q86`: U-478의 문항·정답·기존 lesson-qnsesu는 유지하고 conceptGroup만 s1-g02에서 액추에이터 s1-g06으로 교정한다. 기존 `2007-4-Q84` 감사 레코드는 바이트 불변으로 유지하며 runtime canonical overlay가 taxonomy를 대체한다.

## 공개 경계

- 모든 배치 10 레코드는 candidate, hold 또는 choice_conflict이며 published는 0건이다.
- 이미지 HOLD 10건, 정답키 충돌 1건, 선택지 충돌 2건은 reviewed answer·채점·choice ID mapping을 비활성화한다.
- variant 전용 선택지 계약 대기 148건은 canonical 피드백을 재사용하지 않는다.
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
    "prior1770RecordsUnchanged": all_records[:PRIOR_RECORD_COUNT] == manifest["records"],
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
        if record["externalId"] in IMAGE_HOLD_IDS
    ),
    "answerKeyConflictDisabled": all(
        record["reviewedAnswerIndex"] is None
        and record["reviewedAnswerText"] == ""
        and not record["choiceIdMapping"]
        and record["review"]["issueLabel"] == "정답키 충돌"
        and "answer_key_correction_pending_runtime_validation" in record["review"]["publicationBlockers"]
        for record in records
        if record["externalId"] == ANSWER_KEY_CONFLICT_ID
    ),
    "choiceConflictsDisabled": all(
        record["reviewedAnswerIndex"] is None
        and record["reviewedAnswerText"] == ""
        and not record["choiceIdMapping"]
        and record["choiceConflict"]["scoringPolicy"] == "non_scoring"
        and record["choiceConflict"]["choiceIndices"] == CHOICE_CONFLICT_INDICES[record["externalId"]]
        for record in records
        if record["externalId"] in CHOICE_CONFLICT_IDS
    ),
    "variantSpecificBlocked": all(
        "variant_specific_choice_contract_pending" in record["review"]["publicationBlockers"]
        and not record["choiceIdMapping"]
        for record in records
        if record.get("variantSpecificFeedbackRequired")
    ),
    "fullChoiceMappingsCorrect": len(full_mapping_ids) == 39,
    "semanticReassignmentsApplied": all(
        next(record for record in records if record["externalId"] == external_id)["canonicalId"] == target_id
        for external_id, (_, target_id, _) in CANONICAL_REASSIGNMENTS.items()
    ),
    "canonicalTheoryRepairApplied": next(record for record in records if record["externalId"] == CANONICAL_REPAIR_ID)["theoryLink"]["conceptGroupId"] == REPAIRED_CONCEPT_GROUP_ID,
    "canonicalTheoryRepairOverlayAdded": any(change["question"]["id"] == REPAIRED_CANONICAL_ID for change in all_question_changes),
    "lowContextPoliciesPreserved": len(low_context_ids) == 31,
    "formulaUnitSubstitutionCount": sum(record["formulaUnitSubstitution"] is not None for record in records) == 7,
    "contentHashBindingVerified": content_binding["bindingHashesMatch"],
    "sourceContentFilePackaged": False,
}
assert all(
    value is True
    or key
    in {
        "status",
        "recordCount",
        "candidateCount",
        "choiceConflictCount",
        "holdCount",
        "sourceContentFilePackaged",
    }
    for key, value in validation.items()
), validation
write_json(OUT / "validation.json", validation)

artifact_paths = [
    MANIFEST_PATH,
    MAPPING_PATH,
    MAPPING_SUMMARY_PATH,
    SOURCE_BATCH_SUMMARY_PATH,
    SOURCE_SECOND_PASS_PATH,
    CANONICAL_REFERENCE_PATH,
    OUT / "theory-lesson-additions.json",
    OUT / "canonical-question-changes.json",
    OUT / "direct-theory-link-matrix.jsonl",
    OUT / "variant-specific-choice-contract-queue.jsonl",
    OUT / "image-verification-queue.jsonl",
    OUT / "choice-conflict-queue.jsonl",
    OUT / "answer-key-conflict-queue.jsonl",
    OUT / "answer-key-correction-ledger.jsonl",
    OUT / "canonical-reassignment-ledger.jsonl",
    OUT / "canonical-theory-repair-ledger.jsonl",
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
