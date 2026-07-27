import type {
  PracticalVisualAid,
  PracticalVisualFrame,
  PracticalVisualOriginType,
  PracticalVisualTechnicalReviewStatus,
  PracticalVisualUsage,
} from "@/lib/domain/practical-types";

type PracticalVisualAidEnrichment =
  | "frames"
  | "originType"
  | "usageTypes"
  | "answerCritical"
  | "derivedFromVisualAidId"
  | "sourcePageImageHash"
  | "outputAssetHash"
  | "technicalReviewStatus"
  | "technicalReviewedAt"
  | "technicalReviewer"
  | "visualReviewNote";

type PracticalVisualAidInput = Omit<
  PracticalVisualAid,
  PracticalVisualAidEnrichment
> &
  Partial<
    Pick<
      PracticalVisualAid,
      PracticalVisualAidEnrichment
    >
  >;

const OUTPUT_HASH_BY_PATH: Record<string, string> = {
  "/practical/ncs/bearing-q04-a.png":
    "7fb5e24768f6893ce61c7b66b15e36ae7cfba83f6be73a6ffe760a4bdddaf76b",
  "/practical/ncs/bearing-q04-b.png":
    "1c17a1886492f6e17ac2ceeebed1991cb6b95c373e53c6bb59aee574d499f3c5",
  "/practical/ncs/bearing-q04-c.png":
    "1b8a41dab5e67fdaf0423b3d474fcf4315950e346ec844b06f7a627195435122",
  "/practical/ncs/bearing-q04-d.png":
    "939c548ccc96fb4bcf00cffbfad99649cb3bd40cd913a4d56aec31ab4da89678",
  "/practical/ncs/bearing-oil-bath-heating-diagram.png":
    "a4f77b355b15fa467ee8ea4244950db4d3d37fdb23468a67524f229d9827ae0b",
  "/practical/ncs/bearing-heated-assembly-photo.png":
    "969cbcc8e0f56a3cf39127de40522db3323968e03d26ae3310137158e66b9bff",
  "/practical/ncs/bearing-self-aligning-ball.png":
    "be48ba3d41f68c0be3831dfd1c7f33203cda8979d2f2be29b41be0e984256414",
  "/practical/ncs/tapered-bearing-disassembly-photo.png":
    "16f3cea5af42a06e37b3f13a40715a7502a5c40c52914d4755bc7ac6132c3047",
  "/practical/ncs/vernier-scale-reading.png":
    "3ff50419c349df3ecd75e0c1d725b0c465f57cb02441fae2b0c9d3275e3e919a",
  "/practical/ncs/hydraulic-qh04.png":
    "c001ee1eec2da3038e57a1cf536fbb98bebb27f888610a3e39b49f41476fdfb7",
  "/practical/visuals/autonomous-maintenance-7-steps.svg":
    "1d0777e598762033dba6a0a863e09fc5bbc582ebc397bac6ecbabdf1a16c8984",
  "/practical/visuals/oee-six-losses.svg":
    "ba3964d31051b63dd5b9cb22181239f2b99192fa85ea37ec6992f6a24d5bdfed",
  "/practical/visuals/vibration-hva-directions.svg":
    "d0e59c6f540e162a7b79de8616e9fab5b35e3f282619160cade5894449625166",
};

const OUTPUT_HASH_BY_VISUAL_AID: Record<string, string> = {
  "ncs-bearing-four-types":
    "63e7eefa6ff1a7676423b463fdc3344ec9047996f8365a76920d3a8313bf7e4a",
  "ncs-bearing-heating":
    "5c6c1b19707e46ae26851954a9407a4bc48d442df04efdf4a9e8c406c0ae145e",
};

const frameIdFromPath = (visualAidId: string, imagePath: string) => {
  const fileName = imagePath.split("/").at(-1) ?? imagePath;
  const stem = fileName.replace(/\.[^.]+$/, "");
  return `${visualAidId}--${stem}`;
};

const defaultOriginType = (
  aid: PracticalVisualAidInput,
): PracticalVisualOriginType =>
  aid.examMatchStatus === "self_authored" ? "self_authored" : "ncs_crop";

