import type { ReactNode } from "react";

export type SupplementalVisualAidId =
  | "hydraulic-bleed-sync"
  | "load-cell-bridge"
  | "welding-joint-heat-input"
  | "welding-ndt-map"
  | "stress-strain-material-test"
  | "lubrication-management-loop";

export type SupplementalVisualAidMetadata = {
  id: SupplementalVisualAidId;
  title: string;
  altText: string;
  description: string;
  source: "자체 제작";
  license: "프로젝트 자체 제작물";
};

export const supplementalVisualAidRegistry: Record<
  SupplementalVisualAidId,
  SupplementalVisualAidMetadata
> = {
  "hydraulic-bleed-sync": {
    id: "hydraulic-bleed-sync",
    title: "블리드오프와 동기회로 개념도",
    altText:
      "펌프 유량 일부를 탱크로 우회하는 블리드오프 회로와 두 실린더의 위치를 맞추는 동기회로 비교도",
    description: "유량 우회와 위치 보정의 차이를 보여 주는 자체 제작 개념도입니다.",
    source: "자체 제작",
    license: "프로젝트 자체 제작물",
  },
  "load-cell-bridge": {
    id: "load-cell-bridge",
    title: "스트레인게이지 로드셀 신호 흐름",
    altText: "하중이 탄성체를 변형하고 네 개의 스트레인게이지 브리지 출력으로 변환되는 흐름도",
    description: "하중에서 브리지 전압까지의 변환 단계를 보여 주는 자체 제작 도식입니다.",
    source: "자체 제작",
    license: "프로젝트 자체 제작물",
  },
  "welding-joint-heat-input": {
    id: "welding-joint-heat-input",
    title: "용접이음과 입열 증감관계",
    altText: "맞대기와 필릿 용접이음 단면, 전압 전류 속도에 따른 입열 증감관계",
    description: "이음형상과 입열식을 한 화면에서 비교하는 자체 제작 도식입니다.",
    source: "자체 제작",
    license: "프로젝트 자체 제작물",
  },
  "welding-ndt-map": {
    id: "welding-ndt-map",
    title: "결함 위치별 비파괴검사 선택도",
    altText: "표면개구, 강자성체 근표면, 내부 평면성과 체적성 결함을 PT MT UT RT에 연결한 지도",
    description: "결함 위치와 재료조건을 먼저 묻는 자체 제작 검사선택도입니다.",
    source: "자체 제작",
    license: "프로젝트 자체 제작물",
  },
  "stress-strain-material-test": {
    id: "stress-strain-material-test",
    title: "응력–변형률선도와 재료시험",
    altText: "탄성구간, 항복, 인장강도, 파단을 표시하고 인장 경도 충격 피로시험을 비교한 그림",
    description: "선도의 구간과 재료시험의 측정대상을 연결하는 자체 제작 도식입니다.",
    source: "자체 제작",
    license: "프로젝트 자체 제작물",
  },
  "lubrication-management-loop": {
    id: "lubrication-management-loop",
    title: "윤활개소·급유량·급유주기 관리순환",
    altText: "윤활개소 식별, 윤활제 선정, 기준량과 주기 설정, 상태 확인, 기록과 보정의 순환도",
    description: "윤활관리의 반복 흐름을 보여 주는 자체 제작 도식입니다.",
    source: "자체 제작",
    license: "프로젝트 자체 제작물",
  },
};

