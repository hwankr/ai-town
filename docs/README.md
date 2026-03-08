# AI Town

초기 설계 문서를 바탕으로 `apps/desktop`, `packages/*`, `docs/`를 갖춘 모노레포 부트스트랩이다.

## Workspace 구성

- `apps/desktop`: React 기반 데스크톱 앱 셸 + `src-tauri` 플레이스홀더
- `packages/shared-types`: 공통 타입 계약
- `packages/sim-core`: 권위 시뮬레이션 코어 스텁
- `packages/game-renderer`: 월드 렌더러 경계 스텁
- `packages/content-data`: 초기 콘텐츠 데이터 샘플
- `packages/ai-bridge`: AI 연출 브리지 스텁
- `docs/`: 원본 설계 문서 미러

## 시작하기

```bash
npm install
npm run dev
```

## 현재 범위

이 단계는 `TASK_BREAKDOWN.md`의 E0-01(모노레포 초기 구조 생성)에 맞춰,
실행 가능한 기본 구조를 만드는 데 집중한다. Phaser/Tauri 실연동은 후속 단계에서 진행한다.
