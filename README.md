# 설비보전 마스터북

Notion의 설비보전기사 이론서를 검색·진도·문제풀이 중심의 공개 학습 사이트로 변환한 vinext 프로젝트입니다.

## 현재 콘텐츠

- 원문 507,673자
- 제목 556개
- 표 49개
- 본문 이미지 125개
- 원문 학습 페이지 70개와 검수형 핵심 해설 57개

H4 단위의 짧은 조각은 H3 개념 페이지 안의 소제목과 앵커로 다시 묶었습니다. 원문 본문은 페이지별 JSON으로 분리해 선택한 내용만 불러오고, 전체 본문 검색 색인도 첫 검색 때만 내려받습니다. 사용 승인을 받은 원문 이미지 125개는 검증된 해시 파일명으로 자체 저장하며 본문의 원래 위치에서 지연 로딩합니다.

## 실행과 검증

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
npm test
npm run lint
```

`npm test`는 빌드와 함께 카탈로그·검색 색인·토픽 본문의 수량, ID 연결, 허용 블록, 민감한 임시 URL 및 로컬 경로 유출, 이미지 공개 권한을 검사합니다.

## Notion 원문 다시 가져오기

커넥터로 수집한 원문과 매니페스트를 각각 아래 위치에 둡니다. `work/`는 비공개 작업 영역이며 Git에 포함되지 않습니다.

```text
work/notion-source/main.md
work/notion-source/source-manifest.json
work/notion-source/image-map.json
work/notion-source/assets/*
```

Python 3.12 이상으로 변환기를 실행합니다.

```bash
python scripts/import_notion_source.py
```

생성 결과:

```text
app/generated/notion-catalog.json
public/generated/search-index.json
public/generated/topics/*.json
public/notion-images/*
work/notion-import-report.json
```

변환기는 원문의 제목·표·이미지 수량이 기준과 다르거나, 승인된 125개 이미지의 해시·MIME·크기·안전 검사가 어긋나거나, 공개 JSON에 AWS 서명값·Notion 비공개 래퍼·로컬 경로가 남아 있거나, 본문 및 검색 색인의 ID가 맞지 않으면 실패합니다.

## 콘텐츠 운영 원칙

- Notion은 편집 원본, 웹사이트는 검증된 공개 학습판으로 사용합니다.
- `Notion 원문`, `상세 해설`, `출제 예상·변형` 등 자료 성격을 구분합니다.
- 법령·수치·공식은 검토 기준일과 검증 상태를 함께 표시합니다.
- 이미지 파일은 승인된 현재 원문 스냅샷만 자체 저장소로 옮기며 새 이미지가 자동 공개되지 않도록 이미지 집합 해시를 고정합니다.
