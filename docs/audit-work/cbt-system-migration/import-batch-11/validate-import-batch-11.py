from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-11"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
EXPECTED_PRIOR_RECORDS_SHA = "e3f9b46efe3f48d1560508eb38d769863486755cf59f060803b4dfd89d7ddd3c"
EXPECTED_CONTENT_SHA = "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"
EXPECTED_MAPPING_SHA = "49c792aa605e858c6bc809d388e8bcedb87c4f8368d44c4e62b382f042197218"
EXPECTED_CANONICAL_REFERENCE_SHA = "416231fb163f313d2e456d933cb9bdb9cba2261082fc9e30e1eaaa8b1e7eca03"
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
REASSIGNMENT_ID = "2021-1-Q100"
REASSIGNMENT = {
    "current": "U-170",
    "target": "U-1236",
    "lesson": "lesson-10hvc85",
    "anchor": "principle",
    "group": "s1-g04",
    "concept": "concept-10hvc85",
}


def compact(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def sha_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def sha_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def exact_set(left: list[str], right: list[str]) -> bool:
    return len(left) == len(right) and len(set(left)) == len(left) and set(left) == set(right)


def validate(manifest: dict[str, Any]) -> tuple[dict[str, bool], list[str]]:
    failures: list[str] = []
    checks: dict[str, bool] = {}

    def check(name: str, condition: bool, failure: str) -> None:
        checks[name] = bool(condition)
        if not condition:
            failures.append(failure)

    records = manifest.get("records", [])
    batch_records = records[1970:2162]
    expected_ids = read_json(OUT / "external-ids.json")
    dry_rows = read_jsonl(OUT / "mapping-dry-run-input.jsonl")
    dry_by_id = {row["externalId"]: row for row in dry_rows}
    canonical_refs = {
        row["canonicalId"]: row for row in read_jsonl(OUT / "canonical-reference-ledger.jsonl")
    }
    batch = next((item for item in manifest.get("batches", []) if item.get("batchId") == "import-11"), None)

    review_rows: list[dict[str, Any]] = []
    if batch:
        for source_file in batch["sourceFiles"]:
            review_rows.extend(read_jsonl(ROOT / source_file["path"]))
    review_by_id = {row["externalId"]: row for row in review_rows}

    check("record_count", len(records) == 2162, "manifest record count is not 2162")
    check("batch_slice_count", len(batch_records) == 192, "batch 11 slice is not 192")
    check("unique_external_ids", len({row.get("externalId") for row in records}) == 2162, "external IDs are not unique")
    check("records_sha", sha_text(compact(records)) == manifest.get("recordsSha256"), "records SHA mismatch")
    check("prior_records_unchanged", sha_text(compact(records[:1970])) == EXPECTED_PRIOR_RECORDS_SHA, "prior 1970 records changed")
    check("ordered_external_ids", [row.get("externalId") for row in batch_records] == expected_ids, "ordered external IDs mismatch")
    check("dryrun_exact_order", [row["externalId"] for row in dry_rows] == expected_ids, "dry-run exact order mismatch")
    check("review_exact_set", exact_set([row["externalId"] for row in review_rows], expected_ids), "review exact set mismatch")
    check("batch_metadata_present", batch is not None, "batch metadata missing")

    if batch:
        check(
            "source_file_hashes",
            all(sha_file(ROOT / item["path"]) == item["sha256"] for item in batch["sourceFiles"]),
            "source file SHA mismatch",
        )

    state_counts = Counter(row.get("review", {}).get("runtimeStatus") for row in batch_records)
    check("state_counts", state_counts == Counter({"candidate": 182, "hold": 10}), f"batch states unexpected: {dict(state_counts)}")
    cumulative = Counter(row.get("review", {}).get("runtimeStatus") for row in records)
    check(
        "cumulative_state_counts",
        cumulative == Counter({"candidate": 2057, "hold": 87, "choice_conflict": 18}),
        f"cumulative states unexpected: {dict(cumulative)}",
    )

    source_hashes_ok = True
    candidate_answers_ok = True
    image_holds_disabled_ok = True
    full_mappings_ok = True
    variants_blocked_ok = True
    theory_links_ok = True
    low_context_ok = True

    direct_rows = read_jsonl(OUT / "direct-theory-link-matrix.jsonl")
    direct_by_id = {row["externalId"]: row for row in direct_rows}
    low_context_ids = set(batch.get("holdResolution", {}).get("lowContextRegistered", [])) if batch else set()

    for record in batch_records:
        external_id = record["externalId"]
        source_review = review_by_id.get(external_id)
        dry = dry_by_id.get(external_id)
        direct = direct_by_id.get(external_id)
        if not source_review or not dry or not direct:
            source_hashes_ok = False
            theory_links_ok = False
            continue

        source_hashes_ok &= (
            sha_text(record["stem"]) == record["source"]["stemSha256"]
            and sha_text(compact(record["choices"])) == record["source"]["orderedChoicesSha256"]
            and record["source"]["registeredIdentitySha256"] == source_review["identity"]["registeredIdentitySha256"]
            and record["source"]["resolvedIdentitySha256"] == source_review["identity"]["sourceIdentitySha256"]
        )

        status = record["review"]["runtimeStatus"]
        if status == "candidate":
            candidate_answers_ok &= (
                isinstance(record.get("reviewedAnswerIndex"), int)
                and bool(record.get("reviewedAnswerText"))
                and "pending_runtime_integration" in record["review"]["publicationBlockers"]
            )
        elif external_id in IMAGE_HOLD_IDS:
            image_holds_disabled_ok &= (
                status == "hold"
                and record.get("reviewedAnswerIndex") is None
                and record.get("reviewedAnswerText") == ""
                and record.get("choiceIdMapping") == []
                and record["review"].get("issueLabel") == "필수 이미지 확인"
                and record["review"].get("scoringDisposition") == "excluded_required_image"
                and record["review"]["publicationBlockers"] == ["required_source_image_review"]
                and record["migration"].get("mappingClass") == "IMAGE_VERIFICATION_HOLD"
            )

        mapping = record.get("choiceIdMapping") or []
        if mapping:
            if record["canonicalId"] in canonical_refs:
                canonical_answer_index = canonical_refs[record["canonicalId"]]["canonicalAnswerIndex"]
            else:
                canonical_answer_index = dry["currentSystem"]["canonicalAnswerIndex"]
            full_mappings_ok &= (
                len(mapping) == len(record["choices"])
                and len(set(mapping)) == len(mapping)
                and all(re.fullmatch(re.escape(record["canonicalId"]) + r"-c[1-5]", choice_id) for choice_id in mapping)
                and isinstance(record.get("reviewedAnswerIndex"), int)
                and mapping[record["reviewedAnswerIndex"]] == f"{record['canonicalId']}-c{canonical_answer_index + 1}"
            )

        if record.get("variantSpecificFeedbackRequired"):
            variants_blocked_ok &= (
                mapping == []
                and "variant_specific_choice_contract_pending" in record["review"]["publicationBlockers"]
            )

        theory_links_ok &= (
            record["currentCanonicalId"] == direct["currentCanonicalId"]
            and record["canonicalId"] == direct["targetCanonicalId"]
            and record["theoryLink"]["lessonId"] == direct["lessonId"]
            and record["theoryLink"]["lessonAnchor"] == direct["lessonAnchor"]
            and record["theoryLink"]["conceptGroupId"] == direct["conceptGroupId"]
            and record["theoryLink"]["conceptId"] == direct["conceptId"]
            and bool(record.get("variantSpecificFeedbackRequired")) == direct["variantSpecificFeedbackRequired"]
        )

        if external_id in low_context_ids:
            low_context_ok &= (
                status == "candidate"
                and record["review"]["theoryLinkStatus"] == "direct_existing_theory_low_context_exam_intent"
                and bool(record["review"]["answerConflictOrMultipleAnswerRisk"])
            )

    check("source_identity_hashes", source_hashes_ok, "record source identity/hash mismatch")
    check("candidate_answers", candidate_answers_ok, "candidate answer contract failed")
    check("image_holds_disabled", image_holds_disabled_ok, "image HOLD gate failed")
    check("full_choice_mappings", full_mappings_ok, "full choice mapping invalid")
    check("variant_specific_blocked", variants_blocked_ok, "variant-specific gate failed")
    check("theory_links", theory_links_ok and len(direct_rows) == 192, "direct theory link mismatch")
    check("low_context_policy", low_context_ok and len(low_context_ids) == 25, "low-context risk policy mismatch")

    check("full_mapping_count", sum(bool(row.get("choiceIdMapping")) for row in batch_records) == 48, "full mapping count is not 48")
    check("variant_specific_count", sum(bool(row.get("variantSpecificFeedbackRequired")) for row in batch_records) == 134, "variant-specific count is not 134")
    check("formula_count", sum(row.get("formulaUnitSubstitution") is not None for row in batch_records) == 4, "formula count is not 4")
    check("low_context_count", len(low_context_ids) == 25, "low-context count is not 25")

    queue_specs = {
        "image_queue": ("image-verification-queue.jsonl", IMAGE_HOLD_IDS),
        "variant_specific_queue": (
            "variant-specific-choice-contract-queue.jsonl",
            {row["externalId"] for row in batch_records if row.get("variantSpecificFeedbackRequired")},
        ),
        "low_context_queue": ("low-context-registration-ledger.jsonl", low_context_ids),
        "canonical_reassignment_queue": ("canonical-reassignment-ledger.jsonl", {REASSIGNMENT_ID}),
    }
    for name, (file_name, expected) in queue_specs.items():
        actual = {row["externalId"] for row in read_jsonl(OUT / file_name)}
        check(name, actual == expected, f"{name} exact set mismatch")

    for file_name in (
        "choice-conflict-queue.jsonl",
        "answer-key-conflict-queue.jsonl",
        "answer-key-correction-ledger.jsonl",
        "canonical-theory-repair-ledger.jsonl",
        "canonical-theory-repair-impact-ledger.jsonl",
        "manual-choice-mapping-ledger.jsonl",
    ):
        check(f"{file_name}_empty", read_jsonl(OUT / file_name) == [], f"{file_name} is not empty")

    reassigned = next((row for row in batch_records if row["externalId"] == REASSIGNMENT_ID), None)
    reassignment_ok = bool(reassigned) and (
        reassigned["currentCanonicalId"] == REASSIGNMENT["current"]
        and reassigned["canonicalId"] == REASSIGNMENT["target"]
        and reassigned["theoryLink"]["lessonId"] == REASSIGNMENT["lesson"]
        and reassigned["theoryLink"]["lessonAnchor"] == REASSIGNMENT["anchor"]
        and reassigned["theoryLink"]["conceptGroupId"] == REASSIGNMENT["group"]
        and reassigned["theoryLink"]["conceptId"] == REASSIGNMENT["concept"]
        and reassigned["migration"]["mappingClass"] == "SEMANTIC_REPLACE"
        and reassigned["migration"]["canonicalAction"] == "REASSIGN_CANONICAL"
        and reassigned["variantSpecificFeedbackRequired"] is True
        and reassigned["choiceIdMapping"] == []
    )
    check("canonical_reassignment", reassignment_ok, "2021-1-Q100 canonical reassignment mismatch")

    reassignment_rows = read_jsonl(OUT / "canonical-reassignment-ledger.jsonl")
    check(
        "canonical_reassignment_ledger",
        len(reassignment_rows) == 1
        and reassignment_rows[0]["externalId"] == REASSIGNMENT_ID
        and reassignment_rows[0]["currentCanonicalId"] == REASSIGNMENT["current"]
        and reassignment_rows[0]["targetCanonicalId"] == REASSIGNMENT["target"]
        and reassignment_rows[0]["duplicateOfExternalId"] == "2010-4-Q99",
        "canonical reassignment ledger mismatch",
    )

    batch_theory = read_json(OUT / "theory-lesson-additions.json")
    batch_changes = read_json(OUT / "canonical-question-changes.json")
    check("batch_theory_additions_empty", batch_theory == [], "batch theory additions are not empty")
    check("batch_canonical_changes_empty", batch_changes == [], "batch canonical changes are not empty")
    check(
        "theory_additions_sha",
        sha_text(compact(manifest.get("theoryLessonAdditions", []))) == manifest.get("theoryLessonAdditionsSha256"),
        "theory additions SHA mismatch",
    )
    check(
        "canonical_changes_sha",
        sha_text(compact(manifest.get("canonicalQuestionChanges", []))) == manifest.get("canonicalQuestionChangesSha256"),
        "canonical changes SHA mismatch",
    )

    binding = read_json(OUT / "content-binding-validation.json")
    check(
        "content_hash_binding",
        binding["bindingHashesMatch"] is True
        and binding["expectedContentSha256"] == EXPECTED_CONTENT_SHA
        and binding["repositoryContentFilePackaged"] is False,
        "content hash binding failed",
    )
    check("mapping_input_sha", sha_file(OUT / "mapping-dry-run-input.jsonl") == EXPECTED_MAPPING_SHA, "mapping input SHA mismatch")
    check(
        "canonical_reference_sha",
        sha_file(OUT / "canonical-reference-ledger.jsonl") == EXPECTED_CANONICAL_REFERENCE_SHA,
        "canonical reference SHA mismatch",
    )

    summary = read_json(OUT / "batch-summary.json")
    check(
        "batch_summary",
        summary.get("recordCount") == 192
        and summary.get("states") == {"candidate": 182, "hold": 10}
        and summary.get("fullCanonicalChoiceMappingCount") == 48
        and summary.get("variantSpecificFeedbackPendingCount") == 134
        and summary.get("canonicalReassignmentCount") == 1
        and summary.get("cumulativeRecordCount") == 2162
        and summary.get("unreviewedRecordCount") == 222,
        "batch summary mismatch",
    )

    policy = manifest.get("holdResolutionPolicy", {})
    check(
        "cumulative_hold_policy",
        policy.get("imageVerificationQueueCount") == 86
        and policy.get("normalizedAndRegisteredCount") == 5
        and policy.get("choiceConflictNonScoringCount") == 18
        and policy.get("lowContextRegisteredCount") == 153
        and policy.get("learnerPublicationStillRequiresStatus") == "published",
        "cumulative hold policy mismatch",
    )
    return checks, failures


def main() -> None:
    manifest = read_json(MANIFEST_PATH)
    checks, failures = validate(manifest)
    output = {
        "status": "PASS" if not failures else "FAIL",
        "checks": checks,
        "failures": failures,
        "recordCount": 192,
        "cumulativeRecordCount": len(manifest["records"]),
        "manifestSha256": sha_file(MANIFEST_PATH),
        "recordsSha256": manifest["recordsSha256"],
    }
    text = json.dumps(output, ensure_ascii=False, indent=2) + "\n"
    (OUT / "independent-validation.json").write_text(text, encoding="utf-8")
    (OUT / "independent-validation-run.log").write_text(text, encoding="utf-8")
    print(text)
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
