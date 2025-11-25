#!/usr/bin/env node

/**
 * Generate llms.txt file for AI/LLM crawlers
 * This file helps AI models understand the structure and content of the site
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = process.env.SITE_URL || 'https://digidai.github.io/wikimuseum';

async function getArticles() {
  const articlesDir = path.join(__dirname, '..', 'src', 'content', 'articles');

  try {
    const files = await fs.readdir(articlesDir);
    const articles = [];

    for (const file of files) {
      if (!file.endsWith('.md')) continue;

      const content = await fs.readFile(path.join(articlesDir, file), 'utf-8');

      // Parse frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) continue;

      const frontmatter = frontmatterMatch[1];
      const title = frontmatter.match(/title:\s*"?([^"\n]+)"?/)?.[1] || file.replace('.md', '');
      const description = frontmatter.match(/description:\s*"?([^"\n]+)"?/)?.[1] || '';
      const slug = file.replace('.md', '');

      articles.push({ title, description, slug });
    }

    return articles;
  } catch (error) {
    console.error('Error reading articles:', error);
    return [];
  }
}

async function generateLlmsTxt() {
  const articles = await getArticles();

  const content = `# WikiMuseum

> WikiMuseum 是一个现代化的文章发布平台，支持 Markdown 写作和 AI SEO 优化。

## 网站信息
- 网站类型: 博客/知识分享平台
- 主要语言: 中文
- 主要内容: 技术文章、知识分享、教程

## 文章列表
${articles.map(a => `- [${a.title}](${SITE_URL}/articles/${a.slug}/): ${a.description}`).join('\n')}

## 主要页面
- [首页](${SITE_URL}/): 文章列表和网站介绍
- [发布文章](${SITE_URL}/publish/): 发布新的 Markdown 文章

## 联系方式
如需联系，请通过 GitHub Issues 提交。

## 版权信息
所有文章内容版权归原作者所有。
`;

  const outputPath = path.join(__dirname, '..', 'public', 'llms.txt');
  await fs.writeFile(outputPath, content, 'utf-8');
  console.log('Generated llms.txt');
}

generateLlmsTxt();
