# Theme Audit Checklist

Use this checklist before shipping UI changes to prevent visual drift.

## Goal

Keep the product style clean, readable, and consistent with the current theme system:

- neutral surfaces
- cyan primary actions
- slate text hierarchy
- minimal accent noise

## Quick command

Run:

```bash
pnpm theme:audit
```

This checks for legacy utility classes that usually indicate old styling.

## Manual checks

1. Verify page background and card surfaces:
   - page uses `theme-page` or `bg-background`
   - cards/panels use `theme-surface` or equivalent neutral white + slate border

2. Verify text hierarchy:
   - primary titles in `text-slate-900` (or `theme-text-strong`)
   - supporting text in `text-slate-500/600` (or `theme-text-muted`)

3. Verify action colors:
   - primary CTA uses cyan family (`bg-cyan-700 hover:bg-cyan-800`)
   - secondary controls use neutral slate backgrounds

4. Verify avoid-list classes are not newly introduced:
   - `text-blue-*`
   - `bg-blue-*`
   - `border-blue-*`
   - `text-gray-*`
   - `bg-gray-*`
   - `border-gray-*`
   - hardcoded hex colors unless approved design tokens

5. Verify responsive parity:
   - desktop and mobile keep the same visual language
   - no accidental dark blocks on light pages

## Review scope

At minimum, run checks against:

- `app/[locale]/**`
- `components/**`
- specifically changed files in current branch
