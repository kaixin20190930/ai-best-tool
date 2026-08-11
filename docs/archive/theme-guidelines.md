# Theme Guidelines

This project uses a light, fresh, and technology-forward visual system.

## Color system

Use semantic tokens from [globals.css](/Users/liukai/web/ai-best-tool/app/[locale]/globals.css):

- Background and surface:
  - `bg-background` for page base
  - `theme-page` for gradient page background
  - `theme-surface` for cards, panels, and blocks
- Text:
  - `theme-text-strong` or `text-slate-900` for main titles
  - `theme-text-muted` or `text-slate-500/600` for helper copy
- Brand accents:
  - Primary action: `bg-cyan-700 hover:bg-cyan-800 text-white`
  - Secondary chip/badge: `bg-cyan-50 text-cyan-700`
  - Positive status: `bg-emerald-50 text-emerald-700`

Avoid mixing unrelated bright accents on the same screen.

## Typography

Use clear hierarchy and keep contrast strong:

- Page H1: `text-4xl lg:text-6xl font-bold text-slate-950`
- Section H2: `text-2xl lg:text-3xl font-bold text-slate-950`
- Body copy: `text-sm` to `text-base` with `text-slate-600` and relaxed line-height
- Meta/helper text: `text-xs` to `text-sm` with `text-slate-500`

Do not mix too many text colors in one component.

## Components

- Cards/panels:
  - Prefer `theme-surface rounded-lg`
  - Border tone should stay in `slate-200/300` range
- Inputs:
  - Use white background, slate border, cyan focus
  - Example: `border-slate-300 focus:border-cyan-600 focus:ring-cyan-500`
- Links:
  - Default text links use cyan tones (`text-cyan-700 hover:text-cyan-800`)

## Consistency checklist

Before shipping a new page:

1. Confirm header/footer/navigation match the global theme.
2. Confirm primary CTA uses cyan primary style.
3. Confirm body copy and heading colors follow hierarchy.
4. Confirm cards and tables use `theme-surface` or equivalent surface styles.
5. Confirm mobile and desktop snapshots have no clashing accent colors.
