-- OWNER MANUAL ONLY. Neon tools identity phase 1; no Supabase Decision writes.
-- Run as one script in a private SQL session. It PRECHECKS and ROLLBACKS by default.
-- Before any commit, run the read-only verifier --baseline and privately retain the
-- private_rollback_snapshot result below (it contains the full preimage fields).
-- For a reviewed commit, Owner must uncomment all three SET LOCAL lines, enter the
-- exact values from that fresh verifier, and replace the final ROLLBACK with COMMIT.
-- A missing/wrong gate returns before UPDATE; COMMIT cannot write.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
-- SET LOCAL app.gemini_notebook_expected_updated_at = '<exact verifier updatedAtUtc>';
-- SET LOCAL app.gemini_notebook_expected_row_md5 = '<exact verifier rowMd5>';
-- SET LOCAL app.gemini_notebook_owner_gate = 'I reviewed the private snapshot and approve this Neon identity update';

SELECT jsonb_build_object(
  'id', id, 'name', name, 'title', title, 'url', url, 'detail', detail,
  'features', features, 'next_review_date', next_review_date,
  'updated_at', updated_at, 'row_md5', md5(to_jsonb(tools)::text)
) AS private_rollback_snapshot
FROM tools
WHERE id = 'cec78907-e2a1-4eb7-853a-a58334026280'
FOR UPDATE;

DO $identity$
DECLARE
  v_id constant uuid := 'cec78907-e2a1-4eb7-853a-a58334026280';
  v_old tools%ROWTYPE;
  v_after tools%ROWTYPE;
  v_features jsonb;
  v_evidence_urls jsonb;
  v_expected_at text := nullif(current_setting('app.gemini_notebook_expected_updated_at', true), '');
  v_expected_md5 text := nullif(current_setting('app.gemini_notebook_expected_row_md5', true), '');
  v_gate text := nullif(current_setting('app.gemini_notebook_owner_gate', true), '');
  v_count integer;
  v_title constant jsonb := '{"en":"Gemini Notebook Source-Grounded Research","cn":"Gemini Notebook 资料锚定研究","zh":"Gemini Notebook 资料锚定研究","tw":"Gemini Notebook 資料錨定研究"}'::jsonb;
  v_detail_en constant text := $en$## Gemini Notebook (formerly NotebookLM)

Gemini Notebook is Google's separate source-grounded research and learning workspace. Add a selected source set, or discover sources on the Web or Drive and choose what to import. Chat answers use the current notebook's selected sources with inline citations; discovery and import do not make a systematic search complete.

## Best fit and checks

Use it to compare, summarize and navigate a bounded source set. Open every important citation and verify the original passage: a citation does not guarantee a correct conclusion or a sound source. Imported web pages contain extracted HTML text rather than embedded media or paywalled pages; YouTube uses captions, Google files can lose footnotes and comments, and audio is transcribed. These losses can change the answer. Separate notebooks cannot be searched together in one chat.

## Plan and privacy boundaries

The published source limits per notebook are Standard 50, Plus 100, Pro 300, Ultra 20 TB 500 and Ultra 30 TB 600. Other chat and generation quotas, including compute-based limits, also apply and can change. Confirm the live plan, region, age, account and Workspace administrator access before relying on a feature. Personal-account feedback can expose the interaction context to review; qualifying Workspace and Education uploads, queries and responses have different human-review and model-training protections. Check sharing and exported-file permissions separately. The directory has not run a controlled citation-accuracy test.

Sources: https://support.google.com/gemininotebook/answer/16164461?hl=en ; https://support.google.com/gemininotebook/answer/16215270?hl=en ; https://support.google.com/gemininotebook/answer/16213268?hl=en ; https://support.google.com/gemininotebook/answer/17670842?hl=en ; https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/$en$;
  v_detail_cn constant text := $cn$## Gemini Notebook（原 NotebookLM）

Gemini Notebook 是 Google 的独立资料锚定研究与学习工作空间。可发现 Web/Drive 来源并由用户选择导入；问答围绕当前 notebook 已选资料给出行内引用。发现和导入不等于完整、可复现的系统检索。

## 适用与核对

适于比较、总结和定位限定资料集。重要引用必须打开原文核对：有引用不保证结论或原资料正确。网页导入只提取 HTML 文本，不含嵌入媒体或付费页；YouTube 使用字幕，Google 文件可能丢失脚注和评论，音频会转录。导入损失可能改变结论；不能一次跨多个 notebook 检索。

## 套餐与隐私

每个 notebook 来源上限：Standard 50、Plus 100、Pro 300、Ultra 20 TB 500、Ultra 30 TB 600。另有聊天、生成和计算量限制，可能变化。实际功能取决于套餐、地区、年龄、账号及 Workspace 管理员开放情况。个人账号主动反馈可能带来上下文审阅；合格 Workspace/Education 的上传、提问和回答有不同的人工审阅与模型训练保护。分享与导出文件权限也须单独核对。本站尚未完成受控资料集的引用准确性实测。

