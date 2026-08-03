'use client';

import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { useDistributionFormState } from './DistributionActionForm';

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
  const formState = useDistributionFormState();
  const isPending = formState?.submitting ?? pending;

  return (
    <button type='submit' disabled={isPending} className={className}>
      {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
      {isPending ? pendingLabel : label}
    </button>
  );
}
