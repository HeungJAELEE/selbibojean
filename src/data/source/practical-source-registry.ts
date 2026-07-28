import type {
  PracticalVisualAid,
  PracticalVisualFrame,
  PracticalVisualOriginType,
  PracticalVisualTechnicalReviewStatus,
  PracticalVisualUsage,
} from "@/lib/domain/practical-types";
import { PRACTICAL_TASK_SEQUENCE_OUTPUT_HASHES } from "./practical-task-sequence-output-hashes";
import { PRACTICAL_TASK_VISUAL_SEEDS } from "./practical-task-sequences";

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
  "/practical/ncs/bearing-magnetic-ball.png":
    "f754e5512465f7aedf43c5eaec7ab4da9c321b9ded8c4b9720bacc3256105177",
  "/practical/ncs/tapered-bearing-disassembly-photo.png":
    "16f3cea5af42a06e37b3f13a40715a7502a5c40c52914d4755bc7ac6132c3047",
  "/practical/ncs/vernier-scale-reading.png":
    "3ff50419c349df3ecd75e0c1d725b0c465f57cb02441fae2b0c9d3275e3e919a",
  "/practical/ncs/hydraulic-qh04.png":
    "c001ee1eec2da3038e57a1cf536fbb98bebb27f888610a3e39b49f41476fdfb7",
  "/practical/visuals/gear-coupling-measure.png":
    "be8a63caaaf320895df6b8ebdfedc9550840f3acaab860de5ebc623a18e4b93d",
  "/practical/visuals/gear-coupling-align.png":
    "b724baf18455216e4ae9644329ee4d5b8490cbb02025bad436b27cc23d0eabea",
  "/practical/visuals/gear-coupling-assemble.png":
    "afebc1a9fd40901788823289dd93b52a4003d1880b31a89a39bb6b2cfb1982e5",
  "/practical/visuals/gear-coupling-grease.png":
    "04c3a03519816f85628b783295487863ddda73cc4b912632c0d084d6e1aa8d8d",
  "/practical/visuals/tapered-bearing-inner-cone.png":
    "87c4fdad7ea02c2c53f14617facb5432271c559bd1efa5c2d8153799661b1533",
  "/practical/visuals/tapered-bearing-hub-cover.png":
    "d775e61e90c94b6bc0bc34899900a30d88fd65a1228008f1a1b9459ecac2f2c2",
  "/practical/visuals/tapered-bearing-dial-gauge.png":
    "1575cb7555c2577c6988c4e2bf58e835091409e2df9b59e5eaf1e1067cc70865",
  "/practical/visuals/tapered-bearing-clearance-adjust.png":
    "ff7dab9508f406736a2faa89b070ee7a95b80cf4e59c83b8db1df62521d68338",
  "/practical/visuals/tapered-bearing-lock-cover.png":
    "9841ca8376118d340874179a4f25aed3b287230d2bdf9d8aefd33b21e9de21c1",
  "/practical/visuals/autonomous-maintenance-7-steps.svg":
    "1d0777e598762033dba6a0a863e09fc5bbc582ebc397bac6ecbabdf1a16c8984",
  "/practical/visuals/oee-six-losses.svg":
    "ba3964d31051b63dd5b9cb22181239f2b99192fa85ea37ec6992f6a24d5bdfed",
  "/practical/visuals/vibration-hva-directions.svg":
    "d0e59c6f540e162a7b79de8616e9fab5b35e3f282619160cade5894449625166",
  "/practical/visuals/drive-unit-exploded-order.png":
    "b536eee540b49d99bc93da9422f991717dc73d885cc46ffc9ca7f29deda28694",
  "/practical/visuals/height-gauge-up-down-measurement.png":
    "02a707ef0176eb0254ab0953c4a1d9e0f837a63271942f1f0d4ea22cc00ce767",
  "/practical/visuals/cylindricity-vblock-dial.png":
    "11fedcfe9f7bd71cd2123bf607a3fbcdad1f7794332a7b96fc2c54a9d5bef6ae",
  "/practical/visuals/cylindricity-micrometer-directions.png":
    "344c48908777049f085aac8801378fefb50b6c5f04c418e5a58620d1eac6bd70",
  "/practical/visuals/proximity-sensor-detection-setting-distance.png":
    "f7296fe417694e49ab48040a10db54681672932cd85a2fa1d89dff2b318fcafb",
  "/practical/visuals/proximity-sensor-shielded-installation.png":
    "0ccb98fadcd2f9bc25ae49308548f08ee47f1781552b68d047439c327ee12baa",
  "/practical/visuals/proximity-sensor-unshielded-installation.png":
    "a49b67d93763fefbfaa234ade891f8431929dcd2623003a5f61ff9de0d4bb371",
  "/practical/visuals/proximity-sensor-parallel-spacing.png":
    "89c5a0aa0a108e9c3be02dbac7232ad44c9247b8269c9e2c69439da04ef8b388",
  "/practical/visuals/proximity-sensor-face-spacing.png":
    "5d7952cb8d70a85497da021399283f249c1bad0edf43ca4d525fea54ca86e272",
  "/practical/diagrams/bearing-induction-check.svg":
    "d8090c36a76ac7230b8f8a3419f21e5014cf1d2264a5765d368cc9910a3066a3",
  "/practical/diagrams/bearing-induction-heat.svg":
    "908dccc1247cfe0f77c59dcd88d6b20a3e930981d0350ee99e9bec2293ca4ada",
  "/practical/diagrams/bearing-induction-fit.svg":
    "4759249b6076c10391fafc11b08f0095d3a1b62b2e5d687a7f112783d6447c5f",
  "/practical/diagrams/bearing-components-v2.svg":
    "b448fb7bb08e2de7b80fd15629b21219c478bc014676bcc78018306ef355dd74",
  "/practical/diagrams/bearing-four-exam.svg":
    "18033fd3e85c329d2a8598e5853bf70366e79bf0ff171ac496528c6f0b84d095",
  "/practical/diagrams/dial-vblock-v2.svg":
    "8e06818d44a43b56f02ba9e9f3639406540e15a6f00350bcfbcc1c142bc6543c",
  "/practical/diagrams/double-acting-cylinder.svg":
    "f608a27f348c9a8252bcf6e47e45115cdb024bbe9fbf89071a40ae9d07462e92",
  "/practical/diagrams/gear-damage-v2.svg":
    "61cd4e1cd8a5de2dbf95c8999e8dec280e09f532efc4f11edfe8d363c7576e16",
  "/practical/diagrams/gear-tooth-curves-v2.svg":
    "dd14de29cd6b45fbd5e5a4def1687cf9cbb1c7569c632342a715101c43479f54",
  "/practical/diagrams/journal-clearance-v2.svg":
    "90e719f9d822f73d31916aad7d0aa81bef118a3425f082bc047910ff9c46b7b7",
  "/practical/diagrams/maintenance-tools-five.svg":
    "d51c221fc5c8e7a6014898823c228ab61e3a62c5e4b2e7101c568ae1e2c3ba56",
  "/practical/diagrams/maintenance-tools-v2.svg":
    "0d9125deb86f1fcb67f6a201b262ee6669e8e6e830afc9ff42f8cb4784077e43",
  "/practical/diagrams/measurement-instruments-v2.svg":
    "9e7a675715e2d2456db2446b7d97dae39277a90f5e0f272a1fb7ad1278f3720c",
  "/practical/diagrams/measurement-tools-v2.svg":
    "0179e730eb22c1b328deddf0c4bf55ce56b7c5b129b51fe299a6962c035d1366",
  "/practical/diagrams/micrometer-12-73.svg":
    "4abe9c381820228f480380692e749662dd4839a2cefb7c7fff69dec4590404d3",
  "/practical/diagrams/pascal-force-v2.svg":
    "31886739750e0735dca4c06535285a133c4dd5981b53b41f95f34ef3f9d8f831",
  "/practical/diagrams/sensor-directions-v2.svg":
    "e802dd6b30f37788f1db2fa60c2b6216888a33b979196af5249ecf544b120ed2",
  "/practical/diagrams/shaft-misalignment-three.svg":
    "035ec01289228c03b402718de0da22f24c9f221f16bf8c894588d588791f9eaf",
  "/practical/diagrams/shaft-misalignment-v2.svg":
    "37c5271345b99c57a475c64e5355bd2507de6e5980525713d87d9ccfc5d123ca",
  "/practical/diagrams/spherical-roller-bearing-v2.svg":
    "a8649acdb8d9e7761ec52dbcae6bc27bb8f38c487f10fff2722e7179f5ea9347",
  "/practical/diagrams/tapered-endplay.svg":
    "a8b23527f75881350d9377f6d6948d76ae6daccfced21b8235c20d272ab87e44",
  "/practical/diagrams/thread-profiles-v2.svg":
    "c759da2d0194bad0d292dca00206468ab491e6217317300f35e9f1aeafe3d5f6",
  "/practical/diagrams/vernier-37-35.svg":
    "c23c87bbddc49e3959435424babdb26cee663b6213dbbdc3672502135c6325be",
  "/practical/diagrams/vernier-48-2-v2.svg":
    "0b7eab8ad301912176a84923ac8c590f7bef99cac2c8e6ab1930c6b80ad0c5fc",
  "/practical/visuals/photoelectric-switch-example.png":
    "50db0d26b04e770ab1ed149791bd9a492e3a6029ba3d39ecd418584c28f4652e",
  "/practical/visuals/bearing-damage-frame-01.png":
    "3328710a36877d8021ad683e09d1c312afda40a563df73b7f321d1739f55a593",
  "/practical/visuals/bearing-damage-frame-02.png":
    "d9bc10a4fe67501e8fd371080b840aacdf5d7ac02e04c77e8bf849c445fd04c4",
  "/practical/visuals/bearing-damage-frame-03.png":
    "2e838eac1188f16b00147328c04479da2a2e9168e1a4f9fc19f12accb98a6187",
  "/practical/visuals/bearing-damage-frame-04.png":
    "0dc94b1748e3dd547dd0541814d1a5f0426c8dbe450d6e1e915e0d3c7d7c8c71",
  "/practical/visuals/bearing-damage-frame-05.png":
    "9a53adae7501fc240d52c924ae35d5905c479af40d063df88be1e118a3da3f4d",
  "/practical/visuals/bearing-damage-frame-06.png":
    "ef2e3fd0e2885e78f520b050f4d474693442fe8e6ae9eb2878a5b589fb2b55ec",
  "/practical/visuals/bearing-damage-frame-07.png":
    "01982860c67b493e597ab284b3b2fd47efd024691b5b1fcccd8e46b336eb9747",
  "/practical/visuals/bearing-damage-frame-08.png":
    "b1617d494b81f3ea025d952e95a6b69054862ce6cde0ead19d9ac45ce7fe9593",
  "/practical/visuals/rt-film-frame-01.png":
    "a035b2120e79c8a0db04512693ebec67e9bbf0a2d7c7f035c2b3106b9aafc950",
  "/practical/visuals/rt-film-frame-02.png":
    "c808b2f6f60eb39ab79c009588ad8205b08f02abb23aec88de2c13b4f66be526",
  "/practical/visuals/rt-film-frame-03.png":
    "e92d453a8758b72d210538171ee7732bd07a5a6cce187837ccc082eb5c3cafc2",
  "/practical/visuals/rt-film-frame-04.png":
    "b1c3e53af98e4430678d3f35310682ecf46bb42100e797030b779a55fb32c4a5",
  "/practical/visuals/rt-film-frame-05.png":
    "85217f611167b6b001de6dd251441baa010e88eaca7a05630ab0f40cd6d801a8",
  "/practical/visuals/rt-film-frame-06.png":
    "1bf1ab03208b3cf003d228c505c15724f7c74b98f2e3408b87b985d2f84e048b",
  "/practical/visuals/brake-condition-frame-01.png":
    "f0ac3fe8dac6733af15d1d7aab3d95cb8515f0291f60b786af5839dd561b1ca4",
  "/practical/visuals/brake-condition-frame-02.png":
    "3982e30d1a8fdf44a611da7eb8123a02355cd8933da3dc5b1a215e2021cd7501",
  "/practical/visuals/brake-condition-frame-03.png":
    "c8c66227195d32121532f50b061c9c658a7d03ead64b00a1388ec7d7b5007389",
  "/practical/visuals/brake-condition-frame-04.png":
    "7e8c1b0a18207cb2187a2d2d7242b514971289b04acaa7b533ba7fe1f220bef2",
  "/practical/visuals/brake-condition-frame-05.png":
    "d89e370dfaaee418fbfe25a025b1975df494acce49c15568cdddaf645554541c",
  "/practical/visuals/brake-condition-frame-06.png":
    "a3624236011d446871203898788d2459daba5e1094127f4304a035615244bede",
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

