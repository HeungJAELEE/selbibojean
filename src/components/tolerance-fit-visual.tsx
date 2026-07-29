import { CircleDotDashed, Ruler, TableProperties } from "lucide-react";

const FIT_ROWS = [
  {
    name: "헐거운 끼워맞춤",
    english: "Clearance fit",
    condition: "Smin = Dmin − dmax > 0",
    decision: "가장 작은 구멍과 가장 큰 축을 조합해도 틈새가 남는다.",
    use: "미끄럼·회전처럼 상대운동 또는 쉬운 조립이 필요한 곳",
    tone: "bg-sky-50 text-sky-950",
  },
  {
    name: "중간 끼워맞춤",
    english: "Transition fit",
    condition: "Smin ≤ 0 ≤ Smax",
    decision: "실제 구멍·축 치수 조합에 따라 작은 틈새 또는 작은 죔새가 생긴다.",
    use: "정밀 위치결정처럼 조립성과 고정성을 함께 보는 곳",
    tone: "bg-amber-50 text-amber-950",
  },
  {
    name: "억지 끼워맞춤",
    english: "Interference fit",
    condition: "Smax = Dmax − dmin < 0",
    decision: "가장 큰 구멍과 가장 작은 축을 조합해도 축이 더 커서 죔새가 생긴다.",
    use: "압입·열박음처럼 상대운동 없이 고정해야 하는 곳",
    tone: "bg-rose-50 text-rose-950",
  },
] as const;

const GEOMETRIC_TOLERANCE_GROUPS = [
  {
    category: "모양 공차",
    memory: "모",
    datum: "원칙적으로 불필요",
    items: [
      ["―", "진직도", "선 또는 축선이 곧은 정도"],
      ["▱", "평면도", "한 면 전체가 평평한 정도"],
      ["○", "진원도", "각 원형 단면이 참원에 가까운 정도"],
      ["⌭", "원통도", "원통면 전체의 종합 형상"],
    ],
  },
  {
    category: "자세 공차",
    memory: "자",
    datum: "필요",
    items: [
      ["//", "평행도", "기준에 대해 평행한 정도"],
      ["⊥", "직각도", "기준에 대해 90°인 정도"],
      ["∠", "경사도", "기준에 대해 지정 각도를 이루는 정도"],
    ],
  },
  {
    category: "위치 공차",
    memory: "위",
    datum: "필요",
    items: [
      ["⨁", "위치도", "이론적으로 정확한 위치에서 벗어난 정도"],
      ["◎", "동축도·동심도", "대상 중심축이 기준축과 일치하는 정도"],
      ["≡", "대칭도", "대상 중심면이 기준 중심면과 일치하는 정도"],
    ],
  },
  {
    category: "흔들림 공차",
    memory: "흔",
    datum: "필요",
    items: [
      ["↗", "원주 흔들림", "한 단면에서 한 바퀴 회전할 때의 지시 변화"],
      ["⩗", "온 흔들림", "회전하며 표면 전체를 이동 측정한 지시 변화"],
    ],
  },
] as const;

