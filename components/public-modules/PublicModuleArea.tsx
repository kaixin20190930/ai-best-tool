import React, { Fragment, type ReactNode } from 'react';

import {
  evaluatePublicModules,
  publicModuleControls,
  publicModuleRegistry,
  type PublicModuleControls,
  type PublicModulePage,
  type PublicModuleRegistry,
  type PublicModuleRequest,
} from '@/lib/content/publicModuleRegistry';

export type PublicModuleAreaProps = {
  page: PublicModulePage;
  placement: PublicModuleRequest['placement'];
  modules: readonly { request: PublicModuleRequest; render: () => ReactNode }[];
};

// One area owns all new module instances on a page. Existing evidence and core modules stay outside it.
// Only the approved content is rendered; registry, experiment state and rejection reasons stay server-side.
export function createPublicModuleArea(
  registry: PublicModuleRegistry | null,
  controls: PublicModuleControls,
  now?: Date,
) {
  return function PublicModuleArea({ page, placement, modules }: PublicModuleAreaProps) {
    const decisions = evaluatePublicModules(
      registry,
      page,
      modules.map((item) => item.request),
      controls,
      now,
    );
    return decisions.map((decision, index) =>
      (decision.show && modules[index].request.placement === placement
        ? <Fragment key={decision.instanceId}>{modules[index].render()}</Fragment> : null),
    );
  };
}

export default createPublicModuleArea(publicModuleRegistry, publicModuleControls);
