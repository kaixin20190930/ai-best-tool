# 全站语言前缀与登录返回路径修复

日期：2026-09-04

状态：代码修复、单元检查、完整 build（退出码 0）、182 页/5,406 处内部链接扫描与最终构建页面重扫均通过。实现提交 `4c3e01a1`；生产状态以该版本的 Vercel 结果及发布后 smoke 为准，不把提交/推送等同于已上线。不能把源码检查等同于已登录后台的完整业务验收。

发布后补记：最新发布提交373d2336已获Vercel success / Deployment has completed；上轮实际生产导航扫描182页、5406处内部链接及SEO smoke均退出0，sitemap162。本轮仅补齐记录，未重新执行上述生产全扫，不将历史验收标成今日重跑。

## 根因及影响范围

`@/app/navigation` 的 Link 会由 next-intl 添加语言前缀；部分调用先手动加入 `/cn`、`/en`，服务端输出因此出现 `/cn/cn/login` 等错误。

这不是工具页独有：工具页的登录、认领、兜底导航，个人中心的自有工具链接，以及提交表单的认领/价格选项都存在相同调用模式。通知栏使用动态链接，需共享层保护。原生 `<a>` 和 `next/link` 不会自动增加语言前缀，不可批量删除它们的前缀。

检查了 app/components 中 77 个导入本地化 Link 的源码文件。后台工具筛选和收录候选分页使用未加前缀的路由，未发现同类重复拼接。没有为此替换所有 router API。

## 修复契约

1. 共享 LocalizedLink 先拆除已有语言段，再交给 next-intl 添加一次；支持字符串、URL 对象、显式 locale、query、hash、ref 及既有 Link 属性。
2. 修正已知错误调用；原生链接维持完整本地化路径。英文维持现有 as-needed 策略，不改变 canonical。
3. 历史重复前缀 GET/HEAD 地址以 308 回到正确路径，保留查询参数；不重定向 POST 请求。
4. 登录页、密码登录 action、OAuth callback 共用安全返回路径处理，避免重复前缀和外站重定向；受保护页面的登录入口保留原查询参数。
5. 不修改数据库、发布状态、index/noindex 策略、sitemap 筛选规则或收录额度。

## 自动验收

- `pnpm run test:localized-navigation`：九种语言、重复/混合前缀、query/hash、URL 对象、外部链接、安全回跳及导入绑定级源码扫描；语言配置增加时测试必须同步。
- `SEO_BASE_URL=http://localhost:3017 pnpm run test:localized-navigation:smoke`：扫描 sitemap 全部 URL，追加登录、注册、找回密码、提交、个人区、价格、认领和 comparison 入口；检查 HTML 内部链接、最终地址、旧地址跳转和登录 query。
- Adobe/Salesforce 英中页面额外验证登录 CTA、返回路径及中文找相似工具链接不丢语言。
- `pnpm run build`：生产构建完整通过才能推送。
- 单元/源码检查已加入既有 SEO Monitoring 工作流；线上全扫由明确部署后验收执行，避免 main 推送时检查尚未更新的生产版本。

## 浏览器与边界

SEO 架构守卫通过 295 个 app 源码文件，面包屑测试通过 6 个核心模板。提交前 eslint/prettier 钩子通过；提交表单两处既有嵌套条件表达式作等价拆分，未改变定价计算或收费流程。

本地生产服务中，实际点击 Adobe 中文正文“登录后收藏、评论并关注更新”，正确打开 `/cn/login?redirect=%2Fcn%2Fai%2Fadobe`，登录表单及 Google/GitHub 按钮正常展示。未输入凭据，也未实际完成 OAuth，因此不宣称认证提供商或登录后所有业务操作已端到端通过。

工具页正文和评论请求属于不同系统；本次导航修复不代表历史内容质量问题或评论请求错误已一并解决。
