const positiveDisplacementTypes = [
  {
    family: "왕복동식",
    types: "피스톤식(단동·복동)",
    principle: "실린더 안의 기체를 피스톤으로 가둔 뒤 체적을 줄입니다.",
  },
  {
    family: "회전식",
    types: "스크루 · 베인 · 루츠/로브 · 스크롤 · 액봉식",
    principle: "회전자 사이에 포획한 기체의 공간을 연속적으로 줄입니다.",
  },
] as const;

const dynamicTypes = [
  {
    family: "원심식",
    principle: "임펠러가 준 속도에너지를 디퓨저에서 압력으로 바꿉니다.",
  },
  {
    family: "축류식",
    principle: "축 방향으로 흐르는 기체를 여러 단의 동익·정익으로 압축합니다.",
  },
  {
    family: "사류식",
    principle: "원심 방향과 축 방향 성분을 함께 이용하는 혼합 흐름 방식입니다.",
  },
] as const;

function FlowArrow() {
  return (
    <span aria-hidden="true" className="px-1 font-black text-[#16697a]">
      →
    </span>
  );
}

export function CompressorClassificationDiagram() {
  return (
    <div
      className="min-w-[720px] rounded-2xl border border-[#c7dfe1] bg-[#f8fbfc] p-5 text-[#173957]"
      role="img"
      aria-label="공기압축기를 용적형과 동력형으로 나누고 각 형식과 압축 순서를 비교한 도식"
    >
      <div className="mx-auto w-fit rounded-xl bg-[#173957] px-7 py-3 text-center text-lg font-black text-white">
        공기압축기
      </div>

      <div className="mx-auto h-6 w-px bg-[#7fa9ae]" />
      <div className="grid grid-cols-2 gap-5">
        <section className="rounded-2xl border-2 border-[#4d9299] bg-white p-4">
          <div className="rounded-xl bg-[#e7f4f3] px-4 py-3">
            <h4 className="text-base font-black">1. 용적형(Positive displacement)</h4>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
              일정량의 기체를 가둔 뒤 체적을 줄여 압력을 높입니다.
            </p>
          </div>
          <div className="mt-3 space-y-3">
            {positiveDisplacementTypes.map((item) => (
              <div key={item.family} className="rounded-xl border border-[#cfe2e4] p-3">
                <p className="font-black text-[#0e6674]">
                  {item.family} <span className="text-slate-400">·</span>{" "}
                  <span className="font-bold text-slate-700">{item.types}</span>
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                  {item.principle}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border-2 border-[#8e72c8] bg-white p-4">
          <div className="rounded-xl bg-[#f0ebfb] px-4 py-3">
            <h4 className="text-base font-black">2. 동력형(터보형, Dynamic)</h4>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
              회전차가 준 속도에너지를 디퓨저·고정익에서 압력으로 바꿉니다.
            </p>
          </div>
          <div className="mt-3 space-y-3">
            {dynamicTypes.map((item) => (
              <div key={item.family} className="rounded-xl border border-[#ddd3f2] p-3">
                <p className="font-black text-[#6843a5]">{item.family}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                  {item.principle}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm font-bold">
        <div className="rounded-xl border border-[#cfe2e4] bg-white px-3 py-3">
          <strong className="block text-[#0e6674]">왕복식 순서</strong>
          <span className="mt-1 block text-slate-600">
            흡입 <FlowArrow /> 압축 <FlowArrow /> 토출
          </span>
        </div>
        <div className="rounded-xl border border-[#cfe2e4] bg-white px-3 py-3">
          <strong className="block text-[#0e6674]">회전 용적식 순서</strong>
          <span className="mt-1 block text-slate-600">
            흡입 <FlowArrow /> 포획 <FlowArrow /> 체적 감소 <FlowArrow /> 토출
          </span>
        </div>
        <div className="rounded-xl border border-[#ddd3f2] bg-white px-3 py-3">
          <strong className="block text-[#6843a5]">동력형 순서</strong>
          <span className="mt-1 block text-slate-600">
            흡입 <FlowArrow /> 가속 <FlowArrow /> 압력 변환 <FlowArrow /> 토출
          </span>
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-[#f0c48b] bg-[#fff7eb] px-4 py-3 text-sm font-bold leading-6 text-[#7c3d12]">
        용어 구분: 베인식은 회전 용적식 압축기에 포함됩니다. 기어형은 이
        압축기 분류의 대표 형식이 아니라 유압의 용적식 펌프 분류에서 주로
        다룹니다.
      </p>
    </div>
  );
}
