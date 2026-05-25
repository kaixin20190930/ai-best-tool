-- AI 工具导航站数据库架构
-- 创建时间: 2024-12-02
-- 说明: 完整的数据库表结构，包括工具、分类、标签、用户、收藏、评分、评论、分析和通知

-- ============================================
-- 1. 分类表 (Categories)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL, -- 多语言支持: {"en": "Productivity", "zh": "生产力"}
  slug VARCHAR(100) UNIQUE NOT NULL,
  description JSONB,
  icon VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_order ON categories(order_index);

-- ============================================
-- 2. 标签表 (Tags)
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL, -- 多语言支持
  slug VARCHAR(100) UNIQUE NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_count ON tags(count DESC);

-- ============================================
-- 3. 工具表 (Tools)
-- ============================================
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  title JSONB NOT NULL, -- 多语言支持
  content JSONB NOT NULL, -- 简短描述
  detail JSONB NOT NULL, -- 详细描述 (支持 Markdown)
  url VARCHAR(500) NOT NULL,
  image_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  
  -- 分类和标签
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[], -- 标签 slug 数组
  
  -- 额外信息
  pricing VARCHAR(50), -- 'free', 'freemium', 'paid'
  features JSONB, -- 功能列表
  use_cases JSONB, -- 使用场景
  screenshots TEXT[], -- 截图 URL 数组
  video_url VARCHAR(500),
  
  -- 状态管理
  status VARCHAR(20) DEFAULT 'pending', -- 'draft', 'pending', 'published', 'rejected'
  submitted_by UUID, -- 关联到 auth.users，但不使用外键约束避免 schema 问题
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 统计数据
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  
  -- 全文搜索
  search_vector tsvector
);

-- 索引
CREATE INDEX idx_tools_category ON tools(category_id);
CREATE INDEX idx_tools_status ON tools(status);
CREATE INDEX idx_tools_name ON tools(name);
CREATE INDEX idx_tools_created_at ON tools(created_at DESC);
CREATE INDEX idx_tools_tags ON tools USING GIN(tags);
CREATE INDEX idx_tools_search ON tools USING GIN(search_vector);

-- 全文搜索触发器
CREATE OR REPLACE FUNCTION tools_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title->>'en', '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content->>'en', '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER tools_search_update
  BEFORE INSERT OR UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION tools_search_trigger();

