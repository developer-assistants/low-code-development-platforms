import { APP_TEMPLATES } from '../data/templates';
import type {
  AppBlueprint,
  ColumnType,
  PlatformBenchmark,
  RowRecord,
  SqlDialect,
  TableColumn,
  TableSchema,
} from '../types';

function cloneBlueprint(bp: AppBlueprint): AppBlueprint {
  return JSON.parse(JSON.stringify(bp)) as AppBlueprint;
}

const KEYWORD_MAP: { id: string; terms: string[] }[] = [
  { id: 'inventory', terms: ['inventory', 'warehouse', 'stock', 'supplier', 'sku', 'product'] },
  { id: 'crm', terms: ['crm', 'deal', 'pipeline', 'sales', 'lead', 'contact'] },
  { id: 'client-portal', terms: ['client portal', 'deliverable', 'invoice', 'agency', 'customer portal'] },
  { id: 'ticketing', terms: ['ticket', 'helpdesk', 'support', 'sla', 'incident', 'issue'] },
  { id: 'admin-panel', terms: ['admin panel', 'audit log', 'feature flag', 'subscription', 'account'] },
  { id: 'employee-management', terms: ['employee', 'hr', 'staff', 'department', 'onboarding', 'pto'] },
  { id: 'approval-workflow', terms: ['approval', 'expense', 'reimbursement', 'purchase request', 'finance'] },
  { id: 'asset-management', terms: ['asset', 'equipment', 'laptop', 'hardware', 'maintenance', 'serial'] },
  { id: 'database-app', terms: ['sql', 'postgres', 'mysql', 'database', 'order', 'crud'] },
  { id: 'excel-to-web', terms: ['excel', 'csv', 'spreadsheet', 'contract', 'renewal'] },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 28) || 'records';
}

