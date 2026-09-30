# BoGao.Dev

个人 AI 工程作品集与技术写作站点，基于 [Astro](https://astro.build/) 构建。

## 本地开发

建议使用 Node.js 22（见 `.nvmrc`）。

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
```

## 目录说明

```text
src/content/blog/   博客文章
src/content/projects/ 项目内容
src/pages/          页面路由
src/components/     通用组件
src/config.ts       站点元信息
public/images/      站点与内容图片
templates/          内容创建模板
```

## 当前状态

- 首页以 AI 工程定位、Selected Work 和职业资料为核心
- Projects 和 Posts 使用独立内容集合
- Posts 支持年份 / 标签筛选，每页最多显示 `100` 篇
- 文章页支持 KaTeX 编译期数学公式渲染
- 站内搜索使用 `/search-index.json`，覆盖 posts、projects 和 tags
- 已配置 sitemap、RSS、Open Graph 和 light/dark theme
- 默认分享图来自 `public/og.png`

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
- 日期默认使用当天，格式为 `YYYY-MM-DD`
- Post 会写入显式 `slug`，后续修改标题或文件名不会改变 URL
- 如果标题生成的 slug 不理想，可以用 `--slug your-custom-slug` 指定
- Project URL 固定由文件名生成；`new:project --slug` 只用于控制生成的文件名，不会写入 frontmatter `slug`
- 文章语言默认按标题 / 描述自动判断（含汉字即 `zh-CN`，否则 `en`），用于 `<html lang>` 和 `og:locale`；需要时可在 frontmatter 里写 `lang: ja` 等显式指定

发布或提交前建议运行：

```bash
npm run content:check
npm test
npm run lint
npm run format:check
npm run build
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

如果你要替换默认分享图，直接替换这个文件，或者在文章 frontmatter 中单独指定 `ogImage`。
