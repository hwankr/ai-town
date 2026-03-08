# DATA_MODEL

문서 상태: Draft v0.1  
문서 목적: 저장/시뮬레이션/콘텐츠 확장을 위한 데이터 구조 정의

## 1. 모델링 원칙

### 1.1 권위 데이터와 표현 데이터 분리

- **권위 데이터**: sim-core가 계산하고 저장하는 원본 상태
- **표현 데이터**: 렌더러와 UI가 소비하는 projection/read model
- **AI 산출물**: 재생성 가능한 비권위 텍스트/연출 결과

### 1.2 정규화 원칙

- 정적인 설정값은 archetype/content 데이터로 분리
- 런타임 값만 save snapshot에 저장
- UI 상태는 save snapshot에 섞지 않음
- 수치형은 가능하면 정수 0~100 범위를 선호
- 시간은 wall clock 대신 `dayIndex`, `minuteOfDay`, `tickIndex`로 저장

### 1.3 ID 규칙

| 대상 | 예시 |
| --- | --- |
| 캐릭터 ID | `char_a`, `char_b`, `char_c` |
| 장소 ID | `loc_library`, `loc_cafe`, `loc_arcade` |
| 시설 ID | `fac_computer_room`, `fac_karaoke` |
| 이벤트 ID | `evt_social_cafe_chat_001` |
| 기억 ID | `mem_00000021` |
| 저장 슬롯 ID | `slot_001` |

## 2. 데이터 계층 개요

```text
Content Data (정적)
 ├─ CharacterArchetype
 ├─ LocationArchetype
 ├─ FacilityArchetype
 ├─ EventTemplate
 ├─ UnlockDefinition
 └─ BalanceConfig

Runtime State (권위)
 ├─ WorldState
 ├─ CharacterState
 ├─ RelationshipEdge
 ├─ MemoryRecord
 ├─ LocationRuntimeState
 ├─ UnlockState
 └─ ProgressState

Player Input
 ├─ PlayerActionEntry
 └─ InfluenceSignal

Presentation
 ├─ WorldProjection
 ├─ CharacterProjection
 └─ EventPresentation

AI Artifact (비권위)
 ├─ DiaryArtifact
 ├─ DialogueArtifact
 └─ SummaryArtifact
```

## 3. 저장 루트 모델

### 3.1 SaveManifest

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `saveVersion` | string | 포맷 버전. 예: `1.0.0` |
| `slotId` | string | 저장 슬롯 ID |
| `slotName` | string | 사용자 지정 슬롯 이름 |
| `createdAt` | string | 생성 시각 (현실 시간) |
| `updatedAt` | string | 마지막 저장 시각 (현실 시간) |
| `lastDayIndex` | number | 마지막 게임 날짜 |
| `lastMinuteOfDay` | number | 마지막 게임 시간 |
| `coverImagePath` | string \| null | 슬롯 썸네일 경로 |
| `snapshotFile` | string | 최신 스냅샷 파일명 |
| `journalFile` | string | 최신 저널 파일명 |
| `playtimeMinutes` | number | 누적 플레이 시간 |
| `contentVersion` | string | 콘텐츠 번들 버전 |
| `notes` | string \| null | 향후 확장용 메모 |

### 3.2 SaveSnapshot

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `meta` | SaveSnapshotMeta | 스냅샷 메타 |
| `world` | WorldState | 권위 월드 상태 전체 |
| `progress` | ProgressState | 해금/시설/목표 진행 |
| `inputHistory` | PlayerActionEntry[] | 최근 사용자 입력 히스토리 |
| `artifactRefs` | ArtifactRef[] | AI/템플릿 결과 참조 |
| `checksum` | string | 데이터 무결성 검증용 |

### 3.3 SaveSnapshotMeta

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `snapshotId` | string | 스냅샷 식별자 |
| `saveVersion` | string | 스냅샷 버전 |
| `generatedAt` | string | 현실 시각 |
| `dayIndex` | number | 게임 날짜 |
| `minuteOfDay` | number | 게임 시간 |
| `tickIndex` | number | 누적 틱 |
| `rngSeed` | number | 재현 가능한 RNG 시드 |
| `contentVersion` | string | 콘텐츠 버전 |


