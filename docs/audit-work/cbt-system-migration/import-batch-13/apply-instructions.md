# 배치 13 적용 지침

## 적용 기준

이 패키지는 다음 기준에만 직접 적용한다.

- 저장소: `HeungJAELEE/selbibojean`
- 기준 커밋: `c064ec3c2293d036ebfa4d4710c0ce9d56407bc8`
- `src/data/generated/content.json` SHA-256:
  `7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4`

둘 중 하나라도 다르면 파일을 덮어쓰지 말고, 현재 저장소 변경과 canonical·theory 링크를 다시 대조한다.

## 적용 방법

1. 기준 커밋에서 별도 작업 브랜치를 만든다.
2. ZIP의 최상위 `cbt-system-import-batch13/` 아래 내용을 저장소 루트에 덮어쓴다.
3. Node.js 24.x를 사용한다.
4. lockfile 기준으로 의존성을 설치한다. 예: `npm ci`.
5. 아래 명령을 모두 실행한다.

```bash
npm run verify:node-runtime
npm run verify:data
npm run typecheck
npm run lint
npm run test -- --maxWorkers=1
npm run build
npm run test:rls
npm run test:e2e
```

6. 모든 공식 명령이 PASS하기 전에는 candidate를 `published`로 승격하거나 배포하지 않는다.

## 주의

- 배치 13 패키지의 `cbt-reviewed-variants.json`에는 remediation이 이미 반영돼 있다. `remediate-repository-integration-contracts.py`를 최종 manifest에 다시 실행하지 않는다.
- remediation 스크립트는 배치 12 manifest에서 배치 13 결과를 재현하기 위한 감사용 파일이다.
- 97개 이미지 HOLD, 1개 정답키 충돌 HOLD, 19개 선택지 충돌, 1,709개 variant 전용 선택지 계약 대기는 그대로 유지된다.
