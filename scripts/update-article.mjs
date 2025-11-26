#!/usr/bin/env node

/**
 * Update Article Script
 * Finds an article by filename (slug) and updates its content from a Gist
 */

import fs from 'fs/promises';
import path from 'path';

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');

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
      'User-Agent': 'WikiMuseum-Bot'
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

async function findArticleByFilename(filename) {
  // Normalize filename: remove .md extension if provided
  let targetFilename = filename.trim();
  if (!targetFilename.endsWith('.md')) {
    targetFilename += '.md';
  }

  const filepath = path.join(ARTICLES_DIR, targetFilename);

  try {
    await fs.access(filepath);
    const content = await fs.readFile(filepath, 'utf-8');

    // Extract original publish date from frontmatter
    const dateMatch = content.match(/^publishDate:\s*(.+)$/m);
    const originalDate = dateMatch ? dateMatch[1].trim() : null;

    return { filepath, filename: targetFilename, originalDate };
  } catch {
    return null;
  }
}

async function listArticles() {
  const files = await fs.readdir(ARTICLES_DIR);
  console.log('\nAvailable articles:');
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const slug = file.replace(/\.md$/, '');
    console.log(`  - ${slug}`);
  }
}

/**
 * Clean content by removing HTML tags, placeholder text, and other artifacts
 */
function sanitizeContent(content) {
  return content
    // Remove common HTML tags that shouldn't be in markdown
    .replace(/<\/?(?:article|section|div|span|header|footer|nav|main|aside)[^>]*>/gi, '')
    // Remove placeholder text patterns
    .replace(/^内容\.{2,}$/gm, '')
    .replace(/^Content\.{2,}$/gim, '')
    // Remove empty lines that result from above cleaning (but keep paragraph breaks)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractTitleAndClean(content) {
  let cleanContent = content.replace(/^---[\s\S]*?---\n?/, '').trim();

  // Sanitize content (remove HTML tags and placeholders)
  cleanContent = sanitizeContent(cleanContent);

  const h1Match = cleanContent.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const title = h1Match[1].trim();
    cleanContent = cleanContent.replace(/^#\s+.+\n?/, '').trim();
    return { title, content: cleanContent };
  }

  const firstLine = cleanContent.split('\n')[0].trim();
  const title = firstLine.replace(/^#+\s*/, '') || '未命名文章';

  return { title, content: cleanContent };
}

function extractDescription(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      // Clean HTML tags, footnote references, and special characters
      const cleaned = trimmed
        .replace(/<[^>]+>/g, '')  // Remove HTML tags
        .replace(/\[\d+\]/g, '')  // Remove [1], [2] style references
        .replace(/\n/g, ' ')      // Replace newlines with spaces
        .trim();
      // Take first 150 chars but ensure we don't cut in the middle of a word
      if (cleaned.length <= 150) {
        return cleaned;
      }
      const truncated = cleaned.substring(0, 150);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 100 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    }
  }
  return '文章内容';
}

/**
 * Escape special characters for YAML string values
 */
function escapeYamlString(str) {
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/"/g, '\\"')     // Escape double quotes
    .replace(/\n/g, ' ')      // Replace newlines with spaces
    .replace(/\r/g, '')       // Remove carriage returns
    .trim();
}

function generateFrontmatter(title, description, publishDate) {
  const updateDate = new Date().toISOString().split('T')[0];
  const safeTitle = escapeYamlString(title);
  const safeDescription = escapeYamlString(description);
  return `---
title: "${safeTitle}"
description: "${safeDescription}"
publishDate: ${publishDate}
updateDate: ${updateDate}
keywords: []
seoOptimized: false
---`;
}

async function main() {
  const filename = process.argv[2];
  const gistUrl = process.argv[3];

  if (!filename || !gistUrl) {
    console.error('Usage: node update-article.mjs "<article-filename>" "<gist-url>"');
    console.error('Example: node update-article.mjs "google大模型深度研究报告-技术演进与行业影响-1764071590944" "https://gist.github.com/..."');
    process.exit(1);
  }

  console.log(`Searching for article: "${filename}"`);

  const article = await findArticleByFilename(filename);

  if (!article) {
    console.error(`Article not found: "${filename}"`);
    await listArticles();
    process.exit(1);
  }

  console.log(`Found article: ${article.filename}`);
  console.log(`Original publish date: ${article.originalDate}`);

  // Fetch new content from Gist
  console.log('Fetching new content from Gist...');
  const rawContent = await fetchGistContent(gistUrl);
  console.log(`Fetched ${rawContent.length} characters`);

  // Extract new title and content
  const { title: newTitle, content: newContent } = extractTitleAndClean(rawContent);
  const description = extractDescription(newContent);

  console.log(`New title: ${newTitle}`);

  // Generate new frontmatter (preserve original publish date)
  const frontmatter = generateFrontmatter(newTitle, description, article.originalDate);
  const finalContent = `${frontmatter}\n\n${newContent}`;

  // Write updated content
  await fs.writeFile(article.filepath, finalContent, 'utf-8');
  console.log(`Updated: ${article.filepath}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
