import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addBooking, cancelBooking, fetchBookings } from "../features/bookingsSlice";
import { fetchPets } from "../features/petsSlice";
import { fetchSuites } from "../features/suitesSlice";
import { payForBooking } from "../api/payment";
import { errorMessage } from "../api/client";
import Field from "../components/Field";

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

const label = (v) =>
  (v || "").replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const today = new Date().toISOString().slice(0, 10);
const emptyForm = { pet: "", suite: "", checkInDate: "", checkOutDate: "", specialInstructions: "" };

export default function Bookings() {
  const dispatch = useDispatch();
  const location = useLocation();

  const { user } = useSelector((s) => s.auth);
  const { items, status, error } = useSelector((s) => s.bookings);
  const { items: pets, status: petsStatus, error: petsError } = useSelector((s) => s.pets);
  const { items: suites, error: suitesError } = useSelector((s) => s.suites);

  const [form, setForm] = useState({ ...emptyForm, suite: location.state?.suiteId || "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [notice, setNotice] = useState(null); // { type: "success" | "warning" | "danger", text }

  useEffect(() => {
    dispatch(fetchBookings());
    dispatch(fetchPets());
    dispatch(fetchSuites());
  }, [dispatch]);

  const onChange = (e) => {
    setMessage("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const availableSuites = suites.filter((s) => s.isAvailable !== false);

  // Estimate only. The server calculates the real days and total.
  const estimate = useMemo(() => {
    const suite = suites.find((s) => s._id === form.suite);
    if (!suite?.pricePerDay || !form.checkInDate || !form.checkOutDate) return null;
    const days = Math.ceil(
      (new Date(form.checkOutDate) - new Date(form.checkInDate)) / 86400000
    );
    return days > 0 ? { days, total: days * suite.pricePerDay } : null;
  }, [form, suites]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setNotice(null);
    const res = await dispatch(addBooking(form));
    setSaving(false);
    if (addBooking.fulfilled.match(res)) {
      setForm(emptyForm);
      setMessage("Booking created. Pay now to confirm your stay.");
    }
  };

  const onCancel = (id) => {
    const reason = window.prompt("Reason for cancelling (optional)");
    if (reason !== null) dispatch(cancelBooking({ id, reason }));
  };

  const onPay = async (booking) => {
    setNotice(null);
    setMessage("");
    setPayingId(booking._id);
    try {
      await payForBooking(booking, user);
      setNotice({ type: "success", text: "Payment successful. Your booking is confirmed." });
    } catch (e) {
      if (e.code === "CLOSED") {
        setNotice({ type: "warning", text: "Payment window closed. You can pay any time using the Pay button." });
      } else if (e.code === "FAILED" || e.code === "VERIFY_FAILED") {
        setNotice({ type: "danger", text: e.message });
      } else {
        setNotice({ type: "danger", text: errorMessage(e) });
      }
    } finally {
      setPayingId(null);
      dispatch(fetchBookings()); // refresh the badges from the server
    }
  };

  return (
    <>
      <div className="page-band">
        <div className="container">
          <h1>Bookings</h1>
          <p>Book a suite for your pet, pay online and track every stay.</p>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          {/* ---------- New booking form ---------- */}
          <div className="col-lg-4">
            <form className="card border-0 shadow-sm p-4 sticky-form" onSubmit={onSubmit}>
              <h2 className="h5 mb-3">New booking</h2>

              {message && <div className="alert alert-success py-2" role="status">{message}</div>}
              {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

              <div className="mb-3">
                <label htmlFor="pet" className="form-label fw-semibold">Pet</label>
                <select id="pet" name="pet" className="form-select" value={form.pet} onChange={onChange} required>
                  <option value="">Choose a pet</option>
                  {pets.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}{p.species ? ` (${label(p.species)})` : ""}
                    </option>
                  ))}
                </select>
                {petsError && <div className="form-text text-danger">Could not load your pets: {petsError}</div>}
                {!petsError && petsStatus === "idle" && pets.length === 0 && (
                  <div className="form-text">
                    You have no pets yet. <Link to="/pets">Add a pet first</Link>.
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="suite" className="form-label fw-semibold">Suite</label>
                <select id="suite" name="suite" className="form-select" value={form.suite} onChange={onChange} required>
                  <option value="">Choose a suite</option>
                  {availableSuites.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}{s.pricePerDay ? ` - ${money(s.pricePerDay)}/day` : ""}
                    </option>
                  ))}
                </select>
                {suitesError && <div className="form-text text-danger">Could not load suites: {suitesError}</div>}
                {!suitesError && availableSuites.length === 0 && (
                  <div className="form-text">No suites are available yet.</div>
                )}
              </div>

              <div className="row">
                <div className="col-6">
                  <Field label="Check-in" id="checkInDate" type="date" min={today} value={form.checkInDate} onChange={onChange} required />
                </div>
                <div className="col-6">
                  <Field label="Check-out" id="checkOutDate" type="date" min={form.checkInDate || today} value={form.checkOutDate} onChange={onChange} required />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="specialInstructions" className="form-label fw-semibold">Special instructions</label>
                <textarea
                  id="specialInstructions" name="specialInstructions" rows="3" maxLength={1000}
                  className="form-control" placeholder="Food, medicine, habits"
                  value={form.specialInstructions} onChange={onChange}
                />
              </div>

              {estimate && (
                <div className="estimate-box">
                  <div className="small">Estimated total</div>
                  <div className="fw-bold fs-5">{money(estimate.total)}</div>
                  <div className="small">{estimate.days} day{estimate.days > 1 ? "s" : ""}</div>
                </div>
              )}

              <button className="btn btn-primary w-100" disabled={saving}>
                {saving ? "Booking..." : "Book stay"}
              </button>
            </form>
          </div>

          {/* ---------- My bookings ---------- */}
          <div className="col-lg-8">
            {notice && <div className={`alert alert-${notice.type}`} role="alert">{notice.text}</div>}

            {status === "loading" && items.length === 0 && (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading</span>
              </div>
            )}

            {status === "idle" && items.length === 0 && (
              <div className="empty-state">
                <i className="bi bi-calendar-check" />
                No bookings yet. Choose a pet and a suite to make your first one.
              </div>
            )}

            <div className="d-grid gap-3">
              {items.map((b) => {
                const canCancel = ["PENDING", "CONFIRMED"].includes(b.bookingStatus);
                const canPay = canCancel && b.paymentStatus !== "PAID";

                return (
                  <article className="booking-card" key={b._id}>
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                      <div>
                        <h2 className="h6 mb-1">
                          {b.pet?.name || "Pet"}
                          <span className="fw-normal text-body-secondary"> in {b.suite?.name || "suite"}</span>
                          {b.suite?.type && <span className="badge text-bg-light border ms-2">{label(b.suite.type)}</span>}
                        </h2>

                        <div className="booking-meta">
                          <span><i className="bi bi-calendar3" />{fmtDate(b.checkInDate)} to {fmtDate(b.checkOutDate)}</span>
                          {b.numberOfDays ? (
                            <span><i className="bi bi-moon-stars" />{b.numberOfDays} day{b.numberOfDays > 1 ? "s" : ""}</span>
                          ) : null}
                          {b.totalAmount != null && <span><i className="bi bi-cash-coin" />{money(b.totalAmount)}</span>}
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-1">
                        <span className={`badge ${STATUS_BADGE[b.bookingStatus] || "text-bg-light"}`}>
                          {label(b.bookingStatus)}
                        </span>
                        <span className={`badge ${PAY_BADGE[b.paymentStatus] || "text-bg-light"}`}>
                          Payment {label(b.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    {b.specialInstructions && (
                      <div className="small text-body-secondary mt-2">Note: {b.specialInstructions}</div>
                    )}
                    {b.cancellationReason && (
                      <div className="small text-body-secondary mt-1">Cancelled: {b.cancellationReason}</div>
                    )}

                    {(canPay || (canCancel && b.paymentStatus !== "PAID")) && (
                      <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top">
                        {canPay && (
                          <button className="btn btn-sm btn-sun" disabled={payingId === b._id} onClick={() => onPay(b)}>
                            {payingId === b._id ? "Opening..." : `Pay ${money(b.totalAmount)}`}
                          </button>
                        )}
                        {canCancel && b.paymentStatus !== "PAID" && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => onCancel(b._id)}>
                            Cancel booking
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}