'use client';

import { useMemo, useState } from 'react';

import BaseImage from '@/components/image/BaseImage';

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
  imageClassName?: string;
};

export function UserAvatar({
  name,
  avatarUrl,
  size = 32,
  className = '',
  imageClassName = '',
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const initials = useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) return 'U';
    return trimmed.charAt(0).toUpperCase();
  }, [name]);

  const shouldShowImage = Boolean(avatarUrl) && !imageFailed;

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden rounded-full bg-cyan-600 font-semibold text-white ${className}`}
      style={{ width: size, height: size }}
    >
      {!shouldShowImage ? (
        <span className="select-none" aria-hidden="true">
          {initials}
        </span>
      ) : null}

      {shouldShowImage ? (
        <BaseImage
          src={avatarUrl as string}
          alt={`${name} profile avatar`}
          width={size}
          height={size}
          className={`h-full w-full rounded-full object-cover ${imageClassName}`}
          onError={() => setImageFailed(true)}
          unoptimized
        />
      ) : null}
    </div>
  );
}
