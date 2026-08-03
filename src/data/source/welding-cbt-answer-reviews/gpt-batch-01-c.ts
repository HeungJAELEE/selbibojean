const AUTHOR = "gpt-batch-01-c";
const AUTHORED_AT = "2026-08-03T08:00:00.000Z";
const KOSHA = "https://www.kosha.or.kr/ebook/fcatalog/access/ecatalogt.jsp?Dir=554&callmode=normal&catimage=&eclang=ko&start=28&um=s";

type Item = { id: string; digest: string; lesson: "lesson-welding-safety-ppe" | "lesson-welding-safety-gas" | "lesson-welding-safety-electrical" | "lesson-welding-safety-ventilation" | "lesson-welding-safety-management"; block: "definition" | "principle" | "structure"; assertion: string; answer: string; steps: string[]; rule: string; notes: [string, string, string, string]; correct: number };

function entry(x: Item) {
  return {
    canonicalId: x.id, contentDigest: x.digest, authoringDisposition: "publish_candidate" as const, reviewStatus: "pending" as const, assessmentKind: "safety" as const,
    primaryLeafLessonId: x.lesson,
    conceptBinding: { lessonId: x.lesson, lessonBlockId: x.block, assertionText: x.assertion, evidenceRefs: [{ kind: "lesson_block" as const, ref: `${x.lesson}#${x.block}` }, { kind: "source_question" as const, ref: x.id }, { kind: "official_source" as const, ref: KOSHA }] },
    answerExplanation: x.answer, solutionSteps: x.steps, keyRule: x.rule,
    choiceFeedback: x.notes.map((rationale, choiceIndex) => {
      const isCorrect = choiceIndex === x.correct;
      const correctRationale = x.notes[x.correct];
      return {
        choiceIndex,
        relation: isCorrect ? "supports" as const : "refuted_by" as const,
        rationale,
        plausibleReason: isCorrect
          ? `문항의 위험원·조건과 직접 일치합니다: ${rationale}`
          : `혼동하기 쉬운 지점은 있지만, 이 보기의 판단 근거는 ${rationale}`,
        incorrectPoint: isCorrect
          ? null
          : `이 보기가 놓친 직접 판단 근거는 ${rationale}`,
        keyRule: isCorrect
          ? `정답 판단 기준: ${rationale}`
          : `이 보기의 구분 기준: ${rationale}`,
        differenceFromCorrect: isCorrect
          ? null
          : `정답 근거(${correctRationale})와 달리 이 보기는 ${rationale}`,
      };
    }),
    essentialRank: null, essentialRationale: null, holdReasons: [], author: AUTHOR, authoredAt: AUTHORED_AT, reviewer: null, reviewedAt: null,
  };
}

const GAS = "용기는 직사광선과 열원을 피해 표면온도를 40℃ 이하로 유지하고, 전도·낙하·충격을 막습니다.";
const ELECTRICAL = "교류 아크용접 작업자는 절연장갑을 착용하고 손상이 없는 절연형 용접봉 홀더를 사용합니다.";
const PPE = "개인보호구는 공학적·관리적 조치 후에도 남는 유해·위험요인으로부터 작업자의 신체를 보호하는 마지막 방어선입니다.";
const VENTILATION = "국소배기는 후드를 발생원 가까이에 두고 오염공기가 작업자의 얼굴을 지나가지 않도록 포집합니다.";

