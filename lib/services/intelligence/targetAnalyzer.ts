import type {
  DistributionTargetAnalysisResult,
  DistributionTargetDiscoveryResult,
  DistributionTargetFieldRequirement,
  DistributionTargetMatchReason,
  DistributionTargetMatchScore,
  DistributionTargetPageDiscovery,
  DistributionTargetObstacleFinding,
  DistributionTargetRuleFinding,
} from '@/lib/services/intelligence/types';

const knownFieldMatchers: Array<{
  fieldName: string;
  fieldType: DistributionTargetFieldRequirement['fieldType'];
  patterns: RegExp[];
  requiredAsset: string | null;
}> = [
  { fieldName: 'name', fieldType: 'text', patterns: [/\bname\b/i, /\bproduct name\b/i], requiredAsset: null },
  { fieldName: 'title', fieldType: 'text', patterns: [/\btitle\b/i, /\bheadline\b/i], requiredAsset: null },
  { fieldName: 'website', fieldType: 'url', patterns: [/\bwebsite\b/i, /\burl\b/i, /\blink\b/i], requiredAsset: null },
  { fieldName: 'description', fieldType: 'textarea', patterns: [/\bdescription\b/i, /\bshort description\b/i, /\bsummary\b/i], requiredAsset: null },
  { fieldName: 'category', fieldType: 'select', patterns: [/\bcategory\b/i, /\bcategories\b/i, /\btag\b/i], requiredAsset: null },
  { fieldName: 'email', fieldType: 'email', patterns: [/\bemail\b/i, /\be-mail\b/i], requiredAsset: null },
  { fieldName: 'logo', fieldType: 'file', patterns: [/\blogo\b/i], requiredAsset: 'logo' },
  { fieldName: 'screenshot', fieldType: 'file', patterns: [/\bscreenshot\b/i, /\bpreview image\b/i], requiredAsset: 'screenshot' },
  { fieldName: 'twitter', fieldType: 'url', patterns: [/\btwitter\b/i, /\bx\.com\b/i], requiredAsset: null },
  { fieldName: 'discord', fieldType: 'text', patterns: [/\bdiscord\b/i], requiredAsset: null },
  { fieldName: 'github', fieldType: 'url', patterns: [/\bgithub\b/i], requiredAsset: null },
];

function normalizeText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function pageText(page: DistributionTargetPageDiscovery): string {
  return [page.title, page.excerpt, page.anchorText, page.url, ...page.signals].filter(Boolean).join(' ');
}

function hasSignal(page: DistributionTargetPageDiscovery, pattern: RegExp): boolean {
  return pattern.test(pageText(page));
}

function confidenceFromSignals(matches: number, base = 58): number {
  return Math.min(98, base + matches * 8);
}

function buildRule(
  kind: DistributionTargetRuleFinding['kind'],
  severity: DistributionTargetRuleFinding['severity'],
  label: string,
  value: string | number | boolean | null,
  sourceUrl: string | null,
  evidence: string[],
  confidence: number,
): DistributionTargetRuleFinding {
  return {
    kind,
    severity,
    label,
    value,
    sourceUrl,
    evidence: uniqueStrings(evidence),
    confidence,
  };
}

function buildObstacle(
  obstacle: DistributionTargetObstacleFinding['obstacle'],
  severity: DistributionTargetObstacleFinding['severity'],
  label: string,
  value: string | number | boolean | null,
  sourceUrl: string | null,
  evidence: string[],
  confidence: number,
): DistributionTargetObstacleFinding {
  return {
    obstacle,
    severity,
    label,
    value,
    sourceUrl,
    evidence: uniqueStrings(evidence),
    confidence,
  };
}

function classifyBlockedReasons(result: DistributionTargetDiscoveryResult): string[] {
  const blocked = new Set<string>();
  for (const signal of result.signals.blockedSignals) {
    if (signal.includes('login_wall')) blocked.add('account_required');
    if (signal.includes('captcha')) blocked.add('captcha_blocked');
    if (signal.includes('server_error')) blocked.add('server_error');
    if (signal.includes('missing_page')) blocked.add('missing_page');
  }
  if (result.requirements.requiresPayment) blocked.add('payment_required');
  if (result.requirements.requiresBacklink) blocked.add('backlink_required');
  if (result.requirements.editorialReview) blocked.add('manual_review_required');
  return Array.from(blocked);
}

