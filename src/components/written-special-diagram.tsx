import type { ReactNode } from "react";
import type { WrittenSpecialDiagramId } from "@/data/source/written-visual-coverage";

type DiagramMetadata = {
  title: string;
  description: string;
  sourceLabel: string;
  sourceUrl?: string;
};

const DIAGRAM_METADATA: Record<WrittenSpecialDiagramId, DiagramMetadata> = {
  "abbe-principle": {
    title: "아베의 원리: 측정축과 눈금축을 일치",
    description:
      "측정축과 기준 눈금축이 어긋난 상태에서 각도 오차가 생기면, 두 축 사이 거리만큼 확대된 측정오차가 발생합니다.",
    sourceLabel: "자체 제작 · 아베의 원리 계측학 정의 대조",
  },
  "magneto-bearing-comparison": {
    title: "마그네토 볼베어링과 깊은 홈 볼베어링 비교",
    description:
      "마그네토 볼베어링은 외륜 한쪽 턱이 열린 분리형 구조입니다. 전자석으로 축을 띄우는 자기베어링과는 다른 기계요소입니다.",
    sourceLabel: "자체 제작 · NSK Magneto Bearings 기술자료 대조",
    sourceUrl: "https://www.nsk.com/eu-en/products/data-sheets/magneto-bearings/",
  },
  "pintle-chain-construction": {
    title: "핀틀체인 링크 구조와 롤러체인 비교",
    description:
      "핀틀체인은 오프셋 링크의 배럴과 핀이 직접 관절을 이루는 구조입니다. 일반 롤러체인의 부시·롤러 구성과 구분합니다.",
    sourceLabel: "자체 제작 · 핀틀체인 제조사 구조자료 대조",
    sourceUrl: "https://lynxchain.com/resources/documentation/pintle-chain-spec-sheets/",
  },
  "screw-load-brake": {
    title: "나사식 하중브레이크의 조임·유지 원리",
    description:
      "하중 토크가 나사 작용으로 마찰판을 조이고, 래칫과 폴이 역회전을 막아 하중을 유지하는 대표 원리입니다. 제품별 상세 구조는 다를 수 있습니다.",
    sourceLabel: "자체 제작 · Harrington Weston Brake 작동자료 대조",
    sourceUrl: "https://www.harringtonhoists.com/download/2021/03/29/5b15cooqjj_EDOC_0467_rev00.pdf",
  },
  "maintenance-strategy-map": {
    title: "보전방식의 관계: 사후·예방·예지·개량·보전예방",
    description:
      "고장 후 복구, 일정·상태에 따른 사전 정비, 열화 추세 예측, 기존 설비 개선, 설계 단계의 보전성 확보를 서로 구분합니다.",
    sourceLabel: "자체 제작 · 설비보전 방식 정의 비교",
  },
};

export function WrittenSpecialDiagram({
  diagramId,
}: {
  diagramId: WrittenSpecialDiagramId;
}) {
  const metadata = DIAGRAM_METADATA[diagramId];
  const diagram = {
    "abbe-principle": <AbbePrincipleDiagram />,
    "magneto-bearing-comparison": <MagnetoBearingDiagram />,
    "pintle-chain-construction": <PintleChainDiagram />,
    "screw-load-brake": <ScrewLoadBrakeDiagram />,
    "maintenance-strategy-map": <MaintenanceStrategyDiagram />,
  }[diagramId];

  return (
    <figure
      className="overflow-hidden rounded-2xl border border-[#c8dcdf] bg-white"
      data-testid={`written-special-diagram-${diagramId}`}
    >
      <div className="border-b border-[#dce9eb] bg-[#f5fafb] px-4 py-3 sm:px-5">
        <p className="text-xs font-black tracking-[0.14em] text-[#16697a]">자체 제작 기술도식</p>
        <h3 className="mt-1 text-lg font-extrabold text-[#173957]">{metadata.title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{metadata.description}</p>
      </div>
      <p className="px-4 pt-3 text-xs font-bold text-[#16697a] sm:hidden">
        도식을 좌우로 밀어 전체 구조를 비교하세요.
      </p>
      <div className="overflow-x-auto p-3 sm:p-5">{diagram}</div>
      <figcaption className="border-t border-[#e1ecee] px-4 py-3 text-xs font-semibold leading-5 text-slate-500 sm:px-5">
        출처:{" "}
        {metadata.sourceUrl ? (
          <a
            href={metadata.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-slate-300 underline-offset-2"
          >
            {metadata.sourceLabel}
          </a>
        ) : (
          metadata.sourceLabel
        )}
      </figcaption>
    </figure>
  );
}

function DiagramShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 760 390"
      className="h-auto min-w-[620px] w-full"
      role="img"
      aria-labelledby={`${title.replaceAll(" ", "-")}-title ${title.replaceAll(" ", "-")}-desc`}
    >
      <title id={`${title.replaceAll(" ", "-")}-title`}>{title}</title>
      <desc id={`${title.replaceAll(" ", "-")}-desc`}>{description}</desc>
      <rect x="8" y="8" width="744" height="374" rx="22" fill="#f8fbfc" stroke="#c7dfe1" />
      {children}
    </svg>
  );
}

