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
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-09"
REVIEW_DIR = ROOT / "docs/audit-work/cbt-source-reviews/final"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
PRIOR_VALIDATION_PATH = ROOT / "docs/audit-work/cbt-system-migration/import-batch-08/final-validation.json"
MAPPING_PATH = OUT / "mapping-dry-run-input.jsonl"
MAPPING_SUMMARY_PATH = OUT / "mapping-source-summary.json"
SOURCE_BATCH_SUMMARY_PATH = OUT / "source-batch-summary.json"
SOURCE_SECOND_PASS_PATH = OUT / "source-second-pass-validation.json"

REVIEW_FILES = [
    REVIEW_DIR / "de20180915_q51-q100_independent-review.jsonl",
    REVIEW_DIR / "de20190303_q01-q50_independent-review.jsonl",
    REVIEW_DIR / "de20190303_q51-q100_independent-review.jsonl",
    REVIEW_DIR / "de20190427_q01-q50_independent-review.jsonl",
]

NOW = "2026-08-08T19:20:00+09:00"
BATCH_ID = "import-09"
SYMBOLS = ["①", "②", "③", "④", "⑤"]
EXPECTED_CONTENT_SHA256 = "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"
EXPECTED_DRYRUN_SHA256 = "f2b489e40f5fbe9dd632a8866e23aba0eaa6b27bf25bc7159f8744b5a239b6f6"
EXPECTED_PRIOR_RECORDS_SHA256 = "058f348998cabc060faa93180071611e05d417acc2e3b729363a28ae5f113c5a"
TOTAL_SOURCE_VARIANTS = 2384
PRIOR_RECORD_COUNT = 1570
BATCH_RECORD_COUNT = 200

IMAGE_HOLD_IDS = {
    "2018-4-Q89",
    "2019-1-Q01",
    "2019-1-Q91",
    "2019-1-Q92",
    "2019-1-Q98",
    "2019-2-Q21",
    "2019-2-Q35",
}
CHOICE_CONFLICT_IDS = {"2019-2-Q32"}
CHOICE_CONFLICT_INDICES = {"2019-2-Q32": [1, 2]}


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
prior_validation = read_json(PRIOR_VALIDATION_PATH)
mapping_summary = read_json(MAPPING_SUMMARY_PATH)
source_batch_summary = read_json(SOURCE_BATCH_SUMMARY_PATH)
source_second_pass = read_json(SOURCE_SECOND_PASS_PATH)
dry_rows = read_jsonl(MAPPING_PATH)
dry_by_id = {row["externalId"]: row for row in dry_rows}

assert sha_file(MAPPING_PATH) == EXPECTED_DRYRUN_SHA256
assert prior_validation["sourceIntegrity"]["contentJsonSha256Expected"] == EXPECTED_CONTENT_SHA256
assert prior_validation["sourceIntegrity"]["contentHashBindingVerified"] is True
assert prior_validation["sourceIntegrity"]["recordsSha256"] == EXPECTED_PRIOR_RECORDS_SHA256
assert source_batch_summary["status"] == "PASS"
assert source_second_pass["status"] == "PASS"
assert mapping_summary["recordCount"] == BATCH_RECORD_COUNT

# Idempotent regeneration owns only batch 09 records; it adds no canonical/theory overlays.
if any(batch.get("batchId") == BATCH_ID for batch in manifest.get("batches", [])):
    owned_ids = {row["externalId"] for row in dry_rows}
    manifest = copy.deepcopy(manifest)
    manifest["batches"] = [b for b in manifest["batches"] if b.get("batchId") != BATCH_ID]
    manifest["records"] = [r for r in manifest["records"] if r["externalId"] not in owned_ids]
    manifest["recordsSha256"] = sha_text(jd(manifest["records"]))

assert len(manifest["records"]) == PRIOR_RECORD_COUNT
assert manifest["recordsSha256"] == EXPECTED_PRIOR_RECORDS_SHA256
assert len({r["externalId"] for r in manifest["records"]}) == PRIOR_RECORD_COUNT

review_rows: list[dict[str, Any]] = []
for path in REVIEW_FILES:
    review_rows.extend(read_jsonl(path))
review_by_id = {row["externalId"]: row for row in review_rows}
BATCH_IDS = [row["externalId"] for row in dry_rows]

