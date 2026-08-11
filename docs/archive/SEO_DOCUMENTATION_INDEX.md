# SEO Documentation Index

Complete guide to SEO implementation and best practices for AI Best Tool.

## Overview

This documentation provides comprehensive guidance for implementing and maintaining SEO across the site. Whether you're a developer adding new pages, a content creator writing descriptions, or a maintainer monitoring performance, you'll find the resources you need here.

## Documentation Structure

### For Developers

#### 1. [SEO Guidelines for Adding New Pages](./SEO_GUIDELINES.md)
**Purpose:** Step-by-step guide for implementing SEO when creating new pages

**Contents:**
- Quick start checklist
- Metadata implementation
- Hreflang tags for multilingual pages
- Structured data integration
- Image optimization
- Internal linking strategies
- Page-type specific guidelines
- Validation and testing procedures

**When to use:** Every time you create a new page or route

#### 2. [Structured Data Patterns](./STRUCTURED_DATA_PATTERNS.md)
**Purpose:** Comprehensive patterns for implementing Schema.org structured data

**Contents:**
- Organization schema
- WebSite schema
- SoftwareApplication schema
- BreadcrumbList schema
- ItemList schema
- Article schema
- FAQPage schema
- Combining multiple schemas
- Validation and troubleshooting

**When to use:** When adding structured data to any page type

#### 3. [SEO Components README](../components/seo/README.md)
**Purpose:** Technical documentation for SEO React components

**Contents:**
- SEOHead component usage
- SocialMeta component
- StructuredData component
- Hreflang tag generation
- Complete implementation examples
- Best practices

**When to use:** When implementing SEO components in React/Next.js

#### 4. [SEO Components Examples](../components/seo/EXAMPLES.md)
**Purpose:** Real-world code examples for common scenarios

**Contents:**
- Basic page with SEO metadata
- Tool detail page with structured data
- Homepage with organization schema
- Multilingual pages with hreflang
- Blog posts with article schema
- Testing and validation examples

**When to use:** When you need a working example to reference

#### 5. [SEO Utilities README](../lib/seo/README.md)
**Purpose:** Documentation for SEO utility functions

**Contents:**
- Title generation utilities
- Description optimization functions
- URL generation helpers
- Schema generators
- API reference
- Testing utilities

**When to use:** When using SEO utility functions in your code

### For Content Creators

#### 6. [SEO Content Checklist](./SEO_CONTENT_CHECKLIST.md)
**Purpose:** Comprehensive checklist for content creators

**Contents:**
- Quick reference checklist
- Page metadata requirements
- Content quality guidelines
- Image optimization checklist
- Structured data requirements
- Pre-launch validation steps
- Post-launch tasks
- Common mistakes to avoid

**When to use:** Before publishing any new content or page

### For Internationalization

#### 7. [Hreflang Implementation Guide](./HREFLANG_IMPLEMENTATION.md)
**Purpose:** Complete guide to implementing hreflang tags

**Contents:**
- What are hreflang tags
- Implementation patterns
- x-default configuration
- Testing and validation
- Common issues and solutions
- Google Search Console integration

**When to use:** When working with multilingual pages

#### 8. [Hreflang Quick Reference](./HREFLANG_QUICK_REFERENCE.md)
**Purpose:** Quick reference for hreflang implementation

**Contents:**
- Quick implementation guide
- Code snippets
- Validation commands
- Common patterns

**When to use:** Quick lookup for hreflang syntax

### For Image Optimization

#### 9. [Image Optimization Guide](./IMAGE_OPTIMIZATION.md)
**Purpose:** Complete guide to image optimization

**Contents:**
- Image format selection
- Compression techniques
- Responsive images
- Lazy loading implementation
- Alt text best practices
- Social media image specifications

**When to use:** When adding or optimizing images

#### 10. [Image Alt Text Guidelines](./IMAGE_ALT_TEXT_GUIDELINES.md)
**Purpose:** Specific guidelines for writing alt text

**Contents:**
- Alt text best practices
- Examples of good vs bad alt text
- Accessibility considerations
- SEO optimization

**When to use:** When writing alt text for images

#### 11. [WebP Image Optimization](./WEBP_IMAGE_OPTIMIZATION.md)
**Purpose:** Guide to implementing WebP images

**Contents:**
- WebP format benefits
- Conversion process
- Fallback implementation
- Testing and validation

**When to use:** When implementing WebP image support

### For Performance

