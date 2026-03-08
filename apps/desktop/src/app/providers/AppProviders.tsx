import type { PropsWithChildren } from 'react';
import { SimulationProvider } from './SimulationProvider';
import { SettingsProvider } from './SettingsProvider';
import { QueryProvider } from './QueryProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <SettingsProvider>
        <SimulationProvider>{children}</SimulationProvider>
      </SettingsProvider>
    </QueryProvider>
  );
}
