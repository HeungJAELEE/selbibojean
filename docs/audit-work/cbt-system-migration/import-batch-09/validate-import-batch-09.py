from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-09"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
EXPECTED_PRIOR_RECORDS_SHA = "058f348998cabc060faa93180071611e05d417acc2e3b729363a28ae5f113c5a"
EXPECTED_CONTENT_SHA = "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"
EXPECTED_MAPPING_SHA = "f2b489e40f5fbe9dd632a8866e23aba0eaa6b27bf25bc7159f8744b5a239b6f6"
IMAGE_HOLD_IDS = {
    "2018-4-Q89", "2019-1-Q01", "2019-1-Q91", "2019-1-Q92",
    "2019-1-Q98", "2019-2-Q21", "2019-2-Q35",
}
CHOICE_CONFLICT_IDS = {"2019-2-Q32"}


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
    batch_records = records[1570:1770]
    expected_ids = read_json(OUT / "external-ids.json")
    dry_rows = read_jsonl(OUT / "mapping-dry-run-input.jsonl")
    dry_by_id = {row["externalId"]: row for row in dry_rows}
    batch = next((b for b in manifest.get("batches", []) if b.get("batchId") == "import-09"), None)
    review_rows: list[dict[str, Any]] = []
    if batch:
        for source_file in batch["sourceFiles"]:
            review_rows.extend(read_jsonl(ROOT / source_file["path"]))
    review_by_id = {row["externalId"]: row for row in review_rows}

    check("record_count", len(records) == 1770, "manifest record count is not 1770")
    check("batch_slice_count", len(batch_records) == 200, "batch 09 slice is not 200")
    check("unique_external_ids", len({r.get("externalId") for r in records}) == 1770, "external IDs are not unique")
    check("records_sha", sha_text(compact(records)) == manifest.get("recordsSha256"), "records SHA mismatch")
    check("prior_records_unchanged", sha_text(compact(records[:1570])) == EXPECTED_PRIOR_RECORDS_SHA, "prior 1570 records changed")
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
    check("state_counts", state_counts == Counter({"candidate": 192, "hold": 7, "choice_conflict": 1}), f"batch states unexpected: {dict(state_counts)}")
    cumulative = Counter(r.get("review", {}).get("runtimeStatus") for r in records)
    check("cumulative_state_counts", cumulative == Counter({"candidate": 1688, "hold": 66, "choice_conflict": 16}), f"cumulative states unexpected: {dict(cumulative)}")

    source_hashes_ok = True
    candidate_answers_ok = True
    holds_disabled_ok = True
    conflicts_disabled_ok = True
    full_mappings_ok = True
    variants_blocked_ok = True
    theory_links_ok = True
    low_context_ok = True
    canonical_preserved_ok = True

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
                and record.get("choiceConflict", {}).get("choiceIndices") == [1, 2]
                and record["directSolution"].startswith("선택지 충돌:")
            )

        mapping = record.get("choiceIdMapping") or []
        if mapping:
            full_mappings_ok &= (
                len(mapping) == len(record["choices"])
                and len(set(mapping)) == len(mapping)
                and all(re.fullmatch(re.escape(record["canonicalId"]) + r"-c[1-5]", choice_id) for choice_id in mapping)
                and isinstance(record.get("reviewedAnswerIndex"), int)
                and mapping[record["reviewedAnswerIndex"]] == f"{record['canonicalId']}-c{dry['currentSystem']['canonicalAnswerIndex'] + 1}"
            )
        if record.get("variantSpecificFeedbackRequired"):
            variants_blocked_ok &= (
                mapping == []
                and "variant_specific_choice_contract_pending" in record["review"]["publicationBlockers"]
            )

        target = dry["decision"]["targetCanonicalTheoryLink"]
        theory_links_ok &= all(record["theoryLink"].get(key) == target.get(key) for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"])
        canonical_preserved_ok &= (
            record["currentCanonicalId"] == record["canonicalId"]
            and record["migration"]["canonicalAction"] in {"KEEP_CURRENT_CANONICAL", "PRESERVE_CURRENT_MAPPING_PENDING_REVIEW"}
        )

        if review.get("riskNote") and status == "candidate":
            low_context_ok &= (
                record["review"]["answerConflictOrMultipleAnswerRisk"] == review["riskNote"]
                and record["review"]["theoryLinkStatus"] == "direct_existing_theory_low_context_exam_intent"
            )

    check("source_identity_hashes", source_hashes_ok, "record source identity/hash mismatch")
    check("candidate_answers", candidate_answers_ok, "candidate answer contract failed")
    check("holds_disabled", holds_disabled_ok, "image HOLD gate failed")
    check("conflicts_disabled", conflicts_disabled_ok, "choice conflict gate failed")
    check("full_choice_mappings", full_mappings_ok, "full choice mapping invalid")
    check("variant_specific_blocked", variants_blocked_ok, "variant-specific gate failed")
    check("theory_links", theory_links_ok, "direct theory link mismatch")
    check("low_context_policy", low_context_ok, "low-context risk policy mismatch")
    check("canonical_preserved", canonical_preserved_ok, "unexpected canonical reassignment/overlay")

    check("full_mapping_count", sum(bool(r.get("choiceIdMapping")) for r in batch_records) == 28, "full mapping count is not 28")
    check("variant_specific_count", sum(bool(r.get("variantSpecificFeedbackRequired")) for r in batch_records) == 164, "variant-specific count is not 164")
    check("formula_count", sum(r.get("formulaUnitSubstitution") is not None for r in batch_records) == 12, "formula count is not 12")
    check("low_context_count", len(batch.get("holdResolution", {}).get("lowContextRegistered", [])) == 26 if batch else False, "low-context count is not 26")

    queue_specs = {
        "image_queue": ("image-verification-queue.jsonl", IMAGE_HOLD_IDS),
        "choice_conflict_queue": ("choice-conflict-queue.jsonl", CHOICE_CONFLICT_IDS),
        "variant_specific_queue": ("variant-specific-choice-contract-queue.jsonl", {r["externalId"] for r in batch_records if r.get("variantSpecificFeedbackRequired")}),
        "low_context_queue": ("low-context-registration-ledger.jsonl", set(batch["holdResolution"]["lowContextRegistered"]) if batch else set()),
        "canonical_reassignment_queue": ("canonical-reassignment-ledger.jsonl", set()),
        "canonical_repair_queue": ("canonical-theory-repair-impact-ledger.jsonl", set()),
    }
    for name, (file_name, expected) in queue_specs.items():
        actual = {row["externalId"] for row in read_jsonl(OUT / file_name)}
        check(name, actual == expected, f"{name} exact set mismatch")

    check(
        "empty_ledgers",
        all(not read_jsonl(OUT / file_name) for file_name in [
            "answer-key-correction-ledger.jsonl",
            "manual-choice-mapping-ledger.jsonl",
            "canonical-reassignment-ledger.jsonl",
            "canonical-theory-repair-impact-ledger.jsonl",
        ]),
        "unexpected answer/manual/canonical ledger entry",
    )
    check("batch_theory_additions_empty", read_json(OUT / "theory-lesson-additions.json") == [], "batch theory additions are not empty")
    check("batch_canonical_changes_empty", read_json(OUT / "canonical-question-changes.json") == [], "batch canonical changes are not empty")
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
        policy.get("imageVerificationQueueCount") == 66
        and policy.get("normalizedAndRegisteredCount") == 5
        and policy.get("choiceConflictNonScoringCount") == 16
        and policy.get("lowContextRegisteredCount") == 97
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