assert len(BATCH_IDS) == len(set(BATCH_IDS)) == BATCH_RECORD_COUNT
assert set(BATCH_IDS) == set(review_by_id)
assert BATCH_IDS[0] == "2018-4-Q51"
assert BATCH_IDS[-1] == "2019-2-Q50"
assert Counter(row["reviewVerdict"] for row in review_rows) == Counter(
    {"ACCEPT": 192, "HOLD": 7, "CHOICE_ISSUE": 1}
)
assert Counter(row["decision"]["mappingClass"] for row in dry_rows) == Counter(
    {"EXACT_REPLACE": 192, "HOLD": 8}
)
assert {r["externalId"] for r in review_rows if r["reviewVerdict"] == "HOLD"} == IMAGE_HOLD_IDS
assert {r["externalId"] for r in review_rows if r["reviewVerdict"] == "CHOICE_ISSUE"} == CHOICE_CONFLICT_IDS
assert mapping_summary["semanticReassignmentCount"] == 0
assert mapping_summary["relinkInPlaceCount"] == 0

# No batch-09 canonical target may rely on a prior overlay contract; dry-run canonical contracts remain valid.
prior_changed_canonicals = {
    item["question"]["id"] for item in manifest.get("canonicalQuestionChanges", [])
}
assert not {
    (row["decision"].get("targetCanonicalId") or row["decision"]["currentCanonicalId"])
    for row in dry_rows
} & prior_changed_canonicals

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

    canonical_id = decision.get("targetCanonicalId") or decision["currentCanonicalId"]
    assert canonical_id == decision["currentCanonicalId"]
    assert decision["canonicalAction"] in {
        "KEEP_CURRENT_CANONICAL",
        "PRESERVE_CURRENT_MAPPING_PENDING_REVIEW",
    }
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
        confidence = review.get("answerConfidence") or "conflict"
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
        canonical_action = "KEEP_CURRENT_CANONICAL"
        theory_action = "USE_DIRECT_EXISTING_THEORY"
        runtime_disposition = (
            "PUBLICATION_CANDIDATE_WITH_VARIANT_CHOICE_CONTRACT_PENDING"
            if variant_specific
            else "PUBLICATION_CANDIDATE"
        )
        migration_confidence = "high"

    is_low_context = bool(review.get("riskNote")) and runtime_status == "candidate"
    if is_low_context:
        low_context_ids.append(external_id)

    reviewed_theory = review["theoryLink"]
    target_theory = canonical
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
            "canonicalReassignmentApplied": False,
            "canonicalOverlayApplied": False,
            "lowContextPolicyApplied": is_low_context,
            "sourceNeededTheoryGate": False,
        }
    )

states = Counter(record["review"]["runtimeStatus"] for record in records)
assert states == Counter({"candidate": 192, "hold": 7, "choice_conflict": 1}), states
assert len(full_mapping_ids) == 28, len(full_mapping_ids)
assert len(variant_specific_ids) == 164, len(variant_specific_ids)
assert set(image_queue_ids) == IMAGE_HOLD_IDS
assert set(conflict_queue_ids) == CHOICE_CONFLICT_IDS
assert len(low_context_ids) == 26, low_context_ids
assert len(formula_ids) == 12, formula_ids
assert len(full_mapping_ids) + len(variant_specific_ids) == 192

all_records = manifest["records"] + records
assert len(all_records) == 1770
assert len({record["externalId"] for record in all_records}) == 1770
assert all_records[:PRIOR_RECORD_COUNT] == manifest["records"]

