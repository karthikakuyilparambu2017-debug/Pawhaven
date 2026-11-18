import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api, { errorMessage } from "../../api/client";

/* ---------- helpers ---------- */

// Finds the first array inside a reply like { success, count, bookings: [...] }
const pickList = (d) => {
  if (Array.isArray(d)) return d;
  for (const v of Object.values(d || {})) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      const inner = Object.values(v).find(Array.isArray);
      if (inner) return inner;
    }
  }
  return [];
};

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const compact = (n) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const label = (v) =>
  (v || "").replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

const STATUS = [
  { key: "PENDING", color: "#e8a317", badge: "text-bg-warning" },
  { key: "CONFIRMED", color: "#2a5d94", badge: "text-bg-primary" },
  { key: "CHECKED_IN", color: "#14919f", badge: "text-bg-info" },
  { key: "COMPLETED", color: "#2e9e6b", badge: "text-bg-success" },
  { key: "CANCELLED", color: "#98a2b3", badge: "text-bg-secondary" },
  { key: "REJECTED", color: "#d64545", badge: "text-bg-danger" },
];
const BADGE = Object.fromEntries(STATUS.map((s) => [s.key, s.badge]));
const PAY_BADGE = { PENDING: "text-bg-warning", PAID: "text-bg-success", FAILED: "text-bg-danger", REFUNDED: "text-bg-secondary" };

const QUICK = [
  { to: "/admin/bookings", icon: "bi-calendar-check", text: "Manage bookings" },
  { to: "/admin/suites", icon: "bi-house-door", text: "Manage suites" },
  { to: "/admin/users", icon: "bi-people", text: "Manage users" },
  { to: "/staff/care-logs", icon: "bi-journal-text", text: "Care logs" },
  { to: "/vet/health-logs", icon: "bi-heart-pulse", text: "Health logs" },
];

const niceMax = (v) => {
  if (v <= 0) return 1000;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
};

/* ---------- small components ---------- */