function deriveObstacles(
  result: DistributionTargetDiscoveryResult,
  fieldRequirements: DistributionTargetFieldRequirement[],
  rules: DistributionTargetRuleFinding[],
): DistributionTargetObstacleFinding[] {
  const obstacles: DistributionTargetObstacleFinding[] = [];
  const submissionPage = result.pages.find((page) => page.pageType === 'submission');
  const registrationPage = result.pages.find((page) => page.pageType === 'registration');
  const pricingPage = result.pages.find((page) => page.pageType === 'pricing');
  const captchaPage = result.pages.find((page) => /captcha|cloudflare|verify you are human/i.test(pageText(page)));
  const blockedReasons = classifyBlockedReasons(result);

  if (result.requirements.requiresAccount) {
    obstacles.push(
      buildObstacle(
        'account_required',
        submissionPage ? 'warn' : 'block',
        'Account required',
        true,
        registrationPage?.finalUrl || submissionPage?.finalUrl || null,
        uniqueStrings([registrationPage?.title, registrationPage?.excerpt, 'login', 'sign in', 'register']),
        registrationPage ? 86 : 93,
      ),
    );
  }

  if (result.requirements.requiresPayment) {
    obstacles.push(
      buildObstacle(
        'paid_required',
        'warn',
        'Payment required',
        true,
        pricingPage?.finalUrl || result.pricingUrl || null,
        uniqueStrings([pricingPage?.title, pricingPage?.excerpt, 'pricing', 'subscription', 'payment']),
        pricingPage ? 84 : 78,
      ),
    );
  }

  if (result.requirements.requiresCaptcha || blockedReasons.includes('captcha_blocked')) {
    obstacles.push(
      buildObstacle(
        'captcha_blocked',
        'block',
        'CAPTCHA blocked',
        true,
        captchaPage?.finalUrl || null,
        uniqueStrings([captchaPage?.title, captchaPage?.excerpt, 'captcha', 'human verification']),
        96,
      ),
    );
  }

  const requiredAssets = uniqueStrings(fieldRequirements.map((field) => field.requiredAsset).filter(Boolean) as string[]);
  if (requiredAssets.length > 0) {
    obstacles.push(
      buildObstacle(
        'missing_asset',
        'warn',
        'Required assets needed',
        requiredAssets.join(', '),
        submissionPage?.finalUrl || result.submissionUrl || null,
        requiredAssets.flatMap((asset) => [`required asset: ${asset}`]),
        80,
      ),
    );
  }

  const hasExplicitRule = rules.some((rule) =>
    ['submission_entry', 'registration_requirement', 'payment_requirement', 'captcha_requirement', 'backlink_requirement', 'editorial_review'].includes(rule.kind),
  );
  if (!hasExplicitRule || result.pages.length <= 1) {
    obstacles.push(
      buildObstacle(
        'manual_verification_required',
        'warn',
        'Manual verification still needed',
        true,
        result.homepageUrl,
        uniqueStrings(['insufficient evidence', 'review required']),
        74,
      ),
    );
  }

  if (
    (result.requirements.requiresPayment && !pricingPage) ||
    (result.requirements.requiresAccount && !registrationPage) ||
    (result.requirements.requiresCaptcha && !captchaPage)
  ) {
    obstacles.push(
      buildObstacle(
        'rule_conflict',
        'block',
        'Rule conflict detected',
        true,
        result.homepageUrl,
        uniqueStrings(['requirement found without matching page', 'conflicting signals']),
        88,
      ),
    );
  }

  return obstacles;
}

