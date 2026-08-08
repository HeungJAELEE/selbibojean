from __future__ import annotations

import copy
import hashlib
import json
import pathlib
from typing import Any, Callable

ROOT = pathlib.Path(__file__).resolve().parents[4]
AUDIT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-13"


def compact(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def sha(value: Any) -> str:
    if isinstance(value, bytes):
        raw = value
    elif isinstance(value, str):
        raw = value.encode()
    else:
        raw = compact(value).encode()
    return hashlib.sha256(raw).hexdigest()


def parse_jsonl(path: pathlib.Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


base_manifest = json.loads((ROOT / "src/data/generated/cbt-reviewed-variants.json").read_text(encoding="utf-8"))
content = json.loads((ROOT / "src/data/generated/content.json").read_text(encoding="utf-8"))
questions = {q["id"]: q for q in content["questions"]}
base_restored = parse_jsonl(AUDIT / "restored-source-files-ledger.jsonl")
base_matrix = parse_jsonl(ROOT / "docs/audit-work/cbt-system-migration/import-batch-06/direct-theory-link-matrix.jsonl")
base_runtime_code = (ROOT / "src/lib/content/reviewed-cbt-variants.ts").read_text(encoding="utf-8")
base_audit_code = (ROOT / "src/lib/content/written-question-audit.ts").read_text(encoding="utf-8")


def invariant_failures(
    manifest: dict[str, Any],
    restored: list[dict[str, Any]],
    matrix: list[dict[str, Any]],
    runtime_code: str,
    audit_code: str,
) -> list[str]:
    failures: list[str] = []
    records = {r["externalId"]: r for r in manifest["records"]}
    if sha(manifest["records"]) != manifest["recordsSha256"]:
        failures.append("records_sha")
    if sha(manifest["canonicalQuestionChanges"]) != manifest["canonicalQuestionChangesSha256"]:
        failures.append("canonical_changes_sha")
    for cid in ["U-649", "U-478"]:
        change = next(c for c in manifest["canonicalQuestionChanges"] if c["question"]["id"] == cid)
        if change["previousQuestionSha256"] != sha(questions[cid]):
            failures.append(f"digest_{cid}")
    if records["2015-2-Q23"]["theoryLink"]["lessonId"] != "lesson-cbt-gang-system-process-layout":
        failures.append("link_2015")
    if records["2007-4-Q84"]["theoryLink"]["conceptGroupId"] != "s1-g06":
        failures.append("link_2007")
    for external_id in ["2018-2-Q10", "2019-2-Q32", "2019-2-Q86", "2020-12B-Q92", "2021-2-Q13"]:
        r = records[external_id]
        c = r.get("choiceConflict") or {}
        if (
            r["review"]["scoringDisposition"] != "non_scoring_choice_conflict"
            or c.get("label") != "선택지 충돌"
            or not c.get("conflictType")
            or c.get("scoringPolicy") != "non_scoring"
            or not c.get("sourceAnswerTreatment", "").strip()
            or not r["directSolution"].startswith("선택지 충돌:")
        ):
            failures.append(f"conflict_{external_id}")
    hold = records["2020-3B-Q28"]
    if hold["review"]["issueLabel"] != "정답키 충돌" or hold["migration"]["mappingClass"] != "ANSWER_KEY_CONFLICT_HOLD":
        failures.append("answer_key_hold")
    batch13 = next((b for b in manifest["batches"] if b["batchId"] == "import-13"), None)
    if not batch13 or "lesson-qnsesu:s1-g06" not in batch13["canonicalTheoryRepairs"]:
        failures.append("taxonomy_override")
    if len(restored) != 16 or any(not row.get("sha256") for row in restored):
        failures.append("restored_ledger")
    old = next(r for r in matrix if r["externalId"] == "2015-2-Q23")
    if (old["lessonId"], old["lessonAnchor"], old["conceptGroupId"]) != ("lesson-zoxye2", "principle", "s4-g07"):
        failures.append("historical_matrix")
    if "validateAnswerKeyConflictHoldRecord" not in runtime_code or "answerKeyCorrectionPending" not in runtime_code:
        failures.append("runtime_hold_validator")
    if "AUDIT_PROMOTION_BLOCKERS" not in audit_code or "choice_conflict_non_scoring" not in audit_code:
        failures.append("audit_gate")
    return failures


Scenario = tuple[str, Callable[[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]], str, str], tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]], str, str]]]