const defaultUsageTypes = (
  aid: PracticalVisualAidInput,
): PracticalVisualUsage[] => {
  if (aid.id === "ncs-bearing-four-types") {
    return [
      "past_exam_prompt",
      "recognition",
      "concept_explanation",
      "summary_diagram",
    ];
  }
  if (aid.id === "ncs-bearing-heating") {
    return ["sequence_step", "concept_explanation", "summary_diagram"];
  }
  if (aid.id === "ncs-accumulator-safety-circuit") {
    return ["variant_exam_prompt", "concept_explanation"];
  }
  return aid.examMatchStatus === "self_authored"
    ? ["concept_explanation"]
    : ["recognition", "concept_explanation"];
};

const defaultTechnicalStatus = (
  aid: PracticalVisualAidInput,
): PracticalVisualTechnicalReviewStatus =>
  aid.publicUseStatus === "public" ? "verified" : "held";

const enrichVisualAid = (
  aid: PracticalVisualAidInput,
): PracticalVisualAid => {
  const frames: PracticalVisualFrame[] =
    aid.frames ??
    aid.imagePaths.map((imagePath, index) => ({
      id: frameIdFromPath(aid.id, imagePath),
      path: imagePath,
      promptAltText:
        aid.promptAltTexts?.[index] ??
        `문제에 제시된 시각자료 ${aid.promptLabels?.[index] ?? index + 1}`,
      learningAltText: `${aid.altText}${
        aid.imagePaths.length > 1 ? ` ${index + 1}` : ""
      }`,
      captionBeforeAnswer: null,
      captionAfterAnswer: aid.caption,
      outputAssetHash:
        OUTPUT_HASH_BY_PATH[imagePath] ?? aid.sourceFileHash,
    }));

  return {
    ...aid,
    frames,
    originType: aid.originType ?? defaultOriginType(aid),
    usageTypes: aid.usageTypes ?? defaultUsageTypes(aid),
    answerCritical:
      aid.answerCritical ??
      aid.usageTypes?.some((usage) => usage.endsWith("_exam_prompt")) ??
      defaultUsageTypes(aid).some((usage) => usage.endsWith("_exam_prompt")),
    derivedFromVisualAidId: aid.derivedFromVisualAidId ?? null,
    sourcePageImageHash: aid.sourcePageImageHash ?? null,
    outputAssetHash:
      aid.outputAssetHash ??
      OUTPUT_HASH_BY_VISUAL_AID[aid.id] ??
      frames[0]?.outputAssetHash ??
      aid.sourceFileHash,
    technicalReviewStatus:
      aid.technicalReviewStatus ?? defaultTechnicalStatus(aid),
    technicalReviewedAt:
      aid.technicalReviewedAt ??
      (aid.publicUseStatus === "public" ? "2026-07-27T00:00:00.000Z" : null),
    technicalReviewer:
      aid.technicalReviewer ??
      (aid.publicUseStatus === "public" ? "source-visual-audit" : null),
    visualReviewNote:
      aid.visualReviewNote ??
      (aid.publicUseStatus === "public"
        ? "출처·권리·파일 해시·대체텍스트와 학습 연결을 확인함."
        : "공개 전 원본 대응 또는 기술 검수가 더 필요함."),
  };
};

