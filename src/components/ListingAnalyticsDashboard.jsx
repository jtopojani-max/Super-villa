import { startTransition, useEffect, useMemo, useState } from "react";
import { Icon } from "./Shared.jsx";
import {
  ANALYTICS_TIMEFRAMES,
  buildListingBreakdownForTimeframe,
  buildOwnerTimeline,
  buildOwnerTotalsForTimeframe,
  formatBreakdownLabel,
  getDateKeyDaysAgo,
  getOwnerAnalyticsDetails,
  getOwnerAnalyticsSummary,
  listOwnerDailyStats,
  listOwnerListingStats,
  listOwnerRecentActivity,
  listOwnerRecentLeads,
} from "../services/analytics.js";
import {
  getUserSubscription,
  hasBasicAnalyticsAccess,
  hasBusinessAnalyticsAccess,
} from "../services/subscriptions.js";

const numberFormatter = new Intl.NumberFormat("sq-AL");

const KPI_CARD_CONFIG = [
  {
    key: "views",
    label: "Total Views",
    icon: "eye",
    tone: "default",
  },
  {
    key: "uniqueViews",
    label: "Unique Views",
    icon: "users",
    tone: "default",
  },
  {
    key: "whatsappClicks",
    label: "WhatsApp Clicks",
    icon: "comment-dots",
    tone: "accent",
  },
  {
    key: "leads",
    label: "Leads",
    icon: "sparkles",
    tone: "accent",
  },
];

const formatMetric = (value) => numberFormatter.format(Number(value) || 0);
const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

