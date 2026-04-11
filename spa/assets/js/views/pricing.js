/**
 * pricing.js — Pricing / plans view.
 *
 * Three tiers: Free, Pro, Enterprise.
 * Mock upgrade flow: clicking a paid plan simulates upgrade via localStorage.
 */

import { state } from '../modules/state.js';
import { toast }  from '../modules/toast.js';

const PLANS = [
  {
    id:       'free',
    name:     'Free',
    amount:   '0',
    period:   'forever',
    desc:     'Perfect for personal use and exploring SecureScope\'s capabilities.',
    features: [
      { label: '20 scans per day',                included: true  },
      { label: 'Domain & IP lookup',              included: true  },
      { label: 'Scan history (last 30 days)',     included: true  },
      { label: 'Dark / light theme',              included: true  },
      { label: 'AI assistant',                    included: false },
      { label: 'PDF / CSV export',                included: false },
      { label: 'Monitoring alerts',               included: false },
      { label: 'Priority support',               included: false },
    ],
    cta:     'Current plan',
    popular: false,
  },
  {
    id:       'pro',
    name:     'Pro',
    amount:   '12',
    period:   'month',
    desc:     'For security professionals who need unlimited access and advanced analysis.',
    features: [
      { label: 'Unlimited scans',                 included: true },
      { label: 'All intelligence tools',          included: true },
      { label: 'Full scan history',               included: true },
      { label: 'Dark / light theme',              included: true },
      { label: 'AI assistant & risk scoring',     included: true },
      { label: 'PDF / CSV export',                included: true },
      { label: 'Monitoring alerts',               included: true },
      { label: 'Priority support',               included: true },
    ],
    cta:     'Upgrade to Pro',
    popular: true,
  },
  {
    id:       'enterprise',
    name:     'Enterprise',
    amount:   '—',
    period:   'custom',
    desc:     'Custom pricing for teams, agencies, and organisations with bespoke needs.',
    features: [
      { label: 'Everything in Pro',               included: true },
      { label: 'Custom API rate limits',          included: true },
      { label: 'Team workspaces',                 included: true },
      { label: 'SSO / SAML login',                included: true },
      { label: 'Dedicated account manager',       included: true },
      { label: 'SLA guarantee',                   included: true },
      { label: 'On-prem deployment option',       included: true },
      { label: 'Custom integrations',             included: true },
    ],
    cta:     'Contact Sales',
    popular: false,
  },
];

const CHECK_ICON = `
  <svg class="pricing-feature__check" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022
      L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75
      0 0 0-.01-1.05z" clip-rule="evenodd"/>
  </svg>`;

const CROSS_ICON = `
  <svg class="pricing-feature__check" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708
      L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5
      0 0 0-.708-.708L8 7.293 5.354 4.646z" clip-rule="evenodd"/>
  </svg>`;

/* ── Main render ────────────────────────────────────────────────── */
export function renderPricing() {
  const view = document.getElementById('view');
  if (!view) return;

  const user   = state.get('user') ?? {};
  const isPro  = user.plan === 'pro';

  view.innerHTML = `
    <div class="page-container animate-fade-in">

      <div class="page-header" style="flex-direction:column;align-items:center;text-align:center;
                                       margin-bottom:var(--sp-8);">
        <h1 class="page-title" style="font-size:1.75rem;letter-spacing:-0.03em;">
          Simple, Transparent Pricing
        </h1>
        <p class="page-sub" style="font-size:0.9375rem;max-width:420px;margin-top:var(--sp-2);">
          Start free. Upgrade when you need more. No hidden fees.
        </p>
      </div>

      <div class="pricing-grid">
        ${PLANS.map(plan => `
          <div class="pricing-card ${plan.popular ? 'pricing-card--popular' : ''}"
               data-plan="${plan.id}">

            <div class="pricing-card__name">${plan.name}</div>

            <div class="pricing-card__price">
              ${plan.amount !== '—' ? `
                <span class="pricing-card__currency">$</span>
                <span class="pricing-card__amount">${plan.amount}</span>
                <span class="pricing-card__period">/ ${plan.period}</span>
              ` : `
                <span class="pricing-card__amount" style="font-size:1.75rem;">Custom</span>
              `}
            </div>

            <p class="pricing-card__desc">${plan.desc}</p>

            <ul class="pricing-card__features" role="list">
              ${plan.features.map(f => `
                <li class="pricing-feature ${f.included ? 'pricing-feature--included' : 'pricing-feature--excluded'}">
                  ${f.included ? CHECK_ICON : CROSS_ICON}
                  ${f.label}
                </li>
              `).join('')}
            </ul>

            <button
              class="btn btn--full ${plan.popular ? 'btn--primary' : 'btn--secondary'} plan-cta-btn"
              data-plan-id="${plan.id}"
              type="button"
              ${plan.id === 'free' && !isPro ? 'disabled' : ''}
              ${plan.id === 'free' && isPro  ? '' : ''}
            >
              ${plan.id === 'free' && !isPro
                ? 'Current Plan'
                : plan.id === 'pro' && isPro
                  ? '✓ Active'
                  : plan.cta}
            </button>

          </div>
        `).join('')}
      </div>

      <!-- FAQ / reassurance strip -->
      <div style="display:flex;flex-wrap:wrap;gap:var(--sp-5);justify-content:center;
                  margin-top:var(--sp-6);padding:var(--sp-5);
                  border-radius:var(--r-xl);border:1px solid var(--border);
                  background:var(--surface);">
        ${[
          ['No credit card needed for Free', '🆓'],
          ['Cancel Pro any time',            '🔓'],
          ['Data stays in your browser',     '🔒'],
          ['Open-source roadmap',            '📋'],
        ].map(([label, emoji]) => `
          <div style="display:flex;align-items:center;gap:var(--sp-2);
                      font-size:0.8125rem;color:var(--text-muted);">
            <span style="font-size:1rem;">${emoji}</span>
            <span>${label}</span>
          </div>
        `).join('')}
      </div>

    </div>
  `;

  // ── Wire CTA buttons ─────────────────────────────────────────── //
  view.querySelectorAll('.plan-cta-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const planId = btn.dataset.planId;

      if (planId === 'free') return; // already free

      if (planId === 'enterprise') {
        toast.info('Contact sales@securescope.io to discuss Enterprise pricing.');
        return;
      }

      if (planId === 'pro') {
        if (isPro) {
          toast.info('You are already on the Pro plan.');
          return;
        }
        // Mock upgrade
        const user = state.get('user') ?? {};
        state.set('user', { ...user, plan: 'pro' });

        // Update sidebar plan badge
        const badge = document.getElementById('sidebar-plan-badge');
        if (badge) {
          badge.textContent = 'Pro';
          badge.className   = 'plan-badge plan-badge--pro';
        }

        toast.success('🎉 Welcome to Pro! Unlimited scans and all tools are now unlocked.');
        renderPricing(); // re-render to reflect new plan
      }
    });
  });
}
