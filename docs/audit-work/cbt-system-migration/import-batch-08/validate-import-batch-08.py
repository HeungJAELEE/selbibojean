from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-08"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
EXPECTED_PRIOR_RECORDS_SHA = "b71a7a6567ccc0f4d8fb02d0cb82d0708fe1b4a9b5b82403c3d5849158c5f196"
EXPECTED_CONTENT_SHA = "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"
EXPECTED_MAPPING_SHA = "40b656165a1dcfbc69d26451c0fdc6615f541333644cdf8903297d77bed8fe0d"
IMAGE_HOLD_IDS = {
    "2017-2-Q60", "2018-2-Q05", "2018-2-Q21", "2018-2-Q45",
    "2018-2-Q83", "2018-4-Q15", "2018-4-Q18", "2018-4-Q37",
}
CHOICE_CONFLICT_IDS = {"2018-2-Q10"}


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
    batch_records = records[1370:1570]
    by_id = {record.get("externalId"): record for record in batch_records}
    expected_ids = read_json(OUT / "external-ids.json")
    dry_rows = read_jsonl(OUT / "mapping-dry-run-input.jsonl")
    dry_by_id = {row["externalId"]: row for row in dry_rows}
    batch = next((b for b in manifest.get("batches", []) if b.get("batchId") == "import-08"), None)
    review_rows: list[dict[str, Any]] = []
    if batch:
        for source_file in batch["sourceFiles"]:
            review_rows.extend(read_jsonl(ROOT / source_file["path"]))
    review_by_id = {row["externalId"]: row for row in review_rows}

    check("record_count", len(records) == 1570, "manifest record count is not 1570")
    check("batch_slice_count", len(batch_records) == 200, "batch 08 slice is not 200")
    check("unique_external_ids", len({r.get("externalId") for r in records}) == 1570, "external IDs are not unique")
    check("records_sha", sha_text(compact(records)) == manifest.get("recordsSha256"), "records SHA mismatch")
    check("prior_records_unchanged", sha_text(compact(records[:1370])) == EXPECTED_PRIOR_RECORDS_SHA, "prior 1370 records changed")
    check("ordered_external_ids", [r.get("externalId") for r in batch_records] == expected_ids, "ordered external IDs mismatch")
    check("dryrun_exact_set", [r["externalId"] for r in dry_rows] == expected_ids, "dry-run exact set/order mismatch")
    check("review_exact_set", exact_set([r["externalId"] for r in review_rows], expected_ids), "review exact set mismatch")
    check("batch_metadata_present", batch is not None, "batch metadata missing")

    if batch:
        check(
            "source_file_hashes",
            all(sha_file(ROOT / source_file["path"]) == source_file["sha256"] for source_file in batch["sourceFiles"]),
            "source file SHA mismatch",
        )

    state_counts = Counter(r.get("review", {}).get("runtimeStatus") for r in batch_records)
    check("state_counts", state_counts == Counter({"candidate": 191, "hold": 8, "choice_conflict": 1}), f"batch states unexpected: {dict(state_counts)}")
    cumulative = Counter(r.get("review", {}).get("runtimeStatus") for r in records)
    check("cumulative_state_counts", cumulative == Counter({"candidate": 1496, "hold": 59, "choice_conflict": 15}), f"cumulative states unexpected: {dict(cumulative)}")

    source_hashes_ok = True
    candidate_answers_ok = True
    holds_disabled_ok = True
    conflicts_disabled_ok = True
    full_mappings_ok = True
    variants_blocked_ok = True
    theory_links_ok = True
    low_context_ok = True

    for record in batch_records:
        eid = record["externalId"]
        review = review_by_id.get(eid)
        dry = dry_by_id.get(eid)
        if not review or not dry:
            source_hashes_ok = False
            theory_links_ok = False
            continue
        source_hashes_ok &= (
            sha_text(record["stem"]) == record["source"]["stemSha256"]
            and sha_text(compact(record["choices"])) == record["source"]["orderedChoicesSha256"]
            and record["source"]["registeredIdentitySha256"] == review["identity"]["registeredIdentitySha256"]
            and record["source"]["resolvedIdentitySha256"] == review["identity"]["sourceIdentitySha256"]
        )
        status = record["review"]["runtimeStatus"]
        if status == "candidate":
            candidate_answers_ok &= (
                isinstance(record.get("reviewedAnswerIndex"), int)
                and bool(record.get("reviewedAnswerText"))
                and "pending_runtime_integration" in record["review"]["publicationBlockers"]
            )
        elif status == "hold":
            holds_disabled_ok &= (
                eid in IMAGE_HOLD_IDS
                and record.get("reviewedAnswerIndex") is None
                and record.get("reviewedAnswerText") == ""
                and record.get("choiceIdMapping") == []
                and record["review"].get("issueLabel") == "필수 이미지 확인"
                and record["review"]["publicationBlockers"] == ["required_source_image_review"]
            )
        elif status == "choice_conflict":
            conflicts_disabled_ok &= (
                eid in CHOICE_CONFLICT_IDS
                and record.get("reviewedAnswerIndex") is None
                and record.get("reviewedAnswerText") == ""
                and record.get("choiceIdMapping") == []
                and record.get("choiceConflict", {}).get("scoringPolicy") == "non_scoring"
                and record.get("choiceConflict", {}).get("choiceIndices") == [0, 1, 2, 3]
                and record["directSolution"].startswith("선택지 충돌:")
            )

        mapping = record.get("choiceIdMapping") or []
        if mapping:
            full_mappings_ok &= (
                len(mapping) == len(record["choices"])
                and len(set(mapping)) == len(mapping)
                and all(re.fullmatch(re.escape(record["canonicalId"]) + r"-c[1-5]", choice_id) for choice_id in mapping)
                and isinstance(record.get("reviewedAnswerIndex"), int)
            )
        if record.get("variantSpecificFeedbackRequired"):
            variants_blocked_ok &= (
                mapping == []
                and "variant_specific_choice_contract_pending" in record["review"]["publicationBlockers"]
            )

        if eid == "2018-4-Q35":
            theory_links_ok &= (
                record["theoryLink"]["lessonId"] == "lesson-cbt-gang-system-process-layout"
                and record["theoryLink"]["lessonAnchor"] == "definition"
                and record["theoryLink"]["conceptGroupId"] == "s4-g10"
                and record["theoryLink"]["conceptId"] == "concept-cd7x17"
                and record["migration"]["canonicalAction"] == "APPLY_CANONICAL_OVERLAY"
                and "lesson_source_needed" in record["review"]["publicationBlockers"]
            )
        elif eid == "2018-4-Q19":
            theory_links_ok &= (
                record["currentCanonicalId"] == "U-026"
                and record["canonicalId"] == "U-997"
                and record["theoryLink"]["lessonId"] == "lesson-lqjgxa"
                and record["choiceIdMapping"] == ["U-997-c2", "U-997-c1", "U-997-c4", "U-997-c3"]
                and record["migration"]["canonicalAction"] == "REASSIGN_CANONICAL"
            )
        else:
            target = dry["decision"]["targetCanonicalTheoryLink"]
            theory_links_ok &= all(record["theoryLink"].get(key) == target.get(key) for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"])

        if review.get("riskNote") and status == "candidate":
            low_context_ok &= record["review"]["answerConflictOrMultipleAnswerRisk"] == review["riskNote"]
            if eid != "2018-4-Q35":
                low_context_ok &= record["review"]["theoryLinkStatus"] == "direct_existing_theory_low_context_exam_intent"

    check("source_identity_hashes", source_hashes_ok, "record source identity/hash mismatch")
    check("candidate_answers", candidate_answers_ok, "candidate answer contract failed")
    check("holds_disabled", holds_disabled_ok, "image HOLD gate failed")
    check("conflicts_disabled", conflicts_disabled_ok, "choice conflict gate failed")
    check("full_choice_mappings", full_mappings_ok, "full choice mapping invalid")
    check("variant_specific_blocked", variants_blocked_ok, "variant-specific gate failed")
    check("theory_links", theory_links_ok, "theory/canonical repair link mismatch")
    check("low_context_policy", low_context_ok, "low-context risk policy mismatch")

    check("full_mapping_count", sum(bool(r.get("choiceIdMapping")) for r in batch_records) == 38, "full mapping count is not 38")
    check("variant_specific_count", sum(bool(r.get("variantSpecificFeedbackRequired")) for r in batch_records) == 153, "variant-specific count is not 153")
    check("formula_count", sum(r.get("formulaUnitSubstitution") is not None for r in batch_records) == 8, "formula count is not 8")
    check("low_context_count", len(batch.get("holdResolution", {}).get("lowContextRegistered", [])) == 30 if batch else False, "low-context count is not 30")

    queue_specs = {
        "image_queue": ("image-verification-queue.jsonl", IMAGE_HOLD_IDS),
        "choice_conflict_queue": ("choice-conflict-queue.jsonl", CHOICE_CONFLICT_IDS),
        "variant_specific_queue": ("variant-specific-choice-contract-queue.jsonl", {r["externalId"] for r in batch_records if r.get("variantSpecificFeedbackRequired")}),
        "low_context_queue": ("low-context-registration-ledger.jsonl", set(batch["holdResolution"]["lowContextRegistered"]) if batch else set()),
        "canonical_reassignment_queue": ("canonical-reassignment-ledger.jsonl", {"2018-4-Q19"}),
        "canonical_repair_queue": ("canonical-theory-repair-impact-ledger.jsonl", {"2018-4-Q35"}),
    }
    for name, (file_name, expected) in queue_specs.items():
        actual = {row["externalId"] for row in read_jsonl(OUT / file_name)}
        check(name, actual == expected, f"{name} exact set mismatch")

    check(
        "empty_ledgers",
        all(not read_jsonl(OUT / file_name) for file_name in ["answer-key-correction-ledger.jsonl", "manual-choice-mapping-ledger.jsonl"]),
        "unexpected answer/manual ledger entry",
    )

    lesson = next((a for a in manifest.get("theoryLessonAdditions", []) if a["lesson"]["id"] == "lesson-cbt-gang-system-process-layout"), None)
    change = next((c for c in manifest.get("canonicalQuestionChanges", []) if c["question"]["id"] == "U-649"), None)
    check(
        "theory_lesson_addition",
        bool(lesson)
        and lesson["lesson"]["sourceNeeded"] is True
        and lesson["lesson"]["publication"]["readiness"] == "blocked"
        and lesson["directExternalIds"] == ["2015-2-Q23", "2018-4-Q35"],
        "U-649 theory lesson addition contract failed",
    )
    check(
        "canonical_question_change",
        bool(change)
        and change["action"] == "replace"
        and change["question"]["lessonId"] == "lesson-cbt-gang-system-process-layout"
        and change["question"]["correctChoiceId"] == "U-649-c1"
        and change["affectedExternalIds"] == ["2015-2-Q23", "2018-4-Q35"],
        "U-649 canonical change contract failed",
    )
    check("theory_additions_sha", sha_text(compact(manifest.get("theoryLessonAdditions", []))) == manifest.get("theoryLessonAdditionsSha256"), "theory additions SHA mismatch")
    check("canonical_changes_sha", sha_text(compact(manifest.get("canonicalQuestionChanges", []))) == manifest.get("canonicalQuestionChangesSha256"), "canonical changes SHA mismatch")

    binding = read_json(OUT / "content-binding-validation.json")
    check(
        "content_hash_binding",
        binding["bindingHashesMatch"] is True
        and binding["expectedContentSha256"] == EXPECTED_CONTENT_SHA
        and binding["repositoryContentFilePackaged"] is False,
        "content hash binding failed",
    )
    check("mapping_input_sha", sha_file(OUT / "mapping-dry-run-input.jsonl") == EXPECTED_MAPPING_SHA, "mapping input SHA mismatch")

    policy = manifest.get("holdResolutionPolicy", {})
    check(
        "cumulative_hold_policy",
        policy.get("imageVerificationQueueCount") == 59
        and policy.get("normalizedAndRegisteredCount") == 5
        and policy.get("choiceConflictNonScoringCount") == 15
        and policy.get("lowContextRegisteredCount") == 71
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
        "recordCount": 200,
        "cumulativeRecordCount": len(manifest["records"]),
        "manifestSha256": sha_file(MANIFEST_PATH),
        "recordsSha256": manifest["recordsSha256"],
    }
    (OUT / "independent-validation.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
