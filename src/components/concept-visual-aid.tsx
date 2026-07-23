import { ArrowRight, ChartNoAxesCombined, CircleGauge, GitCompareArrows } from "lucide-react";
import type { LessonFamily } from "@/lib/content/lesson-families";

type ConceptVisualAidProps = {
  family: LessonFamily;
};

export function ConceptVisualAid({ family }: ConceptVisualAidProps) {
  const key = `${family.groupId}:${family.id}`;

  if (key === "s1-g02:accumulator") return <AccumulatorCycleVisual />;
  if (key === "s1-g11:action") return <PidResponseVisual />;
  if (key === "s2-g01:classification") return <WeldingPrincipleVisual />;
  if (key === "s2-g02:process") return <ArcWeldingProcessVisual />;
  return <FamilyDecisionMap family={family} />;
}

function VisualFrame({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <figure className="mt-5 overflow-hidden rounded-2xl border border-[#b9d9d7] bg-[#f8fcfc]">
      <div className="flex items-start gap-3 border-b border-[#d4e8e6] p-4 md:p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#16697a] text-white">
          {icon}
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#16697a]">{eyebrow}</p>
          <h3 className="mt-1 text-lg font-extrabold text-[#173957]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </figure>
  );
}

function AccumulatorCycleVisual() {
  return (
    <VisualFrame
      eyebrow="Visual guide"
      title="압력이 바뀔 때 가스와 작동유의 움직임"
      description="어큐뮬레이터는 압력을 새로 만드는 장치가 아니라, 가스를 압축하며 받은 유압에너지를 저장했다가 계통 압력이 낮아질 때 돌려보내는 장치입니다."
      icon={<CircleGauge size={19} aria-hidden="true" />}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <AccumulatorState
          id="accumulator-charge"
          title="충전·저장"
          relation="계통 압력 > 봉입가스 압력"
          gasHeight={48}
          oilHeight={92}
          arrow="up"
          explanation="작동유가 들어오면서 가스가 압축되고 에너지가 저장됩니다."
        />
        <AccumulatorState
          id="accumulator-discharge"
          title="방출·보상"
          relation="계통 압력 ↓"
          gasHeight={88}
          oilHeight={52}
          arrow="down"
          explanation="압축된 가스가 팽창하면서 작동유를 회로로 밀어냅니다."
        />
      </div>
      <figcaption className="mt-4 rounded-xl bg-[#eaf7f6] p-4 text-sm font-bold leading-6 text-[#294a58]">
        시험 판단: 압력맥동·충격 완화, 누설 보상, 비상동력은 저장된 에너지를 다시 내보내는 기능입니다.
        설정압력보다 더 높은 압력을 만드는 증압기와 구분하세요.
      </figcaption>
    </VisualFrame>
  );
}

