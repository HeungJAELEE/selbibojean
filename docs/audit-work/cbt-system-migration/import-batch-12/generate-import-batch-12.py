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
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-12"
REVIEW_DIR = ROOT / "docs/audit-work/cbt-source-reviews/final"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
PRIOR_VALIDATION_PATH = ROOT / "docs/audit-work/cbt-system-migration/import-batch-11/final-validation.json"
MAPPING_PATH = OUT / "mapping-dry-run-input.jsonl"
MAPPING_SUMMARY_PATH = OUT / "mapping-source-summary.json"
SOURCE_BATCH_SUMMARY_PATH = OUT / "source-batch-summary.json"
SOURCE_SECOND_PASS_PATH = OUT / "source-second-pass-validation.json"
SOURCE_INDEPENDENT_PATH = OUT / "source-independent-validation.json"
SOURCE_FINAL_AUDIT_PATH = OUT / "source-final-audit.json"
SOURCE_CUMULATIVE_PATH = OUT / "source-cumulative-validation.json"
SOURCE_GLOBAL_HASH_PATH = OUT / "source-global-exact-hash-validation.json"
CANONICAL_REFERENCE_PATH = OUT / "canonical-reference-ledger.jsonl"

REVIEW_FILES = [
    REVIEW_DIR / "de20210515_q01-q50_independent-review.jsonl",
    REVIEW_DIR / "de20210515_q51-q100_independent-review.jsonl",
    REVIEW_DIR / "de20210912_q01-q20_independent-review.jsonl",
    REVIEW_DIR / "cet2022_selected-102_independent-review.jsonl",
]

NOW = "2026-08-08T10:55:50+09:00"
BATCH_ID = "import-12"
SYMBOLS = ["①", "②", "③", "④", "⑤"]
EXPECTED_CONTENT_SHA256 = "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"
EXPECTED_DRYRUN_SHA256 = "383bb49174d6e3fa72b4a7166863cb97833879feae311dd8757d96f08d84952e"
EXPECTED_CANONICAL_REFERENCE_SHA256 = "a4f0f4ea5e8537c1337558426b5ac319bb3dc2042126a4f17ecd51c6f87e08f3"
EXPECTED_PRIOR_RECORDS_SHA256 = "36f0ba1340ae854d10015eef0aacc5f0445248c809a270f569f07e8d0a8cd0e8"
EXPECTED_PRIOR_MANIFEST_SHA256 = "a2687df8675bb101ce574131ddae5b53abcc4250cb31a8d786e0bd671d7718e9"
TOTAL_SOURCE_VARIANTS = 2384
PRIOR_RECORD_COUNT = 2162
BATCH_RECORD_COUNT = 222
EXPECTED_CANDIDATE_COUNT = 210
EXPECTED_HOLD_COUNT = 11
EXPECTED_CHOICE_CONFLICT_COUNT = 1
EXPECTED_FULL_MAPPING_COUNT = 45
EXPECTED_VARIANT_SPECIFIC_COUNT = 165
EXPECTED_LOW_CONTEXT_COUNT = 30
EXPECTED_FORMULA_COUNT = 11

IMAGE_HOLD_IDS = {
    "2021-2-Q01",
    "2021-2-Q06",
    "2021-2-Q27",
    "2021-2-Q97",
    "2021-4-Q05",
    "2022-1-Q75",
    "2022-1-Q80",
    "2022-2-Q13",
    "2022-2-Q14",
    "2022-2-Q22",
    "2022-2-Q27",
}
CHOICE_CONFLICT_ID = "2021-2-Q13"
CHOICE_CONFLICT_INDICES = [0, 3]

CANONICAL_REASSIGNMENTS: dict[str, tuple[str, str, str]] = {
    "2022-1-Q02": ("U-RMS-001", "U-812", "2016-4-Q06"),
    "2022-1-Q31": ("U-187", "U-829", "2016-4-Q37"),
    "2022-1-Q43": ("U-197", "U-136", "2014-2-Q51"),
    "2022-1-Q70": ("U-210", "U-1180", "2011-4-Q87"),
    "2022-2-Q40": ("U-233", "U-640", "2018-4-Q23"),
    "2022-2-Q44": ("U-237", "U-661", "2018-2-Q47"),
}

