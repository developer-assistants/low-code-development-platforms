import type { ComparisonGuide } from '../types';

export const COMPARISON_GUIDES: ComparisonGuide[] = [
  {
    slug: 'appsmith-vs-tooljet',
    keyword: 'appsmith vs tooljet',
    title: 'Appsmith vs ToolJet vs OpenForge: Inventory App Benchmark',
    description: 'Side-by-side benchmark of Appsmith, ToolJet, and OpenForge building the same PostgreSQL inventory system with RBAC and low-stock webhooks.',
    intro: 'Both Appsmith and ToolJet use drag-and-drop widget canvases connected to SQL queries. We built the same four-table inventory system on both tools and compared build time, seat pricing, RBAC gates, and exportability against OpenForge.',
    focusPlatformIds: ['openforge', 'appsmith', 'tooljet'],
    criteria: [
      { label: 'License and self-hosting', finding: 'Appsmith CE uses Apache 2.0, ToolJet CE uses AGPLv3, and OpenForge uses MIT. All three start with Docker Compose.' },
      { label: 'RBAC paywall', finding: 'Granular table and page permissions sit on paid Business or Enterprise plans in Appsmith and ToolJet. OpenForge includes per-table CRUD roles in MIT.' },
      { label: 'Code portability', finding: 'Appsmith and ToolJet export runtime JSON bound to their own servers. OpenForge exports standard SQL DDL, REST endpoints, and Docker Compose.' },
    ],
    faqs: [
      { question: 'Which is faster to deploy on a single VPS: Appsmith or ToolJet?', answer: 'Both deploy via Docker Compose in under 10 minutes, though ToolJet requires a separate PostgreSQL container unless you use its bundled setup, and Appsmith recommends at least 4 GB RAM.' },
      { question: 'When should a team pick Appsmith over ToolJet?', answer: 'Pick Appsmith when you prefer Apache 2.0 licensing and Git-backed JS widget bindings. Pick ToolJet when you want a built-in database table editor out of the box.' },
    ],
  },
  {
    slug: 'retool-alternative',
    keyword: 'retool alternative',
    title: 'Open-Source Retool Alternatives with Zero Per-Seat Lock-In',
    description: 'Compare self-hosted open-source Retool alternatives (OpenForge, Appsmith, ToolJet, Budibase, Directus) by seat cost, RBAC, and SQL portability.',
    intro: 'Retool is fast for engineering teams building internal tools, but per-builder and per-end-user pricing climbs quickly once operations staff join. Self-hosted open-source alternatives cut recurring seat fees and keep data inside your own VPC.',
    focusPlatformIds: ['openforge', 'retool', 'appsmith', 'budibase'],
    criteria: [
      { label: '25-seat monthly cost', finding: 'Retool Team and Business plans bill every builder and end user. Self-hosted OpenForge and Directus have $0 per-seat fees.' },
      { label: 'Vendor lock-in', finding: 'Retool apps run only inside Retool runtime. Exporting SQL schemas and React/Docker source removes platform lock-in.' },
      { label: 'Time to first CRUD screen', finding: 'Schema-driven builders generate tables, forms, and filters in minutes instead of wiring each table widget manually.' },
    ],
    faqs: [
      { question: 'What is the closest open-source alternative to Retool?', answer: 'Appsmith and ToolJet match Retool widget canvas workflows most closely. OpenForge and Budibase are faster when your app is primarily SQL CRUD, forms, and role permissions.' },
    ],
  },
  {
    slug: 'open-source-low-code-platform',
    keyword: 'open source low code platform',
    title: 'Open-Source Low-Code Platforms Compared (MIT, Apache 2.0, AGPLv3)',
    description: 'Technical comparison of open-source low-code platforms by license, self-hosting requirements, RBAC, and source export.',
    intro: 'Open-source low-code tools differ sharply in licensing and what stays free when self-hosted. Always check whether granular RBAC, SSO, and audit logs live in the community edition or behind an enterprise key.',
    focusPlatformIds: ['openforge', 'appsmith', 'tooljet', 'budibase', 'nocodb', 'directus', 'refine'],
    criteria: [
      { label: 'Permissive licenses', finding: 'OpenForge and Refine use MIT; Appsmith CE uses Apache 2.0. ToolJet and NocoDB use AGPLv3; Budibase uses GPLv3; Directus uses BSL 1.1.' },
      { label: 'Database ownership', finding: 'NocoDB, Directus, and OpenForge operate directly on standard PostgreSQL or MySQL tables without opaque storage wrappers.' },
    ],
    faqs: [
      { question: 'Which open-source low-code platform lets you export source code?', answer: 'OpenForge exports SQL DDL, Docker Compose, and standard React templates. Refine is a code-first MIT React framework from the start.' },
    ],
  },
  {
    slug: 'internal-tool-builder',
    keyword: 'internal tool builder',
    title: 'Internal Tool Builder: Build Admin Panels and Ops Apps in Minutes',
    description: 'Build internal tools over PostgreSQL and MySQL with AI schema generation, CRUD forms, RBAC, and webhook automations.',
    intro: 'Internal tools such as warehouse trackers, customer refund panels, and approval queues share 80% of the same structure: SQL tables, filterable grids, validated forms, and role checks.',
    focusPlatformIds: ['openforge', 'retool', 'appsmith', 'budibase'],
    criteria: [
      { label: 'Schema to CRUD speed', finding: 'Generating tables, foreign keys, and CRUD forms from a specification cuts initial setup from hours to minutes.' },
      { label: 'Role-based guardrails', finding: 'Warehouse and support staff need update access without delete privileges; per-table RBAC enforces that boundary.' },
    ],
    faqs: [
      { question: 'How is an internal tool builder different from a website builder?', answer: 'Internal tool builders connect directly to SQL databases and REST APIs, enforce staff roles, and focus on data tables, forms, and workflows.' },
    ],
  },
  {
    slug: 'self-hosted-low-code-platform',
    keyword: 'self hosted low code platform',
    title: 'Self-Hosted Low-Code Platforms for Docker and Private VPCs',
    description: 'Deploy a low-code platform on your own server with Docker Compose, PostgreSQL, and zero external SaaS dependencies.',
    intro: 'Regulated teams and cost-conscious startups run low-code tools inside private networks so customer records and database credentials never leave their infrastructure.',
    focusPlatformIds: ['openforge', 'appsmith', 'tooljet', 'directus', 'nocodb'],
    criteria: [
      { label: 'Single-command Docker startup', finding: 'OpenForge, NocoDB, Directus, Appsmith, and ToolJet all provide Docker Compose configurations.' },
      { label: 'Bring your own API keys', finding: 'With self-hosted AI generation, you supply your own model key or run local models without paying SaaS markups.' },
    ],
    faqs: [
      { question: 'Can I run a self-hosted low-code platform completely offline?', answer: 'Yes. Once built with Docker, the CRUD app, PostgreSQL database, RBAC, and REST endpoints run without internet access.' },
    ],
  },
  {
    slug: 'crud-generator',
    keyword: 'crud generator',
    title: 'CRUD Generator for PostgreSQL, MySQL, and SQLite',
    description: 'Generate working create, read, update, and delete screens, SQL migrations, and REST endpoints from plain text or CSV.',
    intro: 'Writing repetitive CRUD forms, validation schemas, and REST handlers slows down every business app. A schema-aware CRUD generator builds the tables, forms, and API routes together.',
    focusPlatformIds: ['openforge', 'budibase', 'directus', 'refine'],
    criteria: [
      { label: 'Typed forms and filters', finding: 'Status enums become dropdowns, integer fields enforce numeric input, and search filters run immediately.' },
      { label: 'Instant REST routes', finding: 'Every table receives GET, POST, PATCH, and DELETE routes with copyable curl commands.' },
    ],
    faqs: [
      { question: 'Can I edit generated fields and forms after creation?', answer: 'Yes. You can add records, edit values inline, toggle role permissions, and export the updated SQL schema at any time.' },
    ],
  },
  {
    slug: 'sql-gui-builder',
    keyword: 'sql gui builder',
    title: 'SQL GUI Builder: Turn PostgreSQL and MySQL Tables into Web Apps',
    description: 'Give non-technical teams a safe web GUI over PostgreSQL and MySQL without exposing raw SQL consoles.',
    intro: 'Giving operations staff raw pgAdmin or phpMyAdmin credentials risks accidental drops and broken foreign keys. A SQL GUI builder wraps your tables in role-checked forms and audit-friendly workflows.',
    focusPlatformIds: ['openforge', 'nocodb', 'directus', 'appsmith'],
    criteria: [
      { label: 'No raw SQL exposure', finding: 'End users filter, add, and update rows through validated controls while admins keep full SQL DDL visibility.' },
      { label: 'Multi-dialect DDL', finding: 'Switch between PostgreSQL, MySQL, and SQLite output to match your production database engine.' },
    ],
    faqs: [
      { question: 'Does a SQL GUI builder work with existing foreign keys?', answer: 'Yes. Foreign-key references are preserved in the schema inspector and exported DDL.' },
    ],
  },
];
