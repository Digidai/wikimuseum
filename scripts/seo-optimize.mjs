#!/usr/bin/env node

/**
 * SEO Optimization Script
 * Fetches content from Gist and calls OpenRouter API for SEO optimization
 * Supports multiple models with automatic fallback
 */

import fs from 'fs/promises';
import path from 'path';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free models to try in order (fallback chain)
const MODELS = [
  'deepseek/deepseek-chat-v3-0324:free',
  'google/gemma-3-1b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'qwen/qwen3-4b:free'
];

/**
 * Extract Gist ID from URL and fetch raw content
 */
async function fetchGistContent(gistUrl) {
  const match = gistUrl.match(/gist\.github\.com\/(?:[^/]+\/)?([a-f0-9]+)/i);
  if (!match) {
    throw new Error(`Invalid Gist URL: ${gistUrl}`);
  }

  const gistId = match[1];
  console.log(`Fetching Gist: ${gistId}`);

  const apiUrl = `https://api.github.com/gists/${gistId}`;
  const response = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'WikiMuseum-SEO-Bot'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Gist: ${response.status} ${response.statusText}`);
  }

  const gistData = await response.json();
  const files = Object.values(gistData.files);
  let targetFile = files.find(f => f.filename.endsWith('.md')) || files[0];

  if (!targetFile) {
    throw new Error('No files found in Gist');
  }

  console.log(`Using file: ${targetFile.filename}`);

  if (targetFile.truncated) {
    const rawResponse = await fetch(targetFile.raw_url);
    return await rawResponse.text();
  }

  return targetFile.content;
}

async function callAI(content, model) {
  const prompt = `你是一个专业的 SEO 优化专家。请分析以下 Markdown 文章内容，生成 SEO 优化的元数据。

文章内容:
${content.substring(0, 6000)}

请以 JSON 格式返回以下字段（不要包含其他文字，只返回纯 JSON）:
{
  "title": "SEO 优化后的标题（50字以内，吸引人且包含核心关键词）",
  "description": "SEO 描述（150字以内，概括文章核心内容，包含关键词）",
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"]
}`;

  console.log(`Trying model: ${model}`);

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://github.com/wikimuseum',
      'X-Title': 'WikiMuseum SEO Optimizer'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${model}): ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAIWithFallback(content) {
  let lastError;

  for (const model of MODELS) {
    try {
      const aiResponse = await callAI(content, model);

      // Parse JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`Model ${model} returned invalid JSON, trying next...`);
        continue;
      }

      const result = JSON.parse(jsonMatch[0]);
      console.log(`Success with model: ${model}`);
      return result;

    } catch (error) {
      console.log(`Model ${model} failed: ${error.message}`);
      lastError = error;

      // Wait before trying next model
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error(`All models failed. Last error: ${lastError?.message}`);
}

function generateSlug(title) {
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
  const gistUrl = process.argv[2];

  if (!gistUrl) {
    console.error('Usage: node seo-optimize.mjs "<gist-url>"');
    process.exit(1);
  }

  if (!OPENROUTER_API_KEY) {
    console.error('Error: OPENROUTER_API_KEY environment variable is not set');
    process.exit(1);
  }

  console.log('Fetching content from Gist...');
  const content = await fetchGistContent(gistUrl);
  console.log(`Fetched ${content.length} characters`);

  console.log('Calling AI for SEO optimization...');
  const seoData = await callAIWithFallback(content);
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
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