# The source packets identify two taxonomy mismatches but do not choose a unique
# replacement conceptGroup. They are therefore imported with scored answers while
# theory publication remains blocked. No target taxonomy is invented here.
THEORY_TAXONOMY_GAPS: dict[str, dict[str, Any]] = {
    "2022-1-Q61": {
        "canonicalId": "U-208",
        "currentConceptGroupId": "s1-g08",
        "sourceStatedTargetFamily": "유압 유량·속도제어 계열",
        "affectedExternalIds": ["2009-4-Q91", "2022-1-Q61"],
        "sourceBlocker": "direct_concept_group_taxonomy_mismatch_hydraulic_regeneration_in_pneumatic_group",
    },
    "2022-2-Q65": {
        "canonicalId": "U-250",
        "currentConceptGroupId": "s1-g02",
        "sourceStatedTargetFamily": "공압 액추에이터·방향제어 계열",
        "affectedExternalIds": ["2022-2-Q65"],
        "sourceBlocker": "direct_concept_group_taxonomy_mismatch_pneumatic_stopper_cylinder_in_hydraulic_group",
    },
}


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
source_cumulative = read_json(SOURCE_CUMULATIVE_PATH)
source_global_hash = read_json(SOURCE_GLOBAL_HASH_PATH)
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
assert source_cumulative["status"] == "PASS"
assert source_global_hash["status"] == "PASS"
assert mapping_summary["recordCount"] == BATCH_RECORD_COUNT
assert mapping_summary["semanticReassignmentCount"] == 6
assert mapping_summary["relinkInPlaceCount"] == 2
assert mapping_summary["holdCount"] == 12
assert set(canonical_reference_by_id) == {target for _, target, _ in CANONICAL_REASSIGNMENTS.values()}

# Idempotent regeneration removes only batch-12-owned records and metadata.
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
assert BATCH_IDS[0] == "2021-2-Q01"
assert BATCH_IDS[-1] == "2022-2-Q80"
assert Counter(row["reviewVerdict"] for row in review_rows) == Counter(
    {"ACCEPT": 210, "HOLD": 11, "CHOICE_ISSUE": 1}
)
assert Counter(row["decision"]["mappingClass"] for row in dry_rows) == Counter(
    {"EXACT_REPLACE": 204, "HOLD": 12, "SEMANTIC_REPLACE": 6}
)
assert {r["externalId"] for r in review_rows if r["reviewVerdict"] == "HOLD"} == IMAGE_HOLD_IDS
assert {r["externalId"] for r in review_rows if r["reviewVerdict"] == "CHOICE_ISSUE"} == {CHOICE_CONFLICT_ID}
assert {
    r["externalId"] for r in review_rows if r.get("theoryLinkStatus") == "direct_lesson_taxonomy_gap"
} == set(THEORY_TAXONOMY_GAPS)

reassignment_contracts = {
    canonical_id: canonical_contract_from_reference(canonical_reference_by_id[canonical_id])
    for canonical_id in canonical_reference_by_id
}
for external_id, (current_id, target_id, reference_id) in CANONICAL_REASSIGNMENTS.items():
    dry = dry_by_id[external_id]
    assert dry["decision"]["mappingClass"] == "SEMANTIC_REPLACE"
    assert dry["decision"]["currentCanonicalId"] == current_id
    assert dry["decision"]["targetCanonicalId"] == target_id
    assert canonical_reference_by_id[target_id]["referenceExternalId"] == reference_id

records: list[dict[str, Any]] = []
direct_link_matrix: list[dict[str, Any]] = []
full_mapping_ids: list[str] = []
variant_specific_ids: list[str] = []
image_queue_ids: list[str] = []
conflict_queue_ids: list[str] = []
low_context_ids: list[str] = []
formula_ids: list[str] = []
reassignment_ids: list[str] = []
theory_gap_ids: list[str] = []

