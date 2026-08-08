from __future__ import annotations
import hashlib, json
from collections import Counter
from pathlib import Path

ROOT=Path('/mnt/data/cbt_batch05_final_work/repo')
BASE=Path('/mnt/data/cbt_batch04_final_work/repo')
OUT=ROOT/'docs/audit-work/cbt-system-migration/import-batch-05'

def sha(s:str)->str:return hashlib.sha256(s.encode()).hexdigest()
def jd(v):return json.dumps(v,ensure_ascii=False,separators=(',',':'))
def readjl(p):return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]

content=json.loads((ROOT/'src/data/generated/content.json').read_text())
manifest=json.loads((ROOT/'src/data/generated/cbt-reviewed-variants.json').read_text())
base_manifest=json.loads((BASE/'src/data/generated/cbt-reviewed-variants.json').read_text())
q={x['id']:x for x in content['questions']}
l={x['id']:x for x in content['lessons']}
v={x['externalId']:x for x in content['variants']}
for a in manifest.get('theoryLessonAdditions',[]):l[a['lesson']['id']]=a['lesson']
for c in manifest.get('canonicalQuestionChanges',[]):q[c['question']['id']]=c['question']

fail=[]
def check(cond,msg):
 if not cond: fail.append(msg)

check(sha(jd(manifest['records']))==manifest['recordsSha256'],'manifest records digest')
check(len(manifest['records'])==1000,'record count')
check(len({r['externalId'] for r in manifest['records']})==1000,'record ID uniqueness')
check(manifest['records'][:800]==base_manifest['records'],'prior 800 records changed')
check(manifest.get('theoryLessonAdditions')==base_manifest.get('theoryLessonAdditions'),'prior theory additions changed')
check(manifest.get('canonicalQuestionChanges')==base_manifest.get('canonicalQuestionChanges'),'prior canonical overlays changed')
check(len(manifest.get('theoryLessonAdditions',[]))==19,'theory addition count')
check(len(manifest.get('canonicalQuestionChanges',[]))==17,'canonical overlay count')

batch=next((b for b in manifest['batches'] if b['batchId']=='import-05'),None)
check(batch is not None,'batch 05 metadata missing')
records=manifest['records'][800:1000]
check([r['externalId'] for r in records]==json.loads((OUT/'external-ids.json').read_text()),'ordered exact set')
check(Counter(r['review']['runtimeStatus'] for r in records)==Counter(candidate=191,hold=8,choice_conflict=1),'batch states')
check(sum(bool(r.get('variantSpecificFeedbackRequired')) for r in records)==154,'variant-specific count')
check(Counter(r['review']['runtimeStatus'] for r in manifest['records'])==Counter(candidate=950,hold=40,choice_conflict=10),'cumulative states')
check(manifest['holdResolutionPolicy']['imageVerificationQueueCount']==40,'image policy count')
check(manifest['holdResolutionPolicy']['choiceConflictNonScoringCount']==10,'conflict policy count')
check(manifest['holdResolutionPolicy']['normalizedAndRegisteredCount']==5,'normalization policy count')
check(manifest['holdResolutionPolicy']['lowContextRegisteredCount']==5,'low-context policy count')

source_rows=[]
for sf in batch['sourceFiles']:
 p=ROOT/sf['path']; raw=p.read_text()
 check(sha(raw)==sf['sha256'],f"source hash {sf['path']}")
 source_rows.extend(readjl(p))
check({r['externalId'] for r in source_rows}=={r['externalId'] for r in records},'source exact set')