#### 12. [Lazy Loading Implementation](./LAZY_LOADING_IMPLEMENTATION.md)
**Purpose:** Guide to implementing lazy loading

**Contents:**
- Lazy loading concepts
- Implementation patterns
- Testing procedures
- Performance impact

**When to use:** When optimizing page load performance

#### 13. [Lazy Loading Quick Reference](./LAZY_LOADING_QUICK_REFERENCE.md)
**Purpose:** Quick reference for lazy loading

**Contents:**
- Quick implementation snippets
- Common patterns
- Testing commands

**When to use:** Quick lookup for lazy loading syntax

#### 14. [Performance Testing Guide](./PERFORMANCE_TESTING_GUIDE.md)
**Purpose:** Guide to testing and monitoring performance

**Contents:**
- Core Web Vitals
- Performance testing tools
- Optimization strategies
- Monitoring procedures

**When to use:** When testing or optimizing performance

### For Validation

#### 15. [SEO Quality Recovery Tasks (CN)](./SEO_QUALITY_RECOVERY_TASKS_CN.md)
**Purpose:** Archived recovery checklist now merged into the master tracker. Keep only for historical reference.

**Contents:**
- 2+4+8 week execution plan
- P0 technical cleanup tasks
- 20 priority pages for real-data enrichment
- Non-AI signal requirements
- Weekly GSC and conversion tracking metrics
- Pause list for programmatic expansion

**When to use:** Historical reference only; use the master tracker for current execution

#### 16. [SEO Indexing Policy (CN)](./SEO_INDEXING_POLICY_CN.md)
**Purpose:** Define which pages should be included in sitemap, which pages should stay as internal traffic pages, and which pages should never enter the index surface.

**Contents:**
- Sitemap inclusion rules
- Internal traffic page strategy
- Noindex page categories
- Multilingual indexing boundaries
- Promotion and maintenance cadence

**Status:** Active policy reference

#### 17. [Master Optimization Tracker (CN)](./MASTER_OPTIMIZATION_TRACKER_CN.md)
**Purpose:** A unified tracker that merges the 60-day commercial plan, SEO quality recovery plan, and competitor research into one monitorable execution board.

**Contents:**
- Combined plan inventory
- Rough completion estimates
- Shared execution order
- SEO, commercial, and content-signal metrics
- Weekly operating cadence

**When to use:** When you want one source of truth for what to do next across product, SEO, and commercialization

#### 18. [AI Tool Site 60 Day Execution Plan (CN)](./AI_TOOL_SITE_60_DAY_EXECUTION_PLAN_CN.md)
**Purpose:** Archived commercial plan merged into the master tracker. Keep only for historical reference.

**Contents:**
- Early commercialization goals
- Pricing / submit / claim basics
- Legacy 60-day milestones

**When to use:** Historical reference only; use the master tracker for current execution

#### 19. [Competitor Research and Next Optimization (CN)](./COMPETITOR_RESEARCH_AND_NEXT_OPTIMIZATION_CN.md)
**Purpose:** Archived research notes now folded into the master tracker and execution plan.

**Contents:**
- Competitor comparison notes
- User pain points from public sources
- Direction-setting for the next optimization wave

**When to use:** Historical reference only; use the master tracker for current execution

**When to use:** When deciding whether a page should be indexed, added to sitemap, or kept as an internal navigation target

#### 17. [SEO Indexing Control Table Template (CN)](./SEO_INDEXING_CONTROL_TABLE_TEMPLATE_CN.md)
**Purpose:** A practical operating template for weekly decisions on whether a URL should stay internal, remain noindex, or move into sitemap.

**Contents:**
- Recommended columns for the control table
- Status definitions
- Upgrade and downgrade rules
- Weekly review workflow

**When to use:** When you want a simple operational sheet instead of reading policy docs each time
#### 17. [SEO Validation Guide](./SEO_VALIDATION_GUIDE.md)
**Purpose:** Complete guide to validating SEO implementation

**Contents:**
- Validation tools and procedures
- Automated testing scripts
- Manual testing procedures
- Common issues and solutions

**When to use:** When validating SEO implementation

#### 17. [SEO Validation Quick Reference](./SEO_VALIDATION_QUICK_REFERENCE.md)
**Purpose:** Quick reference for validation commands

**Contents:**
- Quick validation commands
- Testing scripts
- Browser console checks

**When to use:** Quick lookup for validation commands

#### 18. [Search Console Quick Start](./SEARCH_CONSOLE_QUICK_START.md)
**Purpose:** Short release-time checklist for sitemap submission and URL inspection

