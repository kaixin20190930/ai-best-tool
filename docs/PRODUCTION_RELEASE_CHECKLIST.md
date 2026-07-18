# Production Release Checklist

Use this checklist before promoting a release to production. The goal is to verify the money-facing, user-facing, SEO, and monitoring paths without turning every release into a giant QA project.

## 1. Build and Basic Health

- Run `pnpm build` locally and confirm it passes.
- Confirm Vercel production deployment finishes without build errors.
- Open `/api/healthz` and confirm it returns a healthy response.
- Open `/api/health` and confirm database-dependent health checks pass.
- Open `/api/monitor` with `Authorization: Bearer MONITOR_API_TOKEN` if the token is configured.
- Confirm GitHub Actions production health monitor is green.
- Confirm Feishu receives an alert when the health workflow fails in a controlled test, or keep this as a one-time setup verification.

## 2. Required Production Environment Variables

Core:

- `NEXT_PUBLIC_SITE_URL` (canonical production domain)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Database connection variables used by `db/neon/client`
- `CONTACT_US_EMAIL`

Note:

- The codebase normalizes the configured site URL before using it for redirects, breadcrumbs, share links, and transactional email links.

Email:

- `RESEND_API_KEY`
- `MAIL_FROM`
- `ADMIN_EMAILS`

Stripe checkout:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Current scope note:

- Stripe is currently used for one-time checkout, not subscriptions.
- If recurring billing is added later, add separate release checks for subscription lifecycle, renewal failures, grace periods, and downgrade behavior.

Monitor and scheduled jobs:

- `MONITOR_API_TOKEN`
- GitHub secret: `MONITOR_BASE_URL`
- GitHub secret: `MONITOR_API_TOKEN`
- GitHub secret: `FEISHU_WEBHOOK_URL`

Google Search Console:

- `GSC_PROPERTY_URL`
- `GSC_SITE_ORIGIN`
- `GSC_DEFAULT_SITEMAP_URL`
- `GSC_CLIENT_ID`
- `GSC_CLIENT_SECRET`
- `GSC_REFRESH_TOKEN`

Optional growth and ads:

- `GOOGLE_TRACKING_ID`
- `GOOGLE_ADSENSE_URL`

## 3. Database Schema

Confirm the production database has these newer tables or columns:

- `comments.is_hidden`
- `comments.hidden_reason`
- `comment_likes`
- `comment_reports`
- `comment_moderation_logs`
- `payment_callback_logs`
- `google_search_console_logs`

Recommended verification:

- Compare production schema against `db/supabase/schema.sql`.
- If the database was restored from an older Supabase backup, run `db/supabase/migrations/20260523_interactions_commercial_gsc.sql` in Supabase SQL Editor before testing comments, payment callbacks, or Search Console logs.

## 4. Public User Flows

Home page:

- Open `/cn` and `/`.
- Confirm hero, featured tools, community pulse, guide links, and developer listing entry render cleanly.
- Confirm paid/sponsored language feels like optional visibility, not forced advertising.

Explore and categories:

- Open `/cn/explore?search=gpt`.
- Open `/cn/categories/productivity?sort=popular`.
- Confirm filters, sorting, tool cards, sponsored labels, and empty states look correct.
- Confirm sponsored tools do not visually overwhelm normal ranking signals.

Tool detail:

- Open one published tool detail page, for example `/cn/ai/viggle`.
- Confirm visit/share/favorite/rating actions render.
- Confirm comments section loads.
- Confirm guide/internal links are not broken.

Guides and sitemap:

- Open `/cn/guides`.
- Open at least one guide page, for example `/cn/guides/how-to-choose-ai-tools`.
- Open `/sitemap.xml` and confirm guide URLs, category URLs, and tool URLs appear.

## 5. Authentication and Submission

Auth:

- Register a test account.
- Log in with the same account.
- Log out and log back in.
- Test forgot password only if production email is configured.

Free submission:

- Open `/cn/submit`.
- Submit a tool as a normal user with free listing selected.
- Confirm the submission appears in `/cn/profile/submissions`.
- Confirm the admin can see it in `/cn/admin/tools?status=pending`.

Commercial submission:

- Submit a tool with paid listing intent.
- Select fast review and a featured duration.
- Confirm `tools.features.submission.commercial` stores the selected plan, status, and requested featured days.
- Confirm the user-facing submission status is clear and not too aggressive.

Submission emails:

- Publish or reject a test submission from admin.
- Confirm the submitter receives the right email when email preferences allow it.

## 6. Admin Review and Operations

Admin dashboard:

