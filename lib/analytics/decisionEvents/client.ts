import type { DecisionEvent } from './contract';
import { createDecisionFlowController, type DecisionFlowController } from './flow';

type DecisionEventFactory = (flowInstanceId: string) => DecisionEvent;
type DecisionEventSender = (event: DecisionEvent) => Promise<unknown>;

export interface DecisionEventDispatcher {
  track(factory: DecisionEventFactory): boolean;
}

export function createDecisionEventDispatcher(input: {
  enabled: boolean;
  send: DecisionEventSender;
  flow?: DecisionFlowController;
}): DecisionEventDispatcher {
  const flow = input.flow || createDecisionFlowController();

  return {
    track(factory) {
      if (!input.enabled) return false;
      const event = factory(flow.getFlowInstanceId());
      try {
        input.send(event).catch(() => undefined);
      } catch {
        return false;
      }
      return true;
    },
  };
}