export function SupplementalVisualAid({ visualAidId }: { visualAidId: string }) {
  if (!isSupplementalVisualAidId(visualAidId)) return null;
  const metadata = supplementalVisualAidRegistry[visualAidId];
  const visual = {
    "hydraulic-bleed-sync": <HydraulicBleedSyncVisual />,
    "load-cell-bridge": <LoadCellBridgeVisual />,
    "welding-joint-heat-input": <WeldingJointHeatInputVisual />,
    "welding-ndt-map": <WeldingNdtVisual />,
    "stress-strain-material-test": <StressStrainVisual />,
    "lubrication-management-loop": <LubricationLoopVisual />,
  }[visualAidId];

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-[#c8dcdf] bg-white shadow-sm">
      <div className="border-b border-[#dce9eb] bg-[#f5fafb] px-4 py-3 sm:px-5">
        <p className="text-xs font-black tracking-[0.14em] text-[#16697a]">개념 시각자료</p>
        <h2 className="mt-1 text-lg font-extrabold text-[#173957]">{metadata.title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{metadata.description}</p>
      </div>
      <div
        className="overflow-x-auto p-3 sm:p-5"
        role="img"
        aria-label={metadata.altText}
        tabIndex={0}
        data-testid={`supplemental-visual-${visualAidId}`}
      >
        {visual}
      </div>
      <figcaption className="border-t border-[#e1ecee] px-4 py-3 text-xs font-semibold text-slate-500 sm:px-5">
        출처: {metadata.source} · 라이선스: {metadata.license}
      </figcaption>
    </figure>
  );
}

function isSupplementalVisualAidId(value: string): value is SupplementalVisualAidId {
  return value in supplementalVisualAidRegistry;
}

function SvgShell({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return (
    <svg viewBox="0 0 720 360" className="h-auto min-w-[560px] w-full" aria-hidden="true">
      <title>{title}</title>
      <desc>{description}</desc>
      <rect x="8" y="8" width="704" height="344" rx="22" fill="#f8fbfc" stroke="#c7dfe1" />
      {children}
    </svg>
  );
}

function Arrow({ x1, y1, x2, y2, color = "#16697a" }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const ax = x2 - 12 * Math.cos(angle);
  const ay = y2 - 12 * Math.sin(angle);
  return (
    <g>
      <line x1={x1} y1={y1} x2={ax} y2={ay} stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path
        d={`M ${x2} ${y2} L ${ax - 7 * Math.sin(angle)} ${ay + 7 * Math.cos(angle)} L ${ax + 7 * Math.sin(angle)} ${ay - 7 * Math.cos(angle)} Z`}
        fill={color}
      />
    </g>
  );
}

function Box({ x, y, width, label, sub, fill = "#e7f4f3" }: { x: number; y: number; width: number; label: string; sub?: string; fill?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height="62" rx="13" fill={fill} stroke="#597b85" strokeWidth="2" />
      <text x={x + width / 2} y={y + 27} textAnchor="middle" className="fill-[#173957] text-[15px] font-bold">
        {label}
      </text>
      {sub ? (
        <text x={x + width / 2} y={y + 47} textAnchor="middle" className="fill-slate-600 text-[11px] font-semibold">
          {sub}
        </text>
      ) : null}
    </g>
  );
}

function HydraulicBleedSyncVisual() {
  return (
    <SvgShell title="블리드오프와 동기회로" description="유량 우회와 복수 실린더 위치보정 비교">
      <text x="32" y="45" className="fill-[#173957] text-[18px] font-extrabold">블리드오프</text>
      <Box x={32} y={72} width={120} label="펌프 Qp" />
      <Box x={278} y={72} width={128} label="실린더 Qa" sub="v = Qa/A" />
      <Box x={278} y={178} width={128} label="탱크 Qb" sub="우회 유량" fill="#fff1e7" />
      <Arrow x1={152} y1={103} x2={278} y2={103} />
      <Arrow x1={215} y1={105} x2={278} y2={209} color="#b45309" />
      <text x="172" y="84" className="fill-slate-600 text-[12px] font-bold">Qp = Qa + Qb</text>
      <line x1="438" y1="34" x2="438" y2="326" stroke="#d4e3e6" strokeWidth="2" />
      <text x="466" y="45" className="fill-[#173957] text-[18px] font-extrabold">복수 실린더 동기</text>
      <Box x={478} y={78} width={92} label="실린더 A" />
      <Box x={604} y={78} width={92} label="실린더 B" />
      <Box x={526} y={194} width={122} label="분배·피드백" sub="오차 보정" fill="#e9e7fb" />
      <Arrow x1={552} y1={194} x2={530} y2={140} color="#6d28d9" />
      <Arrow x1={622} y1={194} x2={650} y2={140} color="#6d28d9" />
      <text x="587" y="292" textAnchor="middle" className="fill-slate-600 text-[13px] font-bold">
        같은 압력 ≠ 자동으로 같은 행정
      </text>
    </SvgShell>
  );
}

function LoadCellBridgeVisual() {
  return (
    <SvgShell title="로드셀 신호 흐름" description="하중에서 탄성체 변형과 브리지 출력까지의 단계">
      <Box x={34} y={144} width={116} label="하중 F" />
      <Box x={194} y={144} width={126} label="탄성체" sub="미세 변형 ε" />
      <Box x={364} y={144} width={140} label="스트레인게이지" sub="ΔR/R = GF·ε" />
      <Box x={548} y={144} width={138} label="브리지 출력" sub="차동 전압" fill="#e9e7fb" />
      <Arrow x1={150} y1={175} x2={194} y2={175} />
      <Arrow x1={320} y1={175} x2={364} y2={175} />
      <Arrow x1={504} y1={175} x2={548} y2={175} />
      <path d="M398 86 L430 54 L462 86 L430 118 Z" fill="none" stroke="#b45309" strokeWidth="4" />
      <circle cx="430" cy="54" r="5" fill="#b45309" />
      <circle cx="462" cy="86" r="5" fill="#b45309" />
      <circle cx="430" cy="118" r="5" fill="#b45309" />
      <circle cx="398" cy="86" r="5" fill="#b45309" />
      <text x="430" y="36" textAnchor="middle" className="fill-[#8f3f0a] text-[13px] font-bold">
        휘트스톤 브리지
      </text>
      <text x="360" y="274" textAnchor="middle" className="fill-slate-600 text-[14px] font-bold">
        선정: 정격하중 · 하중방향 · 편심 · 온도 · 과부하 · 설치강성
      </text>
    </SvgShell>
  );
}

function WeldingJointHeatInputVisual() {
  return (
    <SvgShell title="용접이음과 입열" description="맞대기와 필릿 이음, 입열 증감관계">
      <text x="45" y="49" className="fill-[#173957] text-[18px] font-extrabold">이음 단면</text>
      <rect x="44" y="100" width="116" height="30" fill="#c9d5da" stroke="#173957" />
      <rect x="176" y="100" width="116" height="30" fill="#c9d5da" stroke="#173957" />
      <path d="M160 100 L176 100 L168 122 Z" fill="#f3a76f" stroke="#8f3f0a" strokeWidth="2" />
      <text x="168" y="158" textAnchor="middle" className="fill-slate-600 text-[13px] font-bold">맞대기이음</text>
      <rect x="64" y="220" width="188" height="26" fill="#c9d5da" stroke="#173957" />
      <rect x="146" y="158" width="26" height="62" fill="#c9d5da" stroke="#173957" />
      <path d="M172 220 L205 220 L172 187 Z" fill="#f3a76f" stroke="#8f3f0a" strokeWidth="2" />
      <text x="168" y="275" textAnchor="middle" className="fill-slate-600 text-[13px] font-bold">T이음의 필릿용접</text>
      <line x1="330" y1="34" x2="330" y2="326" stroke="#d4e3e6" strokeWidth="2" />
      <text x="372" y="55" className="fill-[#173957] text-[18px] font-extrabold">단위길이 입열</text>
      <text x="520" y="118" textAnchor="middle" className="fill-[#8f3f0a] text-[28px] font-black">
        H = ηVI / v
      </text>
      <Box x={378} y={162} width={90} label="V ↑" sub="입열 ↑" />
      <Box x={482} y={162} width={90} label="I ↑" sub="입열 ↑" />
      <Box x={586} y={162} width={90} label="v ↑" sub="입열 ↓" fill="#fff1e7" />
      <text x="526" y="277" textAnchor="middle" className="fill-slate-600 text-[13px] font-bold">
        실제 허용범위는 승인 WPS와 적용 코드 확인
      </text>
    </SvgShell>
  );
}

function WeldingNdtVisual() {
  const rows = [
    ["표면에 열린 불연속", "PT", "비다공성 재료"],
    ["강자성체 표면·근표면", "MT", "재료 제한"],
    ["내부 평면성 불연속", "UT", "방향·교정 영향"],
    ["내부 체적성 불연속", "RT", "방사선 안전"],
  ];
  return (
    <SvgShell title="비파괴검사 선택도" description="결함 위치와 재료에 따른 PT MT UT RT 비교">
      <text x="50" y="52" className="fill-[#173957] text-[18px] font-extrabold">관찰 조건</text>
      <text x="335" y="52" className="fill-[#173957] text-[18px] font-extrabold">1차 선택</text>
      <text x="500" y="52" className="fill-[#173957] text-[18px] font-extrabold">확인할 제한</text>
      {rows.map(([condition, method, limit], index) => {
        const y = 82 + index * 64;
        return (
          <g key={method}>
            <rect x="40" y={y} width="250" height="46" rx="10" fill="#e7f4f3" stroke="#8fb3b7" />
            <text x="165" y={y + 29} textAnchor="middle" className="fill-[#173957] text-[14px] font-bold">{condition}</text>
            <Arrow x1={292} y1={y + 23} x2={342} y2={y + 23} />
            <circle cx="380" cy={y + 23} r="24" fill="#16697a" />
            <text x="380" y={y + 30} textAnchor="middle" className="fill-white text-[17px] font-black">{method}</text>
            <rect x="440" y={y} width="230" height="46" rx="10" fill="#fff1e7" stroke="#d9a06e" />
            <text x="555" y={y + 29} textAnchor="middle" className="fill-[#7c3d12] text-[13px] font-bold">{limit}</text>
          </g>
        );
      })}
    </SvgShell>
  );
}

function StressStrainVisual() {
  return (
    <SvgShell title="응력 변형률 선도" description="탄성, 항복, 인장강도, 파단과 재료시험 비교">
      <line x1="66" y1="286" x2="414" y2="286" stroke="#173957" strokeWidth="3" />
      <line x1="66" y1="286" x2="66" y2="46" stroke="#173957" strokeWidth="3" />
      <path d="M68 284 L165 134 C190 103 223 124 246 112 C278 92 312 66 343 80 C377 94 386 148 402 190" fill="none" stroke="#b45309" strokeWidth="6" strokeLinecap="round" />
      <circle cx="165" cy="134" r="6" fill="#16697a" />
      <circle cx="343" cy="80" r="6" fill="#16697a" />
      <circle cx="402" cy="190" r="6" fill="#16697a" />
      <text x="148" y="117" className="fill-[#173957] text-[12px] font-bold">항복</text>
      <text x="320" y="61" className="fill-[#173957] text-[12px] font-bold">인장강도</text>
      <text x="390" y="215" className="fill-[#173957] text-[12px] font-bold">파단</text>
      <text x="375" y="313" className="fill-slate-600 text-[13px] font-bold">변형률 ε</text>
      <text x="24" y="62" className="fill-slate-600 text-[13px] font-bold">응력 σ</text>
      <line x1="450" y1="34" x2="450" y2="326" stroke="#d4e3e6" strokeWidth="2" />
      <Box x={484} y={58} width={190} label="인장시험" sub="항복·강도·연신" />
      <Box x={484} y={130} width={190} label="경도시험" sub="압입·반발 저항" />
      <Box x={484} y={202} width={190} label="충격시험" sub="빠른 하중의 흡수에너지" />
      <Box x={484} y={274} width={190} label="피로시험" sub="반복응력과 수명" />
    </SvgShell>
  );
}

function LubricationLoopVisual() {
  const points = [
    [360, 58, "개소 식별"],
    [564, 128, "윤활제 선정"],
    [516, 258, "량·주기 설정"],
    [204, 258, "상태 확인"],
    [156, 128, "기록·보정"],
  ] as const;
  return (
    <SvgShell title="윤활관리 순환" description="개소 식별에서 기록 보정까지의 순환">
      {points.map(([x, y, label], index) => {
        const next = points[(index + 1) % points.length];
        return (
          <g key={label}>
            <circle cx={x} cy={y} r="48" fill={index === 2 ? "#fff1e7" : "#e7f4f3"} stroke="#597b85" strokeWidth="2" />
            <text x={x} y={y + 5} textAnchor="middle" className="fill-[#173957] text-[14px] font-bold">{label}</text>
            <Arrow x1={x} y1={y} x2={next[0]} y2={next[1]} color="#6d28d9" />
          </g>
        );
      })}
      <circle cx="360" cy="174" r="59" fill="#173957" />
      <text x="360" y="167" textAnchor="middle" className="fill-white text-[17px] font-black">적정 윤활</text>
      <text x="360" y="191" textAnchor="middle" className="fill-[#d9eef0] text-[12px] font-bold">과소·과다 모두 확인</text>
    </SvgShell>
  );
}