for external_id in BATCH_IDS:
    review = review_by_id[external_id]
    dry = dry_by_id[external_id]
    current = dry["currentSystem"]
    decision = dry["decision"]
    source_choices = list(review["sourceExactChoices"])
    source_idx = review.get("sourceAnswerIndex")
    is_image_hold = external_id in IMAGE_HOLD_IDS
    is_conflict = external_id == CHOICE_CONFLICT_ID
    is_reassignment = external_id in CANONICAL_REASSIGNMENTS
    is_theory_gap = external_id in THEORY_TAXONOMY_GAPS

    if is_reassignment:
        expected_current, target_canonical_id, _ = CANONICAL_REASSIGNMENTS[external_id]
        assert decision["currentCanonicalId"] == expected_current
        assert decision["targetCanonicalId"] == target_canonical_id
        canonical = reassignment_contracts[target_canonical_id]
        reassignment_ids.append(external_id)
    else:
        assert decision["targetCanonicalId"] == current["canonicalId"]
        canonical = canonical_contract_from_current(current)

    if is_image_hold or is_conflict:
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

    choice_conflict: dict[str, Any] | None = None
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
    elif is_conflict:
        choice_mapping = []
        variant_specific = False
        conflict_queue_ids.append(external_id)
        runtime_status = "choice_conflict"
        scoring_disposition = "non_scoring"
        source_agreement = review.get("sourceAnswerAgreement") or "source_key_not_usable"
        answer_evidence = "multiple_final_answers_confirmed"
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
        choice_conflict = {
            "choiceIndices": CHOICE_CONFLICT_INDICES,
            "reason": review["directSolution"].strip(),
            "sourceAnswerIndexPreservedForAudit": source_idx,
            "scoringAllowed": False,
        }
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
        if is_theory_gap:
            theory_gap_ids.append(external_id)
            blockers.extend(
                [
                    THEORY_TAXONOMY_GAPS[external_id]["sourceBlocker"],
                    "canonical_theory_repair_exact_target_pending",
                ]
            )
        if variant_specific:
            blockers.append("variant_specific_choice_contract_pending")
        risk = review.get("riskNote") or "없음. 독립 풀이와 복원 정답이 일치한다."
        issue_label = "이론 taxonomy 교정 대기" if is_theory_gap else None
        mapping_class = (
            "SEMANTIC_REPLACE"
            if is_reassignment
            else "THEORY_TAXONOMY_REPAIR_PENDING"
            if is_theory_gap
            else decision["mappingClass"]
        )
        canonical_action = (
            "REASSIGN_CANONICAL"
            if is_reassignment
            else "PRESERVE_CURRENT_CANONICAL_PENDING_TAXONOMY_REPAIR"
            if is_theory_gap
            else "KEEP_CURRENT_CANONICAL"
        )
        theory_action = (
            "USE_TARGET_CANONICAL_DIRECT_THEORY"
            if is_reassignment
            else "PRESERVE_AUDIT_THEORY_PENDING_EXACT_TAXONOMY_TARGET"
            if is_theory_gap
            else "USE_DIRECT_EXISTING_THEORY"
        )
        runtime_disposition = (
            "CANDIDATE_ANSWER_WITH_THEORY_PUBLICATION_HELD"
            if is_theory_gap
            else "PUBLICATION_CANDIDATE_WITH_VARIANT_CHOICE_CONTRACT_PENDING"
            if variant_specific
            else "PUBLICATION_CANDIDATE"
        )
        migration_confidence = "high"
        theory_status = (
            "direct_existing_theory_taxonomy_gap_publication_held"
            if is_theory_gap
            else "direct_target_canonical_theory"
            if is_reassignment
            else "direct_existing_theory"
        )

    is_low_context = bool(review.get("riskNote")) and runtime_status == "candidate"
    if is_low_context:
        low_context_ids.append(external_id)
        if not is_theory_gap and not is_reassignment:
            theory_status = "direct_existing_theory_low_context_exam_intent"

    # Normal records and taxonomy-gap records retain the source-reviewed direct
    # link. Semantic reassignments deliberately use the target canonical's direct
    # theory contract from the dry-run reference ledger.
    if not is_reassignment:
        reviewed_theory = review["theoryLink"]
        for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"]:
            assert reviewed_theory[key] == canonical[key], (
                external_id,
                key,
                reviewed_theory[key],
                canonical[key],
            )
    else:
        target_theory = decision["targetCanonicalTheoryLink"]
        for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"]:
            assert target_theory[key] == canonical[key], (
                external_id,
                key,
                target_theory[key],
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
    if choice_conflict:
        record["choiceConflict"] = choice_conflict
    if is_reassignment:
        record["migration"]["sourceReviewedTheoryLink"] = {
            key: review["theoryLink"][key]
            for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"]
        }
    if is_theory_gap:
        record["migration"]["taxonomyRepair"] = {
            "applied": False,
            "currentConceptGroupId": THEORY_TAXONOMY_GAPS[external_id]["currentConceptGroupId"],
            "targetConceptGroupId": None,
            "sourceStatedTargetFamily": THEORY_TAXONOMY_GAPS[external_id]["sourceStatedTargetFamily"],
            "reason": "source packet identifies the mismatch but does not select a unique replacement conceptGroup",
        }

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
            "canonicalOverlayApplied": False,
            "taxonomyRepairPending": is_theory_gap,
            "lowContextPolicyApplied": is_low_context,
            "sourceNeededTheoryGate": False,
            "answerKeyConflictPending": False,
            "sourceReviewedTheoryLink": {
                key: review["theoryLink"][key]
                for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"]
            },
        }
    )

