# TASK_BREAKDOWN

문서 상태: Draft v0.1  
문서 목적: 실제 작업 착수를 위한 백로그 분해, 선행관계, 완료 기준 정의

## 1. 사용법

- 각 작업은 기능이 아니라 **검증 가능한 결과물** 단위로 쪼갠다.
- ID는 우선순위와 무관하며, `EPIC-번호` 형식으로 관리한다.
- 완료 기준은 “코드가 있다”가 아니라 “플레이/테스트로 검증된다”를 기준으로 적는다.

## 2. Epic 목록

| Epic | 주제 |
| --- | --- |
| E0 | 레포/개발 기반 |
| E1 | 공간/렌더링 기반 |
| E2 | 시뮬레이션 코어 |
| E3 | 사용자 입력 반영 |
| E4 | 관계/이벤트 |
| E5 | 저장/복구 |
| E6 | 콘텐츠/맵/해금 |
| E7 | UI/UX 폴리시 |
| E8 | AI 보조 연출 |
| E9 | 테스트/디버그/안정화 |

## 3. 상세 작업

### E0. 레포/개발 기반

| ID | 작업 | 산출물 | 선행 | 완료 기준 |
| --- | --- | --- | --- | --- |
| E0-01 | 모노레포 초기 구조 생성 | `apps/desktop`, `packages/*`, `docs/` 구조 | 없음 | 빈 레포가 아닌 실행 가능한 기본 구조가 준비됨 |
| E0-02 | 패키지 경계 규칙 문서화 | import 규칙, tsconfig path 기준 | E0-01 | sim-core에 UI 의존성이 들어가지 않음 |
| E0-03 | CI 기본 파이프라인 구성 | lint, type-check, test placeholder | E0-01 | PR 시 기본 검증이 자동 수행됨 |
| E0-04 | 에셋/맵 파일 규칙 확정 | 파일명 규칙, 폴더 규칙 | E0-01 | 아트와 엔지니어링이 같은 자산 위치를 사용 |
| E0-05 | 문서 세트 레포 반영 | 본 문서들 저장 | 없음 | 팀이 레포 문서만 보고 방향 이해 가능 |

### E1. 공간/렌더링 기반

| ID | 작업 | 산출물 | 선행 | 완료 기준 |
| --- | --- | --- | --- | --- |
| E1-01 | Phaser bootstrap 연결 | `PhaserBootstrap.ts`, `GameHost.tsx` | E0-01 | React 앱에서 Phaser 월드가 정상 마운트됨 |
| E1-02 | 기본 타일맵 로더 구현 | `TilemapLoader.ts` | E1-01 | 맵 파일이 화면에 렌더됨 |
| E1-03 | 카메라 이동/줌 기초 | `TownCameraController.ts` | E1-01 | 드래그/줌/기본 포커스 동작 |
| E1-04 | 충돌 레이어와 이동 가능 영역 연결 | collision 메타 | E1-02 | 캐릭터가 벽을 뚫지 않음 |
| E1-05 | 장소 진입점/앵커 포인트 로드 | interaction zone loader | E1-02 | 장소별 진입/정지 포인트 사용 가능 |
| E1-06 | char_a 기본 스프라이트/애니메이션 연결 | walk/idle/sit | E1-01 | A가 방향에 맞는 애니메이션을 재생 |
| E1-07 | OverlayScene 기초 구축 | 말풍선/아이콘 기초 | E1-01 | 월드 위에 diegetic 오버레이 표시 가능 |
| E1-08 | 이벤트 포커스 카메라 흐름 | EventScene or focus mode | E1-03 | 특정 이벤트 발생 시 부드럽게 포커스 이동 |

### E2. 시뮬레이션 코어

| ID | 작업 | 산출물 | 선행 | 완료 기준 |
| --- | --- | --- | --- | --- |
| E2-01 | shared-types의 시간/ID/커맨드 정의 | `ids.ts`, `time.ts`, `commands.ts` | E0-01 | 모든 패키지가 동일 계약 사용 |
| E2-02 | `WorldState` / `WorldClock` 정의 | core state 모델 | E2-01 | 하루/틱 상태를 저장 가능한 구조로 표현 |
| E2-03 | `SimRunner` 틱 오케스트레이션 | 시뮬레이션 진입점 | E2-02 | 1틱/다중 틱 진행 가능 |
| E2-04 | Deterministic RNG 도입 | `DeterministicRng.ts` | E2-03 | 동일 시드 재현 가능 |
| E2-05 | NeedSystem 구현 | 에너지/집중/놀이/사회성/스트레스 | E2-02 | 시간 경과와 행동에 따라 욕구가 변함 |
| E2-06 | RoutinePlanner 구현 | 하루 일정 블록 | E2-02 | A의 하루 스케줄 생성 가능 |
| E2-07 | IntentScorer 구현 | 행동 후보 점수화 | E2-05, E2-06 | 현재 의도 선택 이유 로그 확인 가능 |
| E2-08 | NavigationSystem 구현 | 장소 간 이동 경로 | E1-04, E2-07 | 캐릭터가 목적지까지 도달 가능 |
| E2-09 | ProjectionBuilder 초안 | `WorldProjection` 생성 | E2-03 | 렌더러가 소비 가능한 projection 제공 |
| E2-10 | HeadlessSimulationHarness 구축 | 헤드리스 테스트 | E2-03 | 화면 없이 1일 시뮬레이션 가능 |