### 3.4 ArtifactRef

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `artifactId` | string | 결과물 ID |
| `artifactType` | `diary` \| `dialogue` \| `summary` | 결과 종류 |
| `generator` | `template` \| `ai` | 생성 방식 |
| `pathOrKey` | string | 캐시/저장 참조 키 |
| `createdAt` | string | 생성 시각 |


## 4. 월드 상태 모델

### 4.1 WorldState

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `worldId` | string | 월드 식별자 |
| `clock` | WorldClockState | 시간 상태 |
| `characters` | Record<string, CharacterState> | 캐릭터 런타임 상태 |
| `relationships` | RelationshipEdge[] | 관계 그래프 |
| `memories` | MemoryRecord[] | 최근 사건 기억 |
| `locations` | Record<string, LocationRuntimeState> | 장소 런타임 상태 |
| `facilities` | Record<string, FacilityRuntimeState> | 시설 상태 |
| `activeEvents` | WorldEventRecord[] | 현재 활성 이벤트 |
| `recentEvents` | WorldEventRecord[] | 최근 이벤트 히스토리 |
| `directorState` | EventDirectorState | 관찰 재미 조절용 상태 |
| `globalMood` | GlobalMoodState | 마을 전체 분위기 |
| `rngState` | number | RNG 내부 상태 값 |
| `flags` | Record<string, boolean> | 스토리/해금/튜토리얼 플래그 |

### 4.2 WorldClockState

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `dayIndex` | number | 0부터 시작하는 날짜 인덱스 |
| `minuteOfDay` | number | 0~1439 |
| `tickIndex` | number | 누적 틱 |
| `timeScale` | 1 \| 2 \| 4 | 현재 배속 |
| `paused` | boolean | 일시정지 여부 |
| `phase` | `morning` \| `day` \| `evening` \| `night` \| `late_night` | 시간대 태그 |

### 4.3 GlobalMoodState

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `calm` | number | 0~100 |
| `energy` | number | 0~100 |
| `sociability` | number | 0~100 |
| `focus` | number | 0~100 |
| `dominantTag` | string | 현재 마을 분위기 키워드 |

## 5. 캐릭터 모델

### 5.1 CharacterArchetype (정적)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `characterId` | string | 캐릭터 ID |
| `displayName` | string | 표시명 |
| `personaTags` | string[] | 성격 태그 |
| `traitVector` | TraitVector | 고정 성향 값 |
| `baseNeedRates` | NeedRates | 욕구 감소/회복 기본값 |
| `preferredLocations` | string[] | 선호 장소 ID |
| `dislikedLocations` | string[] | 비선호 장소 ID |
| `homeLocationId` | string | 귀가 장소 |
| `schedulePresetIds` | string[] | 기본 스케줄 프리셋 참조 |
| `dialogueToneTags` | string[] | 대사/일기 톤 키워드 |
| `unlockDefinitionId` | string \| null | 해금 규칙 참조 |

### 5.2 TraitVector

초기 버전은 단순하고 설명 가능한 축을 쓴다.

| 필드 | 범위 | 설명 |
| --- | --- | --- |
| `discipline` | 0~100 | 규칙성/집중 성향 |
| `playfulness` | 0~100 | 놀이 선호 |
| `sociability` | 0~100 | 사람을 찾는 경향 |
| `activity` | 0~100 | 야외/운동 선호 |
| `sensitivity` | 0~100 | 감정 영향 민감도 |
| `curiosity` | 0~100 | 새로운 시설/이벤트 탐색 성향 |


### 5.2.1 NeedRates

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `energyDrainPerHour` | number | 시간 경과 시 에너지 감소량 |
| `focusDrainPerHour` | number | 집중 유지 비용 |
| `funDrainPerHour` | number | 놀이 욕구 누적 속도 |
| `socialDrainPerHour` | number | 사교 욕구 누적 속도 |
| `stressRecoveryPerRestHour` | number | 휴식 시 스트레스 회복량 |
| `comfortRecoveryPerRestHour` | number | 휴식 시 comfort 회복량 |


