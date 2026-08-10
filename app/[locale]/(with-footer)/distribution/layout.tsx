import type { ReactNode } from 'react';

import DistributionWorkspaceChrome from '@/components/distribution/DistributionWorkspaceChrome';
import DistributionActionCenter from '@/components/distribution/DistributionActionCenter';

type DistributionLayoutProps = {
  children: ReactNode;
  params: { locale: string };
};

export default function DistributionLayout({ children, params }: DistributionLayoutProps) {
  return (
    <>
      <DistributionWorkspaceChrome locale={params.locale}>{children}</DistributionWorkspaceChrome>
      <DistributionActionCenter />
    </>
  );
}