export function ToleranceFitVisual() {
  return (
    <section
      data-testid="tolerance-fit-reference"
      className="mt-5 overflow-hidden rounded-2xl border border-[#b9d9d7] bg-[#f8fcfc]"
      aria-labelledby="tolerance-fit-reference-title"
    >
      <header className="flex items-start gap-3 border-b border-[#d4e8e6] p-4 md:p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#16697a] text-white">
          <TableProperties size={19} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#16697a]">
            판정 기준표
          </p>
          <h3
            id="tolerance-fit-reference-title"
            className="mt-1 text-lg font-extrabold text-[#173957]"
          >
            공차·끼워맞춤과 기하공차를 표에서 바로 판독하기
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            사용자 통합본의 공차 공식과 ‘모-자-위-흔’ 기호표를 기준으로 정리했습니다.
            D는 구멍, d는 축의 실제 최대·최소 한계치수입니다.
          </p>
        </div>
      </header>

      <div className="grid gap-8 p-4 md:p-5">
        <section aria-labelledby="fit-decision-title">
          <div className="flex items-center gap-2">
            <Ruler size={18} className="text-[#16697a]" aria-hidden="true" />
            <h4 id="fit-decision-title" className="font-extrabold text-[#173957]">
              끼워맞춤 판정 기준
            </h4>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FormulaCard
              label="최대틈새"
              formula="Smax = Dmax − dmin"
              note="가장 큰 구멍 − 가장 작은 축"
            />
            <FormulaCard
              label="최소틈새"
              formula="Smin = Dmin − dmax"
              note="가장 작은 구멍 − 가장 큰 축"
            />
          </div>

          <div
            className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white"
            role="region"
            aria-label="끼워맞춤 판정 기준표"
            tabIndex={0}
          >
            <table className="min-w-[760px] w-full border-collapse text-left text-sm">
              <thead className="bg-[#173957] text-white">
                <tr>
                  <th className="px-4 py-3">종류</th>
                  <th className="px-4 py-3">계산 판정</th>
                  <th className="px-4 py-3">무슨 뜻인가</th>
                  <th className="px-4 py-3">대표 적용</th>
                </tr>
              </thead>
              <tbody>
                {FIT_ROWS.map((row) => (
                  <tr key={row.name} className="border-t border-slate-200 align-top">
                    <th className={`px-4 py-4 font-extrabold ${row.tone}`}>
                      {row.name}
                      <span className="mt-1 block text-xs font-semibold opacity-70">
                        {row.english}
                      </span>
                    </th>
                    <td className="px-4 py-4 font-mono font-bold text-[#173957]">
                      {row.condition}
                    </td>
                    <td className="px-4 py-4 leading-6">{row.decision}</td>
                    <td className="px-4 py-4 leading-6 text-slate-600">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <BasisCard
              title="구멍 기준제"
              symbol="H"
              body="H 구멍의 아래 치수허용차를 기준선 0에 두고 축 공차역을 바꾸어 끼워맞춤을 만든다."
            />
            <BasisCard
              title="축 기준제"
              symbol="h"
              body="h 축의 위 치수허용차를 기준선 0에 두고 구멍 공차역을 바꾸어 끼워맞춤을 만든다."
            />
          </div>

          <aside className="mt-4 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <strong className="block">시험에서 먼저 확인할 함정</strong>
            <span className="mt-1 block">
              대문자는 구멍, 소문자는 축입니다. <code>Ø44G7</code>처럼 한쪽 공차기호만
              주어지면 헐거운·중간·억지 끼워맞춤을 확정할 수 없습니다. 짝이 되는 축
              공차기호 또는 구멍·축의 최대·최소치가 함께 있어야 합니다.
            </span>
          </aside>
        </section>

        <section aria-labelledby="geometric-tolerance-title">
          <div className="flex items-center gap-2">
            <CircleDotDashed size={18} className="text-[#16697a]" aria-hidden="true" />
            <h4 id="geometric-tolerance-title" className="font-extrabold text-[#173957]">
              기하공차 기호표
            </h4>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            암기 순서는 <strong>모양 → 자세 → 위치 → 흔들림</strong>, 즉
            <strong> ‘모-자-위-흔’</strong>입니다. 형상 자체만 규제하는 모양 공차는
            원칙적으로 데이텀이 필요 없고, 자세·위치·흔들림은 기준과 함께 읽습니다.
          </p>

          <div
            className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white"
            role="region"
            aria-label="기하공차 기호와 데이텀 기준표"
            tabIndex={0}
          >
            <table className="min-w-[720px] w-full border-collapse text-left text-sm">
              <thead className="bg-[#173957] text-white">
                <tr>
                  <th className="px-4 py-3">분류</th>
                  <th className="px-4 py-3">기호</th>
                  <th className="px-4 py-3">명칭</th>
                  <th className="px-4 py-3">판독 핵심</th>
                  <th className="px-4 py-3">데이텀</th>
                </tr>
              </thead>
              <tbody>
                {GEOMETRIC_TOLERANCE_GROUPS.flatMap((group) =>
                  group.items.map((item, index) => (
                    <tr
                      key={`${group.category}-${item[1]}`}
                      className="border-t border-slate-200 align-top"
                    >
                      {index === 0 ? (
                        <th
                          rowSpan={group.items.length}
                          className="bg-slate-50 px-4 py-4 font-extrabold text-[#173957]"
                        >
                          <span className="mr-2 inline-grid size-7 place-items-center rounded-full bg-[#16697a] text-xs text-white">
                            {group.memory}
                          </span>
                          {group.category}
                        </th>
                      ) : null}
                      <td className="px-4 py-4 text-center text-2xl font-bold text-[#173957]">
                        {item[0]}
                      </td>
                      <th className="px-4 py-4 font-extrabold text-[#173957]">{item[1]}</th>
                      <td className="px-4 py-4 leading-6">{item[2]}</td>
                      {index === 0 ? (
                        <td
                          rowSpan={group.items.length}
                          className="px-4 py-4 font-bold text-slate-600"
                        >
                          {group.datum}
                        </td>
                      ) : null}
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-4 rounded-xl bg-[#eaf7f6] p-4 text-sm font-bold leading-6 text-[#294a58]">
            공차틀은 기호 → 공차값 → 데이텀 순으로 읽습니다. 원통도와 원주 흔들림은
            같은 뜻이 아니며, 위치도 ⨁와 동축도·동심도 ◎도 구분해야 합니다.
            P 또는 Ⓟ는 돌출공차역을 뜻합니다.
          </p>
        </section>
      </div>
    </section>
  );
}

function FormulaCard({
  label,
  formula,
  note,
}: {
  label: string;
  formula: string;
  note: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black text-[#16697a]">{label}</p>
      <code className="mt-2 block font-bold text-[#173957]">{formula}</code>
      <p className="mt-2 text-sm text-slate-600">{note}</p>
    </article>
  );
}

function BasisCard({
  title,
  symbol,
  body,
}: {
  title: string;
  symbol: string;
  body: string;
}) {
  return (
    <article className="flex gap-3 rounded-xl border border-[#b9d9d7] bg-[#f2fbfa] p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#16697a] font-mono text-lg font-black text-white">
        {symbol}
      </span>
      <div>
        <h5 className="font-extrabold text-[#173957]">{title}</h5>
        <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
      </div>
    </article>
  );
}