const WELDING_CBT_ANSWER_REVIEWS_GPT_BATCH_01_C_BASE = [
  entry({ id: "wcbt-aefa06ce-0765-4430-bc80-804aa0759444", digest: "ddc364fcbd6dd5933391487d2e45528e311016fc3767ce99357eb2616fb9337f", lesson: "lesson-welding-safety-ppe", block: "definition", assertion: PPE, correct: 2, answer: "틀린 보기는 앞치마와 팔덮개를 불편하므로 생략해도 된다는 세 번째 보기입니다. 불티·고온 금속에 노출되는 몸통과 팔은 작업 편의보다 보호가 우선입니다. 방독면은 확인된 유해가스의 종류·농도와 산소농도가 적정할 때만 맞는 정화통을 써야 하며, 산소결핍 또는 미지 농도에는 공기공급식 보호구가 필요합니다.", steps: ["위험원을 광선·불티·열·가스로 나눕니다.", "몸통과 팔의 열·불티 방호를 생략하는 보기를 찾습니다.", "세 번째 보기를 고릅니다."], rule: "보호구는 위험원에 맞춰 착용하며 불티·열 방호복을 작업 편의로 생략하지 않습니다.", notes: ["보호안경은 강한 광선과 비산 불티로부터 눈을 지키는 적합한 눈 보호구입니다.", "보호장갑은 뜨거운 모재와 불티의 화상 위험을 낮추므로 필요합니다.", "앞치마와 팔덮개를 빼면 몸통·팔이 불티와 열에 직접 노출됩니다.", "방독면은 산소가 충분하고 오염물질과 농도가 확인된 경우에만 해당 정화통으로 사용합니다."] }),
  entry({ id: "wcbt-ef348cef-a492-4e38-bce0-0e88807a2947", digest: "a28441d3e5a3e485d0e49264f72b73010e58fe75f200842122ca11d19b71995b", lesson: "lesson-welding-safety-ventilation", block: "principle", assertion: VENTILATION, correct: 1, answer: "용접흄을 실내에서 다룰 때 옳은 보기는 두 번째 환기설비 필요입니다. 흄은 발생원에서 포집·배기해 호흡영역으로 오기 전에 줄여야 합니다.", steps: ["흄의 노출 경로가 호흡기임을 확인합니다.", "국소배기와 일반환기의 목적을 대조합니다.", "두 번째 보기를 고릅니다."], rule: "용접흄은 발생원 가까이에서 포집하고 환기로 농도를 낮춥니다.", notes: ["흄은 아무리 마셔도 되는 물질이 아니며 노출 관리 대상입니다.", "실내에서는 환기설비가 흄 농도를 낮추는 공학적 조치입니다.", "용접봉·모재에 따라 흄 성분과 위험이 달라질 수 있습니다.", "가제마스크는 흄의 농도·누설·필터 성능을 보장하는 호흡보호구가 아닙니다."] }),
  entry({ id: "wcbt-dd5ec301-3faf-4cee-81b4-fdcecbe8dbf4", digest: "5093a0c5e695b1957c1c3c1fc32cf1d0b31ddf5d5f97acc0c12d463760c93e8f", lesson: "lesson-welding-safety-gas", block: "structure", assertion: GAS, correct: 0, answer: "틀린 보기는 산소용기를 70℃ 이하로 유지한다는 첫 번째 보기입니다. 이 복원 문항은 가스용기 표면온도 40℃ 이하 원칙과 충돌하므로 70℃를 안전 기준으로 삼을 수 없습니다.", steps: ["문항이 틀린 취급사항을 묻는지 확인합니다.", "40℃ 이하 원칙과 제시 온도를 비교합니다.", "첫 번째 보기를 고릅니다."], rule: "가스용기는 가열을 막고 표면온도를 40℃ 이하로 유지합니다.", notes: ["70℃는 가열 방지와 40℃ 이하 원칙을 벗어난 온도입니다.", "충격은 용기·밸브 손상과 누설 위험을 키우므로 피합니다.", "산소 계통의 기름은 급격한 산화 위험 때문에 묻히지 않습니다.", "직사광선은 용기 가열을 유발하므로 피합니다."] }),
  entry({ id: "wcbt-889870ba-3d06-4112-aae8-9975e6f8d278", digest: "2c8490efdcf5b363091af743532229266352185d081b38a9bb33a8ed72e3dded", lesson: "lesson-welding-safety-ppe", block: "definition", assertion: PPE, correct: 3, answer: "점용접에서도 눈 보호를 생략한다는 네 번째 보기가 틀립니다. 비산물과 강한 빛이 발생할 수 있으므로 보호안경을 포함한 눈 보호가 필요합니다.", steps: ["점용접의 광선·비산물 위험을 확인합니다.", "보호안경을 벗는 행동을 찾습니다.", "네 번째 보기를 고릅니다."], rule: "용접 작업에서는 광선과 비산물에 맞는 눈 보호구를 착용합니다.", notes: ["장갑은 열과 날카로운 판재 접촉 위험을 줄입니다.", "점용접기는 감전 예방을 위해 접지 상태를 확인합니다.", "판재의 기름 제거는 연기·화재와 용접 불량 위험을 줄입니다.", "보호안경 미착용은 눈을 광선과 비산물에 노출합니다."] }),
  entry({ id: "wcbt-e6235e1b-7977-454b-8d2c-b9028bcc494e", digest: "0e59e1dc465403ee8003e4a15076f4b876281ecd44e805933c30c50e1af087fe", lesson: "lesson-welding-safety-gas", block: "structure", assertion: GAS, correct: 1, answer: "가연성 가스와 산소용기를 함께 저장한다는 두 번째 보기가 잘못입니다. 누설 시 산소 농후 분위기가 연소를 격렬하게 만들 수 있으므로 종류별로 분리·고정합니다.", steps: ["산소가 연료가 아니라 조연성 가스임을 확인합니다.", "누설 시 가연성 가스와의 조합을 판단합니다.", "두 번째 보기를 고릅니다."], rule: "산소용기는 가연성 가스와 분리해 세워 고정하고 충격·유분을 피합니다.", notes: ["운반 중 충격 방지는 용기와 밸브 손상을 막습니다.", "가연성 가스와 함께 저장하면 누설 시 연소·폭발 위험이 커집니다.", "기름 묻은 손과 장갑은 산소 계통에 사용하지 않습니다.", "운반기구 사용은 전도와 충격 위험을 줄입니다."] }),
  entry({ id: "wcbt-5a2a8c7f-d685-499d-b9e7-c3bf5cffe5fc", digest: "701f82debde670660b29f0f12def6ff311e5fc071a31329797865a55df03b8f7", lesson: "lesson-welding-safety-ppe", block: "principle", assertion: "차광번호는 공정과 전류에 맞춰 선택합니다.", correct: 3, answer: "과거 시험용 복원표에서 100~300A 미만 아크용접의 핸드 실드 차광번호는 10~12인 네 번째 보기입니다. 이 수치는 현재 작업의 단독 선정 기준이 아니라 해당 복원표를 묻는 시험 답으로만 적용합니다.", steps: ["전류 범위가 100~300A 미만인지 확인합니다.", "과거 시험용 복원표의 범위와 대조합니다.", "네 번째 보기를 고릅니다."], rule: "차광번호 수치는 과거 시험용 복원표 범위로만 답하고 실제 작업은 공정·전류 조건을 다시 확인합니다.", notes: ["1~2는 해당 고전류 아크 범위의 복원표 번호가 아닙니다.", "5~6도 100~300A 미만 아크용접의 복원표 값보다 낮습니다.", "7~9는 이 문항의 복원표 범위와 일치하지 않습니다.", "10~12가 이 과거 시험용 복원표에서 제시한 범위입니다."] }),
  entry({ id: "wcbt-c9de7d4d-db9b-4956-9af7-a312bd3e7d4e", digest: "b2791426e145aeeb2ae12145368fee1002d26778c23f78c2a859400b238077bc", lesson: "lesson-welding-safety-gas", block: "principle", assertion: "작업 중 가스 압력의 갑작스러운 상승 방지를 위해 용기에 압력조정기를 설치합니다.", correct: 3, answer: "압력조정나사를 오른쪽으로 돌리면 스프링 힘이 다이어프램에 전달되어 밸브가 열리는 방향이므로 네 번째 보기입니다.", steps: ["조정나사의 회전이 스프링 힘을 바꾸는지 봅니다.", "스프링 힘 증가가 밸브 개방 방향인지 판단합니다.", "네 번째 보기를 고릅니다."], rule: "압력조정기는 조정나사와 밸브 작동으로 사용 압력을 제어합니다.", notes: ["잠김은 조정나사를 푸는 방향의 결과와 혼동한 것입니다.", "중립은 압력조정기의 밸브 개방 상태를 설명하지 못합니다.", "고정은 압력조정나사의 기능이 아닙니다.", "오른쪽 회전은 스프링 힘을 높여 밸브를 여는 방향입니다."] }),
  entry({ id: "wcbt-a396f176-3ffc-484f-a6ba-8c6f20e19d9a", digest: "fccea07650cfd14c3a8233fc7bd045f3905452efa055258cd4f692f3b1479a69", lesson: "lesson-welding-safety-gas", block: "principle", assertion: "산소 밸브와 조정기에는 기름·그리스를 묻히지 않고 밸브를 서서히 엽니다.", correct: 0, answer: "틀린 보기는 밸브에 기름을 칠한다는 첫 번째 보기입니다. 산소와 유분의 접촉은 급격한 산화·발화 위험을 키우므로 금지합니다.", steps: ["문항이 틀린 취급법을 묻는지 확인합니다.", "산소 계통의 유분 금지 원칙을 적용합니다.", "첫 번째 보기를 고릅니다."], rule: "산소 밸브·조정기에는 기름과 그리스를 묻히지 않습니다.", notes: ["밸브 윤활을 위한 기름칠은 산소 계통에서 금지됩니다.", "용기를 세워 두면 전도와 밸브 손상 위험을 줄입니다.", "비눗물 검사는 불꽃 없이 누설을 확인하는 방법입니다.", "화기에서 떨어뜨리면 가열과 점화 위험을 줄입니다."] }),
  entry({ id: "wcbt-88ee8d21-9fe9-45cc-8dc7-3578cba39e55", digest: "2a36c28d0bf392592b6876804b5f6c2001a5c447d6a4ab6cfce9a9246e6eeef7", lesson: "lesson-welding-safety-ppe", block: "principle", assertion: "차광번호는 공정과 전류에 맞춰 선택합니다.", correct: 0, answer: "과거 시험용 복원표에서 3.2mm 이하 산소-아세틸렌 용접의 차광번호는 4~5인 첫 번째 보기입니다. 실제 보호구 선정은 현장 광량·공정과 제조사 기준을 다시 확인해야 합니다.", steps: ["문항의 모재 두께와 가스용접 조건을 확인합니다.", "과거 시험용 복원표 범위와 대조합니다.", "첫 번째 보기를 고릅니다."], rule: "차광번호 수치는 과거 시험용 복원표에 한정하고 실제 작업은 조건별 기준을 확인합니다.", notes: ["4~5가 이 복원표의 3.2mm 이하 가스용접 범위입니다.", "6~7은 이 문항의 복원표 범위를 초과합니다.", "8~9도 더 높은 차광 범위로 제시된 값입니다.", "10~11은 이 얇은 모재 가스용접 복원표 값이 아닙니다."] }),
  entry({ id: "wcbt-b0dfbe58-d993-41c4-823c-44ad59114dea", digest: "a76c6f58632cd469fad0f15c02a3e4b671fbf1ece0c787d1e103f3cd2fc32b1a", lesson: "lesson-welding-safety-gas", block: "definition", assertion: "가스설비 안전은 고압 산소와 연료가스가 용기에서 조정기·호스·토치로 이동하는 전 과정에서 누설·혼합·역화·과압과 용기 과열을 방지하는 것입니다.", correct: 1, answer: "아세틸렌이 매우 안전한 화합물이라는 두 번째 보기가 틀립니다. 아세틸렌은 가연성이 크고 충격·마찰 및 특정 금속과의 접촉 조건에서 폭발 위험을 관리해야 합니다.", steps: ["문항이 틀린 위험성 설명을 묻는지 확인합니다.", "가연성·외력·금속 접촉 조건을 각각 대조합니다.", "두 번째 보기를 고릅니다."], rule: "아세틸렌은 가연성·반응성 위험을 전제로 누설·충격·부적합 금속 접촉을 관리합니다.", notes: ["아세틸렌은 쉽게 연소하는 연료가스입니다.", "매우 안전하다는 단정은 아세틸렌의 폭발 위험을 부정합니다.", "충격과 마찰은 불안정한 조건에서 폭발 위험을 키울 수 있습니다.", "구리·수은 계열과의 접촉은 폭발성 화합물 위험 때문에 피합니다."] }),
  entry({ id: "wcbt-461c229f-03d1-40e7-9517-38d030f73ed2", digest: "f8eff06e390b13bb67a262fbdf4989f0ca8996f5096c5afb672252a6f343dd2e", lesson: "lesson-welding-safety-electrical", block: "principle", assertion: ELECTRICAL, correct: 1, answer: "전격 방지와 가장 거리가 먼 보기는 접지선을 수도 배관에 연결한다는 두 번째 보기입니다. 접지선은 임의 배관이 아니라 규정된 접지단자·분전반의 접지에 연결해야 합니다.", steps: ["직접 접촉·누전 경로를 줄이는 조치인지 봅니다.", "임의 수도 배관 접지가 허용되는지 판단합니다.", "두 번째 보기를 고릅니다."], rule: "접지는 정해진 접지단자에 하고 손상 홀더·습윤 보호구·통전 방치를 피합니다.", notes: ["절연부 파손 홀더 교체는 손 접촉 전격을 줄입니다.", "수도 배관은 접지선의 대체 접지점으로 사용하지 않습니다.", "작업 중단 시 스위치 차단은 통전 상태를 제거합니다.", "젖은 장갑·작업복·신발은 절연 저항을 낮춰 위험합니다."] }),
  entry({ id: "wcbt-a17156b5-4223-4dfd-9e87-e354ef07a97c", digest: "c3205ffbf513d5a711b2734c89260f942feba2d9854ed4d4c307b80530ad0ef8", lesson: "lesson-welding-safety-ventilation", block: "principle", assertion: VENTILATION, correct: 2, answer: "탄산가스 아크용접의 중독 원인으로 묻는 정답은 일산화탄소(CO)인 세 번째 보기입니다. CO 중독은 CO 흡입 문제이고, CO₂가 축적되면 산소를 밀어내 산소결핍·질식 위험을 따로 만들 수 있으므로 두 위험을 같은 물질명으로 혼동하지 않습니다.", steps: ["문항이 중독 원인 가스를 묻는지 확인합니다.", "CO의 독성과 CO₂ 축적의 산소결핍 위험을 분리합니다.", "세 번째 보기를 고릅니다."], rule: "CO는 중독 위험, CO₂ 축적은 산소결핍 위험으로 구분하며 모두 환기·농도 확인이 필요합니다.", notes: ["수소는 이 문항의 CO 중독 원인 가스가 아닙니다.", "암모니아는 자극성·독성 가스이나 CO₂ 아크용접의 이 답이 아닙니다.", "CO는 헤모글로빈 결합으로 산소 운반을 방해하는 중독 가스입니다.", "아세틸렌은 연료가스이며 이 문항의 중독 원인으로 묻지 않습니다."] }),
  entry({ id: "wcbt-55c9a8ee-a23b-45a1-b611-931deadc3bb6", digest: "aad307eebf9d15fa50a89e684988cb1d170aa928ad4317e622a1ccc25e7b6b5c", lesson: "lesson-welding-safety-gas", block: "definition", assertion: "아세틸렌 용접장치의 배관 및 부속기구에는 구리나 구리 함유량이 70% 이상인 합금은 사용하지 않습니다.", correct: 0, answer: "아세틸렌과 접촉해 폭발성 화합물을 만드는 금속이 아닌 것은 철(Fe)인 첫 번째 보기입니다. 구리·은·수은은 아세틸라이드 위험 때문에 이 문항에서 피해야 할 금속으로 분류합니다.", steps: ["문항이 접촉 금속 중 예외를 묻는지 확인합니다.", "구리·은·수은과 철을 구분합니다.", "첫 번째 보기를 고릅니다."], rule: "아세틸렌 설비는 구리·은·수은 등 아세틸라이드 위험 금속과의 접촉을 피합니다.", notes: ["Fe는 이 문항에서 폭발성 아세틸라이드 생성 금속으로 제시된 예외입니다.", "Cu는 아세틸렌과의 반응성 때문에 피해야 하는 금속입니다.", "Ag도 아세틸라이드 형성 위험이 있어 예외가 아닙니다.", "Hg 역시 폭발성 화합물 위험 금속으로 분류됩니다."] }),
  entry({ id: "wcbt-ad55f62c-3029-46ef-a02a-c73c140e2c61", digest: "00610a6c3189c228fe0941f3776ed3f0a00cecc0d2d9b674503d062ef14239ef", lesson: "lesson-welding-safety-management", block: "definition", assertion: "안전관리는 작업의 위험요인을 사전에 찾아 위험도를 평가하고, 우선순위에 따라 예방대책을 실행·확인·개선하는 체계입니다.", correct: 2, answer: "이 2008년 과거 CBT의 KS 안전색 복원 기준에서 황적은 위험을 뜻하므로 세 번째 보기입니다. 이는 역사적 복원 정답에만 한정하며, 현행 표지 판단은 적용 시점의 KS 및 법정 안전보건표지를 우선합니다.", steps: ["문항이 과거 KS 안전색 복원 기준을 묻는지 확인합니다.", "황적의 당시 복원 의미를 보기와 대조합니다.", "위험인 세 번째 보기를 고릅니다."], rule: "황적=위험은 이 과거 CBT 복원 기준이며, 현행 표지는 적용 시점 KS·법정 안전보건표지를 확인합니다.", notes: ["위생은 이 과거 복원표에서 황적의 의미가 아닙니다.", "방사능 표지는 이 과거 황적 복원 답과 다른 분류입니다.", "위험이 2008년 과거 CBT 복원 기준의 황적 의미입니다.", "구호 표지는 이 문항의 황적 의미와 일치하지 않습니다."] }),
] as const;