function AbbePrincipleDiagram() {
  return (
    <DiagramShell
      title="아베의 원리 비교도"
      description="측정축과 눈금축이 일치한 경우와 거리 h만큼 어긋난 경우의 측정오차 비교"
    >
      <text x="42" y="48" className="fill-[#173957] text-[18px] font-black">축 일치: 오차 최소</text>
      <rect x="48" y="145" width="285" height="54" rx="9" fill="#d9eef0" stroke="#16697a" strokeWidth="3" />
      <line x1="68" y1="172" x2="310" y2="172" stroke="#173957" strokeWidth="4" />
      <line x1="68" y1="172" x2="310" y2="172" stroke="#f59e0b" strokeWidth="9" strokeDasharray="3 16" />
      <text x="188" y="230" textAnchor="middle" className="fill-slate-600 text-[14px] font-bold">
        측정축 = 기준 눈금축
      </text>
      <line x1="380" y1="34" x2="380" y2="354" stroke="#d4e3e6" strokeWidth="2" />
      <text x="415" y="48" className="fill-[#173957] text-[18px] font-black">축 불일치: 아베 오차</text>
      <rect x="424" y="190" width="285" height="54" rx="9" fill="#fff1e7" stroke="#b45309" strokeWidth="3" />
      <line x1="442" y1="216" x2="688" y2="216" stroke="#173957" strokeWidth="4" />
      <line x1="442" y1="126" x2="688" y2="116" stroke="#f59e0b" strokeWidth="9" strokeDasharray="3 16" />
      <line x1="462" y1="126" x2="462" y2="216" stroke="#b45309" strokeWidth="3" />
      <text x="448" y="176" textAnchor="end" className="fill-[#8f3f0a] text-[16px] font-black">h</text>
      <path d="M620 214 A58 58 0 0 0 617 125" fill="none" stroke="#6d28d9" strokeWidth="4" />
      <text x="638" y="168" className="fill-[#6d28d9] text-[16px] font-black">θ</text>
      <rect x="454" y="285" width="230" height="50" rx="12" fill="#173957" />
      <text x="569" y="316" textAnchor="middle" className="fill-white text-[21px] font-black">
        e ≈ h · tan θ
      </text>
    </DiagramShell>
  );
}

function MagnetoBearingDiagram() {
  return (
    <DiagramShell
      title="마그네토 볼베어링 비교 단면"
      description="양쪽 턱이 있는 깊은 홈 볼베어링과 외륜 한쪽 턱이 열린 마그네토 볼베어링 비교"
    >
      <BearingCrossSection x={65} label="깊은 홈 볼베어링" openShoulder={false} />
      <BearingCrossSection x={425} label="마그네토 볼베어링" openShoulder />
      <rect x="230" y="310" width="300" height="44" rx="11" fill="#fff1e7" stroke="#d9a06e" />
      <text x="380" y="337" textAnchor="middle" className="fill-[#7c3d12] text-[15px] font-black">
        자기부상식 magnetic bearing과 다름
      </text>
    </DiagramShell>
  );
}

