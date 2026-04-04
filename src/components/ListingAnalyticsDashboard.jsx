import { startTransition, useEffect, useMemo, useState } from "react";
import { Icon } from "./Shared.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { formatUiDate } from "../i18n/ui.js";
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

const COPY = {
  sq: {
    kpi: {
      views: "Total Views",
      uniqueViews: "Unique Views",
      whatsappClicks: "WhatsApp Clicks",
      leads: "Leads",
      conversionRate: "Conversion Rate",
    },
    noActivity: "Pa aktivitet ende",
    noDate: "Pa date",
    businessValue: "Business",
    businessLocked: "Kjo metrike hapet me Business Pro.",
    lockedTitle: "Business Pro zhbllokon analytics te avancuara",
    lockedCopy: "Grafiqe, conversion rate, lead insights, device/referrer breakdown dhe aktiviteti i fundit shfaqen vetem per Business Pro.",
    lockedCta: "Shiko upgrade",
    emptyTitle: "Statistikat do te shfaqen sapo listing-et te marrin vizita",
    emptyCopy: "Sistemi po pret eventet e para nga listing detail page, WhatsApp ose telefon.",
    tableEmptyPrefix: "Nuk ka te dhena per periudhen",
    tableEmptySuffix: "zgjedhur",
    tableListing: "Listing",
    tableViews: "Views",
    tableWhatsapp: "WhatsApp",
    tableLeads: "Leads",
    tableStatus: "Status",
    tableConv: "Conv. Rate",
    noLocation: "Pa lokacion",
    basic: "Basic",
    loading: "Duke ngarkuar statistikat...",
    error: "Nuk u ngarkuan statistikat. Provo perseri.",
    heroEyebrow: "ANALYTICS DASHBOARD",
    heroTitle: "Performanca e listing-eve tuaja",
    heroSubtitle: "Ndiqni views, interesimin dhe leads ne kohe reale, me akses te diferencuar sipas planit aktiv.",
    noPlan: "Pa pakete aktive",
    expiresOn: "Skadon me",
    pendingPlan: "Plani juaj eshte ne pritje te verifikimit nga administratori.",
    inactivePlan: "Aktivizoni Premium ose Business Pro per te pare statistikat.",
    activatePlans: "Aktivizoni Premium ose Business Pro per te pare statistikat.",
    upgradeChip: "Statistikat jane feature me pagese",
    upgradeTitle: "Zhbllokoni dashboard profesional per listing-et tuaja",
    upgradeCopy: "Premium jep statistika bazike per views, WhatsApp clicks dhe leads. Business Pro shton grafik, conversion rate, recent lead activity dhe breakdown sipas burimit e device.",
    viewPlans: "Shiko paketat",
    activateBusiness: "Aktivizo Business Pro",
    toolbarAria: "Filtro statistikat sipas periudhes",
    toolbarNote: "Aktiviteti regjistrohet nga detail page, WhatsApp dhe telefon.",
    periodLabel: "Periudha",
    sectionPerformance: "Performanca per periudhen e zgjedhur",
    sectionPerformanceAll: "Pamje aggregate per gjithe historikun e listing-eve.",
    sectionPerformanceRange: "Metrikat llogariten nga agregimet ditore per performance dhe kosto te kontrolluar.",
    quickView: "Shikim i shpejte",
    quickViewCopy: "Totalet per te gjitha listing-et aktive te profilit tuaj.",
    totalListings: "Total listings",
    totalPhoneClicks: "Total phone clicks",
    contactSubmits: "Contact submits",
    leadRate: "Lead rate",
    trendTitle: "Trend 30 ditor",
    trendCopy: "Grafik i agreguar i views dhe leads per 30 ditet e fundit.",
    trustTitle: "Trust & visibility",
    trustCopy: "Ky seksion ju ndihmon te kuptoni sa shpejt po gjeneroni interes.",
    leadsToday: "Leads sot",
    views7d: "Views 7 dite",
    whatsapp30d: "WhatsApp 30 dite",
    sourcesTitle: "Burimet kryesore",
    sourcesEmpty: "Burimet do te shfaqen sapo te vijne vizitat e para.",
    devicesTitle: "Paisjet",
    devicesEmpty: "Nuk ka ende device breakdown.",
    referrersTitle: "Referrer",
    referrersEmpty: "Nuk ka ende referrer breakdown.",
    advancedTitle: "Breakdown te avancuara",
    advancedCopy: "Source, device dhe referrer insights hapen me Business Pro.",
    recentActivity: "Recent activity",
    recentLeads: "Recent leads",
    insightsTitle: "Insights te avancuara",
    insightsCopy: "Recent activity, lead stream, device/referrer details dhe event breakdown jane pjese e Business Pro.",
    noLeadsYet: "Ende nuk ka leads te regjistruara.",
    noActivityYet: "Ende nuk ka aktivitet te fundit.",
  },
  en: {
    kpi: {
      views: "Total Views",
      uniqueViews: "Unique Views",
      whatsappClicks: "WhatsApp Clicks",
      leads: "Leads",
      conversionRate: "Conversion Rate",
    },
    noActivity: "No activity yet",
    noDate: "No date",
    businessValue: "Business",
    businessLocked: "This metric unlocks with Business Pro.",
    lockedTitle: "Business Pro unlocks advanced analytics",
    lockedCopy: "Charts, conversion rate, lead insights, device/referrer breakdowns, and recent activity are available only with Business Pro.",
    lockedCta: "See upgrade",
    emptyTitle: "Analytics will appear once your listings start getting visits",
    emptyCopy: "The system is waiting for the first events from the listing detail page, WhatsApp, or phone.",
    tableEmptyPrefix: "No data for the selected period",
    tableEmptySuffix: "",
    tableListing: "Listing",
    tableViews: "Views",
    tableWhatsapp: "WhatsApp",
    tableLeads: "Leads",
    tableStatus: "Status",
    tableConv: "Conv. Rate",
    noLocation: "No location",
    basic: "Basic",
    loading: "Loading analytics...",
    error: "Could not load analytics. Please try again.",
    heroEyebrow: "ANALYTICS DASHBOARD",
    heroTitle: "Your listing performance",
    heroSubtitle: "Track views, interest, and leads in real time, with access based on your active plan.",
    noPlan: "No active plan",
    expiresOn: "Expires on",
    pendingPlan: "Your plan is waiting for administrator verification.",
    inactivePlan: "Activate Premium or Business Pro to view analytics.",
    activatePlans: "Activate Premium or Business Pro to view analytics.",
    upgradeChip: "Analytics are a paid feature",
    upgradeTitle: "Unlock a professional dashboard for your listings",
    upgradeCopy: "Premium gives you basic analytics for views, WhatsApp clicks, and leads. Business Pro adds charts, conversion rate, recent lead activity, and source/device breakdowns.",
    viewPlans: "View plans",
    activateBusiness: "Activate Business Pro",
    toolbarAria: "Filter analytics by period",
    toolbarNote: "Activity is recorded from the detail page, WhatsApp, and phone.",
    periodLabel: "Period",
    sectionPerformance: "Performance for the selected period",
    sectionPerformanceAll: "Aggregate view across your full listing history.",
    sectionPerformanceRange: "Metrics are calculated from daily aggregates for controlled performance and cost.",
    quickView: "Quick view",
    quickViewCopy: "Totals across all active listings in your profile.",
    totalListings: "Total listings",
    totalPhoneClicks: "Total phone clicks",
    contactSubmits: "Contact submits",
    leadRate: "Lead rate",
    trendTitle: "30-day trend",
    trendCopy: "Aggregate chart of views and leads over the last 30 days.",
    trustTitle: "Trust & visibility",
    trustCopy: "This section helps you understand how quickly you are generating interest.",
    leadsToday: "Leads today",
    views7d: "Views in 7 days",
    whatsapp30d: "WhatsApp in 30 days",
    sourcesTitle: "Top sources",
    sourcesEmpty: "Sources will appear as soon as the first visits arrive.",
    devicesTitle: "Devices",
    devicesEmpty: "No device breakdown yet.",
    referrersTitle: "Referrers",
    referrersEmpty: "No referrer breakdown yet.",
    advancedTitle: "Advanced breakdowns",
    advancedCopy: "Source, device, and referrer insights unlock with Business Pro.",
    recentActivity: "Recent activity",
    recentLeads: "Recent leads",
    insightsTitle: "Advanced insights",
    insightsCopy: "Recent activity, lead stream, device/referrer details, and event breakdowns are part of Business Pro.",
    noLeadsYet: "No leads recorded yet.",
    noActivityYet: "No recent activity yet.",
  },
};

