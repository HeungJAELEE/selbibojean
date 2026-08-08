from __future__ import annotations

import hashlib
import json
import pathlib
import sys
from collections import Counter
from typing import Any

ROOT = pathlib.Path(__file__).resolve().parents[4]
AUDIT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-13"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
CONTENT_PATH = ROOT / "src/data/generated/content.json"
CONTENT_SHA = "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def compact(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def parse_jsonl(path: pathlib.Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def validate(root: pathlib.Path = ROOT) -> dict[str, Any]:
    failures: list[str] = []
    manifest_path = root / "src/data/generated/cbt-reviewed-variants.json"
    content_path = root / "src/data/generated/content.json"
    audit = root / "docs/audit-work/cbt-system-migration/import-batch-13"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    content = json.loads(content_path.read_text(encoding="utf-8"))
    questions = {q["id"]: q for q in content["questions"]}
    records = {r["externalId"]: r for r in manifest["records"]}
    corrections = parse_jsonl(audit / "integration-correction-ledger.jsonl")
    restored = parse_jsonl(audit / "restored-source-files-ledger.jsonl")

    checks: dict[str, bool] = {}
    checks["content_sha"] = sha_bytes(content_path.read_bytes()) == CONTENT_SHA
    checks["record_count"] = len(manifest["records"]) == 2384
    checks["unique_external_ids"] = len(records) == 2384
    checks["records_sha"] = sha_bytes(compact(manifest["records"]).encode()) == manifest["recordsSha256"]
    checks["canonical_changes_sha"] = (
        sha_bytes(compact(manifest["canonicalQuestionChanges"]).encode())
        == manifest["canonicalQuestionChangesSha256"]
    )
    batch13 = next((b for b in manifest["batches"] if b["batchId"] == "import-13"), None)
    checks["batch13_last"] = bool(batch13) and manifest["batches"][-1]["batchId"] == "import-13"
    checks["batch13_zero_record"] = bool(batch13) and all(
        batch13[key] == 0
        for key in ["recordCount", "candidateCount", "choiceConflictCount", "holdCount"]
    )
    checks["state_counts"] = Counter(r["review"]["runtimeStatus"] for r in manifest["records"]) == Counter(
        {"candidate": 2267, "hold": 98, "choice_conflict": 19}
    )

    for canonical_id in ["U-649", "U-478"]:
        change = next(c for c in manifest["canonicalQuestionChanges"] if c["question"]["id"] == canonical_id)
        actual = sha_bytes(compact(questions[canonical_id]).encode())
        checks[f"digest_{canonical_id}"] = change["previousQuestionSha256"] == actual

    link_expectations = {
        "2015-2-Q23": ("U-649", "lesson-cbt-gang-system-process-layout", "definition", "s4-g10", "concept-cd7x17"),
        "2007-4-Q84": ("U-478", "lesson-qnsesu", "trap", "s1-g06", "concept-qnsesu"),
    }
    for external_id, expected in link_expectations.items():
        r = records[external_id]
        link = r["theoryLink"]
        checks[f"link_{external_id}"] = (
            r["canonicalId"], link["lessonId"], link["lessonAnchor"], link["conceptGroupId"], link["conceptId"]
        ) == expected and r["migration"]["canonicalAction"] == "APPLY_CANONICAL_OVERLAY"

    conflict_types = {
        "2018-2-Q10": "no_unique_answer_all_choices_resistance_based",
        "2019-2-Q32": "multiple_incorrect_choices",
        "2019-2-Q86": "multiple_incorrect_choices",
        "2020-12B-Q92": "official_multiple_answers",
        "2021-2-Q13": "official_multiple_answers",
    }
    for external_id, conflict_type in conflict_types.items():
        r = records[external_id]
        c = r.get("choiceConflict") or {}
        checks[f"conflict_{external_id}"] = (
            r["review"]["runtimeStatus"] == "choice_conflict"
            and r["review"]["scoringDisposition"] == "non_scoring_choice_conflict"
            and c.get("label") == "선택지 충돌"
            and c.get("conflictType") == conflict_type
            and c.get("scoringPolicy") == "non_scoring"
            and bool(c.get("sourceAnswerTreatment", "").strip())
            and r["directSolution"].startswith("선택지 충돌:")
        )

    answer_hold = records["2020-3B-Q28"]
    checks["answer_key_hold"] = (
        answer_hold["review"]["runtimeStatus"] == "hold"
        and answer_hold["review"]["issueLabel"] == "정답키 충돌"
        and answer_hold["review"]["scoringDisposition"] == "excluded_answer_key_conflict"
        and answer_hold["reviewedAnswerIndex"] is None
        and answer_hold["choiceIdMapping"] == []
        and answer_hold["migration"]["mappingClass"] == "ANSWER_KEY_CONFLICT_HOLD"
    )
    checks["taxonomy_override"] = bool(batch13) and "lesson-qnsesu:s1-g06" in batch13["canonicalTheoryRepairs"]
    checks["correction_ledger_count"] = len(corrections) == 12
    checks["restored_source_count"] = len(restored) == 16

    restored_ok = True
    for row in restored:
        path = root / row["path"]
        if not path.exists() or path.stat().st_size != row["size"] or sha_bytes(path.read_bytes()) != row["sha256"]:
            restored_ok = False
    checks["restored_source_integrity"] = restored_ok

    source_files_ok = True
    for batch in manifest["batches"]:
        for source in batch.get("sourceFiles", []):
            path = root / source["path"]
            if not path.exists() or sha_bytes(path.read_bytes()) != source["sha256"]:
                source_files_ok = False
    checks["all_declared_source_files"] = source_files_ok

    matrix_rows = parse_jsonl(root / "docs/audit-work/cbt-system-migration/import-batch-06/direct-theory-link-matrix.jsonl")
    old_row = next(row for row in matrix_rows if row["externalId"] == "2015-2-Q23")
    checks["historical_matrix_preserved"] = (
        old_row["lessonId"] == "lesson-zoxye2"
        and old_row["lessonAnchor"] == "principle"
        and old_row["conceptGroupId"] == "s4-g07"
    )

    runtime_validator = (root / "src/lib/content/reviewed-cbt-variants.ts").read_text(encoding="utf-8")
    audit_code = (root / "src/lib/content/written-question-audit.ts").read_text(encoding="utf-8")
    verifier = (root / "scripts/verify-reviewed-cbt-variants.ts").read_text(encoding="utf-8")
    checks["answer_hold_validator_code"] = all(
        token in runtime_validator
        for token in ["validateAnswerKeyConflictHoldRecord", "answerKeyCorrectionPending", "ANSWER_KEY_CONFLICT_HOLD"]
    )
    checks["audit_precedence_code"] = all(
        token in audit_code
        for token in ["AUDIT_PROMOTION_BLOCKERS", "choice_conflict_non_scoring", "hasAuditPromotionBlocker"]
    )
    checks["batch13_verifier_code"] = all(
        token in verifier
        for token in ["verifyBatch13Contracts", "batch13RecordSupersessions", "restored-source-files-ledger.jsonl"]
    )

    failures.extend(name for name, passed in checks.items() if not passed)
    return {
        "status": "PASS" if not failures else "FAIL",
        "checks": checks,
        "failures": failures,
        "counts": {
            "records": len(manifest["records"]),
            "corrections": len(corrections),
            "restoredSources": len(restored),
            "batches": len(manifest["batches"]),
        },
        "recordsSha256": manifest["recordsSha256"],
        "canonicalQuestionChangesSha256": manifest["canonicalQuestionChangesSha256"],
    }


if __name__ == "__main__":
    report = validate()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report["status"] == "PASS" else 1)