export function generateAppFromPrompt(prompt: string): AppBlueprint {
  const normalized = prompt.trim().toLowerCase();
  if (!normalized) {
    return cloneBlueprint(APP_TEMPLATES[0]);
  }

  let bestId: string | null = null;
  let bestScore = 0;

  for (const entry of KEYWORD_MAP) {
    let score = 0;
    for (const term of entry.terms) {
      if (normalized.includes(term)) {
        score += term.includes(' ') ? 3 : 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestId = entry.id;
    }
  }

  if (bestId && bestScore >= 2) {
    const matched = APP_TEMPLATES.find((t) => t.id === bestId);
    if (matched) {
      const bp = cloneBlueprint(matched);
      bp.prompt = prompt.trim();
      return bp;
    }
  }

  // Synthesize a custom database-backed app from arbitrary text
  const words = prompt
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['create', 'build', 'make', 'with', 'system', 'application', 'that', 'this', 'from', 'into'].includes(w.toLowerCase()));

  const entityWord = words[0] ? words[0][0].toUpperCase() + words[0].slice(1).toLowerCase() : 'Record';
  const tableName = slugify(entityWord + 's');

  return {
    id: `custom-${tableName}`,
    slug: `custom-${tableName}`,
    seoQuery: 'custom database app builder',
    name: `${entityWord} Manager`,
    shortName: entityWord,
    summary: `Generated database application for: ${prompt.trim()}`,
    prompt: prompt.trim(),
    primaryTable: tableName,
    tables: [
      {
        name: tableName,
        label: `${entityWord}s`,
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'title', label: `${entityWord} Name`, type: 'text' },
          { name: 'owner', label: 'Owner', type: 'text' },
          { name: 'quantity', label: 'Count', type: 'integer' },
          { name: 'status', label: 'Status', type: 'status', options: ['Active', 'Needs Review', 'Archived'] },
        ],
      },
      {
        name: 'activity_log',
        label: 'Activity Log',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: `${slugify(entityWord)}_id`, label: `${entityWord} ID`, type: 'integer', references: `${tableName}(id)` },
          { name: 'note', label: 'Note', type: 'text' },
          { name: 'logged_at', label: 'Date', type: 'date' },
        ],
      },
    ],
    rows: {
      [tableName]: [
        { id: 1, title: `Primary ${entityWord} A`, owner: 'Operations', quantity: 24, status: 'Active' },
        { id: 2, title: `Regional ${entityWord} B`, owner: 'Finance', quantity: 5, status: 'Needs Review' },
        { id: 3, title: `Legacy ${entityWord} C`, owner: 'Engineering', quantity: 0, status: 'Archived' },
      ],
      activity_log: [
        { id: 1, [`${slugify(entityWord)}_id`]: 1, note: 'Initial record created', logged_at: '2026-11-25' },
      ],
    },
    metrics: [
      { label: `${entityWord}s`, compute: 'total_rows' },
      { label: 'Log entries', compute: 'secondary_count', secondaryTable: 'activity_log' },
      { label: 'Needs review', compute: 'low_alert', alertColumn: 'status', alertMatch: ['Needs Review'] },
    ],
    roles: [
      {
        role: 'Admin',
        description: `Full CRUD permissions on ${tableName} and activity_log.`,
        permissions: {
          [tableName]: { create: true, read: true, update: true, delete: true },
          activity_log: { create: true, read: true, update: true, delete: true },
        },
      },
      {
        role: 'Operator',
        description: `Create and edit ${tableName} records without delete privileges.`,
        permissions: {
          [tableName]: { create: true, read: true, update: true, delete: false },
          activity_log: { create: true, read: true, update: false, delete: false },
        },
      },
      {
        role: 'Viewer',
        description: 'Read-only access for reporting.',
        permissions: {
          [tableName]: { create: false, read: true, update: false, delete: false },
          activity_log: { create: false, read: true, update: false, delete: false },
        },
      },
    ],
    automations: [
      {
        id: 'custom-review-alert',
        name: `Notify team when ${entityWord} needs review`,
        trigger: `After UPDATE on ${tableName}`,
        condition: 'NEW.status = "Needs Review"',
        action: 'POST JSON payload to team webhook',
        webhookUrl: `https://hooks.example.com/${tableName}/review`,
        enabled: true,
      },
    ],
    faqs: [],
  };
}

function sqlTypeFor(col: TableColumn, dialect: SqlDialect): string {
  if (col.type === 'serial') {
    if (dialect === 'postgresql') return 'SERIAL PRIMARY KEY';
    if (dialect === 'mysql') return 'INT AUTO_INCREMENT PRIMARY KEY';
    return 'INTEGER PRIMARY KEY AUTOINCREMENT';
  }
  switch (col.type) {
    case 'integer':
      return 'INTEGER NOT NULL DEFAULT 0';
    case 'numeric':
      return 'NUMERIC(12, 2) NOT NULL DEFAULT 0';
    case 'boolean':
      return dialect === 'sqlite' ? 'INTEGER NOT NULL DEFAULT 0' : 'BOOLEAN NOT NULL DEFAULT FALSE';
    case 'date':
      return dialect === 'sqlite' ? 'TEXT' : 'DATE';
    case 'status':
      return 'VARCHAR(64) NOT NULL';
    case 'text':
    default:
      return dialect === 'mysql' ? 'VARCHAR(255) NOT NULL' : 'TEXT NOT NULL';
  }
}

export function generateSqlSchema(blueprint: AppBlueprint, dialect: SqlDialect): string {
  const header = `-- Generated by OpenForge AI Low-Code Platform (${dialect.toUpperCase()})\n-- Application: ${blueprint.name}\n`;
  const statements = blueprint.tables.map((table) => {
    const colLines = table.columns.map((col) => {
      const base = `  ${col.name} ${sqlTypeFor(col, dialect)}`;
      if (col.references && dialect !== 'mysql') {
        return `${base} REFERENCES ${col.references}`;
      }
      return base;
    });

    if (dialect === 'mysql') {
      for (const col of table.columns) {
        if (col.references) {
          colLines.push(`  FOREIGN KEY (${col.name}) REFERENCES ${col.references}`);
        }
      }
    }

    return `CREATE TABLE ${table.name} (\n${colLines.join(',\n')}\n);`;
  });

  return `${header}\n${statements.join('\n\n')}\n`;
}

