# Image Optimization Guide

## Overview

This application uses Next.js Image optimization to automatically optimize images for better performance. Images are served in modern formats (AVIF, WebP) with appropriate sizes for different devices.

## Configuration

### Next.js Image Configuration

The image optimization is configured in `next.config.mjs`:

- **Formats**: AVIF and WebP for modern browsers
- **Device Sizes**: Optimized for common device widths
- **Cache TTL**: 30 days for optimal performance
- **Lazy Loading**: Enabled by default for below-the-fold images
- **Blur Placeholder**: Shown while images load

### Supported Image Domains

The following domains are configured for remote images:

1. `img.artiversehub.ai` - Primary image host
2. `*.cloudinary.com` - Cloudinary CDN (optional)
3. `*.supabase.co` - Supabase Storage (optional)

## Image Storage Options

### Option 1: Cloudinary (Recommended)

Cloudinary provides automatic image optimization, transformations, and CDN delivery.

**Setup:**

1. Create a Cloudinary account at https://cloudinary.com
2. Get your cloud name, API key, and API secret
3. Add to `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Upload images using Cloudinary SDK or dashboard
5. Use Cloudinary URLs in your database

**Benefits:**
- Automatic format conversion
- On-the-fly transformations
- Global CDN
- Image optimization
- Free tier available

### Option 2: Supabase Storage

Use Supabase Storage for integrated file storage with your database.

**Setup:**

1. Enable Storage in your Supabase project
2. Create a public bucket named `tool-images`
3. Configure storage policies for public read access
4. Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

5. Upload images using Supabase client
6. Use Supabase Storage URLs in your database

**Benefits:**
- Integrated with Supabase
- Simple setup
- Good for smaller projects
- Free tier available

### Option 3: Vercel Blob Storage

Use Vercel's native blob storage for seamless integration.

**Setup:**

1. Enable Blob Storage in Vercel dashboard
2. Add to `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=your_token
```

3. Use `@vercel/blob` package to upload images

**Benefits:**
- Native Vercel integration
- Simple API
- Automatic optimization
- Pay-as-you-go pricing

## Best Practices

### 1. Image Sizes

Use appropriate image sizes for different contexts:

- **Thumbnails**: 350x220px (aspect ratio 350:220)
- **Detail Images**: 800x600px
- **Screenshots**: 1920x1080px
- **Icons**: 64x64px or SVG

### 2. Lazy Loading

Images are lazy-loaded by default. For above-the-fold images, use `priority`:

```tsx
<BaseImage
  src={imageUrl}
  alt="Description"
  width={350}
  height={220}
  priority // Load immediately
/>
```

### 3. Responsive Images

Use the `sizes` prop to optimize image loading for different screen sizes:

```tsx
<BaseImage
  src={imageUrl}
  alt="Description"
  width={350}
  height={220}
  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 350px"
/>
```

### 4. Alt Text

Always provide descriptive alt text for accessibility:

```tsx
<BaseImage
  src={imageUrl}
  alt="ChatGPT interface showing conversation"
  width={350}
  height={220}
/>
```

### 5. Placeholder

The BaseImage component automatically adds a blur placeholder. For custom placeholders:

```tsx
<BaseImage
  src={imageUrl}
  alt="Description"
  width={350}
  height={220}
  placeholder="blur"
  blurDataURL="data:image/..." // Custom blur data URL
/>
```

## Migration Guide

### Migrating Existing Images

If you have existing images in the database:

1. **Audit Current Images**: Check all image URLs in the database
2. **Choose Storage Provider**: Select Cloudinary, Supabase, or Vercel Blob
3. **Upload Images**: Batch upload images to new storage
4. **Update Database**: Update image URLs in the database
5. **Test**: Verify all images load correctly

### Example Migration Script

```typescript
// scripts/migrate-images.ts
import { Pool } from 'pg';
import { v2 as cloudinary } from 'cloudinary';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrateImages() {
  const { rows } = await pool.query('SELECT id, image_url FROM tools');
  
  for (const row of rows) {
    if (row.image_url && !row.image_url.includes('cloudinary.com')) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(row.image_url, {
        folder: 'tools',
        public_id: row.id,
      });
      
      // Update database
      await pool.query(
        'UPDATE tools SET image_url = $1 WHERE id = $2',
        [result.secure_url, row.id]
      );
      
      console.log(`Migrated image for tool ${row.id}`);
    }
  }
  
  console.log('Migration complete!');
  await pool.end();
}

migrateImages();
```

## Performance Monitoring

Monitor image performance using:

1. **Vercel Analytics**: Built-in performance monitoring
2. **Lighthouse**: Run audits to check image optimization
3. **Chrome DevTools**: Network tab to verify image formats and sizes

## Troubleshooting

### Images Not Loading

1. Check that the domain is in `remotePatterns` in `next.config.mjs`
2. Verify image URLs are accessible
3. Check browser console for errors

### Images Loading Slowly

1. Verify image optimization is enabled (`unoptimized: false`)
2. Check image sizes are appropriate
3. Ensure CDN is configured correctly
4. Use `priority` for above-the-fold images

### CORS Errors

Add CORS headers to your image storage provider:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

## Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
