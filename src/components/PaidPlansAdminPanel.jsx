import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  ClockCounterClockwise,
  DownloadSimple,
  Eye,
  Prohibit,
  ShieldCheck,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import {
  getPaymentProofDownloadUrl,
  listAdminPaidPlanRequests,
  listPaidPlanAuditEntries,
  managePaidPlanRequest,
  reviewPaidPlanRequest,
} from "../services/paidPlans.js";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("sq-AL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const filterByDate = (value, range) => {
  if (!value || range === "all") return true;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return false;
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (range === "today") return now - timestamp <= day;
  if (range === "7d") return now - timestamp <= 7 * day;
  if (range === "30d") return now - timestamp <= 30 * day;
  return true;
};

export default function PaidPlansAdminPanel() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    requests: [],
  });
  const [filters, setFilters] = useState({
    board: "pending",
    status: "all",
    plan: "all",
    date: "all",
    search: "",
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [proofUrl, setProofUrl] = useState("");
  const [auditEntries, setAuditEntries] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionForm, setActionForm] = useState({
    adminNote: "",
    rejectionReason: "",
    durationDays: "",
    premiumOrder: "",
  });

  const loadRequests = async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const requests = await listAdminPaidPlanRequests();
      setState({ loading: false, error: "", requests });
    } catch (error) {
      console.error("Failed to load paid plan requests:", error);
      setState({
        loading: false,
        error: "Nuk u arrit te ngarkohen kerkesat e planeve me pagese.",
        requests: [],
      });
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (!selectedRequest) return undefined;
    let isMounted = true;
    setDetailLoading(true);
    setActionError("");
    setActionForm({
      adminNote: selectedRequest.adminNote || "",
      rejectionReason: selectedRequest.rejectionReason || "",
      durationDays: selectedRequest.durationDays ? String(selectedRequest.durationDays) : "",
      premiumOrder: selectedRequest.premiumOrder ? String(selectedRequest.premiumOrder) : "",
    });

    Promise.all([
      selectedRequest.proofStoragePath ? getPaymentProofDownloadUrl(selectedRequest.proofStoragePath) : Promise.resolve(""),
      listPaidPlanAuditEntries(selectedRequest.id),
    ])
      .then(([url, audit]) => {
        if (!isMounted) return;
        setProofUrl(url);
        setAuditEntries(audit);
      })
      .catch((error) => {
        console.error("Failed to load paid plan details:", error);
        if (!isMounted) return;
        setProofUrl("");
        setAuditEntries([]);
      })
      .finally(() => {
        if (isMounted) setDetailLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedRequest]);

  const summary = useMemo(() => {
    const now = Date.now();
    return state.requests.reduce(
      (accumulator, request) => {
        accumulator.total += 1;
        accumulator[request.paymentStatus] = (accumulator[request.paymentStatus] || 0) + 1;
        if (request.paymentStatus === "approved" && request.expiresAt && new Date(request.expiresAt).getTime() > now) {
          accumulator.active += 1;
        }
        if (request.paymentStatus === "approved" && request.expiresAt) {
          const diff = new Date(request.expiresAt).getTime() - now;
          if (diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000) accumulator.expiringSoon += 1;
        }
        return accumulator;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, expired: 0, cancelled: 0, active: 0, expiringSoon: 0 }
    );
  }, [state.requests]);

  const boardRequests = useMemo(() => {
    const now = Date.now();
    if (filters.board === "pending") return state.requests.filter((request) => request.paymentStatus === "pending");
    if (filters.board === "active") {
      return state.requests.filter(
        (request) => request.paymentStatus === "approved" && (!request.expiresAt || new Date(request.expiresAt).getTime() > now)
      );
    }
    if (filters.board === "expiring") {
      return state.requests.filter((request) => {
        if (request.paymentStatus !== "approved" || !request.expiresAt) return false;
        const diff = new Date(request.expiresAt).getTime() - now;
        return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
      });
    }
    return state.requests.filter((request) => request.paymentStatus !== "pending" && request.paymentStatus !== "approved");
  }, [filters.board, state.requests]);

  const filteredRequests = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return boardRequests.filter((request) => {
      if (filters.status !== "all" && request.paymentStatus !== filters.status) return false;
      if (filters.plan !== "all" && request.planId !== filters.plan) return false;
      if (!filterByDate(request.createdAt, filters.date)) return false;
      if (!search) return true;
      return [
        request.requestId,
        request.userName,
        request.userEmail,
        request.customerName,
        request.listingTitle,
        request.businessName,
        request.paymentReference,
      ].some((value) => String(value || "").toLowerCase().includes(search));
    });
  }, [boardRequests, filters]);

  const handleAction = async (mode) => {
    if (!selectedRequest) return;
    setActionLoading(mode);
    setActionError("");

    try {
      if (mode === "approve" || mode === "reject" || mode === "mark_expired" || mode === "note") {
        await reviewPaidPlanRequest({
          requestId: selectedRequest.id,
          action: mode,
          adminNote: actionForm.adminNote,
          rejectionReason: actionForm.rejectionReason,
          durationDays: actionForm.durationDays,
          premiumOrder: actionForm.premiumOrder,
        });
      } else {
        await managePaidPlanRequest({
          requestId: selectedRequest.id,
          action: mode,
          adminNote: actionForm.adminNote,
          durationDays: actionForm.durationDays,
          premiumOrder: actionForm.premiumOrder,
        });
      }

      await loadRequests();
      const refreshed = await listAdminPaidPlanRequests();
      const next = refreshed.find((item) => item.id === selectedRequest.id) || null;
      setSelectedRequest(next);
    } catch (error) {
      console.error("Paid plan admin action failed:", error);
      setActionError(error?.message || "Veprimi nuk u krye. Provo perseri.");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="paid-plans-admin">
      <div className="paid-plans-admin__stats">
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Kerkesa ne pritje</p>
          <p className="admin-stat-card__val" style={{ color: "#d97706" }}>{summary.pending}</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Plane aktive</p>
          <p className="admin-stat-card__val gold">{summary.active}</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Skadojne shpejt</p>
          <p className="admin-stat-card__val">{summary.expiringSoon}</p>
        </article>
      </div>

      <div className="paid-plans-admin__boards">
        {[
          ["pending", `Ne pritje (${summary.pending})`],
          ["active", `Active Premium Users (${summary.active})`],
          ["expiring", `Expiring Soon (${summary.expiringSoon})`],
          ["history", `Historia (${summary.rejected + summary.expired + summary.cancelled})`],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`admin-tab ${filters.board === key ? "active" : ""}`}
            onClick={() => setFilters((current) => ({ ...current, board: key }))}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="admin-table">
        <div className="admin-toolbar">
          <input
            className="auth-input admin-toolbar__field"
            placeholder="Kerko sipas emrit, email-it, ID-se ose listimit..."
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
          <select
            className="auth-input admin-toolbar__select"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="all">Te gjitha statuset</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="auth-input admin-toolbar__select"
            value={filters.plan}
            onChange={(event) => setFilters((current) => ({ ...current, plan: event.target.value }))}
          >
            <option value="all">Te gjitha planet</option>
            <option value="premium">Premium</option>
            <option value="business-pro">Business Pro</option>
          </select>
          <select
            className="auth-input admin-toolbar__select"
            value={filters.date}
            onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
          >
            <option value="all">Gjithe koha</option>
            <option value="today">Sot</option>
            <option value="7d">7 dite</option>
            <option value="30d">30 dite</option>
          </select>
          <button className="btn btn--ghost" onClick={loadRequests}>Rifresko</button>
        </div>

        <div className="admin-table-row paid-plans-row admin-table-head">
          <span>ID</span>
          <span>Perdoruesi</span>
          <span>Objekti</span>
          <span>Plani</span>
          <span>Data</span>
          <span>Statusi</span>
          <span>Veprimet</span>
        </div>

        {state.loading ? (
          <div className="admin-empty"><p>Duke ngarkuar kerkesat e planeve...</p></div>
        ) : state.error ? (
          <div className="admin-empty"><p style={{ color: "var(--error)" }}>{state.error}</p></div>
        ) : filteredRequests.length === 0 ? (
          <div className="admin-empty"><p>Nuk u gjet asnje kerkese per kete filter.</p></div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="admin-table-row paid-plans-row">
              <span className="moderation-id">#{request.requestId.slice(0, 8)}</span>
              <span className="paid-plans-row__user">
                <strong>{request.userName || request.customerName || "-"}</strong>
                <small>{request.userEmail || request.email || "-"}</small>
              </span>
              <span className="paid-plans-row__target">
                <strong>{request.targetKind === "listing" ? request.listingTitle || "Listim" : request.businessName || "Profil biznesi"}</strong>
                <small>{request.targetKind === "listing" ? request.listingLocation || "-" : request.phone || request.userPhone || "-"}</small>
              </span>
              <span>{request.planLabel}</span>
              <span>{formatDate(request.createdAt)}</span>
              <span>
                <span className={`paid-plan-status-badge paid-plan-status-badge--${request.statusTone}`}>
                  {request.statusLabel}
                </span>
              </span>
              <span className="paid-plans-row__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setSelectedRequest(request)}>
                  <Eye aria-hidden="true" /> Detajet
                </button>
              </span>
            </div>
          ))
        )}
      </div>

      {selectedRequest && (
        <div className="paid-plan-admin-modal" role="dialog" aria-modal="true">
          <div className="paid-plan-admin-modal__backdrop" onClick={() => setSelectedRequest(null)} />
          <div className="paid-plan-admin-modal__card">
            <div className="paid-plan-admin-modal__head">
              <div>
                <p className="section-tag">Paid Plans Management</p>
                <h3>{selectedRequest.planLabel}</h3>
                <span className={`paid-plan-status-badge paid-plan-status-badge--${selectedRequest.statusTone}`}>
                  {selectedRequest.statusLabel}
                </span>
              </div>
              <button type="button" className="pricing-modal__close" onClick={() => setSelectedRequest(null)}>
                x
              </button>
            </div>

            <div className="paid-plan-admin-modal__grid">
              <div className="paid-plan-admin-modal__meta">
                <div><strong>ID:</strong> {selectedRequest.requestId}</div>
                <div><strong>Perdoruesi:</strong> {selectedRequest.userName || selectedRequest.customerName}</div>
                <div><strong>Email:</strong> {selectedRequest.userEmail || selectedRequest.email || "-"}</div>
                <div><strong>Telefoni:</strong> {selectedRequest.userPhone || selectedRequest.phone || "-"}</div>
                <div><strong>Objekti:</strong> {selectedRequest.targetKind === "listing" ? selectedRequest.listingTitle || "-" : selectedRequest.businessName || "-"}</div>
                <div><strong>Cmimi:</strong> {selectedRequest.priceAmount} {selectedRequest.currency}</div>
                <div><strong>Kohëzgjatja:</strong> {selectedRequest.durationLabel}</div>
                <div><strong>Referenca:</strong> {selectedRequest.paymentReference || "-"}</div>
                <div><strong>Transaction ID:</strong> {selectedRequest.transactionId || "-"}</div>
                <div><strong>Krijuar:</strong> {formatDate(selectedRequest.createdAt)}</div>
                <div><strong>Aktivizuar:</strong> {formatDate(selectedRequest.activatedAt)}</div>
                <div><strong>Skadon:</strong> {formatDate(selectedRequest.expiresAt)}</div>
              </div>

              <div className="paid-plan-admin-modal__proof">
                <div className="paid-plan-admin-modal__subhead">
                  <ShieldCheck aria-hidden="true" />
                  <strong>Deshmia e pageses</strong>
                </div>
                {detailLoading ? (
                  <p>Duke ngarkuar proven e pageses...</p>
                ) : proofUrl ? (
                  <>
                    {selectedRequest.proofContentType?.startsWith("image/") ? (
                      <img src={proofUrl} alt="Proof" className="paid-plan-admin-modal__proof-image" />
                    ) : (
                      <div className="paid-plan-admin-modal__proof-file">
                        <strong>{selectedRequest.proofOriginalName || selectedRequest.proofFileName}</strong>
                        <span>Skedar dokumenti i gatshem per shkarkim.</span>
                      </div>
                    )}
                    <a className="btn btn--ghost" href={proofUrl} target="_blank" rel="noreferrer">
                      <DownloadSimple aria-hidden="true" /> Hap / Shkarko
                    </a>
                  </>
                ) : (
                  <p>Nuk u gjenerua linku i deshmise se pageses.</p>
                )}
              </div>
            </div>

            <div className="paid-plan-admin-modal__controls">
              <label className="form-group">
                <label>Admin note</label>
                <textarea rows={3} value={actionForm.adminNote} onChange={(event) => setActionForm((current) => ({ ...current, adminNote: event.target.value }))} />
              </label>
              <label className="form-group">
                <label>Arsye refuzimi</label>
                <textarea rows={3} value={actionForm.rejectionReason} onChange={(event) => setActionForm((current) => ({ ...current, rejectionReason: event.target.value }))} />
              </label>
              <div className="paid-plan-admin-modal__inline">
                <label className="form-group">
                  <label>Duration days</label>
                  <input type="number" min="1" value={actionForm.durationDays} onChange={(event) => setActionForm((current) => ({ ...current, durationDays: event.target.value }))} />
                </label>
                {selectedRequest.planId === "premium" && (
                  <label className="form-group">
                    <label>Premium order</label>
                    <input type="number" min="1" value={actionForm.premiumOrder} onChange={(event) => setActionForm((current) => ({ ...current, premiumOrder: event.target.value }))} />
                  </label>
                )}
              </div>

              {actionError && (
                <div className="paid-plan-admin-modal__error">
                  <WarningCircle aria-hidden="true" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="paid-plan-admin-modal__actions">
                {selectedRequest.paymentStatus === "pending" && (
                  <>
                    <button type="button" className="btn btn--success" disabled={actionLoading !== ""} onClick={() => handleAction("approve")}>
                      <CheckCircle aria-hidden="true" /> {actionLoading === "approve" ? "Duke aprovuar..." : "Approve"}
                    </button>
                    <button type="button" className="btn btn--danger" disabled={actionLoading !== ""} onClick={() => handleAction("reject")}>
                      <XCircle aria-hidden="true" /> {actionLoading === "reject" ? "Duke refuzuar..." : "Reject"}
                    </button>
                  </>
                )}
                {selectedRequest.paymentStatus === "approved" && (
                  <>
                    <button type="button" className="btn btn--primary" disabled={actionLoading !== ""} onClick={() => handleAction("extend")}>
                      <ClockCounterClockwise aria-hidden="true" /> {actionLoading === "extend" ? "Duke zgjatur..." : "Extend"}
                    </button>
                    <button type="button" className="btn btn--ghost" disabled={actionLoading !== ""} onClick={() => handleAction("mark_expired")}>
                      <WarningCircle aria-hidden="true" /> Mark as expired
                    </button>
                    <button type="button" className="btn btn--danger" disabled={actionLoading !== ""} onClick={() => handleAction("deactivate")}>
                      <Prohibit aria-hidden="true" /> Deactivate
                    </button>
                  </>
                )}
                {(selectedRequest.paymentStatus === "expired" || selectedRequest.paymentStatus === "cancelled" || selectedRequest.paymentStatus === "rejected") && (
                  <button type="button" className="btn btn--primary" disabled={actionLoading !== ""} onClick={() => handleAction("renew")}>
                    <ShieldCheck aria-hidden="true" /> {actionLoading === "renew" ? "Duke rinovuar..." : "Renew"}
                  </button>
                )}
                <button type="button" className="btn btn--ghost" disabled={actionLoading !== ""} onClick={() => handleAction("note")}>
                  Ruaj note
                </button>
              </div>

              <div className="paid-plan-admin-modal__audit">
                <div className="paid-plan-admin-modal__subhead">
                  <ClockCounterClockwise aria-hidden="true" />
                  <strong>Audit log</strong>
                </div>
                {!auditEntries.length ? (
                  <p>Nuk ka ende veprime te regjistruara per kete kerkese.</p>
                ) : (
                  auditEntries.map((entry) => (
                    <div key={entry.id} className="paid-plan-admin-modal__audit-item">
                      <strong>{entry.actionType}</strong>
                      <span>{entry.previousStatus} → {entry.nextStatus}</span>
                      <small>{entry.actionBy || "system"} · {formatDate(entry.actionDate)}</small>
                      {entry.adminNote && <p>{entry.adminNote}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
