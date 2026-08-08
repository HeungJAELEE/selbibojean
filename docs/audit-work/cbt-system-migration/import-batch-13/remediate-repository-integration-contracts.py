#!/usr/bin/env python3
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
CONTENT_PATH = ROOT / "src/data/generated/content.json"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
REPORT_PATH = ROOT / "docs/audit-work/cbt-system-migration/import-batch-13/canonical-integration-remediation.json"

DIGEST_TARGETS = {
    "U-649": {
        "expected_old": "44617af2e712441165dc00045ff9848caae99330e643b14281da042335fe4866",
        "expected_basis": "dry_run_canonical_contract",
    },
    "U-478": {
        "expected_old": "e8921a7fe71061153c108a92b05938d5698c2f2ed64d1f4929ef6c58fe9df0a3",
        "expected_basis": "dry_run_canonical_reference_contract",
    },
}


def compact(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def object_sha(value: object) -> str:
    return hashlib.sha256(compact(value).encode("utf-8")).hexdigest()


def file_sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


content = json.loads(CONTENT_PATH.read_text(encoding="utf-8"))
manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
before_manifest_sha = file_sha(MANIFEST_PATH)
questions = {q["id"]: q for q in content["questions"]}
changes = manifest.get("canonicalQuestionChanges", [])
records = manifest["records"]
records_by_id = {r["externalId"]: r for r in records}
corrections: list[dict[str, object]] = []

# Repair the two replacement guards that were generated from reduced dry-run
# contracts although runtime hashes the complete pre-overlay question object.
for change in changes:
    question_id = change["question"]["id"]
    if question_id not in DIGEST_TARGETS:
        continue
    target = DIGEST_TARGETS[question_id]
    old_digest = change.get("previousQuestionSha256")
    old_basis = change.get("previousQuestionHashBasis")
    if old_digest != target["expected_old"] or old_basis != target["expected_basis"]:
        raise SystemExit(
            f"Unexpected pre-remediation canonical contract for {question_id}: "
            f"digest={old_digest}, basis={old_basis}"
        )
    actual_digest = object_sha(questions[question_id])
    change["previousQuestionSha256"] = actual_digest
    change["previousQuestionHashBasis"] = "content_json_full_question_contract"
    corrections.append(
        {
            "kind": "canonical_replacement_guard",
            "questionId": question_id,
            "beforeSha256": old_digest,
            "afterSha256": actual_digest,
            "beforeBasis": old_basis,
            "afterBasis": "content_json_full_question_contract",
        }
    )

if {x["questionId"] for x in corrections} != set(DIGEST_TARGETS):
    raise SystemExit("Not all canonical digest targets were found")

# Batch 08 declared the new U-649 lesson as direct for both variants, but the
# previously imported 2015 record retained its old lesson link. Bring that one
# cumulative record into the declared canonical/theory overlay contract.
record = records_by_id["2015-2-Q23"]
record_before = copy.deepcopy(record)
expected_old_link = {
    "canonicalId": "U-649",
    "lessonId": "lesson-zoxye2",
    "lessonAnchor": "principle",
    "conceptGroupId": "s4-g07",
    "conceptId": "concept-zoxye2",
    "canonicalStem": "여러 작업자가 한 조가 되어 설비군의 보전작업을 공동 수행하는 조직방식은?",
}
if record.get("theoryLink") != expected_old_link:
    raise SystemExit("2015-2-Q23 pre-remediation theory link is not the expected batch-06 value")

record["theoryLink"] = {
    "canonicalId": "U-649",
    "lessonId": "lesson-cbt-gang-system-process-layout",
    "lessonAnchor": "definition",
    "conceptGroupId": "s4-g10",
    "conceptId": "concept-cd7x17",
    "canonicalStem": "공정별 배치에서 동일 기종이 모여 있는 시스템은?",
}
record["conceptKeywords"] = ["설비배치", "다품종", "공장계획·생산·프로젝트"]
record["review"]["scoringDisposition"] = "scored_after_theory_repair"
record["review"]["theoryLinkStatus"] = "direct_added_theory_source_needed"
blockers = list(record["review"].get("publicationBlockers", []))
for blocker in ["pending_runtime_integration", "variant_specific_choice_contract_pending", "lesson_source_needed"]:
    if blocker not in blockers:
        blockers.append(blocker)
record["review"]["publicationBlockers"] = blockers
record["migration"]["canonicalAction"] = "APPLY_CANONICAL_OVERLAY"
record["migration"]["theoryAction"] = "ADD_DIRECT_THEORY_LESSON"
record["migration"]["runtimeDisposition"] = (
    "CANDIDATE_AFTER_CANONICAL_THEORY_REPAIR_SOURCE_GATED_WITH_VARIANT_CHOICE_CONTRACT_PENDING"
)
corrections.append(
    {
        "kind": "prior_record_theory_link",
        "externalId": "2015-2-Q23",
        "beforeRecordSha256": object_sha(record_before),
        "afterRecordSha256": object_sha(record),
        "reason": "Batch 08 directExternalIds and canonical affectedExternalIds include this prior variant; its record had not been migrated to the added lesson.",
    }
)

# Batch 10 declared a U-478 taxonomy overlay for both the 2007 and 2020
# variants, but the prior 2007 record retained the old s1-g02 group.
record_478 = records_by_id["2007-4-Q84"]
record_478_before = copy.deepcopy(record_478)
if (
    record_478.get("canonicalId") != "U-478"
    or record_478.get("theoryLink", {}).get("lessonId") != "lesson-qnsesu"
    or record_478.get("theoryLink", {}).get("conceptGroupId") != "s1-g02"
):
    raise SystemExit("2007-4-Q84 pre-remediation taxonomy link is not the expected value")
record_478["theoryLink"]["conceptGroupId"] = "s1-g06"
record_478["review"]["scoringDisposition"] = "scored_after_canonical_theory_repair"
record_478["review"]["theoryLinkStatus"] = "direct_existing_theory_canonical_taxonomy_repair"
for blocker in ["pending_runtime_integration", "canonical_theory_repair_runtime_validation"]:
    if blocker not in record_478["review"]["publicationBlockers"]:
        record_478["review"]["publicationBlockers"].append(blocker)
record_478["migration"]["canonicalAction"] = "APPLY_CANONICAL_OVERLAY"
record_478["migration"]["theoryAction"] = "RELINK_CANONICAL_TO_EXISTING_THEORY_GROUP"
record_478["migration"]["runtimeDisposition"] = "CANDIDATE_AFTER_CANONICAL_THEORY_REPAIR"
corrections.append(
    {
        "kind": "prior_record_taxonomy_link",
        "externalId": "2007-4-Q84",
        "beforeRecordSha256": object_sha(record_478_before),
        "afterRecordSha256": object_sha(record_478),
        "beforeConceptGroupId": "s1-g02",
        "afterConceptGroupId": "s1-g06",
        "reason": "Batch 10 canonical affectedExternalIds includes this prior variant; its record had not inherited the U-478 taxonomy repair.",
    }
)

# Runtime interprets canonicalTheoryRepairs entries as machine-readable
# ``lessonId:conceptGroupId`` pairs. Batch 10 stored the U-478 repair as a
# human narrative, so the prior batch-01 lesson-qnsesu:s1-g02 entry remained
# effective. Replace only that narrative with the intended machine contract;
# keep the list cardinality and the two reassignment narratives unchanged.
batch_10 = next((batch for batch in manifest["batches"] if batch["batchId"] == "import-10"), None)
if batch_10 is None:
    raise SystemExit("import-10 batch metadata not found")
old_repair = "2020-12B-Q86: U-478 conceptGroup s1-g02 -> s1-g06 taxonomy repair"
new_repair = "lesson-qnsesu:s1-g06"
repairs = batch_10.get("canonicalTheoryRepairs", [])
if repairs.count(old_repair) != 1 or new_repair in repairs:
    raise SystemExit(f"Unexpected import-10 canonicalTheoryRepairs before remediation: {repairs}")
repair_index = repairs.index(old_repair)
repairs[repair_index] = new_repair
corrections.append(
    {
        "kind": "machine_readable_theory_repair",
        "batchId": "import-10",
        "lessonId": "lesson-qnsesu",
        "before": old_repair,
        "after": new_repair,
        "reason": "Runtime parses canonicalTheoryRepairs as lessonId:conceptGroupId; the narrative entry did not override the earlier s1-g02 repair.",
    }
)

# Batches 08-12 used a reduced choice-conflict payload while the cumulative
# runtime contract requires the normalized non-scoring schema introduced in
# the earlier batches. Normalize only the five affected records; preserve all
# substantive reasons, indices, source answers, and audit-only extra fields.
choice_conflict_ids = [
    "2018-2-Q10",
    "2019-2-Q32",
    "2019-2-Q86",
    "2020-12B-Q92",
    "2021-2-Q13",
]
for external_id in choice_conflict_ids:
    conflict_record = records_by_id[external_id]
    conflict_before = copy.deepcopy(conflict_record)
    conflict = conflict_record.get("choiceConflict")
    if (
        conflict_record.get("review", {}).get("runtimeStatus") != "choice_conflict"
        or conflict_record.get("review", {}).get("scoringDisposition") != "non_scoring"
        or not conflict
        or conflict.get("scoringPolicy") not in {None, "non_scoring"}
    ):
        raise SystemExit(f"Unexpected pre-remediation choice-conflict contract: {external_id}")
    conflict_record["review"]["scoringDisposition"] = "non_scoring_choice_conflict"
    conflict["label"] = "선택지 충돌"
    conflict["scoringPolicy"] = "non_scoring"
    conflict.setdefault(
        "sourceAnswerTreatment",
        "복원 정답은 출처 기록으로만 보존하고 학습자 채점에는 사용하지 않는다.",
    )
    if not conflict_record.get("directSolution", "").startswith("선택지 충돌:"):
        conflict_record["directSolution"] = "선택지 충돌: " + conflict_record["directSolution"]
    corrections.append(
        {
            "kind": "choice_conflict_runtime_schema",
            "externalId": external_id,
            "beforeRecordSha256": object_sha(conflict_before),
            "afterRecordSha256": object_sha(conflict_record),
            "reason": "Normalize the cumulative choice-conflict record to the runtime non-scoring schema without changing its substantive review decision.",
        }
    )

manifest["recordsSha256"] = object_sha(records)
manifest["canonicalQuestionChangesSha256"] = object_sha(changes)
MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

report = {
    "status": "PASS",
    "scope": "batch-13 full-repository canonical integration remediation",
    "contentJsonSha256": file_sha(CONTENT_PATH),
    "manifestBeforeSha256": before_manifest_sha,
    "manifestAfterSha256": file_sha(MANIFEST_PATH),
    "recordsSha256": manifest["recordsSha256"],
    "canonicalQuestionChangesSha256": manifest["canonicalQuestionChangesSha256"],
    "recordCount": len(records),
    "corrections": corrections,
}
REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
