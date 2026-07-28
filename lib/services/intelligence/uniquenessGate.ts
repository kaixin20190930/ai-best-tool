import type { EvidenceBoundComposerResult } from './evidenceComposer';

export type UniquenessGateSeverity = 'info' | 'warn' | 'block';

export interface UniquenessGateFinding {
  id: string;
  severity: UniquenessGateSeverity;
  message: string;
  blockIds: string[];
  matchedText: string[];
  similarity: number | null;
}

export interface UniquenessGateResult {
  passed: boolean;
  blocked: boolean;
  blockCount: number;
  findingCount: number;
  findings: UniquenessGateFinding[];
  summary: string;
  maxSimilarity: number;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean);
}

function jaccardSimilarity(left: Set<string>, right: Set<string>) {
  if (left.size === 0 || right.size === 0) return 0;
  let intersection = 0;
  for (const token of Array.from(left)) {
    if (right.has(token)) intersection += 1;
  }
  const union = left.size + right.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function collectBlockText(block: EvidenceBoundComposerResult['blocks'][number]) {
  return [block.title, block.paragraph, block.notes.join(' ')].join(' ').trim();
}

function extractRepeatedPhrases(texts: string[]) {
  const phraseCount = new Map<string, number>();
  for (const text of texts) {
    const tokens = tokenize(text);
    for (let index = 0; index < tokens.length - 2; index += 1) {
      const phrase = tokens.slice(index, index + 3).join(' ');
      phraseCount.set(phrase, (phraseCount.get(phrase) || 0) + 1);
    }
  }
  return Array.from(phraseCount.entries())
    .filter(([, count]) => count > 1)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 10)
    .map(([phrase]) => phrase);
}

export function evaluateUniquenessGate(input: {
  composer: EvidenceBoundComposerResult;
}): UniquenessGateResult {
  const blocks = input.composer.blocks;
  const findings: UniquenessGateFinding[] = [];
  const blockTexts = blocks.map((block) => collectBlockText(block));
  const blockTokenSets = blockTexts.map((text) => new Set(tokenize(text)));
  const repeatedPhrases = extractRepeatedPhrases(blockTexts);
  let maxSimilarity = 0;

  for (let leftIndex = 0; leftIndex < blocks.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < blocks.length; rightIndex += 1) {
      const similarity = jaccardSimilarity(blockTokenSets[leftIndex], blockTokenSets[rightIndex]);
      if (similarity > maxSimilarity) maxSimilarity = similarity;
      if (similarity >= 0.72) {
        findings.push({
          id: `block-pair-${blocks[leftIndex].id}-${blocks[rightIndex].id}`,
          severity: 'block',
          message: `Blocks "${blocks[leftIndex].title}" and "${blocks[rightIndex].title}" are too similar.`,
          blockIds: [blocks[leftIndex].id, blocks[rightIndex].id],
          matchedText: [blockTexts[leftIndex], blockTexts[rightIndex]],
          similarity: Number(similarity.toFixed(2)),
        });
      } else if (similarity >= 0.58) {
        findings.push({
          id: `block-pair-${blocks[leftIndex].id}-${blocks[rightIndex].id}-warn`,
          severity: 'warn',
          message: `Blocks "${blocks[leftIndex].title}" and "${blocks[rightIndex].title}" share a lot of repeated text.`,
          blockIds: [blocks[leftIndex].id, blocks[rightIndex].id],
          matchedText: [blockTexts[leftIndex], blockTexts[rightIndex]],
          similarity: Number(similarity.toFixed(2)),
        });
      }
    }
  }

  if (repeatedPhrases.length > 0) {
    findings.push({
      id: 'repeated-three-word-phrases',
      severity: repeatedPhrases.length >= 4 ? 'block' : 'warn',
      message: 'Repeated short phrases suggest template-style copy.',
      blockIds: blocks.map((block) => block.id),
      matchedText: repeatedPhrases,
      similarity: null,
    });
  }

  if (blocks.length <= 1) {
    findings.push({
      id: 'single-block-corpus',
      severity: 'warn',
      message: 'Uniqueness review is shallow because only one content block was generated.',
      blockIds: blocks.map((block) => block.id),
      matchedText: blockTexts,
      similarity: null,
    });
  }

  const blockCount = findings.filter((finding) => finding.severity === 'block').length;
  const passed = blockCount === 0;

  return {
    passed,
    blocked: !passed,
    blockCount,
    findingCount: findings.length,
    findings,
    summary: passed
      ? `Uniqueness gate passed with max block similarity ${maxSimilarity.toFixed(2)}.`
      : `Uniqueness gate blocked: ${blockCount} blocking issue${blockCount === 1 ? '' : 's'} and max block similarity ${maxSimilarity.toFixed(2)}.`,
    maxSimilarity: Number(maxSimilarity.toFixed(2)),
  };
}
