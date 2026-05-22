/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */
import Image from 'next/image';

export type ImageProps = React.ComponentProps<typeof Image>;

export default function BaseImage(props: ImageProps) {
  // Generate descriptive alt text from src if not provided
  const generateAltFromSrc = (src: string | undefined): string => {
    if (!src) return 'Image';
    const filename = src.split('/').pop()?.replace(/\.(svg|png|jpg|jpeg|webp)$/i, '') || '';
    return filename.replace(/[-_]/g, ' ').trim() || 'Image';
  };

  // Ensure alt text is always present and descriptive
  const altText = props.alt || (props.title as string) || generateAltFromSrc(props.src as string);

  return (
    <Image
      {...props}
      alt={altText}
      // Enable optimization by default, can be overridden via props
      unoptimized={props.unoptimized ?? false}
      // Use lazy loading by default unless priority is set
      loading={props.loading ?? (props.priority ? 'eager' : 'lazy')}
      // Add blur placeholder for better UX
      placeholder={props.placeholder ?? 'blur'}
      blurDataURL={
        props.blurDataURL ??
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=='
      }
    />
  );
}