function BearingCrossSection({
  x,
  label,
  openShoulder,
}: {
  x: number;
  label: string;
  openShoulder: boolean;
}) {
  return (
    <g>
      <text x={x + 120} y="54" textAnchor="middle" className="fill-[#173957] text-[17px] font-black">
        {label}
      </text>
      <path
        d={openShoulder
          ? `M${x + 24} 92 H${x + 188} V126 H${x + 72} V262 H${x + 188} V296 H${x + 24} Z`
          : `M${x + 24} 92 H${x + 216} V126 H${x + 72} V262 H${x + 216} V296 H${x + 24} Z`}
        fill="#cbd5e1"
        stroke="#475569"
        strokeWidth="3"
      />
      <rect x={x + 92} y="144" width="72" height="100" rx="8" fill="#f8fafc" stroke="#475569" strokeWidth="3" />
      <circle cx={x + 78} cy="160" r="24" fill="#f3a76f" stroke="#8f3f0a" strokeWidth="3" />
      <circle cx={x + 78} cy="228" r="24" fill="#f3a76f" stroke="#8f3f0a" strokeWidth="3" />
      {openShoulder ? (
        <>
          <path d={`M${x + 190} 100 L${x + 235} 77`} stroke="#b45309" strokeWidth="4" />
          <text x={x + 152} y="76" className="fill-[#8f3f0a] text-[13px] font-black">외륜 한쪽 개방</text>
        </>
      ) : null}
    </g>
  );
}

function PintleChainDiagram() {
  return (
    <DiagramShell
      title="핀틀체인 구조도"
      description="오프셋 링크의 배럴과 핀이 직접 관절을 이루는 핀틀체인과 부시 및 롤러를 갖는 롤러체인 비교"
    >
      <text x="56" y="48" className="fill-[#173957] text-[18px] font-black">핀틀체인</text>
      {[78, 238].map((x) => (
        <g key={x}>
          <path d={`M${x} 120 H${x + 118} L${x + 146} 176 L${x + 118} 232 H${x} L${x - 26} 176 Z`} fill="#d9eef0" stroke="#16697a" strokeWidth="4" />
          <circle cx={x} cy="176" r="24" fill="#f8fafc" stroke="#173957" strokeWidth="4" />
          <circle cx={x + 118} cy="176" r="24" fill="#f8fafc" stroke="#173957" strokeWidth="4" />
          <line x1={x} y1="144" x2={x} y2="208" stroke="#8f3f0a" strokeWidth="13" />
          <text x={x + 56} y="263" textAnchor="middle" className="fill-slate-600 text-[13px] font-bold">오프셋 링크·배럴</text>
        </g>
      ))}
      <line x1="380" y1="34" x2="380" y2="354" stroke="#d4e3e6" strokeWidth="2" />
      <text x="424" y="48" className="fill-[#173957] text-[18px] font-black">롤러체인</text>
      {[455, 575].map((x) => (
        <g key={x}>
          <rect x={x} y="136" width="104" height="80" rx="18" fill="#e9e7fb" stroke="#6d28d9" strokeWidth="4" />
          <circle cx={x + 18} cy="176" r="24" fill="#f8fafc" stroke="#173957" strokeWidth="4" />
          <circle cx={x + 86} cy="176" r="24" fill="#f8fafc" stroke="#173957" strokeWidth="4" />
          <circle cx={x + 18} cy="176" r="12" fill="#f3a76f" />
          <circle cx={x + 86} cy="176" r="12" fill="#f3a76f" />
        </g>
      ))}
      <text x="570" y="263" textAnchor="middle" className="fill-slate-600 text-[13px] font-bold">
        내·외판 + 부시·롤러
      </text>
      <rect x="210" y="302" width="340" height="44" rx="11" fill="#173957" />
      <text x="380" y="329" textAnchor="middle" className="fill-white text-[14px] font-black">
        핀틀체인: 핀이 배럴에서 직접 회전 · 충격·오염 환경에 활용
      </text>
    </DiagramShell>
  );
}