export const NCS_SOURCE_REGISTRY = {
  "1503010215": {
    title: "공기압제어",
    version: "16v4",
    sourceUrl: "https://drive.google.com/file/d/1I_xThj7-jMfXlsQ1HvoetUrXARWYWh6C/view",
    hash: "672b3ecfb646c601e5c040fcda8c51ccb8d0c657c9ec1b41080c7f6405aa811c",
  },
  "1503010216": {
    title: "유압제어",
    version: "16v4",
    sourceUrl: "https://drive.google.com/file/d/1qZvyCVbIfMBxJ_1XpFQvULvnp5JSpNnv/view",
    hash: "60379b6b19966077104615b547f7c98a98dbfce6a201540bad2675a40898e2e3",
  },
  "1503010204": {
    title: "센서 활용 기술",
    version: "14v3",
    sourceUrl: "https://drive.google.com/file/d/1GwpAK0UGS_123Kk02VvQZl2-BzoRazcc/view",
    hash: "4154bc962df85fb8f9b2b0a5cf48687ba8553d28f301c902959cac4acf30767a",
  },
  "1503010201": {
    title: "기계시스템 분석",
    version: "14v3",
    sourceUrl: "https://drive.google.com/file/d/1V9c8ORL0t5UbaDXbfYfeAZsNugH3dGQC/view",
    hash: "34717f4b8c8df1db9e4681fd90985ce6293830d050f7d0dc44a9abcf66be2441",
  },
  "1601050111": {
    title: "피복아크용접 맞대기용접",
    version: "21v3",
    sourceUrl: "https://drive.google.com/file/d/1EJGtPKaX9BqGGK_yaGOG0B6ZYAAyuiXO/view",
    hash: "d89b55bf8fd32dabd1aa7eaf61209c40ceecb88fba466a35599be93eb31b9ace",
  },
  "1601050108": {
    title: "피복아크용접 결함부 보수용접",
    version: "21v3",
    sourceUrl: "https://drive.google.com/file/d/1L9aM9OM5B0oL95BBhKweJbwH3VYkydFx/view",
    hash: "347e55fb188462c9472280b3f5f88b41978b849ff61d31dc56969cd4042e92d5",
  },
  "1503010122": {
    title: "조립안전관리",
    version: "16v1",
    sourceUrl: "https://drive.google.com/file/d/1OZWIVylCHqqinulTcbkOINdQtpCN9v4q/view",
    hash: "5eb5b16dd51a25d7814d054c89e0266eee4378d1200e74a2e9f0ae124d84e750",
  },
  "1502010511": {
    title: "측정 도면 해독",
    version: "20v4",
    sourceUrl: "https://drive.google.com/file/d/1JezAz2punWHcYYaDzHC9xnA0nUkNZ6Gj/view",
    hash: "07194561e122faedd5991d54852b9305f127c0acf852f7c463f686eba0e9198b",
  },
  "1502010504": {
    title: "기본측정기 사용",
    version: "20v3",
    sourceUrl: "https://drive.google.com/file/d/1tba0Xr1tv8ZggGr_zuART0u7t1eEuxa5/view",
    hash: "afaa922600c0b5a824860bd50c025d8448f6a8552d5109f9a45c9ab0cb696215",
  },
  "1503010120": {
    title: "기계구동장치 조립",
    version: "16v1",
    sourceUrl: "https://drive.google.com/file/d/1E_-Y6dLCjPBTOReDk4RAQ9Xetohp0gc6/view",
    hash: "a896fe6db7a7378c8a5b67081613dcdeaad90e6cf8fbe8c40c1adf97d46acd33",
  },
  "1505010108": {
    title: "운반하역기계 구동장치 정비",
    version: "17v3",
    sourceUrl: "https://drive.google.com/file/d/1D1mnd6vEYqnVvHy1J894vjpGv6_qoBzV/view",
    hash: "9456380b7fbc89c4b417b49335697293182383801a2cbd78ca6d8cb9467e7574",
  },
} as const;

