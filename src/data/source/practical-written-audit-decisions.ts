import type { AuditDisposition } from "../../lib/domain/types";

export type PracticalWrittenAuditDecision = {
  disposition: AuditDisposition;
  note: string;
  modelAnswer?: string;
  requiredKeywords?: string[];
  acceptedAnswers?: string[];
  traps?: string[];
  evidenceUrls: string[];
};

const NCS_DRIVE_MAINTENANCE =
  "https://drive.google.com/file/d/1D1mnd6vEYqnVvHy1J894vjpGv6_qoBzV/view";
const KOSHA_PROTECTIVE_EQUIPMENT =
  "https://miis.kosha.or.kr/oshci/busi/viewProtectionFees.do";
const KOSHA_SAFETY_EDUCATION =
  "https://360vr.kosha.or.kr/eduDutyInfo?search=true";
const SKF_SPHERICAL_ROLLER_BEARINGS =
  "https://cdn.skfmediahub.skf.com/api/public/0901d1968027f7c9/pdf_preview_medium/0901d1968027f7c9_pdf_preview_medium.pdf";
const SKF_SPHERICAL_ROLLER_OVERVIEW =
  "https://evolution.skf.com/en/spherical-roller-bearings-the-bearing-for-all-seasons/";
const REXNORD_GEAR_COUPLING_MANUAL =
  "https://www.rexnord.com/contentitems/techlibrary/documents/couplings/cp3-012_manual";
const KOREAN_SAFETY_SIGN_RULE =
  "https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000207172";

export const PRACTICAL_WRITTEN_AUDIT_DECISIONS: Record<
  string,
  PracticalWrittenAuditDecision