### E3. 사용자 입력 반영

| ID | 작업 | 산출물 | 선행 | 완료 기준 |
| --- | --- | --- | --- | --- |
| E3-01 | ActivityInputPanel UX 설계 | 최소 입력 패널 | E0-05 | 화면을 과도하게 가리지 않는 UI 확정 |
| E3-02 | PlayerActionEntry 모델 연결 | input history 저장 | E2-01 | 입력이 정규 구조로 기록됨 |
| E3-03 | InfluenceInterpreter 구현 | 입력→신호 변환 | E3-02 | 카테고리별 bias 생성 가능 |
| E3-04 | 입력 후 재계산 트리거 연결 | replan hook | E2-06, E3-03 | 입력 후 일정/의도 재평가 발생 |
| E3-05 | 입력 결과 월드 피드백 | 아이콘/행동 차이 | E1-07, E3-04 | 입력 후 3분 이내 가시적 변화 확인 가능 |
| E3-06 | 입력 히스토리 최소 UI | 최근 행동 확인 | E3-02 | 대시보드화 없이 최근 입력 확인 가능 |

### E4. 관계/이벤트

| ID | 작업 | 산출물 | 선행 | 완료 기준 |
| --- | --- | --- | --- | --- |
| E4-01 | RelationshipEdge 모델 및 기본 규칙 | 관계 그래프 | E2-02 | A↔B 관계 수치 저장 가능 |
| E4-02 | proximity 기반 만남 판정 | 근접/동장소 감지 | E2-08 | 같은 장소에서 만남 기회 생성 |
| E4-03 | EventTemplate 데이터 구조 확정 | social event template schema | E2-01 | 이벤트를 데이터로 정의 가능 |
| E4-04 | EventDirector 구현 | 장면 생성기 | E4-02, E4-03 | 기본 이벤트 2종 이상 발생 |
| E4-05 | 관계 변화 적용 로직 | social outcomes | E4-01, E4-04 | 이벤트 후 관계가 변함 |
| E4-06 | 감정/대사/아이콘 연출 연결 | Overlay integration | E1-07, E4-04 | 이벤트가 시각적으로 읽힘 |
| E4-07 | 반복 억제 쿨다운 | recent event control | E4-04 | 같은 이벤트가 지나치게 반복되지 않음 |

### E5. 저장/복구

| ID | 작업 | 산출물 | 선행 | 완료 기준 |
| --- | --- | --- | --- | --- |
| E5-01 | SaveManifest/SaveSnapshot DTO 정의 | save contracts | E2-01 | 저장 구조가 문서와 일치 |
| E5-02 | SnapshotSerializer 구현 | 직렬화 계층 | E2-02, E5-01 | 월드 상태를 파일로 변환 가능 |
| E5-03 | JournalWriter 구현 | command/event journal | E2-03, E5-01 | 주요 명령과 이벤트가 로그로 남음 |
| E5-04 | Tauri SaveRepository 연결 | 네이티브 파일 I/O | E0-01, E5-02 | 실제 로컬 파일 저장 가능 |
| E5-05 | 저장 슬롯 UI | SaveSlotList/Card | E5-04 | 새 슬롯 생성/로드 가능 |
| E5-06 | 로드 후 상태 복원 | restore flow | E5-04 | 로드 후 projection과 월드가 일치 |
| E5-07 | SaveMigration 틀 마련 | version migration | E5-01 | saveVersion 증가에 대응 가능한 구조 |
| E5-08 | 비정상 종료 복구 시나리오 검증 | recovery test | E5-03, E5-04 | 마지막 정상 스냅샷 복구 가능 |

### E6. 콘텐츠/맵/해금

| ID | 작업 | 산출물 | 선행 | 완료 기준 |
| --- | --- | --- | --- | --- |
| E6-01 | char_a 데이터 확정 | profile/schedule/balance | E2-06 | A가 설명 가능한 하루를 가짐 |
| E6-02 | 핵심 장소 5개 메타 작성 | location json | E1-02 | 장소별 지원 행동과 수용 인원 정의 |
| E6-03 | 사회 이벤트 템플릿 4~6종 작성 | event data | E4-03 | 카페/도서관/공원/오락실 이벤트 가능 |
| E6-04 | char_b 데이터 및 해금 조건 작성 | profile + unlock | E4-01, E6-03 | char_b 해금 가능 |
| E6-05 | char_c 데이터 및 해금 조건 작성 | profile + unlock | E6-04 | char_c 해금 가능 |
| E6-06 | 확장 부지 메타와 시설 1종 정의 | facility + unlock | E6-02 | 시설 확장 트리거 가능 |
| E6-07 | 시설 2종(컴퓨터실/노래방) 정의 | content data | E6-06 | 설치 후 신규 행동/이벤트 활성화 |
| E6-08 | 장소별 아트/소품 1차 패스 | tile/prop set | E1-02 | 장소가 시각적으로 구분됨 |

