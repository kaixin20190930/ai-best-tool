INSERT INTO tags (name, slug) VALUES
  ('{"en": "SEO", "zh": "SEO"}', 'seo'),
  ('{"en": "Keyword Research", "zh": "关键词研究"}', 'keyword-research'),
  ('{"en": "Competitive Analysis", "zh": "竞品分析"}', 'competitive-analysis'),
  ('{"en": "Website Planning", "zh": "网站规划"}', 'website-planning'),
  ('{"en": "Transcription", "zh": "转录"}', 'transcription'),
  ('{"en": "Speech to Text", "zh": "语音转文字"}', 'speech-to-text'),
  ('{"en": "Text to Speech", "zh": "文字转语音"}', 'text-to-speech'),
  ('{"en": "Workflow Automation", "zh": "工作流自动化"}', 'workflow-automation'),
  ('{"en": "Voice", "zh": "语音"}', 'voice'),
  ('{"en": "Automation", "zh": "自动化"}', 'automation'),
  ('{"en": "Research", "zh": "研究"}', 'research'),
  ('{"en": "Developer Tools", "zh": "开发者工具"}', 'developer-tools')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name;