**Contents:**
- Pre-submit checks
- Sitemap submission steps
- URL inspection targets
- Search Console verification steps

**When to use:** Right after deployment, when you want to submit sitemap and check indexing quickly

#### 18. [Stripe Checkout Setup](./STRIPE_CHECKOUT_SETUP.md)
**Purpose:** Step-by-step setup for paid listings and featured placement using Stripe Checkout

**Contents:**
- Stripe secret key and webhook setup
- Checkout session flow
- Webhook verification
- Local Stripe CLI testing

**When to use:** When you are ready to enable paid submission flow

#### 19. [索引收口方案（中文）](./INDEXING_RECOVERY_PLAN_CN.md)
**Purpose:** Explain how to reduce indexing noise and focus Google on the pages that matter most

**Contents:**
- Why large batches of low-priority URLs stay unindexed
- Why pagination and comparison pages should not compete for indexing first
- Why sitemap should focus on core locales and core pages
- What to watch in Search Console over the next 1-2 weeks

**When to use:** When coverage grows too fast, many URLs remain unindexed, or you need to decide which page types should be indexed first

#### 18a. [Paid Listing Model](./PAID_LISTING_MODEL.md)
**Purpose:** Defines the current one-time commercial model, paid listing rules, featured lifecycle, and the recommended future subscription roadmap

**Contents:**
- current one-time payment scope
- free / priority / featured / bundle structure
- paid submission quality gate
- featured timing rules
- archive / remove rules for paid listings
- future subscription plan suggestions

**When to use:** When deciding pricing, review rules, featured duration, refunds, or whether to add subscriptions

#### 18b. [付费入驻与订阅模型（中文）](./PAID_LISTING_MODEL_CN.md)
**Purpose:** 上述付费入驻和订阅模型的中文版本

**Contents:**
- 当前一次性收费范围
- 免费 / 优先审核 / 前排 / 套餐结构
- 付费提交通关门槛
- 前排计时与退出规则
- 归档 / 删除规则
- 未来订阅设计建议

**When to use:** 当你需要用中文规划付费策略、订阅路线和运营规则时

### For Tool Operations

#### 19. [Tool Lifecycle Policy](./TOOL_LIFECYCLE_POLICY.md)
**Purpose:** Operational policy for collecting, reviewing, publishing, archiving, and removing tools

**Contents:**
- Lifecycle states and definitions
- Daily, weekly, monthly, and quarterly review cadence
- Promotion, archive, and removal standards
- Duplicate handling
- Required operational fields
- Admin UI actions and automation recommendations

**When to use:** When operating the tool database and deciding whether a tool should be visible, archived, or removed

#### 19a. [工具生命周期政策（中文）](./TOOL_LIFECYCLE_POLICY_CN.md)
**Purpose:** 上述工具生命周期政策的中文版本

**Contents:**
- 生命周期状态与定义
- 每日、每周、每月、每季度复查节奏
- 发布、归档、删除标准
- 重复处理
- 必备运营字段
- 后台动作与自动化建议

**When to use:** 需要中文版本来做工具库日常运营决策时

### For Monitoring and Maintenance

#### 20. [SEO Monitoring Guide](./SEO_MONITORING_GUIDE.md)
**Purpose:** Comprehensive guide to SEO monitoring and maintenance

**Contents:**
- Google Search Console setup
- Key metrics to monitor
- Alert configuration
- Automated monitoring scripts
- Monthly SEO report generation
- Regular audit schedules
- Troubleshooting common issues

**When to use:** When setting up or maintaining SEO monitoring

#### 21. [SEO Monitoring Setup](./SEO_MONITORING_SETUP.md)
**Purpose:** Quick start guide for setting up SEO monitoring

**Contents:**
- Step-by-step setup instructions
- Google Search Console verification
- Google Analytics alert configuration
- Uptime monitoring setup
- Automated script scheduling
- Slack integration
- Verification checklist

**When to use:** When initially setting up monitoring infrastructure

#### 22. [SEO Alert Configuration](./SEO_ALERT_CONFIGURATION.md)
**Purpose:** Detailed guide to configuring SEO alerts

**Contents:**
- Critical alerts (immediate response)
- Warning alerts (24-48 hour response)
- Informational alerts (weekly review)
- Alert delivery methods
- Alert response workflows
- Integration examples

**When to use:** When configuring or adjusting alert thresholds

#### 23. [SEO Monthly Report Template](./SEO_MONTHLY_REPORT_TEMPLATE.md)
**Purpose:** Template for generating monthly SEO reports