export const PRACTICAL_VISUAL_AIDS: PracticalVisualAid[] = ([
  {
    id: "ncs-bearing-four-types",
    title: "구름베어링 4종 실사 비교",
    imagePaths: [
      "/practical/ncs/bearing-q04-a.png",
      "/practical/ncs/bearing-q04-b.png",
      "/practical/ncs/bearing-q04-c.png",
      "/practical/ncs/bearing-q04-d.png",
    ],
    promptLabels: ["가", "나", "다", "라"],
    promptAltTexts: [
      "(가) 원통형 전동체가 배열된 베어링 실사",
      "(나) 경사진 원통형 전동체가 배열된 베어링 실사",
      "(다) 두 와셔 사이에 구형 전동체가 배열된 베어링 실사",
      "(라) 두 와셔 사이에 가는 원통형 전동체가 배열된 베어링 실사",
    ],
    altText:
      "원통 롤러, 테이퍼 롤러, 스러스트 볼, 스러스트 니들 베어링을 차례로 보여 주는 NCS 원문 사진",
    caption:
      "전동체 형상과 궤도륜 구조를 비교해 네 종류의 베어링을 식별한다.",
    sourceLabel: "NCS 학습모듈 「일반산업기계 구동장치 정비」",
    ncsCode: "1505010108",
    pdfPage: 96,
    printedPage: 84,
    figureNumber: "그림 3-6~3-9",
    sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
    examMatchStatus: "exact_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
  },
  {
    id: "ncs-spherical-roller-bearing",
    title: "복열 자동조심 롤러베어링",
    imagePaths: ["/practical/ncs/bearing-self-aligning-ball.png"],
    promptLabels: ["가"],
    promptAltTexts: [
      "두 줄의 배럴형 전동체와 구면 궤도를 가진 베어링 실사",
    ],
    altText:
      "두 줄의 배럴형 롤러와 구면 외륜 궤도를 가진 복열 자동조심 롤러베어링 NCS 원문 사진",
    caption:
      "그림의 전동체는 구가 아닌 배럴형 롤러이다. NCS 원문 그림 캡션은 ‘자동 조심 볼 베어링’으로 적혀 있으나, 형상에 따른 기술적 식별은 복열 자동조심 롤러베어링이다.",
    sourceLabel: "NCS 학습모듈 「운반하역기계 구동장치 정비」",
    ncsCode: "1505010108",
    pdfPage: 100,
    printedPage: 88,
    figureNumber: "그림 3-12",
    sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
    examMatchStatus: "exact_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
  },
  {
    id: "ncs-bearing-types",
    title: "구름베어링 형식 비교",
    imagePaths: [
      "/practical/ncs/bearing-q04-a.png",
      "/practical/ncs/bearing-q04-b.png",
      "/practical/ncs/bearing-q04-c.png",
      "/practical/ncs/bearing-q04-d.png",
      "/practical/ncs/bearing-magnetic-ball.png",
      "/practical/ncs/bearing-self-aligning-ball.png",
    ],
    altText: "원통 롤러, 테이퍼 롤러, 스러스트 볼, 스러스트 니들, 마그네틱 볼, 자동조심 볼베어링의 NCS 원문 사진",
    caption: "전동체 형상과 궤도륜 구조를 비교해 베어링 형식을 식별한다.",
    sourceLabel: "NCS 학습모듈 「운반하역기계 구동장치 정비」",
    ncsCode: "1505010108",
    pdfPage: 96,
    printedPage: 84,
    figureNumber: "그림 3-6~3-12",
    sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
    examMatchStatus: "concept_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "internal_only",
  },
  {
    id: "ncs-bearing-heating",
    title: "베어링 열팽창 조립",
    imagePaths: [
      "/practical/ncs/bearing-oil-bath-heating-diagram.png",
      "/practical/ncs/bearing-heated-assembly-photo.png",
    ],
    altText: "오일 배스 가열장치와 가열된 대형 베어링을 조립하는 NCS 원문 사진",
    caption: "베어링을 균일하게 가열하고 온도를 관리한 뒤 축에 직각으로 조립하는 절차를 보여준다.",
    sourceLabel: "NCS 학습모듈 「운반하역기계 구동장치 정비」",
    ncsCode: "1505010108",
    pdfPage: 122,
    printedPage: 110,
    figureNumber: "그림 3-33~3-34",
    sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
    examMatchStatus: "exact_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
  },
  {
    id: "ncs-tapered-bearing-disassembly",
    title: "테이퍼 롤러베어링 분해",
    imagePaths: ["/practical/ncs/tapered-bearing-disassembly-photo.png"],
    altText: "베어링 조립부의 잠금부품을 공구로 분해하는 NCS 원문 연속 사진",
    caption: "회전체 정지와 에너지 차단 후 지정 공구로 잠금부품을 순서대로 분해한다.",
    sourceLabel: "NCS 학습모듈 「운반하역기계 구동장치 정비」",
    ncsCode: "1505010108",
    pdfPage: 129,
    printedPage: 117,
    figureNumber: "그림 3-42",
    sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
    examMatchStatus: "concept_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
  },
  {
    id: "ncs-vernier-reading",
    title: "버니어캘리퍼스 눈금 판독",
    imagePaths: ["/practical/ncs/vernier-scale-reading.png"],
    altText: "주척과 버니어 눈금이 겹쳐 보이는 아날로그 버니어캘리퍼스의 NCS 원문 확대 사진",
    caption: "주척 기준값에 버니어의 일치 눈금 값을 더해 측정값을 판독한다.",
    sourceLabel: "NCS 학습모듈 「기본측정기 사용」",
    ncsCode: "1502010504",
    pdfPage: 84,
    printedPage: 72,
    figureNumber: "그림 3-46",
    sourceFileHash: NCS_SOURCE_REGISTRY["1502010504"].hash,
    examMatchStatus: "exact_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
  },
  {
    id: "ncs-accumulator-safety-circuit",
    title: "어큐뮬레이터 안전회로",
    imagePaths: ["/practical/ncs/hydraulic-qh04.png"],
    promptAltTexts: [
      "축압기와 밸브류가 연결된 유압 안전회로의 NCS 원문 도해",
    ],
    altText: "압력용기, 차단밸브, 방출밸브, 안전밸브, 압력계로 구성된 NCS 어큐뮬레이터 안전회로",
    caption: "정비 전 차단과 잔압 방출이 가능한 어큐뮬레이터 회로 구성을 나타낸다.",
    sourceLabel: "NCS 학습모듈 「유압제어」",
    ncsCode: "1503010216",
    pdfPage: 78,
    printedPage: 66,
    figureNumber: "그림 2-14",
    sourceFileHash: NCS_SOURCE_REGISTRY["1503010216"].hash,
    examMatchStatus: "exact_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
  },
  {
    id: "diagram-autonomous-maintenance-7-steps",
    title: "자주보전 7단계",
    imagePaths: [
      "/practical/visuals/autonomous-maintenance-7-steps.svg",
    ],
    altText:
      "초기청소, 발생원·곤란개소 대책, 청소·급유 기준, 총점검, 자주점검, 표준화, 자주관리 철저의 순서를 보여 주는 도식",
    caption:
      "청소에서 시작해 원인 제거와 기준화를 거쳐 작업자의 점검 능력과 자주관리 체계를 완성한다.",
    sourceLabel: "TPM 자주보전 7단계 학습내용 기반 자체 제작",
    ncsCode: "1503010201",
    pdfPage: 25,
    printedPage: 13,
    figureNumber: "학습용 자체 제작 흐름도",
    sourceFileHash: NCS_SOURCE_REGISTRY["1503010201"].hash,
    examMatchStatus: "self_authored",
    rightsStatus: "self_authored",
    publicUseStatus: "public",
    originType: "self_authored",
    usageTypes: ["summary_diagram", "sequence_step", "concept_explanation"],
    answerCritical: false,
    derivedFromVisualAidId: null,
    sourcePageImageHash: null,
    outputAssetHash:
      "1d0777e598762033dba6a0a863e09fc5bbc582ebc397bac6ecbabdf1a16c8984",
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-27T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "시험문제 원본이 아닌 과목 요약용 자체 제작 SVG로, 단계 명칭과 순서를 교재 데이터와 대조함.",
  },
  {
    id: "diagram-oee-six-losses",
    title: "OEE와 설비 6대 로스",
    imagePaths: ["/practical/visuals/oee-six-losses.svg"],
    altText:
      "시간가동률에는 고장·준비조정 로스, 성능가동률에는 공회전순간정지·속도저하 로스, 양품률에는 공정불량·초기수율 로스를 연결한 도식",
    caption:
      "OEE의 세 요소를 설비 6대 로스와 연결해 정지·속도·품질 손실을 구분한다.",
    sourceLabel: "OEE 및 설비 6대 로스 학습내용 기반 자체 제작",
    ncsCode: "1503010201",
    pdfPage: 25,
    printedPage: 13,
    figureNumber: "학습용 자체 제작 관계도",
    sourceFileHash: NCS_SOURCE_REGISTRY["1503010201"].hash,
    examMatchStatus: "self_authored",
    rightsStatus: "self_authored",
    publicUseStatus: "public",
    originType: "self_authored",
    usageTypes: ["summary_diagram", "concept_explanation"],
    answerCritical: false,
    derivedFromVisualAidId: null,
    sourcePageImageHash: null,
    outputAssetHash:
      "ba3964d31051b63dd5b9cb22181239f2b99192fa85ea37ec6992f6a24d5bdfed",
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-27T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "시험문제 원본이 아닌 과목 요약용 자체 제작 SVG로, OEE 세 요소와 6대 로스의 대응을 검수함.",
  },
  {
    id: "diagram-vibration-hva-directions",
    title: "진동 H·V·A 측정방향",
    imagePaths: ["/practical/visuals/vibration-hva-directions.svg"],
    altText:
      "회전축과 베어링 하우징에서 수평 H, 수직 V, 축방향 A의 측정방향을 표시한 도식",
    caption:
      "H와 V는 축에 수직인 반경방향이고 A는 회전축과 나란한 축방향이다.",
    sourceLabel: "회전기계 진동 측정방향 학습내용 기반 자체 제작",
    ncsCode: "1503010201",
    pdfPage: 25,
    printedPage: 13,
    figureNumber: "학습용 자체 제작 방향도",
    sourceFileHash: NCS_SOURCE_REGISTRY["1503010201"].hash,
    examMatchStatus: "self_authored",
    rightsStatus: "self_authored",
    publicUseStatus: "public",
    originType: "self_authored",
    usageTypes: ["summary_diagram", "concept_explanation"],
    answerCritical: false,
    derivedFromVisualAidId: null,
    sourcePageImageHash: null,
    outputAssetHash:
      "d0e59c6f540e162a7b79de8616e9fab5b35e3f282619160cade5894449625166",
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-27T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "시험문제 원본이 아닌 과목 요약용 자체 제작 SVG로, H·V·A 방향 정의를 검수함.",
  },
  ...[
    {
      id: "diagram-sensor-directions",
      title: "센서 검출 방향",
      file: "sensor-directions-v2.svg",
      alt: "축방향과 반경방향을 화살표로 표시한 센서 설치 방향 개념도",
      caption: "축방향과 반경방향의 차이를 구분하는 자체 제작 도식이다.",
      code: "1503010201",
      page: 25,
      printed: 13,
    },
    {
      id: "diagram-maintenance-tools",
      title: "정비 공구 식별",
      file: "maintenance-tools-v2.svg",
      alt: "스패너, 체인블록, 풀러, 플라이어를 단순화한 정비 공구 도식",
      caption: "작업 목적에 맞는 정비 공구를 식별하기 위한 자체 제작 도식이다.",
      code: "1503010120",
      page: 42,
      printed: 30,
    },
    {
      id: "diagram-gear-damage",
      title: "기어 손상 비교",
      file: "gear-damage-v2.svg",
      alt: "피팅, 스폴링, 스코어링의 치면 손상을 비교한 개념도",
      caption: "손상 크기와 방향을 비교해 기어 치면 결함을 판별한다.",
      code: "1505010108",
      page: 71,
      printed: 59,
    },
    {
      id: "diagram-thread-profiles",
      title: "나사산 형상 비교",
      file: "thread-profiles-v2.svg",
      alt: "삼각나사, 사각나사, 사다리꼴나사, 톱니나사의 단면 형상",
      caption: "나사산 각도와 하중 전달면을 비교하는 자체 제작 도식이다.",
      code: "1503010120",
      page: 42,
      printed: 30,
    },
    {
      id: "diagram-shaft-misalignment",
      title: "축정렬 불량 비교",
      file: "shaft-misalignment-v2.svg",
      alt: "평행 오프셋과 각도 축정렬 불량을 비교한 두 축의 중심선 도식",
      caption: "두 축 중심선의 위치와 각도를 비교해 정렬 불량 유형을 판별한다.",
      code: "1503010120",
      page: 42,
      printed: 30,
    },
    {
      id: "diagram-gear-tooth-curves",
      title: "기어 치형 곡선 비교",
      file: "gear-tooth-curves-v2.svg",
      alt: "인벌류트와 사이클로이드 계열 치형 곡선을 비교한 도식",
      caption: "곡선 생성 원리의 차이를 구분하기 위한 자체 제작 개념도이다.",
      code: "1505010108",
      page: 71,
      printed: 59,
    },
    {
      id: "diagram-dial-vblock",
      title: "다이얼 게이지와 V블록 측정",
      file: "dial-vblock-v2.svg",
      alt: "V블록 위 축에 다이얼 게이지를 접촉시킨 흔들림 측정 도식",
      caption: "축을 회전시키며 지시값 변화를 확인하는 측정 배치를 나타낸다.",
      code: "1502010504",
      page: 39,
      printed: 27,
    },
    {
      id: "diagram-bearing-components",
      title: "구름베어링 구성요소",
      file: "bearing-components-v2.svg",
      alt: "내륜, 외륜, 전동체, 케이지를 표시한 구름베어링 단면도",
      caption: "구름베어링의 네 기본 구성요소를 구분한다.",
      code: "1505010108",
      page: 96,
      printed: 84,
    },
    {
      id: "diagram-pascal-force",
      title: "파스칼 원리와 출력",
      file: "pascal-force-v2.svg",
      alt: "서로 다른 단면적의 두 피스톤에 압력이 전달되는 유압 장치 도식",
      caption: "동일 압력에서 피스톤 면적비에 따라 출력이 달라지는 원리를 나타낸다.",
      code: "1503010216",
      page: 49,
      printed: 37,
    },
    {
      id: "diagram-journal-clearance",
      title: "저널베어링 간극 측정",
      file: "journal-clearance-v2.svg",
      alt: "저널과 베어링 사이 연선을 압착해 간극을 측정하는 단면 도식",
      caption: "규정 토크로 캡을 체결한 뒤 압착된 연선 두께로 간극을 판정한다.",
      code: "1505010108",
      page: 96,
      printed: 84,
    },
    {
      id: "diagram-vernier-48-2",
      title: "버니어캘리퍼스 48.2 mm 판독",
      file: "vernier-48-2-v2.svg",
      alt: "주척 48 mm와 버니어 일치 눈금 0.2 mm를 나타낸 버니어 눈금도",
      caption: "주척값과 버니어 일치값을 더해 48.2 mm를 판독한다.",
      code: "1502010504",
      page: 84,
      printed: 72,
    },
    {
      id: "diagram-spherical-roller-bearing",
      title: "복열 자동조심 롤러베어링",
      file: "spherical-roller-bearing-v2.svg",
      alt: "두 줄의 배럴형 롤러와 구면 외륜 궤도를 가진 자동조심 롤러베어링 단면도",
      caption: "복열 롤러와 구면 궤도로 각도 오차를 허용하는 구조를 나타낸다.",
      code: "1505010108",
      page: 96,
      printed: 84,
    },
    {
      id: "diagram-measurement-instruments",
      title: "측정기 3종 식별",
      file: "measurement-instruments-v2.svg",
      alt: "다이얼 게이지, 버니어캘리퍼스, 외측 마이크로미터를 나란히 표시한 도식",
      caption: "형상과 측정 용도를 기준으로 세 측정기를 식별한다.",
      code: "1502010504",
      page: 39,
      printed: 27,
    },
    {
      id: "diagram-measurement-tools",
      title: "측정 보조기구 식별",
      file: "measurement-tools-v2.svg",
      alt: "버니어캘리퍼스, 마이크로미터, 다이얼 게이지, V블록을 비교한 도식",
      caption: "측정기와 보조기구의 형상 및 용도를 비교한다.",
      code: "1502010504",
      page: 39,
      printed: 27,
    },
    {
      id: "diagram-bearing-four-exam",
      title: "베어링 4종 식별",
      file: "bearing-four-exam.svg",
      alt: "A부터 D까지 표시한 원통 롤러, 테이퍼 롤러, 스러스트 볼, 자동조심 롤러베어링 개념도",
      caption: "전동체와 궤도륜 구조를 기준으로 네 종류의 베어링을 구분한다.",
      code: "1505010108",
      page: 96,
      printed: 84,
    },
    {
      id: "diagram-tapered-endplay",
      title: "테이퍼 롤러베어링 엔드플레이",
      file: "tapered-endplay.svg",
      alt: "마주 보는 테이퍼 롤러베어링의 축방향 간극을 다이얼 게이지로 측정하는 도식",
      caption: "조정너트와 다이얼 게이지를 이용해 축방향 엔드플레이를 확인한다.",
      code: "1505010108",
      page: 96,
      printed: 84,
    },
    {
      id: "diagram-shaft-misalignment-three",
      title: "축정렬 불량 3종",
      file: "shaft-misalignment-three.svg",
      alt: "평행, 각도, 복합 축정렬 불량을 A부터 C까지 비교한 도식",
      caption: "중심선의 오프셋과 각도를 기준으로 세 정렬 불량을 판별한다.",
      code: "1503010120",
      page: 42,
      printed: 30,
    },
    {
      id: "diagram-maintenance-tools-five",
      title: "정비 공구 5종",
      file: "maintenance-tools-five.svg",
      alt: "후크스패너, 소켓렌치, 기어풀러, 스냅링플라이어, 토크렌치를 A부터 E까지 표시한 도식",
      caption: "공구 형상과 적용 작업을 연결해 다섯 정비 공구를 식별한다.",
      code: "1503010120",
      page: 42,
      printed: 30,
    },
    {
      id: "diagram-vernier-37-35",
      title: "버니어캘리퍼스 37.35 mm 판독",
      file: "vernier-37-35.svg",
      alt: "주척 37 mm를 지나 버니어 7번째 눈금이 일치하는 0.05 mm 버니어 눈금도",
      caption: "주척 37 mm와 버니어 0.35 mm를 더해 측정값을 판독한다.",
      code: "1502010504",
      page: 84,
      printed: 72,
    },
    {
      id: "diagram-micrometer-12-73",
      title: "외측 마이크로미터 12.73 mm 판독",
      file: "micrometer-12-73.svg",
      alt: "슬리브 12.5 mm와 딤블 23눈금이 표시된 외측 마이크로미터 눈금도",
      caption: "슬리브값과 딤블값을 합산해 외측 마이크로미터 값을 판독한다.",
      code: "1502010504",
      page: 53,
      printed: 41,
    },
    {
      id: "diagram-double-acting-cylinder",
      title: "복동실린더 전진·후진 유효면적",
      file: "double-acting-cylinder.svg",
      alt: "실린더 내경 D와 로드 지름 d에 따른 전진면적과 후진 환상면적 도식",
      caption: "전진은 피스톤 전면적, 후진은 로드 단면적을 제외한 환상면적을 사용한다.",
      code: "1503010216",
      page: 49,
      printed: 37,
    },
  ].map(
    (aid): PracticalVisualAidInput => ({
      id: aid.id,
      title: aid.title,
      imagePaths: [`/practical/diagrams/${aid.file}`],
      altText: aid.alt,
      caption: aid.caption,
      sourceLabel: `NCS 학습모듈 원리 기반 자체 제작 · ${NCS_SOURCE_REGISTRY[aid.code as keyof typeof NCS_SOURCE_REGISTRY].title}`,
      ncsCode: aid.code,
      pdfPage: aid.page,
      printedPage: aid.printed,
      figureNumber: "NCS 원문 기반 자체 제작",
      sourceFileHash:
        NCS_SOURCE_REGISTRY[aid.code as keyof typeof NCS_SOURCE_REGISTRY].hash,
      examMatchStatus: "self_authored",
      rightsStatus: "self_authored",
      publicUseStatus: "internal_only",
    }),
  ),
] satisfies PracticalVisualAidInput[]).map(enrichVisualAid);