const sequencePromptLabels = ["가", "나", "다", "라", "마", "바", "사"];

const promptFrameOrder = (frameCount: number) =>
  Array.from(
    { length: frameCount },
    (_, index) => (index + (frameCount === 2 ? 1 : 2)) % frameCount,
  );

const PRACTICAL_TASK_VISUAL_AIDS: PracticalVisualAidInput[] =
  PRACTICAL_TASK_VISUAL_SEEDS.map((sequence) => {
    const isInspection = sequence.assessmentFormat === "inspection";
    const registry = NCS_SOURCE_REGISTRY[sequence.sourcePdfId];
    const frames: PracticalVisualFrame[] = sequence.frames.map(
      (sequenceFrame) => ({
        id: `${sequence.id}--${sequenceFrame.id}`,
        path: `/practical/visuals/${sequenceFrame.id}.png`,
        promptAltText: isInspection
          ? "브레이크 부품과 점검 도구가 보이는 NCS 점검 장면"
          : "작업 순서를 판단하기 위한 NCS 작업 장면",
        learningAltText: sequenceFrame.learningAltText,
        captionBeforeAnswer: null,
        captionAfterAnswer: sequenceFrame.caption,
        outputAssetHash:
          PRACTICAL_TASK_SEQUENCE_OUTPUT_HASHES[sequenceFrame.id] ??
          registry.hash,
      }),
    );
    const firstFrame = sequence.frames[0];

    return {
      id: sequence.id,
      title: sequence.title,
      imagePaths: frames.map((frame) => frame.path),
      frames,
      promptLabels: sequence.frames.map(
        (_, index) => sequencePromptLabels[index] ?? `${index + 1}`,
      ),
      promptAltTexts: sequence.frames.map(
        () =>
          isInspection
            ? "브레이크 부품과 점검 도구가 보이는 NCS 점검 장면"
            : "작업 순서를 판단하기 위한 NCS 작업 장면",
      ),
      promptFrameIds: promptFrameOrder(sequence.frames.length).map(
        (index) => frames[index].id,
      ),
      altText: isInspection
        ? `${sequence.title}의 점검 위치와 측정 방법을 비교하는 NCS 사진과 도해`
        : `${sequence.title}의 작업 단계를 순서대로 보여 주는 NCS 사진과 도해`,
      caption: sequence.directAnswer,
      sourceLabel: `NCS 학습모듈 · ${registry.title}`,
      ncsCode: sequence.sourcePdfId,
      pdfPage: firstFrame.pdfPage,
      printedPage: firstFrame.printedPage,
      figureNumber: `${firstFrame.figureNumber} 외`,
      sourceFileHash: registry.hash,
      examMatchStatus: "concept_source",
      rightsStatus: "education_use_with_attribution",
      publicUseStatus: "public",
      originType: "ncs_crop",
      usageTypes: isInspection
        ? ["recognition", "concept_explanation", "variant_exam_prompt"]
        : ["sequence_step", "concept_explanation", "variant_exam_prompt"],
      answerCritical: true,
      technicalReviewStatus: "verified",
      technicalReviewedAt: "2026-07-27T00:00:00.000Z",
      technicalReviewer: "source-visual-audit",
      visualReviewNote:
        isInspection
          ? "NCS 원문의 서로 다른 점검 사진을 대조하고, 고정 작업순서로 오인하지 않도록 사진 식별·점검형으로 분리했다."
          : "NCS 원문 페이지와 단계 순서를 대조하고, 문제용 중립 대체텍스트와 학습용 설명을 분리했다.",
    };
  });

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
    publicUseStatus: "public",
  },
  {
    id: "ncs-gear-coupling-sequence",
    title: "기어 커플링 측정·조립 4단계",
    imagePaths: [
      "/practical/visuals/gear-coupling-measure.png",
      "/practical/visuals/gear-coupling-align.png",
      "/practical/visuals/gear-coupling-assemble.png",
      "/practical/visuals/gear-coupling-grease.png",
    ],
    frames: [
      {
        id: "ncs-gear-coupling-sequence--gear-coupling-measure",
        path: "/practical/visuals/gear-coupling-measure.png",
        promptAltText: "기어 커플링 작업 장면",
        learningAltText: "양쪽 허브의 간격을 같은 조건에서 측정하는 장면",
        captionBeforeAnswer: null,
        captionAfterAnswer: "양쪽 허브의 간격을 같은 기준으로 측정한다.",
        outputAssetHash:
          "be8a63caaaf320895df6b8ebdfedc9550840f3acaab860de5ebc623a18e4b93d",
      },
      {
        id: "ncs-gear-coupling-sequence--gear-coupling-align",
        path: "/practical/visuals/gear-coupling-align.png",
        promptAltText: "기어 커플링 작업 장면",
        learningAltText: "측정값에 맞춰 허브 위치를 일치시키는 장면",
        captionBeforeAnswer: null,
        captionAfterAnswer: "측정한 간격과 축 중심을 기준으로 허브 위치를 맞춘다.",
        outputAssetHash:
          "b724baf18455216e4ae9644329ee4d5b8490cbb02025bad436b27cc23d0eabea",
      },
      {
        id: "ncs-gear-coupling-sequence--gear-coupling-assemble",
        path: "/practical/visuals/gear-coupling-assemble.png",
        promptAltText: "기어 커플링 작업 장면",
        learningAltText: "슬리브와 플랜지를 조립·체결하는 장면",
        captionBeforeAnswer: null,
        captionAfterAnswer: "치형과 볼트 구멍을 맞춰 슬리브와 플랜지를 조립한다.",
        outputAssetHash:
          "afebc1a9fd40901788823289dd93b52a4003d1880b31a89a39bb6b2cfb1982e5",
      },
      {
        id: "ncs-gear-coupling-sequence--gear-coupling-grease",
        path: "/practical/visuals/gear-coupling-grease.png",
        promptAltText: "기어 커플링 작업 장면",
        learningAltText: "조립된 기어 커플링에 그리스를 주입하는 장면",
        captionBeforeAnswer: null,
        captionAfterAnswer: "지정 그리스를 주입하고 플러그를 다시 체결한다.",
        outputAssetHash:
          "04c3a03519816f85628b783295487863ddda73cc4b912632c0d084d6e1aa8d8d",
      },
    ],
    promptFrameIds: [
      "ncs-gear-coupling-sequence--gear-coupling-assemble",
      "ncs-gear-coupling-sequence--gear-coupling-measure",
      "ncs-gear-coupling-sequence--gear-coupling-grease",
      "ncs-gear-coupling-sequence--gear-coupling-align",
    ],
    promptLabels: ["가", "나", "다", "라"],
    altText:
      "기어 커플링의 간격 측정, 위치 맞춤, 조립, 그리스 주입을 순서대로 보여 주는 NCS 도해",
    caption:
      "같은 조건으로 간격을 측정한 뒤 위치를 맞추고 조립·체결한 다음 그리스를 주입한다.",
    sourceLabel: "NCS 학습모듈 「운반하역기계 구동장치 정비」",
    ncsCode: "1505010108",
    pdfPage: 47,
    printedPage: 35,
    figureNumber: "그림 1-44",
    sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
    examMatchStatus: "concept_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
    originType: "ncs_crop",
    usageTypes: ["sequence_step", "concept_explanation"],
    answerCritical: true,
    derivedFromVisualAidId: null,
    sourcePageImageHash: null,
    outputAssetHash:
      "be8a63caaaf320895df6b8ebdfedc9550840f3acaab860de5ebc623a18e4b93d",
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-27T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "원문 단계 번호와 정답 문구를 제외하고 작업 장면만 크롭했으며, 정순서와 문제용 섞기 순서를 분리 검수했다.",
  },
  {
    id: "ncs-tapered-bearing-assembly-sequence",
    title: "테이퍼 롤러베어링 조립·간극조정 5단계",
    imagePaths: [
      "/practical/visuals/tapered-bearing-inner-cone.png",
      "/practical/visuals/tapered-bearing-hub-cover.png",
      "/practical/visuals/tapered-bearing-dial-gauge.png",
      "/practical/visuals/tapered-bearing-clearance-adjust.png",
      "/practical/visuals/tapered-bearing-lock-cover.png",
    ],
    frames: [
      {
        id: "ncs-tapered-bearing-assembly-sequence--tapered-bearing-inner-cone",
        path: "/practical/visuals/tapered-bearing-inner-cone.png",
        promptAltText: "테이퍼 롤러베어링 작업 장면",
        learningAltText: "안쪽 콘을 허브에 삽입하는 장면",
        captionBeforeAnswer: null,
        captionAfterAnswer: "규정 그리스를 도포한 안쪽 콘을 바르게 삽입한다.",
        outputAssetHash:
          "87c4fdad7ea02c2c53f14617facb5432271c559bd1efa5c2d8153799661b1533",
      },
      {
        id: "ncs-tapered-bearing-assembly-sequence--tapered-bearing-hub-cover",
        path: "/practical/visuals/tapered-bearing-hub-cover.png",
        promptAltText: "테이퍼 롤러베어링 작업 장면",
        learningAltText: "허브 커버를 체결하고 허브를 축에 삽입하는 장면",
        captionBeforeAnswer: null,
        captionAfterAnswer: "커버를 대각선 토크로 체결하고 허브를 축에 삽입한다.",
        outputAssetHash:
          "d775e61e90c94b6bc0bc34899900a30d88fd65a1228008f1a1b9459ecac2f2c2",
      },
      {
        id: "ncs-tapered-bearing-assembly-sequence--tapered-bearing-dial-gauge",
        path: "/practical/visuals/tapered-bearing-dial-gauge.png",
        promptAltText: "테이퍼 롤러베어링 작업 장면",
        learningAltText: "허브에 다이얼 게이지를 설치하고 영점을 맞추는 장면",
        captionBeforeAnswer: null,
        captionAfterAnswer: "다이얼 게이지를 설치하고 영점을 맞춘다.",
        outputAssetHash:
          "1575cb7555c2577c6988c4e2bf58e835091409e2df9b59e5eaf1e1067cc70865",
      },
      {
        id: "ncs-tapered-bearing-assembly-sequence--tapered-bearing-clearance-adjust",
        path: "/practical/visuals/tapered-bearing-clearance-adjust.png",
        promptAltText: "테이퍼 롤러베어링 작업 장면",
        learningAltText: "허브를 흔들며 축방향 간극을 측정·조정하는 장면",
        captionBeforeAnswer: null,
        captionAfterAnswer: "허브를 앞뒤로 흔들어 규정 간극이 되도록 너트를 조정한다.",
        outputAssetHash:
          "ff7dab9508f406736a2faa89b070ee7a95b80cf4e59c83b8db1df62521d68338",
      },
      {
        id: "ncs-tapered-bearing-assembly-sequence--tapered-bearing-lock-cover",
        path: "/practical/visuals/tapered-bearing-lock-cover.png",
        promptAltText: "테이퍼 롤러베어링 작업 장면",
        learningAltText: "로크 와셔를 고정하고 커버를 조립하는 장면",
        captionBeforeAnswer: null,
        captionAfterAnswer: "로크 와셔로 너트를 고정한 뒤 그리스와 커버를 복구한다.",
        outputAssetHash:
          "9841ca8376118d340874179a4f25aed3b287230d2bdf9d8aefd33b21e9de21c1",
      },
    ],
    promptFrameIds: [
      "ncs-tapered-bearing-assembly-sequence--tapered-bearing-dial-gauge",
      "ncs-tapered-bearing-assembly-sequence--tapered-bearing-inner-cone",
      "ncs-tapered-bearing-assembly-sequence--tapered-bearing-lock-cover",
      "ncs-tapered-bearing-assembly-sequence--tapered-bearing-hub-cover",
      "ncs-tapered-bearing-assembly-sequence--tapered-bearing-clearance-adjust",
    ],
    promptLabels: ["가", "나", "다", "라", "마"],
    altText:
      "안쪽 콘 삽입부터 허브 조립, 다이얼 게이지 설치, 간극 조정, 로크 와셔 고정까지 보여 주는 NCS 연속 사진",
    caption:
      "베어링을 조립한 뒤 다이얼 게이지로 축방향 간극을 측정·조정하고 잠금부품과 커버를 복구한다.",
    sourceLabel: "NCS 학습모듈 「운반하역기계 구동장치 정비」",
    ncsCode: "1505010108",
    pdfPage: 130,
    printedPage: 118,
    figureNumber: "그림 3-43~3-48",
    sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
    examMatchStatus: "concept_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
    originType: "ncs_crop",
    usageTypes: ["sequence_step", "concept_explanation"],
    answerCritical: true,
    derivedFromVisualAidId: null,
    sourcePageImageHash: null,
    outputAssetHash:
      "50d0bcd06f4b83f1a6d417c8d72266bdc07f3e6283ec4e340143c6af6c6fc5d6",
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-27T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "PDF p.130~132의 연속 사진을 단계별로 크롭하고, 학습 정순서와 문제용 섞기 순서를 분리 검수했다.",
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
    id: "ncs-bearing-damage-identification",
    title: "베어링 손상 사진 판별",
    imagePaths: [
      "/practical/visuals/bearing-damage-frame-01.png",
      "/practical/visuals/bearing-damage-frame-02.png",
      "/practical/visuals/bearing-damage-frame-03.png",
      "/practical/visuals/bearing-damage-frame-04.png",
      "/practical/visuals/bearing-damage-frame-05.png",
      "/practical/visuals/bearing-damage-frame-06.png",
      "/practical/visuals/bearing-damage-frame-07.png",
      "/practical/visuals/bearing-damage-frame-08.png",
    ],
    frames: [
      {
        id: "ncs-bearing-damage-identification--flaking",
        path: "/practical/visuals/bearing-damage-frame-01.png",
        promptAltText: "베어링 궤도면 손상 부위를 확대해 보여 주는 사진",
        learningAltText: "궤도면 일부가 비늘처럼 떨어져 나간 플레이킹 손상",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "플레이킹: 반복 하중으로 궤도면이나 전동체 표면이 비늘 모양으로 박리되는 손상이다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/bearing-damage-frame-01.png"],
      },
      {
        id: "ncs-bearing-damage-identification--grooving",
        path: "/practical/visuals/bearing-damage-frame-02.png",
        promptAltText: "베어링 전동체 표면 손상을 확대해 보여 주는 사진",
        learningAltText: "전동체 표면에 길게 홈이 생긴 긁힘 손상",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "긁힘: 윤활 불량이나 이물질 침입 등으로 궤도면 또는 전동체에 길게 홈이 생긴 손상이다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/bearing-damage-frame-02.png"],
      },
      {
        id: "ncs-bearing-damage-identification--fracture",
        path: "/practical/visuals/bearing-damage-frame-03.png",
        promptAltText: "베어링 링 손상 부위를 보여 주는 사진",
        learningAltText: "베어링 링 일부가 갈라진 파손 손상",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "파손: 충격 하중, 과도한 끼워맞춤 또는 설치 불량 등으로 링이나 전동체가 갈라진 상태다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/bearing-damage-frame-03.png"],
      },
      {
        id: "ncs-bearing-damage-identification--dent",
        path: "/practical/visuals/bearing-damage-frame-04.png",
        promptAltText: "베어링 궤도면의 국부 손상을 확대해 보여 주는 사진",
        learningAltText: "궤도면에 국부적으로 눌린 자국이 생긴 손상",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "눌린 자국: 충격이나 금속 이물질의 침입으로 궤도면에 국부적인 압흔이 생긴 상태다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/bearing-damage-frame-04.png"],
      },
      {
        id: "ncs-bearing-damage-identification--false-brinelling-fretting",
        path:
          "/practical/visuals/bearing-damage-frame-05.png",
        promptAltText: "베어링 전동체 접촉면의 원형 손상을 보여 주는 사진",
        learningAltText: "미세 진동으로 전동체 접촉 위치에 생긴 폴스 브리넬링·프레팅 손상",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "폴스 브리넬링·프레팅: 정지 중 미세 진동과 반복 접촉으로 전동체 간격을 따라 마모 자국이 생긴다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH[
            "/practical/visuals/bearing-damage-frame-05.png"
          ],
      },
      {
        id: "ncs-bearing-damage-identification--welding",
        path: "/practical/visuals/bearing-damage-frame-06.png",
        promptAltText: "베어링 내부의 국부 변색·부착 부위를 표시한 사진",
        learningAltText: "미끄럼과 발열로 접촉면이 서로 달라붙은 용착 손상",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "용착: 윤활 부족과 과대한 미끄럼·발열로 접촉면 일부가 서로 달라붙는 손상이다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/bearing-damage-frame-06.png"],
      },
      {
        id: "ncs-bearing-damage-identification--electrical-erosion",
        path: "/practical/visuals/bearing-damage-frame-07.png",
        promptAltText: "베어링 전동체와 궤도면의 국부 손상을 보여 주는 사진",
        learningAltText: "전류 통과로 표면이 녹아 패인 전식 손상",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "전식: 베어링을 통과한 전류가 접촉부에서 방전되며 궤도면이나 전동체를 녹여 패이게 한다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH[
            "/practical/visuals/bearing-damage-frame-07.png"
          ],
      },
      {
        id: "ncs-bearing-damage-identification--corrosion",
        path: "/practical/visuals/bearing-damage-frame-08.png",
        promptAltText: "베어링 전체에 나타난 갈색 변색 부위를 보여 주는 사진",
        learningAltText: "수분과 부식성 물질로 표면이 변색된 녹·부식 손상",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "녹·부식: 수분이나 부식성 물질이 침입해 베어링 표면이 산화되고 갈색으로 변색된 상태다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/bearing-damage-frame-08.png"],
      },
    ],
    promptFrameIds: [
      "ncs-bearing-damage-identification--fracture",
      "ncs-bearing-damage-identification--false-brinelling-fretting",
      "ncs-bearing-damage-identification--corrosion",
      "ncs-bearing-damage-identification--flaking",
      "ncs-bearing-damage-identification--electrical-erosion",
      "ncs-bearing-damage-identification--dent",
      "ncs-bearing-damage-identification--welding",
      "ncs-bearing-damage-identification--grooving",
    ],
    promptLabels: ["가", "나", "다", "라", "마", "바", "사", "아"],
    altText:
      "플레이킹, 긁힘, 파손, 눌린 자국, 폴스 브리넬링·프레팅, 용착, 전식, 녹·부식의 베어링 손상 사진",
    caption:
      "손상명은 표면이 벗겨졌는지, 길게 긁혔는지, 국부 압흔인지, 전동체 간격을 따른 자국인지와 같은 결정적 형상으로 판별한다.",
    sourceLabel: "NCS 학습모듈 · 운반하역기계 구동장치 정비",
    ncsCode: "1505010108",
    pdfPage: 133,
    printedPage: 121,
    figureNumber: "표 3-3",
    sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
    examMatchStatus: "concept_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
    originType: "ncs_crop",
    usageTypes: ["variant_exam_prompt", "recognition", "concept_explanation"],
    answerCritical: true,
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-28T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "PDF pp.133~134의 손상 사진만 분리하고 손상명·원인·대책 문구는 문제 이미지에서 제외했다.",
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
    id: "ncs-rt-film-defect-identification",
    title: "방사선투과 필름 결함 판독",
    imagePaths: [
      "/practical/visuals/rt-film-frame-01.png",
      "/practical/visuals/rt-film-frame-02.png",
      "/practical/visuals/rt-film-frame-03.png",
      "/practical/visuals/rt-film-frame-04.png",
      "/practical/visuals/rt-film-frame-05.png",
      "/practical/visuals/rt-film-frame-06.png",
    ],
    frames: [
      {
        id: "ncs-rt-film-defect-identification--porosity",
        path: "/practical/visuals/rt-film-frame-01.png",
        promptAltText: "용접부 방사선투과 필름의 밝고 어두운 지시 모양",
        learningAltText: "용접선 주변에 둥근 지시가 분포한 기공 RT 필름",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "기공: 필름에서 둥근 점 모양의 지시가 단독 또는 군집으로 나타난다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/rt-film-frame-01.png"],
      },
      {
        id: "ncs-rt-film-defect-identification--slag-inclusion",
        path: "/practical/visuals/rt-film-frame-02.png",
        promptAltText: "용접부 방사선투과 필름에 점 형태 지시가 보이는 사진",
        learningAltText: "불규칙한 점·선 형태 지시가 나타난 슬래그 섞임 RT 필름",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "슬래그 섞임: 슬래그가 갇힌 형상에 따라 불규칙한 점 또는 길쭉한 지시로 나타난다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH[
            "/practical/visuals/rt-film-frame-02.png"
          ],
      },
      {
        id: "ncs-rt-film-defect-identification--crack",
        path: "/practical/visuals/rt-film-frame-03.png",
        promptAltText: "용접부 방사선투과 필름에 가는 선형 지시가 보이는 사진",
        learningAltText: "폭이 좁고 불규칙한 선형 지시가 나타난 균열 RT 필름",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "균열: 폭이 좁고 방향성이 뚜렷한 불규칙한 선형 지시로 판독한다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/rt-film-frame-03.png"],
      },
      {
        id: "ncs-rt-film-defect-identification--incomplete-penetration",
        path: "/practical/visuals/rt-film-frame-04.png",
        promptAltText: "용접부 방사선투과 필름 중앙이 끊겨 보이는 사진",
        learningAltText: "용접 중심선에 연속 또는 단속 선형 지시가 나타난 용입 부족 RT 필름",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "용입 부족: 루트부가 충분히 용입되지 않아 용접 중심선을 따라 선형 지시가 나타난다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH[
            "/practical/visuals/rt-film-frame-04.png"
          ],
      },
      {
        id: "ncs-rt-film-defect-identification--undercut",
        path: "/practical/visuals/rt-film-frame-05.png",
        promptAltText: "용접부 방사선투과 필름 가장자리에 선형 변화가 보이는 사진",
        learningAltText: "용접 비드 가장자리를 따라 선형 지시가 나타난 언더컷 RT 필름",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "언더컷: 용접 비드와 모재의 경계부를 따라 길게 이어지는 선형 지시로 나타난다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/rt-film-frame-05.png"],
      },
      {
        id: "ncs-rt-film-defect-identification--incomplete-fusion",
        path: "/practical/visuals/rt-film-frame-06.png",
        promptAltText: "용접부 방사선투과 필름에 국부적인 선형 지시가 보이는 사진",
        learningAltText: "모재와 용착금속 경계에 선형 지시가 나타난 융합 불량 RT 필름",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "융합 불량: 모재와 용착금속 또는 패스 사이가 융합되지 않아 경계를 따라 선형 지시가 나타난다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH[
            "/practical/visuals/rt-film-frame-06.png"
          ],
      },
    ],
    promptFrameIds: [
      "ncs-rt-film-defect-identification--crack",
      "ncs-rt-film-defect-identification--incomplete-fusion",
      "ncs-rt-film-defect-identification--porosity",
      "ncs-rt-film-defect-identification--undercut",
      "ncs-rt-film-defect-identification--slag-inclusion",
      "ncs-rt-film-defect-identification--incomplete-penetration",
    ],
    promptLabels: ["가", "나", "다", "라", "마", "바"],
    altText:
      "기공, 슬래그 섞임, 균열, 용입 부족, 언더컷, 융합 불량의 방사선투과 필름 지시",
    caption:
      "RT 필름은 지시의 모양, 방향, 위치와 연속성을 함께 보고 결함을 구분한다.",
    sourceLabel: "NCS 학습모듈 · 피복아크용접 결함부 보수용접 작업",
    ncsCode: "1601050108",
    pdfPage: 86,
    printedPage: 75,
    figureNumber: "그림 3-11",
    sourceFileHash: NCS_SOURCE_REGISTRY["1601050108"].hash,
    examMatchStatus: "concept_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
    originType: "ncs_crop",
    usageTypes: ["variant_exam_prompt", "recognition", "concept_explanation"],
    answerCritical: true,
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-28T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "PDF p.86의 RT 필름 영역만 분리하고 결함명·도식·출처 문구는 문제 이미지에서 제외했다.",
  },
  {
    id: "ncs-photoelectric-switch-example",
    title: "광전스위치 외형과 광학부",
    imagePaths: ["/practical/visuals/photoelectric-switch-example.png"],
    promptAltTexts: [
      "발광·수광용 광학창과 표시부, 케이블을 가진 사각형 광전스위치 실사",
    ],
    altText:
      "전면의 발광·수광용 광학창, 상부 표시·조정부와 케이블을 가진 NCS 광전스위치 예시 사진",
    caption:
      "광학창으로 빛을 송수신해 물체를 검출하는 광전스위치의 외형이다. 투과형·반사형의 세부 방식은 별도 회로·배치 조건으로 판단한다.",
    sourceLabel: "NCS 학습모듈 「센서 활용 기술」",
    ncsCode: "1503010204",
    pdfPage: 53,
    printedPage: 41,
    figureNumber: "그림 1-22",
    sourceFileHash: NCS_SOURCE_REGISTRY["1503010204"].hash,
    examMatchStatus: "concept_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
    originType: "ncs_crop",
    usageTypes: ["recognition", "concept_explanation"],
    answerCritical: false,
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-28T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "원문 그림 1-22의 제품 외형만 크롭했다. 외형 식별에는 사용하되, 이 사진만으로 투과형·회귀반사형·확산반사형을 판정하지 않도록 범위를 제한했다.",
  },
  {
    id: "ncs-proximity-sensor-installation-spacing",
    title: "근접센서 검출거리와 설치 간격",
    imagePaths: [
      "/practical/visuals/proximity-sensor-detection-setting-distance.png",
      "/practical/visuals/proximity-sensor-shielded-installation.png",
      "/practical/visuals/proximity-sensor-unshielded-installation.png",
      "/practical/visuals/proximity-sensor-parallel-spacing.png",
      "/practical/visuals/proximity-sensor-face-spacing.png",
    ],
    frames: [
      {
        id: "ncs-proximity-sensor-installation-spacing--distance",
        path: "/practical/visuals/proximity-sensor-detection-setting-distance.png",
        promptAltText:
          "근접센서의 검출거리·복귀거리와 정격 검출거리·설정거리의 차이를 보여 주는 그림",
        learningAltText:
          "검출물체가 접근하고 이탈할 때의 동작 위치와 안정 검출을 위한 설정거리 범위를 비교한 근접센서 도해",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "검출거리와 복귀거리는 동작·복귀 위치의 차이를, 설정거리는 정격 검출거리 안에서 안정적으로 사용하는 범위를 뜻한다.",
        outputAssetHash:
          "f7296fe417694e49ab48040a10db54681672932cd85a2fa1d89dff2b318fcafb",
      },
      {
        id: "ncs-proximity-sensor-installation-spacing--shielded",
        path: "/practical/visuals/proximity-sensor-shielded-installation.png",
        promptAltText:
          "감지면을 금속 설치면과 같은 높이에 배치한 매입형 근접센서 설치 그림",
        learningAltText:
          "매입형 근접센서를 금속 외장과 동일면에 설치하고 비감지 금속과 감지면 사이에 3d 이상의 거리를 둔 NCS 예시",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "매입형은 감지면을 금속 설치면과 같은 높이에 둘 수 있으며, 그림의 비감지 금속 이격조건을 함께 확인한다.",
        outputAssetHash:
          "0ccb98fadcd2f9bc25ae49308548f08ee47f1781552b68d047439c327ee12baa",
      },
      {
        id: "ncs-proximity-sensor-installation-spacing--unshielded",
        path: "/practical/visuals/proximity-sensor-unshielded-installation.png",
        promptAltText:
          "감지면을 금속 설치면보다 돌출해 배치한 돌출형 근접센서 설치 그림",
        learningAltText:
          "돌출형 근접센서의 감지면 주변을 금속면에서 띄우고 d와 3d 치수로 이격조건을 표시한 NCS 예시",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "돌출형은 감지면이 금속 설치면보다 돌출되도록 설치하며, 주변 금속과의 이격 치수를 확보한다.",
        outputAssetHash:
          "a49b67d93763fefbfaa234ade891f8431929dcd2623003a5f61ff9de0d4bb371",
      },
      {
        id: "ncs-proximity-sensor-installation-spacing--parallel",
        path: "/practical/visuals/proximity-sensor-parallel-spacing.png",
        promptAltText:
          "여러 근접센서를 나란히 설치할 때 센서 사이를 3d에서 4d만큼 띄운 그림",
        learningAltText:
          "근접센서 상호 간섭을 줄이기 위해 병렬 설치 간격을 센서 지름 d의 배수로 표시한 NCS 예시",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "센서를 병렬로 설치할 때는 상호 간섭을 피하도록 그림에 제시된 센서 간 이격거리를 확보한다.",
        outputAssetHash:
          "89c5a0aa0a108e9c3be02dbac7232ad44c9247b8269c9e2c69439da04ef8b388",
      },
      {
        id: "ncs-proximity-sensor-installation-spacing--face-to-face",
        path: "/practical/visuals/proximity-sensor-face-spacing.png",
        promptAltText:
          "두 근접센서의 감지면이 마주 볼 때 Sn의 6배만큼 띄운 그림",
        learningAltText:
          "근접센서 두 개를 감지면끼리 마주 보게 설치할 때 정격 검출거리 Sn의 6배를 이격한 NCS 예시",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "감지면을 서로 마주 보게 설치하면 상호 간섭을 줄이기 위해 그림의 Sn×6 이격조건을 확인한다.",
        outputAssetHash:
          "5d7952cb8d70a85497da021399283f249c1bad0edf43ca4d525fea54ca86e272",
      },
    ],
    promptAltTexts: [
      "근접센서 검출거리와 설정거리",
      "매입형 근접센서 설치",
      "돌출형 근접센서 설치",
      "근접센서 병렬 설치 간격",
      "근접센서 감지면 대향 설치 간격",
    ],
    altText:
      "근접센서의 검출거리·설정거리와 매입형·돌출형 설치, 병렬·대향 배치의 이격조건을 비교한 다섯 개 NCS 도해",
    caption:
      "검출거리 용어를 구분한 뒤 센서 형식과 배치 방향에 따라 금속면 및 다른 센서와의 이격조건을 판독한다.",
    sourceLabel: "NCS 학습모듈 · 센서 활용 기술",
    ncsCode: "1503010204",
    pdfPage: 68,
    printedPage: 56,
    figureNumber: "그림 2-9~2-13",
    sourceFileHash: NCS_SOURCE_REGISTRY["1503010204"].hash,
    examMatchStatus: "concept_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
    originType: "ncs_crop",
    usageTypes: ["recognition", "concept_explanation", "summary_diagram"],
    answerCritical: false,
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-28T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "각 도해의 센서 본체, 치수선, 기호와 그림 번호가 잘리지 않도록 개별 크롭하고, 순서형이 아닌 설치조건 비교자료로 등록했다.",
  },
  {
    id: "ncs-drive-unit-exploded-assembly-order",
    title: "구동장치 부품 배치와 조립 관계",
    imagePaths: ["/practical/visuals/drive-unit-exploded-order.png"],
    promptAltTexts: [
      "축, 베어링, 기어, 키, 오일실, 하우징의 조립 관계를 보여 주는 구동장치 분해도",
    ],
    altText:
      "축, 베어링, 기어, 키, 오일실과 하우징의 결합 위치를 한눈에 보여 주는 구동장치 조립 순서도",
    caption:
      "축에 베어링과 키·기어를 조립한 뒤 하우징에 설치하고, 오일실과 커버를 결합하는 전체 부품 관계를 확인한다.",
    sourceLabel: "NCS 학습모듈 · 기계구동장치 조립",
    ncsCode: "1503010120",
    pdfPage: 25,
    printedPage: 13,
    figureNumber: "그림 1-8",
    sourceFileHash: NCS_SOURCE_REGISTRY["1503010120"].hash,
    examMatchStatus: "concept_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
    originType: "ncs_crop",
    usageTypes: ["recognition", "concept_explanation", "summary_diagram"],
    answerCritical: false,
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-28T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "PDF 그림 전체에서 부품과 조립선, 단면 관계가 잘리지 않았고 출처·그림 번호가 함께 보이도록 검수했다.",
  },
  {
    id: "ncs-height-gauge-up-down-measurement",
    title: "하이트 게이지 하향·상향 측정 비교",
    imagePaths: [
      "/practical/visuals/height-gauge-up-down-measurement.png",
    ],
    promptAltTexts: [
      "하이트 게이지로 단차를 하향 측정하는 자세와 게이지 블록을 이용해 상향 측정하는 자세의 비교",
    ],
    altText:
      "하이트 게이지의 스크라이버 접촉 방향에 따른 하향 측정과 게이지 블록을 이용한 상향 측정을 비교한 NCS 그림",
    caption:
      "하향 측정은 기준면에서 아래쪽 측정면에 접촉하고, 상향 측정은 게이지 블록으로 기준을 만든 뒤 위쪽 측정면에 접촉한다.",
    sourceLabel: "NCS 학습모듈 · 기본측정기 사용",
    ncsCode: "1502010504",
    pdfPage: 86,
    printedPage: 74,
    figureNumber: "그림 3-48",
    sourceFileHash: NCS_SOURCE_REGISTRY["1502010504"].hash,
    examMatchStatus: "concept_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
    originType: "ncs_crop",
    usageTypes: ["recognition", "concept_explanation", "summary_diagram"],
    answerCritical: false,
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-28T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "하향·상향 측정의 공작물, 접촉자, 게이지 블록과 장비 본체가 모두 보이도록 잘림을 제거해 검수했다.",
  },
  {
    id: "ncs-cylindricity-measurement-methods",
    title: "원통도 측정 두 방법",
    imagePaths: [
      "/practical/visuals/cylindricity-vblock-dial.png",
      "/practical/visuals/cylindricity-micrometer-directions.png",
    ],
    frames: [
      {
        id: "ncs-cylindricity-measurement-methods--vblock-dial",
        path: "/practical/visuals/cylindricity-vblock-dial.png",
        promptAltText:
          "V블록 위 원통을 회전시키며 다이얼 테스트 인디케이터로 여러 위치를 측정하는 장면",
        learningAltText:
          "V블록과 다이얼 테스트 인디케이터로 원통의 축방향 위치별 최대·최소값을 측정하는 방법",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "V블록 위 원통을 회전시키고 측정자를 축방향으로 옮겨 위치별 최대·최소값을 기록한다.",
        outputAssetHash:
          "11fedcfe9f7bd71cd2123bf607a3fbcdad1f7794332a7b96fc2c54a9d5bef6ae",
      },
      {
        id: "ncs-cylindricity-measurement-methods--micrometer",
        path: "/practical/visuals/cylindricity-micrometer-directions.png",
        promptAltText:
          "원통을 V블록에 올리고 외측 마이크로미터로 서로 직각인 방향을 측정하는 장면",
        learningAltText:
          "외측 마이크로미터로 원통의 여러 축방향 위치와 서로 직각인 방향을 반복 측정하는 방법",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "외측 마이크로미터를 여러 축방향 위치에 대고 서로 직각인 방향으로 측정해 최대·최소값을 비교한다.",
        outputAssetHash:
          "344c48908777049f085aac8801378fefb50b6c5f04c418e5a58620d1eac6bd70",
      },
    ],
    promptAltTexts: [
      "V블록과 다이얼 테스트 인디케이터를 이용한 원통도 측정",
      "외측 마이크로미터를 이용한 원통도 측정",
    ],
    altText:
      "V블록과 다이얼 테스트 인디케이터 방법, 외측 마이크로미터 방법으로 원통도를 측정하는 두 장면",
    caption:
      "한 단면만 보지 않고 여러 축방향 위치와 원주 방향에서 최대·최소값을 반복 측정해 원통도 경향을 판정한다.",
    sourceLabel: "NCS 학습모듈 · 기본측정기 사용",
    ncsCode: "1502010504",
    pdfPage: 89,
    printedPage: 77,
    figureNumber: "그림 3-51~3-52",
    sourceFileHash: NCS_SOURCE_REGISTRY["1502010504"].hash,
    examMatchStatus: "concept_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
    originType: "ncs_crop",
    usageTypes: ["recognition", "concept_explanation", "summary_diagram"],
    answerCritical: false,
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-28T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "두 그림은 순서가 아니라 원통도 측정의 대체 방법 비교 자료로 등록하고, 측정자·V블록·측정 방향이 식별되는지 검수했다.",
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
  {
    id: "diagram-bearing-induction-heating-sequence",
    title: "베어링 유도가열 조립 3단계",
    imagePaths: [
      "/practical/diagrams/bearing-induction-check.svg",
      "/practical/diagrams/bearing-induction-heat.svg",
      "/practical/diagrams/bearing-induction-fit.svg",
    ],
    frames: [
      {
        id: "diagram-bearing-induction-heating-sequence--check",
        path: "/practical/diagrams/bearing-induction-check.svg",
        promptAltText: "베어링 유도가열 조립 작업 장면",
        learningAltText:
          "베어링과 축의 치수, 끼워맞춤 대상, 가열기 상태를 확인하는 장면",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "베어링·축 치수와 가열 가능 여부, 가열기 상태를 먼저 확인한다.",
        outputAssetHash:
          "d8090c36a76ac7230b8f8a3419f21e5014cf1d2264a5765d368cc9910a3066a3",
      },
      {
        id: "diagram-bearing-induction-heating-sequence--heat",
        path: "/practical/diagrams/bearing-induction-heat.svg",
        promptAltText: "베어링 유도가열 조립 작업 장면",
        learningAltText:
          "유도가열기 요크에 베어링을 걸고 내륜 온도센서를 접촉해 목표온도로 균일 가열하는 장면",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "요크와 온도센서를 설치하고 지정 목표온도까지 균일 가열한 뒤 탈자한다.",
        outputAssetHash:
          "908dccc1247cfe0f77c59dcd88d6b20a3e930981d0350ee99e9bec2293ca4ada",
      },
      {
        id: "diagram-bearing-induction-heating-sequence--fit",
        path: "/practical/diagrams/bearing-induction-fit.svg",
        promptAltText: "베어링 유도가열 조립 작업 장면",
        learningAltText:
          "내열장갑을 착용하고 가열된 베어링을 축에 직각으로 신속히 삽입해 어깨부에 밀착하는 장면",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "내열장갑을 착용하고 베어링을 축 어깨까지 신속히 밀착한 뒤 냉각·고정 상태를 확인한다.",
        outputAssetHash:
          "4759249b6076c10391fafc11b08f0095d3a1b62b2e5d687a7f112783d6447c5f",
      },
    ],
    promptFrameIds: [
      "diagram-bearing-induction-heating-sequence--fit",
      "diagram-bearing-induction-heating-sequence--check",
      "diagram-bearing-induction-heating-sequence--heat",
    ],
    promptLabels: ["가", "나", "다"],
    promptAltTexts: [
      "베어링 유도가열 조립 작업 장면",
      "베어링 유도가열 조립 작업 장면",
      "베어링 유도가열 조립 작업 장면",
    ],
    altText:
      "베어링과 축 확인, 유도가열기 센서 설치와 가열, 내열장갑을 착용한 신속 장착을 차례로 보여 주는 자체 제작 도식",
    caption:
      "치수·상태 확인 후 온도센서를 설치해 균일 가열·탈자하고, 보호구를 착용해 축 어깨까지 신속히 밀착한다.",
    sourceLabel:
      "NCS 학습모듈 「운반하역기계 구동장치 정비」의 열간 조립 원리와 검증된 유도가열 답안 절차 기반 자체 제작",
    ncsCode: "1505010108",
    pdfPage: 122,
    printedPage: 110,
    figureNumber: "그림 3-33~3-34 원리 기반 자체 제작",
    sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
    examMatchStatus: "self_authored",
    rightsStatus: "self_authored",
    publicUseStatus: "public",
    originType: "self_authored",
    usageTypes: [
      "sequence_step",
      "concept_explanation",
      "variant_exam_prompt",
    ],
    answerCritical: true,
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-28T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "실제 시험 원본 사진이 아닌 절차 도식이다. 치수 확인, 센서 접촉·균일 가열·탈자, 보호구 착용과 신속 밀착의 선후관계를 기술 검수했다.",
  },
  {
    id: "ncs-brake-condition-examples",
    title: "브레이크 디스크·드럼·오일 상태 사진 6종",
    imagePaths: [
      "/practical/visuals/brake-condition-frame-01.png",
      "/practical/visuals/brake-condition-frame-02.png",
      "/practical/visuals/brake-condition-frame-03.png",
      "/practical/visuals/brake-condition-frame-04.png",
      "/practical/visuals/brake-condition-frame-05.png",
      "/practical/visuals/brake-condition-frame-06.png",
    ],
    frames: [
      {
        id: "ncs-brake-condition-examples--frame-01",
        path: "/practical/visuals/brake-condition-frame-01.png",
        promptAltText:
          "브레이크 마찰면의 상태가 보이는 NCS 점검 사진",
        learningAltText:
          "과열 흔적과 균열이 보이는 브레이크 디스크 마찰면",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "디스크 마찰면의 균열과 열변색·표면 손상 여부를 함께 확인한다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/brake-condition-frame-01.png"],
      },
      {
        id: "ncs-brake-condition-examples--frame-02",
        path: "/practical/visuals/brake-condition-frame-02.png",
        promptAltText:
          "브레이크 마찰면의 상태가 보이는 NCS 점검 사진",
        learningAltText:
          "과열과 마모 흔적이 보이는 브레이크 디스크 마찰면",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "디스크 마찰면의 마모 홈과 열변색·편마모 여부를 함께 확인한다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/brake-condition-frame-02.png"],
      },
      {
        id: "ncs-brake-condition-examples--frame-03",
        path: "/practical/visuals/brake-condition-frame-03.png",
        promptAltText:
          "브레이크 마찰면의 상태가 보이는 NCS 점검 사진",
        learningAltText:
          "과열 흔적과 균열이 보이는 브레이크 드럼 마찰면",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "드럼 마찰면의 균열과 열변색·표면 손상 여부를 함께 확인한다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/brake-condition-frame-03.png"],
      },
      {
        id: "ncs-brake-condition-examples--frame-04",
        path: "/practical/visuals/brake-condition-frame-04.png",
        promptAltText:
          "브레이크 마찰재의 상태가 보이는 NCS 점검 사진",
        learningAltText:
          "균열과 마모 흔적이 보이는 드럼 브레이크 라이닝",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "라이닝의 균열·마모·오염과 리벳 또는 고정부 주변의 손상 여부를 확인한다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/brake-condition-frame-04.png"],
      },
      {
        id: "ncs-brake-condition-examples--frame-05",
        path: "/practical/visuals/brake-condition-frame-05.png",
        promptAltText:
          "브레이크 작동유의 상태가 보이는 NCS 점검 사진",
        learningAltText:
          "투명하고 밝은 색을 띠는 신품 브레이크 작동유",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "신품 작동유의 색과 투명도를 기준 사진으로 삼아 사용 중인 오일의 변색·오염을 비교한다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/brake-condition-frame-05.png"],
      },
      {
        id: "ncs-brake-condition-examples--frame-06",
        path: "/practical/visuals/brake-condition-frame-06.png",
        promptAltText:
          "브레이크 작동유의 상태가 보이는 NCS 점검 사진",
        learningAltText:
          "수분과 오염으로 어둡게 변색된 브레이크 작동유",
        captionBeforeAnswer: null,
        captionAfterAnswer:
          "작동유가 탁하거나 짙게 변색되면 수분·이물 혼입 가능성을 점검하고 제조사 기준에 따라 조치한다.",
        outputAssetHash:
          OUTPUT_HASH_BY_PATH["/practical/visuals/brake-condition-frame-06.png"],
      },
    ],
    altText:
      "브레이크 디스크와 드럼의 균열·마모, 라이닝 손상, 신품과 오염 작동유를 비교하는 NCS 점검 사진",
    caption:
      "사진의 상태를 비교해 균열·마모·오염 징후를 찾되, 교체 여부와 수치 기준은 장비 제조사 정비기준을 따른다.",
    sourceLabel: "NCS 학습모듈 「운반하역기계 구동장치 정비」",
    ncsCode: "1505010108",
    pdfPage: 153,
    printedPage: 141,
    figureNumber: "그림 4-19~4-21",
    sourceFileHash: NCS_SOURCE_REGISTRY["1505010108"].hash,
    examMatchStatus: "concept_source",
    rightsStatus: "education_use_with_attribution",
    publicUseStatus: "public",
    originType: "ncs_crop",
    usageTypes: ["concept_explanation"],
    answerCritical: false,
    technicalReviewStatus: "verified",
    technicalReviewedAt: "2026-07-28T00:00:00.000Z",
    technicalReviewer: "source-visual-audit",
    visualReviewNote:
      "교재의 상태명 라벨과 출처 문구를 크롭에서 제외했다. 시험문항·작업순서가 아닌 상태 비교 학습자료로만 사용하며, 교재의 예시를 보편적 교체 기준으로 단정하지 않는다.",
  },
  ...PRACTICAL_TASK_VISUAL_AIDS,
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
      publicUseStatus: "public",
    }),
  ),
] satisfies PracticalVisualAidInput[]).map(enrichVisualAid);

