import { cn } from '@/lib/utils';

import BaseImage from './BaseImage';

export default function Icon({
  src,
  className,
  title = '',
  alt,
  width = 24,
  height = 24,
}: {
  src: string;
  title?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  // Generate descriptive alt text from src if not provided
  const generateAltFromSrc = (srcPath: string): string => {
    const filename = srcPath.split('/').pop()?.replace(/\.(svg|png|jpg|jpeg|webp)$/i, '') || '';
    return filename.replace(/[-_]/g, ' ').trim();
  };

  const altText = alt || title || generateAltFromSrc(src);

  return (
    <BaseImage
      src={src}
      className={cn('h-6 w-6', className)}
      width={width}
      height={height}
      alt={altText}
      title={title || altText}
    />
  );
}
