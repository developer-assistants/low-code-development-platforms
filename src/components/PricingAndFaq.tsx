const PRICING_TIERS = [
  {
    name: 'Community',
    price: '$0',
    period: 'MIT Self-Hosted',
    summary: 'Deploy on your own server via Docker with your own PostgreSQL/MySQL database and model API keys.',
  },
  {
    name: 'Cloud',
    price: '$19',
    period: 'per workspace / mo',
    summary: 'Managed hosting for one production database app with daily backups and custom domain.',
  },
  {
    name: 'Business',
    price: '$49',
    period: 'per workspace / mo',
    summary: 'Multiple database apps, scheduled automations, webhook retries, and CSV/Excel sync.',
  },
  {
    name: 'Team',
    price: '$99',
    period: 'per workspace / mo',
    summary: 'Multi-environment staging, granular role matrices, and team collaboration without per-seat fees.',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'annual contract',
    summary: 'SAML SSO, immutable audit logs, dedicated VPC peering, and migration support.',
  },
];

const FAQS = [
  {
    question: 'How does OpenForge avoid vendor lock-in?',
    answer:
      'Every application stores records in standard PostgreSQL, MySQL, or SQLite tables. You can export the SQL DDL, REST endpoints, CSV data, and Docker Compose stack at any time and run it independently.',
  },
  {
    question: 'Should a small team pick a database app builder or Appsmith/ToolJet?',
    answer:
      'Pick a database app builder when your project centers on SQL tables, CRUD forms, role permissions, and webhooks. Pick Appsmith or ToolJet when you need custom free-form widget dashboards wired to multiple external APIs.',
  },
  {
    question: 'Can I turn an Excel or CSV file into a multi-user web app?',
    answer:
      'Yes. Click Import CSV in the App & Forms toolbar, paste your spreadsheet rows, and the engine infers column types, generates the SQL table, and exposes search, add, and export controls.',
  },
  {
    question: 'Are the benchmark build times and seat costs reproducible?',
    answer:
      'Yes. The benchmark tests the exact same four-table Inventory Management specification (products, suppliers, stock movements, roles, and low-stock webhook). Use the seat slider and Cloud/Self-Hosted toggle above to compare total cost for your team size.',
  },
];

export function PricingAndFaq() {
  return (
    <section id="pricing" className="section section--tinted">
      <div className="container">
        <div className="section__head">
          <div>
            <h2 className="section__title">Self-Hosted vs Managed Cloud Pricing Model</h2>
            <p className="section__sub">
              Flat workspace tiers instead of per-end-user seat taxes. Self-hosting under MIT remains free regardless of team size.
            </p>
          </div>
        </div>

        <div className="pricing-grid" style={{ marginBottom: '48px' }}>
          {PRICING_TIERS.map((tier) => (
            <div key={tier.name} className="cut tier-box">
              <div className="label">{tier.name}</div>
              <div className="tier-box__price">{tier.price}</div>
              <div className="label">{tier.period}</div>
              <p style={{ fontSize: '0.875rem', marginTop: '6px' }}>{tier.summary}</p>
            </div>
          ))}
        </div>

        <div className="section__head">
          <div>
            <h2 className="section__title">Frequently Asked Questions</h2>
          </div>
        </div>

        <div className="faq-list">
          {FAQS.map((item) => (
            <div key={item.question} className="cut faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