来源：https://support.google.com/gemininotebook/answer/16164461?hl=en ；https://support.google.com/gemininotebook/answer/16215270?hl=en ；https://support.google.com/gemininotebook/answer/16213268?hl=en ；https://support.google.com/gemininotebook/answer/17670842?hl=en ；https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/$cn$;
  v_detail_tw constant text := $tw$## Gemini Notebook（原 NotebookLM）

Gemini Notebook 是 Google 的獨立資料錨定研究與學習工作空間。可發現 Web/Drive 來源並由使用者選擇匯入；問答圍繞目前 notebook 已選資料提供行內引用。發現和匯入不代表完整、可重現的系統檢索。

## 適用與核對

適合比較、總結和定位限定資料集。重要引用必須開啟原文核對：有引用不保證結論或原資料正確。網頁匯入只擷取 HTML 文字，不含嵌入媒體或付費頁；YouTube 使用字幕，Google 檔案可能遺失註腳和留言，音訊會轉錄。匯入損失可能改變結論；不能一次跨多個 notebook 檢索。

## 方案與隱私

每個 notebook 來源上限：Standard 50、Plus 100、Pro 300、Ultra 20 TB 500、Ultra 30 TB 600。另有聊天、生成和運算量限制，可能變更。實際功能取決於方案、地區、年齡、帳號及 Workspace 管理員開放情況。個人帳號主動回饋可能帶來上下文審閱；合格 Workspace/Education 的上傳、提問和回答有不同的人工審閱與模型訓練保護。分享與匯出檔案權限也須單獨核對。本站尚未完成受控資料集的引用準確性實測。

