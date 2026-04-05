import { startTransition, useEffect, useMemo, useState } from "react";
import { Icon } from "./Shared.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { formatUiDate } from "../i18n/ui.js";
import {
  ANALYTICS_TIMEFRAMES,
  buildListingBreakdownForTimeframe,
  buildOwnerTimeline,
  buildOwnerTotalsForTimeframe,
  getDateKeyDaysAgo,
  getOwnerAnalyticsSummary,
  listOwnerDailyStats,
  listOwnerListingStats,
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
      views: "Shikime",
      uniqueViews: "Vizita unike",
      leads: "Leads",
      leadRate: "Lead rate",
    },
    highlightListings: "Listing aktive",
    highlightLeads: "Leads ne periudhe",
    highlightAvgViews: "Mesatare views / listing",
    updatedLabel: "Perditesuar se fundi",
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
    tableUnique: "Unike",
    tableLeads: "Leads",
    tablePriority: "Prioritet",
    pillWarn: "Ka trafik, por jo leads",
    pillNeutral: "Po mbledh te dhena",
    pillGood: "Konvertohet mire",
    noLocation: "Pa lokacion",
    loading: "Duke ngarkuar statistikat...",
    error: "Nuk u ngarkuan statistikat. Provo perseri.",
    heroEyebrow: "LISTING ANALYTICS",
    heroTitle: "Statistikat qe ndikojne ne vendim",
    heroSubtitle: "Shikoni cilat listing-e po marrin reach, ku po kthehet interesi ne kontakt dhe cfare duhet optimizuar me pare.",
    noPlan: "Pa pakete aktive",
    expiresOn: "Skadon me",
    pendingPlan: "Plani juaj eshte ne pritje te verifikimit nga administratori.",
    inactivePlan: "Aktivizoni Premium ose Business Pro per te pare statistikat.",
    upgradeChip: "Statistikat jane feature me pagese",
    upgradeTitle: "Zhbllokoni dashboard profesional per listing-et tuaja",
    upgradeCopy: "Premium jep statistika bazike per views, WhatsApp clicks dhe leads. Business Pro shton grafik, conversion rate, recent lead activity dhe breakdown sipas burimit e device.",
    viewPlans: "Shiko paketat",
    activateBusiness: "Aktivizo Business Pro",
    toolbarAria: "Filtro statistikat sipas periudhes",
    toolbarNote: "Fokus te reach, leads dhe kanalit te kontaktit per cdo listing.",
    focusTitle: "Ku duhet fokusi",
    focusCopy: "Dy sinjalet me te rendesishme per te vendosur cfare duhet shtyre me shume.",
    topReachLabel: "Listing me reach me te larte",
    needsImprovementLabel: "Kerkon permiresim",
    perfTitle: "Performanca sipas listing-ut",
    perfCopy: "Krahasim i listing-eve sipas reach dhe interesit real.",
    contactChannelsTitle: "Kanalet e kontaktit",
    contactChannelsCopy: "Shikoni ku preferojne t'ju kontaktojne vizitoret.",
    contactChannelsEmpty: "Sapo te vijne kontaktet e para, ketu do te shihni WhatsApp, telefon dhe formular.",
    trendTitle: "Trend 30 ditor",
    trendCopy: "Views dhe leads te agreguara per 30 ditet e fundit.",
    recentLeadsTitle: "Kontaktet e fundit",
    recentLeadsCopy: "Lead-et me te fundit qe kane ardhur nga listing-et tuaja.",
    noLeadsYet: "Ende nuk ka leads te regjistruara.",
    whatsappChannel: "WhatsApp",
    phoneChannel: "Telefon",
    formChannel: "Formular",
    viewsHelper: "Periudha",
    uniqueHelper: "Vizitore reale ne periudhen e zgjedhur.",
    leadsHelper: "WhatsApp, telefon dhe formular.",
    leadRateHelper: "Raporti leads ndaj views.",
  },
  en: {
    kpi: {
      views: "Views",
      uniqueViews: "Unique visits",
      leads: "Leads",
      leadRate: "Lead rate",
    },
    highlightListings: "Active listings",
    highlightLeads: "Leads in period",
    highlightAvgViews: "Avg views / listing",
    updatedLabel: "Last updated",
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
    tableUnique: "Unique",
    tableLeads: "Leads",
    tablePriority: "Priority",
    pillWarn: "Traffic, no leads",
    pillNeutral: "Collecting data",
    pillGood: "Converting well",
    noLocation: "No location",
    loading: "Loading analytics...",
    error: "Could not load analytics. Please try again.",
    heroEyebrow: "LISTING ANALYTICS",
    heroTitle: "Analytics that drive decisions",
    heroSubtitle: "See which listings are getting reach, where interest turns into contact, and what to optimize first.",
    noPlan: "No active plan",
    expiresOn: "Expires",
    pendingPlan: "Your plan is waiting for administrator verification.",
    inactivePlan: "Activate Premium or Business Pro to view analytics.",
    upgradeChip: "Analytics are a paid feature",
    upgradeTitle: "Unlock a professional dashboard for your listings",
    upgradeCopy: "Premium gives you basic analytics for views, WhatsApp clicks, and leads. Business Pro adds charts, conversion rate, recent lead activity, and source/device breakdowns.",
    viewPlans: "View plans",
    activateBusiness: "Activate Business Pro",
    toolbarAria: "Filter analytics by period",
    toolbarNote: "Focus on reach, leads, and contact channel for each listing.",
    focusTitle: "Where to focus",
    focusCopy: "The two most important signals to decide what to push harder.",
    topReachLabel: "Listing with most reach",
    needsImprovementLabel: "Needs improvement",
    perfTitle: "Performance by listing",
    perfCopy: "Comparison of listings by reach and real interest.",
    contactChannelsTitle: "Contact channels",
    contactChannelsCopy: "See where visitors prefer to contact you.",
    contactChannelsEmpty: "Once the first contacts arrive, you will see WhatsApp, phone, and form here.",
    trendTitle: "30-day trend",
    trendCopy: "Aggregated views and leads for the last 30 days.",
    recentLeadsTitle: "Recent contacts",
    recentLeadsCopy: "The latest leads that came from your listings.",
    noLeadsYet: "No leads recorded yet.",
    whatsappChannel: "WhatsApp",
    phoneChannel: "Phone",
    formChannel: "Form",
    viewsHelper: "Period",
    uniqueHelper: "Real visitors in the selected period.",
    leadsHelper: "WhatsApp, phone and form.",
    leadRateHelper: "Leads to views ratio.",
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

function TimelineChart({ items }) {
  const maxValue = useMemo(() => Math.max(...items.map((item) => Math.max(item.views, item.leads)), 1), [items]);

  return (
    <div className="analytics-chart">
      <div className="analytics-chart__legend">
        <span><i className="analytics-chart__dot analytics-chart__dot--views" /> Views</span>
        <span><i className="analytics-chart__dot analytics-chart__dot--leads" /> Leads</span>
      </div>
      <div className="analytics-chart__plot" role="img" aria-label="Grafiku i views dhe leads per 30 ditet e fundit">
        {items.map((item) => (
          <div className="analytics-chart__slot" key={item.dateKey}>
            <span
              className="analytics-chart__bar analytics-chart__bar--views"
              style={{ height: `${Math.max((item.views / maxValue) * 100, item.views ? 8 : 0)}%` }}
              title={`${item.label}: ${item.views} Views`}
            />
            <span
              className="analytics-chart__bar analytics-chart__bar--leads"
              style={{ height: `${Math.max((item.leads / maxValue) * 100, item.leads ? 8 : 0)}%` }}
              title={`${item.label}: ${item.leads} Leads`}
            />
            <span className="analytics-chart__label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getPriorityPill(row, copy) {
  const views = Number(row.metrics?.views || 0);
  const leads = Number(row.metrics?.leads || 0);
  const leadRate = `${Number(row.conversionRate || 0).toFixed(1)}%`;
  if (leads > 0) return { className: "analytics-status-pill--good", label: copy.pillGood, leadRate };
  if (views >= 5) return { className: "analytics-status-pill--warn", label: copy.pillWarn, leadRate };
  return { className: "analytics-status-pill--neutral", label: copy.pillNeutral, leadRate };
}

function ListingPerformanceTable({ rows, timeframe, copy }) {
  if (!rows.length) {
    const timeframeLabel = ANALYTICS_TIMEFRAMES.find((item) => item.id === timeframe)?.label || copy.tableEmptySuffix;
    return <div className="analytics-table__empty">{[copy.tableEmptyPrefix, timeframeLabel].filter(Boolean).join(" ")}</div>;
  }

  return (
    <div className="analytics-table">
      <div className="analytics-table__head">
        <span>{copy.tableListing}</span>
        <span>{copy.tableViews}</span>
        <span>{copy.tableUnique}</span>
        <span>{copy.tableLeads}</span>
        <span>{copy.tablePriority}</span>
      </div>
      <div className="analytics-table__body">
        {rows.map((row) => {
          const pill = getPriorityPill(row, copy);
          return (
            <div className="analytics-table__row" key={row.listingId}>
              <span className="analytics-table__listing">
                <strong>{row.listingTitle}</strong>
                <small>{row.location || row.category || copy.noLocation}</small>
              </span>
              <span>{Number(row.metrics?.views || 0)}</span>
              <span>{Number(row.metrics?.uniqueViews || 0)}</span>
              <span>{Number(row.metrics?.leads || 0)}</span>
              <span className="analytics-table__priority">
                <span className={`analytics-status-pill ${pill.className}`}>{pill.label}</span>
                <small>Lead rate: {pill.leadRate}</small>
              </span>
            </div>
          );
        })}
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

  const [timeframe, setTimeframe] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadedAt] = useState(() => new Date());
  const [state, setState] = useState({
    subscription: null,
    summary: null,
    listingStats: [],
    dailyStats: [],
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
            setState({ subscription, summary: null, listingStats: [], dailyStats: [], recentLeads: [] });
          });
          return;
        }

        const shouldLoadAdvanced = isAdmin || hasBusinessAnalyticsAccess(subscription);
        const [summary, listingStats, dailyStats, recentLeads] = await Promise.all([
          getOwnerAnalyticsSummary(user.id),
          listOwnerListingStats(user.id),
          listOwnerDailyStats(user.id, getDateKeyDaysAgo(29)),
          shouldLoadAdvanced ? listOwnerRecentLeads(user.id, 8) : Promise.resolve([]),
        ]);

        if (!active) return;
        startTransition(() => {
          setState({ subscription, summary, listingStats, dailyStats, recentLeads });
        });
      } catch (loadError) {
        console.error("Failed to load analytics dashboard:", loadError);
        if (active) setError(copy.error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [copy.error, isAdmin, user?.id]);

  const subscription = state.subscription;
  const hasBasic = isAdmin || hasBasicAnalyticsAccess(subscription);
  const hasBusiness = isAdmin || hasBusinessAnalyticsAccess(subscription);

  const ownerTotals = useMemo(
    () => buildOwnerTotalsForTimeframe(state.summary, state.dailyStats, timeframe),
    [state.summary, state.dailyStats, timeframe]
  );

  const listingRows = useMemo(
    () => buildListingBreakdownForTimeframe(state.listingStats, state.dailyStats, timeframe),
    [state.listingStats, state.dailyStats, timeframe]
  );

  const timeline = useMemo(() => buildOwnerTimeline(state.dailyStats, 30), [state.dailyStats]);

  const activeListingCount = listingRows.length;
  const avgViewsPerListing = activeListingCount > 0
    ? (Number(ownerTotals.views) / activeListingCount).toFixed(1)
    : "0.0";

  const topReachListing = useMemo(
    () => [...listingRows].sort((a, b) => Number(b.metrics?.views || 0) - Number(a.metrics?.views || 0))[0],
    [listingRows]
  );
  const warnListing = useMemo(
    () => listingRows.find((r) => Number(r.metrics?.views || 0) >= 5 && Number(r.metrics?.leads || 0) === 0),
    [listingRows]
  );

  const hasContactData = Number(ownerTotals.whatsappClicks || 0) + Number(ownerTotals.phoneClicks || 0) + Number(ownerTotals.contactSubmits || 0) > 0;

  const periodLabel = ANALYTICS_TIMEFRAMES.find((item) => item.id === timeframe)?.label || "30d";

  const planBadgeId = subscription?.planId || "free";
  const planBadgeLabel = subscription?.planLabel || copy.noPlan;

  const expiresLine = subscription?.expiresAt
    ? `${copy.expiresOn} ${formatUiDate(subscription.expiresAt, lang, { day: "2-digit", month: "short", year: "numeric" })}`
    : null;
  const updatedLine = `${copy.updatedLabel} ${formatUiDate(loadedAt, lang, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`;

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
          {hasBasic && (
            <div className="analytics-hero__highlights">
              <div className="analytics-hero__highlight">
                <strong>{activeListingCount}</strong>
                <span>{copy.highlightListings}</span>
              </div>
              <div className="analytics-hero__highlight">
                <strong>{formatMetric(ownerTotals.leads)}</strong>
                <span>{copy.highlightLeads}</span>
              </div>
              <div className="analytics-hero__highlight">
                <strong>{avgViewsPerListing}</strong>
                <span>{copy.highlightAvgViews}</span>
              </div>
            </div>
          )}
        </div>
        <div className="analytics-hero__aside">
          <span className={`analytics-plan-badge analytics-plan-badge--${planBadgeId}`}>
            {planBadgeLabel}
          </span>
          <div className="analytics-hero__meta">
            {expiresLine && <span>{expiresLine}</span>}
            <span>{updatedLine}</span>
          </div>
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
            <div className="analytics-empty">
              <Icon n="chart-line" />
              <h3>{copy.emptyTitle}</h3>
              <p>{copy.emptyCopy}</p>
            </div>
          ) : (
            <>
              <div className="analytics-overview">
                <div className="analytics-stat-grid">
                  <AnalyticsStatCard
                    label={copy.kpi.views}
                    icon="eye"
                    tone="default"
                    value={formatMetric(ownerTotals.views)}
                    helper={`${copy.viewsHelper}: ${periodLabel}`}
                    copy={copy}
                  />
                  <AnalyticsStatCard
                    label={copy.kpi.uniqueViews}
                    icon="users"
                    tone="default"
                    value={formatMetric(ownerTotals.uniqueViews)}
                    helper={copy.uniqueHelper}
                    copy={copy}
                  />
                  <AnalyticsStatCard
                    label={copy.kpi.leads}
                    icon="sparkles"
                    tone="accent"
                    value={formatMetric(ownerTotals.leads)}
                    helper={copy.leadsHelper}
                    copy={copy}
                  />
                  <AnalyticsStatCard
                    label={copy.kpi.leadRate}
                    icon="chart-line"
                    tone="premium"
                    value={formatPercent(ownerTotals.conversionRate)}
                    helper={copy.leadRateHelper}
                    locked={!hasBusiness}
                    copy={copy}
                  />
                </div>

                <section className="analytics-panel analytics-panel--priority">
                  <div className="analytics-block__head">
                    <div>
                      <h3>{copy.focusTitle}</h3>
                      <p>{copy.focusCopy}</p>
                    </div>
                  </div>
                  <div className="analytics-focus-list">
                    {topReachListing && (
                      <article className="analytics-focus-card">
                        <span className="analytics-focus-card__eyebrow">{copy.topReachLabel}</span>
                        <strong>{topReachListing.listingTitle}</strong>
                        <p>{Number(topReachListing.metrics?.views || 0)} views / {Number(topReachListing.metrics?.leads || 0)} leads</p>
                      </article>
                    )}
                    {warnListing && (
                      <article className="analytics-focus-card analytics-focus-card--warn">
                        <span className="analytics-focus-card__eyebrow">{copy.needsImprovementLabel}</span>
                        <strong>{warnListing.listingTitle}</strong>
                        <p>{Number(warnListing.metrics?.views || 0)} views / {Number(warnListing.metrics?.leads || 0)} leads</p>
                      </article>
                    )}
                  </div>
                </section>
              </div>

              <div className="analytics-grid">
                <section className="analytics-panel analytics-panel--wide">
                  <div className="analytics-block__head">
                    <div>
                      <h3>{copy.perfTitle}</h3>
                      <p>{copy.perfCopy}</p>
                    </div>
                  </div>
                  <ListingPerformanceTable rows={listingRows} timeframe={timeframe} copy={copy} />
                </section>

                <section className="analytics-panel">
                  <div className="analytics-block__head">
                    <div>
                      <h3>{copy.contactChannelsTitle}</h3>
                      <p>{copy.contactChannelsCopy}</p>
                    </div>
                  </div>
                  {hasContactData ? (
                    <ul className="analytics-breakdown-list">
                      {Number(ownerTotals.whatsappClicks || 0) > 0 && (
                        <li className="analytics-breakdown-list__item">
                          <span>{copy.whatsappChannel}</span>
                          <strong>{Number(ownerTotals.whatsappClicks)}</strong>
                        </li>
                      )}
                      {Number(ownerTotals.phoneClicks || 0) > 0 && (
                        <li className="analytics-breakdown-list__item">
                          <span>{copy.phoneChannel}</span>
                          <strong>{Number(ownerTotals.phoneClicks)}</strong>
                        </li>
                      )}
                      {Number(ownerTotals.contactSubmits || 0) > 0 && (
                        <li className="analytics-breakdown-list__item">
                          <span>{copy.formChannel}</span>
                          <strong>{Number(ownerTotals.contactSubmits)}</strong>
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="analytics-breakdown-card__empty">{copy.contactChannelsEmpty}</p>
                  )}
                </section>
              </div>

              <div className="analytics-grid">
                <section className="analytics-panel analytics-panel--wide">
                  <div className="analytics-block__head">
                    <div>
                      <h3>{copy.trendTitle}</h3>
                      <p>{copy.trendCopy}</p>
                    </div>
                  </div>
                  <TimelineChart items={timeline} />
                </section>

                <section className="analytics-panel">
                  <div className="analytics-block__head">
                    <div>
                      <h3>{copy.recentLeadsTitle}</h3>
                      <p>{copy.recentLeadsCopy}</p>
                    </div>
                  </div>
                  {state.recentLeads.length === 0 ? (
                    <p className="analytics-breakdown-card__empty">{copy.noLeadsYet}</p>
                  ) : (
                    <div className="analytics-activity-list">
                      {state.recentLeads.map((item) => (
                        <article key={item.id} className="analytics-activity-list__item">
                          <div className="analytics-activity-list__meta">
                            <strong>{item.eventLabel}</strong>
                            <span>{item.listingTitle}</span>
                          </div>
                          <div className="analytics-activity-list__details">
                            <span>{formatUiDate(item.occurredAt, lang, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
