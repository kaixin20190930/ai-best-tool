import { cn } from '@/lib/utils';

import BaseImage from './BaseImage';

export default function Icon({
  src,
  className,
  title = '',
  width = 24,
  height = 24,
}: {
  src: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <BaseImage
      src={src}
      className={cn('h-6 w-6', className)}
      width={width}
      height={height}
      alt={title || 'icon'}
      title={title || 'icon'}
    />
  );
}