const EXACT_BINDINGS: Record<string, { block: "definition" | "principle"; assertion: string; answer?: string }> = {
  "wcbt-dd5ec301-3faf-4cee-81b4-fdcecbe8dbf4": { block: "principle", assertion: GAS },
  "wcbt-e6235e1b-7977-454b-8d2c-b9028bcc494e": { block: "principle", assertion: GAS },
  "wcbt-ef348cef-a492-4e38-bce0-0e88807a2947": { block: "principle", assertion: VENTILATION },
  "wcbt-5a2a8c7f-d685-499d-b9e7-c3bf5cffe5fc": { block: "principle", assertion: "차광번호는 공정과 전류에 맞춰야 하고, 호흡보호구는 산소결핍 장소에서 여과식만 사용해서는 안 됩니다." },
  "wcbt-c9de7d4d-db9b-4956-9af7-a312bd3e7d4e": { block: "definition", assertion: "가스설비 안전은 고압 산소와 연료가스가 용기에서 조정기·호스·토치로 이동하는 전 과정에서 누설·혼합·역류·역화·과압과 용기 전도를 방지하는 것입니다." },
  "wcbt-a396f176-3ffc-484f-a6ba-8c6f20e19d9a": { block: "principle", assertion: "산소 밸브와 조정기 등 산소계통에는 기름·그리스를 묻히지 않고 밸브는 서서히 엽니다." },
  "wcbt-88ee8d21-9fe9-45cc-8dc7-3578cba39e55": { block: "principle", assertion: "차광번호는 공정과 전류에 맞춰야 하고, 호흡보호구는 산소결핍 장소에서 여과식만 사용해서는 안 됩니다.", answer: "과거 시험용 복원표에서 3.2mm 이하 산소-아세틸렌 용접의 차광번호는 4~5인 첫 번째 보기입니다. 실제 보호구 선정은 현장 광량·공정과 제조사 기준을 확인합니다." },
  "wcbt-b0dfbe58-d993-41c4-823c-44ad59114dea": { block: "definition", assertion: "가스설비 안전은 고압 산소와 연료가스가 용기에서 조정기·호스·토치로 이동하는 전 과정에서 누설·혼합·역류·역화·과압과 용기 전도를 방지하는 것입니다." },
  "wcbt-a17156b5-4223-4dfd-9e87-e354ef07a97c": { block: "principle", assertion: VENTILATION },
  "wcbt-55c9a8ee-a23b-45a1-b611-931deadc3bb6": { block: "definition", assertion: "아세틸렌 용접장치의 배관과 부속기구에는 구리 또는 구리 함유량이 70% 이상인 합금을 사용하지 않습니다." },
};

export const WELDING_CBT_ANSWER_REVIEWS_GPT_BATCH_01_C =
  WELDING_CBT_ANSWER_REVIEWS_GPT_BATCH_01_C_BASE.map((entry) => {
    const binding = EXACT_BINDINGS[entry.canonicalId];
    if (!binding) return entry;
    return {
      ...entry,
      conceptBinding: {
        ...entry.conceptBinding,
        lessonBlockId: binding.block,
        assertionText: binding.assertion,
        evidenceRefs: entry.conceptBinding.evidenceRefs.map((ref) =>
          ref.kind === "lesson_block"
            ? { ...ref, ref: `${entry.primaryLeafLessonId}#${binding.block}` }
            : ref,
        ),
      },
      ...(binding.answer ? { answerExplanation: binding.answer } : {}),
    };
  });
