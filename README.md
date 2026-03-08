# Bo's Blog

个人技术博客，基于 [Astro](https://astro.build/) 和 [Astro Paper](https://github.com/satnaing/astro-paper) 初始化。

## 本地开发

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
npm run lint
npm run format
```

## 目录说明

```text
src/content/blog/   博客文章
src/pages/          页面路由
src/components/     通用组件
src/config.ts       站点元信息
templates/          中英文文章模板
dev.md              开发计划
```

## 当前状态

- 已接入 Astro Paper 模板
- 已切换博客内容目录到 `src/content/blog`
- 已支持 `en` / `zh-CN` 语言元信息，且文章必须显式声明 `lang`
- `Posts` 页面支持按语言筛选
- `Posts` 页面当前每页显示 `8` 篇文章
- 已自托管 `LXGW WenKai` 字体并应用到正文、标题和代码区
- 文章页已切换到 KaTeX 编译期数学公式渲染
- 已写入基础站点信息与首页文案
- 已导入一批旧博客文章
- 旧文章已统一迁移到新的 `pubDatetime` / `modDatetime`
- 旧文章已批量清洗旧站内链、空链接、正文 H1、description 和 tags
- 文章详情页日期统一使用 `YYYY-MM-DD`
- 已保留 `dev.md` 作为后续实施文档
- 已补齐 Open Graph / Twitter Card 基础元信息，默认分享图来自 `public/astropaper-og.jpg`

## 旧文章迁移说明

当前仓库已经统一使用新 frontmatter：

- `pubDatetime`
- `modDatetime`
- `lang`

旧文章已经完成一轮批量清洗：

- 移除了 `category: Legacy` 和 `featured: false` 这类旧字段
- 把旧博客绝对链接改成当前 `/posts/...` 路径
- 修复了空链接
- 把正文里的页面级 H1 降成了正文层级标题
- 统一了显式语言字段和部分 tags 命名
- 重写了 description，避免直接使用旧正文截断
- 已迁移到 `remark-math + rehype-katex`，并清理了一轮旧文章公式写法

当前仍未处理的迁移项：

- 正文里的旧远程图片仍然保留原地址
- 图片资源需要后续人工补图或替换

## 下一步建议

- 人工处理旧文章图片资源
- 替换默认 OG 图、favicon 和个人资料素材
- 接入 GitHub 与 Vercel 发布流程
- 发布新的正式文章

## GitHub + Vercel 部署

当前仓库已经按 `GitHub + Vercel` 方式整理：

- Vercel 构建命令固定为 `npm run build`
- 输出目录为 `dist`
- `dev.md` 和 `.vercel/` 已加入 `.gitignore`
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

仓库里提供了双语文章模板：

- `templates/blog-post.en.md`
- `templates/blog-post.zh-CN.md`

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
public/astropaper-og.jpg
```

如果你要替换默认分享图，直接替换这个文件，或者在文章 frontmatter 中单独指定 `ogImage`。
