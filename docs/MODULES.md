# MODULES

문서 상태: Draft v0.1  
문서 목적: 패키지/모듈/파일 책임을 실제 레포 수준으로 구체화

## 1. 모듈 설계 원칙

- 모듈은 “기술 프레임워크”보다 “역할” 기준으로 나눈다.
- sim-core는 순수 도메인 로직 모듈로 유지한다.
- 렌더러는 표현 모듈로 한정한다.
- 앱 셸은 UI와 세션 흐름을 담당한다.
- 콘텐츠 데이터는 코드와 분리해 확장성을 확보한다.
- AI는 독립 패키지로 분리해 붙였다 뗄 수 있게 한다.

## 2. 패키지 개요

| 패키지/앱 | 경로 | 역할 |
| --- | --- | --- |
| Desktop App | `apps/desktop` | 실제 배포 앱, React/Tauri 진입점 |
| shared-types | `packages/shared-types` | 공통 타입, DTO, enum, ID 규칙 |
| sim-core | `packages/sim-core` | 권위 시뮬레이션 로직 |
| game-renderer | `packages/game-renderer` | Phaser 기반 월드 렌더러 |
| content-data | `packages/content-data` | 캐릭터/시설/이벤트/밸런스 데이터 |
| ai-bridge | `packages/ai-bridge` | LLM 연결 및 fallback 텍스트 계층 |

## 3. `apps/desktop` 상세

### 3.1 목적

- React 앱 셸 제공
- Phaser 캔버스 호스팅
- 사용자 입력 UI 제공
- 저장 슬롯 UX 제공
- Tauri 커맨드 브리지 보유

### 3.2 제안 폴더 구조

```text
apps/desktop/src/
├─ app/
│  ├─ providers/
│  │  ├─ QueryProvider.tsx
│  │  ├─ SimulationProvider.tsx
│  │  └─ SettingsProvider.tsx
│  ├─ layout/
│  │  ├─ AppShell.tsx
│  │  └─ GameViewportLayout.tsx
│  └─ routes/
│     ├─ HomeRoute.tsx
│     └─ SettingsRoute.tsx
├─ bridges/
│  ├─ sim/
│  │  ├─ SimulationHost.ts
│  │  ├─ InProcessSimulationHost.ts
│  │  └─ WorkerSimulationHost.ts
│  ├─ tauri/
│  │  ├─ SaveRepository.ts
│  │  ├─ SettingsRepository.ts
│  │  └─ NativePaths.ts
│  └─ ai/
│     └─ AIServiceAdapter.ts
├─ features/
│  ├─ activity-input/
│  │  ├─ ActivityInputPanel.tsx
│  │  ├─ ActivityInputController.ts
│  │  └─ activityInputViewModel.ts
│  ├─ character-focus/
│  │  ├─ CharacterFocusCard.tsx
│  │  └─ useCharacterFocus.ts
│  ├─ saves/
│  │  ├─ SaveSlotList.tsx
│  │  ├─ SaveSlotCard.tsx
│  │  └─ useSaveSlots.ts
│  ├─ unlocks/
│  │  ├─ UnlockToast.tsx
│  │  └─ UnlockTimeline.tsx
│  └─ notifications/
│     ├─ NotificationStack.tsx
│     └─ notificationStore.ts
├─ stores/
│  ├─ uiStore.ts
│  ├─ sessionStore.ts
│  ├─ settingsStore.ts
│  └─ debugStore.ts
├─ game/
│  ├─ GameHost.tsx
│  ├─ PhaserBootstrap.ts
│  ├─ projection/
│  │  ├─ worldProjectionSelectors.ts
│  │  └─ renderFrameMapper.ts
│  └─ interactions/
│     └─ worldPointerController.ts
└─ main.tsx
```

### 3.3 핵심 파일 책임

| 파일 | 책임 |
| --- | --- |
| `GameHost.tsx` | Phaser renderer lifecycle 생성/파괴 |
| `SimulationProvider.tsx` | SimulationHost 인스턴스 공급 |
| `ActivityInputPanel.tsx` | 사용자 생활 입력 UI |
| `ActivityInputController.ts` | 입력 검증 및 커맨드 생성 |
| `SaveRepository.ts` | Tauri save command 호출 어댑터 |
| `uiStore.ts` | 패널 열림, 카메라 모드 등 UI 상태 |
| `sessionStore.ts` | 현재 세션/슬롯/선택 캐릭터 상태 |
| `debugStore.ts` | 개발용 오버레이 토글 |

## 4. `packages/shared-types`