function AccumulatorState({
  id,
  title,
  relation,
  gasHeight,
  oilHeight,
  arrow,
  explanation,
}: {
  id: string;
  title: string;
  relation: string;
  gasHeight: number;
  oilHeight: number;
  arrow: "up" | "down";
  explanation: string;
}) {
  const separatorY = 28 + gasHeight;
  const oilY = separatorY + 4;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-extrabold text-[#173957]">{title}</h4>
        <span className="rounded-full bg-[#eaf7f6] px-3 py-1 text-xs font-black text-[#16697a]">
          {relation}
        </span>
      </div>
      <svg
        viewBox="0 0 320 220"
        className="mx-auto mt-3 h-auto w-full max-w-[320px]"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>어큐뮬레이터 {title} 상태 구조도</title>
        <desc id={`${id}-desc`}>{explanation}</desc>
        <rect x="86" y="22" width="148" height="170" rx="52" fill="#f8fafc" stroke="#173957" strokeWidth="5" />
        <rect x="94" y="28" width="132" height={gasHeight} rx="40" fill="#d9eef0" />
        <path
          d={`M96 ${separatorY} Q160 ${separatorY - 10} 224 ${separatorY} L224 ${separatorY + 12} Q160 ${separatorY + 2} 96 ${separatorY + 12} Z`}
          fill="#f3a76f"
          stroke="#8f3f0a"
          strokeWidth="2"
        />
        <path
          d={`M94 ${oilY} Q160 ${oilY - 8} 226 ${oilY} L226 156 Q226 184 198 184 L122 184 Q94 184 94 156 Z`}
          fill="#79c7bf"
        />
        <rect x="146" y="190" width="28" height="18" rx="5" fill="#173957" />
        <text x="160" y={Math.max(48, 28 + gasHeight / 2)} textAnchor="middle" className="fill-[#173957] text-[13px] font-bold">
          봉입가스
        </text>
        <text x="160" y={Math.min(166, oilY + oilHeight / 2)} textAnchor="middle" className="fill-[#173957] text-[13px] font-bold">
          작동유
        </text>
        <line
          x1="270"
          y1={arrow === "up" ? 182 : 112}
          x2="270"
          y2={arrow === "up" ? 112 : 182}
          stroke="#8f3f0a"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d={arrow === "up" ? "M260 122 L270 108 L280 122" : "M260 172 L270 186 L280 172"}
          fill="none"
          stroke="#8f3f0a"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="270" y="96" textAnchor="middle" className="fill-[#8f3f0a] text-[12px] font-bold">
          유동
        </text>
      </svg>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{explanation}</p>
    </div>
  );
}

