export type SqlDialect = 'postgresql' | 'mysql' | 'sqlite';

export type ColumnType = 'serial' | 'text' | 'integer' | 'numeric' | 'boolean' | 'date' | 'status';

export interface TableColumn {
  name: string;
  label: string;
  type: ColumnType;
  primaryKey?: boolean;
  nullable?: boolean;
  references?: string;
  options?: string[];
}

export interface TableSchema {
  name: string;
  label: string;
  columns: TableColumn[];
}

export interface RolePermission {
  role: string;
  description: string;
  permissions: Record<
    string,
    {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    }
  >;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  webhookUrl: string;
  enabled: boolean;
}

export interface MetricConfig {
  label: string;
  compute: 'total_rows' | 'secondary_count' | 'low_alert';
  secondaryTable?: string;
  alertColumn?: string;
  alertMatch?: string[];
  baselineCount?: number;
}

export type RowRecord = Record<string, string | number | boolean>;

export interface AppBlueprint {
  id: string;
  slug: string;
  seoQuery: string;
  name: string;
  shortName: string;
  summary: string;
  prompt: string;
  primaryTable: string;
  tables: TableSchema[];
  rows: Record<string, RowRecord[]>;
  metrics: MetricConfig[];
  roles: RolePermission[];
  automations: AutomationRule[];
  faqs: { question: string; answer: string }[];
}

export interface PlatformBenchmark {
  id: string;
  name: string;
  category: string;
  license: string;
  openSource: boolean;
  selfHostCommand: string;
  website: string;
  buildMinutes: {
    schema: number;
    crudUi: number;
    rbac: number;
    automations: number;
    restApi: number;
  };
  pricing: {
    cloudPerBuilder: number;
    cloudPerEndUser: number;
    selfHostFreeSeats: number;
    selfHostPerUser: number;
    note: string;
  };
  rbacSupport: string;
  dataExport: string;
  codeExport: string;
  lockInRisk: 'Low' | 'Medium' | 'High';
  databases: string[];
  tradeoff: string;
}

export interface ComparisonGuide {
  slug: string;
  keyword: string;
  title: string;
  description: string;
  intro: string;
  focusPlatformIds: string[];
  criteria: { label: string; finding: string }[];
  faqs: { question: string; answer: string }[];
}