function deriveFieldRequirements(result: DistributionTargetDiscoveryResult): DistributionTargetFieldRequirement[] {
  const candidates = new Map<string, DistributionTargetFieldRequirement>();

  for (const page of result.pages) {
    const text = pageText(page);
    for (const matcher of knownFieldMatchers) {
      const matchCount = matcher.patterns.filter((pattern) => pattern.test(text)).length;
      if (matchCount === 0) continue;
      const current = candidates.get(matcher.fieldName);
      const next: DistributionTargetFieldRequirement = current || {
        fieldName: matcher.fieldName,
        required: false,
        fieldType: matcher.fieldType,
        characterLimit: null,
        allowedValues: [],
        requiredAsset: matcher.requiredAsset,
        sourceUrls: [],
        evidence: [],
        confidence: 0,
      };
      next.sourceUrls = uniqueStrings([...next.sourceUrls, page.finalUrl]);
      next.evidence = uniqueStrings([...next.evidence, page.title, page.excerpt, ...page.signals]);
      next.confidence = Math.max(next.confidence, confidenceFromSignals(matchCount));
      if (matcher.requiredAsset) next.requiredAsset = matcher.requiredAsset;
      candidates.set(matcher.fieldName, next);
    }
  }

  if (result.requirements.requiresAccount && !candidates.has('email')) {
    candidates.set('email', {
      fieldName: 'email',
      required: true,
      fieldType: 'email',
      characterLimit: null,
      allowedValues: [],
      requiredAsset: null,
      sourceUrls: uniqueStrings(result.pages.map((page) => page.finalUrl)),
      evidence: ['Account creation or sign-in is required.'],
      confidence: 72,
    });
  }

  return Array.from(candidates.values()).map((field) => ({
    ...field,
    required:
      field.required ||
      ['name', 'website', 'description', 'email'].includes(field.fieldName) ||
      (field.fieldName === 'logo' && result.requirements.requiresPayment),
    confidence: Math.min(99, field.confidence || 60),
  }));
}

function deriveVisibleRules(result: DistributionTargetDiscoveryResult) {
  const rules: Array<{ label: string; value: string; sourceUrl: string | null }> = [];
  if (result.submissionUrl) rules.push({ label: 'Submission entry', value: result.submissionUrl, sourceUrl: result.submissionUrl });
  if (result.registrationUrl) rules.push({ label: 'Registration entry', value: result.registrationUrl, sourceUrl: result.registrationUrl });
  if (result.pricingUrl) rules.push({ label: 'Pricing page', value: result.pricingUrl, sourceUrl: result.pricingUrl });
  if (result.contactUrl) rules.push({ label: 'Contact page', value: result.contactUrl, sourceUrl: result.contactUrl });
  if (result.communityUrl) rules.push({ label: 'Community page', value: result.communityUrl, sourceUrl: result.communityUrl });
  return rules;
}

function derivePricingInfo(result: DistributionTargetDiscoveryResult) {
  const pricingPage = result.pages.find((page) => page.pageType === 'pricing');
  const summary: Array<{ label: string; value: string; sourceUrl: string | null }> = [];
  if (result.requirements.requiresPayment) {
    summary.push({
      label: 'Payment required',
      value: 'Yes',
      sourceUrl: pricingPage?.finalUrl || result.pricingUrl,
    });
  } else {
    summary.push({
      label: 'Payment required',
      value: 'No clear payment requirement found',
      sourceUrl: pricingPage?.finalUrl || result.pricingUrl,
    });
  }
  if (result.requirements.expectedReviewDays) {
    summary.push({
      label: 'Expected review days',
      value: String(result.requirements.expectedReviewDays),
      sourceUrl: pricingPage?.finalUrl || result.submissionUrl,
    });
  }
  return summary;
}

