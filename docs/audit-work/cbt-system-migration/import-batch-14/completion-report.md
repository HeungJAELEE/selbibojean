# CBT Batch 14 공식 통합·동작검사 반영 보고서

## 판정

```text
GATE_0_BASELINE: PASS
GATE_1_CUMULATIVE_INTEGRATION: PASS_LOCAL_RELEASE_BRANCH
GATE_2_CONTRACT_REPAIRS: PASS_SUPPLEMENTAL
GATE_3_OFFICIAL_VALIDATION: BLOCKED_DEPENDENCY_REGISTRY
MERGE_AND_DEPLOY: NO_GO
```

## 기준점

- 저장소: `HeungJAELEE/selbibojean`
- 원격 기준 브랜치: `codex/cbt-reviewed-import-batches01-07-20260807`
- 원격 기준 커밋: `7ff1815fc97d4cb58059c1345d943d8d871c8042`
- 기준 tree: `1d7deb9086607eef163fef7769b8a5746391f771`
- `content.json` SHA-256: `7861cd4247438a6b7e62cc346ab7ad743ef57c93d9811a2b2e6e2e56080e50d4`

## 반영한 변경

1. 배치 01~13의 2,384개 reviewed-CBT 누적 산출물을 정확한 원격 tree에 재통합했다.
2. canonical overlay의 비표준 blocker·verification·risk tag·audit 값을 기존 도메인 계약으로 정규화했다.
3. 과거 accepted audit가 후속 answer-conflict·mapping hold를 다시 공개하지 못하도록 promotion gate를 강화했다.
4. `record_attempt`가 서버 answer key로 정답을 재계산하고 user-scoped UUID로 멱등 처리하도록 migration을 추가했다.
5. 제출 API가 인증·DB 저장 실패 시 정답 피드백을 성공 응답으로 반환하지 않도록 fail-closed 처리했다.
6. legacy guest merge의 UUID를 배열 순서와 무관하게 만들고 부분 병합·재시도를 안전하게 했다.
7. 구조 pgTAP 외에 cross-user RLS, answer-key 비공개, 위조 정답, 타 사용자 session, 중복 retry를 검증하는 행위 테스트를 추가했다.
8. `Quality gate`, `Database gate`, `Release E2E` 워크플로와 데스크톱·모바일 release Playwright 구성을 추가했다.
9. npm 10.9.2를 단일 package manager로 고정하고 pnpm 정본을 제거했다.

## reviewed-CBT 상태

| 항목 | 수량 |
|---|---:|
| 전체 | 2,384 |
| candidate | 2,267 |
| HOLD | 98 |
| choice conflict | 19 |
| published | 0 |
| 신규 이론 | 20 |
| canonical 변경 | 19 |

reviewed 변형은 이번 배치에서도 자동 공개하지 않았다. 런타임·과거 기출 예시·Supabase projection 모두 `reviewState=published`를 명시적으로 요구한다.

## 보조 검증 PASS

- Node.js 24.11.1 runtime 확인
- release invariant
- 전체 2,384문항 reviewed-CBT verifier
- source answer-leak
- generated data
- CBT source audit
- 실기 데이터·필답 governance·이론 coverage·작업 콘텐츠
- 변경 TypeScript/TSX 35개 구문 검사
- release source/config `git diff --check` (imported historical patch/log artifacts excluded)
- deterministic guest attempt UUID: retry 안정성·배열 순서 독립성·서로 다른 시도 분리
- 런타임 공개 수량: 문제 1,490 / 레슨 1,283
- reviewed 변형 Supabase published 행: 0
- 차단 canonical 7건 모두 비공개

이 검사는 TypeScript loader와 실행 전용 Zod shim을 사용한 보조 검사다. 정확한 lockfile 의존성을 설치한 공식 typecheck·Vitest·ESLint·build를 대체하지 않는다.

## 공식 검증 blocker

현재 Node.js와 npm 버전은 요구 조건을 충족한다. 하지만 현재 컨테이너의 npm mirror가 잠긴 의존성 tarball에 404를 반환했다.

```text
zwitch@2.0.4                404
zod-validation-error@4.0.2 404 (local diagnostic substitution 후 확인)
zod@4.4.3                  404 (local diagnostic substitution 후 확인)
```

외부 npm registry는 현재 컨테이너에서 DNS/network가 차단돼 사용할 수 없었다. Docker, Supabase CLI, psql도 없어 DB 및 브라우저 release gate를 실행하지 않았다.

따라서 다음 항목은 PASS로 보고하지 않는다.

- `npm ci`
- 공식 TypeScript semantic typecheck
- ESLint
- Vitest
- production build
- build answer-leak
- Supabase migration/lint/pgTAP
- Playwright release E2E
- remote push·PR·Sites version 저장·production 배포

## 다음 승인 조건

정확한 패키지를 release 브랜치에 적용한 뒤 GitHub에서 다음 세 required workflow가 모두 PASS해야 한다.

1. `Quality gate`
2. `Database gate`
3. `Release E2E`

세 workflow 통과 전에는 merge·Sites 저장·production 배포를 수행하지 않는다.

## 로컬 전달 상태

- 정확한 원격 tree를 부모로 하는 로컬 release 브랜치에 전체 변경을 커밋한다.
- 커밋 SHA와 tree SHA는 자기참조를 피하기 위해 package 외부의 `postcommit-validation.json`에 기록한다.
- 원격 push·PR·Sites version 저장·production 배포는 공식 CI 통과와 별도 배포 승인 전까지 수행하지 않는다.