### 4.1 목적

모든 계층이 공유하는 공통 계약을 분리한다.

### 4.2 제안 파일

| 파일 | 책임 |
| --- | --- |
| `src/ids.ts` | ID 규칙, 슬롯/캐릭터/장소 식별자 타입 |
| `src/time.ts` | 게임 시간 타입, Tick, DayIndex 등 |
| `src/commands.ts` | 사용자/시스템 커맨드 타입 |
| `src/events.ts` | 월드 이벤트 타입 |
| `src/projection.ts` | 렌더러용 projection 타입 |
| `src/save.ts` | snapshot, manifest, journal DTO |
| `src/content.ts` | 콘텐츠 데이터 구조 타입 |
| `src/ai.ts` | AI request/response 계약 |

### 4.3 규칙

- 이 패키지는 React/Phaser/Tauri 의존성을 가지지 않는다.
- 모든 ID는 문자열이지만, 접두 규칙으로 의미를 분리한다.  
  예: `char_a`, `loc_library`, `fac_arcade`, `slot_001`

## 5. `packages/sim-core`

### 5.1 목적

게임의 진실 원천이 되는 시뮬레이션 로직을 담는다.

### 5.2 제안 폴더 구조

```text
packages/sim-core/src/
├─ core/
│  ├─ SimRunner.ts
│  ├─ WorldState.ts
│  ├─ WorldClock.ts
│  ├─ CommandQueue.ts
│  └─ DeterministicRng.ts
├─ systems/
│  ├─ NeedSystem.ts
│  ├─ RoutinePlanner.ts
│  ├─ IntentScorer.ts
│  ├─ NavigationSystem.ts
│  ├─ RelationshipSystem.ts
│  ├─ MemorySystem.ts
│  ├─ EventDirector.ts
│  ├─ UnlockSystem.ts
│  └─ InfluenceInterpreter.ts
├─ domain/
│  ├─ character/
│  │  ├─ CharacterAggregate.ts
│  │  ├─ CharacterStateFactory.ts
│  │  └─ characterRules.ts
│  ├─ location/
│  │  ├─ LocationState.ts
│  │  └─ occupancyRules.ts
│  └─ social/
│     ├─ SocialEventFactory.ts
│     └─ relationshipRules.ts
├─ projection/
│  ├─ ProjectionBuilder.ts
│  ├─ CharacterProjection.ts
│  └─ WorldProjection.ts
├─ serialization/
│  ├─ SnapshotSerializer.ts
│  ├─ JournalWriter.ts
│  └─ SaveMigration.ts
└─ testing/
   ├─ ReplayHarness.ts
   ├─ HeadlessSimulationHarness.ts
   └─ ScenarioFixtures.ts
```

### 5.3 핵심 파일 책임

| 파일 | 책임 | 비고 |
| --- | --- | --- |
| `SimRunner.ts` | 틱 순서 총괄, 시스템 호출 orchestration | sim-core 진입점 |
| `WorldState.ts` | 현재 세계 상태 aggregate 정의 | 저장 가능한 원본 |
| `WorldClock.ts` | 날짜/시간/배속/틱 관리 | deterministic |
| `NeedSystem.ts` | 욕구 감소/회복/행동 반영 | 에너지, 집중, 스트레스 등 |
| `RoutinePlanner.ts` | 하루 큰 일정 블록 구성 | 장기 계획 |
| `IntentScorer.ts` | 지금 행동 후보 점수화 | 단기 의사결정 |
| `NavigationSystem.ts` | 목적지 선택 후 경로 산출 | 공간 중심 게임의 핵심 |
| `RelationshipSystem.ts` | 친숙도/신뢰/호감/마찰 갱신 | 관계 변화 |
| `MemorySystem.ts` | 최근 사건을 기억으로 적재/감쇠 | 반복 억제와 개성 강화 |
| `EventDirector.ts` | 장면 후보를 생성하고 연출용 이벤트 발행 | 관찰 재미 밀도 담당 |
| `UnlockSystem.ts` | 캐릭터/시설 해금 조건 판정 | 진행 구조 |
| `InfluenceInterpreter.ts` | 사용자 입력을 영향 신호로 변환 | 사용자 생활 ↔ 마을 연결 |
| `ProjectionBuilder.ts` | 렌더러용 읽기 모델 생성 | 권위 상태와 분리 |
| `SnapshotSerializer.ts` | world state ↔ save DTO 직렬화 | 로컬 저장 |
| `ReplayHarness.ts` | 동일 입력 재현 테스트 | 디버깅 필수 |

