-- Add Web3 category and supporting tags
-- Safe to run multiple times

INSERT INTO categories (name, slug, description, order_index) VALUES
  ('{"en": "Web3", "zh": "Web3"}', 'web3', '{"en": "AI tools for Web3, crypto, agents, and on-chain workflows", "zh": "面向 Web3、加密、Agent 和链上工作流的 AI 工具"}', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tags (name, slug) VALUES
  ('{"en": "Web3", "zh": "Web3"}', 'web3'),
  ('{"en": "Crypto", "zh": "加密"}', 'crypto'),
  ('{"en": "DeFi", "zh": "DeFi"}', 'defi'),
  ('{"en": "Blockchain", "zh": "区块链"}', 'blockchain'),
  ('{"en": "MCP", "zh": "MCP"}', 'mcp'),
  ('{"en": "Wallet", "zh": "钱包"}', 'wallet'),
  ('{"en": "On-chain", "zh": "链上"}', 'onchain')
ON CONFLICT (slug) DO NOTHING;