### E7. UI/UX 폴리시

| ID | 작업 | 산출물 | 선행 | 완료 기준 |
| --- | --- | --- | --- | --- |
| E7-01 | 선택 캐릭터 포커스 UX | CharacterFocusCard | E1-03 | 캐릭터 추적/선택이 자연스러움 |
| E7-02 | 배속/일시정지 UX | basic session controls | E1-03 | 1x/2x/4x와 pause 사용 가능 |
| E7-03 | 해금 알림/토스트 | unlock presentation | E4-04 | 해금 순간이 분명히 전달됨 |
| E7-04 | 정보 패널 최소화 리뷰 | UX review checklist | E0-05 | 새 UI가 월드 중심 원칙을 해치지 않음 |
| E7-05 | 카메라 자동 포커스 UX 튜닝 | focus resolver | E1-08 | 자동 이동이 거슬리지 않음 |
| E7-06 | 온보딩 문구 | privacy/local-first messaging | E3-01 | 수동 입력/로컬 저장 정책을 이해 가능 |

### E8. AI 보조 연출

| ID | 작업 | 산출물 | 선행 | 완료 기준 |
| --- | --- | --- | --- | --- |
| E8-01 | AIProvider 계약 정의 | ai contracts | E2-01 | 모의/실제 provider 교체 가능 |
| E8-02 | Template fallback 일기 | template diary | E4-04 | AI 없이도 하루 회고 생성 가능 |
| E8-03 | DialogueComposer 초안 | 짧은 대사 생성 | E4-04, E8-01 | 이벤트 기반 대사 출력 가능 |
| E8-04 | EventSummaryComposer 초안 | 이벤트 요약 | E4-04, E8-01 | 최근 이벤트 묶음 요약 가능 |
| E8-05 | ArtifactCache 연결 | cache layer | E8-02 | 동일 요청 재사용 가능 |
| E8-06 | AI 실패 graceful fallback | fallback policy | E8-01, E8-02 | AI 오류가 게임 진행을 막지 않음 |

### E9. 테스트/디버그/안정화

| ID | 작업 | 산출물 | 선행 | 완료 기준 |
| --- | --- | --- | --- | --- |
| E9-01 | 행동 선택 디버그 오버레이 | intent reasons overlay | E2-07 | 왜 그런 선택을 했는지 확인 가능 |
| E9-02 | 최근 이벤트 로그 패널 | event log | E4-04 | 최근 50개 이벤트 추적 가능 |
| E9-03 | stuck 감지와 경고 로그 | movement guard | E2-08 | 이동 불능 사례 감지 가능 |
| E9-04 | 7일 소크 테스트 | headless soak suite | E2-10, E5-06 | 7일 무중단 실행 |
| E9-05 | 30일 장기 소크 테스트 | extended soak | E9-04 | 장기 오류/루프 발견 가능 |
| E9-06 | 저장 호환 테스트 | snapshot migration tests | E5-07 | 이전 버전 저장 로드 가능 |
| E9-07 | 이벤트 반복률 리포트 | content balance report | E4-07 | 반복 편향을 수치로 확인 가능 |
| E9-08 | 성능 예산 점검 | profiling baseline | E1-01, E2-10 | 표준 환경에서 프레임 드랍 허용 범위 내 |

## 4. 첫 구현 시 반드시 완료할 묶음

### Vertical Slice 핵심 묶음

- E0-01 ~ E0-05
- E1-01 ~ E1-06
- E2-01 ~ E2-09
- E3-01 ~ E3-05
- E6-01 ~ E6-03

### Alpha 핵심 묶음

- E4-01 ~ E4-07
- E5-01 ~ E5-06
- E6-04
- E7-01 ~ E7-05
- E9-01 ~ E9-04

### Beta 핵심 묶음

- E5-07 ~ E5-08
- E6-05 ~ E6-08
- E8-01 ~ E8-06
- E9-05 ~ E9-08

## 5. 작업 착수 순서 권장

1. 레포/문서/자산 규칙
2. 맵 로딩과 카메라
3. char_a 이동
4. WorldClock / NeedSystem / RoutinePlanner
5. IntentScorer / Navigation / Projection
6. 사용자 입력 반영
7. 관계/이벤트
8. 저장/복구
9. char_b 해금
10. 장기 안정화
11. AI 보조 연출
12. char_c와 확장 시설

## 6. 작업 완료 판단 질문

- 이 작업이 마을 화면에서 실제로 보이는 변화를 만들었는가?
- 이 작업이 시뮬레이션 중심 방향을 강화했는가?
- 같은 결과를 더 단순한 구조로 만들 수 있지 않은가?
- 새로 추가한 UI가 월드를 가리지 않는가?
- 새 데이터/기능이 저장 포맷에 어떤 영향을 주는가?
