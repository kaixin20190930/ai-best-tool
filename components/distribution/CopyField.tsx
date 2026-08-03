'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyField({
  label,
  value,
  characterLimit,
  manual = false,
}: {
  label: string;
  value: string;
  characterLimit: number | null;
  manual?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  async function copyValue() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
      <div className='flex items-center justify-between gap-3'>
        <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>{label}</div>
        <button
          type='button'
          onClick={copyValue}
          disabled={!value || manual}
          className='inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-cyan-700 disabled:cursor-not-allowed disabled:text-slate-300'
        >
          {copied ? <Check className='h-3.5 w-3.5' /> : <Copy className='h-3.5 w-3.5' />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className='mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700'>
        {manual
          ? 'Complete this field manually on the target site.'
          : value || 'Missing value — complete this field before submitting.'}
      </div>
      {characterLimit ? (
        <div className={`mt-2 text-xs ${value.length > characterLimit ? 'font-bold text-rose-700' : 'text-slate-500'}`}>
          {value.length} / {characterLimit}
        </div>
      ) : null}
    </div>
  );
}
