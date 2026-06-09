INSERT INTO categories (name, slug, description, order_index) VALUES
  ('{"en": "Research", "zh": "研究"}', 'research', '{"en": "Tools for research, model discovery, datasets, and technical exploration", "zh": "面向研究、模型发现、数据集与技术探索的工具"}', 7),
  ('{"en": "Voice", "zh": "语音"}', 'voice', '{"en": "Voice, speech, transcription, and audio-first AI tools", "zh": "面向语音、转录、音频工作流的 AI 工具"}', 8),
  ('{"en": "Automation", "zh": "自动化"}', 'automation', '{"en": "Workflow automation, agents, and repeatable task orchestration", "zh": "面向工作流自动化、Agent 与可复用任务编排的工具"}', 9),
  ('{"en": "Developer Tools", "zh": "开发者工具"}', 'developer-tools', '{"en": "APIs, model infrastructure, developer platforms, and technical tooling", "zh": "面向 API、模型基础设施、开发平台与技术工作流的工具"}', 10)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

UPDATE tools
SET category_id = (SELECT id FROM categories WHERE slug = 'research')
WHERE name = 'hugging-face'
  AND status = 'published';

UPDATE tools
SET category_id = (SELECT id FROM categories WHERE slug = 'developer-tools')
WHERE name = 'replicate'
  AND status = 'published';
