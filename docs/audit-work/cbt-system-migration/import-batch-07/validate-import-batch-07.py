from __future__ import annotations

import copy
import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-07"
MANIFEST = ROOT / "src/data/generated/cbt-reviewed-variants.json"
EXPECTED_PRIOR_RECORDS_SHA = "60691b8ed34fc7b386fe0d12533c26fbd2d9df9ef286c217b8f4fd5cf39159e5"
EXPECTED_CONTENT_SHA = "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"
EXPECTED_MAPPING_SHA = "302f58f43bcec93539be7af38f8657e42bad3d37004f85e4f41d5c797c9e50d9"
HOLD_IDS = {
    "2016-4-Q10",
    "2016-4-Q26",
    "2016-4-Q58",
    "2017-2-Q32",
    "2017-2-Q33",
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
    return [
        json.loads(line)
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def exact_set(left: list[str], right: list[str]) -> bool:
    return len(left) == len(right) and set(left) == set(right)


def validate(manifest: dict[str, Any]) -> tuple[dict[str, bool], list[str]]:
    failures: list[str] = []
    checks: dict[str, bool] = {}

    records = manifest.get("records", [])
    batch_records = records[1200:1370]
    records_by_id = {record.get("externalId"): record for record in batch_records}
    expected_ids = read_json(OUT / "external-ids.json")
    dry_rows = read_jsonl(OUT / "mapping-dry-run-input.jsonl")
    dry_by_id = {row["externalId"]: row for row in dry_rows}
    review_rows: list[dict[str, Any]] = []
    batch = next(
        (batch for batch in manifest.get("batches", []) if batch.get("batchId") == "import-07"),
        None,
    )
    if batch:
        for source_file in batch["sourceFiles"]:
            review_rows.extend(read_jsonl(ROOT / source_file["path"]))
    review_by_id = {row["externalId"]: row for row in review_rows}

    def record_check(name: str, condition: bool, failure: str) -> None:
        checks[name] = bool(condition)
        if not condition:
            failures.append(failure)

    record_check("record_count", len(records) == 1370, "manifest record count is not 1370")
    record_check("batch_slice_count", len(batch_records) == 170, "batch 07 slice is not 170")
    record_check(
        "unique_external_ids",
        len({record.get("externalId") for record in records}) == 1370,
        "manifest external IDs are not unique",
    )
    record_check(
        "records_sha",
        sha_text(compact(records)) == manifest.get("recordsSha256"),
        "manifest recordsSha256 mismatch",
    )
    record_check(
        "prior_records_unchanged",
        sha_text(compact(records[:1200])) == EXPECTED_PRIOR_RECORDS_SHA,
        "prior 1200 records changed",
    )
    record_check(
        "ordered_external_ids",
        [record.get("externalId") for record in batch_records] == expected_ids,
        "batch 07 ordered external IDs mismatch",
    )
    record_check(
        "dryrun_exact_set",
        [row["externalId"] for row in dry_rows] == expected_ids,
        "dry-run mapping order/exact set mismatch",
    )
    record_check(
        "review_exact_set",
        exact_set([row["externalId"] for row in review_rows], expected_ids),
        "source review exact set mismatch",
    )
    record_check("batch_metadata_present", batch is not None, "batch 07 metadata missing")

    if batch:
        source_hashes_ok = all(
            sha_file(ROOT / source_file["path"]) == source_file["sha256"]
            for source_file in batch["sourceFiles"]
        )
        record_check("source_file_hashes", source_hashes_ok, "source review SHA mismatch")

    state_counts = Counter(
        record.get("review", {}).get("runtimeStatus") for record in batch_records
    )
    record_check(
        "state_counts",
        state_counts == Counter({"candidate": 165, "hold": 5}),
        f"unexpected batch state counts: {dict(state_counts)}",
    )
    cumulative_counts = Counter(
        record.get("review", {}).get("runtimeStatus") for record in records
    )
    record_check(
        "cumulative_state_counts",
        cumulative_counts
        == Counter({"candidate": 1305, "hold": 51, "choice_conflict": 14}),
        f"unexpected cumulative state counts: {dict(cumulative_counts)}",
    )

    source_hashes_ok = True
    theory_links_ok = True
    candidate_answers_ok = True
    holds_disabled_ok = True
    full_choice_mapping_ok = True
    variant_specific_blocked_ok = True
    no_reassignment_ok = True
    low_context_ok = True

    for record in batch_records:
        external_id = record["externalId"]
        review = review_by_id.get(external_id)
        dry = dry_by_id.get(external_id)
        if not review or not dry:
            failures.append(f"{external_id}: missing review or dry-run row")
            continue

        source_hashes_ok &= (
            sha_text(record["stem"]) == record["source"]["stemSha256"]
            and sha_text(compact(record["choices"]))
            == record["source"]["orderedChoicesSha256"]
            and record["source"]["registeredIdentitySha256"]
            == review["identity"]["registeredIdentitySha256"]
            and record["source"]["resolvedIdentitySha256"]
            == review["identity"]["sourceIdentitySha256"]
        )

        theory = record.get("theoryLink") or {}
        target_theory = dry["decision"]["targetCanonicalTheoryLink"]
        theory_links_ok &= all(
            theory.get(key) == review["theoryLink"][key] == target_theory[key]
            for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"]
        )

        status = record["review"]["runtimeStatus"]
        if status == "candidate":
            candidate_answers_ok &= (
                isinstance(record.get("reviewedAnswerIndex"), int)
                and bool(record.get("reviewedAnswerText"))
                and "pending_runtime_integration"
                in record["review"]["publicationBlockers"]
            )
        if status == "hold":
            holds_disabled_ok &= (
                external_id in HOLD_IDS
                and record.get("reviewedAnswerIndex") is None
                and record.get("reviewedAnswerText") == ""
                and record.get("choiceIdMapping") == []
                and record["review"].get("issueLabel") == "필수 이미지 확인"
                and record["review"]["publicationBlockers"]
                == ["required_source_image_review"]
            )

        mapping = record.get("choiceIdMapping") or []
        if mapping:
            canonical_id = record["canonicalId"]
            canonical_answer_index = dry["currentSystem"]["canonicalAnswerIndex"]
            reviewed_answer_index = record["reviewedAnswerIndex"]
            full_choice_mapping_ok &= (
                len(mapping) == len(record["choices"])
                and len(set(mapping)) == len(mapping)
                and all(
                    re.fullmatch(re.escape(canonical_id) + r"-c[1-5]", choice_id)
                    for choice_id in mapping
                )
                and isinstance(reviewed_answer_index, int)
                and 0 <= reviewed_answer_index < len(mapping)
                and mapping[reviewed_answer_index]
                == f"{canonical_id}-c{canonical_answer_index + 1}"
            )

        if record.get("variantSpecificFeedbackRequired"):
            variant_specific_blocked_ok &= (
                mapping == []
                and "variant_specific_choice_contract_pending"
                in record["review"]["publicationBlockers"]
            )

        no_reassignment_ok &= (
            record["currentCanonicalId"] == record["canonicalId"]
            and record["migration"]["canonicalAction"] == "KEEP_CURRENT_CANONICAL"
            and dry["decision"]["currentCanonicalId"]
            == dry["decision"]["targetCanonicalId"]
        )

        if review.get("riskNote"):
            low_context_ok &= (
                status == "candidate"
                and record["review"]["theoryLinkStatus"]
                == "direct_existing_theory_low_context_exam_intent"
                and record["review"]["answerConflictOrMultipleAnswerRisk"]
                == review["riskNote"]
            )

    record_check("source_identity_hashes", source_hashes_ok, "record source identity/hash mismatch")
    record_check("theory_links", theory_links_ok, "direct theory link mismatch")
    record_check("candidate_answers", candidate_answers_ok, "candidate answer contract failed")
    record_check("holds_disabled", holds_disabled_ok, "image HOLD answer gate failed")
    record_check("full_choice_mappings", full_choice_mapping_ok, "full choice mapping invalid")
    record_check(
        "variant_specific_blocked",
        variant_specific_blocked_ok,
        "variant-specific publication gate failed",
    )
    record_check("no_canonical_reassignment", no_reassignment_ok, "unexpected canonical reassignment")
    record_check("low_context_policy", low_context_ok, "low-context policy mismatch")

    record_check(
        "full_mapping_count",
        sum(bool(record.get("choiceIdMapping")) for record in batch_records) == 29,
        "full canonical choice mapping count is not 29",
    )
    record_check(
        "variant_specific_count",
        sum(bool(record.get("variantSpecificFeedbackRequired")) for record in batch_records)
        == 136,
        "variant-specific contract count is not 136",
    )
    record_check(
        "formula_count",
        sum(record.get("formulaUnitSubstitution") is not None for record in batch_records)
        == 8,
        "formula-unit-substitution count is not 8",
    )
    record_check(
        "low_context_count",
        sum(
            record.get("review", {}).get("theoryLinkStatus")
            == "direct_existing_theory_low_context_exam_intent"
            for record in batch_records
        )
        == 32,
        "low-context record count is not 32",
    )

    queue_specs = {
        "image_queue": ("image-verification-queue.jsonl", HOLD_IDS),
        "variant_specific_queue": (
            "variant-specific-choice-contract-queue.jsonl",
            {
                record["externalId"]
                for record in batch_records
                if record.get("variantSpecificFeedbackRequired")
            },
        ),
        "low_context_queue": (
            "low-context-registration-ledger.jsonl",
            {
                record["externalId"]
                for record in batch_records
                if record["review"]["theoryLinkStatus"]
                == "direct_existing_theory_low_context_exam_intent"
            },
        ),
    }
    for name, (path_name, expected) in queue_specs.items():
        actual = {row["externalId"] for row in read_jsonl(OUT / path_name)}
        record_check(name, actual == expected, f"{name} exact set mismatch")

    empty_ledgers_ok = all(
        not read_jsonl(OUT / file_name)
        for file_name in [
            "choice-conflict-queue.jsonl",
            "canonical-reassignment-ledger.jsonl",
            "answer-key-correction-ledger.jsonl",
            "manual-choice-mapping-ledger.jsonl",
        ]
    )
    record_check("empty_special_ledgers", empty_ledgers_ok, "unexpected special ledger entry")

    content_binding = read_json(OUT / "content-binding-validation.json")
    mapping_summary = read_json(OUT / "mapping-source-summary.json")
    prior_validation = read_json(
        ROOT / "docs/audit-work/cbt-system-migration/import-batch-06/final-validation.json"
    )
    record_check(
        "content_hash_binding",
        content_binding["bindingHashesMatch"] is True
        and content_binding["expectedContentSha256"] == EXPECTED_CONTENT_SHA
        and mapping_summary["inputs"]["contentSha256"] == EXPECTED_CONTENT_SHA
        and prior_validation["sourceIntegrity"]["contentJsonSha256"]
        == EXPECTED_CONTENT_SHA,
        "content hash binding failed",
    )
    record_check(
        "mapping_input_sha",
        sha_file(OUT / "mapping-dry-run-input.jsonl") == EXPECTED_MAPPING_SHA,
        "dry-run mapping input SHA mismatch",
    )

    hold_policy = manifest.get("holdResolutionPolicy", {})
    record_check(
        "cumulative_hold_policy",
        hold_policy.get("imageVerificationQueueCount") == 51
        and hold_policy.get("normalizedAndRegisteredCount") == 5
        and hold_policy.get("choiceConflictNonScoringCount") == 14
        and hold_policy.get("lowContextRegisteredCount") == 41
        and hold_policy.get("learnerPublicationStillRequiresStatus") == "published",
        "cumulative hold policy counts changed",
    )

    return checks, failures


def main() -> None:
    manifest = read_json(MANIFEST)
    checks, failures = validate(manifest)
    output = {
        "status": "PASS" if not failures else "FAIL",
        "checks": checks,
        "failures": failures,
        "recordCount": 170,
        "cumulativeRecordCount": len(manifest["records"]),
        "manifestSha256": sha_file(MANIFEST),
        "recordsSha256": manifest["recordsSha256"],
    }
    (OUT / "independent-validation.json").write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(output, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
