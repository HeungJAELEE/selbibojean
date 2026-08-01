# 설비마스터 저장소 지침

- 사용자 확정 스택은 Next.js App Router, TypeScript, Tailwind, Zod, Supabase, Vercel이다.
- 27차 엑셀 행 데이터가 수량과 문제의 기준이며, 28차 요약은 44개 세부항목군과 이론 갭 보강 기준이다.
- 공개 문제는 정답·해설·선택지별 설명·이론 연결이 모두 검증된 경우만 허용한다.
- 답안 제출 전 클라이언트 응답에 정답, 해설, 선택지 피드백을 포함하지 않는다.
- 법령·안전·표준·제조사 조건은 출처 확인 전 자동 발행하지 않는다.
- 외부 배포, 유료 자원 생성, 도메인 전환, 운영 공개는 사용자 승인 전 실행하지 않는다.
- 원본 엑셀과 자격 증명을 저장소에 커밋하지 않는다.
- 개발·테스트·빌드 런타임은 Node.js 24.x만 사용한다. 실행 전 `node --version`을 확인하고 v24가 아니면 Codex workspace dependencies의 Node.js 24 실행 파일과 동일한 런타임을 자식 프로세스에도 적용한다.

## Subagent Runtime Degradation

- 하위 에이전트가 `stream disconnected before completion: Encrypted function output content could not be decrypted or decoded.`로 종료되면 제품 코드나 작업 내용의 실패로 간주하지 않고 병렬 런타임을 `DEGRADED`로 기록한다.
- 같은 역할·같은 작업을 그대로 재시도하지 않는다. 독립된 역할 두 개에서 동일 오류가 확인되면 현재 Task의 추가 하위 에이전트 호출을 중단하고 중앙 에이전트가 남은 작업을 직접 이어받는다.
- 실패한 하위 에이전트의 PASS·변경·검증을 추정하지 않으며 실제 공유 작업트리와 세션 로그를 확인한다.
- 보고에는 오류 문자열, 발생 횟수, 영향받은 역할, 중앙 세션으로 인계한 범위를 남긴다.
- 원인 분리를 위한 Plugin·Hook·Model·config 변경은 현재 작업 중 우회책으로 실행하지 않는다. 별도 승인된 재시작 기반 A/B 진단에서만 한 요소씩 변경한다.
