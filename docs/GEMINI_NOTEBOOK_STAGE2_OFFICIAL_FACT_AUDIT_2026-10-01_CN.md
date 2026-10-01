# Gemini Notebook Stage 2 官方事实独立核查（2026-10-01）

本文件只核对 `db/supabase/manual/20261001_gemini_notebook_stage2_candidate.sql` 中的七个候选 Google 来源与十条 claim。`PASS` 表示当前可访问的指定官方页直接支持所列有限结论；`HOLD` 表示指定 URL 的访问或证据仍需复核。这里的核查不等于本站对产品输出、引用准确率或账号权限的实测，也不授权将 claim 标为 verified。

访问记录：Google 官方博客及帮助文章 `16215270`、`16206563`、`16213268`、`17670842`、`17004255` 在网页检索中可读。指定的 `16164461?hl=en` 在网页检索中返回验证/错误页；同一文章编号的不带参数页面可读，载有下表所引文字。命令行对该指定 URL 返回 HTTP 404（同一环境中另一帮助 URL 亦返回 404，故不能据此断言文章已删除）。`grounding` 和 `workspace-privacy` 暂列 HOLD，待审核人直接打开指定 URL 或将候选来源改为可稳定访问的官方 URL 后重核。

| Claim key suffix | 候选官方 URL | 官方页短原文 | 直接结论 | 适用边界与核查限制 | 状态 |
| --- | --- | --- | --- | --- | --- |
| `identity-2026-10` | [Google 更名公告](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/) | “We’re renaming NotebookLM to Gemini Notebook.” | 2026-07-16 公告确认 NotebookLM 更名为 Gemini Notebook，且仍是独立产品。 | “独立产品”不表示与 Gemini App 完全隔离；公告也说明跨应用同步。 | PASS |
| `grounding-2026-10` | [Learn about Gemini Notebook（指定 URL）](https://support.google.com/gemininotebook/answer/16164461?hl=en) | “grounded information based on your sources with clear in-line citations” | [同编号可读页面](https://support.google.com/gemininotebook/answer/16164461)称 notebook chat 基于来源给出行内引用。 | 指定 `?hl=en` URL 此次未能稳定打开；引用提供回查路径，不能证明答案或引用准确，本站也未做独立准确率测试；范围是 Gemini Notebook chat，非普通 Gemini App chat。 | HOLD |
| `discovery-2026-10` | [Add or discover sources](https://support.google.com/gemininotebook/answer/16215270?hl=en) | “Select sources and import” | Fast Research 可从 Web 或用户有权访问的 Drive 发现结果，用户查看、选择并导入来源。 | 选取结果不等于穷尽或可复现的系统检索；移动端、年龄、地区、账号及来源权限可能限制功能。 | PASS |
| `import-loss-2026-10` | [Add or discover sources](https://support.google.com/gemininotebook/answer/16215270?hl=en) | “does not import footnotes or comments”; “Only the text transcript of the video is imported” | 官方页分别说明：Google 文件脚注和评论不导入；Web URL 仅抓 HTML 文本，不导入图片、嵌入视频或嵌套页；YouTube 只支持有字幕的公开视频且只导入文字转录；本地音频保存转录文字。 | 各限制只适用于相应来源类型。重要论据应对照原件检查导入损失；不可把文字转录当作完整视频或音频。 | PASS |
| `notebook-boundary-2026-10` | [Create a notebook](https://support.google.com/gemininotebook/answer/16206563?hl=en) | “Each notebook is independent.” | 该帮助页明确说 Gemini Notebook 不能同时访问多个 notebook 的信息。 | 指当前 notebook 的内容边界；不能据此推断 Gemini App 内的 notebook 使用方式完全相同。 | PASS |
| `sharing-export-2026-10` | [Create a notebook](https://support.google.com/gemininotebook/answer/16206563?hl=en) | “Sharing permissions do not carry over from Gemini Notebook to exported files.” | Notebook 可授予 Viewer/Editor 权限，报告/数据表可导出 Docs/Sheets；导出文件不继承 notebook 分享权限。 | 需分别管理 notebook、导出文件、公开链接和工件权限；具体分享能力依账号与权限而变。 | PASS |
| `plans-2026-10` | [Upgrade Gemini Notebook](https://support.google.com/gemininotebook/answer/16213268?hl=en) | “Usage Limits (Subject to Change)” | 官方表格列出 Standard、Plus、Pro、Ultra 的不同上限，并区分资格和地区。 | 限额可变；实际功能取决于套餐、年龄、地区、账号资格及 Workspace 管理员设置，不能将表格当成所有用户的固定额度。 | PASS |
| `compute-limits-2026-10` | [Manage usage limits](https://support.google.com/gemininotebook/answer/17670842?hl=en) | “quota refreshes every 5 hours until you reach your weekly limit” | 2026-09-02 起另有按提示复杂度、模型和功能等计算的用量限制，涉及五小时刷新及周限制；每日 chat 次数不足以描述完整额度。 | 上限可随套餐、测试或可用性变化；应以目标账号的 Usage 页面为准。 | PASS |
| `data-handling-2026-10` | [Privacy and Terms](https://support.google.com/gemininotebook/answer/17004255?hl=en) | “will not be used to directly train our foundational AI models” | 官方一般说明：Notebook 内容不直接训练基础模型，除非用户提供反馈；与其他 Google 服务共享的数据按其各自通知处理。 | 反馈可能包含提示、上传内容与输出并供人工审阅；不可据此推断跨服务数据沿用相同规则。Workspace/Education 另有更具体条款。 | PASS |
| `workspace-privacy-2026-10` | [Learn about Gemini Notebook（指定 URL）](https://support.google.com/gemininotebook/answer/16164461?hl=en) | “will not be reviewed by human reviewers” | [同编号可读页面](https://support.google.com/gemininotebook/answer/16164461)称 Workspace 与 Workspace for Education 用户的上传、查询和模型回答不供人工审阅或训练 AI 模型。 | 指定 `?hl=en` URL 此次未能稳定打开；仅适用于合格 Workspace / Education 账号及相应服务条款，不应泛化到个人账号或其他 Google 服务。 | HOLD |

## 后续处理

审核人应先解决两条 HOLD 的指定 URL 可访问性，再逐条确认原文、范围和候选 claim 是否一致。即使全部转为 PASS，也需单独完成产品输出/引用抽检与正式审核流程；本文件没有填写 reviewer 身份、审核时间或任何数据库字段。