### 5.3 CharacterState (런타임)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `characterId` | string | 캐릭터 ID |
| `unlocked` | boolean | 해금 여부 |
| `spawned` | boolean | 현재 월드 등장 여부 |
| `position` | TilePosition | 현재 타일 위치 |
| `subTileOffset` | Vec2 | 렌더 보간용 오프셋 |
| `facing` | `up` \| `down` \| `left` \| `right` | 방향 |
| `currentLocationId` | string | 현재 장소 |
| `currentAction` | ActionState | 현재 수행 중 행동 |
| `currentIntent` | IntentState \| null | 현재 선택된 의도 |
| `needState` | NeedState | 욕구 상태 |
| `emotionState` | EmotionState | 감정 상태 |
| `scheduleState` | ScheduleState | 오늘 일정 진행 상태 |
| `socialState` | CharacterSocialState | 관계 기반 보조 상태 |
| `memoryRefs` | string[] | 관련 기억 ID |
| `cooldowns` | CharacterCooldowns | 행동/이벤트 쿨다운 |
| `todayStats` | CharacterDailyStats | 오늘의 행동 요약 |
| `lastUpdatedTick` | number | 마지막 갱신 틱 |

### 5.4 TilePosition / Vec2

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `x` | number | 타일 X |
| `y` | number | 타일 Y |

`subTileOffset`는 저장 시 생략 가능하며, projection 단계에서 계산해도 된다.


### 5.4.1 TimeRange

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `startMinute` | number | 시작 시각 |
| `endMinute` | number | 종료 시각 |

### 5.4.2 AnchorPoint

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `anchorId` | string | 앵커 ID |
| `anchorType` | `seat` \| `stand` \| `machine` \| `view` | 앵커 종류 |
| `position` | TilePosition | 위치 |
| `capacity` | number | 동시 사용 가능 수 |
| `tags` | string[] | 행동/연출 태그 |


### 5.5 NeedState

| 필드 | 범위 | 설명 |
| --- | --- | --- |
| `energy` | 0~100 | 피로/휴식 |
| `focus` | 0~100 | 집중 상태 |
| `fun` | 0~100 | 놀이 욕구 |
| `social` | 0~100 | 사회적 욕구 |
| `stress` | 0~100 | 스트레스 |
| `comfort` | 0~100 | 안락/회복감 |

### 5.6 EmotionState

| 필드 | 범위 | 설명 |
| --- | --- | --- |
| `valence` | -100~100 | 전반적 기분 |
| `arousal` | 0~100 | 흥분도/활성도 |
| `dominantEmotion` | string | `calm`, `tired`, `happy`, `tense` 등 |
| `stability` | 0~100 | 감정 흔들림 저항 |
| `lastEmotionSource` | string \| null | 최근 변화 원인 태그 |

### 5.7 ActionState

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `actionId` | string | 행동 ID |
| `actionType` | string | `move`, `study`, `sit`, `chat` 등 |
| `targetLocationId` | string \| null | 목적 장소 |
| `targetCharacterId` | string \| null | 목표 캐릭터 |
| `startedAtTick` | number | 시작 틱 |
| `expectedEndTick` | number | 예상 종료 틱 |
| `status` | `queued` \| `running` \| `completed` \| `cancelled` | 상태 |

### 5.8 IntentState

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `intentId` | string | 의도 ID |
| `intentType` | string | `go_to_library`, `seek_rest`, `meet_friend` 등 |
| `score` | number | 선택 당시 점수 |
| `reasonTags` | string[] | 왜 골랐는지 설명 태그 |
| `targetLocationId` | string \| null | 대상 장소 |
| `targetCharacterId` | string \| null | 대상 캐릭터 |
| `expiresAtTick` | number | 재평가 틱 |

### 5.9 ScheduleState

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `planId` | string | 오늘 계획 ID |
| `blocks` | RoutineBlock[] | 하루 블록 |
| `activeBlockIndex` | number | 현재 블록 인덱스 |
| `lastReplanTick` | number | 마지막 재계산 시점 |
| `replanReason` | string \| null | 재계산 원인 |

