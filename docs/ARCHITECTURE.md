# ARCHITECTURE

문서 상태: Draft v0.1  
문서 목적: 실제 제품 수준의 기술 구조, 책임 분리, 데이터 흐름, 확장 지점 정의

## 1. 아키텍처 원칙

### 1.1 최우선 원칙

1. **시뮬레이션 권위 분리**  
   권위 상태(authoritative state)는 시뮬레이션 코어가 가진다. 렌더러나 React 상태가 게임의 진실 원천이 되지 않는다.

2. **렌더링과 로직 분리**  
   마을 화면은 시뮬레이션 결과를 보여 주는 표현 계층이다. 캐릭터의 욕구 계산, 관계 변화, 해금 판정은 렌더러 내부에서 하지 않는다.

3. **로컬 우선 저장**  
   저장/불러오기는 네트워크와 독립적으로 동작해야 한다. 이후 클라우드 동기화는 같은 스냅샷/저널 포맷 위에 올린다.

4. **데이터 드리븐 확장성**  
   캐릭터, 이벤트, 시설, 해금 규칙은 가능한 한 데이터 파일 추가로 늘릴 수 있어야 한다.

5. **AI 느슨한 결합**  
   LLM 미연동 상태에서도 게임은 완전하게 돌아가야 한다. AI는 표현 강화용 모듈이다.

6. **멀티플레이를 위한 경계 확보**  
   지금은 싱글 플레이지만, 명령(Command), 상태(State), 이벤트(Event), 스냅샷(Snapshot) 경계를 명확히 해 두어 이후 네트워크 동기화를 붙일 수 있어야 한다.

## 2. 권장 기술 스택

| 영역 | 선택안 | 역할 |
| --- | --- | --- |
| 앱 셸 | Tauri 2 | 데스크톱 패키징, 파일 시스템, 네이티브 권한 경계 |
| UI | React + TypeScript | 앱 레이아웃, 입력 패널, 설정, 저장 슬롯 UI |
| 렌더링 | Phaser 3 | 타일맵, 카메라, 스프라이트, 씬 관리 |
| 앱 상태 | Zustand | UI/세션/설정 상태 관리 |
| 시뮬레이션 | TypeScript 순수 모듈 | 권위 로직, 테스트, 리플레이 |
| 저장 | Tauri 파일 시스템 + 버전드 스냅샷/저널 | 로컬 저장, 나중에 클라우드 확장 가능 |
| 콘텐츠 | JSON/TMJ 기반 데이터 | 캐릭터/이벤트/시설/밸런스 정의 |
| AI 연동 | 인터페이스 추상화 | 대사/일기/요약/연출 생성 |

## 3. Phaser 3를 기본안으로 채택하는 이유

### 3.1 왜 Phaser 3인가

이 프로젝트는 웹뷰 기반 데스크톱 앱 안에서 **타일맵 공간감, 부드러운 카메라, 다수 캐릭터 애니메이션, 장면 전환**을 안정적으로 다뤄야 한다.  
Phaser 3는 아래 이유로 기본안으로 적합하다.

- **타일맵 적합성**: Tiled 기반 타일맵과 레이어 구성에 익숙한 파이프라인을 만들기 쉽다.
- **카메라 기능 내장**: 선택 캐릭터 추적, 이벤트 포커스, 줌, 팬 연출을 별도 엔진 없이 처리하기 좋다.
- **애니메이션 내장**: 다수 캐릭터의 2D 스프라이트 애니메이션과 상태 전환을 관리하기 용이하다.
- **씬 관리**: 월드, 오버레이, 컷신/이벤트 씬을 분리해도 앱 전체 구조와 충돌이 적다.
- **웹 친화성**: React/Tauri와 함께 쓰기 쉽고, 배포 파이프라인이 단순하다.
- **성숙도**: 프로덕션에서 검증된 2D 툴셋이 풍부하다.

### 3.2 왜 다른 선택지가 아닌가

