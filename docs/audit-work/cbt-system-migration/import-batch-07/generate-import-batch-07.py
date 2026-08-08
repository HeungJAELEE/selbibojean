from __future__ import annotations

import copy
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "docs/audit-work/cbt-system-migration/import-batch-07"
REVIEW_DIR = ROOT / "docs/audit-work/cbt-source-reviews/final"
MANIFEST_PATH = ROOT / "src/data/generated/cbt-reviewed-variants.json"
VERIFY_SCRIPT_PATH = ROOT / "scripts/verify-reviewed-cbt-variants.ts"
TEST_PATH = ROOT / "tests/unit/reviewed-cbt-variants.test.ts"
PRIOR_VALIDATION_PATH = (
    ROOT / "docs/audit-work/cbt-system-migration/import-batch-06/final-validation.json"
)
MAPPING_PATH = OUT / "mapping-dry-run-input.jsonl"
MAPPING_SUMMARY_PATH = OUT / "mapping-source-summary.json"

REVIEW_FILES = [
    REVIEW_DIR / "de20160508_q01-q20_independent-review.jsonl",
    REVIEW_DIR / "de20161001_q01-q50_independent-review.jsonl",
    REVIEW_DIR / "de20161001_q51-q100_independent-review.jsonl",
    REVIEW_DIR / "de20170507_q01-q50_independent-review.jsonl",
]

NOW = "2026-08-07T23:25:00+09:00"
BATCH_ID = "import-07"
SYMBOLS = ["①", "②", "③", "④", "⑤"]
EXPECTED_CONTENT_SHA256 = (
    "7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4"
)
EXPECTED_DRYRUN_SHA256 = (
    "302f58f43bcec93539be7af38f8657e42bad3d37004f85e4f41d5c797c9e50d9"
)
EXPECTED_PRIOR_RECORDS_SHA256 = (
    "60691b8ed34fc7b386fe0d12533c26fbd2d9df9ef286c217b8f4fd5cf39159e5"
)
IMAGE_HOLD_IDS = {
    "2016-4-Q10",
    "2016-4-Q26",
    "2016-4-Q58",
    "2017-2-Q32",
    "2017-2-Q33",
}


