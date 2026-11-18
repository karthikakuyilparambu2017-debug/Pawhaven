import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/client";
import PageHeader from "../../components/PageHeader.jsx";

const STATUS_BADGE = {
  PENDING: "text-bg-warning",
  CONFIRMED: "text-bg-primary",
  CHECKED_IN: "text-bg-info",
  COMPLETED: "text-bg-success",
  CANCELLED: "text-bg-secondary",
  REJECTED: "text-bg-danger",
};

const PAY_BADGE = {
  PENDING: "text-bg-warning",
  PAID: "text-bg-success",
  FAILED: "text-bg-danger",
  REFUNDED: "text-bg-secondary",
};

// Which buttons to show for each status
const ACTIONS = {
  PENDING: [
    { status: "CONFIRMED", text: "Confirm", cls: "btn-primary" },
    { status: "REJECTED", text: "Reject", cls: "btn-outline-danger" },
  ],
  CONFIRMED: [
    { status: "CHECKED_IN", text: "Check in", cls: "btn-primary" },
    { status: "CANCELLED", text: "Cancel", cls: "btn-outline-danger" },
  ],
  CHECKED_IN: [{ status: "COMPLETED", text: "Complete stay", cls: "btn-primary" }],
};

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED", "REJECTED"];

const label = (v) =>
  (v || "").replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function AdminBookings() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async (current = filter) => {
    setLoading(true);
    setError("");
    try {
      const url = current === "ALL" ? "/bookings/all" : `/bookings/all?status=${current}`;
      const res = await api.get(url);
      setItems(res.data.bookings || []);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const changeStatus = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      const res = await api.patch(`/bookings/${id}/status`, { status });
      const newStatus = res.data.booking?.bookingStatus || status;
      // Only the status changes, so owner, pet and suite names stay on screen
      setItems((list) =>
        list.map((b) => (b._id === id ? { ...b, bookingStatus: newStatus } : b))
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container py-5">
     <PageHeader icon="bi-calendar-check" title="Manage bookings" subtitle="Confirm, check in and complete stays." />

      <div className="d-flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter(f)}
          >
            {f === "ALL" ? "All" : label(f)}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {loading && (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading</span>
        </div>
      )}

      {!loading && items.length === 0 && (
        <p className="text-body-secondary">No bookings found for this filter.</p>
      )}

      <ul className="list-group shadow-sm">
        {items.map((b) => (
          <li className="list-group-item" key={b._id}>
            <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
              <div>
                <strong>{b.pet?.name || "Pet"}</strong>
                {b.pet?.species ? ` (${label(b.pet.species)})` : ""} in{" "}
                <strong>{b.suite?.name || "suite"}</strong>

                <div className="small text-body-secondary">
                  Owner: {b.owner?.name || "Unknown"}
                  {b.owner?.email ? ` · ${b.owner.email}` : ""}
                </div>
                <div className="small text-body-secondary">
                  {fmtDate(b.checkInDate)} to {fmtDate(b.checkOutDate)} · {b.numberOfDays} day
                  {b.numberOfDays > 1 ? "s" : ""} · {money(b.totalAmount)}
                </div>
                {b.specialInstructions && (
                  <div className="small text-body-secondary">Note: {b.specialInstructions}</div>
                )}
                {b.cancellationReason && (
                  <div className="small text-body-secondary">Cancelled: {b.cancellationReason}</div>
                )}
              </div>

              <div className="text-end">
                <span className={`badge ${STATUS_BADGE[b.bookingStatus] || "text-bg-light"} me-1`}>
                  {label(b.bookingStatus)}
                </span>
                <span className={`badge ${PAY_BADGE[b.paymentStatus] || "text-bg-light"}`}>
                  Payment {label(b.paymentStatus)}
                </span>

                <div className="d-flex gap-2 justify-content-end mt-2">
                  {(ACTIONS[b.bookingStatus] || []).map((a) => (
                    <button
                      key={a.status}
                      className={`btn btn-sm ${a.cls}`}
                      disabled={busyId === b._id}
                      onClick={() => changeStatus(b._id, a.status)}
                    >
                      {a.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}