| 대안 | 장점 | 이번 단계에서 보류하는 이유 |
| --- | --- | --- |
| PixiJS | 렌더링 성능, 유연성 | 타일맵/씬/게임 루프 규약을 직접 많이 만들어야 한다. 인디 팀 기준 초기 비용이 높다. |
| React DOM/Canvas 위주 구현 | UI 통합이 쉽다 | 다수 스프라이트, 카메라, 애니메이션, 타일맵 공간 구현 부담이 크다. |
| Godot | 게임 엔진으로 강력 | 현재 명시된 Tauri + React + TypeScript 방향과 충돌한다. 툴체인 이중화가 발생한다. |
| Phaser 4 | 장기적으로 흥미롭다 | 현재는 제품 기준으로 Phaser 3가 더 안정적인 선택이다. |

### 3.3 Phaser를 어떻게 쓸 것인가

중요한 점은 **Phaser를 “게임 전체”가 아니라 “월드 렌더러”로 사용**하는 것이다.

- 캐릭터 위치/애니메이션 재생은 Phaser가 담당
- 실제 행동 선택과 관계 변화는 sim-core가 담당
- Phaser 씬은 시뮬레이션 결과를 받아 표현만 수행
- 월드 내부의 말풍선, 아이콘, 선택 링 같은 diegetic UI는 Phaser에서 처리
- 입력 폼, 설정, 저장 슬롯, 디버그 토글은 React에서 처리

## 4. 저장소 구조 제안

권장 형태는 모노레포다.

```text
/
├─ apps/
│  └─ desktop/
│     ├─ src/
│     │  ├─ app/
│     │  │  ├─ providers/
│     │  │  ├─ layout/
│     │  │  └─ routes/
│     │  ├─ bridges/
│     │  │  ├─ sim/
│     │  │  ├─ tauri/
│     │  │  └─ ai/
│     │  ├─ features/
│     │  │  ├─ activity-input/
│     │  │  ├─ character-focus/
│     │  │  ├─ saves/
│     │  │  ├─ unlocks/
│     │  │  └─ notifications/
│     │  ├─ stores/
│     │  ├─ game/
│     │  │  ├─ GameHost.tsx
│     │  │  ├─ PhaserBootstrap.ts
│     │  │  └─ projection/
│     │  ├─ assets/
│     │  └─ main.tsx
│     └─ src-tauri/
│        ├─ capabilities/
│        ├─ src/
│        │  ├─ commands/
│        │  ├─ app_state/
│        │  └─ lib.rs
│        └─ tauri.conf.json
├─ packages/
│  ├─ shared-types/
│  ├─ sim-core/
│  ├─ game-renderer/
│  ├─ content-data/
│  └─ ai-bridge/
└─ docs/
```

## 5. 런타임 계층

### 5.1 계층 개요

```text
[React UI / Zustand]
        │
        ▼
[SimulationHost Adapter] ───────► [AI Bridge]
        │
        ▼
[sim-core (authoritative)]
        │
        ├──────► [Projection Builder]
        │
        └──────► [Save Serializer]
                │
                ▼
      [Tauri Save Service / Local Files]

[game-renderer (Phaser)] ◄────── [Projection Stream]
```

### 5.2 각 계층의 책임

| 계층 | 책임 | 금지 사항 |
| --- | --- | --- |
| React App | 앱 셸, 패널, 입력, 설정, 저장 슬롯, 세션 제어 | 직접 캐릭터 AI를 계산하지 않음 |
| Zustand Stores | UI 상태, 세션 상태, 설정, 디버그 토글 | 전체 월드 권위 상태를 저장하지 않음 |
| SimulationHost | React/Phaser와 sim-core 사이의 메시지 경계 | 도메인 규칙을 새로 만들지 않음 |
| sim-core | 시간, 캐릭터, 관계, 해금, 이벤트, 스냅샷 | Phaser/React/Tauri import 금지 |
| game-renderer | 타일맵, 카메라, 애니메이션, 월드 표현 | 권위 상태 수정 금지 |
| Tauri Layer | 파일 I/O, 네이티브 권한, 향후 업데이터 | 도메인 로직 최소화 |
| AI Bridge | 대사/일기/요약 생성, fallback | 권위 상태 직접 변경 금지 |

