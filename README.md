# AI Town

E0-01 기준 모노레포 초기 구조가 준비된 상태입니다.

## Workspace

- `apps/desktop` — React + TypeScript 앱 셸, `src-tauri` 플레이스홀더 포함
- `packages/shared-types` — 공통 타입 계약
- `packages/sim-core` — 순수 TypeScript 시뮬레이션 코어
- `packages/game-renderer` — 렌더러 패키지 자리
- `packages/content-data` — 콘텐츠 데이터 패키지 자리
- `packages/ai-bridge` — AI 연동 패키지 자리
- `docs/` — 설계 문서 원본

## Commands

```bash
npm install
npm run build
npm run dev
```

## Docs

- 문서 인덱스: `docs/README.md`
- 작업 분해: `docs/TASK_BREAKDOWN.md`