export function generateDockerCompose(blueprint: AppBlueprint): string {
  const dbName = slugify(blueprint.name);
  return `# Self-hosted deployment for ${blueprint.name}
# Run: docker compose up -d
services:
  app:
    image: ghcr.io/developer-assistants/openforge-runtime:latest
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://openforge:change_me@db:5432/${dbName}
      APP_SLUG: ${blueprint.slug}
      RBAC_ENABLED: "true"
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: openforge
      POSTGRES_PASSWORD: change_me
      POSTGRES_DB: ${dbName}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro

volumes:
  pgdata:
`;
}

export interface RestEndpointDoc {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  curl: string;
}

export function generateRestEndpoints(blueprint: AppBlueprint): RestEndpointDoc[] {
  const table = blueprint.tables.find((t) => t.name === blueprint.primaryTable) ?? blueprint.tables[0];
  const samplePayload: Record<string, string | number> = {};
  for (const col of table.columns) {
    if (col.primaryKey) continue;
    if (col.type === 'integer' || col.type === 'numeric') samplePayload[col.name] = 10;
    else if (col.type === 'date') samplePayload[col.name] = '2026-12-01';
    else if (col.options && col.options.length > 0) samplePayload[col.name] = col.options[0];
    else samplePayload[col.name] = `Sample ${col.label}`;
  }
  const payloadJson = JSON.stringify(samplePayload);

  return [
    {
      method: 'GET',
      path: `/api/v1/${table.name}`,
      summary: `List ${table.label.toLowerCase()} with pagination and search`,
      curl: `curl -s "https://api.example.com/api/v1/${table.name}?limit=50" \\\n  -H "Authorization: Bearer $API_TOKEN"`,
    },
    {
      method: 'POST',
      path: `/api/v1/${table.name}`,
      summary: `Create a new row in ${table.name}`,
      curl: `curl -s -X POST "https://api.example.com/api/v1/${table.name}" \\\n  -H "Authorization: Bearer $API_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '${payloadJson}'`,
    },
    {
      method: 'PATCH',
      path: `/api/v1/${table.name}/:id`,
      summary: `Update an existing row and evaluate automations`,
      curl: `curl -s -X PATCH "https://api.example.com/api/v1/${table.name}/1" \\\n  -H "Authorization: Bearer $API_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '${payloadJson}'`,
    },
    {
      method: 'DELETE',
      path: `/api/v1/${table.name}/:id`,
      summary: `Delete a row (requires Admin delete permission)`,
      curl: `curl -s -X DELETE "https://api.example.com/api/v1/${table.name}/1" \\\n  -H "Authorization: Bearer $API_TOKEN"`,
    },
  ];
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function inferColumnType(values: string[]): ColumnType {
  const nonEmpty = values.filter((v) => v.length > 0);
  if (nonEmpty.length === 0) return 'text';
  if (nonEmpty.every((v) => /^-?\d+$/.test(v))) return 'integer';
  if (nonEmpty.every((v) => /^-?\d+(\.\d+)?$/.test(v))) return 'numeric';
  if (nonEmpty.every((v) => /^(true|false)$/i.test(v))) return 'boolean';
  if (nonEmpty.every((v) => /^\d{4}-\d{2}-\d{2}$/.test(v))) return 'date';
  return 'text';
}

export function parseCsvToTable(
  csvText: string,
  tableName = 'imported_records',
): { schema: TableSchema; rows: RowRecord[] } {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one data row.');
  }

  const rawHeaders = splitCsvLine(lines[0]);
  const dataMatrix = lines.slice(1).map((line) => splitCsvLine(line));

  const columns: TableColumn[] = [
    { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
  ];

  const colNames: string[] = [];
  for (let idx = 0; idx < rawHeaders.length; idx += 1) {
    const label = rawHeaders[idx] || `Column ${idx + 1}`;
    const name = slugify(label);
    if (name === 'id') continue;
    colNames.push(name);
    const sampleValues = dataMatrix.map((row) => row[idx] ?? '');
    const inferred = inferColumnType(sampleValues);
    const isStatus = name === 'status' || name === 'stage';
    const distinct = Array.from(new Set(sampleValues.filter(Boolean)));
    columns.push({
      name,
      label,
      type: isStatus ? 'status' : inferred,
      options: isStatus ? distinct : undefined,
    });
  }

  const rows: RowRecord[] = dataMatrix.map((rawRow, rowIndex) => {
    const rec: RowRecord = { id: rowIndex + 1 };
    let headerIdx = 0;
    for (let i = 0; i < rawHeaders.length; i += 1) {
      const name = slugify(rawHeaders[i] || `Column ${i + 1}`);
      if (name === 'id') continue;
      const col = columns[headerIdx + 1];
      const rawVal = rawRow[i] ?? '';
      if (col.type === 'integer') rec[col.name] = Number.parseInt(rawVal, 10) || 0;
      else if (col.type === 'numeric') rec[col.name] = Number.parseFloat(rawVal) || 0;
      else if (col.type === 'boolean') rec[col.name] = rawVal.toLowerCase() === 'true';
      else rec[col.name] = rawVal;
      headerIdx += 1;
    }
    return rec;
  });

  const cleanName = slugify(tableName);
  return {
    schema: {
      name: cleanName,
      label: cleanName.replace(/_/g, ' '),
      columns,
    },
    rows,
  };
}

export function exportRowsToCsv(columns: TableColumn[], rows: RowRecord[]): string {
  const escapeCell = (val: string | number | boolean | undefined): string => {
    const str = String(val ?? '');
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => escapeCell(row[c.name])).join(','));
  return [header, ...body].join('\n');
}

