import { AppShell } from '../layout/AppShell';
import { GameViewportLayout } from '../layout/GameViewportLayout';
import { GameHost } from '../../game/GameHost';
import { ActivityInputPanel } from '../../features/activity-input/ActivityInputPanel';
import { CharacterFocusCard } from '../../features/character-focus/CharacterFocusCard';
import { SaveSlotList } from '../../features/saves/SaveSlotList';
import { NotificationStack } from '../../features/notifications/NotificationStack';
import { UnlockTimeline } from '../../features/unlocks/UnlockTimeline';

export function HomeRoute() {
  return (
    <AppShell>
      <GameViewportLayout>
        <section>
          <GameHost />
          <NotificationStack />
        </section>
        <aside style={{ display: 'grid', gap: '1rem' }}>
          <CharacterFocusCard />
          <ActivityInputPanel />
          <SaveSlotList />
          <UnlockTimeline />
        </aside>
      </GameViewportLayout>
    </AppShell>
  );
}
