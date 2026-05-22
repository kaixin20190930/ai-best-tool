# SEO Alert Configuration Guide

## Overview

This guide provides detailed instructions for setting up automated alerts to monitor SEO health and detect issues early. Alerts are categorized by severity and response time requirements.

## Alert Categories

### 🔴 Critical Alerts (Immediate Response Required)

These alerts indicate severe issues that could significantly impact search visibility or user experience.

#### 1. Site Availability

**What to Monitor:**
- HTTP status codes (5xx errors)
- DNS resolution failures
- SSL certificate expiration

**Monitoring Tools:**
- UptimeRobot (Free tier available)
- Pingdom
- StatusCake
- Google Cloud Monitoring

**Configuration:**
```yaml
Monitor Type: HTTP(s)
URL: https://aibesttool.com
Check Interval: 5 minutes
Alert After: 2 consecutive failures
Notification: Email, SMS, Slack
```

**Response Actions:**
1. Check server status immediately
2. Review recent deployments
3. Check DNS configuration
4. Verify SSL certificate validity
5. Contact hosting provider if needed

#### 2. robots.txt Blocking

**What to Monitor:**
- robots.txt file accessibility
- Presence of blocking directives
- Sitemap reference accuracy

**Monitoring Method:**
- Daily automated script check
- Google Search Console monitoring

**Script Check:**
```bash
npm run seo:health-check
```

**Alert Conditions:**
- robots.txt returns 404
- Contains `Disallow: /` for all user agents
- Missing or incorrect sitemap reference

**Response Actions:**
1. Verify robots.txt file exists in `/public`
2. Check for accidental blocking directives
3. Ensure sitemap URL is correct
4. Deploy fix immediately

#### 3. Sitemap Errors

**What to Monitor:**
- Sitemap accessibility (HTTP 200)
- Valid XML format
- Sitemap submission status in GSC

**Monitoring Method:**
- Daily health check script
- Google Search Console alerts

**Alert Conditions:**
- Sitemap returns 404 or 500
- Invalid XML format
- GSC reports sitemap errors

**Response Actions:**
1. Check sitemap generation logic
2. Verify all URLs are valid
3. Test sitemap locally
4. Resubmit to Google Search Console

#### 4. Manual Actions (Google Search Console)

**What to Monitor:**
- Manual action notifications
- Security issues
- Spam reports

**Monitoring Method:**
- Google Search Console email notifications
- Weekly GSC dashboard review

**Alert Conditions:**
- Any manual action received
- Security issue detected
- Spam notification

**Response Actions:**
1. Review the specific issue in GSC
2. Identify affected pages
3. Fix the underlying problem
4. Request reconsideration
5. Monitor for resolution

---

### 🟡 Warning Alerts (24-48 Hour Response)

These alerts indicate issues that should be addressed soon but aren't immediately critical.

#### 5. Index Coverage Drop

**What to Monitor:**
- Number of indexed pages
- Coverage errors in GSC
- Excluded pages count

**Monitoring Method:**
- Weekly Google Search Console review
- Automated tracking script

**Alert Conditions:**
- >10% drop in indexed pages
- New coverage errors appear
- Significant increase in excluded pages

**Tracking Script:**
```javascript
// Add to monitoring dashboard
const indexedPages = await getGSCIndexedPages();
const previousCount = await getPreviousIndexedCount();
const changePercent = ((indexedPages - previousCount) / previousCount) * 100;

if (changePercent < -10) {
  sendAlert('Index coverage dropped by ' + changePercent + '%');
}
```

**Response Actions:**
1. Review GSC Coverage report
2. Identify newly excluded pages
3. Check for technical issues (robots.txt, noindex tags)
4. Fix errors and request re-indexing

#### 6. Organic Traffic Drop

**What to Monitor:**
- Organic sessions (Google Analytics)
- Organic clicks (Google Search Console)
- Landing page traffic

**Monitoring Method:**
- Google Analytics custom alerts
- Weekly traffic review

**Alert Conditions:**
- >20% drop week-over-week
- >30% drop month-over-month
- Sudden traffic loss to key pages

**Google Analytics Alert Setup:**
```
Custom Alert:
- Name: Organic Traffic Drop
- Period: Week
- Condition: Organic Sessions decreases by more than 20%
- Comparison: Previous week
- Send to: [email addresses]
```

