# Bo's Blog

个人技术博客，基于 [Astro](https://astro.build/) 和 [Astro Paper](https://github.com/satnaing/astro-paper) 初始化。

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
npm run new:note -- "Note title"
npm run new:project -- "Project title"
npm test
npm run lint
npm run format
```

## 目录说明

```text
src/content/blog/   博客文章
src/content/notes/  短笔记 / memo
src/content/projects/ 项目内容
src/pages/          页面路由
src/components/     通用组件
src/config.ts       站点元信息
public/images/      站点与内容图片
templates/          内容创建模板
```

## 当前状态

- 已接入 Astro Paper 模板
- 已切换博客内容目录到 `src/content/blog`
- `Posts` 页面当前每页最多显示 `100` 篇文章，并支持年份 / 标签轻量筛选
- 已自托管 `LXGW WenKai` WOFF2 字体并应用到正文和标题
- 文章页已切换到 KaTeX 编译期数学公式渲染
- 站内搜索使用自定义 `/search-index.json`，覆盖 posts、notes、projects 和 tags
- 已写入基础站点信息与首页文案
- 已导入一批旧博客文章
- 旧文章已统一迁移到新的 `pubDatetime` / `modDatetime`
- 旧文章已批量清洗旧站内链、空链接、正文 H1、description 和 tags
- 文章详情页日期统一使用 `YYYY-MM-DD`
- 已补齐 Open Graph / Twitter Card 基础元信息，默认分享图来自 `public/og.png`

## 旧文章迁移说明

当前仓库已经统一使用新 frontmatter：

- `pubDatetime`
- `modDatetime`

旧文章已经完成一轮批量清洗：

- 移除了 `category: Legacy` 和 `featured: false` 这类旧字段
- 把旧博客绝对链接改成当前 `/posts/...` 路径
- 修复了空链接
- 把正文里的页面级 H1 降成了正文层级标题
- 统一了部分 tags 命名
- 重写了 description，避免直接使用旧正文截断
- 已迁移到 `remark-math + rehype-katex`，并清理了一轮旧文章公式写法

当前仍需要注意的内容资源项：

- 历史正文目前没有使用 Markdown 图片语法的远程图片引用
- 如后续补回旧文章配图，优先放到 `public/images/posts/`
- Notes 中的本地照片需要登记尺寸，见 `src/data/public-image-dimensions.json`

## 下一步建议

- 按需补充旧文章图片资源
- 按需替换默认 OG 图、favicon 和个人资料素材
- 发布新的正式文章

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

仓库里提供了文章、note 和 project 模板与内容创建命令：

- `templates/blog-post.md`
- `templates/note.md`
- `templates/project.md`

常用写作命令：

```bash
npm run new:post -- "My new post" --tags machine-learning,notes
npm run new:note -- "LA 5K morning" --location "Los Angeles" --tags running,life
npm run new:project -- "My project" --stack Python,Astro --repoUrl https://github.com/yourname/project
```

说明：

- 新内容默认 `draft: true`
- 日期默认使用当天，格式为 `YYYY-MM-DD`
- 新内容会写入显式 `slug`，后续修改标题或文件名不会改变 URL
- 如果标题生成的 slug 不理想，可以用 `--slug your-custom-slug` 指定
- Project URL 固定由文件名生成；`new:project --slug` 只用于控制生成的文件名，不会写入 frontmatter `slug`

发布或提交前建议运行：

```bash
npm run content:check
npm test
npm run format:check
npm run build
```

## 图片目录规范

当前项目建议按内容类型拆分图片目录：

- `public/images/posts/`：博客文章配图
- `public/images/notes/`：notes / memo 照片
- `public/images/projects/`：项目封面与截图
- `public/images/site/`：站点级素材，例如 favicon、OG 图、装饰图

命名建议：

- 使用英文小写
- 使用 `-` 分隔单词
- 尽量包含日期或主题
- 避免空格和中文文件名

例如：

```text
public/images/notes/2026-03-15-la-5k-01.jpg
public/images/projects/promptlane-dashboard-cover.png
public/images/posts/sorting-algorithm-merge-sort.png
```

Notes 中的本地照片还需要在下面的文件里登记尺寸，避免页面加载时发生布局抖动：

```text
src/data/public-image-dimensions.json
```

`npm run content:check` 会检查 note 照片是否存在，以及本地照片是否已登记 `width` / `height`。

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