function PidResponseVisual() {
  return (
    <VisualFrame
      eyebrow="Response graph"
      title="같은 설정값 변화에 대한 P·PI·PID 응답 비교"
      description="곡선은 실제 튜닝 결과가 아니라 각 제어동작의 대표 경향을 비교하기 위한 정성적 그래프입니다. 공정 지연과 게인에 따라 실제 모양은 달라집니다."
      icon={<ChartNoAxesCombined size={19} aria-hidden="true" />}
    >
      <div className="rounded-xl border border-slate-200 bg-white p-3 md:p-5">
        <svg
          viewBox="0 0 720 360"
          className="h-auto w-full"
          role="img"
          aria-labelledby="pid-visual-title pid-visual-desc"
        >
          <title id="pid-visual-title">P, PI, PID 제어의 정성적 시간응답 비교 그래프</title>
          <desc id="pid-visual-desc">
            P 제어는 목표값 아래에 정상상태 편차가 남고, PI 제어는 목표값을 넘은 뒤 수렴하며, PID 제어는 오버슈트를 줄이며 빠르게 목표값에 수렴하는 예시입니다.
          </desc>
          <rect x="66" y="34" width="610" height="260" rx="12" fill="#f8fafc" />
          {[94, 144, 194, 244, 294].map((y) => (
            <line key={y} x1="66" y1={y} x2="676" y2={y} stroke="#dbe4ea" strokeWidth="1" />
          ))}
          <line x1="66" y1="294" x2="676" y2="294" stroke="#173957" strokeWidth="3" />
          <line x1="66" y1="34" x2="66" y2="294" stroke="#173957" strokeWidth="3" />
          <line x1="66" y1="94" x2="676" y2="94" stroke="#64748b" strokeWidth="3" strokeDasharray="10 8" />
          <text x="680" y="88" className="fill-slate-500 text-[14px] font-bold">목표값</text>
          <text x="666" y="324" textAnchor="end" className="fill-slate-600 text-[14px] font-bold">시간</text>
          <text x="26" y="50" className="fill-slate-600 text-[14px] font-bold">출력</text>

          <path d="M68 294 C145 260 185 184 254 146 C350 112 510 124 674 124" fill="none" stroke="#8f3f0a" strokeWidth="6" strokeLinecap="round" />
          <path d="M68 294 C138 286 168 130 236 66 C310 30 356 128 418 111 C490 90 565 94 674 94" fill="none" stroke="#2b8c88" strokeWidth="6" strokeLinecap="round" />
          <path d="M68 294 C140 278 190 147 256 101 C322 74 374 92 438 94 C520 94 592 94 674 94" fill="none" stroke="#173957" strokeWidth="6" strokeLinecap="round" />

          <circle cx="536" cy="124" r="7" fill="#8f3f0a" />
          <line x1="536" y1="124" x2="536" y2="94" stroke="#8f3f0a" strokeWidth="2" />
          <text x="548" y="116" className="fill-[#8f3f0a] text-[13px] font-bold">정상상태 편차</text>

          <circle cx="236" cy="66" r="7" fill="#2b8c88" />
          <text x="246" y="54" className="fill-[#16697a] text-[13px] font-bold">오버슈트</text>
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-slate-600">
          <Legend color="#8f3f0a" label="P: 편차가 남을 수 있음" />
          <Legend color="#2b8c88" label="PI: 편차 제거, 오버슈트 가능" />
          <Legend color="#173957" label="PID: 변화율 제동으로 진동 보완" />
        </div>
      </div>
      <figcaption className="mt-4 rounded-xl bg-[#eaf7f6] p-4 text-sm font-bold leading-6 text-[#294a58]">
        시험 판단: P는 현재 편차, I는 누적 편차, D는 편차의 변화율을 사용합니다. D가 정상편차를 직접 제거한다고
        바꾸어 제시하는 보기에 주의하세요.
      </figcaption>
    </VisualFrame>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1 w-5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

function WeldingPrincipleVisual() {
  return (
    <VisualFrame
      eyebrow="Mechanism map"
      title="모재·압력·용가재로 구분하는 용접 분류"
      description="에너지원이나 장비 이름보다 무엇이 녹고 압력이 결합의 주된 수단인지 먼저 보면 생소한 공정도 분류할 수 있습니다."
      icon={<GitCompareArrows size={19} aria-hidden="true" />}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <WeldingCard
          id="fusion-welding"
          title="융접"
          accent="#8f3f0a"
          badge="모재가 녹음"
          description="접합부 모재를 녹여 용융지로 만든 뒤 응고시켜 연결합니다."
          variant="fusion"
        />
        <WeldingCard
          id="pressure-welding"
          title="압접"
          accent="#173957"
          badge="가압력이 핵심"
          description="접촉부에 열 또는 소성변형을 주고 압력을 가해 결합합니다."
          variant="pressure"
        />
        <WeldingCard
          id="brazing-welding"
          title="납땜"
          accent="#16697a"
          badge="용가재만 녹음"
          description="모재는 녹이지 않고 낮은 융점의 용가재가 틈으로 퍼져 결합합니다."
          variant="brazing"
        />
      </div>
      <figcaption className="mt-4 rounded-xl bg-[#eaf7f6] p-4 text-sm font-bold leading-6 text-[#294a58]">
        시험 판단: 저항용접은 접촉저항열을 사용해도 전극 가압력이 핵심이므로 압접으로 분류합니다. ‘전기를
        사용한다’는 공통점만으로 융접을 고르면 안 됩니다.
      </figcaption>
    </VisualFrame>
  );
}

function ArcWeldingProcessVisual() {
  const processes = [
    {
      code: "SMAW",
      electrode: "피복 봉",
      shield: "가스+슬래그",
      feed: "봉 교체",
      fit: "현장·보수",
      color: "#8f3f0a",
    },
    {
      code: "GTAW",
      electrode: "텅스텐",
      shield: "불활성가스",
      feed: "용가봉 선택",
      fit: "정밀·박판",
      color: "#16697a",
    },
    {
      code: "GMAW",
      electrode: "솔리드와이어",
      shield: "불활성/활성가스",
      feed: "연속 송급",
      fit: "반자동·로봇",
      color: "#173957",
    },
    {
      code: "FCAW",
      electrode: "관상와이어",
      shield: "내부 플럭스",
      feed: "연속 송급",
      fit: "구조물·고용착",
      color: "#6d4c7d",
    },
    {
      code: "SAW",
      electrode: "연속와이어",
      shield: "입상 플럭스층",
      feed: "자동 주행",
      fit: "후판·긴 이음",
      color: "#2f6b45",
    },
  ];

  return (
    <VisualFrame
      eyebrow="Process map"
      title="전극과 차폐방식으로 구분하는 아크용접 5종"
      description="왼쪽에서 오른쪽으로 전극 형식, 용융지 보호방법, 재료 공급, 대표 적용을 따라가면 비슷한 공정명을 빠르게 구분할 수 있습니다."
      icon={<GitCompareArrows size={19} aria-hidden="true" />}
    >
      <div className="grid gap-3 md:hidden" aria-label="아크용접 공정별 전극과 차폐방식 비교">
        {processes.map((process) => (
          <article key={process.code} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <h3
              className="px-4 py-3 text-sm font-black text-white"
              style={{ backgroundColor: process.color }}
            >
              {process.code}
            </h3>
            <dl className="grid grid-cols-[84px_1fr] gap-x-3 gap-y-2 p-4 text-sm leading-6">
              <dt className="font-black text-slate-500">전극</dt><dd className="font-bold text-[#294a58]">{process.electrode}</dd>
              <dt className="font-black text-slate-500">차폐</dt><dd className="font-bold text-[#294a58]">{process.shield}</dd>
              <dt className="font-black text-slate-500">공급</dt><dd className="font-bold text-[#294a58]">{process.feed}</dd>
              <dt className="font-black text-slate-500">대표 적용</dt><dd className="font-bold text-[#294a58]">{process.fit}</dd>
            </dl>
          </article>
        ))}
      </div>
      <div
        className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block"
        role="region"
        aria-label="아크용접 공정별 전극과 차폐방식 비교표"
        tabIndex={0}
      >
        <table className="min-w-[760px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs font-black text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3">공정</th>
              <th scope="col" className="px-4 py-3">전극</th>
              <th scope="col" className="px-4 py-3">차폐</th>
              <th scope="col" className="px-4 py-3">공급 방식</th>
              <th scope="col" className="px-4 py-3">대표 적용</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <tr key={process.code} className="border-t border-slate-200">
                <th scope="row" className="px-4 py-3 font-black text-white" style={{ backgroundColor: process.color }}>
                  {process.code}
                </th>
                <td className="px-4 py-3 font-bold text-[#294a58]">{process.electrode}</td>
                <td className="px-4 py-3 font-bold text-[#294a58]">{process.shield}</td>
                <td className="px-4 py-3 font-bold text-[#294a58]">{process.feed}</td>
                <td className="px-4 py-3 font-bold text-[#294a58]">{process.fit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-4 rounded-xl bg-[#eaf7f6] p-4 text-sm font-bold leading-6 text-[#294a58]">
        한 줄 구분: TIG만 비소모성 텅스텐, GMAW는 솔리드와이어+가스, FCAW는 와이어 속 플럭스,
        SAW는 아크 위 입상 플럭스, SMAW는 피복 봉입니다.
      </figcaption>
    </VisualFrame>
  );
}

function WeldingCard({
  id,
  title,
  accent,
  badge,
  description,
  variant,
}: {
  id: string;
  title: string;
  accent: string;
  badge: string;
  description: string;
  variant: "fusion" | "pressure" | "brazing";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-extrabold text-[#173957]">{title}</h4>
        <span className="rounded-full px-2.5 py-1 text-xs font-black text-white" style={{ backgroundColor: accent }}>
          {badge}
        </span>
      </div>
      <svg
        viewBox="0 0 240 150"
        className="mt-3 h-auto w-full"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>{title}의 결합 원리</title>
        <desc id={`${id}-desc`}>{description}</desc>
        <rect x="18" y="82" width="92" height="34" rx="6" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
        <rect x="130" y="82" width="92" height="34" rx="6" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
        {variant === "fusion" && (
          <>
            <path d="M94 84 Q120 48 146 84 Q137 112 120 116 Q103 112 94 84 Z" fill="#f3a76f" stroke="#8f3f0a" strokeWidth="3" />
            <path d="M120 22 C104 42 111 53 120 66 C129 53 136 42 120 22 Z" fill="#f7c977" />
            <text x="120" y="140" textAnchor="middle" className="fill-slate-600 text-[12px] font-bold">모재 용융·응고</text>
          </>
        )}
        {variant === "pressure" && (
          <>
            <rect x="103" y="21" width="34" height="56" rx="8" fill="#173957" />
            <path d="M104 58 L92 47 M136 58 L148 47" stroke="#8f3f0a" strokeWidth="5" strokeLinecap="round" />
            <path d="M108 88 L120 98 L132 88" fill="none" stroke="#8f3f0a" strokeWidth="5" strokeLinecap="round" />
            <text x="120" y="140" textAnchor="middle" className="fill-slate-600 text-[12px] font-bold">가열·가압</text>
          </>
        )}
        {variant === "brazing" && (
          <>
            <path d="M109 64 Q120 44 131 64 L128 105 L112 105 Z" fill="#79c7bf" stroke="#16697a" strokeWidth="3" />
            <path d="M110 101 L130 101" stroke="#16697a" strokeWidth="7" strokeLinecap="round" />
            <path d="M120 28 C108 44 112 54 120 62 C128 54 132 44 120 28 Z" fill="#f7c977" />
            <text x="120" y="140" textAnchor="middle" className="fill-slate-600 text-[12px] font-bold">용가재 젖음·모세관</text>
          </>
        )}
      </svg>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function FamilyDecisionMap({ family }: { family: LessonFamily }) {
  const rows = family.comparison.slice(0, 3);

  return (
    <VisualFrame
      eyebrow="Concept map"
      title={`${family.label} 기출 판단 지도`}
      description="문제의 단서에서 바로 답을 고르지 않고, 적용 대상과 기능을 거쳐 실제 기출 판단유형까지 연결합니다. 아래에는 이 묶음에서 우선 구분할 대표 개념을 표시했습니다."
      icon={<GitCompareArrows size={19} aria-hidden="true" />}
    >
      <div className="grid gap-4" data-testid="family-decision-map">
        {rows.map((item, index) => (
          <article
            key={item.term}
            className="grid items-stretch gap-2 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)_32px_minmax(0,1fr)] md:gap-3 md:p-4"
          >
            <MapNode
              step={`${index + 1}-A`}
              label="문제에서 찾을 단서"
              body={item.input}
              tone="clue"
            />
            <FlowArrow />
            <MapNode
              step={`${index + 1}-B`}
              label={item.term}
              body={item.role}
              tone="concept"
            />
            <FlowArrow />
            <MapNode
              step={`${index + 1}-C`}
              label="기출 판단유형"
              body={item.effect}
              tone="judgment"
            />
          </article>
        ))}
      </div>
      <figcaption className="mt-4 rounded-xl bg-[#eaf7f6] p-4 text-sm font-bold leading-6 text-[#294a58]">
        읽는 순서: 문제의 조건을 찾고 → 해당 개념의 고유한 기능과 대조하고 → 아래 비교표에서 실제 함정과 주의점을
        확인하세요. 명칭이 비슷하다는 이유만으로 판단하지 않습니다.
      </figcaption>
    </VisualFrame>
  );
}

function MapNode({
  step,
  label,
  body,
  tone,
}: {
  step: string;
  label: string;
  body: string;
  tone: "clue" | "concept" | "judgment";
}) {
  const toneClass = {
    clue: "border-[#d7e1e8] bg-slate-50 text-[#294a58]",
    concept: "border-[#b9d9d7] bg-[#f2fbfa] text-[#173957]",
    judgment: "border-[#efc7aa] bg-[#fff8f2] text-[#6f320b]",
  }[tone];

  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <div className="flex items-center gap-2">
        <span className="sr-only">{step}</span>
        <p className="text-xs font-black uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-2 text-sm font-semibold leading-6">{body}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <span className="grid place-items-center text-[#16697a]" aria-hidden="true">
      <ArrowRight className="rotate-90 md:rotate-0" size={20} />
    </span>
  );
}
