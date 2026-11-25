import { describe, expect, it } from 'vitest';
import { LOW_CODE_PLATFORMS } from '../src/data/platforms';
import {
  calculatePlatformCost,
  exportRowsToCsv,
  generateAppFromPrompt,
  generateDockerCompose,
  generateRestEndpoints,
  generateSqlSchema,
  parseCsvToTable,
  totalBuildMinutes,
} from '../src/engine/generator';

describe('AI Low-Code App Generator Engine', () => {
  it('matches inventory prompt to the Inventory Management blueprint', () => {
    const bp = generateAppFromPrompt(
      'Create an inventory management system with suppliers, stock tracking, employee roles and low stock notifications.',
    );
    expect(bp.id).toBe('inventory');
    expect(bp.primaryTable).toBe('products');
    expect(bp.rows.products.length).toBeGreaterThanOrEqual(4);
    expect(bp.roles.length).toBeGreaterThanOrEqual(3);
  });

  it('synthesizes a custom schema for arbitrary prompts', () => {
    const bp = generateAppFromPrompt('Track solar panel field inspections and technician signoffs');
    expect(bp.id).toContain('custom-');
    expect(bp.tables.length).toBe(2);
    expect(bp.roles.length).toBe(3);
  });

  it('generates valid SQL DDL for PostgreSQL, MySQL, and SQLite', () => {
    const bp = generateAppFromPrompt('inventory management with suppliers');
    const pg = generateSqlSchema(bp, 'postgresql');
    const mysql = generateSqlSchema(bp, 'mysql');
    const sqlite = generateSqlSchema(bp, 'sqlite');

    expect(pg).toContain('SERIAL PRIMARY KEY');
    expect(pg).toContain('REFERENCES suppliers(id)');
    expect(mysql).toContain('INT AUTO_INCREMENT PRIMARY KEY');
    expect(mysql).toContain('FOREIGN KEY (supplier_id) REFERENCES suppliers(id)');
    expect(sqlite).toContain('INTEGER PRIMARY KEY AUTOINCREMENT');
  });

  it('parses CSV input with type inference and exports back to CSV', () => {
    const csv = 'Product,Stock,Price,Status\n"Desk, Oak",14,299.50,In stock\nChair,2,149.00,Low stock';
    const { schema, rows } = parseCsvToTable(csv, 'warehouse_items');
    expect(schema.name).toBe('warehouse_items');
    expect(schema.columns.find((c) => c.name === 'stock')?.type).toBe('integer');
    expect(schema.columns.find((c) => c.name === 'price')?.type).toBe('numeric');
    expect(schema.columns.find((c) => c.name === 'status')?.type).toBe('status');
    expect(rows.length).toBe(2);
    expect(rows[0].product).toBe('Desk, Oak');

    const exported = exportRowsToCsv(schema.columns, rows);
    expect(exported).toContain('"Desk, Oak"');
    expect(exported).toContain('Low stock');
  });

  it('generates Docker Compose and REST endpoints', () => {
    const bp = generateAppFromPrompt('crm pipeline for sales reps');
    const compose = generateDockerCompose(bp);
    const endpoints = generateRestEndpoints(bp);
    expect(compose).toContain('postgres:16-alpine');
    expect(compose).toContain('schema.sql');
    expect(endpoints.map((e) => e.method)).toEqual(['GET', 'POST', 'PATCH', 'DELETE']);
  });

  it('calculates benchmark build minutes and seat costs accurately', () => {
    const openforge = LOW_CODE_PLATFORMS.find((p) => p.id === 'openforge')!;
    const retool = LOW_CODE_PLATFORMS.find((p) => p.id === 'retool')!;
    expect(totalBuildMinutes(openforge)).toBe(8);
    expect(totalBuildMinutes(retool)).toBe(66);

    expect(calculatePlatformCost(openforge, 50, 'self-hosted').monthlyUsd).toBe(0);
    expect(calculatePlatformCost(openforge, 25, 'cloud').monthlyUsd).toBe(49);
    expect(calculatePlatformCost(retool, 25, 'cloud').monthlyUsd).toBeGreaterThan(100);
  });
});
