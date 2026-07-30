import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ExternalLink,
  MapPinned,
} from "lucide-react";
import {
  getPracticalCenterEvidenceKind,
  getPracticalCenterEvidenceLabel,
  PRACTICAL_2025_HISTORY_SOURCE,
  PRACTICAL_TEST_CENTER_SOURCE,
  practicalTestCentersById,
} from "@/data/source/practical-test-centers";
import {
  practicalTestCenterMediaByCenter,
  type PracticalTestCenterMediaCategory,
} from "@/data/source/practical-test-center-media";
import {
  practicalEquipmentModelsById,
  type PracticalEquipmentModel,
} from "@/data/source/practical-equipment-models";

const CURRENT_TYPE_LABELS = {
  ac: "교류(AC)",
  dc: "직류(DC)",
  ac_dc: "교류·직류(AC/DC)",
  unknown: "미확인",
} as const;

const VERIFICATION_LABELS = {
  confirmed: "확정",
  probable: "유력",
  unknown: "미확인",
} as const;

const MEDIA_CATEGORY_LABELS: Record<
  PracticalTestCenterMediaCategory,
  string
> = {
  electrical_control: "전기제어",
  pneumatic: "공압",
  hydraulic: "유압",
  welding: "용접",
};

function getEquipmentSourceLabel(
  status: PracticalEquipmentModel["currentSourceStatus"],
) {
  if (status === "manufacturer_verified") return "제조사 자료 확인";
  if (status === "technical_reference_verified") return "기술자료·재조사 확인";
  if (status === "needs_manual_check") return "명판 확인 필요";
  return "공식 시설표 기재";
}