def sha_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def sha_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def jd(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def pretty(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [
        json.loads(line)
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def write_json(path: Path, value: Any) -> None:
    path.write_text(pretty(value), encoding="utf-8")


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.write_text(
        "\n".join(jd(row) for row in rows) + ("\n" if rows else ""),
        encoding="utf-8",
    )


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value).lower()
    value = re.sub(r"[\s\-–—·,.:;()\[\]{}_/\\]+", "", value)
    return (
        value.replace("ㆍ", "")
        .replace("＝", "=")
        .replace("²", "2")
        .replace("³", "3")
    )


def build_hold_resolution_policy(
    batches: list[dict[str, Any]],
    template: dict[str, Any],
    decided_at: str,
) -> dict[str, Any]:
    image_ids: set[str] = set()
    normalized_ids: set[str] = set()
    choice_conflict_ids: set[str] = set()
    low_context_ids: set[str] = set()
    for batch in batches:
        resolution = batch.get("holdResolution", {})
        image_ids.update(resolution.get("imageVerificationQueue", []))
        normalized_ids.update(resolution.get("normalizedAndRegistered", []))
        choice_conflict_ids.update(resolution.get("choiceConflictNonScoring", []))
        low_context_ids.update(resolution.get("lowContextRegistered", []))
    return {
        "decisionAuthority": template.get(
            "decisionAuthority", "user_explicit_approval"
        ),
        "decidedAt": decided_at,
        "imageVerificationQueueCount": len(image_ids),
        "normalizedAndRegisteredCount": len(normalized_ids),
        "choiceConflictNonScoringCount": len(choice_conflict_ids),
        "lowContextRegisteredCount": len(low_context_ids),
        "learnerPublicationStillRequiresStatus": "published",
    }


def parse_formula_structure(direct_solution: str) -> dict[str, str] | None:
    labels = ["식:", "단위:", "대입:", "결과:"]
    if not all(label in direct_solution for label in labels):
        return None
    match = re.fullmatch(
        r"식:\s*(.*?)\s*단위:\s*(.*?)\s*대입:\s*(.*?)\s*결과:\s*(.*)",
        direct_solution.strip(),
        flags=re.DOTALL,
    )
    if not match:
        return None
    formula, units, substitution, result = (part.strip() for part in match.groups())
    return {
        "formula": formula.removesuffix("."),
        "units": units.removesuffix("."),
        "substitution": substitution.removesuffix("."),
        "result": result.removesuffix("."),
    }


def canonical_choice_contract(dry_row: dict[str, Any]) -> dict[str, Any]:
    decision = dry_row["decision"]
    current = dry_row["currentSystem"]
    current_id = decision["currentCanonicalId"]
    target_id = decision.get("targetCanonicalId") or current_id
    if target_id != current_id:
        raise AssertionError(
            f"{dry_row['externalId']}: batch 07 unexpectedly changes canonical ID"
        )
    canonical_choices = list(current["canonicalChoices"])
    answer_index = current["canonicalAnswerIndex"]
    return {
        "id": target_id,
        "stem": current["canonicalStem"],
        "choices": [
            {"id": f"{target_id}-c{index + 1}", "text": text}
            for index, text in enumerate(canonical_choices)
        ],
        "correctChoiceId": f"{target_id}-c{answer_index + 1}",
        **decision["targetCanonicalTheoryLink"],
    }


def safe_choice_mapping(
    source_choices: list[str],
    canonical: dict[str, Any],
    answer_idx: int | None,
) -> list[str]:
    if (
        answer_idx is None
        or not source_choices
        or any(not str(choice).strip() for choice in source_choices)
    ):
        return []
    used: set[str] = set()
    result: list[str] = []
    for source_choice in source_choices:
        normalized_source = normalize_text(source_choice)
        matches: list[dict[str, Any]] = []
        for choice in canonical["choices"]:
            normalized_choice = normalize_text(choice["text"])
            if normalized_source == normalized_choice or (
                len(normalized_source) >= 2
                and len(normalized_choice) >= 2
                and (
                    normalized_source in normalized_choice
                    or normalized_choice in normalized_source
                )
            ):
                matches.append(choice)
        matches = [choice for choice in matches if choice["id"] not in used]
        if len(matches) != 1:
            return []
        result.append(matches[0]["id"])
        used.add(matches[0]["id"])
    if len(result) != len(source_choices) or len(set(result)) != len(result):
        return []
    if result[answer_idx] != canonical["correctChoiceId"]:
        return []
    return result


def concept_keywords(review: dict[str, Any]) -> list[str]:
    theory = review["theoryLink"]
    candidates = [
        theory.get("lessonTitle"),
        theory.get("keyword"),
        *(theory.get("keywordAliases") or []),
        theory.get("conceptGroupTitle"),
    ]
    result: list[str] = []
    for candidate in candidates:
        if candidate and candidate not in result:
            result.append(candidate)
    return result


OUT.mkdir(parents=True, exist_ok=True)
manifest = read_json(MANIFEST_PATH)
prior_validation = read_json(PRIOR_VALIDATION_PATH)
mapping_summary = read_json(MAPPING_SUMMARY_PATH)
dry_rows = read_jsonl(MAPPING_PATH)
dry_by_id = {row["externalId"]: row for row in dry_rows}

assert sha_file(MAPPING_PATH) == EXPECTED_DRYRUN_SHA256
assert mapping_summary["inputs"]["contentSha256"] == EXPECTED_CONTENT_SHA256
assert (
    prior_validation["sourceIntegrity"]["contentJsonSha256"]
    == EXPECTED_CONTENT_SHA256
)
assert prior_validation["sourceIntegrity"]["contentJsonUnchanged"] is True
assert len(manifest["records"]) in {1200, 1370}
assert len({record["externalId"] for record in manifest["records"]}) == len(
    manifest["records"]
)

# Idempotent regeneration owns only batch 07 records and metadata.
if any(batch.get("batchId") == BATCH_ID for batch in manifest.get("batches", [])):
    batch_ids = {row["externalId"] for row in dry_rows}
    manifest = copy.deepcopy(manifest)
    manifest["batches"] = [
        batch for batch in manifest["batches"] if batch.get("batchId") != BATCH_ID
    ]
    manifest["records"] = [
        record for record in manifest["records"] if record["externalId"] not in batch_ids
    ]
    manifest["recordsSha256"] = sha_text(jd(manifest["records"]))

assert len(manifest["records"]) == 1200
assert manifest["recordsSha256"] == EXPECTED_PRIOR_RECORDS_SHA256

# Existing manifests establish deterministic canonical choice IDs as U-xxx-cN.
for prior_record in manifest["records"]:
    for choice_id in prior_record.get("choiceIdMapping", []):
        assert re.fullmatch(
            re.escape(prior_record["canonicalId"]) + r"-c[1-5]", choice_id
        ), (prior_record["externalId"], choice_id)

review_rows: list[dict[str, Any]] = []
for path in REVIEW_FILES:
    review_rows.extend(read_jsonl(path))
review_by_id = {row["externalId"]: row for row in review_rows}

BATCH_IDS = [row["externalId"] for row in dry_rows]
assert len(BATCH_IDS) == 170
assert len(set(BATCH_IDS)) == 170
assert set(BATCH_IDS) == set(review_by_id)
assert BATCH_IDS[0] == "2016-2-Q01"
assert BATCH_IDS[-1] == "2017-2-Q50"
assert Counter(row["review"]["verdict"] for row in dry_rows) == Counter(
    {"ACCEPT": 165, "HOLD": 5}
)
assert Counter(row["decision"]["mappingClass"] for row in dry_rows) == Counter(
    {"EXACT_REPLACE": 165, "HOLD": 5}
)
assert all(
    row["decision"]["currentCanonicalId"]
    == row["decision"]["targetCanonicalId"]
    for row in dry_rows
)
assert all(row["comparison"]["reviewedTheoryMatchesCurrentCanonical"] for row in dry_rows)
assert all(row["comparison"]["registeredSourceUrlMatches"] for row in dry_rows)
assert all(row["comparison"]["yearMatchesExternalId"] for row in dry_rows)
assert all(row["comparison"]["questionNumberMatches"] for row in dry_rows)
assert {
    external_id
    for external_id, review in review_by_id.items()
    if review["reviewVerdict"] == "HOLD"
} == IMAGE_HOLD_IDS

prior_canonical_changes = {
    change["question"]["id"] for change in manifest.get("canonicalQuestionChanges", [])
}
batch_canonical_ids = {
    row["decision"]["targetCanonicalId"] for row in dry_rows
}
assert not (prior_canonical_changes & batch_canonical_ids)

records: list[dict[str, Any]] = []
direct_link_matrix: list[dict[str, Any]] = []
variant_specific_ids: list[str] = []
full_mapping_ids: list[str] = []
image_queue_ids: list[str] = []
low_context_ids: list[str] = []
formula_ids: list[str] = []

for external_id in BATCH_IDS:
    review = review_by_id[external_id]
    dry = dry_by_id[external_id]
    current = dry["currentSystem"]
    decision = dry["decision"]
    canonical = canonical_choice_contract(dry)
    source_choices = list(review["sourceExactChoices"])
    source_idx = review.get("sourceAnswerIndex")
    is_hold = external_id in IMAGE_HOLD_IDS
    answer_idx = None if is_hold else review.get("independentAnswerIndex")

    source_answer_text = (
        f"{SYMBOLS[source_idx]} {source_choices[source_idx]}"
        if isinstance(source_idx, int)
        else ""
    )
    reviewed_answer_text = (
        f"{SYMBOLS[answer_idx]} {source_choices[answer_idx]}"
        if isinstance(answer_idx, int)
        else ""
    )

    if is_hold:
        mapping: list[str] = []
        variant_specific = False
        image_queue_ids.append(external_id)
    else:
        assert isinstance(answer_idx, int), external_id
        mapping = safe_choice_mapping(source_choices, canonical, answer_idx)
        variant_specific = len(mapping) == 0
        if variant_specific:
            variant_specific_ids.append(external_id)
        else:
            full_mapping_ids.append(external_id)

    reviewed_theory = review["theoryLink"]
    canonical_theory = decision["targetCanonicalTheoryLink"]
    for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"]:
        assert reviewed_theory[key] == canonical_theory[key], (external_id, key)

    is_low_context = bool(review.get("riskNote")) and not is_hold
    if is_low_context:
        low_context_ids.append(external_id)
    theory_status = (
        "direct_existing_theory_low_context_exam_intent"
        if is_low_context
        else "direct_existing_theory"
    )
    theory_link = {
        "canonicalId": canonical["id"],
        "lessonId": reviewed_theory["lessonId"],
        "lessonAnchor": reviewed_theory["lessonAnchor"],
        "conceptGroupId": reviewed_theory["conceptGroupId"],
        "conceptId": reviewed_theory["conceptId"],
        "canonicalStem": canonical["stem"],
    }

    formula_structure = parse_formula_structure(review["directSolution"])
    if formula_structure is not None:
        formula_ids.append(external_id)

    if is_hold:
        runtime_status = "hold"
        scoring_disposition = "excluded_required_image"
        source_agreement = review.get("sourceAnswerAgreement") or "unverified"
        answer_evidence = "required_source_image_not_visually_verified"
        confidence = review.get("answerConfidence") or "unverified"
        blockers = ["required_source_image_review"]
        risk = "필수 이미지 판독 전 정답 인덱스를 승인하지 않는다."
        mapping_class = "IMAGE_VERIFICATION_HOLD"
        runtime_disposition = "IMAGE_VERIFICATION_QUEUE"
        migration_confidence = "medium"
    else:
        runtime_status = "candidate"
        scoring_disposition = "scored"
        source_agreement = review.get("sourceAnswerAgreement") or "agrees"
        answer_evidence = review.get("answerEvidence") or "independently_solved"
        confidence = review.get("answerConfidence") or "confirmed"
        blockers = ["pending_runtime_integration"]
        if variant_specific:
            blockers.append("variant_specific_choice_contract_pending")
        risk = review.get("riskNote") or "없음. 독립 풀이와 복원 정답이 일치한다."
        mapping_class = decision["mappingClass"]
        runtime_disposition = (
            "PUBLICATION_CANDIDATE_WITH_VARIANT_CHOICE_CONTRACT_PENDING"
            if variant_specific
            else "PUBLICATION_CANDIDATE"
        )
        migration_confidence = "high"

    record: dict[str, Any] = {
        "externalId": external_id,
        "currentCanonicalId": decision["currentCanonicalId"],
        "canonicalId": canonical["id"],
        "year": current["year"],
        "sessionLabel": current["sessionLabel"],
        "questionNumber": current["questionNumber"],
        "source": {
            "textAuthority": review["sourceTextAuthority"],
            "captureAuthority": review["sourceCaptureAuthority"],
            "answerAuthority": review["sourceAnswerAuthority"],
            "displayLabel": review["sourceDisplayLabel"],
            "registeredSourceUrl": review["identity"]["registeredSourceUrl"],
            "resolvedSourceUrl": review["identity"]["resolvedSourceUrl"],
            "questionNumber": review["identity"]["questionNumber"],
            "stemSha256": review["identity"]["sourceStemSha256"],
            "orderedChoicesSha256": review["identity"]["orderedChoicesSha256"],
            "registeredIdentitySha256": review["identity"][
                "registeredIdentitySha256"
            ],
            "resolvedIdentitySha256": review["identity"]["sourceIdentitySha256"],
        },
        "stem": review["sourceExactStem"],
        "choices": source_choices,
        "sourceAnswerIndex": source_idx,
        "reviewedAnswerIndex": answer_idx,
        "sourceAnswerText": source_answer_text,
        "reviewedAnswerText": reviewed_answer_text,
        "choiceIdMapping": mapping,
        "directSolution": review["directSolution"].strip(),
        "formulaUnitSubstitution": formula_structure,
        "choiceByChoiceReasons": review["choiceByChoiceReasons"],
        "theoryLink": theory_link,
        "conceptKeywords": concept_keywords(review),
        "review": {
            "verdict": review["reviewVerdict"],
            "scoringDisposition": scoring_disposition,
            "sourceAnswerAgreement": source_agreement,
            "answerEvidence": answer_evidence,
            "answerConfidence": confidence,
            "theoryLinkStatus": theory_status,
            "holdReasons": list(review.get("holdReasons") or []),
            "answerConflictOrMultipleAnswerRisk": risk,
            "runtimeStatus": runtime_status,
            "publicationBlockers": blockers,
            "reviewedAt": review["reviewedAt"],
        },
        "migration": {
            "mappingClass": mapping_class,
            "canonicalAction": "KEEP_CURRENT_CANONICAL",
            "theoryAction": "USE_DIRECT_EXISTING_THEORY",
            "runtimeDisposition": runtime_disposition,
            "confidence": migration_confidence,
            "duplicateCanonicalCluster": bool(
                decision.get("duplicateCanonicalCluster", False)
            ),
            "preserveExternalId": True,
            "preserveRegisteredSourceUrl": True,
            "preserveQuestionNumber": True,
        },
    }
    if variant_specific:
        record["variantSpecificFeedbackRequired"] = True
    if is_hold:
        record["review"]["issueLabel"] = "필수 이미지 확인"

    records.append(record)
    direct_link_matrix.append(
        {
            "externalId": external_id,
            "currentCanonicalId": decision["currentCanonicalId"],
            "targetCanonicalId": canonical["id"],
            "runtimeStatus": runtime_status,
            "variantSpecificFeedbackRequired": variant_specific,
            "lessonId": theory_link["lessonId"],
            "lessonAnchor": theory_link["lessonAnchor"],
            "conceptGroupId": theory_link["conceptGroupId"],
            "conceptId": theory_link["conceptId"],
            "theoryLinkStatus": theory_status,
            "canonicalReassignmentApplied": False,
            "lowContextPolicyApplied": is_low_context,
        }
    )

states = Counter(record["review"]["runtimeStatus"] for record in records)
assert states == Counter({"candidate": 165, "hold": 5}), states
assert len(full_mapping_ids) == 29, len(full_mapping_ids)
assert len(variant_specific_ids) == 136, len(variant_specific_ids)
assert set(image_queue_ids) == IMAGE_HOLD_IDS
assert len(low_context_ids) == 32, len(low_context_ids)
assert len(formula_ids) == 8, formula_ids
assert len(full_mapping_ids) + len(variant_specific_ids) == 165

all_records = manifest["records"] + records
assert len(all_records) == 1370
assert len({record["externalId"] for record in all_records}) == 1370
assert all_records[:1200] == manifest["records"]

batch = {
    "batchId": BATCH_ID,
    "reviewSessions": ["25", "26", "27", "28"],
    "externalIdRanges": [
        "2016-2-Q01..2016-2-Q20",
        "2016-4-Q01..2016-4-Q100",
        "2017-2-Q01..2017-2-Q50",
    ],
    "recordCount": 170,
    "candidateCount": 165,
    "choiceConflictCount": 0,
    "holdCount": 5,
    "normalizationCount": 0,
    "imageReviewCount": 5,
    "lowContextRegistrationCount": len(low_context_ids),
    "variantSpecificFeedbackCount": len(variant_specific_ids),
    "canonicalTheoryRepairs": [],
    "theoryLessonAdditionIds": [],
    "canonicalQuestionChangeIds": [],
    "holdResolution": {
        "imageVerificationQueue": sorted(IMAGE_HOLD_IDS),
        "normalizedAndRegistered": [],
        "choiceConflictNonScoring": [],
        "lowContextRegistered": sorted(low_context_ids),
    },
    "sourceFiles": [
        {
            "path": str(path.relative_to(ROOT)).replace("\\", "/"),
            "sha256": sha_file(path),
        }
        for path in REVIEW_FILES
    ],
}

new_manifest = copy.deepcopy(manifest)
new_manifest["generatedAt"] = NOW
new_manifest["batches"] = manifest["batches"] + [batch]
new_manifest["records"] = all_records
new_manifest["recordsSha256"] = sha_text(jd(all_records))
new_manifest["holdResolutionPolicy"] = build_hold_resolution_policy(
    new_manifest["batches"],
    manifest["holdResolutionPolicy"],
    NOW,
)
MANIFEST_PATH.write_text(pretty(new_manifest), encoding="utf-8")

write_json(OUT / "theory-lesson-additions.json", [])
write_json(OUT / "canonical-question-changes.json", [])
write_jsonl(OUT / "direct-theory-link-matrix.jsonl", direct_link_matrix)
write_jsonl(
    OUT / "variant-specific-choice-contract-queue.jsonl",
    [record for record in records if record.get("variantSpecificFeedbackRequired")],
)
write_jsonl(
    OUT / "image-verification-queue.jsonl",
    [record for record in records if record["review"]["runtimeStatus"] == "hold"],
)
write_jsonl(OUT / "choice-conflict-queue.jsonl", [])
write_jsonl(OUT / "answer-key-correction-ledger.jsonl", [])
write_jsonl(OUT / "manual-choice-mapping-ledger.jsonl", [])
write_jsonl(OUT / "canonical-reassignment-ledger.jsonl", [])
write_jsonl(
    OUT / "low-context-registration-ledger.jsonl",
    [
        {
            "externalId": external_id,
            "riskNote": next(
                record
                for record in records
                if record["externalId"] == external_id
            )["review"]["answerConflictOrMultipleAnswerRisk"],
            "policy": "historical_or_textbook_exam_intent_accepted_with_practical_boundary_preserved",
        }
        for external_id in sorted(low_context_ids)
    ],
)
write_jsonl(OUT / "variant-mapping.jsonl", records)
write_json(OUT / "external-ids.json", BATCH_IDS)

content_binding = {
    "status": "PASS",
    "repositoryContentFilePackaged": False,
    "expectedContentSha256": EXPECTED_CONTENT_SHA256,
    "dryRunInputContentSha256": mapping_summary["inputs"]["contentSha256"],
    "priorBatchValidatedContentSha256": prior_validation["sourceIntegrity"][
        "contentJsonSha256"
    ],
    "priorBatchReportedContentUnchanged": prior_validation["sourceIntegrity"][
        "contentJsonUnchanged"
    ],
    "bindingHashesMatch": (
        mapping_summary["inputs"]["contentSha256"]
        == prior_validation["sourceIntegrity"]["contentJsonSha256"]
        == EXPECTED_CONTENT_SHA256
    ),
    "repositoryIntegrationPrecondition": (
        "src/data/generated/content.json must hash to expectedContentSha256 before "
        "official repository validation"
    ),
}
write_json(OUT / "content-binding-validation.json", content_binding)

theory_gap_audit = {
    "batchId": BATCH_ID,
    "recordCount": 170,
    "existingDirectTheoryLinksRetained": 170,
    "existingTheoryRelinks": 0,
    "newDirectTheoryLessonsAdded": 0,
    "missingDirectTheoryAfterBatch": 0,
    "lowContextDirectTheoryLinks": len(low_context_ids),
    "notes": [
        "170문항 모두 원문 검수 theoryLink와 dry-run current canonical theoryLink가 일치한다.",
        "canonical 재배정·신규 canonical overlay·신규 이론 레슨은 필요하지 않았다.",
        "필수 이미지 HOLD 5건도 직접 이론과 계산 원리는 보존하되 정답 번호·채점을 비활성화했다.",
        "과거 교재 기준에 의존하는 32건은 riskNote와 low-context 정책을 보존했다.",
    ],
}
write_json(OUT / "theory-gap-audit.json", theory_gap_audit)

summary = {
    "batchId": BATCH_ID,
    "generatedAt": NOW,
    "recordCount": 170,
    "states": dict(states),
    "fullCanonicalChoiceMappingCount": len(full_mapping_ids),
    "manualChoiceMappingCount": 0,
    "variantSpecificFeedbackPendingCount": len(variant_specific_ids),
    "theoryLessonAdditionCount": 0,
    "canonicalQuestionChangeCount": 0,
    "directTheoryLinkCount": 170,
    "existingTheoryRelinkCount": 0,
    "imageVerificationQueueCount": len(IMAGE_HOLD_IDS),
    "choiceConflictCount": 0,
    "answerKeyCorrectionCount": 0,
    "canonicalReassignmentCount": 0,
    "lowContextRegistrationCount": len(low_context_ids),
    "formulaUnitSubstitutionCount": len(formula_ids),
    "formulaExternalIds": formula_ids,
    "sourceContentSha256Expected": EXPECTED_CONTENT_SHA256,
    "contentHashBindingVerified": content_binding["bindingHashesMatch"],
    "dryRunMappingSha256": sha_file(MAPPING_PATH),
    "priorRecordsSha256": EXPECTED_PRIOR_RECORDS_SHA256,
}
write_json(OUT / "batch-summary.json", summary)

report = f"""# CBT 시스템 실제 이식 배치 07 보고서

- 범위: 2016년 2회 Q01~Q20 + 2016년 4회 Q01~Q100 + 2017년 2회 Q01~Q50
- 총 레코드: 170
- candidate: 165
- 필수 이미지 HOLD: 5
- 선택지 충돌: 0
- canonical 재배정: 0
- 저맥락 시험기준 등록: {len(low_context_ids)}
- 신규 직접 이론 레슨: 0
- canonical 교체 overlay: 0
- canonical 선택지 1:1 매핑 완료: {len(full_mapping_ids)}
- variant 전용 선택지 계약 대기: {len(variant_specific_ids)}
- 식·단위·대입·결과 구조: {len(formula_ids)}

## 필수 이미지 HOLD

- `2016-4-Q10`: 고유진동수 수식 선택지 이미지 미판독
- `2016-4-Q26`: 제품종류·생산량 배치영역 그래프 미판독
- `2016-4-Q58`: 기하공차 도시 도면 미판독
- `2017-2-Q32`: 계측관리 공정명세표 기호 미판독
- `2017-2-Q33`: 최적수리주기 도표 미판독

## 핵심 판정

- 170문항 모두 기존 canonical과 직접 이론 연결이 유지되며 재배정은 없다.
- 이미지가 누락되었더라도 텍스트만으로 판단 가능한 `2016-4-Q70`, `2016-4-Q90`, `2017-2-Q43`과 그림 설명이 충분한 `2016-4-Q83`은 candidate를 유지한다.
- 과거 교재·역사적 분류기준에 의존하는 32건은 실무 예외를 `riskNote`로 보존하고 candidate로 등록한다.
- canonical 선택지와 안전한 1:1 대응이 되지 않는 136건은 기존 canonical 피드백을 재사용하지 않고 variant 전용 선택지 계약 완료 전까지 공개를 차단한다.

## 공개 경계

- 모든 배치 07 레코드는 candidate 또는 hold이며 published는 0건이다.
- 필수 이미지 5건은 정답·풀이·choice ID mapping을 활성화하지 않는다.
- candidate도 `pending_runtime_integration`을 유지한다.
- variant 전용 선택지 계약 대기 문항은 canonical 문자 유사도 fallback을 사용하지 않는다.
- 원본 `content.json`은 패키지에 포함하거나 수정하지 않았으며, 배치 06 검증 SHA와 dry-run 입력 SHA의 일치만 확인했다. 저장소 통합 시 동일 SHA를 다시 검증해야 한다.
"""
(OUT / "import-report.md").write_text(report, encoding="utf-8")

validation = {
    "status": "PASS",
    "recordCount": 170,
    "candidateCount": states["candidate"],
    "choiceConflictCount": states.get("choice_conflict", 0),
    "holdCount": states["hold"],
    "exactExternalIdSet": len(set(BATCH_IDS)) == 170,
    "orderedExternalIdsMatchDryRun": BATCH_IDS
    == [row["externalId"] for row in dry_rows],
    "prior1200RecordsUnchanged": all_records[:1200] == manifest["records"],
    "sourceHashesMatch": all(
        sha_text(record["stem"]) == record["source"]["stemSha256"]
        and sha_text(jd(record["choices"]))
        == record["source"]["orderedChoicesSha256"]
        for record in records
    ),
    "reviewAndDryRunTheoryLinksMatch": all(
        all(
            review_by_id[record["externalId"]]["theoryLink"][key]
            == dry_by_id[record["externalId"]]["decision"][
                "targetCanonicalTheoryLink"
            ][key]
            == record["theoryLink"][key]
            for key in ["lessonId", "lessonAnchor", "conceptGroupId", "conceptId"]
        )
        for record in records
    ),
    "candidateAnswersPresent": all(
        isinstance(record["reviewedAnswerIndex"], int)
        and bool(record["reviewedAnswerText"])
        for record in records
        if record["review"]["runtimeStatus"] == "candidate"
    ),
    "imageHoldAnswersDisabled": all(
        record["reviewedAnswerIndex"] is None
        and not record["reviewedAnswerText"]
        and not record["choiceIdMapping"]
        and record["review"]["issueLabel"] == "필수 이미지 확인"
        for record in records
        if record["review"]["runtimeStatus"] == "hold"
    ),
    "variantSpecificBlocked": all(
        "variant_specific_choice_contract_pending"
        in record["review"]["publicationBlockers"]
        and not record["choiceIdMapping"]
        for record in records
        if record.get("variantSpecificFeedbackRequired")
    ),
    "fullChoiceMappingsCorrect": all(
        len(record["choiceIdMapping"]) == len(record["choices"])
        and record["choiceIdMapping"][record["reviewedAnswerIndex"]]
        == canonical_choice_contract(dry_by_id[record["externalId"]])[
            "correctChoiceId"
        ]
        for record in records
        if record["choiceIdMapping"]
    ),
    "lowContextPoliciesPreserved": all(
        next(
            record for record in records if record["externalId"] == external_id
        )["review"]["theoryLinkStatus"]
        == "direct_existing_theory_low_context_exam_intent"
        and bool(
            next(
                record
                for record in records
                if record["externalId"] == external_id
            )["review"]["answerConflictOrMultipleAnswerRisk"]
        )
        for external_id in low_context_ids
    ),
    "formulaUnitSubstitutionCount": sum(
        record["formulaUnitSubstitution"] is not None for record in records
    )
    == 8,
    "noCanonicalReassignment": all(
        record["currentCanonicalId"] == record["canonicalId"]
        and record["migration"]["canonicalAction"] == "KEEP_CURRENT_CANONICAL"
        for record in records
    ),
    "theoryGapCountAfterBatch": 0,
    "contentHashBindingVerified": content_binding["bindingHashesMatch"],
    "sourceContentFilePackaged": False,
}
assert all(
    value is True
    or key
    in {
        "status",
        "recordCount",
        "candidateCount",
        "choiceConflictCount",
        "holdCount",
        "theoryGapCountAfterBatch",
        "sourceContentFilePackaged",
    }
    for key, value in validation.items()
), validation
write_json(OUT / "validation.json", validation)

artifact_paths = [
    MANIFEST_PATH,
    MAPPING_PATH,
    MAPPING_SUMMARY_PATH,
    OUT / "theory-lesson-additions.json",
    OUT / "canonical-question-changes.json",
    OUT / "direct-theory-link-matrix.jsonl",
    OUT / "variant-specific-choice-contract-queue.jsonl",
    OUT / "image-verification-queue.jsonl",
    OUT / "choice-conflict-queue.jsonl",
    OUT / "answer-key-correction-ledger.jsonl",
    OUT / "canonical-reassignment-ledger.jsonl",
    OUT / "manual-choice-mapping-ledger.jsonl",
    OUT / "low-context-registration-ledger.jsonl",
    OUT / "variant-mapping.jsonl",
    OUT / "external-ids.json",
    OUT / "content-binding-validation.json",
    OUT / "theory-gap-audit.json",
    OUT / "batch-summary.json",
    OUT / "import-report.md",
    OUT / "validation.json",
]
artifact_manifest = {
    "generatedAt": NOW,
    "expectedSourceContentSha256": EXPECTED_CONTENT_SHA256,
    "files": [
        {
            "path": str(path.relative_to(ROOT)).replace("\\", "/"),
            "size": path.stat().st_size,
            "sha256": sha_file(path),
        }
        for path in artifact_paths
    ],
}
write_json(OUT / "artifact-manifest.json", artifact_manifest)

print(pretty(summary))
print("manifest sha", sha_file(MANIFEST_PATH))