export const PRACTICAL_VISUAL_AID_BY_QUESTION: Record<string, string> = {
  "P-2025-1-Q04": "ncs-bearing-four-types",
  "EXP-B01": "ncs-bearing-four-types",
};

export const PRACTICAL_PDF_PAGE_BY_TOPIC: Record<string, { pdfPage: number; printedPage: number; figureNumber: string | null }> = {
  "1505010108:구름베어링": { pdfPage: 96, printedPage: 84, figureNumber: "그림 3-6~3-12" },
  "1505010108:베어링": { pdfPage: 96, printedPage: 84, figureNumber: "그림 3-6~3-12" },
  "1505010108:유도가열": { pdfPage: 122, printedPage: 110, figureNumber: "그림 3-33~3-34" },
  "1505010108:백래시": { pdfPage: 71, printedPage: 59, figureNumber: null },
  "1505010108:기어": { pdfPage: 71, printedPage: 59, figureNumber: null },
  "1505010108:저널베어링": { pdfPage: 38, printedPage: 26, figureNumber: null },
  "1502010504:버니어": { pdfPage: 84, printedPage: 72, figureNumber: "그림 3-46" },
  "1502010504:마이크로미터": { pdfPage: 53, printedPage: 41, figureNumber: null },
  "1502010504:다이얼게이지": { pdfPage: 39, printedPage: 27, figureNumber: null },
  "1502010511:투상": { pdfPage: 75, printedPage: 63, figureNumber: "그림 2-1" },
  "1502010511:단면": { pdfPage: 77, printedPage: 65, figureNumber: null },
  "1503010216:어큐뮬레이터": { pdfPage: 78, printedPage: 66, figureNumber: "그림 2-14" },
  "1503010216:미터": { pdfPage: 67, printedPage: 55, figureNumber: null },
  "1503010216:실린더": { pdfPage: 49, printedPage: 37, figureNumber: null },
  "1503010215:FRL": { pdfPage: 24, printedPage: 12, figureNumber: null },
  "1503010215:방향제어밸브": { pdfPage: 30, printedPage: 18, figureNumber: null },
  "1503010122:안전표지": { pdfPage: 27, printedPage: 15, figureNumber: null },
  "1503010122:LOTO": { pdfPage: 25, printedPage: 13, figureNumber: null },
  "1503010204:히스테리시스": { pdfPage: 42, printedPage: 30, figureNumber: null },
  "1503010204:로드셀": { pdfPage: 22, printedPage: 10, figureNumber: null },
  "1503010201:진동": { pdfPage: 25, printedPage: 13, figureNumber: null },
  "1601050108:용접결함": { pdfPage: 14, printedPage: 2, figureNumber: null },
  "1601050108:비파괴": { pdfPage: 61, printedPage: 49, figureNumber: null },
  "1601050108:보수용접": { pdfPage: 35, printedPage: 23, figureNumber: null },
};
