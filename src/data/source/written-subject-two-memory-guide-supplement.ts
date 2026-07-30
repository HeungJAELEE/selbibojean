import type { SubjectTwoMemoryBundle } from "@/data/source/written-subject-two-memory-guide";

export const WRITTEN_SUBJECT_TWO_MEMORY_GUIDE_SUPPLEMENT: SubjectTwoMemoryBundle[] =
  [
    {
      id: "pressure-welding-process-details",
      part: "용접 기초",
      title: "저항·마찰·냉간·초음파 압접 세분류",
      memoryLine:
        "압접은 압력을 공통 기준으로 두고, 접촉저항열·마찰열·상온 소성변형·초음파 진동처럼 보조 에너지원을 구분합니다.",
      facts: [
        {
          id: "s2-pressure-welding-process-details-three-elements",
          cue: "저항용접 3요소",
          answer:
            "용접전류, 통전시간, 가압력이 너깃 형성과 접촉상태를 함께 결정합니다.",
          detailLessonTitles: ["저항용접"],
        },
        {
          id: "s2-pressure-welding-process-details-spot-seam",
          cue: "점·심 용접",
          answer:
            "점용접은 겹친 판재에 개별 너깃을 만들고, 심용접은 롤러 전극으로 너깃을 연속 중첩해 기밀·수밀 이음을 만듭니다.",
          detailLessonTitles: ["저항용접"],
        },
        {
          id: "s2-pressure-welding-process-details-projection",
          cue: "프로젝션 용접",
          answer:
            "모재의 돌기에 전류와 압력을 집중해 여러 용접점을 동시에 형성하는 저항용접입니다.",
          detailLessonTitles: ["저항용접"],
        },
        {
          id: "s2-pressure-welding-process-details-butt",
          cue: "업셋·플래시버트",
          answer:
            "업셋용접은 접촉상태에서 저항가열 후 가압하고, 플래시버트용접은 단면 사이 플래시로 가열한 뒤 업셋합니다.",
          detailLessonTitles: ["저항·가스·특수용접의 구분"],
        },
        {
          id: "s2-pressure-welding-process-details-solid-state",
          cue: "마찰·냉간·초음파",
          answer:
            "마찰용접은 상대운동의 마찰열, 냉간압접은 상온의 큰 소성변형, 초음파용접은 고주파 진동과 가압력을 이용합니다.",
          detailLessonTitles: ["저항·가스·특수용접의 구분"],
        },
      ],
      traps: [
        {
          statement: "저항용접은 전류만 크면 되므로 통전시간과 가압력은 품질과 무관하다.",
          correction:
            "세 요소가 함께 너깃 크기와 접촉저항을 결정하므로 하나만으로 판단할 수 없습니다.",
        },
        {
          statement: "심 용접은 롤러 전극을 사용하지만 점 용접과 달리 압력을 사용하지 않는다.",
          correction:
            "심 용접도 저항용접이므로 전류·통전시간·가압력을 함께 사용합니다.",
        },
        {
          statement: "냉간압접은 모재를 완전히 용융시켜 접합하는 융접이다.",
          correction:
            "냉간압접은 상온에서 큰 압력으로 접합면을 소성변형시키는 압접입니다.",
        },
      ],
      detailLessonTitles: [
        "저항용접",
        "저항·가스·특수용접의 구분",
      ],
    },
    {
      id: "electrode-flame-heat-input-details",
      part: "용접 기초",
      title: "피복봉 표시·극성·불꽃·입열",
      memoryLine:
        "용접봉 표시는 항목별로, 직류 극성은 전극·모재 연결로, 불꽃과 입열은 재료·냉각조건으로 나누어 읽습니다.",
      facts: [
        {
          id: "s2-electrode-flame-heat-input-details-code",
          cue: "피복봉 표시",
          answer:
            "규격 표시는 인장강도, 용접자세, 피복계통과 사용전류 등을 정해진 표준 항목 순서로 판독하며 임의로 숫자 뜻을 바꾸지 않습니다.",
          detailLessonTitles: ["피복아크용접(SMAW)"],
        },
        {
          id: "s2-electrode-flame-heat-input-details-low-hydrogen",
          cue: "저수소계 관리",
          answer:
            "확산성 수소를 줄여 후판·고장력강·구속이 큰 이음의 균열 위험을 낮추며 제조사 건조·보관 지침을 지킵니다.",
          detailLessonTitles: ["피복아크용접(SMAW)"],
        },
        {
          id: "s2-electrode-flame-heat-input-details-polarity",
          cue: "DCEN·DCEP",
          answer:
            "DCEN은 전극 음극·모재 양극, DCEP는 전극 양극·모재 음극이며 공정과 전극에 따라 열분포·용입·청정작용이 달라집니다.",
          detailLessonTitles: ["직류용접 극성"],
        },
        {
          id: "s2-electrode-flame-heat-input-details-flames",
          cue: "중성·산화·탄화 불꽃",
          answer:
            "중성불꽃은 산소와 연료가스가 균형을 이루고, 산화불꽃은 산소 과잉, 탄화불꽃은 연료가스 과잉 상태입니다.",
          detailLessonTitles: ["저항·가스·특수용접의 구분"],
        },
        {
          id: "s2-electrode-flame-heat-input-details-heat-input",
          cue: "입열·냉각속도",
          answer:
            "전압·전류가 커지고 진행속도가 느려질수록 단위길이당 입열이 커지며, 입열과 예열·판두께는 냉각속도와 조직에 영향을 줍니다.",
          detailLessonTitles: ["용접이음·기호와 용접입열"],
        },
      ],
      traps: [
        {
          statement: "피복봉 표시의 모든 숫자는 용접봉 지름과 길이만 뜻한다.",
          correction:
            "강도·자세·피복계통·전류조건 등 규격 항목이 함께 있으므로 항목 위치별로 판독해야 합니다.",
        },
        {
          statement: "DCEP와 DCEN은 전극과 모재의 연결이 같고 이름만 다르다.",
          correction:
            "전극의 양·음극 연결이 서로 반대이며 공정 특성도 달라집니다.",
        },
        {
          statement: "진행속도가 빨라질수록 단위길이당 용접입열이 항상 증가한다.",
          correction:
            "전압·전류가 같다면 진행속도가 빨라질수록 단위길이당 입열은 감소합니다.",
        },
      ],
      detailLessonTitles: [
        "피복아크용접(SMAW)",
        "직류용접 극성",
        "저항·가스·특수용접의 구분",
        "용접이음·기호와 용접입열",
      ],
    },
    {
      id: "advanced-arc-process-controls",
      part: "아크·특수용접",
      title: "TIG·MIG·CO₂·SAW 공정 제어",
      memoryLine:
        "전극·차폐·전원특성과 송급·가스·플럭스 제어가 각 공정의 품질과 적용 범위를 결정합니다.",
      facts: [
        {
          id: "s2-advanced-arc-process-controls-tig",
          cue: "TIG 청정·전류조건",
          answer:
            "비소모성 텅스텐 전극을 사용하며 알루미늄 산화막 제거에는 교류 또는 적절한 전극양극 구간의 청정작용을 활용합니다.",
          detailLessonTitles: ["TIG용접(GTAW)"],
        },
        {
          id: "s2-advanced-arc-process-controls-mig",
          cue: "MIG 자기제어·송급",
          answer:
            "정전압 전원과 정속 와이어 송급의 조합으로 아크길이가 스스로 회복되는 특성을 이용하며 푸시·풀·푸시풀 송급을 구분합니다.",
          detailLessonTitles: ["MIG·MAG·CO₂용접(GMAW)"],
        },
        {
          id: "s2-advanced-arc-process-controls-co2",
          cue: "CO₂ 탈산·차폐",
          answer:
            "CO₂의 산화성에 대응해 망간·규소계 탈산 원소를 포함한 와이어를 사용하고 바람·누설·환기 상태를 관리합니다.",
          detailLessonTitles: ["CO₂ 아크용접", "아크용접 차폐 조건"],
        },
        {
          id: "s2-advanced-arc-process-controls-saw",
          cue: "SAW 플럭스·헤드",
          answer:
            "입상 플럭스 아래에서 아크를 유지하며 와이어 송급·접촉팁·플럭스 공급·주행과 용접선 추적을 함께 제어합니다.",
          detailLessonTitles: ["서브머지드아크용접(SAW)"],
        },
        {
          id: "s2-advanced-arc-process-controls-special",
          cue: "플라즈마·전자빔·레이저·슬래그",
          answer:
            "플라즈마는 수축아크, 전자빔은 진공 중 전자충돌, 레이저는 집속광, 일렉트로슬래그는 용융슬래그 저항열을 주열원으로 합니다.",
          detailLessonTitles: ["플라즈마 아크용접", "저항·가스·특수용접의 구분"],
        },
      ],
      traps: [
        {
          statement: "MIG의 아크길이 자기제어는 정전류 전원과 수동 용접봉 교환으로 이루어진다.",
          correction:
            "일반적인 GMAW는 정전압 전원과 연속 와이어 정속송급의 조합을 사용합니다.",
        },
        {
          statement: "CO₂ 용접은 차폐가스가 있으므로 바람과 환기를 동시에 무시해도 된다.",
          correction:
            "바람은 차폐를 깨뜨리고 환기 불량은 흄·가스 노출을 키우므로 둘 다 관리해야 합니다.",
        },
        {
          statement: "일렉트로슬래그 용접의 주열원은 항상 노출된 아크열이다.",
          correction:
            "정상 용접 구간의 주열원은 용융 슬래그를 통과하는 전류의 저항열입니다.",
        },
      ],
      detailLessonTitles: [
        "TIG용접(GTAW)",
        "MIG·MAG·CO₂용접(GMAW)",
        "CO₂ 아크용접",
        "아크용접 차폐 조건",
        "서브머지드아크용접(SAW)",
        "플라즈마 아크용접",
        "저항·가스·특수용접의 구분",
      ],
    },
    {
      id: "ppe-classification-details",
      part: "산업안전",
      title: "안전모·안전화·호흡·눈·청력 보호구",
      memoryLine:
        "보호구의 기호나 재질을 외우기 전에 낙하·추락·감전·화학·분진·광선·소음 중 어떤 위험을 막는지 연결합니다.",
      facts: [
        {
          id: "s2-ppe-classification-details-helmet",
          cue: "안전모",
          answer:
            "낙하·비래, 추락, 감전 등 인증된 보호 성능과 작업 위험을 맞추고 턱끈·외관·사용기한을 점검합니다.",
          detailLessonTitles: ["소음·열·보호구 호환성"],
        },
        {
          id: "s2-ppe-classification-details-footwear",
          cue: "안전화",
          answer:
            "낙하·충격·찔림, 물·화학물질, 감전, 정전기 등 위험에 따라 가죽제·고무제·절연·정전기용을 구분합니다.",
          detailLessonTitles: ["소음·열·보호구 호환성"],
        },
        {
          id: "s2-ppe-classification-details-respirator",
          cue: "방진·방독·송기",
          answer:
            "분진에는 방진, 특정 유해가스에는 적합 정화통의 방독, 산소결핍 우려 장소에는 외부 공기를 공급하는 송기식 등급을 검토합니다.",
          detailLessonTitles: ["호흡보호구와 2차노출", "밀폐공간 가스측정·감시인"],
        },
        {
          id: "s2-ppe-classification-details-eye-face",
          cue: "차광면·보안경",
          answer:
            "아크광선에는 전류와 공정에 맞는 차광필터를 사용하고, 칩·비산물 위험에는 충격보호 성능의 보안경·안면보호구를 선택합니다.",
          detailLessonTitles: ["용접면·차광필터 선정", "주변작업자 아크광선 보호"],
        },
        {
          id: "s2-ppe-classification-details-glove-hearing",
          cue: "장갑·청력보호",
          answer:
            "용접·열·전기 위험에는 적합 장갑을 쓰되 회전체 말림 위험에서는 장갑을 금지하고, 경보·신호 청취가 필요한 작업은 청력보호구와 의사소통 대책을 함께 검토합니다.",
          detailLessonTitles: ["소음·열·보호구 호환성", "습윤 보호구와 용접 보호복"],
        },
      ],
      traps: [
        {
          statement: "보호구는 작업 종류와 무관하므로 가장 기능이 많은 하나만 항상 쓰면 된다.",
          correction:
            "보호구는 위험성평가와 인증 용도에 맞춰 선택하고 서로 간섭하는 조합도 확인해야 합니다.",
        },
        {
          statement: "산소결핍 장소에서는 방진마스크 필터만 새것이면 충분하다.",
          correction:
            "방진마스크는 산소를 공급하지 못하므로 산소농도 측정과 적합한 송기·공기호흡 대책이 필요합니다.",
        },
        {
          statement: "회전 중인 드릴 작업에는 손 보호를 위해 헐거운 장갑을 반드시 낀다.",
          correction:
            "장갑이 회전체에 말려들 수 있으므로 정지·격리와 지정 공구 사용 원칙을 우선합니다.",
        },
      ],
      detailLessonTitles: [
        "소음·열·보호구 호환성",
        "호흡보호구와 2차노출",
        "밀폐공간 가스측정·감시인",
        "용접면·차광필터 선정",
        "주변작업자 아크광선 보호",
        "습윤 보호구와 용접 보호복",
      ],
      cbtStatusNote:
        "안전모·안전화·호흡·눈·청력 보호구를 직접 판단하는 공개·검수 완료 CBT 원문은 현재 문제셋에서 확인되지 않았습니다. 일반 용접 문항을 대신 붙이지 않습니다.",
    },
    {
      id: "safety-sign-fire-details",
      part: "산업안전",
      title: "안전색·연소 3요소·화재등급·소화기",
      memoryLine:
        "표지색은 행동 의미로, 화재는 타는 물질과 통전 여부로 구분한 뒤 적응 소화설비를 선택합니다.",
      facts: [
        {
          id: "s2-safety-sign-fire-details-red-yellow",
          cue: "빨강·노랑",
          answer:
            "빨강은 금지·정지·화재 관련, 노랑은 위험 경고 의미로 사용하며 표지의 형상과 그림문자도 함께 판독합니다.",
          detailLessonTitles: ["안전표지"],
        },
        {
          id: "s2-safety-sign-fire-details-blue-green",
          cue: "파랑·녹색",
          answer:
            "파랑은 보호구 착용 같은 지시, 녹색은 피난·구호·안전상태 안내 의미로 사용합니다.",
          detailLessonTitles: ["안전표지"],
        },
        {
          id: "s2-safety-sign-fire-details-combustion",
          cue: "연소 3요소",
          answer:
            "가연물, 산소공급원, 점화원이 함께 있어야 연소가 지속되며 제거·질식·냉각 등은 이 연결을 끊습니다.",
          detailLessonTitles: ["소화·비상정지·잔류위험"],
        },
        {
          id: "s2-safety-sign-fire-details-classes",
          cue: "A·B·C·D 화재",
          answer:
            "일반가연물, 인화성 액체, 통전 전기설비, 가연성 금속처럼 타는 대상과 상태를 먼저 구분합니다.",
          detailLessonTitles: ["소화·비상정지·잔류위험"],
        },
        {
          id: "s2-safety-sign-fire-details-extinguisher",
          cue: "적응 소화기",
          answer:
            "소화기 라벨의 적응 화재 표시를 확인하고 전기·유류·금속 화재에 물이나 부적합 약제를 임의 사용하지 않습니다.",
          detailLessonTitles: ["소화·비상정지·잔류위험"],
        },
      ],
      traps: [
        {
          statement: "노란색 안전표지는 보호구를 반드시 착용하라는 지시만 뜻한다.",
          correction:
            "노랑은 경고, 파랑은 지시 의미를 중심으로 구분합니다.",
        },
        {
          statement: "통전 중 전기설비 화재는 냉각 효과가 큰 물을 먼저 분사한다.",
          correction:
            "감전과 단락 위험이 있으므로 전원을 차단하고 적응성이 표시된 소화설비를 사용합니다.",
        },
        {
          statement: "가연성 금속화재는 일반 분말소화기면 종류와 관계없이 모두 진압된다.",
          correction:
            "금속 종류에 맞는 전용 소화약제와 작업표준을 확인해야 합니다.",
        },
      ],
      detailLessonTitles: ["안전표지", "소화·비상정지·잔류위험"],
      cbtStatusNote:
        "안전색·연소 3요소·화재등급을 직접 판단하는 공개·검수 완료 CBT 원문은 현재 문제셋에서 확인되지 않았습니다. 키워드만 겹치는 안전 문항은 대신 붙이지 않습니다.",
    },
    {
      id: "gas-cylinder-flashback-details",
      part: "산업안전",
      title: "가스용기·누설·역류·역화·인화",
      memoryLine:
        "가스의 가연성·조연성, 용기 식별, 압력차와 불꽃 진행 경로를 분리해 사고 단계와 차단 순서를 판단합니다.",
      facts: [
        {
          id: "s2-gas-cylinder-flashback-details-oxygen",
          cue: "산소계통",
          answer:
            "산소는 조연성 가스이므로 밸브·조정기·호스에 기름과 그리스가 닿지 않게 하고 산소 전용 청정 부품을 사용합니다.",
          detailLessonTitles: ["산소계통 청정과 조정기"],
        },
        {
          id: "s2-gas-cylinder-flashback-details-acetylene",
          cue: "아세틸렌",
          answer:
            "가연성 가스로 용기를 세워 고정하고 누설·과열·재질 적합성과 역화방지장치를 작업표준에 따라 관리합니다.",
          detailLessonTitles: ["아세틸렌 누설·동결·재질적합성"],
        },
        {
          id: "s2-gas-cylinder-flashback-details-identification",
          cue: "용기 식별·보관",
          answer:
            "용기 몸체 색만 믿지 말고 명칭·라벨·밸브·검사표지를 확인하며 전도·충격·열원·혼재보관 위험을 통제합니다.",
          detailLessonTitles: ["가스용기 식별·보관·운반"],
        },
        {
          id: "s2-gas-cylinder-flashback-details-leak",
          cue: "누설 점검",
          answer:
            "연결부는 승인된 누설검지액 등 비점화 방법으로 점검하고 불꽃으로 누설을 찾지 않습니다.",
          detailLessonTitles: ["가스호스·연결부·누설"],
        },
        {
          id: "s2-gas-cylinder-flashback-details-stages",
          cue: "역류·역화·인화",
          answer:
            "역류는 반대 계통으로의 가스 흐름, 역화는 팁 부근의 순간 불꽃 복귀, 인화는 혼합실·호스 쪽으로 불꽃이 지속 진행하는 위험상태입니다.",
          detailLessonTitles: ["가스호스·연결부·누설", "소화·비상정지·잔류위험"],
        },
      ],
      traps: [
        {
          statement: "산소는 스스로 잘 타는 연료가스이므로 아세틸렌과 같은 방식으로 취급한다.",
          correction:
            "산소는 연소를 강하게 돕는 조연성 가스이며 특히 유지류 오염을 엄격히 막아야 합니다.",
        },
        {
          statement: "가스 누설은 작은 불꽃을 가까이 대면 가장 빠르고 안전하게 확인할 수 있다.",
          correction:
            "점화원이 되어 폭발할 수 있으므로 승인된 비점화 누설검지 방법을 사용합니다.",
        },
        {
          statement: "역류·역화·인화는 모두 가스가 반대 호스로 흐르는 같은 현상이다.",
          correction:
            "가스 흐름의 역전과 불꽃의 순간 복귀·지속 진행은 서로 다른 위험단계입니다.",
        },
      ],
      detailLessonTitles: [
        "산소계통 청정과 조정기",
        "아세틸렌 누설·동결·재질적합성",
        "가스용기 식별·보관·운반",
        "가스호스·연결부·누설",
        "소화·비상정지·잔류위험",
      ],
      cbtStatusNote:
        "가스용기·누설·역류·역화·인화를 직접 판단하는 공개·검수 완료 CBT 원문은 현재 문제셋에서 확인되지 않았습니다. 다른 가스·안전 문항은 대신 붙이지 않습니다.",
    },
    {
      id: "machine-workplace-safety-details",
      part: "산업안전",
      title: "회전체·연삭기·프레스·압력설비·로봇",
      memoryLine:
        "말림·숫돌 파열·협착·과압·예기치 않은 기동처럼 에너지별 사고경로를 식별하고 정지·격리·방호 순으로 통제합니다.",
      facts: [
        {
          id: "s2-machine-workplace-safety-details-rotating",
          cue: "회전체 작업",
          answer:
            "선반·드릴·밀링은 정지 전 손·장갑·헐거운 복장을 가까이하지 않고 칩은 브러시 등 지정 공구로 제거합니다.",
          detailLessonTitles: ["연삭·자동화설비·작업장 관리"],
        },
        {
          id: "s2-machine-workplace-safety-details-grinder",
          cue: "연삭숫돌",
          answer:
            "규격·최고사용주속도·균열·플랜지·덮개·간극을 확인하고 교체 후에는 방호 위치에서 무부하 시운전합니다.",
          detailLessonTitles: ["연삭·자동화설비·작업장 관리"],
        },
        {
          id: "s2-machine-workplace-safety-details-press",
          cue: "프레스·롤러기",
          answer:
            "광전자식·양수조작·인터록·급정지장치는 위험점과 작업방식에 맞게 선정하고 임의 해제하지 않습니다.",
          detailLessonTitles: ["연삭·자동화설비·작업장 관리"],
        },
        {
          id: "s2-machine-workplace-safety-details-pressure",
          cue: "보일러·압력용기",
          answer:
            "저수위·과압·반응폭주·막힘·독성누출 위험을 구분하고 현행 법령·검사기준과 설비 최고사용압력에 맞는 방출장치를 유지합니다.",
          detailLessonTitles: ["보일러 안전밸브"],
        },
        {
          id: "s2-machine-workplace-safety-details-robot-workplace",
          cue: "로봇·작업장",
          answer:
            "로봇 가동영역은 방호울타리·인터록·비상정지와 안전한 교시 절차를 적용하고 통로·조명·환기는 현행 기준으로 관리합니다.",
          detailLessonTitles: ["연삭·자동화설비·작업장 관리"],
        },
      ],
      traps: [
        {
          statement: "연삭숫돌은 외관이 깨끗하면 규격과 균열 확인 없이 바로 최고속도로 운전한다.",
          correction:
            "장착 전 검사와 방호장치 확인, 교체 후 무부하 시운전 절차가 필요합니다.",
        },
        {
          statement: "프레스의 인터록은 생산 중 불편하면 작업자가 임의로 해제해도 된다.",
          correction:
            "방호장치 무효화는 협착 위험을 직접 키우므로 승인된 정비·격리 절차 없이 해제할 수 없습니다.",
        },
        {
          statement: "압력방출장치는 오래된 암기 수치만 맞으면 설비와 법령 확인이 필요 없다.",
          correction:
            "설비 최고사용압력, 유체·반응 특성, 현행 법령과 검사기준을 함께 확인해야 합니다.",
        },
      ],
      detailLessonTitles: ["연삭·자동화설비·작업장 관리", "보일러 안전밸브"],
    },
  ];
