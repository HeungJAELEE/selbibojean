from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path
from typing import Any, Callable

OUT = Path(__file__).resolve().parent
VALIDATOR_PATH = OUT / "validate-import-batch-11.py"

spec = importlib.util.spec_from_file_location("validate_import_batch_11", VALIDATOR_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load batch 11 validator")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)

BASE = validator.read_json(validator.MANIFEST_PATH)


def refresh_records_sha(manifest: dict[str, Any]) -> None:
    manifest["recordsSha256"] = validator.sha_text(validator.compact(manifest["records"]))


def record(manifest: dict[str, Any], external_id: str) -> dict[str, Any]:
    return next(item for item in manifest["records"] if item["externalId"] == external_id)


def mutate_records_sha_stale(manifest: dict[str, Any]) -> None:
    record(manifest, "2020-4-Q01")["stem"] += " [tampered]"


def mutate_duplicate_external_id(manifest: dict[str, Any]) -> None:
    manifest["records"][-1]["externalId"] = manifest["records"][-2]["externalId"]
    refresh_records_sha(manifest)


def mutate_hold_answer_activated(manifest: dict[str, Any]) -> None:
    item = record(manifest, "2021-1-Q27")
    item["reviewedAnswerIndex"] = 1
    item["reviewedAnswerText"] = "②"
    refresh_records_sha(manifest)


def mutate_hold_blocker_removed(manifest: dict[str, Any]) -> None:
    record(manifest, "2020-3B-Q62")["review"]["publicationBlockers"] = []
    refresh_records_sha(manifest)


def mutate_variant_mapping_fallback(manifest: dict[str, Any]) -> None:
    item = record(manifest, "2021-1-Q100")
    item["choiceIdMapping"] = ["U-1236-c1", "U-1236-c2", "U-1236-c3", "U-1236-c4"]
    refresh_records_sha(manifest)


def mutate_q100_canonical(manifest: dict[str, Any]) -> None:
    record(manifest, "2021-1-Q100")["canonicalId"] = "U-170"
    refresh_records_sha(manifest)


def mutate_q100_theory(manifest: dict[str, Any]) -> None:
    record(manifest, "2021-1-Q100")["theoryLink"]["conceptGroupId"] = "s1-g03"
    refresh_records_sha(manifest)


def mutate_source_hash(manifest: dict[str, Any]) -> None:
    record(manifest, "2020-4-Q01")["source"]["stemSha256"] = "0" * 64
    refresh_records_sha(manifest)


def mutate_prior_record(manifest: dict[str, Any]) -> None:
    manifest["records"][0]["directSolution"] += " [tampered]"
    refresh_records_sha(manifest)


def mutate_hold_policy(manifest: dict[str, Any]) -> None:
    manifest["holdResolutionPolicy"]["imageVerificationQueueCount"] = 85


def mutate_theory_sha(manifest: dict[str, Any]) -> None:
    manifest["theoryLessonAdditionsSha256"] = "0" * 64


def mutate_canonical_sha(manifest: dict[str, Any]) -> None:
    manifest["canonicalQuestionChangesSha256"] = "0" * 64


Scenario = tuple[str, Callable[[dict[str, Any]], None], set[str]]
SCENARIOS: list[Scenario] = [
    ("records_sha_stale", mutate_records_sha_stale, {"records_sha"}),
    ("duplicate_external_id", mutate_duplicate_external_id, {"unique_external_ids", "ordered_external_ids"}),
    ("hold_answer_activated", mutate_hold_answer_activated, {"image_holds_disabled"}),
    ("hold_blocker_removed", mutate_hold_blocker_removed, {"image_holds_disabled"}),
    ("variant_mapping_fallback", mutate_variant_mapping_fallback, {"variant_specific_blocked", "full_choice_mappings"}),
    ("q100_wrong_canonical", mutate_q100_canonical, {"canonical_reassignment", "theory_links"}),
    ("q100_wrong_theory", mutate_q100_theory, {"canonical_reassignment", "theory_links"}),
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
