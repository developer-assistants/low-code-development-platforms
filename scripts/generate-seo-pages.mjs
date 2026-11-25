import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const BASE_PATH = '/low-code-development-platforms';
const BASE_URL = 'https://developer-assistants.github.io/low-code-development-platforms';
const TODAY = new Date().toISOString().slice(0, 10);

const cacheDir = path.resolve(ROOT_DIR, 'node_modules/.cache');
fs.mkdirSync(cacheDir, { recursive: true });
const bundleFile = path.join(cacheDir, 'seo-ssg-bundle.mjs');

const entryCode = `
export { APP_TEMPLATES } from ${JSON.stringify(path.resolve(ROOT_DIR, 'src/data/templates.ts'))};
export { LOW_CODE_PLATFORMS, BENCHMARK_SPEC } from ${JSON.stringify(path.resolve(ROOT_DIR, 'src/data/platforms.ts'))};
export { COMPARISON_GUIDES } from ${JSON.stringify(path.resolve(ROOT_DIR, 'src/data/comparisons.ts'))};
export { generateSqlSchema, totalBuildMinutes, calculatePlatformCost } from ${JSON.stringify(path.resolve(ROOT_DIR, 'src/engine/generator.ts'))};
`;

await esbuild.build({
  stdin: {
    contents: entryCode,
    resolveDir: ROOT_DIR,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: bundleFile,
});

const {
  APP_TEMPLATES,
  LOW_CODE_PLATFORMS,
  BENCHMARK_SPEC,
  COMPARISON_GUIDES,
  generateSqlSchema,
  totalBuildMinutes,
  calculatePlatformCost,
} = await import(pathToFileURL(bundleFile).href);

const baseHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function replaceMeta(html, { title, description, canonical, ldJson, bodyHtml }) {
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  out = out.replace(
    /<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/>/,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/>/,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
  );
  out = out.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${JSON.stringify(ldJson)}</script>`,
  );
  out = out.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
  return out;
}

const sitemapEntries = [];

function writeRoute(routePath, pageData) {
  const cleanRel = routePath.replace(/^\/+|\/+$/g, '');
  const targetDir = cleanRel ? path.join(DIST_DIR, cleanRel) : DIST_DIR;
  fs.mkdirSync(targetDir, { recursive: true });
  const canonical = cleanRel ? `${BASE_URL}/${cleanRel}/` : `${BASE_URL}/`;
  const html = replaceMeta(baseHtml, { ...pageData, canonical });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
  sitemapEntries.push({
    url: canonical,
    priority: cleanRel ? '0.8' : '1.0',
  });
}

// 1. Home page
const benchmarkRowsHtml = LOW_CODE_PLATFORMS.map((p) => {
  const mins = totalBuildMinutes(p);
  const cost25 = calculatePlatformCost(p, 25, 'cloud');
  return `<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.license)}</td><td>${mins} min</td><td>$${cost25.monthlyUsd}/mo</td><td>${escapeHtml(p.lockInRisk)}</td></tr>`;
}).join('');

const templateLinksHtml = APP_TEMPLATES.map(
  (t) => `<li><a href="${BASE_PATH}/templates/${t.slug}/">${escapeHtml(t.name)} (${escapeHtml(t.seoQuery)})</a></li>`,
).join('');

const compareLinksHtml = COMPARISON_GUIDES.map(
  (g) => `<li><a href="${BASE_PATH}/compare/${g.slug}/">${escapeHtml(g.title)}</a></li>`,
).join('');

writeRoute('/', {
  title: 'Low-Code Development Platforms: AI Database App Builder & Benchmark (2026)',
  description:
    'Open-source AI low-code development platform and database app builder. Generate SQL schemas, CRUD UI, RBAC, automations, REST API, and Docker exports, plus a reproducible benchmark against Appsmith, ToolJet, and Retool.',
  ldJson: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'OpenForge AI Low-Code Platform and Benchmark',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web, Docker',
        url: `${BASE_URL}/`,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` }],
      },
    ],
  },
  bodyHtml: `<main class="container" style="padding-block:40px">
    <h1>Open-source AI low-code platform</h1>
    <p>Generate PostgreSQL, MySQL, and SQLite applications from plain text with CRUD interfaces, role permissions, automations, REST APIs, and Docker self-hosting.</p>
    <h2>Reproducible Inventory App Benchmark</h2>
    <table><thead><tr><th>Platform</th><th>License</th><th>Build Time</th><th>Cloud (25 users)</th><th>Lock-In</th></tr></thead><tbody>${benchmarkRowsHtml}</tbody></table>
    <h2>10 Application Templates</h2><ul>${templateLinksHtml}</ul>
    <h2>Platform Comparisons</h2><ul>${compareLinksHtml}</ul>
  </main>`,
});

