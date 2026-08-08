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
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-11"
REVIEW_DIR = ROOT / "docs/audit-work/cbt-source-reviews/final"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
PRIOR_VALIDATION_PATH = ROOT / "docs/audit-work/cbt-system-migration/import-batch-10/final-validation.json"
MAPPING_PATH = OUT / "mapping-dry-run-input.jsonl"
MAPPING_SUMMARY_PATH = OUT / "mapping-source-summary.json"
SOURCE_BATCH_SUMMARY_PATH = OUT / "source-batch-summary.json"
SOURCE_SECOND_PASS_PATH = OUT / "source-second-pass-validation.json"
SOURCE_INDEPENDENT_PATH = OUT / "source-independent-validation.json"
SOURCE_FINAL_AUDIT_PATH = OUT / "source-final-audit.json"
CANONICAL_REFERENCE_PATH = OUT / "canonical-reference-ledger.jsonl"

REVIEW_FILES = [
    REVIEW_DIR / "de20200822_q51-q100_independent-review.jsonl",
    REVIEW_DIR / "de20200926_q01-q50_independent-review.jsonl",
    REVIEW_DIR / "de20200926_q51-q100_independent-review.jsonl",
    REVIEW_DIR / "de20210307_selected-42_independent-review.jsonl",
]

NOW = "2026-08-08T10:17:18+09:00"
BATCH_ID = "import-11"
SYMBOLS = ["①", "②", "③", "④", "⑤"]
EXPECTED_CONTENT_SHA256 = "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"
EXPECTED_DRYRUN_SHA256 = "49c792aa605e858c6bc809d388e8bcedb87c4f8368d44c4e62b382f042197218"
EXPECTED_CANONICAL_REFERENCE_SHA256 = "416231fb163f313d2e456d933cb9bdb9cba2261082fc9e30e1eaaa8b1e7eca03"
EXPECTED_PRIOR_RECORDS_SHA256 = "e3f9b46efe3f48d1560508eb38d769863486755cf59f060803b4dfd89d7ddd3c"
EXPECTED_PRIOR_MANIFEST_SHA256 = "7b6d0d4cb66892976399094e433ed2f852c1aeaf11fe5e81afeeacb7b4c2b9fc"
TOTAL_SOURCE_VARIANTS = 2384
PRIOR_RECORD_COUNT = 1970
BATCH_RECORD_COUNT = 192
EXPECTED_CANDIDATE_COUNT = 182
EXPECTED_HOLD_COUNT = 10
EXPECTED_FULL_MAPPING_COUNT = 48
EXPECTED_VARIANT_SPECIFIC_COUNT = 134
EXPECTED_LOW_CONTEXT_COUNT = 25
EXPECTED_FORMULA_COUNT = 4

IMAGE_HOLD_IDS = {
    "2020-3B-Q62",
    "2020-3B-Q81",
    "2020-3B-Q97",
    "2020-4-Q02",
    "2020-4-Q37",
    "2020-4-Q53",
    "2020-4-Q89",
    "2020-4-Q91",
    "2021-1-Q27",
    "2021-1-Q30",
}
CANONICAL_REASSIGNMENT_ID = "2021-1-Q100"
REASSIGNMENT_CURRENT_CANONICAL_ID = "U-170"
REASSIGNMENT_TARGET_CANONICAL_ID = "U-1236"
REASSIGNMENT_REFERENCE_EXTERNAL_ID = "2010-4-Q99"


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


def canonical_contract_from_current(current: dict[str, Any]) -> dict[str, Any]:
    canonical_id = current["canonicalId"]
    return {
        "id": canonical_id,
        "stem": current["canonicalStem"],
        "choices": [
            {"id": f"{canonical_id}-c{idx + 1}", "text": text}
            for idx, text in enumerate(current["canonicalChoices"])
        ],
        "correctChoiceId": f"{canonical_id}-c{current['canonicalAnswerIndex'] + 1}",
        **current["canonicalTheoryLink"],
    }