> = {
  "P-2025-2-Q01-2": {
    disposition: "cbt_corrected",
    note:
      "NCS 원문과 SKF 기술자료를 대조해 자동조심 롤러베어링의 조심성, 큰 방사하중·일부 축하중 수용, 정렬오차 허용을 확인했다. 복원 선택지의 '고속회전에 적합'은 범용 특징으로 채택하지 않는다.",
    modelAnswer:
      "조심성이 있으며 큰 방사하중과 일부 축하중을 받을 수 있고, 축과 하우징의 약간의 정렬오차를 허용한다.",
    requiredKeywords: [
      "조심성",
      "큰 방사하중·일부 축하중",
      "약간의 정렬오차 허용",
    ],
    acceptedAnswers: [
      "조심성이 있으며 큰 방사하중과 일부 축하중을 받을 수 있고, 축과 하우징의 약간의 정렬오차를 허용한다.",
    ],
    traps: ["고속회전에 적합하다고 범용 특징으로 단정"],
    evidenceUrls: [
      NCS_DRIVE_MAINTENANCE,
      SKF_SPHERICAL_ROLLER_BEARINGS,
      SKF_SPHERICAL_ROLLER_OVERVIEW,
    ],
  },
  "P-2025-2-Q08": {
    disposition: "verified",
    note:
      "NCS 조립안전관리와 한국산업안전보건공단 보호구 자료를 대조해 보호구별 대상 유해인자와 공기 공급 방식을 확인했다.",
    modelAnswer:
      "방진마스크는 분진·흄·미스트 등 입자상 물질에, 방독마스크는 해당 정화통이 제거할 수 있는 가스·증기에 사용한다. 송기마스크는 외부의 깨끗한 공기를 공급하고, 전동식 호흡보호구는 송풍기로 필터 또는 정화통을 통과시킨 공기를 공급한다.",
    requiredKeywords: [
      "방진마스크-입자상 물질",
      "방독마스크-가스·증기",
      "송기마스크-외부 공기 공급",
      "전동식 호흡보호구-송풍기와 필터·정화통",
    ],
    acceptedAnswers: [
      "방진마스크는 분진·흄·미스트 등 입자상 물질에, 방독마스크는 해당 정화통이 제거할 수 있는 가스·증기에 사용한다. 송기마스크는 외부의 깨끗한 공기를 공급하고, 전동식 호흡보호구는 송풍기로 필터 또는 정화통을 통과시킨 공기를 공급한다.",
    ],
    traps: [
      "방독마스크를 산소결핍 장소의 공기 공급식 보호구로 설명",
      "전동식 호흡보호구와 송기마스크의 공기 공급원을 동일하게 설명",
    ],
    evidenceUrls: [
      KOSHA_PROTECTIVE_EQUIPMENT,
      KOSHA_SAFETY_EDUCATION,
    ],
  },
  "P-2025-2-Q10": {
    disposition: "held_asset_missing",
    note:
      "피팅·스폴링·스코어링의 일반 정의만으로는 복원문제의 세 사진 순서와 정답을 확정할 수 없다. 동일 시험 원그림 또는 출처가 확인된 동일 사진 묶음이 필요하다.",
    evidenceUrls: [NCS_DRIVE_MAINTENANCE],
  },
  "P-2025-3-Q02": {
    disposition: "held_asset_missing",
    note:
      "현행 안전표지 분류 근거는 확인했지만 복원문제의 네 도안과 순서를 확인할 원그림이 없다. 도안이 정답을 결정하므로 원그림 확보 전에는 공개하지 않는다.",
    evidenceUrls: [KOREAN_SAFETY_SIGN_RULE],
  },
  "P-2025-3-Q09": {
    disposition: "verified",
    note:
      "NCS 운반하역기계 구동장치 정비의 브레이크액 요구성능을 직접 대조했다. 원문에서 확인되지 않은 고무·금속 적합성과 산화안정성은 답안에서 제외했다.",
    modelAnswer:
      "적정한 점도를 가지며 온도 변화에 따른 점도 변화가 작고 윤활성이 좋아야 한다. 또한 비점과 인화점은 높고 빙점은 낮아야 한다.",
    requiredKeywords: [
      "적정 점도",
      "온도 변화에 따른 점도 변화가 작음",
      "윤활성",
      "높은 비점",
      "낮은 빙점",
      "높은 인화점",
    ],
    acceptedAnswers: [
      "적정한 점도를 가지며 온도 변화에 따른 점도 변화가 작고 윤활성이 좋아야 한다. 또한 비점과 인화점은 높고 빙점은 낮아야 한다.",
    ],
    traps: [
      "NCS 원문에서 확인되지 않은 고무·금속 적합성 또는 산화안정성을 필수 답안으로 채택",
      "비점과 인화점의 높고 낮음을 반대로 작성",
    ],
    evidenceUrls: [NCS_DRIVE_MAINTENANCE],
  },
  "P-2026-1-Q02": {
    disposition: "held_asset_missing",
    note:
      "금지·경고·지시표지의 현행 분류 근거는 확인했지만 복원문제의 도안과 배열을 확인할 원그림이 없다. 도안 식별 문제이므로 원그림 확보 전에는 공개하지 않는다.",
    evidenceUrls: [KOREAN_SAFETY_SIGN_RULE],
  },
  "P-2026-1-Q08": {
    disposition: "cbt_corrected",
    note:
      "NCS 원문과 Rexnord 기어 커플링 정비자료를 대조했다. 큰 토크 전달과 편심·편각 허용은 유지하되, 복원 해설의 '정기 윤활 불필요'는 제거하고 윤활·씰·치면 점검을 반영했다.",
    modelAnswer:
      "기어 커플링은 큰 토크를 전달하며 약간의 편심과 편각을 허용한다. 정비 시에는 윤활상태, 씰과 기어 치면을 점검한다.",
    requiredKeywords: [
      "기어 커플링",
      "큰 토크 전달",
      "편심·편각 허용",
      "윤활·씰·치면 점검",
    ],
    acceptedAnswers: [
      "기어 커플링은 큰 토크를 전달하며 약간의 편심과 편각을 허용한다. 정비 시에는 윤활상태, 씰과 기어 치면을 점검한다.",
    ],
    traps: ["정기 윤활이 불필요하다고 설명"],
    evidenceUrls: [NCS_DRIVE_MAINTENANCE, REXNORD_GEAR_COUPLING_MANUAL],
  },
};
