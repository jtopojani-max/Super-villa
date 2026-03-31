import { useEffect, useMemo, useState } from "react";
import { Bell, ClockCounterClockwise, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import {
  listMyPaidPlanRequests,
  listUserNotifications,
  markNotificationAsRead,
} from "../services/paidPlans.js";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("sq-AL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

export default function PaidPlanStatusPanel({ user }) {
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
      .catch((error) => {
        console.error("Failed to load paid plan status panel:", error);
        if (!isMounted) return;
        setState({
          loading: false,
          error: "Nuk u arrit te ngarkohen statuset e planeve me pagese.",
          requests: [],
          notifications: [],
        });
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const summary = useMemo(() => {
    return state.requests.reduce(
      (accumulator, request) => {
        accumulator.total += 1;
        accumulator[request.paymentStatus] = (accumulator[request.paymentStatus] || 0) + 1;
        return accumulator;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, expired: 0, cancelled: 0 }
    );
  }, [state.requests]);

  const latestRequests = state.requests.slice(0, 4);
  const hasPending = latestRequests.some((item) => item.paymentStatus === "pending");

  return (
    <section className="paid-plan-status-panel">
      <div className="paid-plan-status-panel__head">
        <div>
          <p className="section-tag">Planet</p>
          <h3>Planet me pagese dhe statusi i verifikimit</h3>
          <p>
            Ketu shihni nese kerkesa juaj eshte ne pritje, e aprovuar apo e refuzuar.
          </p>
        </div>
        <div className="paid-plan-status-panel__summary">
          <span><strong>{summary.pending}</strong> ne pritje</span>
          <span><strong>{summary.approved}</strong> aktive</span>
          <span><strong>{summary.expired + summary.cancelled}</strong> te mbyllura</span>
        </div>
      </div>

      {hasPending && (
        <div className="paid-plan-status-panel__banner paid-plan-status-panel__banner--pending">
          <ClockCounterClockwise aria-hidden="true" />
          <span>Ne pritje te verifikimit nga administratori.</span>
        </div>
      )}

      {state.loading ? (
        <div className="paid-plan-status-panel__empty">
          <p>Duke ngarkuar statuset e planeve...</p>
        </div>
      ) : state.error ? (
        <div className="paid-plan-status-panel__empty paid-plan-status-panel__empty--error">
          <WarningCircle aria-hidden="true" />
          <p>{state.error}</p>
        </div>
      ) : !latestRequests.length ? (
        <div className="paid-plan-status-panel__empty">
          <p>Nuk keni ende kerkesa per plane me pagese.</p>
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
                        ? request.listingTitle || "Listim"
                        : request.businessName || "Profil biznesi"}
                    </span>
                  </div>
                  <span className={`paid-plan-status-badge paid-plan-status-badge--${request.statusTone}`}>
                    {request.statusLabel}
                  </span>
                </div>

                <div className="paid-plan-request-card__meta">
                  <span>Referenca: {request.paymentReference || "-"}</span>
                  <span>Derguar: {formatDate(request.createdAt)}</span>
                  <span>Skadon: {request.expiresAt ? formatDate(request.expiresAt) : "-"}</span>
                </div>

                {(request.adminNote || request.rejectionReason) && (
                  <p className="paid-plan-request-card__note">
                    {request.rejectionReason || request.adminNote}
                  </p>
                )}
              </article>
            ))}
          </div>

          <div className="paid-plan-status-panel__notifications">
            <div className="paid-plan-status-panel__subhead">
              <ShieldCheck aria-hidden="true" />
              <strong>Njoftime te fundit</strong>
            </div>
            {!state.notifications.length ? (
              <p className="paid-plan-status-panel__notifications-empty">
                Njoftimet per aprovime, refuzime dhe skadime do te shfaqen ketu.
              </p>
            ) : (
              state.notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`paid-plan-notification ${item.status === "unread" ? "is-unread" : ""}`}
                  onClick={() => markNotificationAsRead(item.id).catch((error) => console.error("Failed to mark notification as read:", error))}
                >
                  <Bell aria-hidden="true" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
