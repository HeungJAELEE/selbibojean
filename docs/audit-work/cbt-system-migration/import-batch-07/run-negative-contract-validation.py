from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
from pathlib import Path
from typing import Any, Callable

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-07"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
VALIDATOR_PATH = OUT / "validate-import-batch-07.py"

spec = importlib.util.spec_from_file_location("batch07_validator", VALIDATOR_PATH)
assert spec and spec.loader
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


def compact(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def refresh_sha(manifest: dict[str, Any]) -> None:
    manifest["recordsSha256"] = hashlib.sha256(
        compact(manifest["records"]).encode("utf-8")
    ).hexdigest()


def by_id(manifest: dict[str, Any], external_id: str) -> dict[str, Any]:
    return next(
        record for record in manifest["records"] if record["externalId"] == external_id
    )


def mutate_duplicate_external_id(manifest: dict[str, Any]) -> None:
    by_id(manifest, "2016-2-Q02")["externalId"] = "2016-2-Q01"
    refresh_sha(manifest)


def mutate_prior_record(manifest: dict[str, Any]) -> None:
    manifest["records"][0]["stem"] += " [tampered]"
    refresh_sha(manifest)


def mutate_hold_answer(manifest: dict[str, Any]) -> None:
    record = by_id(manifest, "2016-4-Q10")
    record["reviewedAnswerIndex"] = record["sourceAnswerIndex"]
    record["reviewedAnswerText"] = record["sourceAnswerText"]
    refresh_sha(manifest)


def mutate_candidate_answer(manifest: dict[str, Any]) -> None:
    record = by_id(manifest, "2016-2-Q02")
    record["reviewedAnswerIndex"] = None
    record["reviewedAnswerText"] = ""
    refresh_sha(manifest)


def mutate_variant_blocker(manifest: dict[str, Any]) -> None:
    record = by_id(manifest, "2016-2-Q01")
    record["review"]["publicationBlockers"] = ["pending_runtime_integration"]
    refresh_sha(manifest)


def mutate_source_hash(manifest: dict[str, Any]) -> None:
    record = by_id(manifest, "2016-2-Q02")
    record["stem"] += " [tampered]"
    refresh_sha(manifest)


def mutate_canonical_reassignment(manifest: dict[str, Any]) -> None:
    record = by_id(manifest, "2016-2-Q01")
    record["canonicalId"] = "U-999999"
    record["migration"]["canonicalAction"] = "REASSIGN_CANONICAL"
    refresh_sha(manifest)


def mutate_low_context(manifest: dict[str, Any]) -> None:
    record = by_id(manifest, "2016-2-Q04")
    record["review"]["theoryLinkStatus"] = "direct_existing_theory"
    refresh_sha(manifest)


def mutate_records_digest(manifest: dict[str, Any]) -> None:
    manifest["recordsSha256"] = "0" * 64


CASES: list[tuple[str, Callable[[dict[str, Any]], None], str]] = [
    ("duplicate_external_id", mutate_duplicate_external_id, "unique_external_ids"),
    ("prior_record_tamper", mutate_prior_record, "prior_records_unchanged"),
    ("hold_answer_activated", mutate_hold_answer, "holds_disabled"),
    ("candidate_answer_removed", mutate_candidate_answer, "candidate_answers"),
    ("variant_blocker_removed", mutate_variant_blocker, "variant_specific_blocked"),
    ("source_stem_tamper", mutate_source_hash, "source_identity_hashes"),
    ("canonical_reassignment_injected", mutate_canonical_reassignment, "no_canonical_reassignment"),
    ("low_context_policy_removed", mutate_low_context, "low_context_policy"),
    ("records_digest_tamper", mutate_records_digest, "records_sha"),
]


def main() -> None:
    original = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    results: list[dict[str, Any]] = []
    failures: list[str] = []
    for name, mutation, expected_check in CASES:
        candidate = copy.deepcopy(original)
        mutation(candidate)
        checks, validation_failures = validator.validate(candidate)
        detected = checks.get(expected_check) is False and bool(validation_failures)
        results.append(
            {
                "case": name,
                "expectedFailedCheck": expected_check,
                "detected": detected,
                "failedChecks": [key for key, value in checks.items() if not value],
                "failureCount": len(validation_failures),
            }
        )
        if not detected:
            failures.append(f"{name}: expected {expected_check} failure was not detected")

    output = {
        "status": "PASS" if not failures else "FAIL",
        "caseCount": len(CASES),
        "detectedCount": sum(result["detected"] for result in results),
        "results": results,
        "failures": failures,
    }
    (OUT / "negative-contract-validation.json").write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (OUT / "negative-contract-validation.log").write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(output, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