-- ============================================
-- 4. 收藏表 (Favorites)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- 关联到 auth.users
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_tool ON favorites(tool_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- ============================================
-- 5. 评分表 (Ratings)
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- 关联到 auth.users
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  score INTEGER CHECK (score >= 1 AND score <= 5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

CREATE INDEX idx_ratings_tool ON ratings(tool_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);

-- 评分更新触发器 - 自动更新工具的平均评分
CREATE OR REPLACE FUNCTION update_tool_rating() RETURNS trigger AS $$
BEGIN
  UPDATE tools
  SET 
    average_rating = (
      SELECT COALESCE(AVG(score), 0)
      FROM ratings
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM ratings
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
    )
  WHERE id = COALESCE(NEW.tool_id, OLD.tool_id);
  RETURN COALESCE(NEW, OLD);
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER rating_insert_update
  AFTER INSERT OR UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_tool_rating();

CREATE TRIGGER rating_delete
  AFTER DELETE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_tool_rating();

-- ============================================
-- 6. 评论表 (Comments)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- 关联到 auth.users
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  hidden_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_tool ON comments(tool_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- 评论点赞明细（每个用户对每条评论最多点赞一次）
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- 关联到 auth.users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

CREATE INDEX idx_comment_likes_user ON comment_likes(user_id);

-- 评论举报明细（每个用户对每条评论最多举报一次）
CREATE TABLE IF NOT EXISTS comment_reports (
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- 关联到 auth.users
  reason TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

CREATE INDEX idx_comment_reports_created_at ON comment_reports(created_at DESC);

-- 评论治理操作日志
CREATE TABLE IF NOT EXISTS comment_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID, -- 关联到 auth.users（系统定时任务可为空）
  action TEXT NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comment_moderation_logs_created_at ON comment_moderation_logs(created_at DESC);

-- 支付回调日志（商业化入驻）
CREATE TABLE IF NOT EXISTS payment_callback_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID,
  transaction_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  source TEXT,
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_callback_logs_created_at ON payment_callback_logs(created_at DESC);
CREATE INDEX idx_payment_callback_logs_status ON payment_callback_logs(status);
CREATE INDEX idx_payment_callback_logs_tool_id ON payment_callback_logs(tool_id);
CREATE UNIQUE INDEX uq_payment_callback_logs_success_tx
  ON payment_callback_logs(transaction_id)
  WHERE transaction_id IS NOT NULL AND status = 'success';

-- Google Search Console 调用日志
CREATE TABLE IF NOT EXISTS google_search_console_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL CHECK (operation IN ('submit_sitemap', 'inspect_url')),
  property_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  source TEXT,
  response JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_google_search_console_logs_created_at ON google_search_console_logs(created_at DESC);
CREATE INDEX idx_google_search_console_logs_operation ON google_search_console_logs(operation);
CREATE INDEX idx_google_search_console_logs_status ON google_search_console_logs(status);

-- ============================================
-- 7. 分析表 (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'tool_click', 'search', 'share'
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  user_id UUID, -- 关联到 auth.users
  metadata JSONB, -- 额外数据，如搜索关键词、referrer 等
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(100),
  user_agent TEXT,
  referrer VARCHAR(500)
);

CREATE INDEX idx_analytics_event ON analytics(event_type);
CREATE INDEX idx_analytics_tool ON analytics(tool_id);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp DESC);
CREATE INDEX idx_analytics_session ON analytics(session_id);

-- ============================================
-- 8. 通知表 (Notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- 关联到 auth.users
  type VARCHAR(50) NOT NULL, -- 'new_tool', 'tool_update', 'comment_reply'
  title VARCHAR(255) NOT NULL,
  content TEXT,
  link VARCHAR(500),
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 9. 用户配置表 (User Preferences)
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY, -- 关联到 auth.users
  language VARCHAR(10) DEFAULT 'en',
  email_notifications BOOLEAN DEFAULT TRUE,
  in_app_notifications BOOLEAN DEFAULT TRUE,
  notify_new_tools BOOLEAN DEFAULT TRUE,
  notify_tool_updates BOOLEAN DEFAULT TRUE,
  notify_replies BOOLEAN DEFAULT TRUE,
  favorite_categories UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. Row Level Security (RLS) 策略
-- ============================================

-- ============================================
-- 注意: RLS 策略需要在启用 Supabase Auth 后配置
-- 如果遇到 "schema auth does not exist" 错误，
-- 请先在 Supabase Dashboard 中启用 Authentication，
-- 然后再执行以下 RLS 策略
-- ============================================

-- 暂时禁用 RLS，等 Auth 配置完成后再启用
-- 如需启用，请取消以下注释：

/*
-- 启用 RLS
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Tools 表策略
CREATE POLICY "Anyone can view published tools"
  ON tools FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can view their own tools"
  ON tools FOR SELECT
  USING (auth.uid() = submitted_by);

CREATE POLICY "Authenticated users can insert tools"
  ON tools FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update their own tools"
  ON tools FOR UPDATE
  USING (auth.uid() = submitted_by);

-- Favorites 表策略
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Ratings 表策略
CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Comments 表策略
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications 表策略
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- User Preferences 表策略
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);
*/

-- ============================================
-- 11. 初始数据
-- ============================================

-- 插入默认分类
INSERT INTO categories (name, slug, description, order_index) VALUES
  ('{"en": "Productivity", "zh": "生产力"}', 'productivity', '{"en": "Tools to boost your productivity", "zh": "提升生产力的工具"}', 1),
  ('{"en": "Design & Art", "zh": "设计与艺术"}', 'design-art', '{"en": "Creative tools for designers and artists", "zh": "设计师和艺术家的创意工具"}', 2),
  ('{"en": "Chatbot", "zh": "聊天机器人"}', 'chatbot', '{"en": "AI-powered chatbots and conversational AI", "zh": "AI 驱动的聊天机器人"}', 3),
  ('{"en": "Life Assistant", "zh": "生活助手"}', 'life-assistant', '{"en": "Tools to help with daily life", "zh": "帮助日常生活的工具"}', 4),
  ('{"en": "Text & Writing", "zh": "文本与写作"}', 'text-writing', '{"en": "Writing and text processing tools", "zh": "写作和文本处理工具"}', 5),
  ('{"en": "Other", "zh": "其他"}', 'other', '{"en": "Other AI tools", "zh": "其他 AI 工具"}', 99)
ON CONFLICT (slug) DO NOTHING;

-- 插入常用标签
INSERT INTO tags (name, slug) VALUES
  ('{"en": "Free", "zh": "免费"}', 'free'),
  ('{"en": "Freemium", "zh": "免费增值"}', 'freemium'),
  ('{"en": "Paid", "zh": "付费"}', 'paid'),
  ('{"en": "API", "zh": "API"}', 'api'),
  ('{"en": "No Code", "zh": "无代码"}', 'no-code'),
  ('{"en": "Open Source", "zh": "开源"}', 'open-source'),
  ('{"en": "LLM", "zh": "大语言模型"}', 'llm'),
  ('{"en": "Image Generation", "zh": "图像生成"}', 'image-generation'),
  ('{"en": "Video", "zh": "视频"}', 'video'),
  ('{"en": "Audio", "zh": "音频"}', 'audio')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 完成
-- ============================================
-- 数据库架构创建完成
-- 下一步: 运行此 SQL 文件在 Supabase 中创建表结构