export function totalBuildMinutes(platform: PlatformBenchmark): number {
  const m = platform.buildMinutes;
  return m.schema + m.crudUi + m.rbac + m.automations + m.restApi;
}

export function calculatePlatformCost(
  platform: PlatformBenchmark,
  seats: number,
  deployment: 'cloud' | 'self-hosted',
): { monthlyUsd: number; annualUsd: number } {
  const safeSeats = Math.max(1, seats);
  if (deployment === 'self-hosted') {
    if (safeSeats <= platform.pricing.selfHostFreeSeats || platform.pricing.selfHostPerUser === 0) {
      return { monthlyUsd: 0, annualUsd: 0 };
    }
    const monthlyUsd = safeSeats * platform.pricing.selfHostPerUser;
    return { monthlyUsd, annualUsd: monthlyUsd * 12 };
  }

  // Cloud mode: flat workspace pricing if end-user fee is 0 and builder fee is workspace tier (OpenForge/Directus)
  if (platform.id === 'openforge') {
    const monthlyUsd = safeSeats <= 5 ? 19 : safeSeats <= 25 ? 49 : 99;
    return { monthlyUsd, annualUsd: monthlyUsd * 12 };
  }
  if (platform.id === 'directus') {
    const monthlyUsd = safeSeats <= 10 ? 15 : safeSeats <= 50 ? 99 : 299;
    return { monthlyUsd, annualUsd: monthlyUsd * 12 };
  }
  if (platform.id === 'refine') {
    return { monthlyUsd: 0, annualUsd: 0 };
  }

  const builders = Math.max(1, Math.round(safeSeats * 0.2));
  const endUsers = Math.max(0, safeSeats - builders);
  const monthlyUsd =
    builders * platform.pricing.cloudPerBuilder + endUsers * platform.pricing.cloudPerEndUser;
  return { monthlyUsd, annualUsd: monthlyUsd * 12 };
}
