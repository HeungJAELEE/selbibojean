from __future__ import annotations
import copy, hashlib, json
from pathlib import Path

ROOT=Path('/mnt/data/cbt_batch06_work/repo')
OUT=ROOT/'docs/audit-work/cbt-system-migration/import-batch-06'
MANIFEST=ROOT/'src/data/generated/cbt-reviewed-variants.json'
manifest=json.loads(MANIFEST.read_text(encoding='utf-8'))

def sha(value):
    return hashlib.sha256(json.dumps(value,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()

def record_by_id(data,eid):
    return next(r for r in data['records'] if r['externalId']==eid)

def validate_digest(data):
    # Manifest generator uses default JSON separators with ensure_ascii=False? Verify against stored via exact file conventions.
    actual=hashlib.sha256(json.dumps(data['records'],ensure_ascii=False,separators=(',', ':')).encode()).hexdigest()
    # Fall back to repository's JS JSON.stringify equivalent: separators compact, non-ascii literal.
    if actual != data['recordsSha256']:
        raise ValueError('records digest mismatch')

def validate_hold(r):
    if not (
        r['review']['verdict']=='HOLD' and
        r['review'].get('issueLabel')=='필수 이미지 확인' and
        r['review']['scoringDisposition']=='excluded_required_image' and
        r['reviewedAnswerIndex'] is None and
        r['reviewedAnswerText']=='' and
        len(r['choiceIdMapping'])==0 and
        'required_source_image_review' in r['review']['publicationBlockers'] and
        len(r['review']['holdReasons'])>0
    ):
        raise ValueError(f"Reviewed CBT image hold is invalid: {r['externalId']}")

def validate_conflict(r):
    c=r.get('choiceConflict')
    if not (
        r['review']['verdict']=='CHOICE_ISSUE' and
        r['review'].get('issueLabel')=='선택지 충돌' and
        r['review']['scoringDisposition']=='non_scoring_choice_conflict' and
        r['reviewedAnswerIndex'] is None and
        r['reviewedAnswerText']=='' and
        len(r['choiceIdMapping'])==0 and
        r['directSolution'].startswith('선택지 충돌:') and
        c and c['label']=='선택지 충돌' and c['scoringPolicy']=='non_scoring' and
        len(c['choiceIndices'])>=2 and len(set(c['choiceIndices']))==len(c['choiceIndices'])
    ):
        raise ValueError(f"Reviewed CBT choice conflict is invalid: {r['externalId']}")

def validate_variant_specific(r):
    if r.get('variantSpecificFeedbackRequired'):
        if not (
            r['review']['runtimeStatus']!='published' and
            len(r['choiceIdMapping'])==0 and
            'variant_specific_choice_contract_pending' in r['review']['publicationBlockers']
        ):
            raise ValueError(f"Reviewed CBT variant-specific choice contract is invalid: {r['externalId']}")

def validate_q69(r):
    if not (
        r['currentCanonicalId']=='U-889' and r['canonicalId']=='U-390' and
        r['theoryLink']['canonicalId']=='U-390' and
        r['theoryLink']['lessonId']=='lesson-18pfbo5' and
        r['theoryLink']['conceptGroupId']=='s4-g14' and
        r['migration']['canonicalAction']=='REASSIGN_CANONICAL'
    ):
        raise ValueError('2015-4-Q69 canonical/theory reassignment contract failed')

def validate_low_context(r):
    if not (
        r['review']['runtimeStatus']=='candidate' and
        r['review']['theoryLinkStatus']=='direct_existing_theory_low_context_exam_intent' and
        r['review']['answerConflictOrMultipleAnswerRisk'].strip()
    ):
        raise ValueError(f"Low-context registration contract failed: {r['externalId']}")

def reject(name, mutate, validator):
    data=copy.deepcopy(manifest)
    mutate(data)
    try:
        validator(data)
    except Exception as exc:
        return {'name':name,'status':'PASS','message':str(exc)}
    return {'name':name,'status':'FAIL','message':'mutation was not rejected'}

results=[]
results.append(reject(
    'image hold cannot carry an active answer',
    lambda d: record_by_id(d,'2015-4-Q88').update({'reviewedAnswerIndex':1,'reviewedAnswerText':'② 변조'}),
    lambda d: validate_hold(record_by_id(d,'2015-4-Q88')),
))
results.append(reject(
    'variant-specific candidate cannot be published without choice contract',
    lambda d: record_by_id(d,'2015-4-Q69')['review'].update({'runtimeStatus':'published'}),
    lambda d: validate_variant_specific(record_by_id(d,'2015-4-Q69')),
))
results.append(reject(
    'choice conflict cannot carry an active answer',
    lambda d: record_by_id(d,'2015-4-Q55').update({'reviewedAnswerIndex':0,'reviewedAnswerText':'① 변조'}),
    lambda d: validate_conflict(record_by_id(d,'2015-4-Q55')),
))
results.append(reject(
    'canonical reassignment cannot drift back to U-889',
    lambda d: (record_by_id(d,'2015-4-Q69').update({'canonicalId':'U-889'}), record_by_id(d,'2015-4-Q69')['theoryLink'].update({'canonicalId':'U-889'})),
    lambda d: validate_q69(record_by_id(d,'2015-4-Q69')),
))
results.append(reject(
    'low-context registration cannot be silently changed to hold',
    lambda d: record_by_id(d,'2015-2-Q49')['review'].update({'runtimeStatus':'hold'}),
    lambda d: validate_low_context(record_by_id(d,'2015-2-Q49')),
))
# Digest check using exact JS JSON.stringify equivalent. First verify baseline independently.
baseline_digest=hashlib.sha256(json.dumps(manifest['records'],ensure_ascii=False,separators=(',', ':')).encode()).hexdigest()
if baseline_digest != manifest['recordsSha256']:
    raise SystemExit(f'baseline digest convention mismatch: {baseline_digest} != {manifest["recordsSha256"]}')
results.append(reject(
    'records digest tamper is rejected',
    lambda d: record_by_id(d,'2015-2-Q01').update({'stem':'tampered'}),
    validate_digest,
))

payload={
    'status':'PASS' if all(r['status']=='PASS' for r in results) else 'FAIL',
    'scope':'batch06_supplemental_negative_contract_mutations',
    'nodeVersion':'v22.16.0',
    'officialNode24Validation':False,
    'results':results,
    'limitations':['Supplemental Python mutation checks do not replace the official Node.js 24 repository test suite.']
}
(OUT/'negative-contract-validation.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'negative-contract-validation.log').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(payload,ensure_ascii=False,indent=2))
if payload['status']!='PASS': raise SystemExit(1)