### 5.10 RoutineBlock

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `blockId` | string | 블록 ID |
| `startMinute` | number | 시작 분 |
| `endMinute` | number | 종료 분 |
| `theme` | string | `study`, `rest`, `social`, `play` 등 |
| `preferredLocationIds` | string[] | 추천 장소 |
| `priority` | number | 우선순위 |
| `locked` | boolean | 강제 블록 여부 |

### 5.11 CharacterSocialState

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `desiredCompanionship` | number | 혼자/함께 있고 싶은 정도 |
| `avoidCharacterIds` | string[] | 현재 피하고 싶은 대상 |
| `seekCharacterIds` | string[] | 현재 만나고 싶은 대상 |
| `conversationEnergy` | number | 대화 가능 여력 |
| `lastMeaningfulInteractionTick` | number | 마지막 의미 있는 상호작용 시점 |

### 5.12 CharacterCooldowns

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `sameLocationLoopCooldown` | number | 같은 장소 반복 방지 |
| `socialEventCooldown` | number | 연속 이벤트 방지 |
| `specialAnimationCooldown` | number | 특수 모션 쿨다운 |

### 5.13 CharacterDailyStats

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `minutesStudied` | number | 오늘 공부 시간 |
| `minutesPlayed` | number | 오늘 놀이 시간 |
| `minutesRested` | number | 오늘 휴식 시간 |
| `minutesSocialized` | number | 오늘 사교 시간 |
| `locationsVisited` | string[] | 오늘 방문 장소들 |
| `eventsJoined` | string[] | 오늘 참여 이벤트 IDs |

## 6. 관계 모델

### 6.1 RelationshipEdge

관계는 방향성을 가진다.  
A가 B를 신뢰하는 정도와 B가 A를 신뢰하는 정도가 항상 같을 필요는 없다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `sourceCharacterId` | string | 관계 출발점 |
| `targetCharacterId` | string | 관계 도착점 |
| `familiarity` | 0~100 | 서로 익숙한 정도 |
| `trust` | 0~100 | 믿음 |
| `affection` | -100~100 | 호감/싫어함 |
| `friction` | 0~100 | 마찰 |
| `lastInteractionTick` | number | 최근 상호작용 틱 |
| `streakTag` | string \| null | 최근 관계 흐름 태그 |
| `flags` | string[] | 특수 관계 태그 |

### 6.2 RelationshipDeltaRecord (선택 저장)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `eventId` | string | 원인 이벤트 |
| `sourceCharacterId` | string | 출발 |
| `targetCharacterId` | string | 도착 |
| `deltaTrust` | number | 변화량 |
| `deltaAffection` | number | 변화량 |
| `deltaFriction` | number | 변화량 |
| `reasonTags` | string[] | 변화 원인 |

## 7. 기억 모델

### 7.1 MemoryRecord

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `memoryId` | string | 기억 ID |
| `participants` | string[] | 관련 캐릭터 |
| `locationId` | string | 발생 장소 |
| `eventType` | string | 기억 종류 |
| `valence` | -100~100 | 좋고 나쁨 |
| `intensity` | 0~100 | 강도 |
| `createdAtTick` | number | 생성 틱 |
| `decayPerDay` | number | 하루 감쇠량 |
| `tags` | string[] | 상황 태그 |
| `summarySeed` | string | 템플릿/AI용 요약 힌트 |

### 7.2 기억을 두는 이유

- 반복되는 이벤트를 덜 선택하게 함
- 특정 조합에 감정 잔상을 남김
- 일기/대사/요약 생성에 컨텍스트 제공
- 관계 변화가 단순 누적 수치가 되지 않게 함

## 8. 장소/시설 모델

### 8.1 LocationArchetype (정적)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `locationId` | string | 장소 ID |
| `displayName` | string | 표시명 |
| `locationType` | string | `home`, `library`, `cafe`, `arcade`, `park` 등 |
| `zoneIds` | string[] | 장소 내부 존 ID |
| `openMinutes` | TimeRange[] | 운영 시간 |
| `capacity` | number | 수용 인원 |
| `tags` | string[] | 장소 특성 태그 |
| `supportedActions` | string[] | 가능한 행동 |
| `entryPoints` | TilePosition[] | 진입점 |
| `anchorPoints` | AnchorPoint[] | 앉기/서기/상호작용 포인트 |