**Contents:**
- Executive summary
- Traffic analysis
- Search Console performance
- Index coverage
- Core Web Vitals
- Structured data status
- Recommendations and goals

**When to use:** When generating monthly SEO reports

#### 24. [GSC Weekly Observation Log (CN)](./GSC_WEEKLY_OBSERVATION_LOG_CN.md)
**Purpose:** Weekly Search Console tracking sheet for recovery-phase decisions.

**Contents:**
- Weekly summary table
- Top queries
- Top pages
- Enhanced-page tracking
- Decision notes

**When to use:** When filling the weekly Search Console observation after recovery work starts producing data

#### 25. [Caching Strategy](./CACHING_STRATEGY.md)
**Purpose:** Guide to caching implementation

**Contents:**
- Caching strategies
- Implementation patterns
- Cache invalidation
- Performance impact

**When to use:** When implementing or optimizing caching

#### 22. [Mobile Optimization](./MOBILE_OPTIMIZATION.md)
**Purpose:** Guide to mobile optimization

**Contents:**
- Mobile-first design
- Responsive implementation
- Touch-friendly interfaces
- Mobile performance

**When to use:** When optimizing for mobile devices

## 中文运营文档

### 23. [每周运营手册（中文）](./OPERATIONS_RUNBOOK_CN.md)
**Purpose:** “慢更新、稳运营”模式的中文执行手册

**Contents:**
- 每周怎么跑
- 每月怎么复盘
- 每季度怎么调整
- 什么时候加内容
- 什么时候补工具
- 什么时候收一收，不再扩张

**When to use:** 你想直接按中文节奏运营网站时

### 24. [媒体补全执行手册（中文）](./MEDIA_BACKFILL_PLAYBOOK_CN.md)
**Purpose:** 把“缺 logo / 缺截图 / 还在用 placeholder favicon”的问题变成每周固定执行动作

**Contents:**
- 什么时候需要跑媒体补全
- 先看哪个后台面板
- Top 5 补图队列怎么拉
- 每条工具至少补什么
- 每周怎么执行和复盘

**When to use:** 你准备开始系统性补 logo、截图和卡片首图质量时

### 25. [决策摘要填写手册（中文）](./DECISION_SNAPSHOT_PLAYBOOK_CN.md)
**Purpose:** 统一工具详情页 `features.decision` 字段的填写标准，让页面更像真实选型页

**Contents:**
- `compareAxes` 等 6 个字段分别该怎么写
- 每个字段推荐长度和写法边界
- 写作类 / Web3 / 开发类 / 自动化类工具的填写重点
- 什么时候该补、什么时候该更新

### 26. [优先收录队列（中文）](./PRIORITY_INDEXING_QUEUE_CN.md)
**Purpose:** 把“先推哪些 URL 给 Google”变成一份可直接执行的 Search Console 清单

**Contents:**
- 当前最值得优先收录的 20 个 URL
- 按首页 / 分类 / guide / 工具详情页分层排序
- 一周内怎么分批提交
- 提交后应该看哪些状态
- 哪些页现在不应该急着推
- 如何通过脚本批量写回数据库

**When to use:** 你或我准备给重点工具补“适合谁 / 官方可信度 / 定价判断 / 社区信号”这类决策信息时

## Quick Start Guides

### Adding a New Page

1. Read [SEO Guidelines](./SEO_GUIDELINES.md) - Step-by-step guide
2. Reference [SEO Components Examples](../components/seo/EXAMPLES.md) - Code examples
3. Check [Structured Data Patterns](./STRUCTURED_DATA_PATTERNS.md) - Schema implementation
4. Use [SEO Content Checklist](./SEO_CONTENT_CHECKLIST.md) - Pre-launch validation

### Adding a Tool Page

