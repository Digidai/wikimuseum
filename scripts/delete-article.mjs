#!/usr/bin/env node

/**
 * Delete Article Script
 * Finds and deletes an article by filename (slug)
 */

import fs from 'fs/promises';
import path from 'path';

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');

async function findArticleByFilename(filename) {
  // Normalize filename: remove .md extension if provided
  let targetFilename = filename.trim();
  if (!targetFilename.endsWith('.md')) {
    targetFilename += '.md';
  }

  const filepath = path.join(ARTICLES_DIR, targetFilename);

  try {
    await fs.access(filepath);
    return { filepath, filename: targetFilename };
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

async function main() {
  const filename = process.argv[2];

  if (!filename) {
    console.error('Usage: node delete-article.mjs "<article-filename>"');
    console.error('Example: node delete-article.mjs "google大模型深度研究报告-技术演进与行业影响-1764071590944"');
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
  await fs.unlink(article.filepath);
  console.log(`Deleted: ${article.filepath}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