function AnalyticsStatCard({ label, value, icon, tone = "default", helper, locked = false, copy }) {
  return (
    <article className={`analytics-stat-card analytics-stat-card--${tone}${locked ? " analytics-stat-card--locked" : ""}`}>
      <div className="analytics-stat-card__icon">
        <Icon n={icon} />
      </div>
      <div className="analytics-stat-card__copy">
        <span className="analytics-stat-card__label">{label}</span>
        <strong className="analytics-stat-card__value">{locked ? copy.businessValue : value}</strong>
        <p className="analytics-stat-card__helper">{locked ? copy.businessLocked : helper}</p>
      </div>
    </article>
  );
}

function AnalyticsLockedPanel({ compact = false, copy }) {
  return (
    <div className={`analytics-locked${compact ? " analytics-locked--compact" : ""}`}>
      <div className="analytics-locked__icon">
        <Icon n="shield-halved" />
      </div>
      <div className="analytics-locked__copy">
        <strong>{copy.lockedTitle}</strong>
        <p>{copy.lockedCopy}</p>
      </div>
      <a className="btn btn--primary analytics-locked__cta" href="/#services">
        {copy.lockedCta}
      </a>
    </div>
  );
}

function AnalyticsEmptyState({ copy }) {
  return (
    <div className="analytics-empty">
      <Icon n="chart-line" />
      <h3>{copy.emptyTitle}</h3>
      <p>{copy.emptyCopy}</p>
    </div>
  );
}

