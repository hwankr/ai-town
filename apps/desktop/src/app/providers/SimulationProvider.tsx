import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo } from 'react';
import { InProcessSimulationHost, type SimulationHost } from '../../bridges/sim/InProcessSimulationHost';

const SimulationHostContext = createContext<SimulationHost | null>(null);

export function SimulationProvider({ children }: PropsWithChildren) {
  const host = useMemo(() => new InProcessSimulationHost(), []);
  return <SimulationHostContext.Provider value={host}>{children}</SimulationHostContext.Provider>;
}

export function useSimulationHost(): SimulationHost {
  const host = useContext(SimulationHostContext);
  if (!host) {
    throw new Error('SimulationHostContext is not available.');
  }
  return host;
}
