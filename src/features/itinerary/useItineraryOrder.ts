import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ItineraryStep } from './itinerary';

interface PersistedOrder {
  order: string[];
  custom: ItineraryStep[];
}

function stepKey(step: ItineraryStep): string {
  return step.kind === 'custom' ? (step.id ?? '') : step.kind;
}

function storageKey(matchId: string): string {
  return `pitchpal.itinerary.${matchId}`;
}

function loadPersisted(matchId: string): PersistedOrder | null {
  try {
    const raw = localStorage.getItem(storageKey(matchId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedOrder>;
    if (!Array.isArray(parsed.order) || !Array.isArray(parsed.custom)) return null;
    return { order: parsed.order, custom: parsed.custom };
  } catch {
    return null;
  }
}

function savePersisted(matchId: string, data: PersistedOrder): void {
  try {
    localStorage.setItem(storageKey(matchId), JSON.stringify(data));
  } catch {
    /* storage unavailable (private mode / quota) — order just won't persist */
  }
}

let customIdCounter = 0;
function nextCustomId(): string {
  customIdCounter += 1;
  return `custom-${Date.now()}-${customIdCounter}`;
}

export interface UseItineraryOrderResult {
  steps: ItineraryStep[];
  reorder: (fromIndex: number, toIndex: number) => void;
  addCustomStep: (label: string, time: number) => void;
  removeCustomStep: (id: string) => void;
}

/** Fan-controlled reordering + custom steps for the itinerary, persisted per match. */
export function useItineraryOrder(matchId: string, baseSteps: ItineraryStep[]): UseItineraryOrderResult {
  const [custom, setCustom] = useState<ItineraryStep[]>(() => loadPersisted(matchId)?.custom ?? []);
  const [order, setOrder] = useState<string[] | null>(() => loadPersisted(matchId)?.order ?? null);

  useEffect(() => {
    const persisted = loadPersisted(matchId);
    setCustom(persisted?.custom ?? []);
    setOrder(persisted?.order ?? null);
  }, [matchId]);

  const allSteps = useMemo(() => [...baseSteps, ...custom], [baseSteps, custom]);

  const orderedSteps = useMemo(() => {
    if (!order) return allSteps;
    const byKey = new Map(allSteps.map((s) => [stepKey(s), s]));
    const ordered: ItineraryStep[] = [];
    for (const key of order) {
      const step = byKey.get(key);
      if (step) {
        ordered.push(step);
        byKey.delete(key);
      }
    }
    return [...ordered, ...byKey.values()];
  }, [allSteps, order]);

  const persist = useCallback(
    (nextOrder: string[], nextCustom: ItineraryStep[]) => {
      savePersisted(matchId, { order: nextOrder, custom: nextCustom });
    },
    [matchId],
  );

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const keys = orderedSteps.map(stepKey);
      const [moved] = keys.splice(fromIndex, 1);
      if (moved === undefined) return;
      keys.splice(toIndex, 0, moved);
      setOrder(keys);
      persist(keys, custom);
    },
    [orderedSteps, custom, persist],
  );

  const addCustomStep = useCallback(
    (label: string, time: number) => {
      const step: ItineraryStep = { kind: 'custom', time, id: nextCustomId(), label };
      const nextCustom = [...custom, step];
      const nextOrder = [...orderedSteps.map(stepKey), stepKey(step)];
      setCustom(nextCustom);
      setOrder(nextOrder);
      persist(nextOrder, nextCustom);
    },
    [custom, orderedSteps, persist],
  );

  const removeCustomStep = useCallback(
    (id: string) => {
      const nextCustom = custom.filter((s) => s.id !== id);
      const nextOrder = orderedSteps.map(stepKey).filter((key) => key !== id);
      setCustom(nextCustom);
      setOrder(nextOrder);
      persist(nextOrder, nextCustom);
    },
    [custom, orderedSteps, persist],
  );

  return { steps: orderedSteps, reorder, addCustomStep, removeCustomStep };
}