for r in records:
 eid=r['externalId']
 check(eid in v,f'{eid}: source variant')
 check(r['source']['registeredSourceUrl']==v[eid]['sourceUrl'],f'{eid}: source URL')
 check(r['source']['questionNumber']==r['questionNumber']==v[eid]['questionNumber'],f'{eid}: question number')
 check(sha(r['stem'])==r['source']['stemSha256'],f'{eid}: stem hash')
 check(sha(jd(r['choices']))==r['source']['orderedChoicesSha256'],f'{eid}: choices hash')
 check(len(r['choiceByChoiceReasons'])==len(r['choices']),f'{eid}: feedback count')
 check(all(x['choiceIndex']==i and x['choiceText']==r['choices'][i] for i,x in enumerate(r['choiceByChoiceReasons'])),f'{eid}: feedback alignment')
 check(r['canonicalId'] in q,f'{eid}: canonical exists')
 check(r['theoryLink']['lessonId'] in l,f'{eid}: lesson exists')
 check(any(b['id']==r['theoryLink']['lessonAnchor'] for b in l[r['theoryLink']['lessonId']]['blocks']),f'{eid}: anchor exists')
 if r['review']['runtimeStatus']=='candidate':
  ai=r['reviewedAnswerIndex'];check(isinstance(ai,int) and 0<=ai<len(r['choices']),f'{eid}: candidate answer')
  check(r['reviewedAnswerText']==f"{['①','②','③','④','⑤'][ai]} {r['choices'][ai]}",f'{eid}: answer text')
  can=q[r['canonicalId']]
  t=r['theoryLink']
  check((can['lessonId'],can['lessonAnchor'],can['conceptGroupId'],can['conceptId'])==(t['lessonId'],t['lessonAnchor'],t['conceptGroupId'],t['conceptId']),f'{eid}: canonical theory')
  if r.get('variantSpecificFeedbackRequired'):
   check(r['choiceIdMapping']==[] and 'variant_specific_choice_contract_pending' in r['review']['publicationBlockers'],f'{eid}: variant-specific blocker')
  else:
   check(len(r['choiceIdMapping'])==len(r['choices']),f'{eid}: mapping count')
   check(r['choiceIdMapping'][ai]==can['correctChoiceId'],f'{eid}: answer mapping')
 elif r['review']['runtimeStatus']=='hold':
  check(r['reviewedAnswerIndex'] is None and r['reviewedAnswerText']=='' and r['choiceIdMapping']==[],f'{eid}: hold answer disabled')
  check(r['review'].get('issueLabel')=='필수 이미지 확인',f'{eid}: hold label')
 elif r['review']['runtimeStatus']=='choice_conflict':
  check(r['reviewedAnswerIndex'] is None and r['reviewedAnswerText']=='' and r['choiceIdMapping']==[],f'{eid}: conflict answer disabled')
  check(r['directSolution'].startswith('선택지 충돌:'),f'{eid}: conflict explanation')
  check(r['choiceConflict']['choiceIndices']==[1,2],f'{eid}: conflict choices')

by={r['externalId']:r for r in records}
check(by['2014-4-Q87']['sourceAnswerIndex']==3 and by['2014-4-Q87']['reviewedAnswerIndex']==1,'Q87 correction')
check(by['2014-4-Q87']['choiceIdMapping']==['U-990-c2','U-990-c3','U-990-c1','U-990-c4'],'Q87 manual choice mapping')
check(not by['2014-4-Q87'].get('variantSpecificFeedbackRequired'),'Q87 choice contract readiness')
check(by['2014-4-Q87']['theoryLink']['lessonId']=='lesson-117o0xo','Q87 theory')
check(by['2014-2-Q40']['review']['runtimeStatus']=='choice_conflict','Q40 conflict')
check(by['2014-4-Q51']['currentCanonicalId']=='U-100' and by['2014-4-Q51']['canonicalId']=='U-362','Q51 canonical reassignment')
check(by['2014-4-Q51']['theoryLink']['lessonId']=='lesson-w8vtqs','Q51 theory reassignment')
check(hashlib.sha256((ROOT/'src/data/generated/content.json').read_bytes()).hexdigest()=='7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4','content unchanged')

result={
 'status':'PASS' if not fail else 'FAIL',
 'failureCount':len(fail),
 'failures':fail,
 'recordCount':len(records),
 'states':dict(Counter(r['review']['runtimeStatus'] for r in records)),
 'cumulativeRecordCount':len(manifest['records']),
 'cumulativeStates':dict(Counter(r['review']['runtimeStatus'] for r in manifest['records'])),
 'variantSpecificFeedbackPendingCount':sum(bool(r.get('variantSpecificFeedbackRequired')) for r in records),
 'priorRecordsUnchanged':manifest['records'][:800]==base_manifest['records'],
 'sourceContentUnchanged':True,
}
(OUT/'independent-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
if fail: raise SystemExit(1)