batch = {
    "batchId": BATCH_ID,
    "reviewSessions": ["33", "34", "35", "36"],
    "externalIdRanges": [
        "2018-4-Q51..2018-4-Q100",
        "2019-1-Q01..2019-1-Q100",
        "2019-2-Q01..2019-2-Q50",
    ],
    "recordCount": 200,
    "candidateCount": 192,
    "choiceConflictCount": 1,
    "holdCount": 7,
    "normalizationCount": 0,
    "imageReviewCount": 7,
    "lowContextRegistrationCount": len(low_context_ids),
    "variantSpecificFeedbackCount": len(variant_specific_ids),
    "canonicalTheoryRepairs": [],
    "theoryLessonAdditionIds": [],
    "canonicalQuestionChangeIds": [],
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
# No new theory/canonical overlays; preserve cumulative arrays and rebind their hashes.
new_manifest["theoryLessonAdditions"] = manifest.get("theoryLessonAdditions", [])
new_manifest["theoryLessonAdditionsSha256"] = sha_text(jd(new_manifest["theoryLessonAdditions"]))
new_manifest["canonicalQuestionChanges"] = manifest.get("canonicalQuestionChanges", [])
new_manifest["canonicalQuestionChangesSha256"] = sha_text(jd(new_manifest["canonicalQuestionChanges"]))
new_manifest["holdResolutionPolicy"] = build_hold_resolution_policy(
    new_manifest["batches"], manifest["holdResolutionPolicy"], NOW
)
MANIFEST_PATH.write_text(pretty(new_manifest), encoding="utf-8")

write_json(OUT / "theory-lesson-additions.json", [])
write_json(OUT / "canonical-question-changes.json", [])
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
for file_name in [
    "answer-key-correction-ledger.jsonl",
    "manual-choice-mapping-ledger.jsonl",
    "canonical-reassignment-ledger.jsonl",
    "canonical-theory-repair-impact-ledger.jsonl",
]:
    write_jsonl(OUT / file_name, [])
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
    "recordCount": 200,
    "existingDirectTheoryLinksRetained": 200,
    "existingTheoryRelinks": 0,
    "newDirectTheoryLessonsAdded": 0,
    "canonicalContentAndTheoryRepairs": 0,
    "missingDirectTheoryAfterBatch": 0,
    "sourceNeededTheoryGateCount": 0,
    "lowContextDirectTheoryLinks": len(low_context_ids),
    "notes": [
        "200문항 모두 검토 패킷의 직접 lesson·anchor·conceptGroup·concept 연결이 dry-run target canonical theory와 일치했다.",
        "canonical 재배정, canonical 내용 교정, 신규 이론 레슨은 필요하지 않았다.",
        "이미지 HOLD 7건과 선택지 충돌 1건도 감사용 직접 이론 링크만 보존하고 정답·채점은 차단했다.",
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
    "canonicalQuestionChangeCount": 0,
    "directTheoryLinkCount": 200,
    "existingTheoryRelinkCount": 0,
    "imageVerificationQueueCount": len(IMAGE_HOLD_IDS),
    "choiceConflictCount": 1,
    "answerKeyCorrectionCount": 0,
    "canonicalReassignmentCount": 0,
    "canonicalTheoryRepairCount": 0,
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

report = f"""# CBT 시스템 실제 이식 배치 09 보고서

- 범위: 2018년 4회 Q51~Q100 + 2019년 1회 Q01~Q100 + 2019년 2회 Q01~Q50
- 총 레코드: 200
- candidate: 192
- 필수 이미지 HOLD: 7
- 선택지 충돌 비채점: 1
- canonical 재배정: 0
- canonical 의미·이론 repair: 0
- 신규 직접 이론 레슨: 0
- canonical 선택지 1:1 매핑 완료: {len(full_mapping_ids)}
- variant 전용 선택지 계약 대기: {len(variant_specific_ids)}
- 저맥락 시험기준 등록: {len(low_context_ids)}
- 식·단위·대입·결과 구조: {len(formula_ids)}

## 필수 이미지 HOLD

{chr(10).join(f'- `{external_id}`' for external_id in sorted(IMAGE_HOLD_IDS))}

## 선택지 충돌

- `2019-2-Q32`: 복원 보기 2번과 3번이 모두 일반적인 설비관리 조직원칙에 어긋나 단일정답이 성립하지 않는다. `choice_conflict / non_scoring`으로 격리했다.

## 공개 경계

- 모든 배치 09 레코드는 candidate, hold 또는 choice_conflict이며 published는 0건이다.
- 이미지 HOLD 7건과 선택지 충돌 1건은 reviewed answer·채점·choice ID mapping을 비활성화한다.
- variant 전용 선택지 계약 대기 164건은 canonical 피드백을 재사용하지 않는다.
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
    "prior1570RecordsUnchanged": all_records[:PRIOR_RECORD_COUNT] == manifest["records"],
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
        and record["choiceConflict"]["choiceIndices"] == [1, 2]
        for record in records
        if record["review"]["runtimeStatus"] == "choice_conflict"
    ),
    "variantSpecificBlocked": all(
        "variant_specific_choice_contract_pending" in record["review"]["publicationBlockers"]
        and not record["choiceIdMapping"]
        for record in records
        if record.get("variantSpecificFeedbackRequired")
    ),
    "fullChoiceMappingsCorrect": len(full_mapping_ids) == 28,
    "allCanonicalMappingsPreserved": all(
        record["currentCanonicalId"] == record["canonicalId"]
        and record["migration"]["canonicalAction"] in {
            "KEEP_CURRENT_CANONICAL",
            "PRESERVE_CURRENT_MAPPING_PENDING_REVIEW",
        }
        for record in records
    ),
    "allDirectTheoryLinksPresent": len(direct_link_matrix) == 200,
    "lowContextPoliciesPreserved": len(low_context_ids) == 26,
    "formulaUnitSubstitutionCount": sum(record["formulaUnitSubstitution"] is not None for record in records) == 12,
    "contentHashBindingVerified": content_binding["bindingHashesMatch"],
    "sourceContentFilePackaged": False,
}
assert all(
    value is True
    or key in {
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