## 6. 앱 상태 관리 정책

### 6.1 Zustand를 쓰는 범위

Zustand는 아래에만 쓴다.

- 현재 세션 ID
- 선택 캐릭터 ID
- 카메라 모드
- 열려 있는 패널
- 사용자 설정(배속 기본값, 사운드, UI 선호)
- 최근 알림
- 디버그 플래그
- 캐시 가능한 비권위적 뷰 모델

### 6.2 Zustand에 넣지 않는 것

- 캐릭터 욕구 값 원본
- 관계 원본
- 해금 판정 원본
- 월드 시간 원본
- 저장 파일 원본

이 값들은 sim-core에서 관리하고, React 쪽에는 projection이나 read model 형태로만 노출한다.

## 7. 시뮬레이션 코어 설계

### 7.1 기본 정책

- 순수 TypeScript 패키지
- 외부 환경 의존성 없음
- 입력은 `commands`, 출력은 `events`와 `projection diffs`
- 고정 틱 업데이트
- 부동소수점 대신 정수/고정 범위 수치 선호
- 랜덤은 시드 기반 RNG 사용

### 7.2 핵심 구성요소

| 모듈 | 역할 |
| --- | --- |
| WorldClock | 게임 시간 진행, 배속, 날짜 관리 |
| CommandQueue | 사용자 입력 및 시스템 명령 큐 |
| CharacterSystem | 캐릭터 상태 집계 |
| NeedSystem | 에너지, 집중, 스트레스, 놀이, 사회성 등 관리 |
| RoutinePlanner | 하루 루틴 블록 생성 |
| IntentScorer | 현재 행동 후보 점수화 |
| NavigationSystem | 장소 간 이동/경로 계획 |
| RelationshipSystem | 관계 축 업데이트 |
| EventDirector | 사회적 장면/연출 이벤트 생성 |
| UnlockSystem | 캐릭터/시설 해금 조건 평가 |
| ProjectionBuilder | 렌더러용 뷰 모델 생성 |
| SaveSerializer | 스냅샷/저널 변환 |
| ReplayHarness | 재생/재현 테스트 지원 |

### 7.3 틱 처리 순서

권장 순서는 다음과 같다.

1. 커맨드 수집
2. 시간 진행
3. 욕구/감정 갱신
4. 루틴 재평가 여부 확인
5. 행동 후보 평가
6. 이동/행동 실행
7. 사회적 상호작용 판정
8. 이벤트 생성
9. 해금 판정
10. projection diff 생성
11. 저장용 이벤트 기록

## 8. 렌더링 계층 설계

### 8.1 씬 구성

| 씬 | 역할 |
| --- | --- |
| BootScene | 에셋 로드, 초기화, 맵/캐릭터 준비 |
| WorldScene | 타일맵, 캐릭터 스프라이트, 이동, 충돌, 시점 |
| OverlayScene | 말풍선, 감정 아이콘, 선택 마커, 작은 월드 UI |
| EventScene | 해금 연출, 강조 장면, 짧은 시네마틱 포커스 |

### 8.2 렌더러의 입력

렌더러는 sim-core의 전체 원본 상태를 몰라도 된다.  
필요한 것은 아래 projection이다.

- 현재 시간대
- 장소 점유 상태
- 캐릭터 위치/방향/현재 행동/감정 태그
- 활성 이벤트 목록
- 카메라 포커스 힌트
- 간단한 툴팁/말풍선 데이터

### 8.3 React와 Phaser의 경계

- React는 Phaser 캔버스를 감싸는 부모
- Phaser 인스턴스는 `GameHost.tsx`가 lifecycle 관리
- React에서 캐릭터 선택/배속/패널 제어
- Phaser에서 월드 클릭/캐릭터 선택 이벤트 발생
- 양방향 통신은 `SimulationHost`와 `RendererBridge`를 통해 일원화

