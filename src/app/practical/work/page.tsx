import { PracticalFluidPowerVideoGuide } from "@/components/practical-fluid-power-video-guide";
import { PracticalRepairWeldingVideoGuide } from "@/components/practical-repair-welding-video-guide";
import { PageHeading } from "@/components/page-heading";
import { practicalFluidPowerVideoGroups } from "@/data/source/practical-fluid-power-videos";
import { practicalRepairWeldingVideos } from "@/data/source/practical-repair-welding-videos";

const workAreas = [
  {
    title: "공기압 시스템",
    description: "회로 구성, 작동 확인, 고장진단과 안전조치를 학습합니다.",
  },
  {
    title: "유압 시스템",
    description: "회로 구성, 압력 설정, 유체에너지 안전과 점검순서를 학습합니다.",
  },
  {
    title: "보수용접 및 누수시험",
    description: "작업순서, 검사, 보호구, 실격조건과 보수용접의 전체 흐름을 학습합니다.",
  },
] as const;

export default function PracticalWorkPage() {
  return (
    <div className="page-wrap py-12">
      <PageHeading
        eyebrow="Practical · work"
        title="실기 작업형"
        description="필답형과 분리한 공기압·유압·보수용접 및 누수시험의 실제 수행과제와 안전·실격조건을 관리합니다."
      />

      <PracticalFluidPowerVideoGuide groups={practicalFluidPowerVideoGroups} />

      <PracticalRepairWeldingVideoGuide videos={practicalRepairWeldingVideos} />

      <section className="mt-12" aria-labelledby="practical-work-area-heading">
        <div>
          <p className="eyebrow">Practical work areas</p>
          <h2 id="practical-work-area-heading" className="mt-2 text-2xl font-extrabold tracking-tight">
            작업형 학습 영역
          </h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {workAreas.map((area) => (
            <div key={area.title} className="card p-7">
              <h3 className="text-lg font-extrabold">{area.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{area.description}</p>
              <p className="mt-5 text-xs font-extrabold text-amber-700">
                공식 공개과제 원문 검증 후 콘텐츠 공개
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
