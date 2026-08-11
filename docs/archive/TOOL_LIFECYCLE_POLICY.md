# Tool Lifecycle Policy

This document defines how AI Best Tool should collect, review, publish, maintain, archive, and remove tools. It is written for day-to-day operations, not just strategy.

## Goals

- Keep the directory fresh and useful.
- Avoid clutter, duplicates, dead links, and low-value entries.
- Preserve historical records when a tool should not be shown publicly but may still be useful internally.
- Make decisions reproducible across different editors and moderators.

## Lifecycle States

We use four lifecycle states:

### 1. Candidate

A tool is a candidate when it has been discovered by automated collection, manual research, or user submission, but it is not ready for public display.

**Typical reasons**
- Missing metadata
- Unverified website
- No screenshot or unclear branding
- Duplicate possibility
- Low confidence in relevance

**Candidate requirements**
- Name
- URL
- Short description
- Source note

### 2. Published

A tool is published when it is good enough to show in the public directory, explore pages, and detail pages.

**Published requirements**
- Website is accessible
- Tool solves a clear use case
- Category is assigned
- Pricing is known or reasonably inferred
- Description is understandable and not generic
- Duplicate check has passed
- At least one image or screenshot is available or planned

### 3. Archived

A tool is archived when it should stay in the system but no longer belong in public rankings or active discovery surfaces.

**Use archive instead of delete when**
- The tool is discontinued, but historical tracking is still useful
- The tool is too low quality for public display, but may be reactivated later
- The tool was replaced by a better version or merged into another listing
- The listing is incomplete, but the record may be useful internally

### 4. Removed

A tool is removed when it should no longer exist in the system.

**Use remove only when**
- The website is dead and will not return
- The listing is a confirmed duplicate and the canonical tool already exists
- The entry is unsafe, policy-violating, or misleading
- The record is beyond recovery and adds no operational value

## Collection Workflow

### Daily

- Run automated collection for new tools
- Deduplicate against existing names, URLs, and fuzzy matches
- Move strong matches into Candidate
- Flag suspicious or low-confidence items for manual review
- Do not publish automatically unless confidence is very high

### Weekly

- Review all new candidates
- Promote qualified candidates to Published
- Fill missing metadata for high-potential tools
- Review rejected or low-confidence candidates
- Check whether top categories still have enough depth

### Monthly

- Recheck published tools for availability, pricing, description accuracy, and freshness
- Downgrade stale tools if metadata is outdated
- Reassign categories when taxonomy changes
- Identify tools that should move to Archived

### Quarterly

- Run a broad inventory cleanup
- Remove confirmed dead or duplicate tools
- Review category structure and tags
- Rebalance high-volume categories with underrepresented ones

## Promotion Standards

Promote a tool from Candidate to Published when all of the following are true:

- The tool has a clear user-facing purpose
- The official website works
- The tool is not obviously duplicated
- The category is correct or at least defensible
- The pricing label is usable
- The description is specific enough to explain why the tool exists
- The record does not violate policy or quality standards

## Archive Standards

Archive a published tool when one or more of the following happen:

- The tool is still reachable, but usage is clearly declining and the listing is stale
- The tool has not been updated for a long time and user value is low
- The tool is superseded by a better version or merged brand
- The tool no longer fits the directory focus, but should be kept for history

Archived tools should:
- Remain stored in the database
- Be excluded from default public listing and ranking surfaces
- Still be searchable for internal maintenance
- Be easy to restore if the tool becomes relevant again

## Removal Standards

Remove a tool only after archive is considered and rejected.

Remove when:
- The official site is dead and the tool is permanently gone
- It is a confirmed duplicate of another entry and should never be shown separately
- It is harmful, fraudulent, or policy-incompatible
- It has no public value and no internal value

When removing, keep a minimal audit trail if possible:
- Tool name
- Original URL
- Removal reason
- Removal date

## Duplicate Handling

When multiple records point to the same product:

- Keep the most complete and most active record
- Merge useful metadata into the canonical entry
- Archive the weaker record if it has historical value
- Remove only if it is a pure duplicate with no distinct value

## Quality Scoring

Each tool should be scored before promotion.

Suggested scoring dimensions:
- Website live status
- Metadata completeness
- Category fit
- Search relevance
- Screenshot quality
- Freshness/update signal
- Distinctiveness
- User value

Suggested action by score:
- High score: publish or keep published
- Medium score: candidate or published with follow-up
- Low score: archive or reject

## Required Operational Fields

The following fields should exist or be derivable for lifecycle management:

- `status`: candidate, published, archived, removed
- `qualityScore`
- `lastReviewedAt`
- `lastCheckedAt`
- `reviewNotes`
- `source`
- `duplicateOf`
- `archivedReason`
- `removedReason`
- `nextReviewAt`

## Review Cadence by State

- Candidate: review within 7 days
- Published: review every 30 days for active categories, every 60 to 90 days for long-tail categories
- Archived: review every 90 days
- Removed: no routine review, but keep audit log

## Operational Rules

- Never publish a tool that you cannot explain in one sentence.
- Never keep two public entries for the same product unless they are genuinely different offerings.
- Prefer archive over delete when uncertain.
- Prefer correction over removal when the issue is metadata quality.
- Prefer manual review for borderline cases.

## Recommended Actions in the Admin UI

The admin interface should support:

- Promote to published
- Send to candidate review
- Archive
- Restore from archive
- Remove
- Mark as duplicate
- Add review note
- Set next review date
- Assign quality score

## Recommended Automation

- Daily collection job for new candidates
- Weekly moderation/review queue
- Monthly freshness audit
- Quarterly cleanup job

## What Good Looks Like

A healthy directory should have:
- Fresh candidates coming in daily
- Published tools that are actually useful
- Archived tools preserved for history
- Very few removed entries
- Clear auditability for every state change

