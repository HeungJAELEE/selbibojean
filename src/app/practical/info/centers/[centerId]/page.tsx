import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, MapPinned } from "lucide-react";
import {
  PRACTICAL_TEST_CENTER_SOURCE,
  practicalTestCentersById,
} from "@/data/source/practical-test-centers";
import { practicalEquipmentModelsById } from "@/data/source/practical-equipment-models";

export default async function PracticalTestCenterPage({
  params,
}: {
  params: Promise<{ centerId: string }>;
}) {
  const { centerId } = await params;
  const center = practicalTestCentersById.get(centerId);
  if (!center) notFound();
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
          {center.parkingNote ? (
            <span className="rounded-full bg-amber-300/20 px-3 py-1 text-amber-100">
              {center.parkingNote}
            </span>
          ) : null}
        </div>
        <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">{center.name}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-200">
          공식 시설현황 번호 {center.officialNumber} · 원본 시트 행{" "}
          {center.facilitySheetRow}
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <MapPinned size={19} className="text-[#16697a]" />
          <h2 className="text-xl font-extrabold">시설표 원문 기재</h2>
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
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-extrabold">확인된 장비 모델</h2>
        {models.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {models.map((model) => (
              <article key={model.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="text-xs font-extrabold text-[#16697a]">
                  {model.currentSourceStatus === "manufacturer_verified"
                    ? "제조사 페이지 확인"
                    : "공식 시설표 기재"}
                </span>
                <h3 className="mt-2 text-lg font-extrabold">{model.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{model.learnerNote}</p>
                {model.sourceUrl ? (
                  <a href={model.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-extrabold text-[#16697a] underline">
                    제조사 정보 확인
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
            이 페이지는 {PRACTICAL_TEST_CENTER_SOURCE.publishedLabel} 시설현황을
            반영합니다. 실제 배정 시험장, 장비 교체, 준비물과 사용 가능 공구는
            해당 회차 수험자 안내와 현장 감독 지시가 최종 기준입니다.
          </p>
        </div>
      </section>
    </div>
  );
}
