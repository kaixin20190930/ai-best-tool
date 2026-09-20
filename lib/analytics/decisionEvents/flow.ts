const FLOW_WINDOW_MS = 30 * 60 * 1000;

export interface DecisionFlowController {
  getFlowInstanceId(): string;
  clear(): void;
}

export function createDecisionFlowController(
  now: () => number = () => Date.now(),
  createId: () => string = () => crypto.randomUUID(),
): DecisionFlowController {
  let current: { id: string; expiresAt: number } | null = null;

  return {
    getFlowInstanceId() {
      const timestamp = now();
      if (!current || timestamp >= current.expiresAt) {
        current = { id: createId(), expiresAt: timestamp + FLOW_WINDOW_MS };
      } else {
        current.expiresAt = timestamp + FLOW_WINDOW_MS;
      }
      return current.id;
    },
    clear() {
      current = null;
    },
  };
}

export const DECISION_FLOW_WINDOW_MS = FLOW_WINDOW_MS;