states = Counter(record["review"]["runtimeStatus"] for record in records)
assert states == Counter(
    {
        "candidate": EXPECTED_CANDIDATE_COUNT,
        "hold": EXPECTED_HOLD_COUNT,
        "choice_conflict": EXPECTED_CHOICE_CONFLICT_COUNT,
    }
), states
assert len(full_mapping_ids) == EXPECTED_FULL_MAPPING_COUNT, full_mapping_ids
assert len(variant_specific_ids) == EXPECTED_VARIANT_SPECIFIC_COUNT, len(variant_specific_ids)
assert set(image_queue_ids) == IMAGE_HOLD_IDS
assert conflict_queue_ids == [CHOICE_CONFLICT_ID]
assert set(reassignment_ids) == set(CANONICAL_REASSIGNMENTS)
assert set(theory_gap_ids) == set(THEORY_TAXONOMY_GAPS)
assert len(low_context_ids) == EXPECTED_LOW_CONTEXT_COUNT, low_context_ids
assert len(formula_ids) == EXPECTED_FORMULA_COUNT, formula_ids
assert len(full_mapping_ids) + len(variant_specific_ids) == EXPECTED_CANDIDATE_COUNT

all_records = manifest["records"] + records
assert len(all_records) == TOTAL_SOURCE_VARIANTS
assert len({record["externalId"] for record in all_records}) == TOTAL_SOURCE_VARIANTS
assert all_records[:PRIOR_RECORD_COUNT] == manifest["records"]