**Response Actions:**
1. Check for algorithm updates
2. Review recent site changes
3. Analyze GSC performance data
4. Check for technical issues
5. Review competitor rankings

#### 7. Core Web Vitals Degradation

**What to Monitor:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

**Monitoring Method:**
- Google Search Console CWV report
- Lighthouse CI
- Real User Monitoring (RUM)

**Alert Conditions:**
- Any metric moves from "Good" to "Needs Improvement"
- >20% of URLs fail CWV thresholds
- Significant performance regression

**Lighthouse CI Configuration:**
```json
{
  "ci": {
    "collect": {
      "url": ["https://aibesttool.com"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

**Response Actions:**
1. Run performance audit: `npm run seo:performance`
2. Identify performance bottlenecks
3. Optimize images, scripts, or layouts
4. Test fixes in staging
5. Deploy and re-test

#### 8. Structured Data Errors

**What to Monitor:**
- Rich Results status in GSC
- Schema validation errors
- Structured data warnings

**Monitoring Method:**
- Weekly GSC Rich Results review
- Automated validation script

**Alert Conditions:**
- New structured data errors
- Increase in warnings
- Rich results no longer appearing

**Validation Script:**
```bash
npm run seo:validate
```

**Response Actions:**
1. Identify affected schema types
2. Test with Google Rich Results Test
3. Fix schema generation code
4. Validate fixes
5. Request re-indexing

---

### 🟢 Informational Alerts (Weekly Review)

These alerts provide insights and opportunities but don't require immediate action.

#### 9. New Ranking Keywords

**What to Monitor:**
- New queries with impressions
- Queries moving into top 20
- Emerging search trends

**Monitoring Method:**
- Weekly GSC performance review
- Keyword tracking tools

**Alert Conditions:**
- New queries with >100 impressions
- Queries jumping >10 positions
- New featured snippet opportunities

**Response Actions:**
1. Analyze new keyword opportunities
2. Optimize content for new queries
3. Create content for related topics
4. Monitor ranking progress

#### 10. Backlink Changes

**What to Monitor:**
- New backlinks
- Lost backlinks
- Referring domain changes

**Monitoring Method:**
- Google Search Console Links report
- Third-party backlink tools (Ahrefs, SEMrush)

**Alert Conditions:**
- Significant increase/decrease in backlinks
- New high-authority backlinks
- Loss of important backlinks

**Response Actions:**
1. Review new backlinks for quality
2. Disavow spammy links if needed
3. Reach out to sites that removed links
4. Analyze competitor backlink strategies

#### 11. Mobile Usability Issues

**What to Monitor:**
- Mobile usability errors in GSC
- Mobile page speed
- Mobile-specific rendering issues

**Monitoring Method:**
- Monthly GSC Mobile Usability review
- Mobile testing tools

**Alert Conditions:**
- New mobile usability errors
- Increase in affected pages
- Mobile CWV degradation

**Response Actions:**
1. Test affected pages on mobile devices
2. Fix usability issues
3. Validate fixes with GSC
4. Monitor for resolution

---

## Alert Delivery Methods

### Email Notifications

**Recommended for:**
- Critical alerts
- Daily/weekly summaries
- Manual action notifications

**Setup:**
- Google Search Console: Enable in Settings
- Google Analytics: Custom Alerts
- Monitoring tools: Configure email recipients

### Slack Integration

**Recommended for:**
- Team notifications
- Real-time alerts
- Automated report delivery

**Setup Example:**
```javascript
// Webhook integration
const sendSlackAlert = async (message: string, severity: 'critical' | 'warning' | 'info') => {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  const color = severity === 'critical' ? 'danger' : severity === 'warning' ? 'warning' : 'good';
  
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [{
        color,
        title: 'SEO Alert',
        text: message,
        footer: 'aibesttool.com SEO Monitoring',
        ts: Math.floor(Date.now() / 1000)
      }]
    })
  });
};
```

### SMS Notifications

**Recommended for:**
- Critical site-down alerts
- After-hours emergencies
- Manual actions

**Setup:**
- Use monitoring tool SMS features
- Configure for critical alerts only
- Limit to avoid alert fatigue

### Dashboard Monitoring

**Recommended for:**
- Daily health checks
- Trend monitoring
- Team visibility

**Tools:**
- Google Data Studio
- Custom monitoring dashboard
- Third-party SEO platforms

---

## Automated Monitoring Scripts

### Daily Health Check

**Schedule:** Every day at 9 AM
**Command:** `npm run seo:health-check`

**Cron Configuration:**
```bash
# Add to crontab
0 9 * * * cd /path/to/project && npm run seo:health-check
```

**What it checks:**
- robots.txt accessibility and content
- Sitemap availability
- SEO components existence
- Documentation completeness

### Weekly Comprehensive Audit

**Schedule:** Every Monday at 8 AM
**Command:** `npm run seo:audit`

**Cron Configuration:**
```bash
# Add to crontab
0 8 * * 1 cd /path/to/project && npm run seo:audit
```

**What it checks:**
- All metadata
- Structured data
- Image optimization
- Performance metrics

### Monthly Performance Review

**Schedule:** First day of month at 7 AM
**Command:** `npm run seo:performance`

**Cron Configuration:**
```bash
# Add to crontab
0 7 1 * * cd /path/to/project && npm run seo:performance
```

**What it checks:**
- Core Web Vitals
- Page load times
- Resource optimization
- Lighthouse scores

---

## Alert Response Workflow

### 1. Receive Alert

- Check alert severity
- Review alert details
- Assess immediate impact

### 2. Investigate

- Gather relevant data
- Check recent changes
- Review logs and metrics
- Identify root cause

### 3. Prioritize

- Assess business impact
- Determine urgency
- Allocate resources
- Set timeline for fix

### 4. Resolve

- Implement fix
- Test thoroughly
- Deploy to production
- Verify resolution

### 5. Document

- Record issue details
- Document solution
- Update runbooks
- Share learnings with team

### 6. Monitor

- Watch for recurrence
- Track metrics
- Adjust alerts if needed
- Schedule follow-up review

---

## Alert Tuning

### Avoiding Alert Fatigue

1. **Set appropriate thresholds**
   - Not too sensitive (false positives)
   - Not too lenient (miss real issues)

2. **Use alert grouping**
   - Combine related alerts
   - Avoid duplicate notifications

3. **Implement quiet hours**
   - Suppress non-critical alerts overnight
   - Queue for morning review

4. **Regular review**
   - Assess alert effectiveness monthly
   - Adjust thresholds based on patterns
   - Remove unnecessary alerts

### Testing Alerts

Before going live, test each alert:

1. **Trigger test conditions**
   - Simulate failures
   - Verify alert fires correctly

2. **Check delivery**
   - Confirm notifications arrive
   - Verify all recipients receive alerts

3. **Validate response**
   - Follow response workflow
   - Time the response process
   - Identify bottlenecks

---

## Integration with Existing Tools

### Google Search Console API

```javascript
// Example: Fetch index coverage data
import { google } from 'googleapis';

