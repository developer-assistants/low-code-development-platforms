import { ArrowUpRight } from 'lucide-react';
import { COMPARISON_GUIDES } from '../data/comparisons';
import { APP_TEMPLATES } from '../data/templates';
import type { AppBlueprint } from '../types';

interface Props {
  onSelectTemplate: (bp: AppBlueprint) => void;
}

const BASE = '/low-code-development-platforms';

export function TemplatesCatalog({ onSelectTemplate }: Props) {
  return (
    <section id="templates" className="section">
      <div className="container">
        <div className="section__head">
          <div>
            <h2 className="section__title">10 Ready-to-Deploy Business App Templates</h2>
            <p className="section__sub">
              Load any template directly into the interactive builder above, inspect its SQL schema and RBAC matrix, or open its standalone technical specification page.
            </p>
          </div>
        </div>

        <div className="catalog-grid" style={{ marginBottom: '48px' }}>
          {APP_TEMPLATES.map((tpl) => (
            <article key={tpl.id} className="cut template-item">
              <div>
                <div className="label">{tpl.seoQuery}</div>
                <h3 style={{ marginBlock: '6px 8px', fontSize: '1.15rem' }}>{tpl.name}</h3>
                <p style={{ fontSize: '0.875rem' }}>{tpl.summary}</p>
              </div>
              <div className="template-item__meta">
                <button
                  type="button"
                  className="key key--sm key--primary"
                  onClick={() => {
                    onSelectTemplate(JSON.parse(JSON.stringify(tpl)) as AppBlueprint);
                    document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Open in Builder
                </button>
                <a href={`${BASE}/templates/${tpl.slug}/`} style={{ fontSize: '0.8125rem' }}>
                  Spec page <ArrowUpRight size={13} style={{ verticalAlign: 'middle' }} />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="section__head">
          <div>
            <h2 className="section__title">Platform Comparisons and Niche Guides</h2>
            <p className="section__sub">
              Focused architecture guides comparing self-hosted low-code tools, Retool alternatives, CRUD generators, and SQL GUI builders.
            </p>
          </div>
        </div>

        <div className="catalog-grid">
          {COMPARISON_GUIDES.map((guide) => (
            <article key={guide.slug} className="cut template-item">
              <div>
                <div className="label">{guide.keyword}</div>
                <h3 style={{ marginBlock: '6px 8px', fontSize: '1.1rem' }}>{guide.title}</h3>
                <p style={{ fontSize: '0.875rem' }}>{guide.description}</p>
              </div>
              <div className="template-item__meta">
                <a href={`${BASE}/compare/${guide.slug}/`} className="key key--sm">
                  Read comparison
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