function ScrewLoadBrakeDiagram() {
  const stages = [
    ["권상", "핸들 회전", "마찰판 조임"],
    ["정지·유지", "하중 역토크", "폴이 래칫 고정"],
    ["하강", "반대 회전", "제어된 풀림"],
  ];
  return (
    <DiagramShell
      title="나사식 하중브레이크 작동도"
      description="나사 허브, 마찰판, 래칫휠, 폴이 권상과 정지 유지 및 하강에서 작동하는 대표 원리"
    >
      <g transform="translate(46 66)">
        <rect x="0" y="74" width="270" height="78" rx="16" fill="#e7f4f3" stroke="#16697a" strokeWidth="3" />
        <line x1="26" y1="113" x2="244" y2="113" stroke="#173957" strokeWidth="16" />
        <rect x="62" y="76" width="20" height="74" fill="#f3a76f" />
        <path d="M92 78 L128 148 M112 78 L148 148 M132 78 L168 148" stroke="#8f3f0a" strokeWidth="5" />
        <circle cx="188" cy="113" r="49" fill="#e9e7fb" stroke="#6d28d9" strokeWidth="5" strokeDasharray="8 4" />
        <path d="M220 42 L241 74 L205 80 Z" fill="#173957" />
        <text x="71" y="183" textAnchor="middle" className="fill-slate-600 text-[12px] font-bold">마찰판</text>
        <text x="128" y="34" textAnchor="middle" className="fill-slate-600 text-[12px] font-bold">나사 허브</text>
        <text x="188" y="183" textAnchor="middle" className="fill-slate-600 text-[12px] font-bold">래칫휠</text>
        <text x="235" y="30" textAnchor="middle" className="fill-slate-600 text-[12px] font-bold">폴</text>
      </g>
      <g transform="translate(360 60)">
        {stages.map(([title, input, result], index) => {
          const y = index * 92;
          return (
            <g key={title}>
              <rect x="0" y={y} width="340" height="70" rx="14" fill={index === 1 ? "#fff1e7" : "#f8fafc"} stroke={index === 1 ? "#d9a06e" : "#cbd5e1"} strokeWidth="3" />
              <circle cx="36" cy={y + 35} r="22" fill="#16697a" />
              <text x="36" y={y + 41} textAnchor="middle" className="fill-white text-[15px] font-black">{index + 1}</text>
              <text x="76" y={y + 27} className="fill-[#173957] text-[16px] font-black">{title}</text>
              <text x="76" y={y + 50} className="fill-slate-600 text-[12px] font-bold">{input} → {result}</text>
            </g>
          );
        })}
      </g>
      <text x="380" y="357" textAnchor="middle" className="fill-[#8f3f0a] text-[13px] font-black">
        개념 단면도이며 분해·정비 시에는 해당 제품 제조사 매뉴얼을 우선 적용
      </text>
    </DiagramShell>
  );
}

function MaintenanceStrategyDiagram() {
  const rows = [
    ["사후보전 BM", "고장 발생 후", "복구·교체"],
    ["시간기준 TBM", "주기·사용시간", "정기 정비"],
    ["상태기준 CBM", "측정 상태", "필요 시 정비"],
    ["예지보전 PdM", "열화 추세", "고장시점 예측"],
    ["개량보전 CM", "반복 고장·약점", "설비 구조 개선"],
    ["보전예방 MP", "설계·도입 단계", "고장·정비요구 감소"],
  ];
  return (
    <DiagramShell
      title="설비보전 방식 비교도"
      description="보전방식별 시작 조건과 핵심 행동을 고장 후, 시간, 상태, 추세, 개선, 설계 단계로 구분"
    >
      {rows.map(([name, trigger, action], index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const x = 44 + column * 360;
        const y = 54 + row * 96;
        return (
          <g key={name}>
            <rect x={x} y={y} width="312" height="76" rx="14" fill={index === 0 ? "#fff1e7" : index >= 4 ? "#e9e7fb" : "#e7f4f3"} stroke="#8fb3b7" strokeWidth="2" />
            <text x={x + 18} y={y + 26} className="fill-[#173957] text-[16px] font-black">{name}</text>
            <text x={x + 18} y={y + 49} className="fill-slate-600 text-[12px] font-bold">{trigger} → {action}</text>
          </g>
        );
      })}
      <path d="M64 348 H696" stroke="#173957" strokeWidth="3" />
      <path d="M696 348 L680 338 V358 Z" fill="#173957" />
      <text x="64" y="374" className="fill-slate-600 text-[12px] font-bold">고장 대응</text>
      <text x="696" y="374" textAnchor="end" className="fill-slate-600 text-[12px] font-bold">고장 자체를 줄이는 설계·개선</text>
    </DiagramShell>
  );
}