const formatDate = (value) => {
  if (!value) return "Pa aktivitet ende";
  try {
    return new Date(value).toLocaleString("sq-AL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (_) {
    return "Pa date";
  }
};

function AnalyticsStatCard({ label, value, icon, tone = "default", helper, locked = false }) {
  return (
    <article className={`analytics-stat-card analytics-stat-card--${tone}${locked ? " analytics-stat-card--locked" : ""}`}>
      <div className="analytics-stat-card__icon">
        <Icon n={icon} />
      </div>
      <div className="analytics-stat-card__copy">
        <span className="analytics-stat-card__label">{label}</span>
        <strong className="analytics-stat-card__value">{locked ? "Business" : value}</strong>
        <p className="analytics-stat-card__helper">
          {locked ? "Kjo metrike hapet me Business Pro." : helper}
        </p>
      </div>
    </article>
  );
}

function AnalyticsLockedPanel({ compact = false }) {
  return (
    <div className={`analytics-locked${compact ? " analytics-locked--compact" : ""}`}>
      <div className="analytics-locked__icon">
        <Icon n="shield-halved" />
      </div>
      <div className="analytics-locked__copy">
        <strong>Business Pro zhbllokon analytics te avancuara</strong>
        <p>
          Grafiqe, conversion rate, lead insights, device/referrer breakdown dhe aktiviteti i fundit
          shfaqen vetem per Business Pro.
        </p>
      </div>
      <a className="btn btn--primary analytics-locked__cta" href="/#services">
        Shiko upgrade
      </a>
    </div>
  );
}

function AnalyticsEmptyState() {
  return (
    <div className="analytics-empty">
      <Icon n="chart-line" />
      <h3>Statistikat do te shfaqen sapo listing-et te marrin vizita</h3>
      <p>
        Sistemi po pret eventet e para nga listing detail page, WhatsApp ose telefon.
      </p>
    </div>
  );
}

function TimelineChart({ items }) {
  const maxValue = useMemo(
    () => Math.max(...items.map((item) => Math.max(item.views, item.leads)), 1),
    [items]
  );

  return (
    <div className="analytics-chart">
      <div className="analytics-chart__legend">
        <span><i className="analytics-chart__dot analytics-chart__dot--views" /> Views</span>
        <span><i className="analytics-chart__dot analytics-chart__dot--leads" /> Leads</span>
      </div>
      <div className="analytics-chart__plot" role="img" aria-label="Grafik i views dhe leads per 30 ditet e fundit">
        {items.map((item) => (
          <div className="analytics-chart__slot" key={item.dateKey}>
            <span
              className="analytics-chart__bar analytics-chart__bar--views"
              style={{ height: `${Math.max((item.views / maxValue) * 100, item.views ? 8 : 0)}%` }}
              title={`${item.label}: ${formatMetric(item.views)} views`}
            />
            <span
              className="analytics-chart__bar analytics-chart__bar--leads"
              style={{ height: `${Math.max((item.leads / maxValue) * 100, item.leads ? 8 : 0)}%` }}
              title={`${item.label}: ${formatMetric(item.leads)} leads`}
            />
            <span className="analytics-chart__label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BreakdownList({ title, items, emptyText }) {
  return (
    <section className="analytics-breakdown-card">
      <div className="analytics-block__head">
        <h4>{title}</h4>
      </div>
      {items.length === 0 ? (
        <p className="analytics-breakdown-card__empty">{emptyText}</p>
      ) : (
        <ul className="analytics-breakdown-list">
          {items.slice(0, 6).map((item) => (
            <li key={item.key} className="analytics-breakdown-list__item">
              <span>{formatBreakdownLabel(item.key)}</span>
              <strong>{formatMetric(item.count)}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivityList({ title, items, leadOnly = false }) {
  return (
    <section className="analytics-activity-card">
      <div className="analytics-block__head">
        <h4>{title}</h4>
      </div>
      {items.length === 0 ? (
        <p className="analytics-breakdown-card__empty">
          {leadOnly ? "Ende nuk ka leads te regjistruara." : "Ende nuk ka aktivitet te fundit."}
        </p>
      ) : (
        <div className="analytics-activity-list">
          {items.map((item) => (
            <article key={item.id} className="analytics-activity-list__item">
              <div className="analytics-activity-list__meta">
                <strong>{item.eventLabel}</strong>
                <span>{item.listingTitle}</span>
              </div>
              <div className="analytics-activity-list__details">
                <span>{formatDate(item.occurredAt)}</span>
                <span>{formatBreakdownLabel(item.deviceType || "unknown")}</span>
                <span>{formatBreakdownLabel(item.referrerDomain || "direct")}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ListingPerformanceTable({ rows, timeframe, isBusiness }) {
  if (!rows.length) {
    return (
      <div className="analytics-table__empty">
        Nuk ka te dhena per periudhen {ANALYTICS_TIMEFRAMES.find((item) => item.id === timeframe)?.label || "zgjedhur"}.
      </div>
    );
  }

  return (
    <div className="analytics-table">
      <div className="analytics-table__head">
        <span>Listing</span>
        <span>Views</span>
        <span>WhatsApp</span>
        <span>Leads</span>
        <span>{isBusiness ? "Conv. Rate" : "Status"}</span>
      </div>
      <div className="analytics-table__body">
        {rows.map((row) => (
          <div className="analytics-table__row" key={row.listingId}>
            <span className="analytics-table__listing">
              <strong>{row.listingTitle}</strong>
              <small>{row.location || row.category || "Pa lokacion"}</small>
            </span>
            <span>{formatMetric(row.metrics?.views)}</span>
            <span>{formatMetric(row.metrics?.whatsappClicks)}</span>
            <span>{formatMetric(row.metrics?.leads)}</span>
            <span>
              {isBusiness ? (
                <strong>{formatPercent(row.conversionRate)}</strong>
              ) : (
                <small className="analytics-table__hint">Basic</small>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ListingAnalyticsDashboard({ user }) {
  const [timeframe, setTimeframe] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [state, setState] = useState({
    subscription: null,
    summary: null,
    details: null,
    listingStats: [],
    dailyStats: [],
    recentActivity: [],
    recentLeads: [],
  });

  useEffect(() => {
    if (!user?.id) return undefined;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const subscription = await getUserSubscription(user.id);

        if (!hasBasicAnalyticsAccess(subscription)) {
          if (!active) return;
          startTransition(() => {
            setState({
              subscription,
              summary: null,
              details: null,
              listingStats: [],
              dailyStats: [],
              recentActivity: [],
              recentLeads: [],
            });
          });
          return;
        }

        const shouldLoadAdvanced = hasBusinessAnalyticsAccess(subscription);
        const [summary, details, listingStats, dailyStats, recentActivity, recentLeads] = await Promise.all([
          getOwnerAnalyticsSummary(user.id),
          shouldLoadAdvanced ? getOwnerAnalyticsDetails(user.id) : Promise.resolve(null),
          listOwnerListingStats(user.id),
          listOwnerDailyStats(user.id, getDateKeyDaysAgo(29)),
          shouldLoadAdvanced ? listOwnerRecentActivity(user.id, 14) : Promise.resolve([]),
          shouldLoadAdvanced ? listOwnerRecentLeads(user.id, 8) : Promise.resolve([]),
        ]);

        if (!active) return;

        startTransition(() => {
          setState({
            subscription,
            summary,
            details,
            listingStats,
            dailyStats,
            recentActivity,
            recentLeads,
          });
        });
      } catch (loadError) {
        console.error("Failed to load analytics dashboard:", loadError);
        if (active) setError("Nuk u ngarkuan statistikat. Provo perseri.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const subscription = state.subscription;
  const hasBasic = hasBasicAnalyticsAccess(subscription);
  const hasBusiness = hasBusinessAnalyticsAccess(subscription);

  const ownerTotals = useMemo(
    () => buildOwnerTotalsForTimeframe(state.summary, state.dailyStats, timeframe),
    [state.summary, state.dailyStats, timeframe]
  );

  const listingRows = useMemo(
    () => buildListingBreakdownForTimeframe(state.listingStats, state.dailyStats, timeframe),
    [state.listingStats, state.dailyStats, timeframe]
  );

  const timeline = useMemo(
    () => buildOwnerTimeline(state.dailyStats, 30),
    [state.dailyStats]
  );

  if (loading) {
    return (
      <section className="analytics-shell analytics-shell--loading">
        <div className="admin-empty">
          <p>Duke ngarkuar statistikat...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="analytics-shell">
        <div className="analytics-error">
          <Icon n="shield-halved" />
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="analytics-shell">
      <header className="analytics-hero">
        <div className="analytics-hero__copy">
          <p className="my-posts-header__eyebrow">ANALYTICS DASHBOARD</p>
          <h2 className="analytics-hero__title">Performanca e listing-eve tuaja</h2>
          <p className="analytics-hero__subtitle">
            Ndiqni views, interesimin dhe leads ne kohe reale, me akses te diferencuar sipas planit aktiv.
          </p>
        </div>
        <div className="analytics-hero__aside">
          <span className={`analytics-plan-badge analytics-plan-badge--${subscription?.planId || "free"}`}>
            {subscription?.planLabel || "Pa pakete aktive"}
          </span>
          <p className="analytics-hero__meta">
            {subscription?.expiresAt
              ? `Skadon me ${new Date(subscription.expiresAt).toLocaleDateString("sq-AL", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}`
              : "Aktivizoni Premium ose Business Pro per te pare statistikat."}
          </p>
        </div>
      </header>

      {!hasBasic ? (
        <div className="analytics-upgrade">
          <div className="analytics-upgrade__panel">
            <div className="analytics-upgrade__copy">
              <span className="analytics-plan-badge analytics-plan-badge--free">Statistikat jane feature me pagese</span>
              <h3>Zhbllokoni dashboard profesional per listing-et tuaja</h3>
              <p>
                Premium jep statistika bazike per views, WhatsApp clicks dhe leads.
                Business Pro shton grafik, conversion rate, recent lead activity dhe breakdown sipas burimit e device.
              </p>
            </div>
            <div className="analytics-upgrade__actions">
              <a className="btn btn--primary" href="/#services">Shiko paketat</a>
              <a className="btn btn--ghost" href="/#services">Aktivizo Business Pro</a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="analytics-toolbar">
            <div className="analytics-toolbar__filters" role="tablist" aria-label="Filtro statistikat sipas periudhes">
              {ANALYTICS_TIMEFRAMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`analytics-filter${timeframe === item.id ? " is-active" : ""}`}
                  onClick={() => setTimeframe(item.id)}
                  aria-pressed={timeframe === item.id}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="analytics-toolbar__note">
              Aktiviteti regjistrohet nga detail page, WhatsApp dhe telefon.
            </div>
          </div>

          {!state.listingStats.length ? (
            <AnalyticsEmptyState />
          ) : (
            <>
              <div className="analytics-stat-grid">
                {KPI_CARD_CONFIG.map((card) => (
                  <AnalyticsStatCard
                    key={card.key}
                    label={card.label}
                    icon={card.icon}
                    tone={card.tone}
                    value={formatMetric(ownerTotals[card.key])}
                    helper={`Periudha: ${ANALYTICS_TIMEFRAMES.find((item) => item.id === timeframe)?.label || "30 dite"}`}
                  />
                ))}
                <AnalyticsStatCard
                  label="Conversion Rate"
                  icon="chart-line"
                  tone="premium"
                  value={formatPercent(ownerTotals.conversionRate)}
                  helper="Leads / Views"
                  locked={!hasBusiness}
                />
              </div>

              <div className="analytics-grid">
                <section className="analytics-panel analytics-panel--wide">
                  <div className="analytics-block__head">
                    <div>
                      <h3>Performanca per periudhen e zgjedhur</h3>
                      <p>
                        {timeframe === "all"
                          ? "Pamje aggregate per gjithe historikun e listing-eve."
                          : "Metrikat llogariten nga agregimet ditore per performance dhe kosto te kontrolluar."}
                      </p>
                    </div>
                  </div>
                  <ListingPerformanceTable rows={listingRows} timeframe={timeframe} isBusiness={hasBusiness} />
                </section>

                <section className="analytics-panel">
                  <div className="analytics-block__head">
                    <div>
                      <h3>Shikim i shpejte</h3>
                      <p>Totalet per te gjitha listing-et aktive te profilit tuaj.</p>
                    </div>
                  </div>
                  <dl className="analytics-summary-list">
                    <div>
                      <dt>Total listings</dt>
                      <dd>{formatMetric(state.summary?.listingCount || state.listingStats.length)}</dd>
                    </div>
                    <div>
                      <dt>Total phone clicks</dt>
                      <dd>{formatMetric(ownerTotals.phoneClicks)}</dd>
                    </div>
                    <div>
                      <dt>Contact submits</dt>
                      <dd>{formatMetric(ownerTotals.contactSubmits)}</dd>
                    </div>
                    <div>
                      <dt>Lead rate</dt>
                      <dd>{formatPercent(ownerTotals.conversionRate)}</dd>
                    </div>
                  </dl>
                </section>
              </div>

              <div className="analytics-grid analytics-grid--secondary">
                <section className="analytics-panel analytics-panel--wide">
                  <div className="analytics-block__head">
                    <div>
                      <h3>Trend 30 ditor</h3>
                      <p>Grafik i agreguar i views dhe leads per 30 ditet e fundit.</p>
                    </div>
                  </div>
                  {hasBusiness ? <TimelineChart items={timeline} /> : <AnalyticsLockedPanel compact />}
                </section>

                <section className="analytics-panel">
                  <div className="analytics-block__head">
                    <div>
                      <h3>Trust & visibility</h3>
                      <p>Ky seksion ju ndihmon te kuptoni sa shpejt po gjeneroni interes.</p>
                    </div>
                  </div>
                  <div className="analytics-mini-cards">
                    <article>
                      <span>Leads sot</span>
                      <strong>
                        {
                          buildOwnerTotalsForTimeframe(
                            state.summary,
                            state.dailyStats,
                            "today"
                          ).leads
                        }
                      </strong>
                    </article>
                    <article>
                      <span>Views 7 dite</span>
                      <strong>
                        {
                          buildOwnerTotalsForTimeframe(
                            state.summary,
                            state.dailyStats,
                            "7d"
                          ).views
                        }
                      </strong>
                    </article>
                    <article>
                      <span>WhatsApp 30 dite</span>
                      <strong>
                        {
                          buildOwnerTotalsForTimeframe(
                            state.summary,
                            state.dailyStats,
                            "30d"
                          ).whatsappClicks
                        }
                      </strong>
                    </article>
                  </div>
                </section>
              </div>

              <div className="analytics-grid analytics-grid--secondary">
                {hasBusiness ? (
                  <>
                    <BreakdownList
                      title="Burimet kryesore"
                      items={state.details?.sourceBreakdown || []}
                      emptyText="Burimet do te shfaqen sapo te vijne vizitat e para."
                    />
                    <BreakdownList
                      title="Paisjet"
                      items={state.details?.deviceBreakdown || []}
                      emptyText="Nuk ka ende device breakdown."
                    />
                    <BreakdownList
                      title="Referrer"
                      items={state.details?.referrerBreakdown || []}
                      emptyText="Nuk ka ende referrer breakdown."
                    />
                  </>
                ) : (
                  <section className="analytics-panel analytics-panel--wide">
                    <div className="analytics-block__head">
                      <div>
                        <h3>Breakdown te avancuara</h3>
                        <p>Source, device dhe referrer insights hapen me Business Pro.</p>
                      </div>
                    </div>
                    <AnalyticsLockedPanel compact />
                  </section>
                )}
              </div>

              <div className="analytics-grid analytics-grid--secondary">
                {hasBusiness ? (
                  <>
                    <ActivityList title="Recent activity" items={state.recentActivity} />
                    <ActivityList title="Recent leads" items={state.recentLeads} leadOnly />
                  </>
                ) : (
                  <section className="analytics-panel analytics-panel--wide">
                    <div className="analytics-block__head">
                      <div>
                        <h3>Insights te avancuara</h3>
                        <p>
                          Recent activity, lead stream, device/referrer details dhe event breakdown
                          jane pjese e Business Pro.
                        </p>
                      </div>
                    </div>
                    <AnalyticsLockedPanel compact />
                  </section>
                )}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
