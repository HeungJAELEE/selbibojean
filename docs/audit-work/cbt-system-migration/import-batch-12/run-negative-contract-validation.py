from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path
from typing import Any, Callable

OUT = Path(__file__).resolve().parent
VALIDATOR_PATH = OUT / "validate-import-batch-12.py"

spec = importlib.util.spec_from_file_location("validate_import_batch_12", VALIDATOR_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load batch 12 validator")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
BASE = validator.read_json(validator.MANIFEST_PATH)


def refresh_records_sha(manifest: dict[str, Any]) -> None:
    manifest["recordsSha256"] = validator.sha_text(
        validator.compact(manifest["records"])
    )


def record(manifest: dict[str, Any], external_id: str) -> dict[str, Any]:
    return next(
        item for item in manifest["records"] if item["externalId"] == external_id
    )


def mutate_records_sha_stale(manifest: dict[str, Any]) -> None:
    record(manifest, "2021-2-Q02")["stem"] += " [tampered]"


def mutate_duplicate_external_id(manifest: dict[str, Any]) -> None:
    manifest["records"][-1]["externalId"] = manifest["records"][-2]["externalId"]
    refresh_records_sha(manifest)


def mutate_image_hold_answer_activated(manifest: dict[str, Any]) -> None:
    item = record(manifest, "2021-2-Q01")
    item["reviewedAnswerIndex"] = 1
    item["reviewedAnswerText"] = "②"
    refresh_records_sha(manifest)


def mutate_conflict_answer_activated(manifest: dict[str, Any]) -> None:
    item = record(manifest, "2021-2-Q13")
    item["reviewedAnswerIndex"] = 3
    item["reviewedAnswerText"] = "④ 회전주기 측정법"
    refresh_records_sha(manifest)


def mutate_variant_mapping_fallback(manifest: dict[str, Any]) -> None:
    item = record(manifest, "2022-1-Q02")
    item["choiceIdMapping"] = ["U-812-c1", "U-812-c2", "U-812-c3", "U-812-c4"]
    refresh_records_sha(manifest)


def mutate_reassignment_canonical(manifest: dict[str, Any]) -> None:
    record(manifest, "2022-1-Q31")["canonicalId"] = "U-187"
    refresh_records_sha(manifest)


def mutate_reassignment_theory(manifest: dict[str, Any]) -> None:
    record(manifest, "2022-2-Q44")["theoryLink"]["conceptGroupId"] = "s3-g04"
    refresh_records_sha(manifest)


def mutate_pending_taxonomy_silently_applied(manifest: dict[str, Any]) -> None:
    item = record(manifest, "2022-1-Q61")
    item["theoryLink"]["conceptGroupId"] = "s1-g05"
    item["migration"]["taxonomyRepair"]["applied"] = True
    item["migration"]["taxonomyRepair"]["targetConceptGroupId"] = "s1-g05"
    refresh_records_sha(manifest)


def mutate_pending_taxonomy_blocker_removed(manifest: dict[str, Any]) -> None:
    item = record(manifest, "2022-2-Q65")
    item["review"]["publicationBlockers"] = [
        value
        for value in item["review"]["publicationBlockers"]
        if value != "canonical_theory_repair_exact_target_pending"
    ]
    refresh_records_sha(manifest)


def mutate_source_hash(manifest: dict[str, Any]) -> None:
    record(manifest, "2022-1-Q01")["source"]["stemSha256"] = "0" * 64
    refresh_records_sha(manifest)


def mutate_prior_record(manifest: dict[str, Any]) -> None:
    manifest["records"][0]["directSolution"] += " [tampered]"
    refresh_records_sha(manifest)


def mutate_hold_policy(manifest: dict[str, Any]) -> None:
    manifest["holdResolutionPolicy"]["imageVerificationQueueCount"] = 96


def mutate_theory_sha(manifest: dict[str, Any]) -> None:
    manifest["theoryLessonAdditionsSha256"] = "0" * 64


def mutate_canonical_sha(manifest: dict[str, Any]) -> None:
    manifest["canonicalQuestionChangesSha256"] = "0" * 64


Scenario = tuple[str, Callable[[dict[str, Any]], None], set[str]]
SCENARIOS: list[Scenario] = [
    ("records_sha_stale", mutate_records_sha_stale, {"records_sha", "source_identity_hashes"}),
    ("duplicate_external_id", mutate_duplicate_external_id, {"unique_external_ids", "ordered_external_ids"}),
    ("image_hold_answer_activated", mutate_image_hold_answer_activated, {"image_holds_disabled"}),
    ("choice_conflict_answer_activated", mutate_conflict_answer_activated, {"choice_conflict_disabled"}),
    ("variant_mapping_fallback", mutate_variant_mapping_fallback, {"variant_specific_blocked", "full_choice_mappings"}),
    ("wrong_reassignment_canonical", mutate_reassignment_canonical, {"canonical_reassignments", "theory_links"}),
    ("wrong_reassignment_theory", mutate_reassignment_theory, {"canonical_reassignments", "theory_links"}),
    ("silent_taxonomy_overlay", mutate_pending_taxonomy_silently_applied, {"pending_taxonomy_repairs", "theory_links"}),
    ("taxonomy_blocker_removed", mutate_pending_taxonomy_blocker_removed, {"pending_taxonomy_repairs"}),
    ("source_hash_tamper", mutate_source_hash, {"source_identity_hashes"}),
    ("prior_record_mutation", mutate_prior_record, {"prior_records_unchanged"}),
    ("hold_policy_count", mutate_hold_policy, {"cumulative_hold_policy"}),
    ("theory_additions_sha", mutate_theory_sha, {"theory_additions_sha"}),
    ("canonical_changes_sha", mutate_canonical_sha, {"canonical_changes_sha"}),
]


def main() -> None:
    results: list[dict[str, Any]] = []
    all_detected = True
    for name, mutator, expected_failures in SCENARIOS:
        candidate = copy.deepcopy(BASE)
        mutator(candidate)
        checks, failures = validator.validate(candidate)
        failed_checks = {key for key, passed in checks.items() if not passed}
        detected = bool(expected_failures & failed_checks)
        all_detected &= detected
        results.append(
            {
                "scenario": name,
                "expectedAnyFailedCheck": sorted(expected_failures),
                "actualFailedChecks": sorted(failed_checks),
                "detected": detected,
                "validatorFailureMessages": failures,
            }
        )

    output = {
        "status": "PASS" if all_detected else "FAIL",
        "scenarioCount": len(results),
        "detectedCount": sum(1 for item in results if item["detected"]),
        "allMutationsDetected": all_detected,
        "scenarios": results,
    }
    text = json.dumps(output, ensure_ascii=False, indent=2) + "\n"
    (OUT / "negative-contract-validation.json").write_text(text, encoding="utf-8")
    (OUT / "negative-contract-validation.log").write_text(text, encoding="utf-8")
    print(text)
    if not all_detected:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
