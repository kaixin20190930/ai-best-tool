-- MTN-UX-01 candidate ONLY. Not executed by development or read-only verifier.
-- Owner: independently review the linked official sources and both languages first.
-- Replace NULL below with the reviewing auth.users UUID, then execute this ONE block.
-- Exact snapshot and evidence drift/staleness abort atomically. Repeat execution aborts safely.
DO $mtn_ux$
DECLARE
  v_reviewer uuid := NULL; -- OWNER_REVIEWER_REQUIRED
  v_task constant uuid := 'e9c64181-9cad-40c5-979e-3af4bd9cc630';
  v_entry jsonb;
  v_claim jsonb;
  v_fit public.tool_task_fits%ROWTYPE;
  v_now timestamptz := clock_timestamp();
  v_manifest constant jsonb := $payload$[
  {
    "before": {
      "id": "0ea08626-0d94-4773-a27e-3b5ce8fbd09b",
      "tool_id": "57b270b9-78cf-41f8-8b74-dec46400cd65",
      "task_id": "e9c64181-9cad-40c5-979e-3af4bd9cc630",
      "fit_level": "conditional",
      "rationale": {
        "en": "Searchable team meeting memory with broad workflows, conditional on credits, auto-join and data governance.",
        "zh": "提供可搜索团队会议记忆，但取决于 credits、自动入会和数据治理条件。"
      },
      "required_conditions": [
        "Free or paid limits match use",
        "Consent and downstream retention are governed"
      ],
      "disqualifiers": [
        "Confidential meetings cannot be excluded",
        "No downstream deletion process"
      ],
      "status": "published",
      "updated_at": "2026-09-24T22:57:26.200145+00:00",
      "reviewed_at": "2026-09-24T22:57:26.200145+00:00",
      "review_due_at": "2026-10-24T22:57:26.200145+00:00",
      "reviewed_by": "2b8177ac-70b3-4475-a1ee-509ff8b4b622"
    },
    "after": {
      "rationale": {
        "en": "Consider Fireflies for shared meeting notes when eligible auto-join works for your team and you can manage summary credits and storage.",
        "cn": "团队需要共享会议纪要，且能采用符合条件的自动入会并管理摘要额度和存储时，可考虑 Fireflies。",
        "zh": "团队需要共享会议纪要，且能采用符合条件的自动入会并管理摘要额度和存储时，可考虑 Fireflies。"
      },
      "required_conditions": [
        {
          "en": "Free unlimited transcription requires eligible auto-joined meetings; meeting summaries and uploaded recordings consume transcription credits.",
          "cn": "免费无限转录需要符合条件的自动入会会议；会议摘要与上传录音转录会消耗转录额度。",
          "zh": "免费无限转录需要符合条件的自动入会会议；会议摘要与上传录音转录会消耗转录额度。"
        },
        {
          "en": "Free or paid limits match use",
          "cn": "免费或付费套餐限制须匹配用量",
          "zh": "免费或付费套餐限制须匹配用量"
        },
        {
          "en": "Consent and downstream retention are governed",
          "cn": "须管理录音同意与下游数据保留",
          "zh": "须管理录音同意与下游数据保留"
        }
      ],
      "disqualifiers": [
        {
          "en": "Free storage is 400 minutes per seat and transcript downloads require a paid plan. Rule out Free if no-cost transcript export is mandatory.",
          "cn": "免费存储为每席 400 分钟，下载转录需要付费套餐；若必须免费导出转录，应排除免费版。",
          "zh": "免费存储为每席 400 分钟，下载转录需要付费套餐；若必须免费导出转录，应排除免费版。"
        },
        {
          "en": "Confidential meetings cannot be excluded",
          "cn": "无法排除机密会议时不适用",
          "zh": "无法排除机密会议时不适用"
        },
        {
          "en": "No downstream deletion process",
          "cn": "没有下游数据删除流程时不适用",
          "zh": "没有下游数据删除流程时不适用"
        }
      ]
    },
    "claims": [
      {
        "id": "3beaa3d9-635c-4f3c-8634-9265c4f3177b",
        "profile_id": "f2205c00-f20c-4c91-a757-bf91f6df4df3",
        "source_url": "https://guide.fireflies.ai/articles/4027724828-learn-about-the-fireflies-free-plan",
        "claim_value": {
          "free": {
            "ai_credits_per_month": 20,
            "storage_minutes_per_seat": 400,
            "signup_transcription_credits": {
              "website": 3,
              "mobile_new_user": 10,
              "chrome_extension": 5,
              "mobile_existing_user": 5
            },
            "uploads_consume_transcription_credits": true,
            "transcript_download_requires_paid_plan": true,
            "unlimited_transcription_requires_auto_join": true
          }
        },
        "verified_at": "2026-09-24T22:57:26.200145+00:00",
        "review_due_at": "2026-10-24T22:57:26.200145+00:00"
      },
      {
        "id": "faba3257-50ac-4e3a-8a47-f37466a3922c",
        "profile_id": "f2205c00-f20c-4c91-a757-bf91f6df4df3",
        "source_url": "https://fireflies.ai/pricing",
        "claim_value": {
          "free": {
            "ai_summaries": "limited",
            "transcription": "unlimited with auto-join conditions"
          },
          "paid": {
            "ai_summaries": "unlimited",
            "transcript_downloads": true
          }
        },
        "verified_at": "2026-09-24T22:57:26.200145+00:00",
        "review_due_at": "2026-10-24T22:57:26.200145+00:00"
      }
    ]
  },
  {
    "before": {
      "id": "e6f8457e-cc46-40c0-9d2b-aa455d87c658",
      "tool_id": "7ae4bbb2-847f-45cc-9294-e96663fa02a3",
      "task_id": "e9c64181-9cad-40c5-979e-3af4bd9cc630",
      "fit_level": "strong",
      "rationale": {
        "en": "Fast meeting capture, summaries and follow-up for supported calls.",
        "zh": "为受支持会议提供快速采集、摘要和跟进。"
      },
      "required_conditions": [
        "Supported meeting platform",
        "Participant notice and transcript review"
      ],
      "disqualifiers": [
        "Unsupported capture environment",
        "Unreviewed authoritative record"
      ],
      "status": "published",
      "updated_at": "2026-09-24T22:57:26.200145+00:00",
      "reviewed_at": "2026-09-24T22:57:26.200145+00:00",
      "review_due_at": "2026-10-24T22:57:26.200145+00:00",
      "reviewed_by": "2b8177ac-70b3-4475-a1ee-509ff8b4b622"
    },
    "after": {
      "rationale": {
        "en": "Prioritize Fathom for individual call summaries, with Premium when AI action items and follow-up emails are essential.",
        "cn": "个人会议以摘要为主时优先考虑 Fathom；若需要 AI 行动项和跟进邮件，需选择 Premium。",
        "zh": "个人会议以摘要为主时优先考虑 Fathom；若需要 AI 行动项和跟进邮件，需选择 Premium。"
      },
      "required_conditions": [
        {
          "en": "Choose a plan that covers your summary workflow; AI action items and follow-up emails are Premium features.",
          "cn": "套餐须覆盖你的摘要流程；AI 行动项与跟进邮件属于 Premium 功能。",
          "zh": "套餐须覆盖你的摘要流程；AI 行动项与跟进邮件属于 Premium 功能。"
        },
        {
          "en": "Supported meeting platform",
          "cn": "会议平台必须受支持",
          "zh": "会议平台必须受支持"
        },
        {
          "en": "Participant notice and transcript review",
          "cn": "告知参会者并人工复核转录",
          "zh": "告知参会者并人工复核转录"
        }
      ],
      "disqualifiers": [
        {
          "en": "Free advanced summaries cover only the first five calls each month; after that only General/Enhanced templates remain.",
          "cn": "免费高级摘要仅覆盖每月前 5 次会议，之后仅可用 General/Enhanced 模板。",
          "zh": "免费高级摘要仅覆盖每月前 5 次会议，之后仅可用 General/Enhanced 模板。"
        },
        {
          "en": "Unsupported capture environment",
          "cn": "不适用于不受支持的采集环境",
          "zh": "不适用于不受支持的采集环境"
        },
        {
          "en": "Unreviewed authoritative record",
          "cn": "不应将未经复核的内容作为权威记录",
          "zh": "不应将未经复核的内容作为权威记录"
        }
      ]
    },
    "claims": [
      {
        "id": "d0fcbebe-7b75-43e0-be96-4ac0a9dc7426",
        "profile_id": "21efd79f-58c8-439f-af40-69841ef18881",
        "source_url": "https://help.fathom.video/en/articles/5290881",
        "claim_value": {
          "free": {
            "after_limit": "General or Enhanced template only",
            "recording_storage": "unlimited",
            "transcription_languages": 38,
            "advanced_summaries_per_month": 5
          },
          "premium": {
            "ask_fathom": true,
            "action_items": true,
            "custom_summaries": true,
            "follow_up_emails": true,
            "advanced_summaries": "unlimited"
          }
        },
        "verified_at": "2026-09-24T22:57:26.200145+00:00",
        "review_due_at": "2026-10-24T22:57:26.200145+00:00"
      },
      {
        "id": "441e68da-0cc2-443b-9bc2-ade47eeb955f",
        "profile_id": "21efd79f-58c8-439f-af40-69841ef18881",
        "source_url": "https://fathom.video/pricing",
        "claim_value": {
          "free": {
            "instant_call_summaries": true
          },
          "premium": {
            "ai_action_items": true,
            "advanced_call_summaries": true
          }
        },
        "verified_at": "2026-09-24T22:57:26.200145+00:00",
        "review_due_at": "2026-10-24T22:57:26.200145+00:00"
      }
    ]
  },
  {
    "before": {
      "id": "00d00375-2bb6-4ac3-8e6f-593327e244fb",
      "tool_id": "b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49",
      "task_id": "e9c64181-9cad-40c5-979e-3af4bd9cc630",
      "fit_level": "strong",
      "rationale": {
        "en": "Searchable meeting history and collaborative notes with explicit plan boundaries.",
        "zh": "在明确套餐边界下提供可搜索会议历史和协作笔记。"
      },
      "required_conditions": [
        "Plan limits match meeting volume",
        "Auto-join and sharing are governed"
      ],
      "disqualifiers": [
        "Recording is prohibited",
        "No transcript review process"
      ],
      "status": "published",
      "updated_at": "2026-09-24T22:57:26.200145+00:00",
      "reviewed_at": "2026-09-24T22:57:26.200145+00:00",
      "review_due_at": "2026-10-24T22:57:26.200145+00:00",
      "reviewed_by": "2b8177ac-70b3-4475-a1ee-509ff8b4b622"
    },
    "after": {
      "rationale": {
        "en": "Prioritize Otter for calendar-linked summary emails and reviewing recent conversations, if Basic history and duration limits fit your workload.",
        "cn": "需要向日历参会者发送摘要邮件、复查近期对话，且能接受 Basic 历史与时长限制时，优先考虑 Otter。",
        "zh": "需要向日历参会者发送摘要邮件、复查近期对话，且能接受 Basic 历史与时长限制时，优先考虑 Otter。"
      },
      "required_conditions": [
        {
          "en": "Summary emails require a synced calendar event, a recording, and auto-sharing with calendar guests; confirm the recipients first.",
          "cn": "摘要邮件需要同步日历事件、录制会议，并开启向日历参会者自动共享；请先确认接收者。",
          "zh": "摘要邮件需要同步日历事件、录制会议，并开启向日历参会者自动共享；请先确认接收者。"
        },
        {
          "en": "Plan limits match meeting volume",
          "cn": "套餐限制须匹配会议量",
          "zh": "套餐限制须匹配会议量"
        },
        {
          "en": "Auto-join and sharing are governed",
          "cn": "自动入会与共享须经过管理",
          "zh": "自动入会与共享须经过管理"
        }
      ],
      "disqualifiers": [
        {
          "en": "Basic allows 300 transcription minutes per month, access to 30 minutes per conversation, three lifetime file imports and the 25 most recent conversations. It does not suit free long-meeting or full-history access.",
          "cn": "Basic 每月转录 300 分钟，每段仅可访问 30 分钟，账户累计导入 3 个文件，只显示最近 25 段对话；不适合免费长会议全文或完整历史查阅。",
          "zh": "Basic 每月转录 300 分钟，每段仅可访问 30 分钟，账户累计导入 3 个文件，只显示最近 25 段对话；不适合免费长会议全文或完整历史查阅。"
        },
        {
          "en": "Recording is prohibited",
          "cn": "禁止录音时不适用",
          "zh": "禁止录音时不适用"
        },
        {
          "en": "No transcript review process",
          "cn": "没有转录复核流程时不适用",
          "zh": "没有转录复核流程时不适用"
        }
      ]
    },
    "claims": [
      {
        "id": "4b32bdc2-e75b-4c64-a15f-929b21bac0e4",
        "profile_id": "42446fa0-13e4-48ee-a4fa-7c33679d89aa",
        "source_url": "https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan",
        "claim_value": {
          "basic": {
            "file_imports_per_account": 3,
            "recent_conversations_visible": 25,
            "monthly_transcription_minutes": 300,
            "accessible_minutes_per_conversation_or_import": 30
          }
        },
        "verified_at": "2026-09-24T22:57:26.200145+00:00",
        "review_due_at": "2026-10-24T22:57:26.200145+00:00"
      },
      {
        "id": "96c8a760-3c6a-4a2b-af76-acaf26bc2952",
        "profile_id": "42446fa0-13e4-48ee-a4fa-7c33679d89aa",
        "source_url": "https://help.otter.ai/hc/en-us/articles/9156381229079-Meeting-Summary-Overview",
        "claim_value": {
          "meeting_summary": {
            "topics": true,
            "highlights": true,
            "action_items_when_present": true,
            "email_requires_synced_calendar_and_sharing": true
          }
        },
        "verified_at": "2026-09-24T22:57:26.200145+00:00",
        "review_due_at": "2026-10-24T22:57:26.200145+00:00"
      }
    ]
  }
]$payload$::jsonb;
BEGIN
  PERFORM set_config('TimeZone', 'UTC', true); -- Stable timestamp JSON snapshot comparisons.
  PERFORM pg_advisory_xact_lock(hashtext('MTN-UX-01'));
  IF v_reviewer IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_reviewer) THEN
    RAISE EXCEPTION 'Owner content review and valid reviewer required';
  END IF;
  PERFORM 1 FROM public.decision_tasks WHERE id = v_task AND slug = 'meeting-notes' AND status = 'active' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Task identity or state changed'; END IF;
  PERFORM 1 FROM public.tool_task_fits WHERE task_id = v_task FOR UPDATE;
  IF (SELECT count(*) FROM public.tool_task_fits WHERE task_id = v_task) <> 3 THEN
    RAISE EXCEPTION 'Exactly three existing fits required';
  END IF;
  FOR v_entry IN SELECT value FROM jsonb_array_elements(v_manifest) LOOP
    SELECT * INTO v_fit FROM public.tool_task_fits WHERE id = (v_entry->'before'->>'id')::uuid;
    IF NOT FOUND OR NOT (to_jsonb(v_fit) @> (v_entry->'before'))
       OR v_fit.task_id <> v_task OR v_fit.status <> 'published'
       OR v_fit.reviewed_at > v_now OR v_fit.review_due_at <= v_now THEN
      RAISE EXCEPTION 'Fit snapshot drift or stale review';
    END IF;
    FOR v_claim IN SELECT value FROM jsonb_array_elements(v_entry->'claims') LOOP
      PERFORM 1 FROM public.product_intelligence_claims c
        JOIN public.product_intelligence_profiles p ON p.id = c.profile_id
        JOIN public.tool_task_fit_claims l ON l.claim_id = c.id
        WHERE c.id = (v_claim->>'id')::uuid AND l.fit_id = v_fit.id
          AND p.owner_type = 'tool' AND p.owner_id = v_fit.tool_id
          AND to_jsonb(c) @> v_claim
          AND c.source_type = 'official' AND c.verification_status = 'verified' AND c.conflict_status = 'none'
          AND c.invalidated_at IS NULL AND c.verified_at <= v_now AND c.review_due_at > v_now
          AND (c.expires_at IS NULL OR c.expires_at > v_now)
        FOR SHARE OF c, p, l;
      IF NOT FOUND THEN RAISE EXCEPTION 'Linked same-owner evidence changed or is no longer current'; END IF;
    END LOOP;
    UPDATE public.tool_task_fits SET
      rationale = v_entry->'after'->'rationale',
      required_conditions = v_entry->'after'->'required_conditions',
      disqualifiers = v_entry->'after'->'disqualifiers',
      reviewed_at = v_now, reviewed_by = v_reviewer, last_edited_by = v_reviewer
      -- Preserve review_due_at: a copy review must not extend the evidence window.
      WHERE id = v_fit.id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Fit update failed'; END IF;
  END LOOP;
END
$mtn_ux$;