// 2. 10 Application Template pages
for (const tpl of APP_TEMPLATES) {
  const sql = generateSqlSchema(tpl, 'postgresql');
  const faqEntities = (tpl.faqs || []).map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  }));
  const graph = [
    {
      '@type': 'SoftwareApplication',
      name: `${tpl.name} (${tpl.seoQuery})`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, Docker',
      url: `${BASE_URL}/templates/${tpl.slug}/`,
      description: tpl.summary,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Low-Code Platforms', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: tpl.name, item: `${BASE_URL}/templates/${tpl.slug}/` },
      ],
    },
  ];
  if (faqEntities.length > 0) {
    graph.push({ '@type': 'FAQPage', mainEntity: faqEntities });
  }

  writeRoute(`/templates/${tpl.slug}`, {
    title: `${tpl.name} | Open-Source ${tpl.seoQuery} | OpenForge`,
    description: `${tpl.summary} Export PostgreSQL/MySQL DDL, CRUD UI, RBAC, REST API, and Docker Compose.`,
    ldJson: { '@context': 'https://schema.org', '@graph': graph },
    bodyHtml: `<main class="container" style="padding-block:40px">
      <p><a href="${BASE_PATH}/">Back to OpenForge AI Low-Code Platform</a></p>
      <h1>${escapeHtml(tpl.name)} (${escapeHtml(tpl.seoQuery)})</h1>
      <p>${escapeHtml(tpl.summary)}</p>
      <h2>Default Prompt</h2><p>${escapeHtml(tpl.prompt)}</p>
      <h2>PostgreSQL Schema</h2><pre>${escapeHtml(sql)}</pre>
    </main>`,
  });
}

// 3. 7 Niche & Comparison pages
for (const guide of COMPARISON_GUIDES) {
  const focused = LOW_CODE_PLATFORMS.filter((p) => guide.focusPlatformIds.includes(p.id));
  const rowsHtml = focused
    .map((p) => {
      const mins = totalBuildMinutes(p);
      const cost25 = calculatePlatformCost(p, 25, 'cloud');
      return `<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.license)}</td><td>${mins} min</td><td>$${cost25.monthlyUsd}/mo</td><td>${escapeHtml(p.rbacSupport)}</td><td>${escapeHtml(p.lockInRisk)}</td></tr>`;
    })
    .join('');

  const criteriaHtml = guide.criteria
    .map((c) => `<li><strong>${escapeHtml(c.label)}:</strong> ${escapeHtml(c.finding)}</li>`)
    .join('');

  const faqEntities = guide.faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  }));

  writeRoute(`/compare/${guide.slug}`, {
    title: `${guide.title} (2026) | OpenForge`,
    description: guide.description,
    ldJson: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: guide.title,
          description: guide.description,
          dateModified: TODAY,
          url: `${BASE_URL}/compare/${guide.slug}/`,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Low-Code Platforms', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: guide.title, item: `${BASE_URL}/compare/${guide.slug}/` },
          ],
        },
        { '@type': 'FAQPage', mainEntity: faqEntities },
      ],
    },
    bodyHtml: `<main class="container" style="padding-block:40px">
      <p><a href="${BASE_PATH}/">Back to OpenForge AI Low-Code Platform</a></p>
      <h1>${escapeHtml(guide.title)}</h1>
      <p>${escapeHtml(guide.intro)}</p>
      <h2>Benchmark Comparison (${escapeHtml(BENCHMARK_SPEC.appName)})</h2>
      <table><thead><tr><th>Platform</th><th>License</th><th>Build Time</th><th>Cloud (25 users)</th><th>RBAC</th><th>Lock-In</th></tr></thead><tbody>${rowsHtml}</tbody></table>
      <h2>Key Findings</h2><ul>${criteriaHtml}</ul>
    </main>`,
  });
}

// 4. sitemap.xml
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');

// 5. robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt, 'utf8');

// 6. llms.txt
const llmsTxt = `# OpenForge Low-Code Development Platforms & AI Database App Builder

> Open-source (MIT) AI database app builder and reproducible benchmark comparing OpenForge, Appsmith, ToolJet, Retool, Budibase, NocoDB, Directus, and Refine on an identical PostgreSQL inventory management application.

## Live Workbench
- Home: ${BASE_URL}/
- Repository: https://github.com/developer-assistants/low-code-development-platforms

## 10 Runnable SQL Application Templates
${APP_TEMPLATES.map((t) => `- [${t.name} (${t.seoQuery})](${BASE_URL}/templates/${t.slug}/): ${t.summary}`).join('\n')}

## Platform Comparison Guides
${COMPARISON_GUIDES.map((g) => `- [${g.title}](${BASE_URL}/compare/${g.slug}/): ${g.description}`).join('\n')}
`;
fs.writeFileSync(path.join(DIST_DIR, 'llms.txt'), llmsTxt, 'utf8');
fs.writeFileSync(path.join(ROOT_DIR, 'llms.txt'), llmsTxt, 'utf8');

console.log(`Generated ${sitemapEntries.length} SEO routes, sitemap.xml, robots.txt, and llms.txt.`);
