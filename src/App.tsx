import { useEffect, useState } from 'react';
import { Database, Github } from 'lucide-react';
import { BuilderWorkbench } from './components/BuilderWorkbench';
import { ComparisonBenchmark } from './components/ComparisonBenchmark';
import { PricingAndFaq } from './components/PricingAndFaq';
import { TemplatesCatalog } from './components/TemplatesCatalog';
import { APP_TEMPLATES } from './data/templates';
import type { AppBlueprint } from './types';

function initialBlueprintFromLocation(): AppBlueprint {
  const path = window.location.pathname;
  const match = path.match(/\/templates\/([^/]+)/);
  if (match) {
    const found = APP_TEMPLATES.find((t) => t.slug === match[1]);
    if (found) return JSON.parse(JSON.stringify(found)) as AppBlueprint;
  }
  return JSON.parse(JSON.stringify(APP_TEMPLATES[0])) as AppBlueprint;
}

export function App() {
  const [blueprint, setBlueprint] = useState<AppBlueprint>(() => initialBlueprintFromLocation());

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      target?.scrollIntoView();
    }
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <a href="/low-code-development-platforms/" className="brand">
            <span className="brand__mark" aria-hidden="true">
              <Database size={16} />
            </span>
            <span>OpenForge Low-Code</span>
          </a>

          <nav className="site-nav" aria-label="Primary navigation">
            <a href="#builder">App Builder</a>
            <a href="#benchmark">Platform Benchmark</a>
            <a href="#templates">Templates</a>
            <a href="#pricing">Pricing &amp; FAQ</a>
            <a
              href="https://github.com/developer-assistants/low-code-development-platforms"
              target="_blank"
              rel="noreferrer"
              className="key key--sm"
            >
              <Github size={14} aria-hidden="true" />
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero__grid">
            <div>
              <h1 className="hero__title">
                Open-source AI low-code platform
              </h1>
              <p className="hero__lead">
                Describe a business workflow in plain text and get a PostgreSQL or MySQL schema, CRUD interface, role permissions, webhook automations, REST API, and Docker deployment files you own completely.
              </p>
              <div className="hero__actions">
                <a href="#builder" className="key key--primary">
                  Try the AI App Builder
                </a>
                <a href="#benchmark" className="key">
                  Appsmith vs ToolJet vs Retool Benchmark
                </a>
              </div>
            </div>

            <div className="cut hero__facts" aria-label="Project facts">
              <div className="fact-cell">
                <div className="fact-cell__val">8</div>
                <div className="fact-cell__label">Platforms benchmarked on one spec</div>
              </div>
              <div className="fact-cell">
                <div className="fact-cell__val">10</div>
                <div className="fact-cell__label">Runnable SQL app templates</div>
              </div>
              <div className="fact-cell">
                <div className="fact-cell__val">$0</div>
                <div className="fact-cell__label">Per-seat fee on MIT self-host</div>
              </div>
              <div className="fact-cell">
                <div className="fact-cell__val">3</div>
                <div className="fact-cell__label">SQL dialects (Postgres, MySQL, SQLite)</div>
              </div>
            </div>
          </div>
        </section>

        <BuilderWorkbench blueprint={blueprint} onBlueprintChange={setBlueprint} />
        <ComparisonBenchmark />
        <TemplatesCatalog onSelectTemplate={setBlueprint} />
        <PricingAndFaq />
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div>
            <strong>OpenForge Low-Code</strong>
            <p className="label" style={{ marginTop: '4px' }}>
              MIT open-source AI database app builder and reproducible low-code benchmark by developer-assistants.
            </p>
          </div>
          <div className="footer-links">
            <a href="/low-code-development-platforms/">Home</a>
            <a href="/low-code-development-platforms/templates/inventory-management-app-builder/">Inventory Template</a>
            <a href="/low-code-development-platforms/templates/database-app-builder/">Database App Builder</a>
            <a href="/low-code-development-platforms/compare/appsmith-vs-tooljet/">Appsmith vs ToolJet</a>
            <a href="/low-code-development-platforms/compare/retool-alternative/">Retool Alternative</a>
            <a
              href="https://github.com/developer-assistants/low-code-development-platforms"
              target="_blank"
              rel="noreferrer"
            >
              Source on GitHub
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
