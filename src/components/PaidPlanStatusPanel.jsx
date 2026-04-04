import { useEffect, useMemo, useState } from "react";
import { Icon } from "./Shared.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { formatUiDateOnly } from "../i18n/ui.js";
import {
  dismissNotification,
  listMyPaidPlanRequests,
  listUserNotifications,
  markNotificationAsRead,
} from "../services/paidPlans.js";

const COPY = {
  sq: {
    tag: "Planet",
    title: "Planet me pagese dhe statusi i verifikimit",
    subtitle: "Ketu shihni nese kerkesa juaj eshte ne pritje, e aprovuar apo e refuzuar.",
    pendingSummary: "ne pritje",
    activeSummary: "aktive",
    closedSummary: "te mbyllura",
    pendingBanner: "Ne pritje te verifikimit nga administratori.",
    loading: "Duke ngarkuar statuset e planeve...",
    empty: "Nuk keni ende kerkesa per plane me pagese.",
    error: "Nuk u arrit te ngarkohen statuset e planeve me pagese.",
    listingTarget: "Listim",
    businessTarget: "Profil biznesi",
    reference: "Referenca",
    submitted: "Derguar",
    expires: "Skadon",
    notificationsTitle: "Njoftime te fundit",
    notificationsEmpty: "Njoftimet per aprovime, refuzime dhe skadime do te shfaqen ketu.",
    dismiss: "Largo njoftimin",
  },
  en: {
    tag: "Plans",
    title: "Paid plans and verification status",
    subtitle: "Here you can see whether your request is pending, approved, or rejected.",
    pendingSummary: "pending",
    activeSummary: "active",
    closedSummary: "closed",
    pendingBanner: "Waiting for administrator verification.",
    loading: "Loading paid plan statuses...",
    empty: "You do not have any paid plan requests yet.",
    error: "Could not load paid plan statuses.",
    listingTarget: "Listing",
    businessTarget: "Business profile",
    reference: "Reference",
    submitted: "Submitted",
    expires: "Expires",
    notificationsTitle: "Latest notifications",
    notificationsEmpty: "Notifications for approvals, rejections, and expirations will appear here.",
    dismiss: "Dismiss notification",
  },
};

export default function PaidPlanStatusPanel({ user }) {
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.sq;
  const [state, setState] = useState({
    loading: true,
    error: "",
    requests: [],
    notifications: [],
  });

  useEffect(() => {
    if (!user?.id) return undefined;

    let isMounted = true;
    setState((current) => ({ ...current, loading: true, error: "" }));

    Promise.all([listMyPaidPlanRequests(user.id), listUserNotifications(user.id, 5)])
      .then(([requests, notifications]) => {
        if (!isMounted) return;
        setState({
          loading: false,
          error: "",
          requests,
          notifications,
        });
      })
      .catch((loadError) => {
        console.error("Failed to load paid plan status panel:", loadError);
        if (!isMounted) return;
        setState({
          loading: false,
          error: copy.error,
          requests: [],
          notifications: [],
        });
      });

    return () => {
      isMounted = false;
    };
  }, [copy.error, user?.id]);

  const summary = useMemo(
    () =>
      state.requests.reduce(
        (accumulator, request) => {
          accumulator.total += 1;
          accumulator[request.paymentStatus] = (accumulator[request.paymentStatus] || 0) + 1;
          return accumulator;
        },
        { total: 0, pending: 0, approved: 0, rejected: 0, expired: 0, cancelled: 0 }
      ),
    [state.requests]
  );

  const latestRequests = state.requests.slice(0, 4);
  const hasPending = latestRequests.some((item) => item.paymentStatus === "pending");

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
          <span><strong>{summary.approved}</strong> {copy.activeSummary}</span>
          <span><strong>{summary.expired + summary.cancelled}</strong> {copy.closedSummary}</span>
        </div>
      </div>

      {hasPending && (
        <div className="paid-plan-status-panel__banner paid-plan-status-panel__banner--pending">
          <Icon n="clock" />
          <span>{copy.pendingBanner}</span>
        </div>
      )}

      {state.loading ? (
        <div className="paid-plan-status-panel__empty">
          <p>{copy.loading}</p>
        </div>
      ) : state.error ? (
        <div className="paid-plan-status-panel__empty paid-plan-status-panel__empty--error">
          <Icon n="alert-circle" />
          <p>{state.error}</p>
        </div>
      ) : !latestRequests.length ? (
        <div className="paid-plan-status-panel__empty">
          <p>{copy.empty}</p>
        </div>
      ) : (
        <div className="paid-plan-status-panel__grid">
          <div className="paid-plan-status-panel__requests">
            {latestRequests.map((request) => (
              <article key={request.id} className="paid-plan-request-card">
                <div className="paid-plan-request-card__head">
                  <div>
                    <strong>{request.planLabel}</strong>
                    <span>
                      {request.targetKind === "listing"
                        ? request.listingTitle || copy.listingTarget
                        : request.businessName || copy.businessTarget}
                    </span>
                  </div>
                  <span className={`paid-plan-status-badge paid-plan-status-badge--${request.statusTone}`}>
                    {request.statusLabel}
                  </span>
                </div>

                <div className="paid-plan-request-card__meta">
                  <span>{copy.reference}: {request.paymentReference || "-"}</span>
                  <span>{copy.submitted}: {formatUiDateOnly(request.createdAt, lang, { day: "numeric", month: "short", year: "numeric" }) || "-"}</span>
                  <span>{copy.expires}: {request.expiresAt ? formatUiDateOnly(request.expiresAt, lang, { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
                </div>

                {(request.adminNote || request.rejectionReason) && (
                  <p className="paid-plan-request-card__note">{request.rejectionReason || request.adminNote}</p>
                )}
              </article>
            ))}
          </div>

          <div className="paid-plan-status-panel__notifications">
            <div className="paid-plan-status-panel__subhead">
              <Icon n="shield-check" />
              <strong>{copy.notificationsTitle}</strong>
            </div>
            {!state.notifications.length ? (
              <p className="paid-plan-status-panel__notifications-empty">{copy.notificationsEmpty}</p>
            ) : (
              state.notifications.map((item) => (
                <div
                  key={item.id}
                  className={`paid-plan-notification ${item.status === "unread" ? "is-unread" : ""}`}
                  onClick={() => markNotificationAsRead(item.id).catch((error) => console.error("Failed to mark notification as read:", error))}
                >
                  <Icon n="notifications" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                    <span>{formatUiDateOnly(item.createdAt, lang, { day: "numeric", month: "short", year: "numeric" }) || "-"}</span>
                  </div>
                  <button
                    type="button"
                    className="paid-plan-notification__dismiss"
                    aria-label={copy.dismiss}
                    onClick={(event) => {
                      event.stopPropagation();
                      dismissNotification(item.id)
                        .then(() =>
                          setState((current) => ({
                            ...current,
                            notifications: current.notifications.filter((notification) => notification.id !== item.id),
                          }))
                        )
                        .catch((error) => console.error("Failed to dismiss notification:", error));
                    }}
                  >
                    <span className="ui-close-mark" aria-hidden="true">X</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