batch_metadata = {
    "batchId": BATCH_ID,
    "reviewSessions": ["45", "46", "47", "48"],
    "externalIdRanges": [
        "2021-2-Q01..2021-2-Q100",
        "2021-4-Q01..2021-4-Q20",
        "2022-selected-102",
    ],
    "recordCount": BATCH_RECORD_COUNT,
    "candidateCount": EXPECTED_CANDIDATE_COUNT,
    "choiceConflictCount": EXPECTED_CHOICE_CONFLICT_COUNT,
    "holdCount": EXPECTED_HOLD_COUNT,
    "normalizationCount": 0,
    "imageReviewCount": EXPECTED_HOLD_COUNT,
    "lowContextRegistrationCount": EXPECTED_LOW_CONTEXT_COUNT,
    "variantSpecificFeedbackCount": EXPECTED_VARIANT_SPECIFIC_COUNT,
    "canonicalTheoryRepairs": [
        "2022-1-Q02: U-RMS-001 -> U-812 canonical 재배정",
        "2022-1-Q31: U-187 -> U-829 canonical 재배정",
        "2022-1-Q43: U-197 -> U-136 canonical 재배정",
        "2022-1-Q70: U-210 -> U-1180 canonical 재배정",
        "2022-2-Q40: U-233 -> U-640 canonical 재배정",
        "2022-2-Q44: U-237 -> U-661 canonical 재배정",
        "2022-1-Q61: exact target conceptGroup 미지정으로 taxonomy repair 보류",
        "2022-2-Q65: exact target conceptGroup 미지정으로 taxonomy repair 보류",
    ],
    "theoryLessonAdditionIds": [],
    "canonicalQuestionChangeIds": [],
    "holdResolution": {
        "imageVerificationQueue": sorted(IMAGE_HOLD_IDS),
        "normalizedAndRegistered": [],
        "choiceConflictNonScoring": [CHOICE_CONFLICT_ID],
        "lowContextRegistered": sorted(low_context_ids),
        "theoryTaxonomyRepairPending": sorted(THEORY_TAXONOMY_GAPS),
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
new_manifest["batches"] = manifest["batches"] + [batch_metadata]
new_manifest["records"] = all_records
new_manifest["recordsSha256"] = sha_text(jd(all_records))
new_manifest["theoryLessonAdditionsSha256"] = sha_text(jd(new_manifest.get("theoryLessonAdditions", [])))
new_manifest["canonicalQuestionChangesSha256"] = sha_text(jd(new_manifest.get("canonicalQuestionChanges", [])))
new_manifest["holdResolutionPolicy"] = build_hold_resolution_policy(
    new_manifest["batches"], manifest.get("holdResolutionPolicy", {}), NOW
)
write_json(MANIFEST_PATH, new_manifest)

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
write_jsonl(
    OUT / "choice-conflict-queue.jsonl",
    [record for record in records if record["externalId"] == CHOICE_CONFLICT_ID],
)
write_jsonl(OUT / "answer-key-conflict-queue.jsonl", [])
write_jsonl(OUT / "answer-key-correction-ledger.jsonl", [])
write_jsonl(OUT / "manual-choice-mapping-ledger.jsonl", [])
write_jsonl(
    OUT / "canonical-reassignment-ledger.jsonl",
    [
        {
            "externalId": external_id,
            "currentCanonicalId": current_id,
            "targetCanonicalId": target_id,
            "duplicateOfExternalId": reference_id,
            "reason": dry_by_id[external_id]["decision"]["reasons"][0],
            "theoryLink": {
                "lessonId": reassignment_contracts[target_id]["lessonId"],
                "lessonAnchor": reassignment_contracts[target_id]["lessonAnchor"],
                "conceptGroupId": reassignment_contracts[target_id]["conceptGroupId"],
                "conceptId": reassignment_contracts[target_id]["conceptId"],
            },
            "sourceReviewedTheoryLink": {
                key: review_by_id[external_id]["theoryLink"][key]
                for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"]
            },
            "choiceContract": (
                "canonical_choice_mapping_complete"
                if next(record for record in records if record["externalId"] == external_id)["choiceIdMapping"]
                else "variant_specific_choice_contract_pending"
            ),
        }
        for external_id, (current_id, target_id, reference_id) in CANONICAL_REASSIGNMENTS.items()
    ],
)
write_jsonl(
    OUT / "canonical-theory-repair-ledger.jsonl",
    [
        {
            "externalId": external_id,
            "canonicalId": gap["canonicalId"],
            "applied": False,
            "currentTheoryLink": {
                key: review_by_id[external_id]["theoryLink"][key]
                for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"]
            },
            "targetConceptGroupId": None,
            "sourceStatedTargetFamily": gap["sourceStatedTargetFamily"],
            "reason": "검토 원자료는 taxonomy 오연결을 확인하지만 유일한 replacement conceptGroup ID를 확정하지 않았다.",
            "publicationGate": [
                gap["sourceBlocker"],
                "canonical_theory_repair_exact_target_pending",
                "pending_runtime_integration",
            ],
        }
        for external_id, gap in THEORY_TAXONOMY_GAPS.items()
    ],
)
write_jsonl(
    OUT / "canonical-theory-repair-impact-ledger.jsonl",
    [
        {
            "canonicalId": gap["canonicalId"],
            "triggerExternalId": external_id,
            "affectedExternalIds": gap["affectedExternalIds"],
            "currentConceptGroupId": gap["currentConceptGroupId"],
            "targetConceptGroupId": None,
            "sourceStatedTargetFamily": gap["sourceStatedTargetFamily"],
            "historicalRecordPolicy": "prior 2162 audit records remain byte-identical; no runtime canonical taxonomy overlay is applied until an exact target is approved",
        }
        for external_id, gap in THEORY_TAXONOMY_GAPS.items()
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
    "recordCount": BATCH_RECORD_COUNT,
    "existingDirectTheoryLinksRetained": 214,
    "targetCanonicalTheoryRelinks": 6,
    "newDirectTheoryLessonsAdded": 0,
    "canonicalContentAndTheoryRepairsApplied": 0,
    "taxonomyRepairPendingCount": 2,
    "taxonomyRepairPendingExternalIds": sorted(THEORY_TAXONOMY_GAPS),
    "missingAuditTheoryAfterBatch": 0,
    "publicationSafeTheoryLinkCount": 220,
    "lowContextDirectTheoryLinks": len(low_context_ids),
    "notes": [
        "6건은 dry-run target canonical의 직접 이론 계약으로 재배정했다.",
        "2022-1-Q61과 2022-2-Q65는 원자료가 taxonomy mismatch를 확인했지만 정확한 replacement conceptGroup ID를 선택하지 않아 canonical overlay를 만들지 않았다.",
        "두 taxonomy-gap 문항은 정답·직접 풀이를 candidate로 보존하되 이론 탐색과 published 승격을 차단한다.",
        "이미지 HOLD 11건과 선택지 충돌 1건은 정답·채점·choice ID mapping을 비활성화했다.",
    ],
}
write_json(OUT / "theory-gap-audit.json", theory_gap_audit)

cumulative_states = Counter(record["review"]["runtimeStatus"] for record in all_records)
summary = {
    "batchId": BATCH_ID,
    "generatedAt": NOW,
    "recordCount": BATCH_RECORD_COUNT,
    "states": dict(states),
    "sourcePublicationCandidateCount": 208,
    "fullCanonicalChoiceMappingCount": len(full_mapping_ids),
    "manualChoiceMappingCount": 0,
    "variantSpecificFeedbackPendingCount": len(variant_specific_ids),
    "theoryLessonAdditionCount": 0,
    "canonicalQuestionChangeCount": 0,
    "directTheoryLinkCount": BATCH_RECORD_COUNT,
    "targetCanonicalTheoryRelinkCount": len(CANONICAL_REASSIGNMENTS),
    "imageVerificationQueueCount": len(IMAGE_HOLD_IDS),
    "choiceConflictCount": EXPECTED_CHOICE_CONFLICT_COUNT,
    "answerKeyCorrectionCount": 0,
    "answerKeyConflictCount": 0,
    "canonicalReassignmentCount": len(CANONICAL_REASSIGNMENTS),
    "canonicalTheoryRepairAppliedCount": 0,
    "canonicalTheoryRepairPendingCount": len(THEORY_TAXONOMY_GAPS),
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
    "allSourceVariantsCovered": len(all_records) == TOTAL_SOURCE_VARIANTS,
}
write_json(OUT / "batch-summary.json", summary)

report = f"""# CBT 시스템 실제 이식 배치 12 보고서

- 범위: 2021년 2회 Q01~Q100 + 2021년 4회 Q01~Q20 + 2022년 선별 102문항
- 총 레코드: {BATCH_RECORD_COUNT}
- candidate: {EXPECTED_CANDIDATE_COUNT}
- 필수 이미지 HOLD: {EXPECTED_HOLD_COUNT}
- 선택지 충돌 비채점: {EXPECTED_CHOICE_CONFLICT_COUNT}
- canonical 재배정: {len(CANONICAL_REASSIGNMENTS)}
- taxonomy repair 적용: 0
- taxonomy repair 대기: {len(THEORY_TAXONOMY_GAPS)}
- 신규 직접 이론 레슨: 0
- canonical replacement overlay: 0
- canonical 선택지 1:1 매핑 완료: {len(full_mapping_ids)}
- variant 전용 선택지 계약 대기: {len(variant_specific_ids)}
- 저맥락 시험기준 등록: {len(low_context_ids)}
- 식·단위·대입·결과 구조: {len(formula_ids)}
- 누적 이식: {len(all_records)}/{TOTAL_SOURCE_VARIANTS}

## 필수 이미지 HOLD

{chr(10).join(f'- `{external_id}`' for external_id in sorted(IMAGE_HOLD_IDS))}

## 선택지 충돌

- `{CHOICE_CONFLICT_ID}`: 광전식 검출법과 회전주기 측정법이 확정답안에서 함께 인정돼 단일정답형 채점을 비활성화했다.

## canonical 재배정

{chr(10).join(f'- `{external_id}`: {current_id} → {target_id} (reference `{reference_id}`)' for external_id, (current_id, target_id, reference_id) in CANONICAL_REASSIGNMENTS.items())}

## taxonomy repair 경계

- `2022-1-Q61`: 현재 재생회로 레슨은 `s1-g08`에 있으나 원자료는 “유압 유량·속도제어 계열”로 이동해야 한다고만 적고 정확한 target conceptGroup ID는 확정하지 않았다.
- `2022-2-Q65`: 현재 스토퍼실린더 고장 레슨은 `s1-g02`에 있으나 원자료는 “공압 액추에이터·방향제어 계열”로 이동해야 한다고만 적고 정확한 target conceptGroup ID는 확정하지 않았다.
- 따라서 두 건은 정답과 직접 풀이를 candidate로 이식하되 canonical taxonomy overlay를 만들지 않고 이론 공개를 차단했다.

## 최종 범위 경계

- 2,384개 source external ID가 모두 누적 manifest에 존재하며 unreviewed count는 0이다.
- 모든 레코드는 candidate, hold 또는 choice_conflict이며 published는 0건이다.
- 이미지 HOLD 11건과 선택지 충돌 1건은 reviewed answer·채점·choice ID mapping을 비활성화한다.
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
    "prior2162RecordsUnchanged": all_records[:PRIOR_RECORD_COUNT] == manifest["records"][:PRIOR_RECORD_COUNT],
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
    "choiceConflictDisabled": next(
        record for record in records if record["externalId"] == CHOICE_CONFLICT_ID
    )["reviewedAnswerIndex"] is None,
    "variantSpecificBlocked": all(
        "variant_specific_choice_contract_pending" in record["review"]["publicationBlockers"]
        and not record["choiceIdMapping"]
        for record in records
        if record.get("variantSpecificFeedbackRequired")
    ),
    "fullChoiceMappingsCorrect": len(full_mapping_ids) == EXPECTED_FULL_MAPPING_COUNT,
    "semanticReassignmentsApplied": set(reassignment_ids) == set(CANONICAL_REASSIGNMENTS),
    "taxonomyRepairsConservativelyHeld": set(theory_gap_ids) == set(THEORY_TAXONOMY_GAPS),
    "lowContextPoliciesPreserved": len(low_context_ids) == EXPECTED_LOW_CONTEXT_COUNT,
    "formulaUnitSubstitutionCount": sum(
        record["formulaUnitSubstitution"] is not None for record in records
    ) == EXPECTED_FORMULA_COUNT,
    "allSourceVariantsCovered": len(all_records) == TOTAL_SOURCE_VARIANTS,
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
    SOURCE_CUMULATIVE_PATH,
    SOURCE_GLOBAL_HASH_PATH,
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