function Kpi({ icon, tone, labelText, value, sub, children }) {
  return (
    <div className="kpi-card">
      <div className={`kpi-tile ${tone}`}><i className={`bi ${icon}`} /></div>
      <div className="flex-grow-1">
        <div className="kpi-label">{labelText}</div>
        <div className="kpi-value">{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
        {children}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const W = 600, H = 250, padL = 52, padR = 14, padT = 22, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const top = niceMax(Math.max(...data.map((d) => d.value), 0));
  const step = innerW / data.length;
  const bw = Math.min(48, step * 0.55);
  const ticks = [0, 1, 2, 3, 4].map((i) => (top / 4) * i);
  const y = (v) => padT + innerH - (v / top) * innerH;

  return (
    <svg
      className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label="Revenue from paid bookings for the last 6 months"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line className="grid" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end">{compact(t)}</text>
        </g>
      ))}

      {data.map((d, i) => {
        const x = padL + step * i + (step - bw) / 2;
        const h = padT + innerH - y(d.value);
        return (
          <g key={d.label + i}>
            <rect
              x={x} y={y(d.value)} width={bw} height={Math.max(h, d.value > 0 ? 2 : 0)} rx="6"
              fill={i === data.length - 1 ? "#14919f" : "#12304f"}
            />
            {d.value > 0 && (
              <text className="bar-value" x={x + bw / 2} y={y(d.value) - 6} textAnchor="middle">
                {compact(d.value)}
              </text>
            )}
            <text x={x + bw / 2} y={H - 12} textAnchor="middle">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- page ---------- */

export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);

  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [suites, setSuites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    const [b, u, s] = await Promise.allSettled([
      api.get("/bookings/all"),
      api.get("/admin/users"),
      api.get("/suites"),
    ]);

    if (b.status === "fulfilled") setBookings(b.value.data.bookings || pickList(b.value.data));
    else setError(errorMessage(b.reason));

    if (u.status === "fulfilled") setUsers(pickList(u.value.data));
    if (s.status === "fulfilled") setSuites(pickList(s.value.data));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings((list) => list.map((b) => (b._id === id ? { ...b, bookingStatus: status } : b)));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const paid = bookings.filter((b) => b.paymentStatus === "PAID");
    const revenue = paid.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const monthRevenue = paid
      .filter((b) => {
        const d = new Date(b.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const value = paid
        .filter((b) => {
          const c = new Date(b.createdAt);
          return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
        })
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      return { label: d.toLocaleString("en-IN", { month: "short" }), value };
    });

    const counts = Object.fromEntries(
      STATUS.map((s) => [s.key, bookings.filter((b) => b.bookingStatus === s.key).length])
    );

    const staying = bookings.filter((b) => b.bookingStatus === "CHECKED_IN");
    const stayingSuites = new Set(staying.map((b) => b.suite?._id || b.suite)).size;
    const availableSuites = suites.filter((s) => s.isAvailable !== false).length;
    const occupancy = availableSuites ? Math.min(100, Math.round((stayingSuites / availableSuites) * 100)) : 0;

    const role = (r) => users.filter((u) => u.role === r).length;
    const recent = [...bookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    return {
      revenue, monthRevenue, months, counts, staying, stayingSuites, availableSuites, occupancy,
      owners: role("PET_OWNER"), staff: role("STAFF"), vets: role("VETERINARIAN"),
      pending: bookings.filter((b) => b.bookingStatus === "PENDING").slice(0, 4),
      recent,
    };
  }, [bookings, users, suites]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const total = bookings.length;

  return (
    <>
      <div className="page-band">
        <div className="container dash-head">
          <div>
            <h1>{greeting}{user?.name ? `, ${user.name}` : ""}</h1>
            <p className="dash-date">{today}</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={load} disabled={loading}>
              <i className="bi bi-arrow-clockwise me-1" />{loading ? "Loading..." : "Refresh"}
            </button>
            <Link to="/admin/bookings" className="btn btn-primary">
              <i className="bi bi-calendar-check me-1" />Manage bookings
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        {/* ---------- KPI cards ---------- */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <Kpi
              icon="bi-cash-coin" tone="tile-green" labelText="Revenue (paid)"
              value={money(stats.revenue)} sub={`${money(stats.monthRevenue)} this month`}
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <Kpi
              icon="bi-calendar-check" tone="tile-navy" labelText="Total bookings"
              value={total} sub={`${stats.counts.PENDING} pending approval`}
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <Kpi
              icon="bi-heart-fill" tone="tile-coral" labelText="Pets staying now"
              value={stats.staying.length}
              sub={`${stats.stayingSuites} of ${stats.availableSuites} suites occupied`}
            >
              <div className="kpi-bar"><span style={{ width: `${stats.occupancy}%` }} /></div>
            </Kpi>
          </div>
          <div className="col-sm-6 col-xl-3">
            <Kpi
              icon="bi-people-fill" tone="tile-teal" labelText="Users"
              value={users.length}
              sub={`${stats.owners} owners · ${stats.staff} staff · ${stats.vets} vets`}
            />
          </div>
        </div>

        {/* ---------- Charts ---------- */}
        <div className="row g-3 mb-4">
          <div className="col-lg-8">
            <div className="dash-card">
              <div className="dash-card-head">
                <h2>Revenue, last 6 months</h2>
                <span className="small text-body-secondary">Paid bookings, by booking date</span>
              </div>
              <div className="dash-card-body">
                <BarChart data={stats.months} />
                {stats.revenue === 0 && !loading && (
                  <div className="dash-empty text-center">No paid bookings yet. Revenue appears here after the first payment.</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="dash-card">
              <div className="dash-card-head"><h2>Booking status</h2></div>
              <div className="dash-card-body">
                <div className="segbar mb-3" aria-hidden="true">
                  {total > 0 &&
                    STATUS.map((s) => (
                      <span
                        key={s.key}
                        style={{ width: `${(stats.counts[s.key] / total) * 100}%`, background: s.color }}
                      />
                    ))}
                </div>
                {STATUS.map((s) => (
                  <div className="legend-row" key={s.key}>
                    <span><span className="legend-dot" style={{ background: s.color }} />{label(s.key)}</span>
                    <strong>{stats.counts[s.key]}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Tables and lists ---------- */}
        <div className="row g-3 mb-4">
          <div className="col-lg-8">
            <div className="dash-card">
              <div className="dash-card-head">
                <h2>Recent bookings</h2>
                <Link to="/admin/bookings" className="small fw-semibold">View all</Link>
              </div>
              <div className="dash-card-body px-0 pb-0">
                {stats.recent.length === 0 ? (
                  <div className="dash-empty px-4 pb-4">No bookings yet.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table dash-table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Pet</th><th>Owner</th><th>Suite</th><th>Dates</th><th>Amount</th><th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recent.map((b) => (
                          <tr key={b._id}>
                            <td className="fw-semibold">{b.pet?.name || "Pet"}</td>
                            <td>{b.owner?.name || "Unknown"}</td>
                            <td>{b.suite?.name || "Suite"}</td>
                            <td className="text-nowrap">{fmtDate(b.checkInDate)} to {fmtDate(b.checkOutDate)}</td>
                            <td>{money(b.totalAmount)}</td>
                            <td className="text-nowrap">
                              <span className={`badge ${BADGE[b.bookingStatus] || "text-bg-light"} me-1`}>
                                {label(b.bookingStatus)}
                              </span>
                              <span className={`badge ${PAY_BADGE[b.paymentStatus] || "text-bg-light"}`}>
                                {label(b.paymentStatus)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4 d-grid gap-3 align-content-start">
            <div className="dash-card">
              <div className="dash-card-head">
                <h2>Needs attention</h2>
                <span className="badge text-bg-warning">{stats.counts.PENDING} pending</span>
              </div>
              <div className="dash-card-body">
                {stats.pending.length === 0 ? (
                  <div className="dash-empty">Nothing waiting. All bookings are handled.</div>
                ) : (
                  stats.pending.map((b) => (
                    <div className="mini-item" key={b._id}>
                      <div>
                        <div className="fw-semibold">{b.pet?.name || "Pet"}</div>
                        <div className="small text-body-secondary">
                          {b.suite?.name || "Suite"} · {fmtDate(b.checkInDate)}
                        </div>
                      </div>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-primary" disabled={busyId === b._id}
                          onClick={() => changeStatus(b._id, "CONFIRMED")}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger" disabled={busyId === b._id}
                          onClick={() => changeStatus(b._id, "REJECTED")}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="dash-card">
              <div className="dash-card-head"><h2>Currently staying</h2></div>
              <div className="dash-card-body">
                {stats.staying.length === 0 ? (
                  <div className="dash-empty">No pets are checked in right now.</div>
                ) : (
                  stats.staying.slice(0, 5).map((b) => (
                    <div className="mini-item" key={b._id}>
                      <div className="d-flex align-items-center gap-2">
                        <span className="mini-avatar">{(b.pet?.name || "?").charAt(0).toUpperCase()}</span>
                        <div>
                          <div className="fw-semibold">{b.pet?.name || "Pet"}</div>
                          <div className="small text-body-secondary">{b.suite?.name || "Suite"}</div>
                        </div>
                      </div>
                      <span className="small text-body-secondary">Out {fmtDate(b.checkOutDate)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Quick actions ---------- */}
        <h2 className="h6 mb-3">Quick actions</h2>
        <div className="row g-3">
          {QUICK.map((q) => (
            <div className="col-12 col-sm-6 col-lg" key={q.to}>
              <Link to={q.to} className="quick-link">
                <span className="icon-circle"><i className={`bi ${q.icon}`} /></span>
                {q.text}
                <i className="bi bi-arrow-right ms-auto" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}