### 5.4 절대 금지 의존성

- `phaser`
- `react`
- `zustand`
- `@tauri-apps/api`

## 6. `packages/game-renderer`

### 6.1 목적

Phaser 기반으로 월드 공간과 캐릭터를 표현한다.

### 6.2 제안 폴더 구조

```text
packages/game-renderer/src/
├─ scenes/
│  ├─ BootScene.ts
│  ├─ WorldScene.ts
│  ├─ OverlayScene.ts
│  └─ EventScene.ts
├─ entities/
│  ├─ CharacterSpriteController.ts
│  ├─ LocationHotspotController.ts
│  └─ WorldDecorationController.ts
├─ maps/
│  ├─ TilemapLoader.ts
│  ├─ CollisionLayerBuilder.ts
│  └─ InteractionZoneLoader.ts
├─ cameras/
│  ├─ TownCameraController.ts
│  └─ CameraFocusResolver.ts
├─ overlays/
│  ├─ EmoteBubble.ts
│  ├─ SpeechBubble.ts
│  └─ SelectionMarker.ts
├─ adapters/
│  ├─ RendererBridge.ts
│  ├─ ProjectionApplier.ts
│  └─ FrameInterpolation.ts
└─ index.ts
```

### 6.3 핵심 파일 책임

| 파일 | 책임 |
| --- | --- |
| `BootScene.ts` | 에셋 프리로드 및 초기 씬 전환 |
| `WorldScene.ts` | 타일맵, 캐릭터 위치 반영, 월드 메인 렌더 |
| `OverlayScene.ts` | 말풍선/감정 아이콘/선택 마커 |
| `EventScene.ts` | 중요한 이벤트 포커스 연출 |
| `CharacterSpriteController.ts` | projection을 스프라이트 상태로 변환 |
| `TownCameraController.ts` | 자유 이동/추적/자동 포커스 처리 |
| `ProjectionApplier.ts` | sim-core projection diff를 엔티티에 적용 |
| `FrameInterpolation.ts` | 틱 기반 위치를 렌더 프레임으로 부드럽게 보간 |

### 6.4 렌더러 규칙

- projection에 없는 도메인 값을 임의 생성하지 않는다.
- 중요한 이벤트는 `attentionScore` 기준으로 카메라 힌트를 따르되, 사용자의 수동 카메라 조작을 우선한다.
- 렌더러는 저장되지 않는 임시 연출 상태만 가진다.

## 7. `packages/content-data`

### 7.1 목적

콘텐츠와 밸런스를 데이터 파일로 관리한다.

### 7.2 제안 구조

```text
packages/content-data/
├─ characters/
│  ├─ char_a.profile.json
│  ├─ char_b.profile.json
│  └─ char_c.profile.json
├─ locations/
│  ├─ home_block.location.json
│  ├─ library.location.json
│  ├─ cafe.location.json
│  ├─ arcade.location.json
│  └─ park.location.json
├─ facilities/
│  ├─ computer_room.facility.json
│  └─ karaoke.facility.json
├─ events/
│  ├─ social/
│  ├─ ambient/
│  └─ unlock/
├─ schedules/
│  ├─ char_a.weekday.schedule.json
│  └─ char_a.weekend.schedule.json
├─ balance/
│  ├─ needs.default.json
│  ├─ relationship.default.json
│  └─ progression.default.json
└─ unlocks/
   ├─ char_b.unlock.json
   ├─ char_c.unlock.json
   └─ facility_expansion.unlock.json
```

### 7.3 데이터 책임

| 데이터 그룹 | 책임 |
| --- | --- |
| characters | 성향, 장소 선호, 말투 키워드, 루틴 기본값 |
| locations | 수용 인원, 상호작용 존, 개방 시간, 장소 태그 |
| facilities | 설치 조건, 기능 태그, 연출 자산 연결 |
| events | 발생 조건, 참가자 수, 대사 템플릿, 감정 태그 |
| schedules | 시간대별 기본 루틴 블록 |
| balance | 욕구 감소량, 점수 가중치, 관계 증감폭 |
| unlocks | 캐릭터/시설 개방 조건 |

### 7.4 콘텐츠 데이터 검증기

별도 툴 또는 빌드 단계에서 아래를 검증해야 한다.

- 존재하지 않는 장소 ID 참조 금지
- 이벤트 참가자 수와 장소 수용 인원 충돌 금지
- 해금 조건이 순환 참조하지 않음
- 스케줄 블록 시간 합이 하루 범위를 넘지 않음