## 9. 데이터 흐름

### 9.1 앱 시작 시

1. React App Bootstrap
2. Tauri에서 저장 슬롯 목록 조회
3. 마지막 세션 또는 선택 저장 로드
4. sim-core 초기화
5. 초기 projection 생성
6. Phaser BootScene 시작
7. WorldScene에 초기 엔티티 주입
8. 메인 루프 시작

### 9.2 런타임 중 사용자 입력 시

1. 사용자가 “공부 60분” 입력
2. `activity-input` feature가 유효성 검사
3. `SimulationHost.enqueueCommand()` 호출
4. sim-core가 `PlayerActionEntry`를 반영
5. 관련 캐릭터 루틴/의도 재평가
6. 새 projection diff 생성
7. Phaser가 카메라/이동/아이콘/대사 반영
8. SaveService가 저널에 커맨드 및 결과 이벤트 저장

### 9.3 저장 시

1. 시뮬레이션 안전 지점에서 snapshot 생성
2. snapshot + metadata 작성
3. 최근 저널 flush
4. 슬롯 manifest 갱신
5. UI에 저장 완료 알림

## 10. 로컬 저장 구조

### 10.1 저장 디렉터리 예시

```text
AppData/
└─ ai-town/
   ├─ saves/
   │  ├─ slot-001/
   │  │  ├─ manifest.json
   │  │  ├─ snapshot-000021.json
   │  │  ├─ journal-000021.jsonl
   │  │  └─ cover.png
   │  └─ slot-002/
   ├─ settings/
   │  └─ user-settings.json
   └─ cache/
      └─ ai-artifacts/
```

### 10.2 저장 정책

- **스냅샷**: 구조화된 현재 상태
- **저널**: 스냅샷 이후 발생한 명령/주요 이벤트
- **manifest**: 슬롯 메타데이터, 버전, 마지막 플레이 시각, 커버 정보
- **settings**: 게임 외 사용자 설정
- **AI cache**: 재생성 가능한 비권위적 텍스트

### 10.3 설계 이유

- 디버깅과 수동 복구가 쉽다
- 버전 마이그레이션이 가능하다
- 이후 클라우드 동기화 시 snapshot + journal 업로드 형태로 확장하기 쉽다

## 11. Tauri 계층 설계

### 11.1 Tauri가 맡는 역할

- 저장 파일 읽기/쓰기
- 앱 데이터 경로 제공
- 향후 자동 업데이트
- 향후 OS 알림
- 향후 시스템 트레이/윈도우 제어

### 11.2 Tauri가 맡지 않는 역할

- 캐릭터 AI
- 월드 상태 계산
- 밸런스 룰
- 이벤트 템플릿 선택
- 렌더링

### 11.3 제안 파일

| 파일 | 역할 |
| --- | --- |
| `apps/desktop/src-tauri/src/commands/save_slots.rs` | 슬롯 목록/생성/삭제 |
| `apps/desktop/src-tauri/src/commands/save_files.rs` | 스냅샷/저널 읽기/쓰기 |
| `apps/desktop/src-tauri/src/commands/app_paths.rs` | 앱 디렉터리 경로 반환 |
| `apps/desktop/src-tauri/src/commands/updater.rs` | 향후 업데이터 연결점 |
| `apps/desktop/src-tauri/src/lib.rs` | 커맨드 등록, 앱 부트스트랩 |

## 12. AI 연동 구조

### 12.1 AI를 붙이는 위치

AI는 아래 작업에만 관여한다.

- 짧은 대사 재작성
- 하루 일기
- 이벤트 하이라이트 요약
- 해금 연출 문안
- 관계 변화에 대한 표현 강화

### 12.2 AI가 절대 관여하지 않는 것

- 행동 점수 계산
- 이동 경로
- 해금 판정
- 저장 원본 상태
- 관계 수치 직접 변경

### 12.3 AI Bridge 구성