### 8.2 LocationRuntimeState

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `locationId` | string | 장소 ID |
| `openNow` | boolean | 현재 개방 여부 |
| `occupants` | string[] | 현재 캐릭터들 |
| `heat` | 0~100 | 최근 이용도 |
| `moodTag` | string | 현재 장소 분위기 |
| `lastBusyTick` | number | 최근 붐빔 시점 |
| `temporaryModifiers` | Modifier[] | 임시 보정값 |


### 8.2.1 Modifier

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `modifierKey` | string | 보정 키 |
| `value` | number | 가중치 또는 수치 변화량 |
| `source` | string | 원인 태그 |
| `expiresAtTick` | number | 만료 틱 |


### 8.3 FacilityArchetype (정적)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `facilityId` | string | 시설 ID |
| `displayName` | string | 표시명 |
| `placementLocationId` | string | 설치 위치 또는 부지 |
| `facilityType` | string | `utility`, `social`, `creative` 등 |
| `unlockDefinitionId` | string | 해금 규칙 참조 |
| `benefitTags` | string[] | 제공하는 기능 태그 |
| `visualStateKeys` | string[] | 렌더러 상태 키 |

### 8.4 FacilityRuntimeState

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `facilityId` | string | 시설 ID |
| `unlocked` | boolean | 해금 여부 |
| `built` | boolean | 설치 여부 |
| `active` | boolean | 현재 사용 가능 여부 |
| `buildDayIndex` | number \| null | 설치 날짜 |
| `usageCount` | number | 누적 사용 횟수 |

## 9. 사용자 입력 모델

### 9.1 PlayerActionEntry

이 모델이 “사용자의 실제 생활이 게임에 들어오는 공식 경계”다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `entryId` | string | 입력 ID |
| `category` | `study` \| `game` \| `exercise` \| `rest` \| `work` \| `social` \| `creative` | 활동 분류 |
| `durationMinutes` | number | 입력 시간 |
| `intensity` | 1~3 | 강도 |
| `timestamp` | string | 현실 시각 |
| `note` | string \| null | 사용자 메모 |
| `source` | `manual` | 현재는 수동 입력만 |
| `privacyLevel` | `local_only` | 기본 로컬 전용 |
| `applied` | boolean | 시뮬레이션 반영 여부 |

### 9.2 InfluenceSignal

`PlayerActionEntry`는 바로 캐릭터를 조종하지 않고, 한 단계 추상화된 신호로 변환된다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `signalId` | string | 신호 ID |
| `sourceEntryId` | string | 원본 입력 참조 |
| `focusBias` | number | 집중 성향 보정 |
| `playBias` | number | 놀이 성향 보정 |
| `activityBias` | number | 활동 성향 보정 |
| `restBias` | number | 회복 성향 보정 |
| `socialBias` | number | 사교 성향 보정 |
| `locationAffinityDeltas` | Record<string, number> | 장소별 가중치 변화 |
| `affectedCharacterIds` | string[] | 직접 영향 대상 |
| `validUntilDayIndex` | number | 효력 종료일 |
| `reasonTags` | string[] | 디버그용 이유 태그 |

### 9.3 초기 매핑 예시

| 입력 | 대표 영향 |
| --- | --- |
| 공부 | 도서관 가중치 증가, focus 상승, char_a와의 공명 강화 |
| 게임 | 오락실 가중치 증가, fun 회복, char_b 해금 진행 |
| 운동 | 공원 가중치 증가, stress 감소, activity 성향 강화 |
| 휴식 | 집/카페 회복 행동 증가, energy 회복, 무리한 외출 감소 |

## 10. 이벤트 모델

