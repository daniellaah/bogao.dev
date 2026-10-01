# BoGao.Dev

个人 AI 工程作品集与技术写作站点，基于 [Astro](https://astro.build/) 构建。

## 本地开发

需要 Node.js 22.12 或更高版本（见 `.nvmrc`）。

```bash
npm install
npm run dev
```

默认本地地址是 [http://localhost:4321](http://localhost:4321)。

## 常用命令

```bash
npm run dev
npm run build
npm run preview
npm run content:check
npm run new:post -- "Post title"
npm run new:project -- "Project title"
npm test
npm run lint
npm run format
npm run check   # lint + format + content + test + build，与 CI 相同
```

## 目录说明

```text
src/content/blog/   博客文章
src/content/projects/ 项目内容
src/pages/          页面路由
src/components/     通用组件
src/config.ts       站点元信息
src/scripts/        客户端脚本（统一通过 lifecycle.ts 的 onEveryPage 注册）
src/styles/         global.css 放 token 与通用样式，其余按组件拆分
public/images/      站点与内容图片
templates/          内容创建模板
tests/              vitest 测试：工具函数、路由、客户端脚本（Container API + happy-dom）、内容脚本
```

## 当前状态

- 首页以 AI 工程定位、Selected Work 和职业资料为核心
- Projects 和 Posts 使用独立内容集合
- Posts 支持年份 / 标签筛选，每页最多显示 `100` 篇
- 文章页支持 KaTeX 编译期数学公式渲染
- 站内搜索使用 `/search-index.json`，覆盖 posts、projects 和 tags
- 已配置 sitemap、RSS、Open Graph 和 light/dark theme
- 每篇文章和每个 project 在构建时生成独立分享图（`/og/posts/*.png`、`/og/projects/*.png`），其他页面用 `public/og.png`
- 文章和 project 支持 `.mdx`，以及 GitHub 风格的 callout 提示块
- Project 页面按案例研究组织：角色、关键指标、封面图
- 文章页可接 Giscus 评论；生产环境启用 Vercel Web Analytics

## GitHub + Vercel 部署

当前仓库已经按 `GitHub + Vercel` 方式整理：

- Vercel 构建命令固定为 `npm run build`
- 输出目录为 `dist`
- `dev.md` 和 `.vercel/` 已加入 `.gitignore`
- Docker 部署配置不再维护；当前只支持 npm + Vercel 工作流
- 站点 `site` / canonical URL 会优先读取：
  - `PUBLIC_SITE_URL`
  - `VERCEL_PROJECT_PRODUCTION_URL`

部署步骤：

1. 把当前仓库推到 GitHub
2. 在 Vercel 中选择 `Add New Project`
3. 导入这个 GitHub 仓库
4. 保持或确认以下构建设置：
   - Framework Preset: `Astro`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 首次部署完成后，如果你有正式域名，在 Vercel 里绑定自己的域名
6. 如果你想显式控制 canonical URL，而不是使用 Vercel 默认生产域名，可在 Vercel 项目环境变量里设置：

```bash
PUBLIC_SITE_URL=https://your-domain.com
```

说明：

- 如果不设置 `PUBLIC_SITE_URL`，生产环境会自动回退到 Vercel 提供的 `VERCEL_PROJECT_PRODUCTION_URL`
- 当前仓库默认正式域名是 `https://bogao.dev/`
- 本地开发仍然会回退到当前默认站点地址

## 搜索引擎验证

当前项目支持通过环境变量注入站点验证标签：

```bash
PUBLIC_GOOGLE_SITE_VERIFICATION=your_google_code
PUBLIC_BAIDU_SITE_VERIFICATION=your_baidu_code
```

例如百度给出的：

```html
<meta name="baidu-site-verification" content="codeva-xxxx" />
```

在 Vercel 中只需要填写：

```bash
PUBLIC_BAIDU_SITE_VERIFICATION=codeva-xxxx
```

## 写作模板

仓库里提供了文章和 project 模板与内容创建命令：

- `templates/blog-post.md`
- `templates/project.md`

常用写作命令：

```bash
npm run new:post -- "My new post" --tags ai-agents,evaluation
npm run new:project -- "My project" --stack Python,Astro --repoUrl https://github.com/yourname/project
```

说明：

- 新内容默认 `draft: true`
- 日期默认使用当天，格式为 `YYYY-MM-DD`；需要精确到时间时写成带时区的 `2026-10-01T09:00+08:00`（不带时区会被 `content:check` 拒绝，否则结果取决于构建机器的时区）
- Post 会写入显式 `slug`，后续修改标题或文件名不会改变 URL
- 如果标题生成的 slug 不理想，可以用 `--slug your-custom-slug` 指定
- Project URL 固定由文件名生成；`new:project --slug` 只用于控制生成的文件名，不会写入 frontmatter `slug`
- 文章语言默认按标题 / 描述自动判断（含汉字即 `zh-CN`，否则 `en`），用于 `<html lang>` 和 `og:locale`；需要时可在 frontmatter 里写 `lang: ja` 等显式指定

### MDX

`src/content/blog/` 和 `src/content/projects/` 里可以直接写 `.mdx`，用法和 `.md` 相同，数学公式、代码高亮和 callout 都照常工作。正文里可以 import 组件：

```mdx
import ProjectStatusBadge from "@/components/ProjectStatusBadge.astro";

<ProjectStatusBadge status="shipping" />
```

### Callout 提示块

使用 GitHub 的写法，支持 `NOTE`、`TIP`、`IMPORTANT`、`WARNING`、`CAUTION`，标记后面可以跟自定义标题：

```md
> [!TIP] Start with k = 60
> RRF 的常数几乎不需要调。
```

### Project 案例研究

`templates/project.md` 按 Problem → Approach → Results → What I learned 组织正文。frontmatter 里还有三个可选字段：

- `role`：你在项目里负责什么，显示在侧栏
- `metrics`：最多 4 个 `{ value, label }`，以大号数字显示在标题下方，放可验证的结果
- `cover`：`{ src, alt, caption? }`，显示在正文前的架构图或截图。`src` 是相对于 md 文件的路径（例如 `./images/arkb-architecture.png`，放在 `src/content/projects/images/`），会经过 Astro 图片优化

## 定时发布与自动重建

站点是静态构建的：`pubDatetime` 在未来的文章，以及首页开源卡片里的最新 merged PR，都要等下一次构建才会更新。

`.github/workflows/rebuild.yml` 每天 00:00 UTC 触发一次 Vercel 重建（也可以在 Actions 页面手动运行）。启用方式：

1. 在 Vercel 项目 Settings → Git → Deploy Hooks 里创建一个 hook
2. 把 hook URL 存成 GitHub 仓库 secret `VERCEL_DEPLOY_HOOK_URL`

没有配置这个 secret 时，任务会直接跳过。需要更精确的发布时间，可以把 cron 改得更频繁。

## 检查

推送到 `master` 和每个 PR 都会由 `.github/workflows/ci.yml` 运行 lint、格式、内容检查、测试和构建。本地提交前运行同一组检查：

```bash
npm run check
```

## 图片目录规范

当前项目建议按内容类型拆分图片目录：

- `public/images/posts/`：博客文章配图
- `public/images/projects/`：项目封面与截图
- `public/images/site/`：站点级图片，例如头像和装饰图
- `public/`：根级站点资源，例如 favicon、app icon 和默认 OG 图

命名建议：

- 使用英文小写
- 使用 `-` 分隔单词
- 尽量包含日期或主题
- 避免空格和中文文件名

例如：

```text
public/images/projects/promptlane-dashboard-cover.png
public/images/posts/sorting-algorithm-merge-sort.png
```

## Open Graph

当前站点已经配置了基础分享卡片元信息：

- `og:title`
- `og:description`
- `og:type`
- `og:site_name`
- `og:locale`
- `og:image`
- `twitter:card`

默认分享图来自：

```text
public/og.png
```

它用于首页、列表页等非文章页面。文章和 project 的分享图在构建时由 `src/utils/og/render.ts` 用 satori 生成，包含标题、描述、标签、日期和阅读时长，中文标题会按需加载 Noto Sans SC 的字符子集。在 frontmatter 中指定 `ogImage` 可以覆盖生成图。

## 评论（Giscus）

文章底部的评论基于 GitHub Discussions。`src/config.ts` 里的 `GISCUS.categoryId` 为空时不显示评论区。启用步骤：

1. 在仓库 Settings → General → Features 里勾选 Discussions
2. 在 Discussions 里新建一个名为 `Comments`、类型为 Announcements 的分类（只有 giscus 能创建讨论）
3. 安装 [giscus GitHub App](https://github.com/apps/giscus) 并授权这个仓库
4. 在 [giscus.app](https://giscus.app) 里填入仓库和分类，把生成的 `data-category-id` 填到 `GISCUS.categoryId`

每篇文章按 URL 路径对应一个讨论，评论区主题跟随站点的明暗切换。

## 访问统计

生产构建会注入 Vercel Web Analytics（无 cookie，不需要 cookie 横幅），本地开发不加载。在 Vercel 项目的 Analytics 页面点 Enable 后，下次部署开始收集数据。
