# OpenForge: Open-Source AI Low-Code Platform & Benchmark

Live workbench and benchmark: https://developer-assistants.github.io/low-code-development-platforms/

OpenForge is an MIT-licensed AI database app builder and internal tool generator. Describe a business workflow in plain text and generate a PostgreSQL, MySQL, or SQLite schema, CRUD tables and forms, role-based access control (RBAC), webhook automations, REST endpoints, and a Docker Compose deployment stack with zero vendor lock-in.

The repository also hosts a reproducible benchmark comparing **OpenForge, Appsmith, ToolJet, Retool, Budibase, NocoDB, Directus, and Refine** on the exact same four-table Inventory Management specification.

## What Is Included

- **Interactive AI App Builder**: Enter any business workflow prompt or select one of 10 templates to generate tables, seed data, CRUD UI, RBAC roles, automations, and REST endpoints.
- **Live CRUD, Role Preview, and CSV Import/Export**: Add rows, filter records, cycle status values, switch active roles (`Admin`, `Warehouse Manager`, `Viewer`) to verify RBAC enforcement, paste CSV data with automatic SQL type inference, and export CSVs.
- **Multi-Dialect SQL DDL Export**: Switch between PostgreSQL, MySQL, and SQLite `CREATE TABLE` statements with primary keys and foreign-key constraints.
- **Self-Hosted Docker Export**: Copy or download `docker-compose.yml`, `schema.sql`, and JSON blueprints so your data and application run on your own server.
- **Reproducible Low-Code Platform Benchmark**: Interactive seat-cost calculator (5 to 200 users, Cloud vs Self-Hosted) and build-time comparison across 8 platforms.

## 10 Included Application Templates

1. [Inventory Management (`inventory management app builder`)](https://developer-assistants.github.io/low-code-development-platforms/templates/inventory-management-app-builder/)
2. [Sales CRM (`crm builder`)](https://developer-assistants.github.io/low-code-development-platforms/templates/crm-builder/)
3. [Client Portal (`client portal builder`)](https://developer-assistants.github.io/low-code-development-platforms/templates/client-portal-builder/)
4. [Support Ticketing System (`ticketing system builder`)](https://developer-assistants.github.io/low-code-development-platforms/templates/ticketing-system-builder/)
5. [Internal Admin Panel (`admin panel builder`)](https://developer-assistants.github.io/low-code-development-platforms/templates/admin-panel-builder/)
6. [Employee Management (`employee management app`)](https://developer-assistants.github.io/low-code-development-platforms/templates/employee-management-app/)
7. [Expense Approval Workflow (`approval workflow software`)](https://developer-assistants.github.io/low-code-development-platforms/templates/approval-workflow-software/)
8. [IT Asset Management (`asset management app`)](https://developer-assistants.github.io/low-code-development-platforms/templates/asset-management-app/)
9. [SQL Database App (`database app builder`)](https://developer-assistants.github.io/low-code-development-platforms/templates/database-app-builder/)
10. [Excel / CSV to Web App (`excel to web app`)](https://developer-assistants.github.io/low-code-development-platforms/templates/excel-to-web-app/)

## Run Locally

```bash
npm install
npm test
npm run dev
```

Build the production bundle and all static SEO pages:

```bash
npm run build
```

## Self-Host with Docker

```bash
docker compose up -d
```

The application serves on `http://localhost:8080/low-code-development-platforms/` alongside a PostgreSQL 16 container.

## License

MIT
