from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
from pathlib import Path
from typing import Any, Callable

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-09"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
VALIDATOR_PATH = OUT / "validate-import-batch-09.py"

spec = importlib.util.spec_from_file_location("batch09_validator", VALIDATOR_PATH)
assert spec and spec.loader
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


def compact(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def refresh_sha(manifest: dict[str, Any]) -> None:
    manifest["recordsSha256"] = hashlib.sha256(compact(manifest["records"]).encode("utf-8")).hexdigest()


def by_id(manifest: dict[str, Any], external_id: str) -> dict[str, Any]:
    return next(r for r in manifest["records"] if r["externalId"] == external_id)


def mutate_duplicate_id(m: dict[str, Any]) -> None:
    by_id(m, "2018-4-Q52")["externalId"] = "2018-4-Q51"; refresh_sha(m)


def mutate_prior_record(m: dict[str, Any]) -> None:
    m["records"][0]["stem"] += " [tampered]"; refresh_sha(m)


def mutate_hold_answer(m: dict[str, Any]) -> None:
    r = by_id(m, "2019-1-Q01"); r["reviewedAnswerIndex"] = r["sourceAnswerIndex"]; r["reviewedAnswerText"] = r["sourceAnswerText"]; refresh_sha(m)


def mutate_conflict_answer(m: dict[str, Any]) -> None:
    r = by_id(m, "2019-2-Q32"); r["reviewedAnswerIndex"] = 1; r["reviewedAnswerText"] = r["sourceAnswerText"]; refresh_sha(m)


def mutate_candidate_answer(m: dict[str, Any]) -> None:
    r = by_id(m, "2018-4-Q51"); r["reviewedAnswerIndex"] = None; r["reviewedAnswerText"] = ""; refresh_sha(m)


def mutate_variant_blocker(m: dict[str, Any]) -> None:
    r = next(r for r in m["records"][1570:] if r.get("variantSpecificFeedbackRequired")); r["review"]["publicationBlockers"] = ["pending_runtime_integration"]; refresh_sha(m)


def mutate_source(m: dict[str, Any]) -> None:
    r = by_id(m, "2018-4-Q51"); r["stem"] += " [tampered]"; refresh_sha(m)


def mutate_canonical(m: dict[str, Any]) -> None:
    r = by_id(m, "2018-4-Q51"); r["canonicalId"] = "U-000"; refresh_sha(m)


def mutate_low_context(m: dict[str, Any]) -> None:
    r = by_id(m, "2018-4-Q51"); r["review"]["theoryLinkStatus"] = "direct_existing_theory"; refresh_sha(m)


def mutate_records_digest(m: dict[str, Any]) -> None:
    m["recordsSha256"] = "0" * 64


CASES: list[tuple[str, Callable[[dict[str, Any]], None], str]] = [
    ("duplicate_external_id", mutate_duplicate_id, "unique_external_ids"),
    ("prior_record_tamper", mutate_prior_record, "prior_records_unchanged"),
    ("hold_answer_activated", mutate_hold_answer, "holds_disabled"),
    ("conflict_answer_activated", mutate_conflict_answer, "conflicts_disabled"),
    ("candidate_answer_removed", mutate_candidate_answer, "candidate_answers"),
    ("variant_blocker_removed", mutate_variant_blocker, "variant_specific_blocked"),
    ("source_stem_tamper", mutate_source, "source_identity_hashes"),
    ("unexpected_canonical_reassignment", mutate_canonical, "canonical_preserved"),
    ("low_context_policy_removed", mutate_low_context, "low_context_policy"),
    ("records_digest_tamper", mutate_records_digest, "records_sha"),
]


def main() -> None:
    original = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    results = []
    failures = []
    for name, mutation, expected in CASES:
        candidate = copy.deepcopy(original)
        mutation(candidate)
        checks, validation_failures = validator.validate(candidate)
        detected = checks.get(expected) is False and bool(validation_failures)
        results.append({
            "case": name,
            "expectedFailedCheck": expected,
            "detected": detected,
            "failedChecks": [k for k, v in checks.items() if not v],
            "failureCount": len(validation_failures),
        })
        if not detected:
            failures.append(f"{name}: expected {expected} failure not detected")
    output = {
        "status": "PASS" if not failures else "FAIL",
        "caseCount": len(CASES),
        "detectedCount": sum(r["detected"] for r in results),
        "results": results,
        "failures": failures,
    }
    text = json.dumps(output, ensure_ascii=False, indent=2) + "\n"
    (OUT / "negative-contract-validation.json").write_text(text, encoding="utf-8")
    (OUT / "negative-contract-validation.log").write_text(text, encoding="utf-8")
    print(text)
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