function deriveRules(result: DistributionTargetDiscoveryResult): DistributionTargetRuleFinding[] {
  const rules: DistributionTargetRuleFinding[] = [];
  const submissionPage = result.pages.find((page) => page.pageType === 'submission');
  const registrationPage = result.pages.find((page) => page.pageType === 'registration');
  const pricingPage = result.pages.find((page) => page.pageType === 'pricing');
  const contactPage = result.pages.find((page) => page.pageType === 'contact');
  const communityPage = result.pages.find((page) => page.pageType === 'community');

  if (submissionPage) {
    rules.push(
      buildRule('submission_entry', 'info', 'Submission entry found', submissionPage.finalUrl, submissionPage.finalUrl, submissionPage.signals, submissionPage.score),
    );
  }
  if (registrationPage) {
    rules.push(
      buildRule(
        'registration_requirement',
        result.requirements.requiresAccount ? 'warn' : 'info',
        'Registration page found',
        registrationPage.finalUrl,
        registrationPage.finalUrl,
        registrationPage.signals,
        registrationPage.score,
      ),
    );
  }
  if (result.requirements.requiresPayment) {
    rules.push(
      buildRule(
        'payment_requirement',
        'warn',
        'Payment appears required',
        true,
        pricingPage?.finalUrl || result.pricingUrl || null,
        uniqueStrings([pricingPage?.title, pricingPage?.excerpt, 'payment', 'pricing', 'subscription']),
        pricingPage?.score || 72,
      ),
    );
  }
  if (result.requirements.requiresCaptcha) {
    rules.push(
      buildRule(
        'captcha_requirement',
        'block',
        'CAPTCHA or human verification detected',
        true,
        result.pages.find((page) => /captcha/i.test(pageText(page)))?.finalUrl || null,
        ['captcha', 'human verification'],
        88,
      ),
    );
  }
  if (result.requirements.requiresBacklink) {
    rules.push(
      buildRule(
        'backlink_requirement',
        'warn',
        'Backlink or badge requirement detected',
        true,
        result.pages.find((page) => /backlink|badge/i.test(pageText(page)))?.finalUrl || null,
        ['backlink', 'badge'],
        78,
      ),
    );
  }
  if (result.requirements.editorialReview) {
    rules.push(
      buildRule(
        'editorial_review',
        'warn',
        'Editorial/manual review appears likely',
        true,
        submissionPage?.finalUrl || result.submissionUrl || null,
        ['manual review', 'approval', 'editorial'],
        82,
      ),
    );
  }

  const blockedReasons = classifyBlockedReasons(result);
  if (blockedReasons.includes('account_required')) {
    rules.push(buildRule('manual_verification', 'block', 'Account wall detected', true, registrationPage?.finalUrl || null, ['login', 'sign in', 'create account'], 90));
  }
  if (blockedReasons.includes('captcha_blocked')) {
    rules.push(buildRule('manual_verification', 'block', 'Captcha wall detected', true, null, ['captcha', 'verify you are human'], 92));
  }
  if (blockedReasons.includes('payment_required')) {
    rules.push(buildRule('risk_note', 'warn', 'Payment may be required', true, pricingPage?.finalUrl || result.pricingUrl || null, ['pricing', 'subscription'], 80));
  }
  if (blockedReasons.includes('manual_review_required')) {
    rules.push(buildRule('manual_verification', 'warn', 'Manual review likely required', true, submissionPage?.finalUrl || null, ['manual review', 'pending'], 80));
  }

  if (!submissionPage && !registrationPage && !pricingPage && !contactPage && !communityPage) {
    rules.push(buildRule('risk_note', 'block', 'No obvious target entry pages found', false, result.homepageUrl, ['homepage only', 'common paths only'], 65));
  }

  return rules;
}