- Open `/cn/admin/dashboard`.
- Confirm collection, review, commercial, comment, and health-style cards load.

Tool management:

- Open `/cn/admin/tools`.
- Test filters: draft, pending, paid intent, featured intent, needs media, quality, ready, overdue.
- Open a tool edit page.
- Update media, description, pricing, status, and commercial fields.
- Test one-click paid placement activation on a test tool.
- Confirm `featuredActiveFrom` and `featuredUntil` are set correctly.

Comment moderation:

- Open `/cn/admin/comments`.
- Filter visible, hidden, unresolved reports, most reported, latest.
- Hide and restore a test comment.
- Resolve and reopen a test report.
- Run a bulk action on test data.
- Confirm moderation logs are visible/exportable.

Payment callbacks:

- Open `/cn/admin/payment-callbacks`.
- If Stripe is configured, test the Stripe checkout route from `/profile/submissions` using a paid submission.
- If you need a direct monitor test, keep the existing `/api/monitor/commercial-payment-confirmed` path for manual callbacks or bridge integrations.
- Trigger a test callback:

```bash
curl -X GET \
  "https://your-domain.com/api/monitor/commercial-payment-confirmed?toolId=TOOL_UUID&transactionId=TEST_ORDER_001" \
  -H "Authorization: Bearer YOUR_MONITOR_API_TOKEN"
```

- Confirm the tool is activated as sponsored.
- Repeat the same transaction id and confirm the response is idempotent.
- Confirm the callback appears in `/cn/admin/payment-callbacks`.
- Confirm the paid listing does not bypass your metadata quality gate before public promotion.

Search Console:

- Open `/cn/admin/search-console`.
- Submit the default sitemap.
- Inspect one production URL.
- Confirm logs are written to `google_search_console_logs`.

## 7. Monitor APIs and GitHub Actions

Manual API checks:

- `/api/monitor/cleanup-sponsored`
- `/api/monitor/comment-moderation-report`
- `/api/monitor/google-search-console?action=submit-sitemap`
- `/api/monitor/google-search-console?action=inspect-url&inspectionUrl=https://your-domain.com/cn`
- `/api/monitor/commercial-payment-confirmed?toolId=TOOL_UUID&transactionId=TEST_ORDER_002`

GitHub workflows:

- `.github/workflows/production-health-monitor.yml`
- `.github/workflows/comment-moderation-daily-report.yml`

Confirm:

- Workflows have the required secrets.
- Scheduled jobs run successfully.
- Failures notify Feishu.
- Comment moderation report sends to `ADMIN_EMAILS`.
- Sponsored placement cleanup does not disable active paid placements early.

## 8. SEO and Indexing

- Confirm `NEXT_PUBLIC_SITE_URL` points to the production canonical domain.
- Confirm `/sitemap.xml` uses the production domain.
- Submit sitemap through `/cn/admin/search-console`.
- Confirm Google Search Console property matches `GSC_PROPERTY_URL`.
- Inspect a few URLs after deployment:
  - home page
  - one guide page
  - one category page
  - one tool detail page
- Avoid publishing a large number of thin pages at once. New guide pages should have useful comparison content, internal links, and clear intent.

## 9. Revenue UX Balance

Before shipping commercial changes, check these points:

- Free submission remains visible and usable.
- Paid listing is positioned as faster review and optional visibility, not a gatekeeper.
- Sponsored placement is labeled but visually restrained.
- Organic quality signals still matter: freshness, screenshots, comments, ratings, and usefulness.
- Developer listing page explains benefits clearly without sounding pushy.
- Tool detail pages help users decide first, then monetize second.

## 10. Go or No-Go

Go when:

- `pnpm build` passes.
- Production deployment is green.
- Login, submit, admin review, comments, and health routes work.
- Payment callback works on a test tool.
- Search Console sitemap submission works or fails with a clearly understood configuration issue.
- Feishu or email monitoring is active.

No-go when:

- Auth or database access fails.
- Admin cannot review submitted tools.
- Paid callback activates the wrong tool or resets an existing transaction.
- Comment moderation actions fail.
- Sitemap points to the wrong domain.
- Health checks fail in production.

## 11. First 24 Hours After Release

- Check Vercel logs for unexpected 500 errors.
- Check GitHub Actions health monitor.
- Check Feishu alerts.
- Review `/cn/admin/comments` for spam or auto-hidden comments.
- Review `/cn/admin/payment-callbacks` for unexpected failures.
- Review Search Console submission logs.
- Try one real user journey from home page to tool detail to comment or favorite.