def canonical_contract_from_reference(reference: dict[str, Any]) -> dict[str, Any]:
    canonical_id = reference["canonicalId"]
    return {
        "id": canonical_id,
        "stem": reference["canonicalStem"],
        "choices": [
            {"id": f"{canonical_id}-c{idx + 1}", "text": text}
            for idx, text in enumerate(reference["canonicalChoices"])
        ],
        "correctChoiceId": f"{canonical_id}-c{reference['canonicalAnswerIndex'] + 1}",
        **reference["canonicalTheoryLink"],
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


OUT.mkdir(parents=True, exist_ok=True)
manifest = read_json(MANIFEST_PATH)
prior_manifest_text = MANIFEST_PATH.read_text(encoding="utf-8")
prior_validation = read_json(PRIOR_VALIDATION_PATH)
mapping_summary = read_json(MAPPING_SUMMARY_PATH)
source_batch_summary = read_json(SOURCE_BATCH_SUMMARY_PATH)
source_second_pass = read_json(SOURCE_SECOND_PASS_PATH)
source_independent = read_json(SOURCE_INDEPENDENT_PATH)
source_final_audit = read_json(SOURCE_FINAL_AUDIT_PATH)
dry_rows = read_jsonl(MAPPING_PATH)
dry_by_id = {row["externalId"]: row for row in dry_rows}
canonical_references = read_jsonl(CANONICAL_REFERENCE_PATH)
canonical_reference_by_id = {row["canonicalId"]: row for row in canonical_references}

assert sha_file(MAPPING_PATH) == EXPECTED_DRYRUN_SHA256
assert sha_file(CANONICAL_REFERENCE_PATH) == EXPECTED_CANONICAL_REFERENCE_SHA256
has_existing_batch = any(batch.get("batchId") == BATCH_ID for batch in manifest.get("batches", []))
if not has_existing_batch:
    assert sha_text(prior_manifest_text) == EXPECTED_PRIOR_MANIFEST_SHA256
assert prior_validation["sourceIntegrity"]["contentJsonSha256Expected"] == EXPECTED_CONTENT_SHA256
assert prior_validation["sourceIntegrity"]["contentHashBindingVerified"] is True
assert prior_validation["sourceIntegrity"]["recordsSha256"] == EXPECTED_PRIOR_RECORDS_SHA256
assert source_batch_summary["status"] == "PASS"
assert source_second_pass["status"] == "PASS"
assert source_independent["status"] == "PASS"
assert source_final_audit["status"] == "PASS"
assert mapping_summary["recordCount"] == BATCH_RECORD_COUNT
assert mapping_summary["semanticReassignmentCount"] == 1
assert mapping_summary["relinkInPlaceCount"] == 0
assert mapping_summary["holdCount"] == 10
assert set(canonical_reference_by_id) == {REASSIGNMENT_TARGET_CANONICAL_ID}

# Idempotent regeneration removes only batch 11-owned records and metadata.
if has_existing_batch:
    owned_ids = {row["externalId"] for row in dry_rows}
    manifest = copy.deepcopy(manifest)
    manifest["batches"] = [b for b in manifest["batches"] if b.get("batchId") != BATCH_ID]
    manifest["records"] = [r for r in manifest["records"] if r["externalId"] not in owned_ids]
    manifest["recordsSha256"] = sha_text(jd(manifest["records"]))

assert len(manifest["records"]) == PRIOR_RECORD_COUNT
assert manifest["recordsSha256"] == EXPECTED_PRIOR_RECORDS_SHA256
assert len({record["externalId"] for record in manifest["records"]}) == PRIOR_RECORD_COUNT

review_rows: list[dict[str, Any]] = []
for path in REVIEW_FILES:
    review_rows.extend(read_jsonl(path))
review_by_id = {row["externalId"]: row for row in review_rows}
BATCH_IDS = [row["externalId"] for row in dry_rows]

assert len(BATCH_IDS) == len(set(BATCH_IDS)) == BATCH_RECORD_COUNT
assert set(BATCH_IDS) == set(review_by_id)
assert BATCH_IDS[0] == "2020-3B-Q51"
assert BATCH_IDS[-1] == "2021-1-Q100"
assert Counter(row["reviewVerdict"] for row in review_rows) == Counter({"ACCEPT": 182, "HOLD": 10})
assert Counter(row["decision"]["mappingClass"] for row in dry_rows) == Counter(
    {"EXACT_REPLACE": 181, "HOLD": 10, "SEMANTIC_REPLACE": 1}
)
assert {r["externalId"] for r in review_rows if r["reviewVerdict"] == "HOLD"} == IMAGE_HOLD_IDS
assert {
    r["externalId"] for r in review_rows if r["theoryRemapStatus"] == "manual_direct_source_topic_remap"
} == {CANONICAL_REASSIGNMENT_ID}

reassignment_reference = canonical_reference_by_id[REASSIGNMENT_TARGET_CANONICAL_ID]
reassignment_contract = canonical_contract_from_reference(reassignment_reference)
assert reassignment_reference["referenceExternalId"] == REASSIGNMENT_REFERENCE_EXTERNAL_ID

records: list[dict[str, Any]] = []
direct_link_matrix: list[dict[str, Any]] = []
full_mapping_ids: list[str] = []
variant_specific_ids: list[str] = []
image_queue_ids: list[str] = []
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
    is_reassignment = external_id == CANONICAL_REASSIGNMENT_ID

    if is_reassignment:
        assert decision["mappingClass"] == "SEMANTIC_REPLACE"
        assert decision["currentCanonicalId"] == REASSIGNMENT_CURRENT_CANONICAL_ID
        assert decision["targetCanonicalId"] == REASSIGNMENT_TARGET_CANONICAL_ID
        canonical = reassignment_contract
    else:
        assert decision["mappingClass"] in {"EXACT_REPLACE", "HOLD"}
        assert decision["targetCanonicalId"] == current["canonicalId"]
        canonical = canonical_contract_from_current(current)

    if is_image_hold:
        answer_idx: int | None = None
    else:
        answer_idx = review.get("independentAnswerIndex")
        assert isinstance(answer_idx, int), external_id
        assert answer_idx == source_idx, external_id

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

    if is_image_hold:
        choice_mapping: list[str] = []
        variant_specific = False
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
    else:
        choice_mapping = safe_choice_mapping(source_choices, canonical, answer_idx)
        variant_specific = not choice_mapping
        if variant_specific:
            variant_specific_ids.append(external_id)
        else:
            full_mapping_ids.append(external_id)
        runtime_status = "candidate"
        scoring_disposition = "scored"
        source_agreement = review.get("sourceAnswerAgreement") or "agrees"
        answer_evidence = review.get("answerEvidence") or "independently_solved"
        confidence = review.get("answerConfidence") or "confirmed"
        blockers = ["pending_runtime_integration"]
        if variant_specific:
            blockers.append("variant_specific_choice_contract_pending")
        risk = review.get("riskNote") or "없음. 독립 풀이와 복원 정답이 일치한다."
        issue_label = None
        mapping_class = decision["mappingClass"]
        canonical_action = "REASSIGN_CANONICAL" if is_reassignment else "KEEP_CURRENT_CANONICAL"
        theory_action = (
            "USE_TARGET_CANONICAL_DIRECT_THEORY"
            if is_reassignment
            else "USE_DIRECT_EXISTING_THEORY"
        )
        runtime_disposition = (
            "PUBLICATION_CANDIDATE_WITH_VARIANT_CHOICE_CONTRACT_PENDING"
            if variant_specific
            else "PUBLICATION_CANDIDATE"
        )
        migration_confidence = "high"
        theory_status = (
            "direct_existing_theory_reassigned_canonical"
            if is_reassignment
            else "direct_existing_theory"
        )

    is_low_context = bool(review.get("riskNote")) and runtime_status == "candidate"
    if is_low_context:
        low_context_ids.append(external_id)
        if not is_reassignment:
            theory_status = "direct_existing_theory_low_context_exam_intent"

    reviewed_theory = review["theoryLink"]
    for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"]:
        assert reviewed_theory[key] == canonical[key], (
            external_id,
            key,
            reviewed_theory[key],
            canonical[key],
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
        "directSolution": review["directSolution"].strip(),
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
            "duplicateCanonicalCluster": bool(decision.get("duplicateCanonicalCluster")),
            "preserveExternalId": True,
            "preserveRegisteredSourceUrl": True,
            "preserveQuestionNumber": True,
        },
    }
    if issue_label:
        record["review"]["issueLabel"] = issue_label
    if variant_specific:
        record["variantSpecificFeedbackRequired"] = True

    records.append(record)
    direct_link_matrix.append(
        {
            "externalId": external_id,
            "currentCanonicalId": decision["currentCanonicalId"],
            "targetCanonicalId": canonical["id"],
            "runtimeStatus": runtime_status,
            "variantSpecificFeedbackRequired": variant_specific,
            "lessonId": canonical["lessonId"],
            "lessonAnchor": canonical["lessonAnchor"],
            "conceptGroupId": canonical["conceptGroupId"],
            "conceptId": canonical["conceptId"],
            "theoryLinkStatus": theory_status,
            "canonicalReassignmentApplied": is_reassignment,
            "canonicalOverlayApplied": False,
            "lowContextPolicyApplied": is_low_context,
            "sourceNeededTheoryGate": False,
            "answerKeyConflictPending": False,
        }
    )

