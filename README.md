# WikiMuseum

一个基于 Astro 构建的 Notion 风格博客网站，支持通过 GitHub Issue 进行文章管理。

## 功能特性

- Notion 风格的简洁设计
- 通过 GitHub Issue + Gist 发布/更新/删除文章
- 自动生成 SEO 文件（sitemap.xml、robots.txt、llms.txt）
- GitHub Pages 自动部署
- Markdown 内容支持
- 响应式设计

## 技术栈

- **框架**: [Astro](https://astro.build/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **部署**: GitHub Pages
- **CI/CD**: GitHub Actions

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 文章操作指南

### 发布新文章

1. **准备 Markdown 内容**
   - 文章以 `# 标题` 开头
   - 第一段正文将自动作为描述

2. **创建 GitHub Gist**
   - 访问 https://gist.github.com/
   - 文件名填写 `article.md`
   - 粘贴文章内容
   - 点击 **Create public gist**
   - 复制 Gist URL

3. **提交发布请求**
   - 访问 [发布新文章](https://github.com/Digidai/wikimuseum/issues/new?template=new-article.yml)
   - 粘贴 Gist URL
   - 提交 Issue

4. **等待自动处理**
   - GitHub Actions 会自动处理并发布文章
   - 完成后 Issue 会自动关闭

### 更新文章

1. **获取文章文件名**
   - 从文章 URL 中获取文件名
   - 例如：`https://digidai.github.io/wikimuseum/articles/my-article-123/`
   - 文件名为：`my-article-123`

2. **创建新的 Gist**
   - 包含更新后的完整文章内容

3. **提交更新请求**
   - 访问 [更新文章](https://github.com/Digidai/wikimuseum/issues/new?template=update-article.yml)
   - 填写 **文章文件名**
   - 粘贴新的 Gist URL
   - 提交 Issue

> 注意：更新会保留原始发布日期，并添加更新日期。

### 删除文章

1. **获取文章文件名**
   - 从文章 URL 中获取文件名

2. **提交删除请求**
   - 访问 [删除文章](https://github.com/Digidai/wikimuseum/issues/new?template=delete-article.yml)
   - 填写 **文章文件名**
   - 提交 Issue

> 注意：删除操作不可恢复，请谨慎操作。

## GitHub Labels 配置

首次使用前需要在仓库中创建以下 Labels：

| Label | 颜色 | 用途 |
|-------|-----|------|
| `new-article` | `#0052CC` | 发布新文章 |
| `update-article` | `#FFA500` | 更新文章 |
| `delete-article` | `#FF0000` | 删除文章 |

创建方式：Settings → Labels → New label

## SEO 文件

每次文章操作后，以下 SEO 文件会自动更新：

| 文件 | 说明 |
|-----|------|
| `sitemap.xml` | 网站地图，Astro 构建时自动生成 |
| `robots.txt` | 搜索引擎爬虫配置 |
| `llms.txt` | LLM 友好的网站内容索引 |

## 项目结构

```
wikimuseum/
├── .github/
│   ├── ISSUE_TEMPLATE/      # Issue 模板
│   │   ├── new-article.yml
│   │   ├── update-article.yml
│   │   └── delete-article.yml
│   └── workflows/           # GitHub Actions 工作流
│       ├── seo-optimize.yml # 发布文章
│       ├── update-article.yml
│       ├── delete-article.yml
│       └── deploy.yml
├── public/
│   ├── robots.txt
│   └── favicon.svg
├── scripts/
│   ├── seo-optimize.mjs     # 发布文章脚本
│   ├── update-article.mjs   # 更新文章脚本
│   ├── delete-article.mjs   # 删除文章脚本
│   └── generate-llms.mjs    # 生成 llms.txt
├── src/
│   ├── content/
│   │   └── articles/        # Markdown 文章存放目录
│   ├── components/          # 组件
│   ├── layouts/             # 布局
│   ├── pages/               # 页面
│   └── styles/              # 样式
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## 在线访问

https://digidai.github.io/wikimuseum/

## License

MIT
