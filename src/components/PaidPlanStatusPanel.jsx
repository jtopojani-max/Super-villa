import { useEffect, useMemo, useState } from "react";
import { Icon } from "./Shared.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { listMyPaidPlanRequests } from "../services/paidPlans.js";

const COPY = {
  sq: {
    tag: "Planet",
    title: "Planet me pagese dhe statusi i verifikimit",
    subtitle: "Ketu shihni nese kerkesa juaj eshte ne pritje, e aprovuar apo e refuzuar.",
    pendingSummary: "ne pritje",
    activeSummary: "aktive",
    closedSummary: "te mbyllura",
    loading: "Duke ngarkuar statuset e planeve...",
    empty: "Nuk keni ende kerkesa per plane me pagese.",
    error: "Nuk u arrit te ngarkohen statuset e planeve me pagese.",
    listingTarget: "Listim",
    businessTarget: "Profil biznesi",
    notificationsEmpty: "Njoftimet kryesore per planin tuaj do te shfaqen ketu.",
  },
  en: {
    tag: "Plans",
    title: "Paid plans and verification status",
    subtitle: "Here you can see whether your request is pending, approved, or rejected.",
    pendingSummary: "pending",
    activeSummary: "active",
    closedSummary: "closed",
    loading: "Loading paid plan statuses...",
    empty: "You do not have any paid plan requests yet.",
    error: "Could not load paid plan statuses.",
    listingTarget: "Listing",
    businessTarget: "Business profile",
    notificationsEmpty: "Main notifications about your plan will appear here.",
  },
};

export default function PaidPlanStatusPanel({ user }) {
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.sq;
  const [state, setState] = useState({
    loading: true,
    error: "",
    requests: [],
  });

  useEffect(() => {
    if (!user?.id) return undefined;

    let isMounted = true;
    setState((current) => ({ ...current, loading: true, error: "" }));

    listMyPaidPlanRequests(user.id)
      .then((requests) => {
        if (!isMounted) return;
        setState({
          loading: false,
          error: "",
          requests,
        });
      })
      .catch((loadError) => {
        console.error("Failed to load paid plan status panel:", loadError);
        if (!isMounted) return;
        setState({
          loading: false,
          error: copy.error,
          requests: [],
        });
      });

    return () => {
      isMounted = false;
    };
  }, [copy.error, user?.id]);

  const summary = useMemo(
    () => {
      const now = Date.now();

      return state.requests.reduce(
        (accumulator, request) => {
          accumulator.total += 1;
          accumulator[request.paymentStatus] = (accumulator[request.paymentStatus] || 0) + 1;
          if (request.paymentStatus === "approved" && (!request.expiresAt || new Date(request.expiresAt).getTime() > now)) {
            accumulator.active += 1;
          }
          return accumulator;
        },
        { total: 0, pending: 0, approved: 0, rejected: 0, expired: 0, cancelled: 0, active: 0 }
      );
    },
    [state.requests]
  );

  const latestRequests = state.requests.slice(0, 4);

  const renderContent = () => {
    if (state.loading) {
      return <p className="paid-plan-status-panel__notifications-empty">{copy.loading}</p>;
    }

    if (state.error) {
      return <p className="paid-plan-status-panel__notifications-empty paid-plan-status-panel__notifications-empty--error">{state.error}</p>;
    }

    if (!latestRequests.length) {
      return <p className="paid-plan-status-panel__notifications-empty">{copy.empty}</p>;
    }

    return (
      <>
        <div className="paid-plan-status-panel__list">
          {latestRequests.map((request) => (
            <article key={request.id} className="paid-plan-request-card">
              <div className="paid-plan-request-card__head">
                <div className="paid-plan-request-card__head-left">
                  <strong>{request.planLabel}</strong>
                  <span>
                    {request.targetKind === "listing"
                      ? request.listingTitle || copy.listingTarget
                      : request.businessName || copy.businessTarget}
                  </span>
                </div>
                <div className="paid-plan-request-card__head-right">
                  <span className={`paid-plan-status-badge paid-plan-status-badge--${request.statusTone}`}>
                    {request.statusLabel}
                  </span>
                  <span className="paid-plan-request-card__chevron" aria-hidden="true">
                    <Icon n="chevron-down" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="paid-plan-status-panel__notifications-empty">{copy.notificationsEmpty}</p>
      </>
    );
  };

  return (
    <section className="paid-plan-status-panel">
      <div className="paid-plan-status-panel__head">
        <div>
          <p className="section-tag">{copy.tag}</p>
          <h3>{copy.title}</h3>
          <p>{copy.subtitle}</p>
        </div>
        <div className="paid-plan-status-panel__summary">
          <span><strong>{summary.pending}</strong> {copy.pendingSummary}</span>
          <span><strong>{summary.active}</strong> {copy.activeSummary}</span>
          <span><strong>{summary.expired + summary.cancelled}</strong> {copy.closedSummary}</span>
        </div>
      </div>
      {renderContent()}
    </section>
  );
}