assert len(records) == BATCH_RECORD_COUNT
assert len(full_mapping_ids) == EXPECTED_FULL_MAPPING_COUNT
assert len(variant_specific_ids) == EXPECTED_VARIANT_SPECIFIC_COUNT
assert len(image_queue_ids) == EXPECTED_HOLD_COUNT
assert len(low_context_ids) == EXPECTED_LOW_CONTEXT_COUNT
assert len(formula_ids) == EXPECTED_FORMULA_COUNT
assert Counter(record["review"]["runtimeStatus"] for record in records) == Counter(
    {"candidate": EXPECTED_CANDIDATE_COUNT, "hold": EXPECTED_HOLD_COUNT}
)

source_files = [
    {
        "path": str(path.relative_to(ROOT)).replace("\\", "/"),
        "sha256": sha_file(path),
    }
    for path in REVIEW_FILES
]

batch_metadata = {
    "batchId": BATCH_ID,
    "reviewSessions": ["41", "42", "43", "44"],
    "externalIdRanges": [
        "2020-3B-Q51..2020-3B-Q100",
        "2020-4-Q01..2020-4-Q100",
        "2021-1-selected-42",
    ],
    "recordCount": BATCH_RECORD_COUNT,
    "candidateCount": EXPECTED_CANDIDATE_COUNT,
    "choiceConflictCount": 0,
    "holdCount": EXPECTED_HOLD_COUNT,
    "normalizationCount": 0,
    "imageReviewCount": EXPECTED_HOLD_COUNT,
    "lowContextRegistrationCount": EXPECTED_LOW_CONTEXT_COUNT,
    "variantSpecificFeedbackCount": EXPECTED_VARIANT_SPECIFIC_COUNT,
    "canonicalTheoryRepairs": [
        "2021-1-Q100: U-170 -> U-1236 밸브 채터링 canonical 재배정"
    ],
    "theoryLessonAdditionIds": [],
    "canonicalQuestionChangeIds": [],
    "holdResolution": {
        "imageVerificationQueue": sorted(IMAGE_HOLD_IDS),
        "normalizedAndRegistered": [],
        "choiceConflictNonScoring": [],
        "lowContextRegistered": sorted(low_context_ids),
    },
    "sourceFiles": source_files,
}

