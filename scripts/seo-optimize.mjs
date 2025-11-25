#!/usr/bin/env node

/**
 * SEO Optimization Script
 * Calls OpenRouter DeepSeek API to generate SEO-optimized frontmatter for articles
 */

import fs from 'fs/promises';
import path from 'path';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callDeepSeek(content) {
  const prompt = `你是一个专业的 SEO 优化专家。请分析以下 Markdown 文章内容，生成 SEO 优化的元数据。

文章内容:
${content}

请以 JSON 格式返回以下字段（不要包含其他文字，只返回 JSON）:
{
  "title": "SEO 优化后的标题（50字以内，吸引人且包含核心关键词）",
  "description": "SEO 描述（150字以内，概括文章核心内容，包含关键词）",
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"]
}`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://github.com/wikimuseum',
      'X-Title': 'WikiMuseum SEO Optimizer'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;

  // Parse JSON from response
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response as JSON');
  }

  return JSON.parse(jsonMatch[0]);
}

function generateSlug(title) {
  // Generate URL-friendly slug from title
  const timestamp = Date.now();
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  return `${cleanTitle}-${timestamp}`;
}

function generateFrontmatter(seoData) {
  const today = new Date().toISOString().split('T')[0];
  return `---
title: "${seoData.title}"
description: "${seoData.description}"
publishDate: ${today}
keywords: ${JSON.stringify(seoData.keywords)}
seoOptimized: true
---`;
}

async function main() {
  // Get markdown content from command line argument or stdin
  let content = process.argv[2];

  if (!content) {
    console.error('Usage: node seo-optimize.mjs "<markdown-content>"');
    process.exit(1);
  }

  if (!OPENROUTER_API_KEY) {
    console.error('Error: OPENROUTER_API_KEY environment variable is not set');
    process.exit(1);
  }

  console.log('Calling DeepSeek API for SEO optimization...');

  try {
    const seoData = await callDeepSeek(content);
    console.log('SEO optimization result:', seoData);

    // Generate filename
    const slug = generateSlug(seoData.title);
    const filename = `${slug}.md`;
    const filepath = path.join(process.cwd(), 'src', 'content', 'articles', filename);

    // Generate frontmatter and combine with content
    const frontmatter = generateFrontmatter(seoData);

    // Remove any existing frontmatter from content
    const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n?/, '').trim();

    const finalContent = `${frontmatter}\n\n${contentWithoutFrontmatter}`;

    // Write file
    await fs.writeFile(filepath, finalContent, 'utf-8');
    console.log(`Article created: ${filepath}`);

    // Output the filename for GitHub Actions
    console.log(`::set-output name=filename::${filename}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