| 모듈 | 역할 |
| --- | --- |
| AIProvider | 외부 모델/로컬 모델 추상화 |
| PromptBuilder | 이벤트 번들 → 프롬프트 변환 |
| SafetyPolicy | 길이, 톤, 금칙어, 비용 제약 |
| FallbackComposer | AI 실패 시 템플릿 텍스트 생성 |
| ArtifactCache | 결과 캐시 |

## 13. 멀티플레이 확장 지점

### 13.1 지금 당장 만들지 않지만 열어 둘 구조

- `SimulationHost`를 네트워크 버전으로 교체 가능
- `Command`와 `Snapshot` 포맷을 네트워크 전송 가능 형태로 유지
- 캐릭터/시설 해금, 이벤트 발생을 모두 이벤트 로그로 남김
- 입력을 로컬 사용자 행동 로그와 동일한 포맷으로 처리

### 13.2 미래 확장 방향

| 단계 | 방향 |
| --- | --- |
| 1 | 비동기 공유(친구 마을 방문, 스냅샷 공유) |
| 2 | 가벼운 동시 접속(관찰형) |
| 3 | 실시간 협력 공간 또는 공동 마을 |

현재 단계에서 중요한 것은 **멀티플레이 기능 구현이 아니라, 싱글 구조를 망치지 않고 나중에 붙일 수 있는 인터페이스를 남기는 것**이다.

## 14. 테스트 전략

### 14.1 필수 테스트 종류

| 종류 | 대상 |
| --- | --- |
| 단위 테스트 | NeedSystem, IntentScorer, UnlockSystem, RelationshipSystem |
| 리플레이 테스트 | 동일 시드/동일 명령 입력 시 결과 일치 여부 |
| 장기 소크 테스트 | 7일, 30일 헤드리스 시뮬레이션 |
| 저장 호환 테스트 | 스냅샷 로드/마이그레이션 |
| 렌더 스모크 테스트 | 맵/스프라이트/에셋 깨짐 여부 |
| 콘텐츠 검증 | 맵 진입점, 의자 좌표, 상호작용 존 연결 |

### 14.2 중요한 자동 검증

- 캐릭터가 이동 불가 상태에 빠지지 않는지
- 해금 조건이 영원히 충족 불가능하지 않은지
- 관계 변화가 음수 루프에만 갇히지 않는지
- 장소 점유가 특정 장소에만 몰리지 않는지

## 15. 관측/디버그 도구

초기부터 아래 도구를 준비해야 한다.

- 현재 틱/시간 표시
- 선택 캐릭터 상태 오버레이
- 행동 점수 상위 후보 확인
- 관계 변화 로그
- 최근 50개 이벤트 로그
- 카메라 자동 포커스 원인 표시
- 저장 스냅샷 diff 툴
- 헤드리스 리플레이 모드

이 도구는 관리자 UI가 아니라 **개발/밸런싱 도구**이며, 릴리즈 빌드에서는 감추거나 제한한다.

## 16. 단계적 구현 원칙

아키텍처는 확장 가능해야 하지만, 첫 구현부터 모든 추상화를 완성할 필요는 없다.

### 단계 1

- sim-core in-process
- 로컬 저장
- char_a 중심
- 기본 맵
- 단일 슬롯 또는 소수 슬롯

### 단계 2

- WorkerSimulationHost 도입
- B/C 캐릭터와 확장 시설
- 일기/요약 AI Bridge 연결
- 저장 마이그레이션

### 단계 3

- 클라우드 동기화
- 비동기 공유
- 네트워크 경계 검증

## 17. 아키텍처 승인 체크리스트

- sim-core가 React/Phaser/Tauri에 의존하지 않는가?
- Phaser가 권위 상태를 가지지 않는가?
- 저장 포맷이 버전 필드를 가지는가?
- UI 상태와 월드 상태가 분리되어 있는가?
- AI 미연동 시에도 제품이 완전 동작하는가?
- 멀티플레이 없이도 구조가 과도하게 복잡하지 않은가?