export default async function PracticalTestCenterPage({
  params,
}: {
  params: Promise<{ centerId: string }>;
}) {
  const { centerId } = await params;
  const center = practicalTestCentersById.get(centerId);
  if (!center) notFound();
  const evidenceKind = getPracticalCenterEvidenceKind(center);
  const evidenceLabel = getPracticalCenterEvidenceLabel(center);
  const mediaGroup = practicalTestCenterMediaByCenter.get(center.id);
  const models = center.equipmentModelIds
    .map((id) => practicalEquipmentModelsById.get(id))
    .filter((model): model is NonNullable<typeof model> => Boolean(model));

  return (
    <div className="page-wrap max-w-5xl py-12">
      <Link
        href="/practical/info?tab=centers"
        className="inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-extrabold text-[#16697a]"
      >
        시험장 목록
      </Link>
      <header className="mt-6 rounded-3xl bg-[#173957] p-6 text-white md:p-8">
        <div className="flex flex-wrap gap-2 text-xs font-extrabold">
          <span className="rounded-full bg-white/15 px-3 py-1">{center.region}</span>
          <span className="rounded-full bg-teal-300/20 px-3 py-1 text-teal-100">
            {evidenceLabel}
          </span>
          {center.parkingNote ? (
            <span className="rounded-full bg-amber-300/20 px-3 py-1 text-amber-100">
              {center.parkingNote}
            </span>
          ) : null}
        </div>
        <h1 className="mt-4 text-3xl font-extrabold [text-wrap:balance] [word-break:keep-all] md:text-4xl">
          {center.name}
        </h1>
        {evidenceKind === "facility_sheet_2026" ? (
          <p className="mt-4 text-sm leading-7 text-slate-200">
            공식 시설현황 번호 {center.officialNumber} · 원본 시트 행{" "}
            {center.facilitySheetRow}
          </p>
        ) : (
          <p className="mt-4 text-sm leading-7 text-slate-200">
            {evidenceKind === "exam_history_2025"
              ? "2025 작업형 시험 이력에서 확인"
              : "과거 또는 사용자 제보 후보 · 시행 회차 추가 확인 필요"}
            {center.buildingNote ? ` · ${center.buildingNote}` : ""}
          </p>
        )}
      </header>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <MapPinned size={19} className="text-[#16697a]" />
          <h2 className="text-xl font-extrabold">
            {evidenceKind === "facility_sheet_2026"
              ? "시설표 원문 기재"
              : "시험장 이력과 확인 상태"}
          </h2>
        </div>
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-bold leading-7">
          {center.rawFacilityNote}
        </p>
        {center.suppliedMaterialNote ? (
          <p className="mt-3 text-sm text-slate-700">
            지급·준비 관련 원문: {center.suppliedMaterialNote}
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            이 항목은 시설현황 파일에 별도 기재가 없습니다. 미기재를
            ‘제공하지 않음’으로 해석하지 않습니다.
          </p>
        )}
        {center.evidenceNote ? (
          <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            {center.evidenceNote}
          </p>
        ) : null}
        {center.candidateSupplyGuidance ? (
          <div
            data-testid={`center-supply-guidance-${center.id}`}
            className={`mt-4 rounded-xl p-4 ${
              center.candidateSupplyGuidance.personalBringGuidance ===
              "welding_ppe_and_tools_required"
                ? "border-2 border-[#c2410c] bg-[#fff1e7] shadow-[0_0_0_3px_rgba(194,65,12,0.12)]"
                : "border border-teal-200 bg-teal-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={21}
                className={
                  center.candidateSupplyGuidance.personalBringGuidance ===
                  "welding_ppe_and_tools_required"
                    ? "mt-0.5 shrink-0 text-[#c2410c]"
                    : "mt-0.5 shrink-0 text-teal-700"
                }
                aria-hidden="true"
              />
              <div>
                <p
                  className={`text-xs font-black ${
                    center.candidateSupplyGuidance.personalBringGuidance ===
                    "welding_ppe_and_tools_required"
                      ? "text-[#9a3412]"
                      : "text-teal-800"
                  }`}
                >
                  {center.candidateSupplyGuidance.personalBringGuidance ===
                  "welding_ppe_and_tools_required"
                    ? "필수 지참 · 시험장 미제공 제보"
                    : "사용자 제보 준비물 안내"}{" "}
                  · 접수 {center.candidateSupplyGuidance.reportedAt}
                </p>
                <p
                  className={`mt-2 text-sm font-extrabold leading-7 ${
                    center.candidateSupplyGuidance.personalBringGuidance ===
                    "welding_ppe_and_tools_required"
                      ? "text-[#7c2d12]"
                      : "text-teal-950"
                  }`}
                >
                  {center.candidateSupplyGuidance.summary}
                </p>
              </div>
            </div>
            {center.candidateSupplyGuidance.requiredPersonalItems?.length ? (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {center.candidateSupplyGuidance.requiredPersonalItems.map(
                  (item) => (
                    <li
                      key={item}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-[#7c2d12]"
                    >
                      반드시 지참 · {item}
                    </li>
                  ),
                )}
              </ul>
            ) : null}
            <p
              className={`mt-3 text-xs leading-5 ${
                center.candidateSupplyGuidance.personalBringGuidance ===
                "welding_ppe_and_tools_required"
                  ? "text-[#9a3412]"
                  : "text-teal-800"
              }`}
            >
              회차와 현장 운영에 따라 달라질 수 있으므로 수험자 안내와 시험장
              지시를 최종 기준으로 확인하세요.
            </p>
            {center.candidateSupplyGuidance.sourceUrl ? (
              <a
                href={center.candidateSupplyGuidance.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#9a3412] underline"
              >
                사용자 제공 현장 제보 원문
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        ) : null}
        {center.candidateFieldReport ? (
          <section
            aria-labelledby={`candidate-field-report-${center.id}`}
            className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5"
          >
            <p className="text-xs font-black text-[#16697a]">
              {center.candidateFieldReport.reporterLabel ??
                "사용자 현장 제보"}{" "}
              · {center.candidateFieldReport.reportedAt}
            </p>
            <h3
              id={`candidate-field-report-${center.id}`}
              className="mt-1 text-lg font-extrabold text-slate-900"
            >
              장비 상태와 당일 운영 참고
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {center.candidateFieldReport.summary}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {center.candidateFieldReport.sections.map((section) => (
                <article
                  key={section.category}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <p className="text-xs font-black text-[#16697a]">
                    {MEDIA_CATEGORY_LABELS[section.category]}
                  </p>
                  <h4 className="mt-1 font-extrabold text-slate-900">
                    {section.title}
                  </h4>
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                    {section.notes.map((note) => (
                      <li key={note} className="flex gap-2">
                        <CheckCircle2
                          size={15}
                          className="mt-1.5 shrink-0 text-[#16697a]"
                          aria-hidden="true"
                        />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                  {section.caution ? (
                    <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-900">
                      {section.caution}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}
        {center.evidenceSourceUrl ? (
          <a
            href={center.evidenceSourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-sm font-extrabold text-[#16697a] underline"
          >
            시험 이력 근거 확인
          </a>
        ) : null}
      </section>

      {mediaGroup ? (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Camera size={20} className="text-[#16697a]" />
                <h2 className="text-2xl font-extrabold">현장 사진</h2>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                {mediaGroup.summary}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-extrabold">
              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-800">
                {mediaGroup.sourceLabel}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                수신 {mediaGroup.receivedAt}
              </span>
            </div>
          </div>

          <div className="mt-6 grid items-start gap-5 md:grid-cols-2">
            {mediaGroup.items.map((item, itemIndex) => (
              <article
                key={item.id}
                className={`self-start overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 ${
                  mediaGroup.items.length === 1
                    ? "mx-auto w-full max-w-3xl md:col-span-2"
                    : ""
                }`}
              >
                <a
                  href={item.fullSrc ?? item.src}
                  target="_blank"
                  rel="noreferrer"
                  className="group block bg-slate-100 p-2"
                  aria-label={`${item.caption} 크게 보기`}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    sizes={
                      mediaGroup.items.length === 1
                        ? "(max-width: 768px) 100vw, 768px"
                        : "(max-width: 768px) 100vw, 480px"
                    }
                    loading={itemIndex === 0 ? "eager" : "lazy"}
                    className="h-auto w-full rounded-xl object-contain"
                  />
                </a>
                <div className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-[#16697a]">
                      {MEDIA_CATEGORY_LABELS[item.category]}
                    </span>
                    <a
                      href={item.fullSrc ?? item.src}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-600 underline"
                    >
                      전체 사진 크게 보기
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  </div>
                  <h3 className="mt-3 text-base font-extrabold text-slate-900">
                    {item.caption}
                  </h3>
                  {item.evidenceNote ? (
                    <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-900">
                      {item.evidenceNote}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
            촬영·수신 시점의 현장 사진이며 현재 장비와 배치는 달라질 수
            있습니다. 공식 시설표와 사진의 표기가 다르면 어느 한쪽으로
            덮어쓰지 않고 각각의 근거를 함께 표시합니다.
            {mediaGroup.sourceUrl ? (
              <a
                href={mediaGroup.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 inline-flex items-center gap-1 font-extrabold text-[#16697a] underline"
              >
                관련 시설안내 원문
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-2xl font-extrabold">확인된 장비 모델</h2>
        {models.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {models.map((model) => (
              <article key={model.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="text-xs font-extrabold text-[#16697a]">
                  {getEquipmentSourceLabel(model.currentSourceStatus)}
                </span>
                <h3 className="mt-2 text-lg font-extrabold">{model.label}</h3>
                {model.welding ? (
                  <div className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-4 text-sm">
                    <p>
                      <span className="font-extrabold text-slate-900">출력 방식</span>{" "}
                      <span className="text-slate-700">
                        {model.welding.outputCurrentType === "unknown" &&
                        model.welding.outputVerification === "unknown"
                          ? "모델·출력 미확인"
                          : `${CURRENT_TYPE_LABELS[model.welding.outputCurrentType]} · ${
                              VERIFICATION_LABELS[
                                model.welding.outputVerification
                              ]
                            }`}
                      </span>
                    </p>
                    {model.welding.normalizedModelName &&
                    model.welding.normalizedModelName !==
                      model.welding.rawModelName ? (
                      <p>
                        <span className="font-extrabold text-slate-900">
                          정규화 모델
                        </span>{" "}
                        <span className="text-slate-700">
                          {model.welding.normalizedModelName}
                        </span>
                      </p>
                    ) : null}
                    <p className="leading-6 text-slate-600">
                      {model.welding.verificationBasis}
                    </p>
                  </div>
                ) : null}
                <p className="mt-2 text-sm leading-6 text-slate-600">{model.learnerNote}</p>
                {model.welding?.remainingCheck ? (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-900">
                    남은 확인: {model.welding.remainingCheck}
                  </p>
                ) : null}
                {model.sourceUrl ? (
                  <a href={model.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-extrabold text-[#16697a] underline">
                    장비 정보 확인
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            시설표 문자열은 보존했지만 제조사·모델을 안전하게 정규화하지
            않았습니다. 현장 명판을 기준으로 확인하세요.
          </p>
        )}
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <h2 className="text-xl font-extrabold text-teal-950">입실 후 확인 순서</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            {[
              "명판·전원·극성·정격을 확인합니다.",
              "비상정지·전원차단·잔압 배출 위치를 찾습니다.",
              "포트번호·단자표시·초기상태를 과제지와 대조합니다.",
              "낮은 설정에서 시작해 한 조건씩 조정하고 기록합니다.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 size={16} className="mt-1 shrink-0 text-teal-700" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <AlertTriangle size={20} className="text-amber-700" />
          <h2 className="mt-3 text-xl font-extrabold text-amber-950">자료 한계</h2>
          <p className="mt-3 text-sm leading-7 text-amber-900">
            이 페이지는{" "}
            {evidenceKind === "facility_sheet_2026"
              ? `${PRACTICAL_TEST_CENTER_SOURCE.publishedLabel} 시설현황`
              : evidenceKind === "exam_history_2025"
                ? PRACTICAL_2025_HISTORY_SOURCE.title
                : "과거·사용자 제보 후보 정보"}
            를 반영합니다. 실제 배정 시험장, 장비 교체, 준비물과 사용 가능
            공구는 해당 회차 수험자 안내와 현장 감독 지시가 최종 기준입니다.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-6">
        <h2 className="text-xl font-extrabold text-teal-950">
          용접기 모델 제보 필요
        </h2>
        <p className="mt-3 text-sm leading-7 text-teal-900">
          수험표의 시험장명과 장비 전면·명판 사진을 보내 주세요. 모델명 전체,
          AC·DC 출력 표기와 공정 선택부가 보이면 장비 정보를 더 정확하게
          갱신할 수 있습니다.
        </p>
      </section>
    </div>
  );
}
