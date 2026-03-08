import { createDefaultActivityDraft } from './ActivityInputController';

export function createActivityInputViewModel() {
  return {
    draft: createDefaultActivityDraft(),
    helperText: '사용자 생활 입력은 E3 단계에서 실제 영향 신호로 연결된다.'
  };
}
