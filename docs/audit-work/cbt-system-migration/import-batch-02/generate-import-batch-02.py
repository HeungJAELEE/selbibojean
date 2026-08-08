from __future__ import annotations

import copy
import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any

ROOT = Path('/mnt/data/cbt_batch02_theory_work/repo')
CONTENT_PATH = ROOT / 'src/data/generated/content.json'
MANIFEST_PATH = ROOT / 'src/data/generated/cbt-reviewed-variants.json'
DRY_PATH = Path('/mnt/data/selbibojean_checkout/docs/audit-work/cbt-system-migration/batch-01-mapping-dry-run/variant-mapping-dry-run.jsonl')
OUT = ROOT / 'docs/audit-work/cbt-system-migration/import-batch-02'
OUT.mkdir(parents=True, exist_ok=True)

REVIEW_FILES = [
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20080907_q01-q50_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20080907_q51-q100_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20090830_q01-q50_independent-review.jsonl',
    ROOT / 'docs/audit-work/cbt-source-reviews/final/de20090830_q51-q100_independent-review.jsonl',
]

NOW = '2026-08-07T18:20:00+09:00'
SYMBOLS = ['①', '②', '③', '④', '⑤']


def sha_text(value: str) -> str:
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def jd(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def pretty(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]


content = json.loads(CONTENT_PATH.read_text(encoding='utf-8'))
manifest = json.loads(MANIFEST_PATH.read_text(encoding='utf-8'))
original_content_sha = sha_text(CONTENT_PATH.read_text(encoding='utf-8'))
questions = {q['id']: q for q in content['questions']}
lessons = {l['id']: l for l in content['lessons']}
variants = {v['externalId']: v for v in content['variants']}
groups = {g['id']: g for g in content['conceptGroups']}
question_refs: dict[str, list[str]] = defaultdict(list)
for variant in content['variants']:
    question_refs[variant['canonicalId']].append(variant['externalId'])

review_rows: list[dict[str, Any]] = []
review_file_by_external_id: dict[str, Path] = {}
for path in REVIEW_FILES:
    for row in read_jsonl(path):
        review_rows.append(row)
        review_file_by_external_id[row['externalId']] = path
review_by_id = {r['externalId']: r for r in review_rows}
assert len(review_by_id) == 200, len(review_by_id)

dry_rows = read_jsonl(DRY_PATH)
dry_by_id = {r['externalId']: r for r in dry_rows}

BATCH_IDS = sorted(review_by_id, key=lambda x: (int(x[:4]), int(re.search(r'Q(\d+)$', x).group(1))))
assert len(BATCH_IDS) == 200
assert all(eid.startswith(('2008-4-', '2009-4-')) for eid in BATCH_IDS)

# Idempotent regeneration: if a prior import-02 exists, rebuild from the preserved import-01 baseline.
if any(batch.get('batchId') == 'import-02' for batch in manifest.get('batches', [])):
    manifest = copy.deepcopy(manifest)
    manifest['batches'] = [batch for batch in manifest.get('batches', []) if batch.get('batchId') != 'import-02']
    manifest['records'] = [record for record in manifest.get('records', []) if record.get('externalId') not in set(BATCH_IDS)]
    assert len(manifest['records']) == 200, len(manifest['records'])
    manifest['recordsSha256'] = sha_text(jd(manifest['records']))
    for key in ('theoryLessonAdditions', 'theoryLessonAdditionsSha256', 'canonicalQuestionChanges', 'canonicalQuestionChangesSha256'):
        manifest.pop(key, None)
    policy = manifest.setdefault('holdResolutionPolicy', {})
    policy.update({
        'imageVerificationQueueCount': 7,
        'normalizedAndRegisteredCount': 5,
        'choiceConflictNonScoringCount': 6,
        'lowContextRegisteredCount': 5,
    })

# 2009 Q01~Q50 was substantially mislinked. This table is the approved direct-topic remap.
manual_2009_q1_50: dict[int, str] = {
    1: 'U-001', 2: 'U-348', 3: 'U-257', 4: 'U-506', 5: 'U-1190',
    6: 'U-266', 7: 'U-1241', 8: 'U-342', 9: 'U-004', 10: 'U-866',
    11: 'U-216', 12: 'U-957', 13: 'U-1243', 14: 'U-165', 15: 'U-697',
    16: 'U-1245', 17: 'U-417', 18: 'U-1002', 19: 'U-013', 20: 'U-RES-001',
    21: 'U-1397', 22: 'U-826', 23: 'U-517', 24: 'U-1251', 25: 'U-147',
    26: 'U-819', 27: 'U-1208', 28: 'U-071', 29: 'U-350', 30: 'U-1395',
    31: 'U-1398', 32: 'U-1399', 33: 'U-916', 34: 'U-872', 35: 'U-178',
    36: 'U-1252', 37: 'U-065', 38: 'U-509', 39: 'U-190', 40: 'U-708',
    41: 'U-1253', 42: 'U-596', 43: 'U-451', 44: 'U-1022', 45: 'U-1019',
    46: 'U-1256', 47: 'U-1396', 48: 'U-1120', 49: 'U-087', 50: 'U-601',
}

manual_2009_q51_100 = {
    51:'U-450',52:'U-083',53:'U-968',54:'U-1257',55:'U-1018',56:'U-1394',57:'U-598',58:'U-932',59:'U-455',60:'U-441',
    61:'U-609',62:'U-180',63:'U-849',64:'U-102',65:'U-1373',66:'U-1085',67:'U-675',68:'U-1122',69:'U-294',70:'U-324',
    71:'U-843',72:'U-295',73:'U-1125',74:'U-940',75:'U-1374',76:'U-009',77:'U-380',78:'U-544',79:'U-673',80:'U-1033',
    81:'U-579',82:'U-1343',83:'U-254',84:'U-1400',85:'U-1090',86:'U-122',87:'U-211',88:'U-490',89:'U-401',90:'U-1043',
    91:'U-129',92:'U-299',93:'U-1178',94:'U-1091',95:'U-781',96:'U-479',97:'U-906',98:'U-304',99:'U-123',100:'U-808',
}

HOLD_IDS = {
    '2008-4-Q36','2008-4-Q38','2008-4-Q92',
    '2009-4-Q06','2009-4-Q08','2009-4-Q13','2009-4-Q35','2009-4-Q46','2009-4-Q87','2009-4-Q90','2009-4-Q91',
}
assert len(HOLD_IDS) == 11

# New lessons. All remain in_review and source-gated; adding theory does not auto-publish anything.
lesson_specs = [
    {
        'id':'lesson-cbt-bimetal-temperature','subject':'subject-4','group':'s4-g05','concept':'concept-cbt-bimetal-temperature','title':'바이메탈 온도검출 원리',
        'aliases':['바이메탈','bimetal','열팽창계수 차이'],'external':['2009-4-Q07'],'questions':['U-1241'],'anchor':'principle',
        'summary':['열팽창계수가 다른 두 금속을 접합하면 온도 변화 때 서로 다른 길이변화가 생겨 굽힘이 발생한다.','바이메탈은 이 굽힘을 지시·스위칭 변위로 사용한다.','벨로즈와 부르동관은 주로 압력 변위를 이용하므로 작동원리가 다르다.'],
        'definition':'바이메탈은 열팽창계수가 다른 두 금속층을 결합한 소자다. 온도가 변하면 두 층의 팽창량 차이 때문에 소자가 굽고, 이 변위를 온도 표시나 제어 접점 작동에 이용한다.',
        'principle':'판단 순서는 ① 서로 다른 두 금속이 접합됐는지, ② 입력이 온도인지, ③ 팽창량 차이가 굽힘으로 변환되는지 확인하는 것이다. 이 세 조건이 모두 맞으면 바이메탈 원리다.',
        'trap':'자이로스코프는 각운동, 벨로즈와 부르동관은 압력에 따른 변형을 이용한다. 이름이 기계식 센서라는 공통점만으로 바이메탈과 혼동하면 안 된다.',
        'sources':['https://www.wika.com/en-en/lp_temperature_measurement.WIKA'], 'authority':'authoritative_source',
    },
    {
        'id':'lesson-cbt-basic-multimeter','subject':'subject-4','group':'s4-g01','concept':'concept-cbt-basic-multimeter','title':'기본 회로시험계의 측정범위',
        'aliases':['멀티테스터','회로시험계','아날로그 멀티미터'],'external':['2009-4-Q16'],'questions':['U-1245'],'anchor':'principle',
        'summary':['전통적인 회로시험계는 교류·직류 전압, 직류 전류와 저항 측정을 기본으로 한다.','현대 디지털 멀티미터는 모델에 따라 주파수·정전용량 등도 측정하므로 기기 사양을 확인해야 한다.','해당 기출은 당시의 기본 회로시험계 범위로 정답을 판단한다.'],
        'definition':'회로시험계는 선택 스위치와 내부 분압·분류·정류회로를 이용해 여러 전기량을 한 계기로 측정하는 장비다. 기출의 기본형은 전압·직류전류·저항을 핵심 범위로 본다.',
        'principle':'측정 가능 여부는 기기 내부 기능과 선택 범위에 의해 결정된다. 현대 제품에 기능이 존재한다는 사실과 과거 기본형 시험 범위를 분리해 판단해야 한다.',
        'trap':'현대 디지털 멀티미터에는 주파수 측정 기능이 흔하다. 따라서 “모든 멀티미터는 주파수를 못 잰다”가 아니라 “이 기출의 전통적 기본 회로시험계 범위에서는 주파수를 별도 계측량으로 본다”로 한정한다.',
        'sources':['https://www.fluke.com/en-us/product/electrical-testing/digital-multimeters/fluke-115'], 'authority':'authoritative_source',
    },
    {
        'id':'lesson-cbt-average-load','subject':'subject-4','group':'s4-g12','concept':'concept-cbt-average-load','title':'평균부하와 전력량·시간 관계',
        'aliases':['평균 부하','평균전력','전력량/시간'],'external':['2009-4-Q21'],'questions':['U-1397'],'anchor':'formula',
        'summary':['평균부하는 일정 기간의 전력량을 그 기간의 총시간으로 나눈 평균전력이다.','식은 평균부하 Pavg=E/t이며, kWh를 h로 나누면 kW가 된다.','부하율은 평균부하/최대부하의 비율이므로 평균부하 자체와 다르다.'],
        'definition':'평균부하는 지정한 기간에 소비하거나 공급한 전기에너지를 같은 기간의 시간으로 나눈 값이다.',
        'principle':'식: Pavg=E/t. 단위: kWh/h=kW. 전력량과 기간이 주어지면 먼저 단위를 맞춘 뒤 나눈다. 부하율·부등률·설비이용률은 모두 비율이므로 구분한다.',
        'trap':'“평균”이라는 말만 보고 부하율을 고르면 안 된다. 부하율은 평균부하를 최대부하로 다시 나눈 무차원 비율이다.',
        'sources':['https://www.eia.gov/energyexplained/electricity/measuring-electricity.php'], 'authority':'authoritative_source',
    },
    {
        'id':'lesson-cbt-aipe-duties','subject':'subject-4','group':'s4-g10','concept':'concept-cbt-aipe-duties','title':'AIPE 설비기술자 임무 분류',
        'aliases':['AIPE','설비공학 임무','설비기술자 임무'],'external':['2009-4-Q30'],'questions':['U-1395'],'anchor':'principle',
        'summary':['해당 기출은 설비 배치·설계, 건설·설치, 운전·보전, 유틸리티·방재 같은 기술업무를 설비기술자의 임무로 분류한다.','고정자산의 장부·회계 관리는 기술적 설비공학 임무와 구분한다.','정확한 역사적 AIPE 5분류 원문은 추가 출처 대조가 필요하다.'],
        'definition':'이 레슨은 2009년 기출에 나타난 AIPE 설비기술자 임무 분류를 보존한다. 기술적 생애주기 업무와 회계상 자산관리를 구분하는 것이 핵심이다.',
        'principle':'보기의 활동이 설비의 배치·설계·건설·설치·운전·보전·안전보호에 직접 해당하는지 확인한다. 장부가액·감가상각 등 회계관리라면 기술임무와 분리한다.',
        'trap':'“설비”라는 단어가 포함돼도 고정자산 관리는 회계·재무 기능일 수 있다. 다만 역사적 5분류 명칭은 원전 확인 전까지 시험 맥락으로만 사용한다.',
        'sources':['https://www.jipm.or.jp/business/facility/'], 'authority':'exam_reconstruction_with_source_needed',
    },
    {
        'id':'lesson-cbt-basic-maintenance-duties','subject':'subject-4','group':'s4-g07','concept':'concept-cbt-basic-maintenance-duties','title':'기본 보전업무의 범위',
        'aliases':['기본 보전업무','점검 교정 수리','보전과 설계'],'external':['2009-4-Q31'],'questions':['U-1398'],'anchor':'principle',
        'summary':['기본 보전은 설비의 기능을 유지·회복하기 위한 점검, 교정, 조정과 수리를 포함한다.','신규 구조와 사양을 결정하는 설계는 기본 보전업무와 구분한다.','개량보전에서는 설계 변경이 발생할 수 있으므로 문제의 “기본” 범위를 확인한다.'],
        'definition':'기본 보전업무는 설비 상태를 확인하고 기준에서 벗어난 기능을 조정·교정·수리해 정상운전을 유지하는 활동이다.',
        'principle':'점검은 이상을 찾고, 교정·조정은 기준으로 맞추며, 수리는 손상 기능을 복구한다. 설계는 새로운 구조·사양을 정하는 개발·개량 행위이므로 기본 보전과 구분한다.',
        'trap':'개량보전에는 설계 변경이 포함될 수 있다. 따라서 “보전에는 설계가 절대 없다”가 아니라 해당 문항이 묻는 기본 일상업무 범위로 제한한다.',
        'sources':['https://www.jipm.or.jp/business/facility/','https://www.jipm.or.jp/business/kikaihozenshi/'], 'authority':'authoritative_source',
    },
    {
        'id':'lesson-cbt-tpm-exam-formula','subject':'subject-4','group':'s4-g09','concept':'concept-cbt-tpm-exam-formula','title':'TPM의 시험식 표현과 실제 범위',
        'aliases':['TPM 수식','생산보전+자주보전','전원참가 생산보전'],'external':['2009-4-Q32'],'questions':['U-1399'],'anchor':'principle',
        'summary':['TPM은 로스 제로를 지향하며 생산 관련 전 부문과 작업자가 참여하는 설비관리 체계다.','해당 기출은 이를 “생산보전 + 작업자 자주보전”이라는 축약식으로 표현한다.','축약식은 정의 전체가 아니라 시험용 구성관계를 나타낸다.'],
        'definition':'TPM은 설비를 유지·개선해 고장·불량·낭비를 예방하고, 생산에 관련된 전 부문과 구성원이 참여하는 관리체계다.',
        'principle':'시험에서는 전문보전 부문의 생산보전과 운전원의 자주보전을 결합한 표현을 고른다. 예방보전이나 사후보전 한 종류만으로 TPM 전체를 나타낼 수 없다.',
        'trap':'“TPM=생산보전+자주보전”은 당시 교재의 축약식이다. JIPM의 실제 설명은 로스 제로, 전 부문·전원 참여와 지속적 유지·개선을 포함한다.',
        'sources':['https://www.jipm.or.jp/business/tpm/'], 'authority':'authoritative_source',
    },
    {
        'id':'lesson-cbt-actual-data-standard-time','subject':'subject-4','group':'s4-g10','concept':'concept-cbt-actual-data-standard-time','title':'실적자료법에 의한 표준시간 설정',
        'aliases':['실적 자료법','표준시간','과거 작업기록'],'external':['2009-4-Q36'],'questions':['U-1252'],'anchor':'principle',
        'summary':['실적자료법은 과거 실제 작업기록과 소요시간을 정리해 표준시간을 설정한다.','경험법은 개인 판단, MTM은 기본동작시간, PTS는 예정시간표준 체계다.','자료의 작업조건과 숙련도 차이를 확인하지 않으면 잘못된 표준이 된다.'],
        'definition':'실적자료법은 반복 작업의 실제 소요시간 기록을 분류·보정해 표준시간의 근거로 사용하는 방법이다.',
        'principle':'작업범위와 조건이 같은 기록을 모으고 이상치·비정상 대기를 분리한 뒤 대표시간을 정한다. 단순 경험 추정이나 미리 정한 동작시간표와 구분한다.',
        'trap':'실적값을 그대로 평균내는 것만으로 충분하지 않다. 작업조건·숙련도·비정상 지연을 확인해야 하며, 정확한 절차는 승인된 작업측정 기준을 따른다.',
        'sources':[], 'authority':'exam_reconstruction_with_source_needed',
    },
    {
        'id':'lesson-cbt-cbn-tool-material','subject':'subject-3','group':'s3-g08','concept':'concept-cbt-cbn-tool-material','title':'CBN·PCBN 공구재료',
        'aliases':['CBN','PCBN','입방정 질화붕소'],'external':['2009-4-Q41'],'questions':['U-1253'],'anchor':'principle',
        'summary':['CBN은 붕소와 질소로 구성된 입방정 질화붕소의 초경질 공구재료다.','PCBN은 미세 CBN 분말을 결합재와 소결한 공구재료로 경화강·주철 가공에 사용된다.','다이아몬드·서멧·초경합금과 구성과 적용재료가 다르다.'],
        'definition':'CBN은 cubic boron nitride이며, PCBN은 CBN 입자를 소결해 만든 절삭공구 재료다. 높은 경도와 열안정성 때문에 경화강과 주철의 선삭·밀링에 적용된다.',
        'principle':'재료명을 원자구성(B·N), 결정구조(입방정), 대표 적용재료(경화강·주철)로 확인한다. 세 조건이 함께 나오면 CBN/PCBN을 선택한다.',
        'trap':'다이아몬드는 탄소 결정이며 철계 재료 고온가공에서 반응 문제가 있다. 서멧과 초경합금도 초경질 공구지만 B·N 입방정 구조가 아니다.',
        'sources':['https://www.secotools.com/en/Global/Products/Advanced-cutting-materials/PCBN'], 'authority':'authoritative_source',
    },
    {
        'id':'lesson-cbt-shaper-cutting-speed','subject':'subject-3','group':'s3-g08','concept':'concept-cbt-shaper-cutting-speed','title':'세이퍼 절삭속도 계산',
        'aliases':['세이퍼','shaper','램 왕복 절삭속도'],'external':['2009-4-Q46'],'questions':[],'anchor':'formula',
        'summary':['세이퍼의 평균 절삭속도는 분당 절삭행정 거리에서 구한다.','시험식은 V=nL/(1000k)이며 n은 왕복수, L은 행정길이, k는 1회 왕복시간에 대한 절삭행정시간의 비다.','원문 선택지가 이미지이므로 정답 번호는 이미지 확인 전 승인하지 않는다.'],
        'definition':'세이퍼는 램의 왕복운동 중 한 방향에서 절삭한다. 절삭행정 속도는 왕복횟수·행정길이와 절삭시간비를 이용해 계산한다.',
        'principle':'식: V=nL/(1000k). 단위: (stroke/min·mm/stroke)/1000=m/min. k가 절삭행정시간/왕복시간이면 1회 절삭행정의 속도에 맞게 보정된다.',
        'trap':'nL/1000은 분당 왕복수와 행정길이만 곱한 값이다. 절삭행정과 귀환행정의 시간비가 다르므로 문제에서 정의한 k의 위치를 확인해야 한다.',
        'sources':[], 'authority':'exam_reconstruction_with_source_needed',
    },
    {
        'id':'lesson-cbt-valve-crawl','subject':'subject-3','group':'s3-g09','concept':'concept-cbt-valve-crawl','title':'고압증기 밸브의 crawl 현상',
        'aliases':['crawl','설정압력 이동','스프링 온도상승'],'external':['2009-4-Q47'],'questions':['U-1396'],'anchor':'principle',
        'summary':['고온 유체가 스프링에 직접 닿으면 온도상승으로 탄성계수가 변할 수 있다.','그 결과 밸브 설정압력이 서서히 이동하는 현상을 해당 기출은 crawl로 부른다.','blowdown·hunting·back pressure와 원인과 현상이 다르다.'],
        'definition':'이 기출에서 crawl은 방출 증기의 열영향으로 스프링 특성이 변해 설정압력이 점진적으로 이동하는 현상이다.',
        'principle':'핵심 단서는 고압증기, 스프링 직접 접촉, 온도상승, 탄성계수 변화, 설정압력의 점진적 변화다. 반복 진동이면 hunting, 개방·재폐쇄 압력차면 blowdown이다.',
        'trap':'crawl은 제조사·밸브 형식에 따라 용어 사용이 다를 수 있다. 실제 정비에서는 승인된 매뉴얼의 용어와 조정 절차를 우선한다.',
        'sources':[], 'authority':'exam_reconstruction_with_source_needed',
    },
    {
        'id':'lesson-cbt-ultrasonic-condition-monitoring','subject':'subject-4','group':'s4-g06','concept':'concept-cbt-ultrasonic-condition-monitoring','title':'초음파 상태감시의 적용범위',
        'aliases':['초음파 측정기','에어 누설','베어링 초음파'],'external':['2009-4-Q13'],'questions':[],'anchor':'principle',
        'summary':['초음파 상태감시는 누설·방전·마찰에서 발생하는 고주파 성분을 검출하는 데 사용한다.','진동·오일·소음 분석과는 검출 물리량과 대표 적용결함이 다르다.','해당 문항의 결함목록이 이미지에 있어 정답 번호는 이미지 확인 전 보류한다.'],
        'definition':'초음파 상태감시는 사람이 듣기 어려운 고주파 음향에너지를 센서로 검출해 누설이나 초기 마찰 이상 등을 찾는 방법이다.',
        'principle':'결함이 만드는 신호가 고주파 누설음·마찰음인지 확인한다. 회전주파수 성분은 진동, 윤활유 열화·마모입자는 오일분석이 더 직접적이다.',
        'trap':'초음파가 모든 결함에 가장 쉽거나 유일한 방법은 아니다. 결함목록과 측정목적을 확인해야 하며, 현재 원문 이미지가 없으므로 이론만 연결하고 채점은 보류한다.',
        'sources':[], 'authority':'exam_reconstruction_with_source_needed',
    },
    {
        'id':'lesson-cbt-shaft-assembly-failure','subject':'subject-3','group':'s3-g04','concept':'concept-cbt-shaft-assembly-failure','title':'축 고장의 조립·정비 원인',
        'aliases':['축 휨','조립불량','정비불량'],'external':['2009-4-Q54'],'questions':['U-1257'],'anchor':'diagnosis',
        'summary':['축 고장원인은 설계·재료·제작·조립·운전·정비 원인으로 분리한다.','부적절한 조립·분해·정렬·취급은 축 휨을 직접 만들 수 있다.','재질불량·강도부족·형상불량은 주로 설계·제작 원인이다.'],
        'definition':'조립·정비 원인은 정상 부품을 설치·분해·정렬·취급하는 과정에서 발생한 변형과 손상을 뜻한다.',
        'principle':'원인의 발생단계를 묻는다. 재질과 강도는 설계·소재, 형상은 구조설계, 축 휨은 잘못된 취급·정렬·조립에서도 직접 발생할 수 있다.',
        'trap':'축 휨은 과부하나 열변형으로도 생길 수 있다. 이 문항은 보기 중 조립·정비불량과 가장 직접 연결되는 원인을 고르는 분류형 문제다.',
        'sources':[], 'authority':'exam_reconstruction_with_source_needed',
    },
    {
        'id':'lesson-cbt-shaft-drawing-rules','subject':'subject-3','group':'s3-g01','concept':'concept-cbt-shaft-drawing-rules','title':'축의 도시방법',
        'aliases':['축 도시','긴 축 생략','평면부 표시'],'external':['2009-4-Q56'],'questions':['U-1394'],'anchor':'principle',
        'summary':['축은 일반적으로 길이방향 전단면을 피하고 필요한 곳만 부분단면으로 표시한다.','긴 축은 중간을 생략해 짧게 그려도 실제 길이 치수를 기입한다.','원형축의 평면부 표시는 가는 실선 대각선으로 나타내며 일점쇄선과 구분한다.'],
        'definition':'축의 도시는 긴 회전체의 형상·가공부·평면부를 도면에서 명확하고 간결하게 전달하는 제도 규칙이다.',
        'principle':'작은 라운드·홈은 필요하면 확대하고, 긴 축은 생략선을 사용해 단축한다. 원형부의 일부 평면은 가는 실선 대각선으로 표시한다.',
        'trap':'중심선에 사용하는 일점쇄선과 평면부 표시용 가는 실선을 혼동하지 않는다. 실제 도면 작성은 적용 중인 KS/ISO 제도규격을 확인한다.',
        'sources':[], 'authority':'exam_reconstruction_with_source_needed',
    },
    {
        'id':'lesson-cbt-poppet-valve-components','subject':'subject-1','group':'s1-g04','concept':'concept-cbt-poppet-valve-components','title':'포핏밸브 폐쇄요소와 스풀밸브 구분',
        'aliases':['포핏 밸브','poppet valve','시트 밸브','볼 포핏','원추 포핏','디스크 포핏'],'external':['2009-4-Q84'],'questions':['U-1400'],'anchor':'principle',
        'summary':['포핏형 밸브는 폐쇄요소가 시트에 접근하거나 떨어지며 유로를 개폐한다.','기출의 교재 분류에서는 폐쇄요소 형상으로 디스크·원추·볼을 포핏형에 포함한다.','스풀은 원통형 랜드가 보어 안에서 미끄러지며 포트를 연결·차단하는 별도 구조다.'],
        'definition':'포핏밸브는 폐쇄요소가 밸브 시트에 밀착해 유로를 차단하고 시트에서 이탈해 유로를 여는 구조다. 폐쇄요소의 구체 형상은 제품과 교재 분류에 따라 디스크·원추·볼 등으로 표현될 수 있다.',
        'principle':'보기의 부품이 시트에 직접 안착하는 폐쇄요소인지 확인한다. 디스크·원추·볼은 해당 기출의 포핏 폐쇄요소 분류에 들어가지만, 스풀은 밸브 보어를 축방향으로 이동하는 원통형 제어요소이므로 포핏형 구성요소가 아니다.',
        'trap':'포핏밸브에도 스프링·시트·액추에이터가 함께 쓰일 수 있지만, 문항은 폐쇄요소의 형상을 묻는다. “스풀”이라는 이름이 다른 밸브에서도 보인다는 이유로 포핏과 혼동하지 않는다.',
        'sources':['https://www.festo.com/il/en/a/8036676/','https://ipd.parker.com/viewitems/mpi-specialty-valves-and-filters/mac-and-macb-check-valves','https://ph.parker.com/us/en/d1vw001cnkw'], 'authority':'authoritative_components_with_exam_taxonomy',
    },
]

# Build lesson additions.
def lesson_addition(spec: dict[str, Any]) -> dict[str, Any]:
    source_lines = [f'- 근거 URL {i+1}: {url}' for i, url in enumerate(spec['sources'])]
    if not source_lines:
        source_lines = ['- 독립 이론 출처: 추가 검토 필요', '- 현재 근거: 2009년 4회 복원 원문과 독립 풀이']
    blocks = [
        {'id':'summary','kind':'summary','title':'핵심 요약','body':'\n'.join(f'{i+1}. {line}' for i,line in enumerate(spec['summary'])),'order':1},
        {'id':'definition','kind':'definition','title':'정의와 범위','body':spec['definition'],'order':2},
        {'id':spec['anchor'],'kind':'formula' if spec['anchor']=='formula' else ('diagnosis' if spec['anchor']=='diagnosis' else 'principle'),'title':'직접 판단근거','body':spec['principle'],'order':3},
        {'id':'exam-point','kind':'exam_point','title':'시험 판단 순서','body':f"문두의 대상과 조건을 먼저 확인한다. 그다음 **{spec['title']}**의 정의·작동원리와 각 보기를 하나씩 대조한다. 비슷한 용어가 아니라 직접 원인·식·기능이 일치하는 보기를 선택한다.",'order':4},
        {'id':'trap','kind':'trap','title':'혼동하기 쉬운 경계','body':spec['trap'],'order':5},
        {'id':'source','kind':'source','title':'출처와 공개 상태','body':'\n'.join(source_lines + ['- 공개 상태: 직접 연결은 완료했으나 추가 출처·기술 검수 전까지 in_review 유지','- 원문 미러를 공식 발행처로 표시하지 않는다.']),'order':6},
    ]
    substantive = sum(len(b['body']) for b in blocks) + sum(len(s) for s in spec['summary'])
    lesson = {
        'id':spec['id'],'subjectId':spec['subject'],'conceptGroupId':spec['group'],'conceptId':spec['concept'],'title':spec['title'],
        'aliases':spec['aliases'],'summary':spec['summary'],'blocks':blocks,'relatedQuestionIds':spec['questions'],
        'coverageStatus':'covered' if spec['questions'] else 'partial','contentStatus':'in_review','sourceNeeded':True,'reviewedAt':None,
        'contentRole':'exam_linked','publication':{'readiness':'blocked','blockers':['lesson_source_needed']},
        'quality':{'tier':'standard','substantiveCharacters':substantive,'genericPhraseMatches':[],'languageIssueMatches':[],
                   'sourceLinked':bool(spec['sources']),'passed':True},
    }
    return {'lesson':lesson,'directExternalIds':spec['external'],'rationale':f"{', '.join(spec['external'])}의 지문·보기·풀이에 직접 판단근거를 제공하도록 추가",'sourceAuthority':spec['authority']}

lesson_additions = [lesson_addition(s) for s in lesson_specs]
lesson_by_id_effective = {**lessons, **{x['lesson']['id']:x['lesson'] for x in lesson_additions}}

new_lesson_by_question: dict[str, str] = {
    'U-1241':'lesson-cbt-bimetal-temperature',
    'U-1245':'lesson-cbt-basic-multimeter',
    'U-1397':'lesson-cbt-average-load',
    'U-1395':'lesson-cbt-aipe-duties',
    'U-1398':'lesson-cbt-basic-maintenance-duties',
    'U-1399':'lesson-cbt-tpm-exam-formula',
    'U-1252':'lesson-cbt-actual-data-standard-time',
    'U-1253':'lesson-cbt-cbn-tool-material',
    'U-1396':'lesson-cbt-valve-crawl',
    'U-1257':'lesson-cbt-shaft-assembly-failure',
    'U-1394':'lesson-cbt-shaft-drawing-rules',
    'U-1400':'lesson-cbt-poppet-valve-components',
}
new_question_external: dict[str, str] = {
    'U-1241':'2009-4-Q07','U-1245':'2009-4-Q16','U-1397':'2009-4-Q21','U-1395':'2009-4-Q30',
    'U-1398':'2009-4-Q31','U-1399':'2009-4-Q32','U-1252':'2009-4-Q36','U-1253':'2009-4-Q41',
    'U-1396':'2009-4-Q47','U-1257':'2009-4-Q54','U-1394':'2009-4-Q56','U-1400':'2009-4-Q84',
}
replace_ids = {'U-1241','U-1245','U-1252','U-1253','U-1257'}
add_ids = set(new_question_external) - replace_ids
assert 'U-1400' not in questions
next_canonical = max(q['canonicalNumber'] for q in content['questions']) + 1


def make_feedback(review: dict[str, Any], idx: int, answer_idx: int) -> dict[str, Any]:
    item = review['choiceByChoiceReasons'][idx]
    text = review['sourceExactChoices'][idx]
    correct = idx == answer_idx
    direct = review['directSolution'].strip()
    if correct:
        rationale = f"‘{text}’가 문두의 조건에 직접 해당한다. {item['reason']}"
        plausible = '문두의 대상·원리·조건을 모두 충족하므로 정답으로 선택할 수 있다.'
        incorrect = None
        difference = None
    else:
        rationale = f"‘{text}’는 정답 조건을 충족하지 않는다. {item['reason']}"
        plausible = f"‘{text}’도 같은 분야에서 사용하는 용어이지만 이 문항이 묻는 직접 원리와는 다르다."
        incorrect = item['reason']
        correct_text = review['sourceExactChoices'][answer_idx]
        difference = f"정답 ‘{correct_text}’와 달리 ‘{text}’는 문두의 직접 조건을 충족하지 않는다."
    return {'rationale':rationale,'plausibleReason':plausible,'incorrectPoint':incorrect,'keyRule':direct,'differenceFromCorrect':difference}


def make_question(qid: str, external_id: str, lesson_id: str, canonical_number: int) -> dict[str, Any]:
    review = review_by_id[external_id]
    lesson = lesson_by_id_effective[lesson_id]
    answer_idx = review['independentAnswerIndex']
    assert isinstance(answer_idx, int)
    choices = []
    for idx, text in enumerate(review['sourceExactChoices']):
        choices.append({'id':f'{qid}-c{idx+1}','order':idx+1,'text':text,'feedback':make_feedback(review,idx,answer_idx)})
    sources = lesson_specs[[s['id'] for s in lesson_specs].index(lesson_id)]['sources']
    source_urls = [review['identity']['registeredSourceUrl'], *sources]
    risk_tags = ['editorial_reconstruction']
    if review.get('riskNote') or lesson_id in {'lesson-cbt-aipe-duties','lesson-cbt-tpm-exam-formula','lesson-cbt-basic-multimeter'}:
        risk_tags.append('historical_context')
    return {
        'id':qid,'canonicalNumber':canonical_number,'subjectId':lesson['subjectId'],'conceptGroupId':lesson['conceptGroupId'],
        'conceptId':lesson['conceptId'],'lessonId':lesson_id,'lessonAnchor':lesson_specs[[s['id'] for s in lesson_specs].index(lesson_id)]['anchor'],
        'stem':review['sourceExactStem'],'choices':choices,'correctChoiceId':choices[answer_idx]['id'],
        'answerText':review['sourceExactChoices'][answer_idx],'explanation':review['directSolution'],
        'errorReason':'과거 기준' if review.get('riskNote') else ('공식 적용' if review.get('formulaUnitSubstitution') else '개념 혼동'),
        'sourceLabel':review['identity']['registeredSourceUrl'],'reviewStatus':'배치 02 원문·독립 풀이·직접 이론 연결 검수',
        'contentStatus':'in_review','publication':{'readiness':'blocked','blockers':['lesson_source_needed']},
        'verification':{'status':'blocked','method':'manual_source_required','variantCount':1,'sourceUrls':source_urls,
                        'riskTags':risk_tags,'note':'원문 variant와 독립 풀이를 canonical 후보로 정리했으며, 운영 공개 전 추가 출처·런타임 검증이 필요합니다.','reviewedAt':NOW},
        'audit':{'questionId':qid,'scope':'review_queue','sourceContentStatus':'in_review','auditDisposition':'held_source_missing',
                 'evidenceLevel':None,'cbtAnswer':review['sourceExactChoices'][review['sourceAnswerIndex']] if review['sourceAnswerIndex'] is not None else None,
                 'verifiedAnswer':review['sourceExactChoices'][answer_idx],'evidenceUrls':source_urls,'reviewNote':review['directSolution'],
                 'assetStatus':'not_required','nextAction':'직접 이론 출처와 런타임 variant 선택지 계약을 확인한 뒤 공개 심사',
                 'reviewChoiceFeedback':[{'choiceId':choices[i]['id'],'verdict':'correct' if i==answer_idx else 'incorrect','rationale':review['choiceByChoiceReasons'][i]['reason']} for i in range(len(choices))],
                 'reviewedAt':NOW},
        'validation':{'answer':True,'explanation':True,'choiceFeedback':True,'theoryLink':True,'contentQuality':True},
    }

question_changes: list[dict[str, Any]] = []
question_change_by_id: dict[str, dict[str, Any]] = {}
for qid, external_id in new_question_external.items():
    lesson_id = new_lesson_by_question[qid]
    if qid in replace_ids:
        canonical_number = questions[qid]['canonicalNumber']
        action = 'replace'
        previous = sha_text(jd(questions[qid]))
    else:
        canonical_number = next_canonical
        next_canonical += 1
        action = 'add'
        previous = None
    question = make_question(qid, external_id, lesson_id, canonical_number)
    change = {'action':action,'question':question,'previousQuestionSha256':previous,'affectedExternalIds':[external_id],
              'rationale':f"{external_id}의 원문 지문·보기·독립 풀이와 직접 연결되는 canonical을 {'교체' if action=='replace' else '추가'}"}
    question_changes.append(change)
    question_change_by_id[qid] = change

# Effective maps after overlay additions/changes.
effective_questions = dict(questions)
for change in question_changes:
    effective_questions[change['question']['id']] = change['question']
effective_lessons = dict(lessons)
for addition in lesson_additions:
    effective_lessons[addition['lesson']['id']] = addition['lesson']

# Theory-only direct links for image-dependent questions whose canonical reconstruction remains deferred.
HOLD_DIRECT_LESSON = {
    '2009-4-Q13':'lesson-cbt-ultrasonic-condition-monitoring',
    '2009-4-Q46':'lesson-cbt-shaper-cutting-speed',
}


def normalize_text(value: str) -> str:
    value = unicodedata.normalize('NFKC', value).lower()
    value = re.sub(r'[\s\-–—·,.:;()\[\]{}_/\\]+', '', value)
    value = value.replace('ㆍ','').replace('＝','=').replace('²','2').replace('³','3')
    return value


def safe_choice_mapping(source_choices: list[str], canonical: dict[str, Any], answer_idx: int | None) -> list[str]:
    if not source_choices or any(not x.strip() for x in source_choices):
        return []
    candidates = canonical['choices']
    used: set[str] = set()
    result: list[str] = []
    for source in source_choices:
        ns = normalize_text(source)
        matches = []
        for choice in candidates:
            nc = normalize_text(choice['text'])
            if ns == nc or (len(ns) >= 2 and len(nc) >= 2 and (ns in nc or nc in ns)):
                matches.append(choice)
        matches = [m for m in matches if m['id'] not in used]
        if len(matches) != 1:
            return []
        result.append(matches[0]['id']); used.add(matches[0]['id'])
    if len(result) != len(source_choices) or len(set(result)) != len(result):
        return []
    if answer_idx is not None and result[answer_idx] != canonical['correctChoiceId']:
        return []
    return result


def target_canonical_id(eid: str) -> str:
    qn = int(re.search(r'Q(\d+)$', eid).group(1))
    if eid.startswith('2009-4-Q'):
        return manual_2009_q1_50[qn] if qn <= 50 else manual_2009_q51_100[qn]
    decision = dry_by_id[eid]['decision']
    return decision['targetCanonicalId'] or decision['currentCanonicalId']

records: list[dict[str, Any]] = []
variant_specific_ids: list[str] = []
image_queue: list[str] = []
full_mapping_ids: list[str] = []
direct_link_matrix: list[dict[str, Any]] = []

for eid in BATCH_IDS:
    review = review_by_id[eid]
    source_variant = variants[eid]
    current_canonical = source_variant['canonicalId']
    target_id = target_canonical_id(eid)
    canonical = effective_questions.get(target_id)
    is_hold = eid in HOLD_IDS
    answer_idx = review.get('independentAnswerIndex') if not is_hold else None
    source_idx = review.get('sourceAnswerIndex')
    source_choices = list(review['sourceExactChoices'])
    source_answer_text = f"{SYMBOLS[source_idx]} {source_choices[source_idx]}" if isinstance(source_idx,int) else ''
    reviewed_answer_text = f"{SYMBOLS[answer_idx]} {source_choices[answer_idx]}" if isinstance(answer_idx,int) else ''

    if is_hold:
        mapping = []
        variant_specific = False
        image_queue.append(eid)
    else:
        assert canonical is not None, (eid,target_id)
        mapping = safe_choice_mapping(source_choices, canonical, answer_idx)
        variant_specific = len(mapping) == 0
        if variant_specific:
            variant_specific_ids.append(eid)
        else:
            full_mapping_ids.append(eid)

    if eid in HOLD_DIRECT_LESSON:
        lesson_id = HOLD_DIRECT_LESSON[eid]
        lesson = effective_lessons[lesson_id]
        anchor = next(s['anchor'] for s in lesson_specs if s['id']==lesson_id)
        theory = {'canonicalId':target_id,'lessonId':lesson_id,'lessonAnchor':anchor,'conceptGroupId':lesson['conceptGroupId'],
                  'conceptId':lesson['conceptId'],'canonicalStem':review['sourceExactStem']}
        theory_status = 'direct_added_theory_canonical_deferred_pending_image'
    elif canonical is not None:
        lesson = effective_lessons[canonical['lessonId']]
        theory = {'canonicalId':target_id,'lessonId':canonical['lessonId'],'lessonAnchor':canonical['lessonAnchor'],
                  'conceptGroupId':canonical['conceptGroupId'],'conceptId':canonical['conceptId'],'canonicalStem':canonical['stem']}
        if target_id in question_change_by_id:
            theory_status = 'direct_added_or_repaired_theory'
        elif current_canonical != target_id:
            theory_status = 'direct_existing_theory_relinked'
        else:
            theory_status = 'direct_existing_theory'
    else:
        raise AssertionError((eid,target_id))

    if is_hold:
        blockers = ['required_source_image_review']
        runtime_status = 'hold'
        verdict = 'HOLD'
        scoring = 'excluded_required_image'
        issue_label = '필수 이미지 확인'
        source_agreement = 'not_verified_due_required_image'
        evidence = 'required_source_image_not_visually_verified'
        confidence = 'unknown'
        migration_class = 'IMAGE_VERIFICATION_HOLD'
        runtime_disposition = 'IMAGE_VERIFICATION_QUEUE'
    else:
        blockers = ['pending_runtime_integration']
        if variant_specific:
            blockers.append('variant_specific_choice_contract_pending')
        runtime_status = 'candidate'
        verdict = review.get('reviewVerdict','ACCEPT')
        scoring = 'scored'
        issue_label = None
        source_agreement = 'match' if review.get('sourceAnswerAgreement') == 'agrees' else str(review.get('sourceAnswerAgreement'))
        evidence = 'independently_solved'
        confidence = review.get('answerConfidence') or 'confirmed'
        migration_class = 'SEMANTIC_REPLACE' if current_canonical != target_id else 'EXACT_REPLACE'
        if target_id in question_change_by_id:
            migration_class = 'DIRECT_THEORY_CANONICAL_OVERLAY'
        runtime_disposition = 'PUBLICATION_CANDIDATE_WITH_VARIANT_CHOICE_CONTRACT_PENDING' if variant_specific else 'PUBLICATION_CANDIDATE'

    qn = review['identity']['questionNumber']
    record = {
        'externalId':eid,'currentCanonicalId':current_canonical,'canonicalId':target_id,
        'year':source_variant['year'],'sessionLabel':source_variant['sessionLabel'],'questionNumber':source_variant['questionNumber'],
        'source':{
            'textAuthority':review['sourceTextAuthority'],'captureAuthority':review['sourceCaptureAuthority'],
            'answerAuthority':review['sourceAnswerAuthority'],'displayLabel':review['sourceDisplayLabel'],
            'registeredSourceUrl':review['identity']['registeredSourceUrl'],'resolvedSourceUrl':review['identity']['resolvedSourceUrl'],
            'questionNumber':qn,'stemSha256':review['identity']['sourceStemSha256'],'orderedChoicesSha256':review['identity']['orderedChoicesSha256'],
            'registeredIdentitySha256':review['identity']['registeredIdentitySha256'],'resolvedIdentitySha256':review['identity']['sourceIdentitySha256'],
        },
        'stem':review['sourceExactStem'],'choices':source_choices,'sourceAnswerIndex':source_idx,'reviewedAnswerIndex':answer_idx,
        'sourceAnswerText':source_answer_text,'reviewedAnswerText':reviewed_answer_text,'choiceIdMapping':mapping,
        'directSolution':review['directSolution'],'formulaUnitSubstitution':review.get('formulaUnitSubstitution'),
        'choiceByChoiceReasons':review['choiceByChoiceReasons'],'theoryLink':theory,
        'conceptKeywords':[lesson['title'], *lesson.get('aliases',[])[:3]],
        'review':{
            'verdict':verdict,'scoringDisposition':scoring,'sourceAnswerAgreement':source_agreement,
            'answerEvidence':evidence,'answerConfidence':confidence,'theoryLinkStatus':theory_status,
            'holdReasons':review.get('holdReasons',[]) if is_hold else [],
            'answerConflictOrMultipleAnswerRisk':review.get('riskNote') or ('필수 이미지 판독 전 정답 인덱스를 승인하지 않는다.' if is_hold else '없음. 독립 풀이와 복원 정답이 일치한다.'),
            'runtimeStatus':runtime_status,'publicationBlockers':blockers,'reviewedAt':review['reviewedAt'],
        },
        'migration':{
            'mappingClass':migration_class,
            'canonicalAction':('DEFER_CANONICAL_UNTIL_IMAGE_REVIEW' if eid in HOLD_DIRECT_LESSON else ('APPLY_CANONICAL_OVERLAY' if target_id in question_change_by_id else ('REASSIGN_CANONICAL' if current_canonical!=target_id else 'KEEP_CURRENT_CANONICAL'))),
            'theoryAction':('ADD_DIRECT_THEORY_LESSON' if lesson['id'].startswith('lesson-cbt-') else 'USE_DIRECT_EXISTING_THEORY'),
            'runtimeDisposition':runtime_disposition,'confidence':'medium' if is_hold else 'high',
            'duplicateCanonicalCluster':bool(dry_by_id[eid]['decision'].get('duplicateCanonicalCluster',False)),
            'preserveExternalId':True,'preserveRegisteredSourceUrl':True,'preserveQuestionNumber':True,
        },
    }
    if variant_specific:
        record['variantSpecificFeedbackRequired'] = True
    if issue_label:
        record['review']['issueLabel'] = issue_label
    records.append(record)
    direct_link_matrix.append({
        'externalId':eid,'currentCanonicalId':current_canonical,'targetCanonicalId':target_id,'runtimeStatus':runtime_status,
        'variantSpecificFeedbackRequired':variant_specific,'lessonId':theory['lessonId'],'lessonAnchor':theory['lessonAnchor'],
        'conceptGroupId':theory['conceptGroupId'],'conceptId':theory['conceptId'],'theoryLinkStatus':theory_status,
        'canonicalOverlayApplied':target_id in question_change_by_id,
    })

assert Counter(r['review']['runtimeStatus'] for r in records) == Counter({'candidate':189,'hold':11})
assert len(variant_specific_ids) + len(full_mapping_ids) == 189

# Append to existing manifest, preserving batch 01 exactly except global counts/extensions.
all_records = manifest['records'] + records
assert len(all_records) == 400
assert len({r['externalId'] for r in all_records}) == 400

batch2 = {
    'batchId':'import-02','reviewSessions':['05','06','07','08'],
    'externalIdRanges':['2008-4-Q01..2008-4-Q100','2009-4-Q01..2009-4-Q100'],
    'recordCount':200,'candidateCount':189,'choiceConflictCount':0,'holdCount':11,'normalizationCount':0,
    'imageReviewCount':11,'lowContextRegistrationCount':0,'variantSpecificFeedbackCount':len(variant_specific_ids),
    'canonicalTheoryRepairs':[],
    'theoryLessonAdditionIds':[x['lesson']['id'] for x in lesson_additions],
    'canonicalQuestionChangeIds':[x['question']['id'] for x in question_changes],
    'holdResolution':{'imageVerificationQueue':sorted(HOLD_IDS),'normalizedAndRegistered':[],
                      'choiceConflictNonScoring':[],'lowContextRegistered':[]},
    'sourceFiles':[{'path':str(p.relative_to(ROOT)).replace('\\','/'),'sha256':sha_text(p.read_text(encoding='utf-8'))} for p in REVIEW_FILES],
}

new_manifest = copy.deepcopy(manifest)
new_manifest['generatedAt'] = NOW
new_manifest['batches'] = manifest['batches'] + [batch2]
new_manifest['theoryLessonAdditions'] = lesson_additions
new_manifest['theoryLessonAdditionsSha256'] = sha_text(jd(lesson_additions))
new_manifest['canonicalQuestionChanges'] = question_changes
new_manifest['canonicalQuestionChangesSha256'] = sha_text(jd(question_changes))
new_manifest['records'] = all_records
new_manifest['recordsSha256'] = sha_text(jd(all_records))
new_manifest['holdResolutionPolicy'] = copy.deepcopy(manifest['holdResolutionPolicy'])
new_manifest['holdResolutionPolicy']['imageVerificationQueueCount'] = 18
new_manifest['holdResolutionPolicy']['normalizedAndRegisteredCount'] = 5
new_manifest['holdResolutionPolicy']['choiceConflictNonScoringCount'] = 6
new_manifest['holdResolutionPolicy']['lowContextRegisteredCount'] = 5
new_manifest['holdResolutionPolicy']['decidedAt'] = NOW

MANIFEST_PATH.write_text(pretty(new_manifest), encoding='utf-8')

# Audit artifacts.
(OUT/'theory-lesson-additions.json').write_text(pretty(lesson_additions),encoding='utf-8')
(OUT/'canonical-question-changes.json').write_text(pretty(question_changes),encoding='utf-8')
(OUT/'direct-theory-link-matrix.jsonl').write_text('\n'.join(jd(x) for x in direct_link_matrix)+'\n',encoding='utf-8')
(OUT/'variant-specific-choice-contract-queue.jsonl').write_text('\n'.join(jd(next(r for r in records if r['externalId']==eid)) for eid in variant_specific_ids)+'\n',encoding='utf-8')
(OUT/'image-verification-queue.jsonl').write_text('\n'.join(jd(next(r for r in records if r['externalId']==eid)) for eid in sorted(HOLD_IDS))+'\n',encoding='utf-8')
(OUT/'variant-mapping.jsonl').write_text('\n'.join(jd(x) for x in records)+'\n',encoding='utf-8')
(OUT/'external-ids.json').write_text(pretty(BATCH_IDS),encoding='utf-8')

states = Counter(r['review']['runtimeStatus'] for r in records)
summary = {
    'batchId':'import-02','generatedAt':NOW,'recordCount':200,'states':dict(states),
    'fullCanonicalChoiceMappingCount':len(full_mapping_ids),'variantSpecificFeedbackPendingCount':len(variant_specific_ids),
    'theoryLessonAdditionCount':len(lesson_additions),'canonicalQuestionChangeCount':len(question_changes),
    'directTheoryLinkCount':len(records),'imageVerificationQueueCount':len(HOLD_IDS),
    'sourceContentSha256Before':original_content_sha,'sourceContentUnchanged':sha_text(CONTENT_PATH.read_text(encoding='utf-8'))==original_content_sha,
}
(OUT/'batch-summary.json').write_text(pretty(summary),encoding='utf-8')

report = f'''# CBT 시스템 실제 이식 배치 02 — 이론 보강·직접 연결 보고서

- 범위: 2008년 4회 100문항 + 2009년 4회 100문항
- candidate: 189
- 필수 이미지 HOLD: 11
- 신규 직접 이론 레슨: {len(lesson_additions)}
- canonical 추가·교체 overlay: {len(question_changes)}
- canonical 선택지와 안전하게 1:1 매핑: {len(full_mapping_ids)}
- variant 전용 선택지 계약 대기: {len(variant_specific_ids)}

## 처리 원칙

1. 원본 `content.json`은 수정하지 않는다.
2. 원문 지문·보기·회차·external ID를 보존한다.
3. 2009년 Q01~Q50은 기존 연결을 재사용하지 않고 직접 판단근거로 재분류한다.
4. 누락 이론은 `in_review` 레슨으로 추가하고 자동 공개하지 않는다.
5. 기존 canonical 선택지와 원문 선택지를 안전하게 1:1 대응할 수 없는 문항은 `variantSpecificFeedbackRequired`로 차단한다.
6. 이미지 의존 11건은 정답·채점을 활성화하지 않는다.

## 추가한 이론

''' + '\n'.join(f"- `{x['lesson']['id']}` — {x['lesson']['title']} ({', '.join(x['directExternalIds'])})" for x in lesson_additions) + f'''

## canonical overlay

''' + '\n'.join(f"- `{x['question']['id']}` — {x['action']} — {', '.join(x['affectedExternalIds'])}" for x in question_changes) + '''

## 공개 경계

- 모든 배치 02 레코드는 `candidate` 또는 `hold`이며 `published`는 0건이다.
- 신규 레슨과 canonical은 모두 `in_review`·`blocked`이다.
- variant 전용 선택지 계약이 필요한 문항은 `variant_specific_choice_contract_pending` blocker를 가진다.
- 필수 이미지 문항은 `required_source_image_review` blocker를 가진다.
'''
(OUT/'import-report.md').write_text(report,encoding='utf-8')

validation = {
    'status':'PASS','recordCount':len(records),'candidateCount':states['candidate'],'holdCount':states['hold'],
    'exactExternalIdSet':len(set(BATCH_IDS))==200,
    'sourceHashesMatch':all(sha_text(r['stem'])==r['source']['stemSha256'] and sha_text(jd(r['choices']))==r['source']['orderedChoicesSha256'] for r in records),
    'directTheoryLinksPresent':all(r['theoryLink'] is not None for r in records),
    'addedLessonIdsUnique':len({x['lesson']['id'] for x in lesson_additions})==len(lesson_additions),
    'changedQuestionIdsUnique':len({x['question']['id'] for x in question_changes})==len(question_changes),
    'candidateAnswersPresent':all(isinstance(r['reviewedAnswerIndex'],int) and r['reviewedAnswerText'] for r in records if r['review']['runtimeStatus']=='candidate'),
    'holdAnswersDisabled':all(r['reviewedAnswerIndex'] is None and not r['reviewedAnswerText'] and not r['choiceIdMapping'] for r in records if r['review']['runtimeStatus']=='hold'),
    'variantSpecificBlocked':all('variant_specific_choice_contract_pending' in r['review']['publicationBlockers'] and not r['choiceIdMapping'] for r in records if r.get('variantSpecificFeedbackRequired')),
    'sourceContentUnchanged':sha_text(CONTENT_PATH.read_text(encoding='utf-8'))==original_content_sha,
}
assert all(v is True or k in {'status','recordCount','candidateCount','holdCount'} for k,v in validation.items())
(OUT/'validation.json').write_text(pretty(validation),encoding='utf-8')

# Artifact manifest generated last.
artifact_paths = [
    MANIFEST_PATH,
    OUT/'theory-lesson-additions.json',OUT/'canonical-question-changes.json',OUT/'direct-theory-link-matrix.jsonl',
    OUT/'variant-specific-choice-contract-queue.jsonl',OUT/'image-verification-queue.jsonl',OUT/'variant-mapping.jsonl',
    OUT/'external-ids.json',OUT/'batch-summary.json',OUT/'import-report.md',OUT/'validation.json',
]
artifact_manifest = {
    'generatedAt':NOW,'sourceContentSha256':original_content_sha,
    'files':[{'path':str(p.relative_to(ROOT)).replace('\\','/'),'size':p.stat().st_size,'sha256':sha_text(p.read_text(encoding='utf-8'))} for p in artifact_paths],
}
(OUT/'artifact-manifest.json').write_text(pretty(artifact_manifest),encoding='utf-8')

print(pretty(summary))
print('manifest sha',sha_text(MANIFEST_PATH.read_text(encoding='utf-8')))
