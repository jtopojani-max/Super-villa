import { startTransition, useEffect, useMemo, useState } from "react";
import { Icon } from "./Shared.jsx";
import {
  ANALYTICS_TIMEFRAMES,
  buildListingBreakdownForTimeframe,
  buildOwnerTimeline,
  buildOwnerTotalsForTimeframe,
  getDateKeyDaysAgo,
  listAdminDailyStats,
  listAdminListingStats,
  sumAnalyticsMetrics,
} from "../services/analytics.js";

const numberFormatter = new Intl.NumberFormat("sq-AL");

const KPI_CARD_CONFIG = [
  {
    key: "views",
    label: "Page Views",
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

function AnalyticsStatCard({ label, value, icon, tone = "default", helper }) {
  return (
    <article className={`analytics-stat-card analytics-stat-card--${tone}`}>
      <div className="analytics-stat-card__icon">
        <Icon n={icon} />
      </div>
      <div className="analytics-stat-card__copy">
        <span className="analytics-stat-card__label">{label}</span>
        <strong className="analytics-stat-card__value">{value}</strong>
        <p className="analytics-stat-card__helper">{helper}</p>
      </div>
    </article>
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
      <div className="analytics-chart__plot" role="img" aria-label="Grafik global i views dhe leads per 30 ditet e fundit">
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

function AdminAnalyticsEmptyState() {
  return (
    <div className="analytics-empty">
      <Icon n="chart-line" />
      <h3>Statistikat globale do te shfaqen sapo listing-et te marrin trafik</h3>
      <p>Views, WhatsApp clicks dhe leads do te mblidhen automatikisht nga faqet e detajeve.</p>
    </div>
  );
}

function ListingPerformanceTable({ rows, timeframe }) {
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
        <span>Perditesuar</span>
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
            <span className="analytics-table__hint">{formatDate(row.lastUpdatedAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPanel() {
  const [timeframe, setTimeframe] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [state, setState] = useState({
    listingStats: [],
    dailyStats: [],
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [listingStats, dailyStats] = await Promise.all([
          listAdminListingStats(),
          listAdminDailyStats(getDateKeyDaysAgo(29)),
        ]);

        if (!active) return;

        startTransition(() => {
          setState({
            listingStats,
            dailyStats,
          });
        });
      } catch (loadError) {
        console.error("Failed to load admin analytics:", loadError);
        if (active) setError("Nuk u ngarkuan statistikat globale. Provo perseri.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const globalSummary = useMemo(
    () => ({
      totals: sumAnalyticsMetrics(state.listingStats.map((item) => item.totals)),
      listingCount: state.listingStats.length,
    }),
    [state.listingStats]
  );

  const ownerTotals = useMemo(
    () => buildOwnerTotalsForTimeframe(globalSummary, state.dailyStats, timeframe),
    [globalSummary, state.dailyStats, timeframe]
  );

  const listingRows = useMemo(
    () => buildListingBreakdownForTimeframe(state.listingStats, state.dailyStats, timeframe).slice(0, 12),
    [state.listingStats, state.dailyStats, timeframe]
  );

  const timeline = useMemo(
    () => buildOwnerTimeline(state.dailyStats, 30),
    [state.dailyStats]
  );

  const lastUpdatedAt = useMemo(() => {
    const [latest] = [...state.listingStats].sort(
      (a, b) => (b.lastUpdatedAtMs || 0) - (a.lastUpdatedAtMs || 0)
    );
    return latest?.lastUpdatedAt || null;
  }, [state.listingStats]);

  if (loading) {
    return (
      <section className="analytics-shell analytics-shell--loading">
        <div className="admin-empty">
          <p>Duke ngarkuar statistikat globale...</p>
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
          <p className="my-posts-header__eyebrow">ADMIN ANALYTICS</p>
          <h2 className="analytics-hero__title">Views dhe WhatsApp clicks ne nivel faqeje</h2>
          <p className="analytics-hero__subtitle">
            Ketu shfaqen statistikat globale per listing-et aktive te faqes, jo vetem per nje pronar te caktuar.
          </p>
        </div>
        <div className="analytics-hero__aside">
          <span className="analytics-plan-badge analytics-plan-badge--business-pro">Admin Global</span>
          <p className="analytics-hero__meta">
            Listing-e te gjurmuara: {formatMetric(globalSummary.listingCount)}
            <br />
            Perditesimi i fundit: {formatDate(lastUpdatedAt)}
          </p>
        </div>
      </header>

      <div className="analytics-toolbar">
        <div className="analytics-toolbar__filters" role="tablist" aria-label="Filtro statistikat globale sipas periudhes">
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
          Maten eventet nga detail page, WhatsApp dhe telefon.
        </div>
      </div>

      {!state.listingStats.length ? (
        <AdminAnalyticsEmptyState />
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
              helper="Leads / Views ne nivel global"
            />
          </div>

          <div className="analytics-grid">
            <section className="analytics-panel analytics-panel--wide">
              <div className="analytics-block__head">
                <div>
                  <h3>Top listing-et sipas performances</h3>
                  <p>
                    {timeframe === "all"
                      ? "Pamje aggregate per gjithe historikun e listing-eve."
                      : "Metrikat llogariten nga agregimet ditore ne nivel faqeje."}
                  </p>
                </div>
              </div>
              <ListingPerformanceTable rows={listingRows} timeframe={timeframe} />
            </section>

            <section className="analytics-panel">
              <div className="analytics-block__head">
                <div>
                  <h3>Shikim i shpejte</h3>
                  <p>Numrat kryesore per dashboard-in e adminit.</p>
                </div>
              </div>
              <dl className="analytics-summary-list">
                <div>
                  <dt>Listing-e te gjurmuara</dt>
                  <dd>{formatMetric(globalSummary.listingCount)}</dd>
                </div>
                <div>
                  <dt>WhatsApp clicks</dt>
                  <dd>{formatMetric(ownerTotals.whatsappClicks)}</dd>
                </div>
                <div>
                  <dt>Unique views</dt>
                  <dd>{formatMetric(ownerTotals.uniqueViews)}</dd>
                </div>
                <div>
                  <dt>Lead rate</dt>
                  <dd>{formatPercent(ownerTotals.conversionRate)}</dd>
                </div>
              </dl>
            </section>
          </div>

          <div className="analytics-grid">
            <section className="analytics-panel analytics-panel--wide">
              <div className="analytics-block__head">
                <div>
                  <h3>Trend 30 ditor</h3>
                  <p>Grafik i agreguar i views dhe leads per 30 ditet e fundit ne nivel faqeje.</p>
                </div>
              </div>
              <TimelineChart items={timeline} />
            </section>

            <section className="analytics-panel">
              <div className="analytics-block__head">
                <div>
                  <h3>Highlights</h3>
                  <p>Kontroll i shpejte i trafikut dhe interesit aktual.</p>
                </div>
              </div>
              <div className="analytics-mini-cards">
                <article>
                  <span>Views sot</span>
                  <strong>
                    {
                      buildOwnerTotalsForTimeframe(
                        globalSummary,
                        state.dailyStats,
                        "today"
                      ).views
                    }
                  </strong>
                </article>
                <article>
                  <span>Views 7 dite</span>
                  <strong>
                    {
                      buildOwnerTotalsForTimeframe(
                        globalSummary,
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
                        globalSummary,
                        state.dailyStats,
                        "30d"
                      ).whatsappClicks
                    }
                  </strong>
                </article>
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  );
}