const searchconsole = google.searchconsole('v1');

async function getIndexCoverage() {
  const auth = await getAuth();
  const response = await searchconsole.urlInspection.index.inspect({
    auth,
    requestBody: {
      inspectionUrl: 'https://aibesttool.com',
      siteUrl: 'https://aibesttool.com'
    }
  });
  return response.data;
}
```

### Google Analytics API

```javascript
// Example: Fetch organic traffic data
import { BetaAnalyticsDataClient } from '@google-analytics/data';

async function getOrganicTraffic() {
  const analyticsDataClient = new BetaAnalyticsDataClient();
  
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }],
    dimensionFilter: {
      filter: {
        fieldName: 'sessionDefaultChannelGroup',
        stringFilter: { value: 'Organic Search' }
      }
    }
  });
  
  return response;
}
```

---

## Maintenance

### Monthly Review

- [ ] Review alert effectiveness
- [ ] Adjust thresholds if needed
- [ ] Update contact lists
- [ ] Test alert delivery
- [ ] Review response times
- [ ] Update documentation

### Quarterly Audit

- [ ] Comprehensive alert review
- [ ] Evaluate new monitoring tools
- [ ] Update response workflows
- [ ] Train team on procedures
- [ ] Review and update runbooks

---

## Resources

- [Google Search Console Help](https://support.google.com/webmasters)
- [Google Analytics Alerts](https://support.google.com/analytics/answer/1033021)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [UptimeRobot Documentation](https://uptimerobot.com/api/)

---

## Support

For questions or issues with alert configuration:
1. Review this documentation
2. Check monitoring tool documentation
3. Consult with development team
4. Contact SEO specialist if needed