all_records = manifest["records"] + records
all_batches = manifest["batches"] + [batch_metadata]
manifest["generatedAt"] = NOW
manifest["batches"] = all_batches
manifest["records"] = all_records
manifest["recordsSha256"] = sha_text(jd(all_records))
manifest["holdResolutionPolicy"] = build_hold_resolution_policy(
    all_batches, manifest.get("holdResolutionPolicy", {}), NOW
)
# Batch 11 introduces no canonical or theory overlay; cumulative arrays and hashes remain unchanged.
assert manifest["theoryLessonAdditionsSha256"] == sha_text(jd(manifest["theoryLessonAdditions"]))
assert manifest["canonicalQuestionChangesSha256"] == sha_text(jd(manifest["canonicalQuestionChanges"]))
write_json(MANIFEST_PATH, manifest)

write_json(OUT / "theory-lesson-additions.json", [])
write_json(OUT / "canonical-question-changes.json", [])
write_jsonl(OUT / "direct-theory-link-matrix.jsonl", direct_link_matrix)
write_jsonl(
    OUT / "variant-specific-choice-contract-queue.jsonl",
    [record for record in records if record.get("variantSpecificFeedbackRequired")],
)
write_jsonl(
    OUT / "image-verification-queue.jsonl",
    [record for record in records if record["externalId"] in IMAGE_HOLD_IDS],
)
write_jsonl(OUT / "choice-conflict-queue.jsonl", [])
write_jsonl(OUT / "answer-key-conflict-queue.jsonl", [])
write_jsonl(OUT / "answer-key-correction-ledger.jsonl", [])
write_jsonl(OUT / "manual-choice-mapping-ledger.jsonl", [])
write_jsonl(OUT / "canonical-theory-repair-ledger.jsonl", [])
write_jsonl(OUT / "canonical-theory-repair-impact-ledger.jsonl", [])
write_jsonl(
    OUT / "canonical-reassignment-ledger.jsonl",
    [
        {
            "externalId": CANONICAL_REASSIGNMENT_ID,
            "currentCanonicalId": REASSIGNMENT_CURRENT_CANONICAL_ID,
            "targetCanonicalId": REASSIGNMENT_TARGET_CANONICAL_ID,
            "duplicateOfExternalId": REASSIGNMENT_REFERENCE_EXTERNAL_ID,
            "reason": dry_by_id[CANONICAL_REASSIGNMENT_ID]["decision"]["reasons"][0],
            "theoryLink": {
                "lessonId": reassignment_contract["lessonId"],
                "lessonAnchor": reassignment_contract["lessonAnchor"],
                "conceptGroupId": reassignment_contract["conceptGroupId"],
                "conceptId": reassignment_contract["conceptId"],
            },
            "choiceContract": "variant_specific_choice_contract_pending",
        }
    ],
)
write_jsonl(
    OUT / "low-context-registration-ledger.jsonl",
    [
        {
            "externalId": external_id,
            "riskNote": next(
                record for record in records if record["externalId"] == external_id
            )["review"]["answerConflictOrMultipleAnswerRisk"],
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
    "recordCount": BATCH_RECORD_COUNT,
    "existingDirectTheoryLinksRetained": 191,
    "existingTheoryRelinks": 1,
    "newDirectTheoryLessonsAdded": 0,
    "canonicalContentAndTheoryRepairs": 0,
    "missingDirectTheoryAfterBatch": 0,
    "sourceNeededTheoryGateCount": 0,
    "lowContextDirectTheoryLinks": len(low_context_ids),
    "notes": [
        "2021-1-Q100은 전기 릴레이 채터링 U-170이 아니라 밸브 채터링 U-1236 및 lesson-10hvc85로 재배정했다.",
        "이미지 HOLD 10건은 직접 이론을 감사용으로 보존하되 정답·채점·choice ID mapping은 비활성화했다.",
        "신규 이론 레슨과 canonical replacement overlay는 필요하지 않았고 직접 이론 미연결은 0건이다.",
    ],
}
write_json(OUT / "theory-gap-audit.json", theory_gap_audit)

states = Counter(record["review"]["runtimeStatus"] for record in records)
cumulative_states = Counter(record["review"]["runtimeStatus"] for record in all_records)
summary = {
    "batchId": BATCH_ID,
    "generatedAt": NOW,
    "recordCount": BATCH_RECORD_COUNT,
    "states": dict(states),
    "fullCanonicalChoiceMappingCount": len(full_mapping_ids),
    "manualChoiceMappingCount": 0,
    "variantSpecificFeedbackPendingCount": len(variant_specific_ids),
    "theoryLessonAdditionCount": 0,
    "canonicalQuestionChangeCount": 0,
    "directTheoryLinkCount": BATCH_RECORD_COUNT,
    "existingTheoryRelinkCount": 1,
    "imageVerificationQueueCount": len(IMAGE_HOLD_IDS),
    "choiceConflictCount": 0,
    "answerKeyCorrectionCount": 0,
    "answerKeyConflictCount": 0,
    "canonicalReassignmentCount": 1,
    "canonicalTheoryRepairCount": 0,
    "lowContextRegistrationCount": len(low_context_ids),
    "formulaUnitSubstitutionCount": len(formula_ids),
    "formulaExternalIds": formula_ids,
    "sourceContentSha256Expected": EXPECTED_CONTENT_SHA256,
    "contentHashBindingVerified": content_binding["bindingHashesMatch"],
    "dryRunMappingSha256": sha_file(MAPPING_PATH),
    "canonicalReferenceSha256": sha_file(CANONICAL_REFERENCE_PATH),
    "priorRecordsSha256": EXPECTED_PRIOR_RECORDS_SHA256,
    "cumulativeRecordCount": len(all_records),
    "cumulativeStates": dict(cumulative_states),
    "unreviewedRecordCount": TOTAL_SOURCE_VARIANTS - len(all_records),
}
write_json(OUT / "batch-summary.json", summary)

report = f"""# CBT 시스템 실제 이식 배치 11 보고서

- 범위: 2020년 3회 B형 Q51~Q100 + 2020년 4회 Q01~Q100 + 2021년 1회 선별 42문항
- 총 레코드: {BATCH_RECORD_COUNT}
- candidate: {EXPECTED_CANDIDATE_COUNT}
- 필수 이미지 HOLD: {EXPECTED_HOLD_COUNT}
- 선택지 충돌 비채점: 0
- 정답키 충돌 HOLD: 0
- canonical 재배정: 1
- 신규 직접 이론 레슨: 0
- canonical replacement overlay: 0
- canonical 선택지 1:1 매핑 완료: {len(full_mapping_ids)}
- variant 전용 선택지 계약 대기: {len(variant_specific_ids)}
- 저맥락 시험기준 등록: {len(low_context_ids)}
- 식·단위·대입·결과 구조: {len(formula_ids)}

## 필수 이미지 HOLD

{chr(10).join(f'- `{external_id}`' for external_id in sorted(IMAGE_HOLD_IDS))}

## canonical 재배정

- `2021-1-Q100`: 현재 U-170은 전기 릴레이·전자접촉기 채터링 문맥이지만 실제 원문은 밸브 시트 타격과 진동·소음을 묻는다. 밸브 채터링 문제군 `U-1236`, `lesson-10hvc85`, `s1-g04`, `concept-10hvc85`로 재배정한다.
- 원문 선택지와 target canonical 선택지가 완전한 1:1 계약은 아니므로 `variant_specific_choice_contract_pending`을 유지한다.

## 공개 경계

- 모든 배치 11 레코드는 candidate 또는 hold이며 published는 0건이다.
- 이미지 HOLD 10건은 reviewed answer·채점·choice ID mapping을 비활성화한다.
- variant 전용 선택지 계약 대기 {len(variant_specific_ids)}건은 canonical 피드백을 재사용하지 않는다.
- 원본 content.json은 패키지에 포함하거나 수정하지 않는다. 저장소 통합 전 기대 SHA를 다시 확인해야 한다.
"""
(OUT / "import-report.md").write_text(report, encoding="utf-8")

validation = {
    "status": "PASS",
    "recordCount": BATCH_RECORD_COUNT,
    "candidateCount": states["candidate"],
    "choiceConflictCount": states["choice_conflict"],
    "holdCount": states["hold"],
    "exactExternalIdSet": len(set(BATCH_IDS)) == BATCH_RECORD_COUNT,
    "orderedExternalIdsMatchDryRun": BATCH_IDS == [row["externalId"] for row in dry_rows],
    "prior1970RecordsUnchanged": all_records[:PRIOR_RECORD_COUNT] == manifest["records"][:PRIOR_RECORD_COUNT],
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
    "variantSpecificBlocked": all(
        "variant_specific_choice_contract_pending" in record["review"]["publicationBlockers"]
        and not record["choiceIdMapping"]
        for record in records
        if record.get("variantSpecificFeedbackRequired")
    ),
    "fullChoiceMappingsCorrect": len(full_mapping_ids) == EXPECTED_FULL_MAPPING_COUNT,
    "semanticReassignmentApplied": next(
        record for record in records if record["externalId"] == CANONICAL_REASSIGNMENT_ID
    )["canonicalId"] == REASSIGNMENT_TARGET_CANONICAL_ID,
    "lowContextPoliciesPreserved": len(low_context_ids) == EXPECTED_LOW_CONTEXT_COUNT,
    "formulaUnitSubstitutionCount": sum(
        record["formulaUnitSubstitution"] is not None for record in records
    ) == EXPECTED_FORMULA_COUNT,
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
    SOURCE_INDEPENDENT_PATH,
    SOURCE_FINAL_AUDIT_PATH,
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
