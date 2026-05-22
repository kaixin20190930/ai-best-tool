# Technology Stack

## Core Framework

- **Next.js 14** with App Router (React Server Components)
- **React 18** with TypeScript
- **Node.js >=20.0.0**

## Package Manager

- **pnpm >=8.0.0** (required - yarn and npm are blocked via engines config)

## Database & Auth

- **Supabase**: PostgreSQL database with Row Level Security (RLS)
- **@supabase/ssr**: Server-side auth with cookie management
- Database clients: `lib/supabase/server.ts` (server), `lib/supabase/client.ts` (client)

## Internationalization

- **next-intl**: i18n with 9 supported locales
- Locale routing: `app/[locale]/` structure
- Translation files: `messages/*.json`

## UI & Styling

- **Tailwind CSS** with custom theme
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built components in `components/ui/`
- **Lucide React**: Icon library
- Dark mode by default

## Forms & Validation

- **react-hook-form**: Form state management
- **zod**: Schema validation
- **@hookform/resolvers**: Form validation integration

## SEO & Analytics

- Custom SEO utilities: `lib/seo/`
- Structured data (JSON-LD): Organization, Software, Breadcrumb schemas
- **@vercel/analytics**: Analytics tracking
- **@vercel/speed-insights**: Performance monitoring
- Google AdSense integration

## Development Tools

- **TypeScript** with strict mode
- **ESLint**: Airbnb config with TypeScript
- **Prettier**: Code formatting with import sorting
- **Husky**: Git hooks for pre-commit linting
- **tsx**: TypeScript execution for scripts

## Common Commands

```bash
# Development
pnpm dev                    # Start dev server

# Build & Deploy
pnpm build                  # Production build
pnpm start                  # Start production server

# Code Quality
pnpm lint                   # Run ESLint
pnpm lint:fix              # Fix ESLint issues
pnpm prettier              # Format code

# Database
pnpm setup-db              # Setup Supabase database
pnpm migrate               # Migrate data from lib/data.ts
pnpm verify-migration      # Verify migration

# SEO & Performance
pnpm seo:health-check      # Quick SEO health check
pnpm seo:audit             # Full SEO audit
pnpm seo:validate          # Validate SEO implementation
pnpm perf:audit            # Performance audit
pnpm perf:vitals           # Core Web Vitals check

# Scripts
npx tsx scripts/<name>.ts  # Run any script
```

## Image Optimization

- Next.js Image component with AVIF/WebP support
- Remote patterns: Cloudinary, Supabase storage
- Lazy loading with intersection observer
- Responsive image sizes configured

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SITE_URL`: Site domain
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `GOOGLE_TRACKING_ID`: Google Analytics
- `GOOGLE_ADSENSE_URL`: AdSense script URL
- `CONTACT_US_EMAIL`: Contact email
