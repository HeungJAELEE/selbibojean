from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-12"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
EXPECTED_PRIOR_RECORDS_SHA = "36f0ba1340ae854d10015eef0aacc5f0445248c809a270f569f07e8d0a8cd0e8"
EXPECTED_CONTENT_SHA = "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"
EXPECTED_MAPPING_SHA = "383bb49174d6e3fa72b4a7166863cb97833879feae311dd8757d96f08d84952e"
EXPECTED_CANONICAL_REFERENCE_SHA = "a4f0f4ea5e8537c1337558426b5ac319bb3dc2042126a4f17ecd51c6f87e08f3"
EXPECTED_GLOBAL_THEORY_ADDITIONS_SHA = "ee7d8abaa2201e6df64de4616c21f1304a36eaede75cb92a748968d2e61466de"
EXPECTED_GLOBAL_CANONICAL_CHANGES_SHA = "ea6e43f139345e607eb2e5dbe940093e7fe4acb443263a87f12c968c844b7f80"

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
REASSIGNMENTS: dict[str, dict[str, str]] = {
    "2022-1-Q02": {
        "current": "U-RMS-001",
        "target": "U-812",
        "lesson": "lesson-68po9a",
        "anchor": "principle",
        "group": "s4-g02",
        "concept": "concept-68po9a",
    },
    "2022-1-Q31": {
        "current": "U-187",
        "target": "U-829",
        "lesson": "lesson-qih1ef",
        "anchor": "principle",
        "group": "s4-g08",
        "concept": "concept-qih1ef",
    },
    "2022-1-Q43": {
        "current": "U-197",
        "target": "U-136",
        "lesson": "lesson-o98wx8",
        "anchor": "diagnosis",
        "group": "s3-g06",
        "concept": "concept-o98wx8",
    },
    "2022-1-Q70": {
        "current": "U-210",
        "target": "U-1180",
        "lesson": "lesson-1mpu74e",
        "anchor": "principle",
        "group": "s1-g12",
        "concept": "concept-1mpu74e",
    },
    "2022-2-Q40": {
        "current": "U-233",
        "target": "U-640",
        "lesson": "lesson-17ocpdn",
        "anchor": "trap",
        "group": "s4-g12",
        "concept": "concept-17ocpdn",
    },
    "2022-2-Q44": {
        "current": "U-237",
        "target": "U-661",
        "lesson": "lesson-z6u1mg",
        "anchor": "principle",
        "group": "s3-g03",
        "concept": "concept-z6u1mg",
    },
}
PENDING_TAXONOMY_REPAIRS: dict[str, dict[str, str]] = {
    "2022-1-Q61": {
        "canonical": "U-208",
        "lesson": "lesson-kea5hx",
        "anchor": "principle",
        "current_group": "s1-g08",
        "concept": "concept-kea5hx",
        "source_blocker": "direct_concept_group_taxonomy_mismatch_hydraulic_regeneration_in_pneumatic_group",
    },
    "2022-2-Q65": {
        "canonical": "U-250",
        "lesson": "lesson-ptw5i5",
        "anchor": "principle",
        "current_group": "s1-g02",
        "concept": "concept-ptw5i5",
        "source_blocker": "direct_concept_group_taxonomy_mismatch_pneumatic_stopper_cylinder_in_hydraulic_group",
    },
}
FORMULA_IDS = {
    "2021-2-Q01",
    "2021-2-Q06",
    "2021-2-Q17",
    "2021-2-Q45",
    "2021-4-Q05",
    "2021-4-Q18",
    "2022-1-Q25",
    "2022-1-Q55",
    "2022-1-Q80",
    "2022-2-Q14",
    "2022-2-Q22",
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
    return (
        len(left) == len(right)
        and len(set(left)) == len(left)
        and len(set(right)) == len(right)
        and set(left) == set(right)
    )


def validate(manifest: dict[str, Any]) -> tuple[dict[str, bool], list[str]]:
    failures: list[str] = []
    checks: dict[str, bool] = {}

    def check(name: str, condition: bool, failure: str) -> None:
        checks[name] = bool(condition)
        if not condition:
            failures.append(failure)

    records = manifest.get("records", [])
    batch_records = records[2162:2384]
    batch_by_id = {row["externalId"]: row for row in batch_records}
    expected_ids = read_json(OUT / "external-ids.json")
    dry_rows = read_jsonl(OUT / "mapping-dry-run-input.jsonl")
    dry_by_id = {row["externalId"]: row for row in dry_rows}
    canonical_refs = {
        row["canonicalId"]: row
        for row in read_jsonl(OUT / "canonical-reference-ledger.jsonl")
    }
    batch = next(
        (
            item
            for item in manifest.get("batches", [])
            if item.get("batchId") == "import-12"
        ),
        None,
    )

    review_rows: list[dict[str, Any]] = []
    if batch:
        for source_file in batch["sourceFiles"]:
            review_rows.extend(read_jsonl(ROOT / source_file["path"]))
    review_by_id = {row["externalId"]: row for row in review_rows}

    check("record_count", len(records) == 2384, "manifest record count is not 2384")
    check("batch_slice_count", len(batch_records) == 222, "batch 12 slice is not 222")
    check(
        "unique_external_ids",
        len({row.get("externalId") for row in records}) == 2384,
        "external IDs are not unique",
    )
    check(
        "records_sha",
        sha_text(compact(records)) == manifest.get("recordsSha256"),
        "records SHA mismatch",
    )
    check(
        "prior_records_unchanged",
        sha_text(compact(records[:2162])) == EXPECTED_PRIOR_RECORDS_SHA,
        "prior 2162 records changed",
    )
    check(
        "ordered_external_ids",
        [row.get("externalId") for row in batch_records] == expected_ids,
        "ordered external IDs mismatch",
    )
    check(
        "dryrun_exact_order",
        [row["externalId"] for row in dry_rows] == expected_ids,
        "dry-run exact order mismatch",
    )
    check(
        "review_exact_set",
        exact_set([row["externalId"] for row in review_rows], expected_ids),
        "review exact set mismatch",
    )
    check("batch_metadata_present", batch is not None, "batch metadata missing")

    if batch:
        check(
            "source_file_hashes",
            all(
                sha_file(ROOT / item["path"]) == item["sha256"]
                for item in batch["sourceFiles"]
            ),
            "source file SHA mismatch",
        )

    state_counts = Counter(
        row.get("review", {}).get("runtimeStatus") for row in batch_records
    )
    check(
        "state_counts",
        state_counts == Counter({"candidate": 210, "hold": 11, "choice_conflict": 1}),
        f"batch states unexpected: {dict(state_counts)}",
    )
    cumulative = Counter(
        row.get("review", {}).get("runtimeStatus") for row in records
    )
    check(
        "cumulative_state_counts",
        cumulative
        == Counter({"candidate": 2267, "hold": 98, "choice_conflict": 19}),
        f"cumulative states unexpected: {dict(cumulative)}",
    )

    direct_rows = read_jsonl(OUT / "direct-theory-link-matrix.jsonl")
    direct_by_id = {row["externalId"]: row for row in direct_rows}
    low_context_ids = (
        set(batch.get("holdResolution", {}).get("lowContextRegistered", []))
        if batch
        else set()
    )

    source_hashes_ok = True
    candidate_answers_ok = True
    image_holds_disabled_ok = True
    conflict_disabled_ok = True
    full_mappings_ok = True
    variants_blocked_ok = True
    theory_links_ok = True
    low_context_ok = True
    formula_structures_ok = True

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
            and sha_text(compact(record["choices"]))
            == record["source"]["orderedChoicesSha256"]
            and record["source"]["registeredIdentitySha256"]
            == source_review["identity"]["registeredIdentitySha256"]
            and record["source"]["resolvedIdentitySha256"]
            == source_review["identity"]["sourceIdentitySha256"]
        )

        status = record["review"]["runtimeStatus"]
        if status == "candidate":
            candidate_answers_ok &= (
                isinstance(record.get("reviewedAnswerIndex"), int)
                and bool(record.get("reviewedAnswerText"))
                and "pending_runtime_integration"
                in record["review"]["publicationBlockers"]
            )
        elif external_id in IMAGE_HOLD_IDS:
            image_holds_disabled_ok &= (
                status == "hold"
                and record.get("reviewedAnswerIndex") is None
                and record.get("reviewedAnswerText") == ""
                and record.get("choiceIdMapping") == []
                and record["review"].get("issueLabel") == "필수 이미지 확인"
                and record["review"].get("scoringDisposition")
                == "excluded_required_image"
                and record["review"]["publicationBlockers"]
                == ["required_source_image_review"]
                and record["migration"].get("mappingClass")
                == "IMAGE_VERIFICATION_HOLD"
            )
        elif external_id == CHOICE_CONFLICT_ID:
            conflict_disabled_ok &= (
                status == "choice_conflict"
                and record.get("reviewedAnswerIndex") is None
                and record.get("reviewedAnswerText") == ""
                and record.get("choiceIdMapping") == []
                and record["review"].get("issueLabel") == "선택지 충돌"
                and record["review"].get("scoringDisposition") == "non_scoring"
                and record["review"]["publicationBlockers"]
                == ["choice_conflict_non_scoring"]
                and record["migration"].get("mappingClass")
                == "CHOICE_CONFLICT_NON_SCORING"
                and record.get("choiceConflict", {}).get("choiceIndices")
                == CHOICE_CONFLICT_INDICES
                and record.get("choiceConflict", {}).get("scoringAllowed") is False
            )

        mapping = record.get("choiceIdMapping") or []
        if mapping:
            if record["canonicalId"] in canonical_refs:
                canonical_answer_index = canonical_refs[record["canonicalId"]][
                    "canonicalAnswerIndex"
                ]
            else:
                canonical_answer_index = dry["currentSystem"][
                    "canonicalAnswerIndex"
                ]
            full_mappings_ok &= (
                len(mapping) == len(record["choices"])
                and len(set(mapping)) == len(mapping)
                and all(
                    re.fullmatch(
                        re.escape(record["canonicalId"]) + r"-c[1-5]", choice_id
                    )
                    for choice_id in mapping
                )
                and isinstance(record.get("reviewedAnswerIndex"), int)
                and mapping[record["reviewedAnswerIndex"]]
                == f"{record['canonicalId']}-c{canonical_answer_index + 1}"
            )

        if record.get("variantSpecificFeedbackRequired"):
            variants_blocked_ok &= (
                mapping == []
                and "variant_specific_choice_contract_pending"
                in record["review"]["publicationBlockers"]
            )

        theory_links_ok &= (
            record["currentCanonicalId"] == direct["currentCanonicalId"]
            and record["canonicalId"] == direct["targetCanonicalId"]
            and record["theoryLink"]["lessonId"] == direct["lessonId"]
            and record["theoryLink"]["lessonAnchor"] == direct["lessonAnchor"]
            and record["theoryLink"]["conceptGroupId"]
            == direct["conceptGroupId"]
            and record["theoryLink"]["conceptId"] == direct["conceptId"]
            and bool(record.get("variantSpecificFeedbackRequired"))
            == direct["variantSpecificFeedbackRequired"]
        )

        if external_id in low_context_ids:
            acceptable_statuses = {
                "direct_existing_theory_low_context_exam_intent",
                "direct_existing_theory_taxonomy_gap_publication_held",
                "direct_target_canonical_theory",
            }
            low_context_ok &= (
                status == "candidate"
                and record["review"]["theoryLinkStatus"] in acceptable_statuses
                and bool(record["review"]["answerConflictOrMultipleAnswerRisk"])
            )

        if external_id in FORMULA_IDS:
            formula = record.get("formulaUnitSubstitution")
            formula_structures_ok &= (
                isinstance(formula, dict)
                and all(bool(formula.get(key)) for key in ("formula", "units", "substitution", "result"))
            )

    check("source_identity_hashes", source_hashes_ok, "record source identity/hash mismatch")
    check("candidate_answers", candidate_answers_ok, "candidate answer contract failed")
    check("image_holds_disabled", image_holds_disabled_ok, "image HOLD gate failed")
    check("choice_conflict_disabled", conflict_disabled_ok, "choice conflict gate failed")
    check("full_choice_mappings", full_mappings_ok, "full choice mapping invalid")
    check("variant_specific_blocked", variants_blocked_ok, "variant-specific gate failed")
    check(
        "theory_links",
        theory_links_ok and len(direct_rows) == 222,
        "direct theory link mismatch",
    )
    check(
        "low_context_policy",
        low_context_ok and len(low_context_ids) == 30,
        "low-context risk policy mismatch",
    )
    check(
        "formula_structures",
        formula_structures_ok
        and {
            row["externalId"]
            for row in batch_records
            if row.get("formulaUnitSubstitution") is not None
        }
        == FORMULA_IDS,
        "formula structure exact set mismatch",
    )

    check(
        "full_mapping_count",
        sum(bool(row.get("choiceIdMapping")) for row in batch_records) == 45,
        "full mapping count is not 45",
    )
    check(
        "variant_specific_count",
        sum(bool(row.get("variantSpecificFeedbackRequired")) for row in batch_records)
        == 165,
        "variant-specific count is not 165",
    )
    check("formula_count", len(FORMULA_IDS) == 11, "formula count is not 11")
    check("low_context_count", len(low_context_ids) == 30, "low-context count is not 30")

    queue_specs = {
        "image_queue": ("image-verification-queue.jsonl", IMAGE_HOLD_IDS),
        "choice_conflict_queue": (
            "choice-conflict-queue.jsonl",
            {CHOICE_CONFLICT_ID},
        ),
        "variant_specific_queue": (
            "variant-specific-choice-contract-queue.jsonl",
            {
                row["externalId"]
                for row in batch_records
                if row.get("variantSpecificFeedbackRequired")
            },
        ),
        "low_context_queue": (
            "low-context-registration-ledger.jsonl",
            low_context_ids,
        ),
        "canonical_reassignment_queue": (
            "canonical-reassignment-ledger.jsonl",
            set(REASSIGNMENTS),
        ),
        "pending_taxonomy_repair_queue": (
            "canonical-theory-repair-ledger.jsonl",
            set(PENDING_TAXONOMY_REPAIRS),
        ),
    }
    for name, (file_name, expected) in queue_specs.items():
        actual = {
            row["externalId"] for row in read_jsonl(OUT / file_name)
        }
        check(name, actual == expected, f"{name} exact set mismatch")

    for file_name in (
        "answer-key-conflict-queue.jsonl",
        "answer-key-correction-ledger.jsonl",
        "manual-choice-mapping-ledger.jsonl",
    ):
        check(
            f"{file_name}_empty",
            read_jsonl(OUT / file_name) == [],
            f"{file_name} is not empty",
        )

    reassignment_ok = True
    for external_id, expected in REASSIGNMENTS.items():
        record = batch_by_id.get(external_id)
        reassignment_ok &= bool(record) and (
            record["currentCanonicalId"] == expected["current"]
            and record["canonicalId"] == expected["target"]
            and record["theoryLink"]["lessonId"] == expected["lesson"]
            and record["theoryLink"]["lessonAnchor"] == expected["anchor"]
            and record["theoryLink"]["conceptGroupId"] == expected["group"]
            and record["theoryLink"]["conceptId"] == expected["concept"]
            and record["migration"]["mappingClass"] == "SEMANTIC_REPLACE"
            and record["migration"]["canonicalAction"] == "REASSIGN_CANONICAL"
            and record["migration"]["theoryAction"]
            == "USE_TARGET_CANONICAL_DIRECT_THEORY"
        )
    check("canonical_reassignments", reassignment_ok, "canonical reassignment mismatch")

    pending_repairs_ok = True
    for external_id, expected in PENDING_TAXONOMY_REPAIRS.items():
        record = batch_by_id.get(external_id)
        repair = record.get("migration", {}).get("taxonomyRepair", {}) if record else {}
        blockers = record.get("review", {}).get("publicationBlockers", []) if record else []
        pending_repairs_ok &= bool(record) and (
            record["canonicalId"] == expected["canonical"]
            and record["theoryLink"]["lessonId"] == expected["lesson"]
            and record["theoryLink"]["lessonAnchor"] == expected["anchor"]
            and record["theoryLink"]["conceptGroupId"]
            == expected["current_group"]
            and record["theoryLink"]["conceptId"] == expected["concept"]
            and record["review"]["runtimeStatus"] == "candidate"
            and record["migration"]["mappingClass"]
            == "THEORY_TAXONOMY_REPAIR_PENDING"
            and record["migration"]["canonicalAction"]
            == "PRESERVE_CURRENT_CANONICAL_PENDING_TAXONOMY_REPAIR"
            and record["migration"]["theoryAction"]
            == "PRESERVE_AUDIT_THEORY_PENDING_EXACT_TAXONOMY_TARGET"
            and repair.get("applied") is False
            and repair.get("targetConceptGroupId") is None
            and expected["source_blocker"] in blockers
            and "canonical_theory_repair_exact_target_pending" in blockers
        )
    check(
        "pending_taxonomy_repairs",
        pending_repairs_ok,
        "pending taxonomy repair contract mismatch",
    )

    batch_theory = read_json(OUT / "theory-lesson-additions.json")
    batch_changes = read_json(OUT / "canonical-question-changes.json")
    check(
        "batch_theory_additions_empty",
        batch_theory == [],
        "batch theory additions are not empty",
    )
    check(
        "batch_canonical_changes_empty",
        batch_changes == [],
        "unresolved taxonomy gap was silently converted to a canonical overlay",
    )
    check(
        "theory_additions_sha",
        sha_text(compact(manifest.get("theoryLessonAdditions", [])))
        == manifest.get("theoryLessonAdditionsSha256"),
        "theory additions SHA mismatch",
    )
    check(
        "canonical_changes_sha",
        sha_text(compact(manifest.get("canonicalQuestionChanges", [])))
        == manifest.get("canonicalQuestionChangesSha256"),
        "canonical changes SHA mismatch",
    )
    check(
        "global_theory_additions_unchanged",
        manifest.get("theoryLessonAdditionsSha256") == EXPECTED_GLOBAL_THEORY_ADDITIONS_SHA,
        "global theory additions changed during batch 12",
    )
    check(
        "global_canonical_changes_unchanged",
        manifest.get("canonicalQuestionChangesSha256") == EXPECTED_GLOBAL_CANONICAL_CHANGES_SHA,
        "global canonical changes changed during batch 12",
    )

    binding = read_json(OUT / "content-binding-validation.json")
    check(
        "content_hash_binding",
        binding["bindingHashesMatch"] is True
        and binding["expectedContentSha256"] == EXPECTED_CONTENT_SHA
        and binding["repositoryContentFilePackaged"] is False,
        "content hash binding failed",
    )
    check(
        "mapping_input_sha",
        sha_file(OUT / "mapping-dry-run-input.jsonl") == EXPECTED_MAPPING_SHA,
        "mapping input SHA mismatch",
    )
    check(
        "canonical_reference_sha",
        sha_file(OUT / "canonical-reference-ledger.jsonl")
        == EXPECTED_CANONICAL_REFERENCE_SHA,
        "canonical reference SHA mismatch",
    )

    summary = read_json(OUT / "batch-summary.json")
    check(
        "batch_summary",
        summary.get("recordCount") == 222
        and summary.get("states")
        == {"hold": 11, "candidate": 210, "choice_conflict": 1}
        and summary.get("sourcePublicationCandidateCount") == 208
        and summary.get("fullCanonicalChoiceMappingCount") == 45
        and summary.get("variantSpecificFeedbackPendingCount") == 165
        and summary.get("canonicalReassignmentCount") == 6
        and summary.get("canonicalTheoryRepairAppliedCount") == 0
        and summary.get("canonicalTheoryRepairPendingCount") == 2
        and summary.get("canonicalQuestionChangeCount") == 0
        and summary.get("cumulativeRecordCount") == 2384
        and summary.get("unreviewedRecordCount") == 0
        and summary.get("allSourceVariantsCovered") is True,
        "batch summary mismatch",
    )

    policy = manifest.get("holdResolutionPolicy", {})
    check(
        "cumulative_hold_policy",
        policy.get("imageVerificationQueueCount") == 97
        and policy.get("normalizedAndRegisteredCount") == 5
        and policy.get("choiceConflictNonScoringCount") == 19
        and policy.get("lowContextRegisteredCount") == 183
        and policy.get("learnerPublicationStillRequiresStatus") == "published",
        "cumulative hold policy mismatch",
    )

    source_final = read_json(OUT / "source-final-audit.json")
    source_global = read_json(OUT / "source-global-exact-hash-validation.json")
    check(
        "source_final_audit",
        source_final.get("status") == "PASS",
        "source final audit is not PASS",
    )
    check(
        "source_global_exact_hash",
        source_global.get("status") == "PASS",
        "source global exact-hash validation is not PASS",
    )

    check(
        "all_2384_source_variants_covered",
        len(records) == 2384
        and summary.get("allSourceVariantsCovered") is True
        and summary.get("unreviewedRecordCount") == 0
        and source_global.get("recordCount") == 2384
        and source_global.get("uniqueExternalIdCount") == 2384,
        "all-source coverage contract failed",
    )
    return checks, failures


def main() -> None:
    manifest = read_json(MANIFEST_PATH)
    checks, failures = validate(manifest)
    output = {
        "status": "PASS" if not failures else "FAIL",
        "checks": checks,
        "failures": failures,
        "recordCount": 222,
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