來源：https://support.google.com/gemininotebook/answer/16164461?hl=en ；https://support.google.com/gemininotebook/answer/16215270?hl=en ；https://support.google.com/gemininotebook/answer/16213268?hl=en ；https://support.google.com/gemininotebook/answer/17670842?hl=en ；https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/$tw$;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('directory:notebooklm'));
  SELECT * INTO STRICT v_old FROM tools WHERE id = v_id FOR UPDATE;
  IF (SELECT count(*) FROM tools WHERE lower(name) IN ('notebooklm','gemini-notebook','gemini notebook')
      OR lower(url) ~ '^https?://(notebooklm|notebook)\.google\.com([/?#]|$)'
      OR lower(title::text) LIKE '%gemini notebook%') <> 1 THEN
    RAISE EXCEPTION 'Notebook identity collision or duplicate; HOLD';
  END IF;
  IF v_old.name = 'notebooklm' AND v_old.url = 'https://notebook.google.com/'
    AND v_old.title = v_title AND v_old.features->'identity'->>'currentName' = 'Gemini Notebook'
    AND v_old.features->'identity'->>'sourceUrl' = 'https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/'
    AND v_old.next_review_date = DATE '2026-12-15' AND v_old.status = 'published'
    AND v_old.page_quality_status = 'monitor' THEN
    IF v_expected_at IS DISTINCT FROM v_old.updated_at::text
      OR v_expected_md5 IS DISTINCT FROM md5(to_jsonb(v_old)::text) THEN
      RAISE EXCEPTION 'Already migrated but exact postimage gate missing or changed; HOLD';
    END IF;
    RAISE NOTICE 'Identity already applied; no update. Run --identity and compare the saved post hash.';
    RETURN;
  END IF;
  IF v_old.name IS DISTINCT FROM 'notebooklm' OR v_old.url IS DISTINCT FROM 'https://notebooklm.google.com/'
    OR v_old.status IS DISTINCT FROM 'published' OR v_old.page_quality_status IS DISTINCT FROM 'monitor'
    OR v_old.title IS DISTINCT FROM '{"en":"NotebookLM Source-Grounded Research","cn":"NotebookLM 资料锚定研究","zh":"NotebookLM 资料锚定研究","tw":"NotebookLM 资料锚定研究"}'::jsonb
    OR v_old.next_review_date IS DISTINCT FROM DATE '2026-09-20'
    OR v_old.features->'identity' IS NOT NULL
    OR v_old.features->'editorial'->>'reviewedAt' IS DISTINCT FROM '2026-09-06'
    OR v_old.features->'editorial'->>'sourceUrl' IS DISTINCT FROM 'https://support.google.com/notebooklm/answer/16164461?hl=en'
    OR jsonb_typeof(v_old.features->'trialTemplate'->'targetOutcome') IS DISTINCT FROM 'object'
    OR jsonb_typeof(v_old.features->'marketValidation'->'evidenceUrls') IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Notebook baseline fields differ from reviewed candidate; HOLD';
  END IF;
  IF v_expected_at IS NOT NULL AND (v_old.updated_at::text <> v_expected_at
      OR md5(to_jsonb(v_old)::text) <> v_expected_md5) THEN
    RAISE EXCEPTION 'Snapshot timestamp/hash changed; HOLD';
  END IF;
  IF v_expected_at IS NULL OR v_expected_md5 IS NULL
      OR v_gate IS DISTINCT FROM 'I reviewed the private snapshot and approve this Neon identity update' THEN
    RAISE NOTICE 'PRECHECK PASS; no write. Save the private snapshot, supply all three Owner gates, then rerun.';
    RETURN;
  END IF;
  SELECT jsonb_agg(DISTINCT to_jsonb(CASE WHEN x.url = 'https://support.google.com/notebooklm/answer/16164461?hl=en'
      THEN 'https://support.google.com/gemininotebook/answer/16164461?hl=en' ELSE x.url END))
    INTO v_evidence_urls
    FROM (
      SELECT value AS url FROM jsonb_array_elements_text(v_old.features->'marketValidation'->'evidenceUrls')
      UNION ALL SELECT 'https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/'
    ) x;
  v_features := v_old.features || jsonb_build_object(
    'identity', jsonb_build_object('currentName','Gemini Notebook','formerName','NotebookLM',
      'aliases',jsonb_build_array('NotebookLM'),'identityChangedAt','2026-07-16',
      'sourceUrl','https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/',
      'legacyOfficialUrl','https://notebooklm.google.com/'),
    'editorial', (v_old.features->'editorial') || jsonb_build_object(
      'reviewedAt','2026-09-30','sourceUrl','https://support.google.com/gemininotebook/answer/16164461?hl=en',
      'summary',jsonb_build_object(
        'en','Gemini Notebook identity, selected-source citations, import losses, Ultra 20 TB/30 TB source tiers, account privacy and plan boundaries reviewed; citation accuracy not independently tested.',
        'cn','已核验 Gemini Notebook 更名、已选资料引用、导入损失、Ultra 20 TB/30 TB 来源分层、账号隐私与套餐边界；本站未独立实测引用准确性。',
        'zh','已核验 Gemini Notebook 更名、已选资料引用、导入损失、Ultra 20 TB/30 TB 来源分层、账号隐私与套餐边界；本站未独立实测引用准确性。',
        'tw','已核驗 Gemini Notebook 更名、已選資料引用、匯入損失、Ultra 20 TB/30 TB 來源分層、帳號隱私與方案邊界；本站未獨立實測引用準確性。')),
    'trialTemplate', (v_old.features->'trialTemplate') || jsonb_build_object(
      'targetOutcome',jsonb_build_object(
        'en','Verify whether Gemini Notebook reduces rereading while preserving citation accuracy across a representative mixed-format source set.',
        'cn','使用代表性的混合格式资料集，验证 Gemini Notebook 能否在保持引用准确性的同时减少重复阅读。',
        'zh','使用代表性的混合格式资料集，验证 Gemini Notebook 能否在保持引用准确性的同时减少重复阅读。',
        'tw','使用代表性的混合格式資料集，驗證 Gemini Notebook 能否在保持引用準確性的同時減少重複閱讀。')),
    'marketValidation', (v_old.features->'marketValidation') || jsonb_build_object('evidenceUrls',v_evidence_urls));
  UPDATE tools SET title = v_title,
      url = 'https://notebook.google.com/',
      detail = jsonb_build_object('en',v_detail_en,'cn',v_detail_cn,'zh',v_detail_cn,'tw',v_detail_tw),
      features = v_features, next_review_date = DATE '2026-12-15', updated_at = clock_timestamp()
    WHERE id = v_id AND name = 'notebooklm' AND url = 'https://notebooklm.google.com/'
      AND title = v_old.title AND updated_at = v_old.updated_at
      AND md5(to_jsonb(tools)::text) = v_expected_md5;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 1 THEN RAISE EXCEPTION 'Expected exactly one updated row, got %; HOLD',v_count; END IF;
  SELECT * INTO STRICT v_after FROM tools WHERE id = v_id;
  IF v_after.name <> v_old.name OR v_after.status <> v_old.status
    OR v_after.page_quality_status <> v_old.page_quality_status
    OR v_after.content IS DISTINCT FROM v_old.content
    OR v_after.features - 'identity' - 'editorial' - 'trialTemplate' - 'marketValidation'
       IS DISTINCT FROM v_old.features - 'identity' - 'editorial' - 'trialTemplate' - 'marketValidation' THEN
    RAISE EXCEPTION 'Postcondition or unrelated field changed; HOLD';
  END IF;
  RAISE NOTICE 'UPDATED one row. post_updated_at=%, post_row_md5=%. Save both privately for rollback.',
    v_after.updated_at::text, md5(to_jsonb(v_after)::text);
END
$identity$;
-- Default is always read-only in effect. Owner must change this line explicitly after gates.
ROLLBACK;
