'use client';

import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export default function DistributionActionButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type='submit' disabled={pending} className={className}>
      {pending ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
      {pending ? pendingLabel : label}
    </button>
  );
}