function inferNextAction(result: DistributionTargetDiscoveryResult, blockedReasons: string[]): DistributionTargetAnalysisResult['nextAction'] {
  if (blockedReasons.includes('captcha_blocked') || blockedReasons.includes('account_required')) return 'manual';
  if (blockedReasons.includes('missing_page') || blockedReasons.includes('server_error')) return 'retry';
  if (result.targetStatus === 'active') return 'ready';
  if (blockedReasons.includes('payment_required') || blockedReasons.includes('manual_review_required')) return 'review';
  return 'manual';
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function gradeFromScore(score: number): DistributionTargetMatchScore['grade'] {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'moderate';
  if (score >= 40) return 'hard';
  return 'blocked';
}

function buildMatchReason(
  label: string,
  impact: number,
  kind: DistributionTargetMatchReason['kind'],
  detail: string,
  sourceUrl: string | null,
): DistributionTargetMatchReason {
  return { label, impact, kind, detail, sourceUrl };
}

function deriveMatchScore(
  result: DistributionTargetDiscoveryResult,
  rules: DistributionTargetRuleFinding[],
  fieldRequirements: DistributionTargetFieldRequirement[],
  obstacles: DistributionTargetObstacleFinding[],
): DistributionTargetMatchScore {
  const reasons: DistributionTargetMatchReason[] = [];
  let score = 56;

  if (result.pages.some((page) => page.pageType === 'submission')) {
    score += 14;
    reasons.push(
      buildMatchReason('Submission page found', 14, 'bonus', 'The target exposes a direct submission entry page.', result.submissionUrl || result.homepageUrl),
    );
  } else {
    score -= 16;
    reasons.push(
      buildMatchReason('No submission page', -16, 'penalty', 'No obvious submission entry was discovered.', result.homepageUrl),
    );
  }

  if (result.pages.some((page) => page.pageType === 'registration')) {
    score += 8;
    reasons.push(
      buildMatchReason('Registration flow mapped', 8, 'bonus', 'A registration route is visible, so onboarding is at least discoverable.', result.registrationUrl || result.homepageUrl),
    );
  }

  if (result.pages.some((page) => page.pageType === 'pricing')) {
    score += 4;
    reasons.push(
      buildMatchReason('Pricing page visible', 4, 'bonus', 'Pricing rules can be reviewed before submission.', result.pricingUrl || result.homepageUrl),
    );
  }

  if (!result.requirements.requiresAccount) {
    score += 8;
    reasons.push(buildMatchReason('No account wall', 8, 'bonus', 'The target does not currently signal a mandatory login wall.', result.homepageUrl));
  } else {
    score -= 18;
    reasons.push(buildMatchReason('Account wall present', -18, 'penalty', 'A login or signup step is required before action.', result.registrationUrl || result.submissionUrl || result.homepageUrl));
  }

  if (!result.requirements.requiresPayment) {
    score += 8;
    reasons.push(buildMatchReason('No payment wall', 8, 'bonus', 'No explicit payment requirement was detected.', result.pricingUrl || result.homepageUrl));
  } else {
    score -= 14;
    reasons.push(buildMatchReason('Payment required', -14, 'penalty', 'The target appears to require payment before completion.', result.pricingUrl || result.homepageUrl));
  }

  if (!result.requirements.requiresCaptcha) {
    score += 10;
    reasons.push(buildMatchReason('No CAPTCHA found', 10, 'bonus', 'No human verification gate was detected.', result.homepageUrl));
  } else {
    score -= 28;
    reasons.push(buildMatchReason('CAPTCHA gate found', -28, 'penalty', 'A verification gate is likely to interrupt the flow.', result.homepageUrl));
  }

  if (!result.requirements.requiresBacklink) {
    score += 5;
    reasons.push(buildMatchReason('No backlink requirement', 5, 'bonus', 'The target does not appear to force reciprocal linking.', result.homepageUrl));
  } else {
    score -= 10;
    reasons.push(buildMatchReason('Backlink required', -10, 'penalty', 'A reciprocal link requirement reduces submission flexibility.', result.homepageUrl));
  }

  if (!result.requirements.editorialReview) {
    score += 6;
    reasons.push(buildMatchReason('No editorial review wall', 6, 'bonus', 'The target does not look editorially gated.', result.homepageUrl));
  } else {
    score -= 10;
    reasons.push(buildMatchReason('Editorial review needed', -10, 'penalty', 'Human review may delay or reject the submission.', result.homepageUrl));
  }

  if (fieldRequirements.length > 0) {
    const fieldBonus = Math.min(12, fieldRequirements.length * 2);
    score += fieldBonus;
    reasons.push(
      buildMatchReason(
        `${fieldRequirements.length} field hint${fieldRequirements.length === 1 ? '' : 's'} found`,
        fieldBonus,
        'bonus',
        'The analyzer identified the likely field structure and required assets.',
        fieldRequirements[0]?.sourceUrls[0] || result.homepageUrl,
      ),
    );
  }

  if (obstacles.length > 0) {
    const obstaclePenalty = obstacles.reduce((total, obstacle) => {
      if (obstacle.severity === 'block') return total + 22;
      if (obstacle.obstacle === 'missing_asset') return total + 8;
      return total + 5;
    }, 0);
    score -= obstaclePenalty;
    reasons.push(
      buildMatchReason(
        `${obstacles.length} obstacle${obstacles.length === 1 ? '' : 's'} detected`,
        -obstaclePenalty,
        'penalty',
        'Current discovery includes review or blocking obstacles that should be cleared first.',
        obstacles[0]?.sourceUrl || result.homepageUrl,
      ),
    );
  }

  if (result.targetStatus === 'active') {
    score += 5;
    reasons.push(buildMatchReason('Target status is active', 5, 'bonus', 'The target is currently marked active in the registry.', result.homepageUrl));
  } else if (result.targetStatus === 'stale') {
    score -= 8;
    reasons.push(buildMatchReason('Target status is stale', -8, 'penalty', 'The target is overdue for refresh or review.', result.homepageUrl));
  } else if (result.targetStatus === 'blocked') {
    score -= 18;
    reasons.push(buildMatchReason('Target status is blocked', -18, 'penalty', 'The target already carries a blocked status.', result.homepageUrl));
  } else if (result.targetStatus === 'retired') {
    score -= 30;
    reasons.push(buildMatchReason('Target status is retired', -30, 'penalty', 'The target is retired and should not be prioritized.', result.homepageUrl));
  }

  if (rules.some((rule) => rule.kind === 'submission_entry')) {
    score += 4;
    reasons.push(buildMatchReason('Explicit entry rule discovered', 4, 'bonus', 'The rule set contains a direct submission entry signal.', result.submissionUrl || result.homepageUrl));
  }

  if (rules.some((rule) => rule.kind === 'manual_verification')) {
    score -= 6;
    reasons.push(buildMatchReason('Manual verification required', -6, 'penalty', 'Some rules still require a human to verify the target.', result.homepageUrl));
  }

  const finalScore = clampScore(score);
  const grade = gradeFromScore(finalScore);
  const summary =
    grade === 'excellent'
      ? 'Very strong target fit: the submission path is clear and friction is low.'
      : grade === 'good'
        ? 'Good target fit: the target is usable with manageable friction.'
        : grade === 'moderate'
          ? 'Moderate fit: useful target, but follow the discovered obstacles closely.'
          : grade === 'hard'
            ? 'Hard target: the flow has notable friction and should be handled carefully.'
            : 'Blocked target: do not prioritize until the blocking issues are resolved.';

  return {
    score: finalScore,
    maxScore: 100,
    grade,
    summary,
    reasons,
  };
}

export function analyzeDistributionTarget(result: DistributionTargetDiscoveryResult): DistributionTargetAnalysisResult {
  const rules = deriveRules(result);
  const fieldRequirements = deriveFieldRequirements(result);
  const blockedReasons = classifyBlockedReasons(result);
  const obstacles = deriveObstacles(result, fieldRequirements, rules);
  const nextAction = inferNextAction(result, blockedReasons);
  const matchScore = deriveMatchScore(result, rules, fieldRequirements, obstacles);
  const obstacleStatus: DistributionTargetAnalysisResult['obstacleStatus'] = obstacles.some(
    (obstacle) => obstacle.severity === 'block',
  )
    ? 'blocked'
    : obstacles.length > 0
      ? 'needs_review'
      : 'clear';

  return {
    homepageUrl: result.homepageUrl,
    finalUrl: result.finalUrl,
    targetStatus: result.targetStatus,
    pageCount: result.pages.length,
    matchScore,
    rules,
    fieldRequirements,
    blockedReasons,
    obstacles,
    obstacleStatus,
    nextAction,
    summary:
      obstacles.length > 0
        ? `Discovered ${result.pages.length} target page(s); ${obstacles.length} obstacle(s); ${fieldRequirements.length} field hint(s).`
        : `Discovered ${result.pages.length} target page(s) with no explicit obstacles yet.`,
    snapshot: {
      visibleRules: deriveVisibleRules(result),
      pricingInfo: derivePricingInfo(result),
      formFields: fieldRequirements.map((field) => ({
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        required: field.required,
        characterLimit: field.characterLimit,
        requiredAsset: field.requiredAsset,
      })),
      notes: [
        result.requirements.requiresAccount ? 'Account wall detected.' : 'No account wall detected.',
        result.requirements.requiresPayment ? 'Payment requirement detected.' : 'No clear payment requirement detected.',
        result.requirements.requiresCaptcha ? 'CAPTCHA or verification detected.' : 'No CAPTCHA detected.',
        result.requirements.requiresBacklink ? 'Backlink requirement detected.' : 'No backlink requirement detected.',
        obstacleStatus === 'blocked'
          ? 'Target is blocked until manual follow-up.'
          : obstacleStatus === 'needs_review'
            ? 'Target needs human review before submission.'
            : 'Target appears clear for the next step.',
      ],
    },
  };
}

export function buildDistributionTargetRequirementRecords(
  analysis: DistributionTargetAnalysisResult,
  targetId: string,
  snapshotId?: string | null,
) {
  return analysis.fieldRequirements.map((field) => ({
    target_id: targetId,
    source_snapshot_id: snapshotId || null,
    required_field: field.fieldName,
    field_type: field.fieldType,
    character_limit: field.characterLimit,
    allowed_values: field.allowedValues,
    required_asset: field.requiredAsset,
    rule_text: field.evidence.join(' '),
    source_url: field.sourceUrls[0] || analysis.homepageUrl,
    confidence: field.confidence,
    notes: null,
    metadata: {
      sourceUrls: field.sourceUrls,
      evidence: field.evidence,
      nextAction: analysis.nextAction,
      blockedReasons: analysis.blockedReasons,
    },
  }));
}
