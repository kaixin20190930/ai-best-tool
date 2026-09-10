import type { TopListTopicKey } from './topLists';

// Virtual decision hubs are not database categories. Resolve their candidates
// by product identity across categories, never by a broad productivity fallback.
// Review and indexing rationale: docs/SEO_TOPIC_CONSISTENCY_2026-09-10_CN.md.
export const TOPIC_TOOL_NAMES: Partial<Record<TopListTopicKey, readonly string[]>> = {
  'ai-api-observability-tools': ['langfuse', 'helicone', 'portkey', 'langsmith'],
  'ai-agent-tools': ['lindy', 'n8n', 'pipedream'],
  'ai-automation-tools': ['n8n', 'make', 'pipedream', 'zapier'],
  'ai-coding-tools': ['cursor', 'codex', 'github-copilot', 'replit', 'bolt-new', 'phind'],
  'ai-code-review-tools': ['github-copilot', 'codex', 'cursor', 'coderabbit', 'qodo'],
  'ai-ecommerce-tools': ['shopify-magic', 'shopify', 'gorgias', 'tidio', 'adcreative-ai', 'photoroom'],
  'ai-evals-tools': ['langsmith', 'braintrust', 'langfuse', 'promptfoo'],
  'ai-marketing-tools': ['salesforce_einstein', 'jasper', 'copy-ai', 'hubspot', 'adcreative-ai'],
  'ai-model-routing-tools': ['openrouter', 'portkey', 'litellm'],
  'ai-prompt-testing-tools': ['promptfoo', 'langsmith', 'braintrust', 'langfuse'],
  'ai-web3-tools': ['dune', 'the-graph', 'defillama', 'nansen', 'debank'],
  'ai-voice-tools': ['otter-ai', 'fathom', 'notta', 'elevenlabs', 'descript'],
  'ai-video-tools': ['runway', 'luma-ai', 'sora', 'synthesia', 'viggle', 'descript'],
  'ai-research-tools': ['perplexity', 'consensus', 'notebooklm', 'elicit', 'scite'],
};
