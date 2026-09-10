import type { TopListTopicKey } from './topLists';

// Every topic has an explicit, reviewed use-case roster. Category membership
// is never evidence of task fit. Empty rosters await specialist evidence;
// they must not inherit generic productivity tools or auto-release new records.
// Scope review: docs/SEO_TOPIC_QA_REVISION_2026-09-10_CN.md.
export const TOPIC_TOOL_NAMES: Record<TopListTopicKey, readonly string[]> = {
  // Client deliverables, shared project documents, and repeatable agency work.
  'ai-agency-tools': ['gamma', 'notion', 'make'],
  'ai-api-observability-tools': [],
  // Tools that build or execute multi-step agents, including coding agents.
  'ai-agent-tools': ['n8n', 'codex', 'emdash'],
  'ai-automation-tools': ['n8n', 'make', 'pipedream'],
  // General conversational assistants; meeting transcription is a different task.
  'ai-chatbot-tools': ['claude', 'gemini', 'poe'],
  'ai-coding-tools': ['cursor', 'codex', 'github-copilot', 'replit', 'emdash'],
  'ai-code-review-tools': ['github-copilot', 'codex', 'cursor'],
  // Written scripts, visual documents, and presenter-led business content.
  'ai-content-creation-tools': ['claude', 'gamma', 'synthesia'],
  // Creator graphics and motion/video production; distinct from client delivery.
  'ai-creator-tools': ['gamma', 'runway', 'viggle'],
  'ai-ecommerce-tools': [],
  'ai-evals-tools': [],
  // Both records explicitly generate still images. Adobe's brand record and
  // video-first Sora/Synthesia/Viggle/Runway are not image-tool substitutes.
  'ai-image-tools': ['shutterstock', 'fastimage-ai-sketch-to-image'],
  'ai-lead-generation-tools': [],
  // Salesforce Einstein is an unreviewed product family, not a marketing tool.
  'ai-marketing-tools': [],
  'ai-meeting-notes-tools': ['otter-ai', 'fathom'],
  'ai-model-routing-tools': ['openrouter'],
  'ai-note-taking-tools': ['notion', 'notebooklm'],
  'ai-productivity-tools': ['notion', 'gamma', 'n8n', 'make'],
  'ai-prompt-testing-tools': [],
  'ai-sales-prospecting-tools': [],
  'ai-small-business-tools': ['notion', 'fathom', 'make', 'gamma'],
  'ai-student-tools': ['notebooklm', 'consensus', 'gemini'],
  'ai-web3-tools': ['dune', 'the-graph'],
  'ai-voice-tools': ['otter-ai', 'fathom'],
  // Sora is explicitly discontinued in its maintained record.
  'ai-video-tools': ['runway', 'luma-ai', 'synthesia', 'viggle'],
  'ai-research-tools': ['perplexity', 'consensus', 'notebooklm'],
  'ai-seo-tools': [],
  // Drafting, editing and language improvement; DeepL Write is not an SEO suite.
  'ai-writing-tools': ['claude', 'deepl', 'gemini'],
};

// A comparison shortlist needs at least two eligible products. A single
// accurate candidate remains readable but does not qualify for indexing.
export const MIN_TOPIC_CANDIDATES = 2;