## 8. `packages/ai-bridge`

### 8.1 목적

AI 기능을 핵심 시뮬레이션에서 분리된 표현 모듈로 관리한다.

### 8.2 제안 구조

```text
packages/ai-bridge/src/
├─ providers/
│  ├─ AIProvider.ts
│  ├─ OpenAIProvider.ts
│  └─ MockProvider.ts
├─ composers/
│  ├─ DialogueComposer.ts
│  ├─ DiaryComposer.ts
│  └─ EventSummaryComposer.ts
├─ prompts/
│  ├─ dialoguePrompt.ts
│  ├─ diaryPrompt.ts
│  └─ eventSummaryPrompt.ts
├─ policies/
│  ├─ TonePolicy.ts
│  ├─ BudgetPolicy.ts
│  └─ SafetyPolicy.ts
├─ fallback/
│  ├─ TemplateDialogueComposer.ts
│  └─ TemplateDiaryComposer.ts
└─ cache/
   └─ ArtifactCache.ts
```

### 8.3 책임

| 파일 | 책임 |
| --- | --- |
| `AIProvider.ts` | 모델 호출 인터페이스 |
| `MockProvider.ts` | 개발/오프라인 fallback |
| `DialogueComposer.ts` | 짧은 대사 생성 |
| `DiaryComposer.ts` | 하루 일기 생성 |
| `EventSummaryComposer.ts` | 이벤트 요약 생성 |
| `TemplateDialogueComposer.ts` | AI 실패 시 템플릿 문안 제공 |
| `ArtifactCache.ts` | 동일 요청 결과 캐시 |

## 9. `apps/desktop/src-tauri`

### 9.1 목적

로컬 파일 I/O, 앱 경로, 향후 업데이터 같은 네이티브 기능을 캡슐화한다.

### 9.2 제안 구조

```text
apps/desktop/src-tauri/
├─ capabilities/
│  ├─ default.json
│  ├─ save_rw.json
│  └─ updater.json
├─ src/
│  ├─ commands/
│  │  ├─ save_slots.rs
│  │  ├─ save_files.rs
│  │  ├─ app_paths.rs
│  │  └─ updater.rs
│  ├─ app_state/
│  │  └─ save_root.rs
│  └─ lib.rs
└─ tauri.conf.json
```

### 9.3 네이티브 계층 규칙

- 가능한 한 얇게 유지한다.
- 도메인 규칙은 JS/TS 계층에 둔다.
- 파일 권한은 저장 경로 중심으로 최소화한다.
- Tauri command 응답은 DTO 형태로 제한한다.

## 10. 모듈 간 의존 규칙

### 10.1 허용되는 방향

```text
apps/desktop ─────► shared-types
apps/desktop ─────► sim-core
apps/desktop ─────► game-renderer
apps/desktop ─────► content-data
apps/desktop ─────► ai-bridge

game-renderer ────► shared-types
sim-core ─────────► shared-types
content-data ─────► shared-types
ai-bridge ────────► shared-types
```

### 10.2 금지되는 방향

- `sim-core -> game-renderer`
- `sim-core -> apps/desktop`
- `game-renderer -> sim-core` 직접 변경
- `content-data -> apps/desktop`
- `ai-bridge -> sim-core` 직접 변경

## 11. MVP 필수 모듈 우선순위

1. `shared-types`
2. `sim-core/core`
3. `sim-core/systems/NeedSystem`
4. `sim-core/systems/RoutinePlanner`
5. `sim-core/systems/IntentScorer`
6. `sim-core/projection`
7. `game-renderer/scenes`
8. `apps/desktop/features/activity-input`
9. `apps/desktop/bridges/tauri/SaveRepository`
10. `content-data/characters`, `locations`, `balance`

## 12. 향후 추가 가능 모듈

- `packages/liveops-content` (시즌 이벤트용)
- `packages/cloud-sync` (동기화/충돌 처리)
- `packages/multiplayer-transport` (네트워크 전송)
- `packages/devtools` (맵/콘텐츠 검증 도구)
- `packages/analytics` (로컬/옵트인 이벤트 계측)

## 13. 모듈 승인 체크리스트

- 각 모듈의 책임이 한 문장으로 설명 가능한가?
- 렌더러가 도메인 결정을 하지 않는가?
- 콘텐츠 추가가 sim-core 수정 없이 가능한 영역이 있는가?
- 저장 관련 코드가 React UI에 흩어져 있지 않은가?
- AI 코드 제거 시에도 제품이 유지되는가?
