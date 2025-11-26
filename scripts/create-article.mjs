#!/usr/bin/env node

/**
 * Create Article Script
 * Creates a new article from a Gist
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

/**
 * Clean content by removing HTML tags, placeholder text, and other artifacts
 */
function sanitizeContent(content) {
  return content
    // Remove common HTML tags that shouldn't be in markdown
    .replace(/<\/?(?:article|section|div|span|header|footer|nav|main|aside)[^>]*>/gi, '')
    // Remove placeholder text patterns
    .replace(/^内容\. {2,}$/gm, '')
    .replace(/^Content\. {2,}$/gim, '')
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
  const title = firstLine.replace(/^#+\s*/, '') || 'Untitled Artifact';

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
  return 'No description available.';
}

function generateSlug(title) {
  const timestamp = Date.now();
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '') // Keep alphanumeric, chinese, spaces, hyphens
    .replace(/[\s]+/g, '-')
    .substring(0, 50); // Limit length
  return `${cleanTitle}-${timestamp}`;
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

function generateFrontmatter(title, description) {
  const now = new Date().toISOString().split('T')[0];
  const safeTitle = escapeYamlString(title);
  const safeDescription = escapeYamlString(description);
  return `---
title: "${safeTitle}"
description: "${safeDescription}"
publishDate: ${now}
updateDate: ${now}
keywords: []
seoOptimized: false
---`;
}

async function main() {
  const gistUrl = process.argv[2];

  if (!gistUrl) {
    console.error('Usage: node create-article.mjs "<gist-url>"');
    process.exit(1);
  }

  // Fetch new content from Gist
  console.log('Fetching content from Gist...');
  const rawContent = await fetchGistContent(gistUrl);
  console.log(`Fetched ${rawContent.length} characters`);

  // Extract new title and content
  const { title, content } = extractTitleAndClean(rawContent);
  const description = extractDescription(content);

  console.log(`Title: ${title}`);

  // Generate slug and filename
  const slug = generateSlug(title);
  const filename = `${slug}.md`;
  const filepath = path.join(ARTICLES_DIR, filename);

  // Generate frontmatter
  const frontmatter = generateFrontmatter(title, description);
  const finalContent = `${frontmatter}\n\n${content}`;

  // Write file
  await fs.writeFile(filepath, finalContent, 'utf-8');
  console.log(`Created: ${filepath}`);
  
  // Output filename for GitHub Actions
  console.log(`::set-output name=filename::${filename}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
