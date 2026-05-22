# Project Structure

## Directory Organization

### `/app` - Next.js App Router

```
app/
├── [locale]/                    # Locale-based routing
│   ├── (with-footer)/          # Layout group with footer
│   │   ├── (home)/             # Homepage
│   │   ├── explore/            # Tool listing with pagination
│   │   ├── ai/[websiteName]/   # Tool detail pages
│   │   ├── startup/            # Startup tools page
│   │   ├── submit/             # Tool submission form
│   │   ├── login/              # Auth pages
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── profile/favorites/  # User favorites
│   ├── (admin)/                # Admin layout group
│   │   └── admin/
│   │       ├── dashboard/      # Admin dashboard
│   │       ├── tools/          # Tool management
│   │       └── analytics/      # Analytics
│   ├── layout.tsx              # Root layout with i18n
│   ├── globals.css             # Global styles
│   └── not-found.tsx           # 404 page
├── actions/                    # Server actions
│   ├── auth.ts
│   ├── favorites.ts
│   ├── ratings.ts
│   ├── comments.ts
│   └── admin/tools.ts
└── auth/                       # Auth callbacks
    ├── callback/route.ts
    └── reset-password/
```

### `/components` - React Components

```
components/
├── ui/                         # shadcn/ui components
│   ├── button.tsx
│   ├── form.tsx
│   ├── input.tsx
│   └── ...
├── seo/                        # SEO components
│   ├── SEOHead.tsx            # Main SEO component
│   ├── StructuredData.tsx     # JSON-LD schemas
│   ├── SocialMeta.tsx         # OG/Twitter tags
│   └── README.md              # Usage docs
├── home/                       # Homepage components
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   └── NavigationDrawer.tsx
├── webNav/                     # Tool card components
│   ├── WebNavCard.tsx
│   └── WebNavCardList.tsx
├── auth/                       # Auth components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── UserMenu.tsx
├── comments/                   # Comment system
├── admin/                      # Admin components
└── [feature].tsx              # Feature components
```

### `/lib` - Utilities & Services

```
lib/
├── seo/                        # SEO utilities
│   ├── metadata.ts            # Title/description generators
│   ├── schema.ts              # JSON-LD schema generators
│   ├── constants.ts           # SEO config
│   ├── __tests__/             # SEO tests
│   └── README.md
├── supabase/                   # Supabase clients
│   ├── server.ts              # Server-side client
│   ├── client.ts              # Client-side client
│   └── middleware.ts          # Auth middleware
├── services/                   # Data services
│   ├── tools.ts               # Tool queries
│   ├── categories.ts
│   ├── tags.ts
│   ├── recommendations.ts
│   └── admin/analytics.ts
├── auth/                       # Auth utilities
├── utils/                      # Helper functions
│   ├── stringUtils.ts
│   ├── timeUtils.ts
│   └── objectUtils.ts
├── cache.ts                    # Caching utilities
├── constants.ts                # App constants
└── data.ts                     # Legacy static data
```

### `/db` - Database

```
db/
├── supabase/
│   ├── schema.sql             # Database schema
│   ├── client.ts              # Supabase client
│   └── README.md              # Setup instructions
└── neon/                       # Alternative Neon DB
```

### `/scripts` - Utility Scripts

```
scripts/
├── setup-database.ts          # DB initialization
├── migrate-data.ts            # Data migration
├── seo-audit.ts               # SEO auditing
├── performance-audit.ts       # Performance checks
├── verify-*.ts                # Verification scripts
├── test-*.ts                  # Testing scripts
└── *.md                       # Documentation
```

### `/messages` - i18n Translations

```
messages/
├── en.json                    # English
├── cn.json                    # Simplified Chinese
├── tw.json                    # Traditional Chinese
├── de.json                    # German
├── es.json                    # Spanish
├── fr.json                    # French
├── jp.json                    # Japanese
├── pt.json                    # Portuguese
└── ru.json                    # Russian
```

### `/docs` - Documentation

```
docs/
├── SEO_*.md                   # SEO guides
├── AUTH_*.md                  # Auth guides
├── IMAGE_*.md                 # Image optimization
├── PERFORMANCE_*.md           # Performance guides
└── *_QUICK_REFERENCE.md       # Quick references
```

## Key Conventions

### Routing
- Locale prefix required: `/[locale]/path`
- Layout groups: `(with-footer)`, `(admin)` for shared layouts
- Dynamic routes: `[websiteName]`, `[id]`, `[pageNum]`

### Server vs Client
- Server Components by default (no 'use client')
- Add 'use client' only when needed (forms, interactivity, hooks)
- Server Actions in `app/actions/`
- Data fetching in Server Components or services

### Database Access
- Use `createClient()` from `lib/supabase/server.ts` in Server Components
- Use `createBrowserClient()` from `lib/supabase/client.ts` in Client Components
- All queries through service layer in `lib/services/`

### SEO Implementation
- Use `generateSEOMetadata()` from `components/seo/SEOHead.tsx`
- Add structured data with `<StructuredData>` component
- Include hreflang with `generateHreflangMetadata()`
- Follow patterns in `docs/SEO_GUIDELINES.md`

### Styling
- Tailwind utility classes
- Custom theme in `tailwind.config.ts`
- Dark mode: `dark:` prefix
- Component variants with `class-variance-authority`

### Type Safety
- Strict TypeScript mode enabled
- Zod schemas for validation
- Type definitions in component files or separate `.d.ts`
