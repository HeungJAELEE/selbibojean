from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-10"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
EXPECTED_PRIOR_RECORDS_SHA = "3e10c692103b8e5e3297b3fec0e6f20f45ef061f21f8b0b21e15e13b5dbe168a"
EXPECTED_CONTENT_SHA = "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"
EXPECTED_MAPPING_SHA = "6a03617e3c2c36973c08b36bdd7c6119c5a73974c9fb2cf641cff246d00c21fc"
EXPECTED_CANONICAL_REFERENCE_SHA = "e7deabe7dd47bc328c81fa17cd1428885ab7abaf8f6886dc40eb02f2f800c30e"
IMAGE_HOLD_IDS = {
    "2019-2-Q94", "2019-2-Q99", "2020-12B-Q05", "2020-12B-Q08",
    "2020-12B-Q10", "2020-12B-Q85", "2020-12B-Q87", "2020-3B-Q04",
    "2020-3B-Q14", "2020-3B-Q39",
}
CHOICE_CONFLICTS = {
    "2019-2-Q86": [0, 3],
    "2020-12B-Q92": [2, 3],
}
ANSWER_KEY_CONFLICT_ID = "2020-3B-Q28"
REASSIGNMENTS = {
    "2020-12B-Q75": {
        "current": "U-325", "target": "U-787", "lesson": "lesson-1kx5x2w",
        "anchor": "trap", "group": "s4-g08", "concept": "concept-1kx5x2w",
    },
    "2020-3B-Q26": {
        "current": "U-060", "target": "U-1109", "lesson": "lesson-c16ieq",
        "anchor": "principle", "group": "s4-g09", "concept": "concept-c16ieq",
    },
}
REPAIR_ID = "2020-12B-Q86"


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
    batch_records = records[1770:1970]
    expected_ids = read_json(OUT / "external-ids.json")
    dry_rows = read_jsonl(OUT / "mapping-dry-run-input.jsonl")
    dry_by_id = {row["externalId"]: row for row in dry_rows}
    canonical_refs = {row["canonicalId"]: row for row in read_jsonl(OUT / "canonical-reference-ledger.jsonl")}
    batch = next((b for b in manifest.get("batches", []) if b.get("batchId") == "import-10"), None)

    review_rows: list[dict[str, Any]] = []
    if batch:
        for source_file in batch["sourceFiles"]:
            review_rows.extend(read_jsonl(ROOT / source_file["path"]))
    review_by_id = {row["externalId"]: row for row in review_rows}

    check("record_count", len(records) == 1970, "manifest record count is not 1970")
    check("batch_slice_count", len(batch_records) == 200, "batch 10 slice is not 200")
    check("unique_external_ids", len({r.get("externalId") for r in records}) == 1970, "external IDs are not unique")
    check("records_sha", sha_text(compact(records)) == manifest.get("recordsSha256"), "records SHA mismatch")
    check("prior_records_unchanged", sha_text(compact(records[:1770])) == EXPECTED_PRIOR_RECORDS_SHA, "prior 1770 records changed")
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
    check("state_counts", state_counts == Counter({"candidate": 187, "hold": 11, "choice_conflict": 2}), f"batch states unexpected: {dict(state_counts)}")
    cumulative = Counter(r.get("review", {}).get("runtimeStatus") for r in records)
    check("cumulative_state_counts", cumulative == Counter({"candidate": 1875, "hold": 77, "choice_conflict": 18}), f"cumulative states unexpected: {dict(cumulative)}")

    source_hashes_ok = True
    candidate_answers_ok = True
    image_holds_disabled_ok = True
    answer_key_conflict_disabled_ok = True
    conflicts_disabled_ok = True
    full_mappings_ok = True
    variants_blocked_ok = True
    theory_links_ok = True
    low_context_ok = True

    direct_rows = read_jsonl(OUT / "direct-theory-link-matrix.jsonl")
    direct_by_id = {row["externalId"]: row for row in direct_rows}

    low_context_ids = set(batch.get("holdResolution", {}).get("lowContextRegistered", [])) if batch else set()

    for record in batch_records:
        eid = record["externalId"]
        review = review_by_id.get(eid)
        dry = dry_by_id.get(eid)
        direct = direct_by_id.get(eid)
        if not review or not dry or not direct:
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
        elif eid in IMAGE_HOLD_IDS:
            image_holds_disabled_ok &= (
                status == "hold"
                and record.get("reviewedAnswerIndex") is None
                and record.get("reviewedAnswerText") == ""
                and record.get("choiceIdMapping") == []
                and record["review"].get("issueLabel") == "필수 이미지 확인"
                and record["review"]["publicationBlockers"] == ["required_source_image_review"]
            )
        elif eid == ANSWER_KEY_CONFLICT_ID:
            answer_key_conflict_disabled_ok &= (
                status == "hold"
                and record.get("reviewedAnswerIndex") is None
                and record.get("reviewedAnswerText") == ""
                and record.get("choiceIdMapping") == []
                and record["review"].get("issueLabel") == "정답키 충돌"
                and record["review"].get("scoringDisposition") == "excluded_answer_key_conflict"
                and "answer_key_correction_pending_runtime_validation" in record["review"]["publicationBlockers"]
                and record["migration"].get("mappingClass") == "ANSWER_KEY_CONFLICT_HOLD"
            )
        elif eid in CHOICE_CONFLICTS:
            conflicts_disabled_ok &= (
                status == "choice_conflict"
                and record.get("reviewedAnswerIndex") is None
                and record.get("reviewedAnswerText") == ""
                and record.get("choiceIdMapping") == []
                and record.get("choiceConflict", {}).get("scoringPolicy") == "non_scoring"
                and record.get("choiceConflict", {}).get("choiceIndices") == CHOICE_CONFLICTS[eid]
                and record["directSolution"].startswith("선택지 충돌:")
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

        if eid in low_context_ids:
            low_context_ok &= (
                status == "candidate"
                and record["review"]["theoryLinkStatus"] == "direct_existing_theory_low_context_exam_intent"
                and bool(record["review"]["answerConflictOrMultipleAnswerRisk"])
            )

    check("source_identity_hashes", source_hashes_ok, "record source identity/hash mismatch")
    check("candidate_answers", candidate_answers_ok, "candidate answer contract failed")
    check("image_holds_disabled", image_holds_disabled_ok, "image HOLD gate failed")
    check("answer_key_conflict_disabled", answer_key_conflict_disabled_ok, "answer-key conflict gate failed")
    check("conflicts_disabled", conflicts_disabled_ok, "choice conflict gate failed")
    check("full_choice_mappings", full_mappings_ok, "full choice mapping invalid")
    check("variant_specific_blocked", variants_blocked_ok, "variant-specific gate failed")
    check("theory_links", theory_links_ok and len(direct_rows) == 200, "direct theory link mismatch")
    check("low_context_policy", low_context_ok and len(low_context_ids) == 31, "low-context risk policy mismatch")

    check("full_mapping_count", sum(bool(r.get("choiceIdMapping")) for r in batch_records) == 39, "full mapping count is not 39")
    check("variant_specific_count", sum(bool(r.get("variantSpecificFeedbackRequired")) for r in batch_records) == 148, "variant-specific count is not 148")
    check("formula_count", sum(r.get("formulaUnitSubstitution") is not None for r in batch_records) == 7, "formula count is not 7")
    check("low_context_count", len(low_context_ids) == 31, "low-context count is not 31")

    queue_specs = {
        "image_queue": ("image-verification-queue.jsonl", IMAGE_HOLD_IDS),
        "choice_conflict_queue": ("choice-conflict-queue.jsonl", set(CHOICE_CONFLICTS)),
        "answer_key_conflict_queue": ("answer-key-conflict-queue.jsonl", {ANSWER_KEY_CONFLICT_ID}),
        "variant_specific_queue": ("variant-specific-choice-contract-queue.jsonl", {r["externalId"] for r in batch_records if r.get("variantSpecificFeedbackRequired")}),
        "low_context_queue": ("low-context-registration-ledger.jsonl", low_context_ids),
        "canonical_reassignment_queue": ("canonical-reassignment-ledger.jsonl", set(REASSIGNMENTS)),
        "canonical_repair_queue": ("canonical-theory-repair-ledger.jsonl", {REPAIR_ID}),
    }
    for name, (file_name, expected) in queue_specs.items():
        actual = {row["externalId"] for row in read_jsonl(OUT / file_name)}
        check(name, actual == expected, f"{name} exact set mismatch")

    check("manual_mapping_empty", read_jsonl(OUT / "manual-choice-mapping-ledger.jsonl") == [], "manual mapping ledger is not empty")
    correction_rows = read_jsonl(OUT / "answer-key-correction-ledger.jsonl")
    check(
        "answer_key_correction_not_applied",
        len(correction_rows) == 1
        and correction_rows[0]["externalId"] == ANSWER_KEY_CONFLICT_ID
        and correction_rows[0]["applied"] is False
        and correction_rows[0]["runtimeStatus"] == "hold",
        "answer-key correction ledger was applied or malformed",
    )

    reassign_ok = True
    for eid, expected in REASSIGNMENTS.items():
        record = next((r for r in batch_records if r["externalId"] == eid), None)
        reassign_ok &= bool(record) and (
            record["currentCanonicalId"] == expected["current"]
            and record["canonicalId"] == expected["target"]
            and record["theoryLink"]["lessonId"] == expected["lesson"]
            and record["theoryLink"]["lessonAnchor"] == expected["anchor"]
            and record["theoryLink"]["conceptGroupId"] == expected["group"]
            and record["theoryLink"]["conceptId"] == expected["concept"]
            and record["migration"]["mappingClass"] == "SEMANTIC_REPLACE"
            and record["migration"]["canonicalAction"] == "REASSIGN_CANONICAL"
        )
    check("canonical_reassignments", reassign_ok, "semantic canonical reassignment mismatch")

    repaired = next((r for r in batch_records if r["externalId"] == REPAIR_ID), None)
    repair_ok = bool(repaired) and (
        repaired["currentCanonicalId"] == "U-478"
        and repaired["canonicalId"] == "U-478"
        and repaired["theoryLink"] == {
            "canonicalId": "U-478",
            "lessonId": "lesson-qnsesu",
            "lessonAnchor": "trap",
            "conceptGroupId": "s1-g06",
            "conceptId": "concept-qnsesu",
            "canonicalStem": "텔레스코프형 실린더에 관한 설명으로 옳지 않은 것은?",
        }
        and repaired["migration"]["canonicalAction"] == "APPLY_CANONICAL_OVERLAY"
        and repaired["migration"]["theoryAction"] == "RELINK_CANONICAL_TO_EXISTING_THEORY_GROUP"
    )
    check("canonical_theory_repair", repair_ok, "U-478 taxonomy repair mismatch")

    batch_theory = read_json(OUT / "theory-lesson-additions.json")
    batch_changes = read_json(OUT / "canonical-question-changes.json")
    change = batch_changes[0] if len(batch_changes) == 1 else None
    check("batch_theory_additions_empty", batch_theory == [], "batch theory additions are not empty")
    check(
        "canonical_overlay",
        bool(change)
        and change["action"] == "replace"
        and change["question"]["id"] == "U-478"
        and change["question"]["conceptGroupId"] == "s1-g06"
        and change["question"]["lessonId"] == "lesson-qnsesu"
        and change["question"]["correctChoiceId"] == "U-478-c2"
        and change["question"]["publication"]["readiness"] == "blocked"
        and "canonical_theory_repair_runtime_validation" in change["question"]["publication"]["blockers"]
        and change["affectedExternalIds"] == ["2007-4-Q84", "2020-12B-Q86"],
        "U-478 canonical overlay mismatch",
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
    check("canonical_reference_sha", sha_file(OUT / "canonical-reference-ledger.jsonl") == EXPECTED_CANONICAL_REFERENCE_SHA, "canonical reference SHA mismatch")

    policy = manifest.get("holdResolutionPolicy", {})
    check(
        "cumulative_hold_policy",
        policy.get("imageVerificationQueueCount") == 76
        and policy.get("normalizedAndRegisteredCount") == 5
        and policy.get("choiceConflictNonScoringCount") == 18
        and policy.get("lowContextRegisteredCount") == 128
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
    text = json.dumps(output, ensure_ascii=False, indent=2) + "\n"
    (OUT / "independent-validation.json").write_text(text, encoding="utf-8")
    (OUT / "independent-validation-run.log").write_text(text, encoding="utf-8")
    print(text)
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