1. Review [Tool Detail Page Guidelines](./SEO_GUIDELINES.md#tool-detail-pages)
2. Implement [SoftwareApplication Schema](./STRUCTURED_DATA_PATTERNS.md#pattern-3-softwareapplication-schema)
3. Add [BreadcrumbList Schema](./STRUCTURED_DATA_PATTERNS.md#pattern-4-breadcrumblist-schema)
4. Optimize [Images](./IMAGE_OPTIMIZATION.md)
5. Validate with [SEO Content Checklist](./SEO_CONTENT_CHECKLIST.md)

### Adding Multilingual Support

1. Read [Hreflang Implementation Guide](./HREFLANG_IMPLEMENTATION.md)
2. Use [Hreflang Quick Reference](./HREFLANG_QUICK_REFERENCE.md) for code
3. Test with validation scripts
4. Verify in Google Search Console

### Optimizing Performance

1. Review [Performance Testing Guide](./PERFORMANCE_TESTING_GUIDE.md)
2. Implement [Lazy Loading](./LAZY_LOADING_IMPLEMENTATION.md)
3. Optimize [Images](./IMAGE_OPTIMIZATION.md)
4. Review [Caching Strategy](./CACHING_STRATEGY.md)
5. Test with performance scripts

## Testing and Validation Scripts

All scripts are located in the `/scripts` directory:

### SEO Audits
```bash
# Daily health check
npm run seo:health-check

# Quick SEO audit
npm run seo:audit:quick

# Comprehensive SEO audit
npm run seo:audit

# Complete validation
npm run seo:validate

# Performance audit
npm run seo:performance
```

### Structured Data Validation
```bash
# Verify organization schema
npx tsx scripts/verify-organization-schema.ts

# Verify software schema
npx tsx scripts/verify-software-schema-rendering.ts

# Verify breadcrumb schema
npx tsx scripts/verify-breadcrumb-schema.ts

# Test software schema rendering
npx tsx scripts/test-software-schema.ts
```

### Metadata Validation
```bash
# Verify homepage metadata
npx tsx scripts/verify-homepage-metadata.ts

# Verify listing pages metadata
npx tsx scripts/verify-listing-pages-metadata.ts

# Verify tool detail metadata
npx tsx scripts/verify-tool-detail-metadata.ts

# Verify SEOHead component
npx tsx scripts/verify-seohead.ts
```

### Internationalization
```bash
# Verify hreflang tags
npx tsx scripts/verify-hreflang.ts

# Test hreflang rendering
npx tsx scripts/test-hreflang-rendering.ts

# Verify language content
npx tsx scripts/verify-language-content.ts
```

### Image Optimization
```bash
# Audit image alt attributes
npx tsx scripts/audit-image-alt-attributes.ts

# Verify image improvements
npx tsx scripts/verify-image-alt-improvements.ts

# Verify WebP support
npx tsx scripts/verify-webp-support.ts

# Test WebP rendering
npx tsx scripts/test-webp-rendering.ts
```

### Performance
```bash
# Performance audit
npx tsx scripts/performance-audit.ts

# Verify Core Web Vitals
npx tsx scripts/verify-core-web-vitals.ts

# Test lazy loading
npx tsx scripts/test-lazy-loading-performance.ts

# Verify lazy loading
npx tsx scripts/verify-lazy-loading.ts
```

### Other
```bash
# Test sitemap
npx tsx scripts/test-sitemap.ts

# Verify sitemap XML
npx tsx scripts/verify-sitemap-xml.ts

# Test related tools
npx tsx scripts/test-related-tools.ts

# Verify related tools rendering
npx tsx scripts/verify-related-tools-rendering.ts
```

## External Validation Tools

### Google Tools
- [Google Rich Results Test](https://search.google.com/test/rich-results) - Validate structured data
- [Google PageSpeed Insights](https://pagespeed.web.dev/) - Test performance
- [Google Search Console](https://search.google.com/search-console) - Monitor search performance
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) - Test mobile optimization

### Social Media Tools
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) - Test Open Graph tags
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) - Test Twitter Cards
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) - Test LinkedIn sharing

### Schema Validation
- [Schema.org Validator](https://validator.schema.org/) - Validate JSON-LD syntax
- [Structured Data Linter](http://linter.structured-data.org/) - Alternative validator

### Performance Tools
- [WebPageTest](https://www.webpagetest.org/) - Detailed performance analysis
- [GTmetrix](https://gtmetrix.com/) - Performance and optimization recommendations
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome DevTools

## Common Workflows

### Workflow 1: Creating a New Tool Page

```
1. Create page file: app/[locale]/ai/[toolName]/page.tsx
2. Implement generateMetadata() with SEOHead
3. Add SoftwareApplication schema
4. Add BreadcrumbList schema
5. Optimize images with alt text
6. Add internal links to related tools
7. Run validation: npx tsx scripts/verify-tool-detail-metadata.ts
8. Test structured data: npx tsx scripts/verify-software-schema-rendering.ts
9. Check in browser DevTools
10. Submit to Google Search Console
```

### Workflow 2: Adding Multilingual Support

```
1. Create translated content
2. Add hreflang tags using generateHreflangMetadata()
3. Verify x-default points to English
4. Test: npx tsx scripts/verify-hreflang.ts
5. Check in browser console
6. Verify in Google Search Console
```

### Workflow 3: Optimizing Existing Page

```
1. Run SEO audit: npx tsx scripts/seo-audit-quick.ts
2. Review recommendations
3. Update metadata if needed
4. Add missing structured data
5. Optimize images
6. Add internal links
7. Test performance: npx tsx scripts/performance-audit.ts
8. Validate: npx tsx scripts/validate-seo-complete.ts
```

## Best Practices Summary

### Metadata
- Title: 30-60 characters, keyword at start
- Description: 120-160 characters, includes CTA
- Always set canonical URL
- Include hreflang for multilingual pages

### Structured Data
- Use most specific schema type
- Include all required fields
- Use absolute URLs
- Validate before deploying
- Match visible page content

### Images
- Always include descriptive alt text
- Use WebP format with fallbacks
- Implement lazy loading for below-fold images
- Optimize dimensions and file size
- Use descriptive filenames

### Content
- Unique and valuable content
- Natural keyword usage
- Proper heading hierarchy
- Internal linking
- Mobile-friendly design

### Performance
- Page loads under 3 seconds
- Core Web Vitals pass
- Lazy loading implemented
- Images optimized
- Caching enabled

## Troubleshooting

### Common Issues

**Issue: Structured data not validating**
- Solution: Check [Structured Data Patterns](./STRUCTURED_DATA_PATTERNS.md#troubleshooting)
- Run: `npx tsx scripts/verify-software-schema-rendering.ts`

**Issue: Hreflang errors in Search Console**
- Solution: Check [Hreflang Implementation Guide](./HREFLANG_IMPLEMENTATION.md#troubleshooting)
- Run: `npx tsx scripts/verify-hreflang.ts`

**Issue: Poor page performance**
- Solution: Check [Performance Testing Guide](./PERFORMANCE_TESTING_GUIDE.md)
- Run: `npx tsx scripts/performance-audit.ts`

**Issue: Images not optimized**
- Solution: Check [Image Optimization Guide](./IMAGE_OPTIMIZATION.md)
- Run: `npx tsx scripts/verify-image-alt-improvements.ts`

**Issue: Missing metadata**
- Solution: Check [SEO Guidelines](./SEO_GUIDELINES.md)
- Run: `npx tsx scripts/validate-seo-complete.ts`

## Getting Help

1. **Check Documentation:** Review relevant guides in `/docs`
2. **Run Validation Scripts:** Use scripts in `/scripts` to identify issues
3. **Review Examples:** Check `components/seo/EXAMPLES.md`
4. **Check Audit Reports:** Review `.kiro/specs/seo-optimization/FINAL_SEO_AUDIT.md`
5. **Ask the Team:** Consult with developers or SEO specialists

## Maintenance Schedule

### Daily (5 minutes)
- Check email for Google Search Console alerts
- Review uptime monitor status
- Check GitHub issues for automated alerts
- Run: `npm run seo:health-check`

### Weekly (30 minutes)
- Review Google Search Console performance report
- Check index coverage status
- Review Google Analytics organic traffic trends
- Run: `npm run seo:audit:quick`
- Check Core Web Vitals

### Monthly (2 hours)
- Generate monthly SEO report (use template)
- Run: `npm run seo:audit`
- Run: `npm run seo:performance`
- Review and update content strategy
- Analyze competitor performance
- Update structured data if needed

### Quarterly (4 hours)
- Comprehensive technical SEO audit
- Review and update monitoring thresholds
- Evaluate new monitoring tools
- Update team documentation
- Conduct team training refresh
- Analyze search performance trends
- Update SEO strategy
- Review and optimize underperforming pages

## Additional Resources

### Internal Documentation
- [SEO Audit Report](../scripts/SEO_AUDIT_REPORT.md)
- [Final SEO Audit](./.kiro/specs/seo-optimization/FINAL_SEO_AUDIT.md)
- [Maintenance Plan](./.kiro/specs/seo-optimization/MAINTENANCE_PLAN.md)
- [Remaining Improvements](./.kiro/specs/seo-optimization/REMAINING_IMPROVEMENTS.md)
- [Weekly Operations Runbook](./OPERATIONS_RUNBOOK.md)

### External Resources
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Web.dev SEO Guide](https://web.dev/learn/seo/)

---

**Last Updated:** December 2024

**Maintained By:** Development Team

**Questions?** Check the documentation or ask the team!