function TimelineChart({ items }) {
  const maxValue = useMemo(() => Math.max(...items.map((item) => Math.max(item.views, item.leads)), 1), [items]);

  return (
    <div className="analytics-chart">
      <div className="analytics-chart__legend">
        <span><i className="analytics-chart__dot analytics-chart__dot--views" /> Views</span>
        <span><i className="analytics-chart__dot analytics-chart__dot--leads" /> Leads</span>
      </div>
      <div className="analytics-chart__plot" role="img" aria-label="Views and leads chart for the last 30 days">
        {items.map((item) => (
          <div className="analytics-chart__slot" key={item.dateKey}>
            <span
              className="analytics-chart__bar analytics-chart__bar--views"
              style={{ height: `${Math.max((item.views / maxValue) * 100, item.views ? 8 : 0)}%` }}
              title={`${item.label}: ${item.views} views`}
            />
            <span
              className="analytics-chart__bar analytics-chart__bar--leads"
              style={{ height: `${Math.max((item.leads / maxValue) * 100, item.leads ? 8 : 0)}%` }}
              title={`${item.label}: ${item.leads} leads`}
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
              <strong>{Number(item.count || 0)}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivityList({ title, items, leadOnly = false, copy, lang }) {
  return (
    <section className="analytics-activity-card">
      <div className="analytics-block__head">
        <h4>{title}</h4>
      </div>
      {items.length === 0 ? (
        <p className="analytics-breakdown-card__empty">{leadOnly ? copy.noLeadsYet : copy.noActivityYet}</p>
      ) : (
        <div className="analytics-activity-list">
          {items.map((item) => (
            <article key={item.id} className="analytics-activity-list__item">
              <div className="analytics-activity-list__meta">
                <strong>{item.eventLabel}</strong>
                <span>{item.listingTitle}</span>
              </div>
              <div className="analytics-activity-list__details">
                <span>{formatUiDate(item.occurredAt, lang, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) || copy.noDate}</span>
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

function ListingPerformanceTable({ rows, timeframe, isBusiness, copy }) {
  if (!rows.length) {
    const timeframeLabel = ANALYTICS_TIMEFRAMES.find((item) => item.id === timeframe)?.label || copy.tableEmptySuffix;
    return <div className="analytics-table__empty">{[copy.tableEmptyPrefix, timeframeLabel].filter(Boolean).join(" ")}</div>;
  }

  return (
    <div className="analytics-table">
      <div className="analytics-table__head">
        <span>{copy.tableListing}</span>
        <span>{copy.tableViews}</span>
        <span>{copy.tableWhatsapp}</span>
        <span>{copy.tableLeads}</span>
        <span>{isBusiness ? copy.tableConv : copy.tableStatus}</span>
      </div>
      <div className="analytics-table__body">
        {rows.map((row) => (
          <div className="analytics-table__row" key={row.listingId}>
            <span className="analytics-table__listing">
              <strong>{row.listingTitle}</strong>
              <small>{row.location || row.category || copy.noLocation}</small>
            </span>
            <span>{Number(row.metrics?.views || 0)}</span>
            <span>{Number(row.metrics?.whatsappClicks || 0)}</span>
            <span>{Number(row.metrics?.leads || 0)}</span>
            <span>{isBusiness ? <strong>{`${Number(row.conversionRate || 0).toFixed(1)}%`}</strong> : <small className="analytics-table__hint">{copy.basic}</small>}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ListingAnalyticsDashboard({ user, isAdmin = false }) {
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.sq;
  const numberFormatter = useMemo(() => new Intl.NumberFormat(lang === "en" ? "en-US" : "sq-AL"), [lang]);
  const formatMetric = (value) => numberFormatter.format(Number(value) || 0);
  const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

  const kpiCards = useMemo(
    () => [
      { key: "views", label: copy.kpi.views, icon: "eye", tone: "default" },
      { key: "uniqueViews", label: copy.kpi.uniqueViews, icon: "users", tone: "default" },
      { key: "whatsappClicks", label: copy.kpi.whatsappClicks, icon: "comment-dots", tone: "accent" },
      { key: "leads", label: copy.kpi.leads, icon: "sparkles", tone: "accent" },
    ],
    [copy]
  );

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
        if (!isAdmin && !hasBasicAnalyticsAccess(subscription)) {
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

        const shouldLoadAdvanced = isAdmin || hasBusinessAnalyticsAccess(subscription);
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
          setState({ subscription, summary, details, listingStats, dailyStats, recentActivity, recentLeads });
        });
      } catch (loadError) {
        console.error("Failed to load analytics dashboard:", loadError);
        if (active) setError(copy.error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [copy.error, isAdmin, user?.id]);

  const subscription = state.subscription;
  const hasBasic = isAdmin || hasBasicAnalyticsAccess(subscription);
  const hasBusiness = isAdmin || hasBusinessAnalyticsAccess(subscription);
  const subscriptionMeta = subscription?.status === "pending"
    ? copy.pendingPlan
    : subscription?.expiresAt
    ? `${copy.expiresOn} ${formatUiDate(subscription.expiresAt, lang, { day: "2-digit", month: "short", year: "numeric" })}`
    : copy.inactivePlan;

  const ownerTotals = useMemo(
    () => buildOwnerTotalsForTimeframe(state.summary, state.dailyStats, timeframe),
    [state.summary, state.dailyStats, timeframe]
  );

  const listingRows = useMemo(
    () => buildListingBreakdownForTimeframe(state.listingStats, state.dailyStats, timeframe),
    [state.listingStats, state.dailyStats, timeframe]
  );

  const timeline = useMemo(() => buildOwnerTimeline(state.dailyStats, 30), [state.dailyStats]);

  if (loading) {
    return (
      <section className="analytics-shell analytics-shell--loading">
        <div className="admin-empty">
          <p>{copy.loading}</p>
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
          <p className="my-posts-header__eyebrow">{copy.heroEyebrow}</p>
          <h2 className="analytics-hero__title">{copy.heroTitle}</h2>
          <p className="analytics-hero__subtitle">{copy.heroSubtitle}</p>
        </div>
        <div className="analytics-hero__aside">
          <span className={`analytics-plan-badge analytics-plan-badge--${subscription?.planId || "free"}`}>
            {subscription?.planLabel || copy.noPlan}
          </span>
          <p className="analytics-hero__meta">{subscriptionMeta}</p>
        </div>
      </header>

      {!hasBasic ? (
        <div className="analytics-upgrade">
          <div className="analytics-upgrade__panel">
            <div className="analytics-upgrade__copy">
              <span className="analytics-plan-badge analytics-plan-badge--free">{copy.upgradeChip}</span>
              <h3>{copy.upgradeTitle}</h3>
              <p>{copy.upgradeCopy}</p>
            </div>
            <div className="analytics-upgrade__actions">
              <a className="btn btn--primary" href="/#services">{copy.viewPlans}</a>
              <a className="btn btn--ghost" href="/#services">{copy.activateBusiness}</a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="analytics-toolbar">
            <div className="analytics-toolbar__filters" role="tablist" aria-label={copy.toolbarAria}>
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
            <div className="analytics-toolbar__note">{copy.toolbarNote}</div>
          </div>

          {!state.listingStats.length ? (
            <AnalyticsEmptyState copy={copy} />
          ) : (
            <>
              <div className="analytics-stat-grid">
                {kpiCards.map((card) => (
                  <AnalyticsStatCard
                    key={card.key}
                    label={card.label}
                    icon={card.icon}
                    tone={card.tone}
                    value={formatMetric(ownerTotals[card.key])}
                    helper={`${copy.periodLabel}: ${ANALYTICS_TIMEFRAMES.find((item) => item.id === timeframe)?.label || "30d"}`}
                    copy={copy}
                  />
                ))}
                <AnalyticsStatCard
                  label={copy.kpi.conversionRate}
                  icon="chart-line"
                  tone="premium"
                  value={formatPercent(ownerTotals.conversionRate)}
                  helper="Leads / Views"
                  locked={!hasBusiness}
                  copy={copy}
                />
              </div>

              <div className="analytics-grid">
                <section className="analytics-panel analytics-panel--wide">
                  <div className="analytics-block__head">
                    <div>
                      <h3>{copy.sectionPerformance}</h3>
                      <p>{timeframe === "all" ? copy.sectionPerformanceAll : copy.sectionPerformanceRange}</p>
                    </div>
                  </div>
                  <ListingPerformanceTable rows={listingRows} timeframe={timeframe} isBusiness={hasBusiness} copy={copy} />
                </section>

                <section className="analytics-panel">
                  <div className="analytics-block__head">
                    <div>
                      <h3>{copy.quickView}</h3>
                      <p>{copy.quickViewCopy}</p>
                    </div>
                  </div>
                  <dl className="analytics-summary-list">
                    <div>
                      <dt>{copy.totalListings}</dt>
                      <dd>{formatMetric(state.summary?.listingCount || state.listingStats.length)}</dd>
                    </div>
                    <div>
                      <dt>{copy.totalPhoneClicks}</dt>
                      <dd>{formatMetric(ownerTotals.phoneClicks)}</dd>
                    </div>
                    <div>
                      <dt>{copy.contactSubmits}</dt>
                      <dd>{formatMetric(ownerTotals.contactSubmits)}</dd>
                    </div>
                    <div>
                      <dt>{copy.leadRate}</dt>
                      <dd>{formatPercent(ownerTotals.conversionRate)}</dd>
                    </div>
                  </dl>
                </section>
              </div>

              <div className="analytics-grid analytics-grid--secondary">
                <section className="analytics-panel analytics-panel--wide">
                  <div className="analytics-block__head">
                    <div>
                      <h3>{copy.trendTitle}</h3>
                      <p>{copy.trendCopy}</p>
                    </div>
                  </div>
                  {hasBusiness ? <TimelineChart items={timeline} /> : <AnalyticsLockedPanel compact copy={copy} />}
                </section>

                <section className="analytics-panel">
                  <div className="analytics-block__head">
                    <div>
                      <h3>{copy.trustTitle}</h3>
                      <p>{copy.trustCopy}</p>
                    </div>
                  </div>
                  <div className="analytics-mini-cards">
                    <article>
                      <span>{copy.leadsToday}</span>
                      <strong>{buildOwnerTotalsForTimeframe(state.summary, state.dailyStats, "today").leads}</strong>
                    </article>
                    <article>
                      <span>{copy.views7d}</span>
                      <strong>{buildOwnerTotalsForTimeframe(state.summary, state.dailyStats, "7d").views}</strong>
                    </article>
                    <article>
                      <span>{copy.whatsapp30d}</span>
                      <strong>{buildOwnerTotalsForTimeframe(state.summary, state.dailyStats, "30d").whatsappClicks}</strong>
                    </article>
                  </div>
                </section>
              </div>

              <div className="analytics-grid analytics-grid--secondary">
                {hasBusiness ? (
                  <>
                    <BreakdownList title={copy.sourcesTitle} items={state.details?.sourceBreakdown || []} emptyText={copy.sourcesEmpty} />
                    <BreakdownList title={copy.devicesTitle} items={state.details?.deviceBreakdown || []} emptyText={copy.devicesEmpty} />
                    <BreakdownList title={copy.referrersTitle} items={state.details?.referrerBreakdown || []} emptyText={copy.referrersEmpty} />
                  </>
                ) : (
                  <section className="analytics-panel analytics-panel--wide">
                    <div className="analytics-block__head">
                      <div>
                        <h3>{copy.advancedTitle}</h3>
                        <p>{copy.advancedCopy}</p>
                      </div>
                    </div>
                    <AnalyticsLockedPanel compact copy={copy} />
                  </section>
                )}
              </div>

              <div className="analytics-grid analytics-grid--secondary">
                {hasBusiness ? (
                  <>
                    <ActivityList title={copy.recentActivity} items={state.recentActivity} copy={copy} lang={lang} />
                    <ActivityList title={copy.recentLeads} items={state.recentLeads} leadOnly copy={copy} lang={lang} />
                  </>
                ) : (
                  <section className="analytics-panel analytics-panel--wide">
                    <div className="analytics-block__head">
                      <div>
                        <h3>{copy.insightsTitle}</h3>
                        <p>{copy.insightsCopy}</p>
                      </div>
                    </div>
                    <AnalyticsLockedPanel compact copy={copy} />
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