def mutate_manifest(fn: Callable[[dict[str, Any]], None], update_records_sha: bool = True, update_canonical_sha: bool = True):
    def apply(m, r, x, rc, ac):
        fn(m)
        if update_records_sha:
            m["recordsSha256"] = sha(m["records"])
        if update_canonical_sha:
            m["canonicalQuestionChangesSha256"] = sha(m["canonicalQuestionChanges"])
        return m, r, x, rc, ac
    return apply


def rec(m, external_id):
    return next(r for r in m["records"] if r["externalId"] == external_id)


scenarios: list[Scenario] = [
    ("u649_dry_run_digest", mutate_manifest(lambda m: setattr_dummy(next(c for c in m["canonicalQuestionChanges"] if c["question"]["id"] == "U-649"), "previousQuestionSha256", "44617af2e712441165dc00045ff9848caae99330e643b14281da042335fe4866"))),
    ("u478_dry_run_digest", mutate_manifest(lambda m: setattr_dummy(next(c for c in m["canonicalQuestionChanges"] if c["question"]["id"] == "U-478"), "previousQuestionSha256", "e8921a7fe71061153c108a92b05938d5698c2f2ed64d1f4929ef6c58fe9df0a3"))),
    ("2015_old_theory_link", mutate_manifest(lambda m: rec(m, "2015-2-Q23")["theoryLink"].update({"lessonId": "lesson-zoxye2", "lessonAnchor": "principle", "conceptGroupId": "s4-g07"}))),
    ("2007_old_concept_group", mutate_manifest(lambda m: rec(m, "2007-4-Q84")["theoryLink"].update({"conceptGroupId": "s1-g02"}))),
    ("conflict_label_removed", mutate_manifest(lambda m: rec(m, "2018-2-Q10")["choiceConflict"].pop("label"))),
    ("conflict_scoring_regressed", mutate_manifest(lambda m: rec(m, "2019-2-Q32")["review"].update({"scoringDisposition": "non_scoring"}))),
    ("conflict_source_treatment_removed", mutate_manifest(lambda m: rec(m, "2021-2-Q13")["choiceConflict"].update({"sourceAnswerTreatment": ""}))),
    ("answer_hold_relabelled", mutate_manifest(lambda m: rec(m, "2020-3B-Q28")["review"].update({"issueLabel": "필수 이미지 확인"}))),
    ("taxonomy_override_removed", mutate_manifest(lambda m: next(b for b in m["batches"] if b["batchId"] == "import-13").update({"canonicalTheoryRepairs": []}))),
    ("records_digest_stale", mutate_manifest(lambda m: rec(m, "2018-2-Q10")["choiceConflict"].update({"conflictType": "tampered"}), update_records_sha=False)),
    ("canonical_digest_stale", mutate_manifest(lambda m: next(c for c in m["canonicalQuestionChanges"] if c["question"]["id"] == "U-649").update({"rationale": "tampered"}), update_canonical_sha=False)),
    ("restored_source_hash_removed", lambda m, r, x, rc, ac: (m, [*r[:-1], {**r[-1], "sha256": ""}], x, rc, ac)),
    ("historical_matrix_mutated", lambda m, r, x, rc, ac: (m, r, [({**row, "lessonId": "lesson-cbt-gang-system-process-layout"} if row["externalId"] == "2015-2-Q23" else row) for row in x], rc, ac)),
    ("answer_hold_validator_removed", lambda m, r, x, rc, ac: (m, r, x, rc.replace("validateAnswerKeyConflictHoldRecord", "removedAnswerKeyValidator"), ac)),
    ("audit_gate_removed", lambda m, r, x, rc, ac: (m, r, x, rc, ac.replace("AUDIT_PROMOTION_BLOCKERS", "REMOVED_PROMOTION_BLOCKERS"))),
]


def setattr_dummy(mapping: dict[str, Any], key: str, value: Any) -> None:
    mapping[key] = value


results = []
for name, apply in scenarios:
    m = copy.deepcopy(base_manifest)
    restored = copy.deepcopy(base_restored)
    matrix = copy.deepcopy(base_matrix)
    runtime_code = base_runtime_code
    audit_code = base_audit_code
    m, restored, matrix, runtime_code, audit_code = apply(m, restored, matrix, runtime_code, audit_code)
    detected = bool(invariant_failures(m, restored, matrix, runtime_code, audit_code))
    results.append({"scenario": name, "detected": detected})

report = {
    "status": "PASS" if all(item["detected"] for item in results) else "FAIL",
    "scenarioCount": len(results),
    "detectedCount": sum(item["detected"] for item in results),
    "results": results,
}
print(json.dumps(report, ensure_ascii=False, indent=2))
raise SystemExit(0 if report["status"] == "PASS" else 1)