export const PRACTICAL_VISUAL_AID_BY_QUESTION: Record<string, string> = {
  "P-2025-1-Q04": "ncs-bearing-four-types",
  "EXP-B01": "ncs-bearing-four-types",
  "EXP-VIS-BEARING-DAMAGE-01": "ncs-bearing-damage-identification",
  "EXP-VIS-RT-FILM-01": "ncs-rt-film-defect-identification",
};

export const PRACTICAL_VISUAL_AIDS_BY_CONCEPT: Record<string, string[]> = {
  "PCON-003": ["diagram-sensor-directions"],
  "PCON-004": [
    "ncs-bearing-types",
    "diagram-bearing-components",
    "diagram-spherical-roller-bearing",
    "diagram-bearing-four-exam",
  ],
  "PCON-006": ["diagram-bearing-induction-heating-sequence"],
  "PCON-013": ["diagram-maintenance-tools", "diagram-maintenance-tools-five"],
  "PCON-014": ["diagram-vernier-48-2", "diagram-vernier-37-35"],
  "PCON-018": ["diagram-gear-damage"],
  "PCON-021": ["diagram-thread-profiles"],
  "PCON-022": [
    "diagram-shaft-misalignment",
    "diagram-shaft-misalignment-three",
  ],
  "PCON-023": ["diagram-gear-tooth-curves"],
  "PCON-024": ["diagram-dial-vblock"],
  "PCON-025": ["diagram-double-acting-cylinder"],
  "PCON-031": [
    "diagram-measurement-instruments",
    "diagram-measurement-tools",
  ],
  "PCON-032": ["diagram-pascal-force"],
  "PCON-035": ["diagram-journal-clearance"],
  "PCON-036": ["diagram-tapered-endplay"],
  "PCON-037": ["diagram-micrometer-12-73"],
  "PCON-SUP-012": ["ncs-photoelectric-switch-example"],
  "PCON-SUP-030": ["ncs-brake-condition-examples"],
  "PCON-SUP-035": ["ncs-bearing-damage-identification"],
  "PCON-044": ["ncs-rt-film-defect-identification"],
  "PCON-045": ["ncs-rt-film-defect-identification"],
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