### 10.1 EventTemplate (정적)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `templateId` | string | 템플릿 ID |
| `eventType` | string | `chat`, `co_study`, `watch_game`, `walk_together` 등 |
| `participantCount` | number | 참가자 수 |
| `requiredTags` | string[] | 필수 태그 |
| `forbiddenTags` | string[] | 금지 태그 |
| `locationTags` | string[] | 허용 장소 태그 |
| `minRelationship` | number | 최소 관계 기준 |
| `outcomeRules` | string[] | 결과 규칙 키 |
| `presentationTags` | string[] | 연출 태그 |
| `cooldownKey` | string | 반복 방지 키 |

### 10.2 WorldEventRecord (런타임)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `eventId` | string | 이벤트 ID |
| `templateId` | string | 템플릿 참조 |
| `eventType` | string | 이벤트 종류 |
| `participants` | string[] | 참가 캐릭터 |
| `locationId` | string | 발생 장소 |
| `startedAtTick` | number | 시작 틱 |
| `endedAtTick` | number \| null | 종료 틱 |
| `status` | `queued` \| `active` \| `resolved` | 상태 |
| `outcomeTags` | string[] | 결과 태그 |
| `relationshipDeltas` | RelationshipDeltaRecord[] | 관계 변화 |
| `attentionScore` | number | 카메라 우선순위 |
| `presentationSeed` | string | 연출/텍스트 힌트 |

### 10.3 EventDirectorState

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `lastMajorEventTick` | number | 최근 큰 이벤트 발생 시점 |
| `recentTemplateIds` | string[] | 최근 사용 템플릿 |
| `boringCounter` | number | 장면 공백 카운터 |
| `attentionBudget` | number | 연출 예산 |
| `focusHintCharacterId` | string \| null | 현재 추천 포커스 캐릭터 |

## 11. 진행/해금 모델

### 11.1 UnlockDefinition (정적)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `unlockDefinitionId` | string | 규칙 ID |
| `targetType` | `character` \| `facility` \| `district` | 해금 대상 종류 |
| `targetId` | string | 해금 대상 |
| `conditions` | UnlockCondition[] | 조건 목록 |
| `announceStyle` | string | 연출 방식 |
| `priority` | number | 평가 우선순위 |

### 11.2 UnlockCondition

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `conditionType` | string | `player_input_count`, `location_heat`, `relationship_threshold` 등 |
| `subjectId` | string \| null | 대상 |
| `operator` | string | `>=`, `==`, `contains` |
| `value` | string \| number | 기준값 |
| `windowDays` | number \| null | 최근 며칠 기준인지 |
| `weight` | number | 복합 점수용 가중치 |

### 11.3 ProgressState

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `unlockedCharacterIds` | string[] | 해금 캐릭터 |
| `unlockedFacilityIds` | string[] | 해금 시설 |
| `completedUnlocks` | string[] | 완료된 해금 규칙 |
| `pendingUnlockHints` | string[] | 사용자에게 보여 줄 힌트 |
| `milestoneFlags` | string[] | 주요 마일스톤 플래그 |

## 12. Projection 모델

### 12.1 WorldProjection

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `dayIndex` | number | 현재 날짜 |
| `minuteOfDay` | number | 현재 시간 |
| `phase` | string | 시간대 |
| `characters` | CharacterProjection[] | 렌더러용 캐릭터 뷰 |
| `locations` | LocationProjection[] | 장소 점유/분위기 뷰 |
| `activeEvents` | EventPresentation[] | 표현용 이벤트 |
| `focusHint` | FocusHint \| null | 카메라 힌트 |
| `ambientTags` | string[] | 배경 연출 태그 |

### 12.2 CharacterProjection

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `characterId` | string | 캐릭터 ID |
| `displayName` | string | 이름 |
| `worldX` | number | 렌더 좌표 |
| `worldY` | number | 렌더 좌표 |
| `facing` | string | 방향 |
| `animationKey` | string | 재생 애니메이션 |
| `moodTag` | string | 감정 태그 |
| `actionTag` | string | 현재 행동 태그 |
| `emoteTag` | string \| null | 아이콘 태그 |
| `selected` | boolean | 선택 상태 |

### 12.3 LocationProjection

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `locationId` | string | 장소 ID |
| `occupancyCount` | number | 현재 인원 |
| `heat` | number | 최근 이용도 |
| `moodTag` | string | 장소 분위기 |
| `highlight` | boolean | 포커스 강조 여부 |


