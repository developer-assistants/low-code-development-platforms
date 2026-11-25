import type { AppBlueprint } from '../types';

export const APP_TEMPLATES: AppBlueprint[] = [
  {
    id: 'inventory',
    slug: 'inventory-management-app-builder',
    seoQuery: 'inventory management app builder',
    name: 'Inventory Management',
    shortName: 'Inventory',
    summary: 'Track products, suppliers, stock levels, employee roles, and automated low-stock alerts over PostgreSQL or MySQL.',
    prompt: 'Create an inventory management system with suppliers, stock tracking, employee roles and low stock notifications.',
    primaryTable: 'products',
    tables: [
      {
        name: 'products',
        label: 'Products',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'product', label: 'Product', type: 'text' },
          { name: 'sku', label: 'SKU', type: 'text' },
          { name: 'supplier_id', label: 'Supplier ID', type: 'integer', references: 'suppliers(id)' },
          { name: 'stock', label: 'Stock', type: 'integer' },
          { name: 'reorder_point', label: 'Reorder Point', type: 'integer' },
          { name: 'status', label: 'Status', type: 'status', options: ['In stock', 'Low stock', 'Out of stock'] },
        ],
      },
      {
        name: 'suppliers',
        label: 'Suppliers',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'company', label: 'Supplier', type: 'text' },
          { name: 'contact_email', label: 'Contact Email', type: 'text' },
          { name: 'lead_days', label: 'Lead Time (Days)', type: 'integer' },
          { name: 'status', label: 'Status', type: 'status', options: ['Active', 'On hold'] },
        ],
      },
      {
        name: 'stock_movements',
        label: 'Stock Movements',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'product_id', label: 'Product ID', type: 'integer', references: 'products(id)' },
          { name: 'delta', label: 'Change', type: 'integer' },
          { name: 'reason', label: 'Reason', type: 'text' },
          { name: 'created_at', label: 'Date', type: 'date' },
        ],
      },
    ],
    rows: {
      products: [
        { id: 1, product: 'Office Chair', sku: 'CHR-104', supplier_id: 1, stock: 120, reorder_point: 20, status: 'In stock' },
        { id: 2, product: 'Monitor 27"', sku: 'MON-270', supplier_id: 2, stock: 4, reorder_point: 10, status: 'Low stock' },
        { id: 3, product: 'USB-C Hub', sku: 'HUB-088', supplier_id: 2, stock: 86, reorder_point: 25, status: 'In stock' },
        { id: 4, product: 'Desk Lamp', sku: 'LMP-019', supplier_id: 3, stock: 0, reorder_point: 15, status: 'Out of stock' },
        { id: 5, product: 'Standing Desk Frame', sku: 'DSK-502', supplier_id: 1, stock: 18, reorder_point: 10, status: 'In stock' },
        { id: 6, product: 'Mechanical Keyboard', sku: 'KBD-311', supplier_id: 2, stock: 6, reorder_point: 12, status: 'Low stock' },
      ],
      suppliers: [
        { id: 1, company: 'Nordic Office Supply', contact_email: 'orders@nordicoffice.example', lead_days: 5, status: 'Active' },
        { id: 2, company: 'Shenzhen Peripherals Co.', contact_email: 'sales@szperiph.example', lead_days: 12, status: 'Active' },
        { id: 3, company: 'BrightWork Lighting', contact_email: 'support@brightwork.example', lead_days: 7, status: 'Active' },
      ],
      stock_movements: [
        { id: 1, product_id: 2, delta: -8, reason: 'Q4 office onboarding batch', created_at: '2026-11-21' },
        { id: 2, product_id: 4, delta: -14, reason: 'Berlin warehouse transfer', created_at: '2026-11-23' },
        { id: 3, product_id: 1, delta: 40, reason: 'PO-4018 restock received', created_at: '2026-11-24' },
      ],
    },
    metrics: [
      { label: 'Products', compute: 'total_rows' },
      { label: 'Suppliers', compute: 'secondary_count', secondaryTable: 'suppliers' },
      { label: 'Low or out of stock', compute: 'low_alert', alertColumn: 'status', alertMatch: ['Low stock', 'Out of stock'] },
    ],
    roles: [
      {
        role: 'Admin',
        description: 'Full access to products, suppliers, and stock adjustments.',
        permissions: {
          products: { create: true, read: true, update: true, delete: true },
          suppliers: { create: true, read: true, update: true, delete: true },
          stock_movements: { create: true, read: true, update: true, delete: true },
        },
      },
      {
        role: 'Warehouse Manager',
        description: 'Add and update stock counts, read suppliers, cannot delete records.',
        permissions: {
          products: { create: true, read: true, update: true, delete: false },
          suppliers: { create: false, read: true, update: false, delete: false },
          stock_movements: { create: true, read: true, update: false, delete: false },
        },
      },
      {
        role: 'Viewer',
        description: 'Read-only access for finance and procurement reporting.',
        permissions: {
          products: { create: false, read: true, update: false, delete: false },
          suppliers: { create: false, read: true, update: false, delete: false },
          stock_movements: { create: false, read: true, update: false, delete: false },
        },
      },
    ],
    automations: [
      {
        id: 'low-stock-alert',
        name: 'Low stock webhook alert',
        trigger: 'After UPDATE on products',
        condition: 'NEW.stock <= NEW.reorder_point',
        action: 'POST JSON payload to procurement webhook and set status = "Low stock"',
        webhookUrl: 'https://hooks.example.com/inventory/low-stock',
        enabled: true,
      },
      {
        id: 'out-of-stock-po',
        name: 'Draft supplier purchase order',
        trigger: 'After UPDATE on products',
        condition: 'NEW.stock = 0',
        action: 'Send reorder draft email to suppliers.contact_email',
        webhookUrl: 'https://hooks.example.com/inventory/draft-po',
        enabled: true,
      },
    ],
    faqs: [
      {
        question: 'Can I connect this inventory app to an existing PostgreSQL database?',
        answer: 'Yes. Export the generated SQL schema or point the Docker Compose DATABASE_URL to your existing PostgreSQL or MySQL instance.',
      },
      {
        question: 'How do low-stock notifications work when self-hosted?',
        answer: 'The automation rule checks stock against reorder_point on every row update and posts a signed JSON webhook to Slack, email, or your ERP.',
      },
    ],
  },
  {
    id: 'crm',
    slug: 'crm-builder',
    seoQuery: 'crm builder',
    name: 'Sales CRM',
    shortName: 'CRM',
    summary: 'Manage accounts, deal pipelines, follow-up tasks, and sales rep permissions without per-seat SaaS lock-in.',
    prompt: 'Build a CRM with companies, deals pipeline, deal stages, sales rep roles, and stale deal reminders.',
    primaryTable: 'deals',
    tables: [
      {
        name: 'deals',
        label: 'Deals',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'deal_name', label: 'Deal', type: 'text' },
          { name: 'company', label: 'Company', type: 'text' },
          { name: 'value_usd', label: 'Value (USD)', type: 'integer' },
          { name: 'owner', label: 'Owner', type: 'text' },
          { name: 'status', label: 'Stage', type: 'status', options: ['Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'At Risk'] },
        ],
      },
      {
        name: 'contacts',
        label: 'Contacts',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'full_name', label: 'Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'text' },
          { name: 'company', label: 'Company', type: 'text' },
        ],
      },
    ],
    rows: {
      deals: [
        { id: 1, deal_name: 'Annual Data Sync License', company: 'Northstar Logistics', value_usd: 24000, owner: 'Elena M.', status: 'Negotiation' },
        { id: 2, deal_name: 'Warehouse Portal Rollout', company: 'Kestrel Manufacturing', value_usd: 18500, owner: 'David K.', status: 'Proposal' },
        { id: 3, deal_name: 'Enterprise Self-Host Plan', company: 'Helios Biotech', value_usd: 42000, owner: 'Elena M.', status: 'Closed Won' },
        { id: 4, deal_name: 'Regional Support Desk', company: 'Alder Retail Group', value_usd: 9600, owner: 'Samir P.', status: 'At Risk' },
      ],
      contacts: [
        { id: 1, full_name: 'Claire Bennett', email: 'c.bennett@northstar.example', company: 'Northstar Logistics' },
        { id: 2, full_name: 'Tomasz Nowak', email: 't.nowak@kestrel.example', company: 'Kestrel Manufacturing' },
      ],
    },
    metrics: [
      { label: 'Active deals', compute: 'total_rows' },
      { label: 'Contacts', compute: 'secondary_count', secondaryTable: 'contacts' },
      { label: 'At risk deals', compute: 'low_alert', alertColumn: 'status', alertMatch: ['At Risk'] },
    ],
    roles: [
      {
        role: 'Admin',
        description: 'Full control over pipeline stages, deals, and exports.',
        permissions: {
          deals: { create: true, read: true, update: true, delete: true },
          contacts: { create: true, read: true, update: true, delete: true },
        },
      },
      {
        role: 'Sales Rep',
        description: 'Create and update deals and contacts without delete access.',
        permissions: {
          deals: { create: true, read: true, update: true, delete: false },
          contacts: { create: true, read: true, update: true, delete: false },
        },
      },
      {
        role: 'Viewer',
        description: 'Read-only pipeline visibility for leadership.',
        permissions: {
          deals: { create: false, read: true, update: false, delete: false },
          contacts: { create: false, read: true, update: false, delete: false },
        },
      },
    ],
    automations: [
      {
        id: 'crm-won-webhook',
        name: 'Notify billing on Closed Won',
        trigger: 'After UPDATE on deals',
        condition: 'NEW.status = "Closed Won"',
        action: 'POST deal payload to accounting webhook to draft invoice',
        webhookUrl: 'https://hooks.example.com/crm/closed-won',
        enabled: true,
      },
    ],
    faqs: [
      {
        question: 'Why build a custom CRM on PostgreSQL instead of paying per seat?',
        answer: 'Teams with 20 or more staff often pay over $1,000 per month for basic pipeline tables. A self-hosted database CRM keeps full SQL ownership at a fixed hosting cost.',
      },
    ],
  },
  {
    id: 'client-portal',
    slug: 'client-portal-builder',
    seoQuery: 'client portal builder',
    name: 'Client Portal',
    shortName: 'Client Portal',
    summary: 'Give customers scoped access to project milestones, shared deliverables, and invoice statuses.',
    prompt: 'Create a client portal with customer projects, deliverable approvals, invoices, and client-scoped permissions.',
    primaryTable: 'deliverables',
    tables: [
      {
        name: 'deliverables',
        label: 'Deliverables',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'title', label: 'Deliverable', type: 'text' },
          { name: 'client', label: 'Client', type: 'text' },
          { name: 'due_date', label: 'Due Date', type: 'date' },
          { name: 'status', label: 'Status', type: 'status', options: ['In Progress', 'Needs Review', 'Approved', 'Overdue'] },
        ],
      },
      {
        name: 'invoices',
        label: 'Invoices',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'invoice_no', label: 'Invoice #', type: 'text' },
          { name: 'amount_usd', label: 'Amount (USD)', type: 'integer' },
          { name: 'status', label: 'Status', type: 'status', options: ['Paid', 'Sent', 'Overdue'] },
        ],
      },
    ],
    rows: {
      deliverables: [
        { id: 1, title: 'Q4 Technical SEO Audit', client: 'Acme Health', due_date: '2026-11-28', status: 'Needs Review' },
        { id: 2, title: 'PostgreSQL Migration Runbook', client: 'FinGrid Labs', due_date: '2026-12-03', status: 'In Progress' },
        { id: 3, title: 'Checkout Flow Wireframes', client: 'Acme Health', due_date: '2026-11-18', status: 'Approved' },
        { id: 4, title: 'SOC2 Evidence Pack', client: 'Lumen Cloud', due_date: '2026-11-20', status: 'Overdue' },
      ],
      invoices: [
        { id: 1, invoice_no: 'INV-2026-081', amount_usd: 6400, status: 'Paid' },
        { id: 2, invoice_no: 'INV-2026-082', amount_usd: 4200, status: 'Sent' },
      ],
    },
    metrics: [
      { label: 'Deliverables', compute: 'total_rows' },
      { label: 'Invoices', compute: 'secondary_count', secondaryTable: 'invoices' },
      { label: 'Needs review / overdue', compute: 'low_alert', alertColumn: 'status', alertMatch: ['Needs Review', 'Overdue'] },
    ],
    roles: [
      {
        role: 'Admin',
        description: 'Agency team with full access to all clients and invoices.',
        permissions: {
          deliverables: { create: true, read: true, update: true, delete: true },
          invoices: { create: true, read: true, update: true, delete: true },
        },
      },
      {
        role: 'Client Reviewer',
        description: 'View deliverables and update approval status.',
        permissions: {
          deliverables: { create: false, read: true, update: true, delete: false },
          invoices: { create: false, read: true, update: false, delete: false },
        },
      },
    ],
    automations: [
      {
        id: 'portal-approval',
        name: 'Client approval notification',
        trigger: 'After UPDATE on deliverables',
        condition: 'NEW.status = "Approved"',
        action: 'POST approval event to project Slack channel',
        webhookUrl: 'https://hooks.example.com/portal/approved',
        enabled: true,
      },
    ],
    faqs: [
      {
        question: 'Can external clients log in without per-client seat fees?',
        answer: 'Yes. Self-hosted deployments include unlimited external client accounts with role-based permissions.',
      },
    ],
  },
  {
    id: 'ticketing',
    slug: 'ticketing-system-builder',
    seoQuery: 'ticketing system builder',
    name: 'Support Ticketing System',
    shortName: 'Ticketing',
    summary: 'Log customer issues, assign support engineers, enforce SLA priorities, and trigger escalation webhooks.',
    prompt: 'Create an IT support ticketing system with priority queues, assignees, SLA deadlines, and escalation alerts.',
    primaryTable: 'tickets',
    tables: [
      {
        name: 'tickets',
        label: 'Tickets',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'subject', label: 'Subject', type: 'text' },
          { name: 'requester', label: 'Requester', type: 'text' },
          { name: 'assignee', label: 'Assignee', type: 'text' },
          { name: 'priority', label: 'Priority', type: 'text' },
          { name: 'status', label: 'Status', type: 'status', options: ['Open', 'In Progress', 'Escalated', 'Resolved'] },
        ],
      },
      {
        name: 'agents',
        label: 'Support Agents',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'name', label: 'Agent', type: 'text' },
          { name: 'team', label: 'Team', type: 'text' },
        ],
      },
    ],
    rows: {
      tickets: [
        { id: 101, subject: 'SSO SAML callback 403 error', requester: 'ops@finpay.example', assignee: 'Nina R.', priority: 'P1', status: 'Escalated' },
        { id: 102, subject: 'CSV import timeout on 40k rows', requester: 'data@meridian.example', assignee: 'Liam T.', priority: 'P2', status: 'In Progress' },
        { id: 103, subject: 'Add read-only auditor role', requester: 'sec@vanguard.example', assignee: 'Nina R.', priority: 'P3', status: 'Open' },
        { id: 104, subject: 'Webhook retry header format', requester: 'dev@orbit.example', assignee: 'Liam T.', priority: 'P3', status: 'Resolved' },
      ],
      agents: [
        { id: 1, name: 'Nina R.', team: 'Auth & Security' },
        { id: 2, name: 'Liam T.', team: 'Data Pipeline' },
      ],
    },
    metrics: [
      { label: 'Tickets', compute: 'total_rows' },
      { label: 'Support agents', compute: 'secondary_count', secondaryTable: 'agents' },
      { label: 'Open or escalated', compute: 'low_alert', alertColumn: 'status', alertMatch: ['Open', 'Escalated'] },
    ],
    roles: [
      {
        role: 'Admin',
        description: 'Manage queues, assignees, and ticket deletion.',
        permissions: {
          tickets: { create: true, read: true, update: true, delete: true },
          agents: { create: true, read: true, update: true, delete: true },
        },
      },
      {
        role: 'Support Agent',
        description: 'Create and update assigned tickets.',
        permissions: {
          tickets: { create: true, read: true, update: true, delete: false },
          agents: { create: false, read: true, update: false, delete: false },
        },
      },
    ],
    automations: [
      {
        id: 'p1-pager',
        name: 'Escalate P1 ticket to on-call',
        trigger: 'After INSERT on tickets',
        condition: 'NEW.priority = "P1"',
        action: 'POST incident payload to PagerDuty or Slack webhook',
        webhookUrl: 'https://hooks.example.com/support/p1-alert',
        enabled: true,
      },
    ],
    faqs: [
      {
        question: 'Can tickets be created via REST API from a web form?',
        answer: 'Yes. Every table exposes a POST /api/v1/tickets endpoint secured by bearer token or role session.',
      },
    ],
  },
  {
    id: 'admin-panel',
    slug: 'admin-panel-builder',
    seoQuery: 'admin panel builder',
    name: 'Internal Admin Panel',
    shortName: 'Admin Panel',
    summary: 'Inspect production user accounts, feature flags, and billing plans over your existing SQL database.',
    prompt: 'Build an internal admin panel for managing user accounts, subscription plans, feature flags, and audit logs.',
    primaryTable: 'accounts',
    tables: [
      {
        name: 'accounts',
        label: 'Accounts',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'email', label: 'Email', type: 'text' },
          { name: 'plan', label: 'Plan', type: 'text' },
          { name: 'seats', label: 'Seats', type: 'integer' },
          { name: 'status', label: 'Status', type: 'status', options: ['Active', 'Past Due', 'Suspended'] },
        ],
      },
      {
        name: 'audit_logs',
        label: 'Audit Logs',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'actor', label: 'Actor', type: 'text' },
          { name: 'action', label: 'Action', type: 'text' },
          { name: 'created_at', label: 'Date', type: 'date' },
        ],
      },
    ],
    rows: {
      accounts: [
        { id: 1, email: 'admin@kestrel.example', plan: 'Team', seats: 18, status: 'Active' },
        { id: 2, email: 'billing@solaris.example', plan: 'Business', seats: 9, status: 'Past Due' },
        { id: 3, email: 'ops@cinder.example', plan: 'Cloud', seats: 4, status: 'Active' },
        { id: 4, email: 'test@spamhost.example', plan: 'Cloud', seats: 1, status: 'Suspended' },
      ],
      audit_logs: [
        { id: 1, actor: 'alex@internal.example', action: 'Upgraded account #1 to Team', created_at: '2026-11-24' },
        { id: 2, actor: 'maya@internal.example', action: 'Suspended account #4', created_at: '2026-11-25' },
      ],
    },
    metrics: [
      { label: 'Accounts', compute: 'total_rows' },
      { label: 'Audit events', compute: 'secondary_count', secondaryTable: 'audit_logs' },
      { label: 'Past due / suspended', compute: 'low_alert', alertColumn: 'status', alertMatch: ['Past Due', 'Suspended'] },
    ],
    roles: [
      {
        role: 'Admin',
        description: 'Modify plans, seats, and account status.',
        permissions: {
          accounts: { create: true, read: true, update: true, delete: true },
          audit_logs: { create: true, read: true, update: false, delete: false },
        },
      },
      {
        role: 'Support Ops',
        description: 'View accounts and update plan seats; audit logs remain immutable.',
        permissions: {
          accounts: { create: false, read: true, update: true, delete: false },
          audit_logs: { create: false, read: true, update: false, delete: false },
        },
      },
    ],
    automations: [
      {
        id: 'audit-suspend',
        name: 'Log account suspension',
        trigger: 'After UPDATE on accounts',
        condition: 'NEW.status = "Suspended"',
        action: 'Insert row into audit_logs and revoke active API tokens',
        webhookUrl: 'https://hooks.example.com/admin/revoke-session',
        enabled: true,
      },
    ],
    faqs: [
      {
        question: 'Does the admin panel require modifying my existing database tables?',
        answer: 'No. It reads standard PostgreSQL or MySQL tables directly via foreign keys and primary keys.',
      },
    ],
  },
  {
    id: 'employee-management',
    slug: 'employee-management-app',
    seoQuery: 'employee management app',
    name: 'Employee Management',
    shortName: 'Employees',
    summary: 'Maintain staff directories, department assignments, onboarding checklists, and PTO requests.',
    prompt: 'Create an employee management app with staff directory, departments, onboarding status, and HR roles.',
    primaryTable: 'employees',
    tables: [
      {
        name: 'employees',
        label: 'Employees',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'full_name', label: 'Employee', type: 'text' },
          { name: 'department', label: 'Department', type: 'text' },
          { name: 'role_title', label: 'Title', type: 'text' },
          { name: 'status', label: 'Status', type: 'status', options: ['Active', 'Onboarding', 'On Leave'] },
        ],
      },
      {
        name: 'departments',
        label: 'Departments',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'name', label: 'Department', type: 'text' },
          { name: 'lead', label: 'Lead', type: 'text' },
        ],
      },
    ],
    rows: {
      employees: [
        { id: 1, full_name: 'Hannah Lindqvist', department: 'Engineering', role_title: 'Staff Backend Engineer', status: 'Active' },
        { id: 2, full_name: 'Marcus Chen', department: 'Operations', role_title: 'Supply Chain Analyst', status: 'Onboarding' },
        { id: 3, full_name: 'Priya Nair', department: 'Product', role_title: 'Product Manager', status: 'Active' },
        { id: 4, full_name: 'Daniel Ortiz', department: 'Engineering', role_title: 'QA Engineer', status: 'On Leave' },
      ],
      departments: [
        { id: 1, name: 'Engineering', lead: 'Hannah Lindqvist' },
        { id: 2, name: 'Operations', lead: 'Marcus Chen' },
        { id: 3, name: 'Product', lead: 'Priya Nair' },
      ],
    },
    metrics: [
      { label: 'Employees', compute: 'total_rows' },
      { label: 'Departments', compute: 'secondary_count', secondaryTable: 'departments' },
      { label: 'Onboarding / leave', compute: 'low_alert', alertColumn: 'status', alertMatch: ['Onboarding', 'On Leave'] },
    ],
    roles: [
      {
        role: 'HR Admin',
        description: 'Full read and write access to employee records.',
        permissions: {
          employees: { create: true, read: true, update: true, delete: true },
          departments: { create: true, read: true, update: true, delete: true },
        },
      },
      {
        role: 'Team Member',
        description: 'Read-only access to the staff directory.',
        permissions: {
          employees: { create: false, read: true, update: false, delete: false },
          departments: { create: false, read: true, update: false, delete: false },
        },
      },
    ],
    automations: [
      {
        id: 'onboarding-checklist',
        name: 'Trigger IT onboarding tasks',
        trigger: 'After INSERT on employees',
        condition: 'NEW.status = "Onboarding"',
        action: 'POST laptop and email provisioning request to IT webhook',
        webhookUrl: 'https://hooks.example.com/hr/onboarding',
        enabled: true,
      },
    ],
    faqs: [
      {
        question: 'Can HR import an existing staff spreadsheet?',
        answer: 'Yes. Switch to the Import CSV button in the table toolbar to load an existing staff roster into the schema.',
      },
    ],
  },
  {
    id: 'approval-workflow',
    slug: 'approval-workflow-software',
    seoQuery: 'approval workflow software',
    name: 'Expense Approval Workflow',
    shortName: 'Approvals',
    summary: 'Submit purchase and expense requests, route them to managers by threshold, and log finance approvals.',
    prompt: 'Create an expense approval workflow software with submitters, dollar thresholds, finance approvers, and status webhooks.',
    primaryTable: 'expense_requests',
    tables: [
      {
        name: 'expense_requests',
        label: 'Expense Requests',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'description', label: 'Request', type: 'text' },
          { name: 'requester', label: 'Requester', type: 'text' },
          { name: 'amount_usd', label: 'Amount (USD)', type: 'integer' },
          { name: 'status', label: 'Status', type: 'status', options: ['Pending', 'Approved', 'Rejected'] },
        ],
      },
      {
        name: 'approvers',
        label: 'Approvers',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'name', label: 'Approver', type: 'text' },
          { name: 'limit_usd', label: 'Approval Limit', type: 'integer' },
        ],
      },
    ],
    rows: {
      expense_requests: [
        { id: 1, description: 'AWS Staging Cluster Credits', requester: 'dev-ops@corp.example', amount_usd: 1450, status: 'Pending' },
        { id: 2, description: 'Team Offsite Flights', requester: 'product@corp.example', amount_usd: 3200, status: 'Pending' },
        { id: 3, description: 'Figma Annual Renewal', requester: 'design@corp.example', amount_usd: 720, status: 'Approved' },
        { id: 4, description: 'Unbudgeted Ad Spend', requester: 'growth@corp.example', amount_usd: 5000, status: 'Rejected' },
      ],
      approvers: [
        { id: 1, name: 'Finance Controller', limit_usd: 5000 },
        { id: 2, name: 'Engineering VP', limit_usd: 2500 },
      ],
    },
    metrics: [
      { label: 'Requests', compute: 'total_rows' },
      { label: 'Approvers', compute: 'secondary_count', secondaryTable: 'approvers' },
      { label: 'Pending review', compute: 'low_alert', alertColumn: 'status', alertMatch: ['Pending'] },
    ],
    roles: [
      {
        role: 'Finance Approver',
        description: 'Review and approve or reject submitted expenses.',
        permissions: {
          expense_requests: { create: true, read: true, update: true, delete: true },
          approvers: { create: true, read: true, update: true, delete: false },
        },
      },
      {
        role: 'Submitter',
        description: 'Submit new requests and track approval status.',
        permissions: {
          expense_requests: { create: true, read: true, update: false, delete: false },
          approvers: { create: false, read: true, update: false, delete: false },
        },
      },
    ],
    automations: [
      {
        id: 'threshold-route',
        name: 'Escalate requests over $2,500',
        trigger: 'After INSERT on expense_requests',
        condition: 'NEW.amount_usd > 2500',
        action: 'Notify Finance Controller via webhook for dual sign-off',
        webhookUrl: 'https://hooks.example.com/finance/dual-approval',
        enabled: true,
      },
    ],
    faqs: [
      {
        question: 'Can approval rules depend on the requested dollar amount?',
        answer: 'Yes. Automation conditions evaluate any column value such as amount_usd > 2500 to route notifications.',
      },
    ],
  },
  {
    id: 'asset-management',
    slug: 'asset-management-app',
    seoQuery: 'asset management app',
    name: 'IT Asset Management',
    shortName: 'Assets',
    summary: 'Track laptops, serial numbers, warranty expiration dates, assigned owners, and maintenance status.',
    prompt: 'Build an IT asset management app for company laptops, monitors, serial numbers, assigned employees, and repair tracking.',
    primaryTable: 'assets',
    tables: [
      {
        name: 'assets',
        label: 'Assets',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'asset_tag', label: 'Asset Tag', type: 'text' },
          { name: 'model', label: 'Model', type: 'text' },
          { name: 'assigned_to', label: 'Assigned To', type: 'text' },
          { name: 'status', label: 'Status', type: 'status', options: ['Assigned', 'In Storage', 'Needs Repair', 'Retired'] },
        ],
      },
      {
        name: 'maintenance_logs',
        label: 'Maintenance Logs',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'asset_tag', label: 'Asset Tag', type: 'text' },
          { name: 'issue', label: 'Issue', type: 'text' },
          { name: 'logged_at', label: 'Date', type: 'date' },
        ],
      },
    ],
    rows: {
      assets: [
        { id: 1, asset_tag: 'IT-0041', model: 'MacBook Pro 14" M4', assigned_to: 'Hannah Lindqvist', status: 'Assigned' },
        { id: 2, asset_tag: 'IT-0042', model: 'ThinkPad X1 Carbon', assigned_to: 'Warehouse Pool', status: 'In Storage' },
        { id: 3, asset_tag: 'IT-0043', model: 'Dell UltraSharp 27"', assigned_to: 'Marcus Chen', status: 'Needs Repair' },
        { id: 4, asset_tag: 'IT-0044', model: 'Zebra Barcode Scanner', assigned_to: 'Dock B', status: 'Assigned' },
      ],
      maintenance_logs: [
        { id: 1, asset_tag: 'IT-0043', issue: 'USB-C power delivery port loose', logged_at: '2026-11-22' },
      ],
    },
    metrics: [
      { label: 'Tracked assets', compute: 'total_rows' },
      { label: 'Repair logs', compute: 'secondary_count', secondaryTable: 'maintenance_logs' },
      { label: 'Needs repair', compute: 'low_alert', alertColumn: 'status', alertMatch: ['Needs Repair'] },
    ],
    roles: [
      {
        role: 'IT Admin',
        description: 'Full lifecycle control over hardware inventory.',
        permissions: {
          assets: { create: true, read: true, update: true, delete: true },
          maintenance_logs: { create: true, read: true, update: true, delete: true },
        },
      },
      {
        role: 'Auditor',
        description: 'Read-only asset register for compliance checks.',
        permissions: {
          assets: { create: false, read: true, update: false, delete: false },
          maintenance_logs: { create: false, read: true, update: false, delete: false },
        },
      },
    ],
    automations: [
      {
        id: 'repair-ticket',
        name: 'Create vendor RMA alert',
        trigger: 'After UPDATE on assets',
        condition: 'NEW.status = "Needs Repair"',
        action: 'POST asset_tag and serial info to IT helpdesk webhook',
        webhookUrl: 'https://hooks.example.com/it/rma',
        enabled: true,
      },
    ],
    faqs: [
      {
        question: 'Can we export the asset register for annual accounting audits?',
        answer: 'Yes. Export the filtered table to CSV in one click or query the underlying SQL database directly.',
      },
    ],
  },
  {
    id: 'database-app',
    slug: 'database-app-builder',
    seoQuery: 'database app builder',
    name: 'SQL Database App',
    shortName: 'SQL App',
    summary: 'Turn any PostgreSQL, MySQL, or SQLite schema into a typed CRUD interface with REST endpoints and role controls.',
    prompt: 'Build a SQL database app interface for orders, customers, and shipping statuses with PostgreSQL DDL export.',
    primaryTable: 'orders',
    tables: [
      {
        name: 'orders',
        label: 'Orders',
        columns: [
          { name: 'id', label: 'Order ID', type: 'serial', primaryKey: true },
          { name: 'customer_email', label: 'Customer', type: 'text' },
          { name: 'total_usd', label: 'Total (USD)', type: 'integer' },
          { name: 'region', label: 'Region', type: 'text' },
          { name: 'status', label: 'Status', type: 'status', options: ['Pending', 'Shipped', 'Delivered', 'Flagged'] },
        ],
      },
      {
        name: 'customers',
        label: 'Customers',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'email', label: 'Email', type: 'text' },
          { name: 'tier', label: 'Tier', type: 'text' },
        ],
      },
    ],
    rows: {
      orders: [
        { id: 9001, customer_email: 'buyer@nordic.example', total_usd: 1290, region: 'EU-West', status: 'Shipped' },
        { id: 9002, customer_email: 'ops@pacific.example', total_usd: 450, region: 'US-West', status: 'Pending' },
        { id: 9003, customer_email: 'procurement@atlas.example', total_usd: 8900, region: 'US-East', status: 'Flagged' },
        { id: 9004, customer_email: 'store@alder.example', total_usd: 640, region: 'EU-Central', status: 'Delivered' },
      ],
      customers: [
        { id: 1, email: 'buyer@nordic.example', tier: 'Enterprise' },
        { id: 2, email: 'ops@pacific.example', tier: 'Standard' },
      ],
    },
    metrics: [
      { label: 'Orders', compute: 'total_rows' },
      { label: 'Customers', compute: 'secondary_count', secondaryTable: 'customers' },
      { label: 'Flagged / pending', compute: 'low_alert', alertColumn: 'status', alertMatch: ['Flagged', 'Pending'] },
    ],
    roles: [
      {
        role: 'DB Admin',
        description: 'Full SQL CRUD access across all tables.',
        permissions: {
          orders: { create: true, read: true, update: true, delete: true },
          customers: { create: true, read: true, update: true, delete: true },
        },
      },
      {
        role: 'Fulfillment',
        description: 'Update order shipping statuses without deleting orders.',
        permissions: {
          orders: { create: false, read: true, update: true, delete: false },
          customers: { create: false, read: true, update: false, delete: false },
        },
      },
    ],
    automations: [
      {
        id: 'flagged-order',
        name: 'Hold flagged orders for fraud review',
        trigger: 'After UPDATE on orders',
        condition: 'NEW.status = "Flagged"',
        action: 'POST order_id to risk review webhook',
        webhookUrl: 'https://hooks.example.com/orders/risk-check',
        enabled: true,
      },
    ],
    faqs: [
      {
        question: 'Which SQL dialects are supported for export?',
        answer: 'The schema generator outputs PostgreSQL, MySQL, and SQLite DDL with primary keys and foreign-key constraints.',
      },
    ],
  },
  {
    id: 'excel-to-web',
    slug: 'excel-to-web-app',
    seoQuery: 'excel to web app',
    name: 'Excel / CSV to Web App',
    shortName: 'Excel to App',
    summary: 'Paste or upload any CSV or Excel export to infer SQL column types and publish a multi-user web app with RBAC.',
    prompt: 'Convert an Excel spreadsheet of vendor renewals and contract dates into a multi-user web app with CSV import and export.',
    primaryTable: 'vendor_contracts',
    tables: [
      {
        name: 'vendor_contracts',
        label: 'Vendor Contracts',
        columns: [
          { name: 'id', label: 'ID', type: 'serial', primaryKey: true },
          { name: 'vendor', label: 'Vendor', type: 'text' },
          { name: 'annual_cost_usd', label: 'Annual Cost (USD)', type: 'integer' },
          { name: 'renewal_date', label: 'Renewal Date', type: 'date' },
          { name: 'status', label: 'Status', type: 'status', options: ['Active', 'Expiring Soon', 'Cancelled'] },
        ],
      },
    ],
    rows: {
      vendor_contracts: [
        { id: 1, vendor: 'Cloudflare Business', annual_cost_usd: 2400, renewal_date: '2026-12-15', status: 'Expiring Soon' },
        { id: 2, vendor: 'Hetzner Dedicated', annual_cost_usd: 3600, renewal_date: '2027-03-01', status: 'Active' },
        { id: 3, vendor: 'Postmark Email', annual_cost_usd: 600, renewal_date: '2027-01-10', status: 'Active' },
        { id: 4, vendor: 'Legacy BI Tool', annual_cost_usd: 4800, renewal_date: '2026-12-01', status: 'Expiring Soon' },
      ],
    },
    metrics: [
      { label: 'Contracts', compute: 'total_rows' },
      { label: 'Tables', compute: 'secondary_count', secondaryTable: 'vendor_contracts' },
      { label: 'Expiring soon', compute: 'low_alert', alertColumn: 'status', alertMatch: ['Expiring Soon'] },
    ],
    roles: [
      {
        role: 'Admin',
        description: 'Import CSVs, edit contracts, and manage renewals.',
        permissions: {
          vendor_contracts: { create: true, read: true, update: true, delete: true },
        },
      },
      {
        role: 'Department Lead',
        description: 'Read contract dates and add new vendor rows.',
        permissions: {
          vendor_contracts: { create: true, read: true, update: false, delete: false },
        },
      },
    ],
    automations: [
      {
        id: 'renewal-reminder',
        name: '30-day renewal reminder',
        trigger: 'Daily schedule on vendor_contracts',
        condition: 'renewal_date <= CURRENT_DATE + INTERVAL 30 DAY',
        action: 'POST upcoming renewal list to finance Slack channel',
        webhookUrl: 'https://hooks.example.com/contracts/renewal-reminder',
        enabled: true,
      },
    ],
    faqs: [
      {
        question: 'How does CSV type inference work?',
        answer: 'The importer inspects every column in your pasted CSV, detects integers, decimals, booleans, ISO dates, and text, and generates matching SQL CREATE TABLE statements.',
      },
    ],
  },
];
