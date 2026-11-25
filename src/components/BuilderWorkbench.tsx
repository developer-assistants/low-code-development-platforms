import { useMemo, useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Database,
  Download,
  Play,
  Plus,
  Shield,
  Sparkles,
  Table2,
  Trash2,
  Upload,
  Webhook,
  Zap,
} from 'lucide-react';
import { APP_TEMPLATES } from '../data/templates';
import {
  exportRowsToCsv,
  generateAppFromPrompt,
  generateDockerCompose,
  generateRestEndpoints,
  generateSqlSchema,
  parseCsvToTable,
} from '../engine/generator';
import type { AppBlueprint, RowRecord, SqlDialect } from '../types';

type TabId = 'crud' | 'database' | 'permissions' | 'automations' | 'api' | 'export';

interface Props {
  blueprint: AppBlueprint;
  onBlueprintChange: (bp: AppBlueprint) => void;
}

const SAMPLE_CSV = `Product,SKU,Stock,Status
Ergonomic Mouse,MOU-112,42,In stock
Webcam 4K,CAM-404,3,Low stock
Laptop Stand,STD-209,0,Out of stock`;

export function BuilderWorkbench({ blueprint, onBlueprintChange }: Props) {
  const [promptInput, setPromptInput] = useState(blueprint.prompt);
  const [activeTab, setActiveTab] = useState<TabId>('crud');
  const [activeTableName, setActiveTableName] = useState(blueprint.primaryTable);
  const [activeRoleName, setActiveRoleName] = useState(blueprint.roles[0]?.role ?? 'Admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [sqlDialect, setSqlDialect] = useState<SqlDialect>('postgresql');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [automationLog, setAutomationLog] = useState<string | null>(null);

  const activeTable = useMemo(() => {
    return blueprint.tables.find((t) => t.name === activeTableName) ?? blueprint.tables[0];
  }, [blueprint, activeTableName]);

  const activeRole = useMemo(() => {
    return blueprint.roles.find((r) => r.role === activeRoleName) ?? blueprint.roles[0];
  }, [blueprint, activeRoleName]);

  const tablePerms = activeRole?.permissions[activeTable.name] ?? {
    create: true,
    read: true,
    update: true,
    delete: true,
  };

  const rows = blueprint.rows[activeTable.name] ?? [];

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q)),
    );
  }, [rows, searchQuery]);

  const computedMetrics = useMemo(() => {
    const primaryRows = blueprint.rows[blueprint.primaryTable] ?? [];
    return blueprint.metrics.map((m) => {
      if (m.compute === 'total_rows') {
        return { label: m.label, value: primaryRows.length, isAlert: false };
      }
      if (m.compute === 'secondary_count' && m.secondaryTable) {
        const sec = blueprint.rows[m.secondaryTable] ?? [];
        return { label: m.label, value: sec.length, isAlert: false };
      }
      if (m.compute === 'low_alert' && m.alertColumn && m.alertMatch) {
        const count = primaryRows.filter((r) =>
          m.alertMatch!.includes(String(r[m.alertColumn!] ?? '')),
        ).length;
        return { label: m.label, value: count, isAlert: count > 0 };
      }
      return { label: m.label, value: 0, isAlert: false };
    });
  }, [blueprint]);

  const sqlCode = useMemo(() => generateSqlSchema(blueprint, sqlDialect), [blueprint, sqlDialect]);
  const dockerCompose = useMemo(() => generateDockerCompose(blueprint), [blueprint]);
  const restEndpoints = useMemo(() => generateRestEndpoints(blueprint), [blueprint]);

  function handleGenerate(text: string) {
    const next = generateAppFromPrompt(text);
    onBlueprintChange(next);
    setPromptInput(next.prompt);
    setActiveTableName(next.primaryTable);
    setActiveRoleName(next.roles[0]?.role ?? 'Admin');
    setSearchQuery('');
    setShowAddForm(false);
    setShowCsvImport(false);
    setAutomationLog(null);
  }

  function handleCopy(key: string, text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1600);
  }

  function handleDownload(filename: string, content: string, mime = 'text/plain') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!tablePerms.create) return;

    const currentRows = blueprint.rows[activeTable.name] ?? [];
    const maxId = currentRows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0);
    const rec: RowRecord = { id: maxId + 1 };

    for (const col of activeTable.columns) {
      if (col.primaryKey) continue;
      const raw = newRecord[col.name] ?? '';
      if (col.type === 'integer') rec[col.name] = Number.parseInt(raw, 10) || 0;
      else if (col.type === 'numeric') rec[col.name] = Number.parseFloat(raw) || 0;
      else if (col.type === 'status') rec[col.name] = raw || col.options?.[0] || 'Active';
      else rec[col.name] = raw || `New ${col.label}`;
    }

    onBlueprintChange({
      ...blueprint,
      rows: {
        ...blueprint.rows,
        [activeTable.name]: [rec, ...currentRows],
      },
    });
    setNewRecord({});
    setShowAddForm(false);
  }

  function handleDeleteRow(id: string | number | boolean) {
    if (!tablePerms.delete) return;
    const currentRows = blueprint.rows[activeTable.name] ?? [];
    onBlueprintChange({
      ...blueprint,
      rows: {
        ...blueprint.rows,
        [activeTable.name]: currentRows.filter((r) => r.id !== id),
      },
    });
  }

  function handleCycleStatus(rowId: string | number | boolean, colName: string, options: string[]) {
    if (!tablePerms.update || options.length === 0) return;
    const currentRows = blueprint.rows[activeTable.name] ?? [];
    const updated = currentRows.map((r) => {
      if (r.id !== rowId) return r;
      const idx = options.indexOf(String(r[colName]));
      const nextStatus = options[(idx + 1) % options.length];
      return { ...r, [colName]: nextStatus };
    });
    onBlueprintChange({
      ...blueprint,
      rows: {
        ...blueprint.rows,
        [activeTable.name]: updated,
      },
    });
  }

  function handleImportCsv(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { schema, rows: importedRows } = parseCsvToTable(csvText, 'csv_import');
      const existingTables = blueprint.tables.filter((t) => t.name !== schema.name);
      const updatedRoles = blueprint.roles.map((r) => ({
        ...r,
        permissions: {
          ...r.permissions,
          [schema.name]: {
            create: r.role.toLowerCase().includes('admin'),
            read: true,
            update: !r.role.toLowerCase().includes('viewer'),
            delete: r.role.toLowerCase().includes('admin'),
          },
        },
      }));
      onBlueprintChange({
        ...blueprint,
        tables: [schema, ...existingTables],
        rows: {
          ...blueprint.rows,
          [schema.name]: importedRows,
        },
        roles: updatedRoles,
      });
      setActiveTableName(schema.name);
      setShowCsvImport(false);
      setCsvError(null);
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : 'Unable to parse CSV.');
    }
  }

  function handleTogglePermission(
    roleName: string,
    tableName: string,
    perm: 'create' | 'read' | 'update' | 'delete',
  ) {
    const updatedRoles = blueprint.roles.map((r) => {
      if (r.role !== roleName) return r;
      const current = r.permissions[tableName] ?? {
        create: false,
        read: true,
        update: false,
        delete: false,
      };
      return {
        ...r,
        permissions: {
          ...r.permissions,
          [tableName]: {
            ...current,
            [perm]: !current[perm],
          },
        },
      };
    });
    onBlueprintChange({ ...blueprint, roles: updatedRoles });
  }

  function handleTestAutomation(ruleId: string) {
    const rule = blueprint.automations.find((a) => a.id === ruleId);
    if (!rule) return;
    const sampleRow = (blueprint.rows[blueprint.primaryTable] ?? [])[0] ?? {};
    const payload = {
      event: rule.trigger,
      rule: rule.name,
      condition_matched: rule.condition,
      webhook: rule.webhookUrl,
      timestamp: new Date().toISOString(),
      record: sampleRow,
      http_status: 200,
    };
    setAutomationLog(JSON.stringify(payload, null, 2));
  }

  function renderStatusClass(val: string): string {
    const lower = val.toLowerCase();
    if (lower.includes('out') || lower.includes('overdue') || lower.includes('escalated') || lower.includes('suspended') || lower.includes('rejected') || lower.includes('risk')) {
      return 'status-inline status-inline--err';
    }
    if (lower.includes('low') || lower.includes('pending') || lower.includes('review') || lower.includes('expiring') || lower.includes('repair') || lower.includes('flagged') || lower.includes('past due')) {
      return 'status-inline status-inline--warn';
    }
    return 'status-inline';
  }

  return (
    <section id="builder" className="section">
      <div className="container">
        <div className="section__head">
          <div>
            <h2 className="section__title">AI App Builder</h2>
            <p className="section__sub">
              Describe a business workflow in plain English or pick one of the 10 templates below. Every app generates a relational SQL schema, CRUD interface, role permissions, automations, REST API, and Docker deployment files.
            </p>
          </div>
        </div>

        <div className="cut prompt-shell">
          <label htmlFor="builder-prompt" className="label">
            What do you want to build?
          </label>
          <form
            className="prompt-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate(promptInput);
            }}
          >
            <textarea
              id="builder-prompt"
              className="prompt-input"
              rows={2}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Create an inventory management system with suppliers, stock tracking, employee roles and low stock notifications."
            />
            <button type="submit" className="key key--primary">
              <Sparkles size={16} aria-hidden="true" />
              Generate App
            </button>
          </form>

          <div className="template-chips" aria-label="Quick app templates">
            {APP_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className={`key key--sm ${blueprint.id === tpl.id ? 'key--pressed' : ''}`}
                onClick={() => handleGenerate(tpl.prompt)}
              >
                {tpl.shortName}
              </button>
            ))}
          </div>
        </div>

        <div className="cut workbench" aria-live="polite">
          <div className="workbench__bar">
            <div className="workbench__title-wrap">
              <h3 className="workbench__title">{blueprint.name}</h3>
              <span className="status-inline">
                <Check size={14} aria-hidden="true" />
                Ready ({blueprint.tables.length} tables)
              </span>
            </div>

            <div className="table-toolbar__right">
              <label htmlFor="role-preview-select" className="label">
                Preview as role:
              </label>
              <select
                id="role-preview-select"
                className="field-select"
                value={activeRole?.role ?? ''}
                onChange={(e) => setActiveRoleName(e.target.value)}
              >
                {blueprint.roles.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="workbench__tabs" role="tablist" aria-label="Generated application views">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'crud'}
              className={`key key--sm ${activeTab === 'crud' ? 'key--pressed' : ''}`}
              onClick={() => setActiveTab('crud')}
            >
              <Table2 size={14} aria-hidden="true" />
              App &amp; Forms
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'database'}
              className={`key key--sm ${activeTab === 'database' ? 'key--pressed' : ''}`}
              onClick={() => setActiveTab('database')}
            >
              <Database size={14} aria-hidden="true" />
              Database
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'permissions'}
              className={`key key--sm ${activeTab === 'permissions' ? 'key--pressed' : ''}`}
              onClick={() => setActiveTab('permissions')}
            >
              <Shield size={14} aria-hidden="true" />
              Permissions
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'automations'}
              className={`key key--sm ${activeTab === 'automations' ? 'key--pressed' : ''}`}
              onClick={() => setActiveTab('automations')}
            >
              <Zap size={14} aria-hidden="true" />
              Automations
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'api'}
              className={`key key--sm ${activeTab === 'api' ? 'key--pressed' : ''}`}
              onClick={() => setActiveTab('api')}
            >
              <Webhook size={14} aria-hidden="true" />
              REST API
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'export'}
              className={`key key--sm ${activeTab === 'export' ? 'key--pressed' : ''}`}
              onClick={() => setActiveTab('export')}
            >
              <Code2 size={14} aria-hidden="true" />
              Export &amp; Docker
            </button>
          </div>

          <div className="workbench__body">
            {activeTab === 'crud' && (
              <div>
                <div className="metrics-row">
                  {computedMetrics.map((m) => (
                    <div key={m.label} className="metric-box">
                      <div className="label">{m.label}</div>
                      <div className={`metric-box__value ${m.isAlert ? 'metric-box__value--warn' : ''}`}>
                        {m.value.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="table-toolbar">
                  <div className="table-toolbar__left">
                    <div className="chip-tray" role="group" aria-label="Select table">
                      {blueprint.tables.map((t) => (
                        <button
                          key={t.name}
                          type="button"
                          className={`key key--sm ${activeTable.name === t.name ? 'key--pressed' : ''}`}
                          onClick={() => {
                            setActiveTableName(t.name);
                            setShowAddForm(false);
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="search"
                      className="field-input"
                      placeholder={`Filter ${activeTable.label.toLowerCase()}...`}
                      aria-label={`Filter ${activeTable.label}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="table-toolbar__right">
                    <button
                      type="button"
                      className="key key--sm"
                      disabled={!tablePerms.create}
                      onClick={() => {
                        setShowAddForm((v) => !v);
                        setShowCsvImport(false);
                      }}
                    >
                      <Plus size={14} aria-hidden="true" />
                      Add row
                    </button>
                    <button
                      type="button"
                      className="key key--sm"
                      disabled={!tablePerms.create}
                      onClick={() => {
                        setShowCsvImport((v) => !v);
                        setShowAddForm(false);
                      }}
                    >
                      <Upload size={14} aria-hidden="true" />
                      Import CSV
                    </button>
                    <button
                      type="button"
                      className="key key--sm"
                      onClick={() => {
                        const csv = exportRowsToCsv(activeTable.columns, rows);
                        handleDownload(`${activeTable.name}.csv`, csv, 'text/csv');
                      }}
                    >
                      <Download size={14} aria-hidden="true" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {!tablePerms.create && (
                  <p className="label" style={{ marginBottom: '12px' }}>
                    Active role ({activeRole?.role}) does not have create permission on {activeTable.name}. Switch roles above or edit the matrix in Permissions.
                  </p>
                )}

                {showAddForm && tablePerms.create && (
                  <form className="inline-form" onSubmit={handleAddRecord}>
                    <div className="label">New record in {activeTable.name}</div>
                    <div className="inline-form__grid">
                      {activeTable.columns
                        .filter((c) => !c.primaryKey)
                        .map((col) => (
                          <div key={col.name} className="field-group">
                            <label htmlFor={`new-${col.name}`} className="label">
                              {col.label}
                            </label>
                            {col.type === 'status' && col.options ? (
                              <select
                                id={`new-${col.name}`}
                                className="field-select"
                                value={newRecord[col.name] ?? col.options[0]}
                                onChange={(e) =>
                                  setNewRecord((prev) => ({ ...prev, [col.name]: e.target.value }))
                                }
                              >
                                {col.options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                id={`new-${col.name}`}
                                type={col.type === 'integer' || col.type === 'numeric' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                className="field-input"
                                required
                                value={newRecord[col.name] ?? ''}
                                onChange={(e) =>
                                  setNewRecord((prev) => ({ ...prev, [col.name]: e.target.value }))
                                }
                              />
                            )}
                          </div>
                        ))}
                    </div>
                    <div className="table-toolbar__left">
                      <button type="submit" className="key key--sm key--primary">
                        Save record
                      </button>
                      <button
                        type="button"
                        className="key key--sm"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {showCsvImport && tablePerms.create && (
                  <form className="inline-form" onSubmit={handleImportCsv}>
                    <label htmlFor="csv-paste" className="label">
                      Paste CSV rows (header row required; column types and SQL DDL are inferred automatically)
                    </label>
                    <textarea
                      id="csv-paste"
                      className="prompt-input mono"
                      rows={5}
                      style={{ marginBlock: '8px 12px', fontSize: '0.8125rem' }}
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                    />
                    {csvError && (
                      <p className="status-inline status-inline--err" style={{ marginBottom: '10px' }}>
                        {csvError}
                      </p>
                    )}
                    <div className="table-toolbar__left">
                      <button type="submit" className="key key--sm key--primary">
                        Create table from CSV
                      </button>
                      <button
                        type="button"
                        className="key key--sm"
                        onClick={() => setShowCsvImport(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {activeTable.columns.map((col) => (
                          <th key={col.name}>{col.label}</th>
                        ))}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={activeTable.columns.length + 1}>
                            No matching records in {activeTable.name}.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((row) => (
                          <tr key={String(row.id)}>
                            {activeTable.columns.map((col) => {
                              const val = row[col.name];
                              if (col.type === 'status' && col.options) {
                                return (
                                  <td key={col.name}>
                                    <button
                                      type="button"
                                      className="key key--sm"
                                      disabled={!tablePerms.update}
                                      title={
                                        tablePerms.update
                                          ? 'Click to cycle status'
                                          : 'Update permission disabled for active role'
                                      }
                                      onClick={() =>
                                        handleCycleStatus(row.id, col.name, col.options!)
                                      }
                                    >
                                      <span className={renderStatusClass(String(val))}>
                                        {String(val)}
                                      </span>
                                    </button>
                                  </td>
                                );
                              }
                              const isNum = col.type === 'integer' || col.type === 'numeric' || col.type === 'serial';
                              return (
                                <td key={col.name} className={isNum ? 'num' : undefined}>
                                  {String(val ?? '')}
                                </td>
                              );
                            })}
                            <td>
                              <button
                                type="button"
                                className="key key--sm"
                                disabled={!tablePerms.delete}
                                aria-label={`Delete row ${row.id}`}
                                onClick={() => handleDeleteRow(row.id)}
                              >
                                <Trash2 size={14} aria-hidden="true" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div>
                <div className="schema-grid">
                  {blueprint.tables.map((table) => (
                    <div key={table.name} className="schema-table-panel">
                      <div className="schema-table-panel__head">
                        <span>{table.name}</span>
                        <span className="label">{table.columns.length} cols</span>
                      </div>
                      <ul className="schema-col-list">
                        {table.columns.map((col) => (
                          <li key={col.name}>
                            <span className="mono">{col.name}</span>
                            <span className="label">
                              {col.primaryKey ? 'PK · ' : ''}
                              {col.type}
                              {col.references ? ` -> ${col.references}` : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="table-toolbar">
                  <div className="chip-tray" role="group" aria-label="SQL dialect">
                    {(['postgresql', 'mysql', 'sqlite'] as SqlDialect[]).map((dialect) => (
                      <button
                        key={dialect}
                        type="button"
                        className={`key key--sm ${sqlDialect === dialect ? 'key--pressed' : ''}`}
                        onClick={() => setSqlDialect(dialect)}
                      >
                        {dialect === 'postgresql' ? 'PostgreSQL' : dialect === 'mysql' ? 'MySQL' : 'SQLite'}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="key key--sm"
                    onClick={() => handleCopy('sql', sqlCode)}
                  >
                    {copiedKey === 'sql' ? <Check size={14} /> : <Copy size={14} />}
                    {copiedKey === 'sql' ? 'Copied SQL' : 'Copy DDL'}
                  </button>
                </div>

                <div className="graphite">
                  <div className="code-pane__head">
                    <span>schema.sql ({sqlDialect})</span>
                  </div>
                  <div className="code-pane__body">
                    <pre>{sqlCode}</pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div>
                <p className="section__sub" style={{ marginBottom: '16px' }}>
                  Toggle create, read, update, and delete flags per role and table. Changes apply immediately to the live preview in the App &amp; Forms tab.
                </p>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Table</th>
                        <th>Create</th>
                        <th>Read</th>
                        <th>Update</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blueprint.roles.flatMap((role) =>
                        blueprint.tables.map((table) => {
                          const p = role.permissions[table.name] ?? {
                            create: false,
                            read: true,
                            update: false,
                            delete: false,
                          };
                          return (
                            <tr
                              key={`${role.role}-${table.name}`}
                              className={role.role === activeRole?.role ? 'row--highlight' : undefined}
                            >
                              <td>
                                <strong>{role.role}</strong>
                              </td>
                              <td className="mono">{table.name}</td>
                              {(['create', 'read', 'update', 'delete'] as const).map((perm) => (
                                <td key={perm}>
                                  <input
                                    type="checkbox"
                                    aria-label={`${role.role} ${perm} on ${table.name}`}
                                    checked={p[perm]}
                                    onChange={() =>
                                      handleTogglePermission(role.role, table.name, perm)
                                    }
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        }),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'automations' && (
              <div>
                <div className="auto-list">
                  {blueprint.automations.map((rule) => (
                    <div key={rule.id} className="auto-row">
                      <div>
                        <h4>{rule.name}</h4>
                        <p className="label" style={{ marginTop: '4px' }}>
                          Trigger: <span className="mono">{rule.trigger}</span> | Condition:{' '}
                          <span className="mono">{rule.condition}</span>
                        </p>
                        <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>{rule.action}</p>
                      </div>
                      <button
                        type="button"
                        className="key key--sm"
                        onClick={() => handleTestAutomation(rule.id)}
                      >
                        <Play size={14} aria-hidden="true" />
                        Test webhook
                      </button>
                    </div>
                  ))}
                </div>

                {automationLog && (
                  <div className="graphite auto-log">
                    <div className="label" style={{ color: 'var(--color-accent-2)', marginBottom: '8px' }}>
                      Simulated webhook delivery (HTTP 200)
                    </div>
                    <pre>{automationLog}</pre>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'api' && (
              <div className="auto-list">
                {restEndpoints.map((ep) => (
                  <div key={`${ep.method}-${ep.path}`} className="graphite">
                    <div className="code-pane__head">
                      <span>
                        {ep.method} {ep.path}
                      </span>
                      <button
                        type="button"
                        className="key key--sm"
                        onClick={() => handleCopy(ep.method + ep.path, ep.curl)}
                      >
                        {copiedKey === ep.method + ep.path ? <Check size={14} /> : <Copy size={14} />}
                        Copy curl
                      </button>
                    </div>
                    <div className="code-pane__body">
                      <p style={{ color: 'var(--color-graphite-muted)', fontSize: '0.8125rem', marginBottom: '8px' }}>
                        {ep.summary}
                      </p>
                      <pre>{ep.curl}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'export' && (
              <div className="auto-list">
                <div className="table-toolbar">
                  <p className="section__sub">
                    Zero vendor lock-in: download your SQL schema, Docker Compose stack, or JSON blueprint and run the application on your own server.
                  </p>
                  <div className="table-toolbar__right">
                    <button
                      type="button"
                      className="key key--sm key--primary"
                      onClick={() => handleDownload('docker-compose.yml', dockerCompose, 'text/yaml')}
                    >
                      <Download size={14} aria-hidden="true" />
                      Download docker-compose.yml
                    </button>
                    <button
                      type="button"
                      className="key key--sm"
                      onClick={() => handleDownload('schema.sql', sqlCode, 'text/sql')}
                    >
                      <Download size={14} aria-hidden="true" />
                      Download schema.sql
                    </button>
                    <button
                      type="button"
                      className="key key--sm"
                      onClick={() =>
                        handleDownload(
                          `${blueprint.slug}-blueprint.json`,
                          JSON.stringify(blueprint, null, 2),
                          'application/json',
                        )
                      }
                    >
                      <Download size={14} aria-hidden="true" />
                      Export JSON
                    </button>
                  </div>
                </div>

                <div className="graphite">
                  <div className="code-pane__head">
                    <span>docker-compose.yml</span>
                    <button
                      type="button"
                      className="key key--sm"
                      onClick={() => handleCopy('docker', dockerCompose)}
                    >
                      {copiedKey === 'docker' ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey === 'docker' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="code-pane__body">
                    <pre>{dockerCompose}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