### 12.4 EventPresentation

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `eventId` | string | 이벤트 ID |
| `eventType` | string | 이벤트 종류 |
| `participants` | string[] | 참가자 |
| `locationId` | string | 장소 |
| `headline` | string | 짧은 표시 문구 |
| `attentionScore` | number | 시각적 중요도 |
| `bubbleText` | string \| null | 말풍선 또는 짧은 설명 |
| `expiresAtTick` | number | 화면 표시 만료 틱 |

### 12.5 FocusHint

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `sourceType` | `character` \| `event` \| `location` | 포커스 원인 |
| `sourceId` | string | 원인 대상 |
| `priority` | number | 카메라 우선순위 |
| `expiresAtTick` | number | 유효 기간 |
| `reasonTags` | string[] | 이유 태그 |


## 13. AI Artifact 모델

### 13.1 DiaryArtifact

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `artifactId` | string | 결과 ID |
| `dayIndex` | number | 대상 날짜 |
| `characterId` | string | 작성 캐릭터 |
| `sourceEventIds` | string[] | 근거 이벤트 |
| `toneTags` | string[] | 톤 태그 |
| `content` | string | 결과 텍스트 |
| `generator` | `template` \| `ai` | 생성 방식 |
| `createdAt` | string | 생성 시각 |

### 13.2 DialogueArtifact

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `artifactId` | string | 결과 ID |
| `eventId` | string | 연관 이벤트 |
| `speakerId` | string | 발화 캐릭터 |
| `listenerId` | string \| null | 청자 |
| `content` | string | 대사 |
| `generator` | `template` \| `ai` | 생성 방식 |
| `expiresAtTick` | number | 재사용/표시 종료 시점 |

## 14. 저장 제외 항목

아래는 스냅샷에 직접 넣지 않거나, 넣더라도 복구 가능해야 한다.

- 현재 열려 있는 UI 패널
- 카메라 좌표
- 디버그 플래그
- 로딩 중 상태
- 렌더러 내부 보간 상태
- 재생성 가능한 AI 캐시

## 15. 마이그레이션 정책

### 15.1 버전 필드

반드시 아래 버전을 가진다.

- `saveVersion`
- `contentVersion`

### 15.2 마이그레이션 원칙

- 저장 포맷 변경 시 `SaveMigration` 단계 추가
- 누락 필드는 기본값으로 보완
- 삭제 필드는 무시하되 경고 로그 남김
- 호환 불가한 경우 명시적으로 업그레이드 절차 제공

## 16. 검증 규칙

- `minuteOfDay`는 0~1439 범위
- `NeedState` 값은 0~100 범위
- `RelationshipEdge`는 자기 자신 대상 금지
- `LocationRuntimeState.occupants` 중복 금지
- `RoutineBlock.startMinute < endMinute`
- `currentLocationId`는 존재하는 장소 ID여야 함
- `currentAction.targetLocationId`는 존재 시 유효한 장소여야 함
- `UnlockDefinition.targetId`는 콘텐츠 데이터 내 존재해야 함

## 17. MVP 최소 데이터 세트

초기 구현에 반드시 있어야 하는 데이터는 아래와 같다.

- `char_a.profile.json`
- `char_b.profile.json`
- `library.location.json`
- `cafe.location.json`
- `arcade.location.json`
- `park.location.json`
- `needs.default.json`
- `relationship.default.json`
- `char_b.unlock.json`
- `study`, `game`, `exercise`, `rest` 입력 카테고리
- `chat`, `co_study`, `watch_game`, `rest_together` 이벤트 템플릿

## 18. 데이터 모델 승인 체크리스트

- 정적 데이터와 런타임 상태가 분리되어 있는가?
- projection과 save snapshot이 구분되는가?
- 사용자 입력의 공식 경계가 `PlayerActionEntry`로 통일되는가?
- AI 산출물이 권위 상태와 분리되는가?
- 저장 포맷이 버전 마이그레이션을 감당할 수 있는가?
