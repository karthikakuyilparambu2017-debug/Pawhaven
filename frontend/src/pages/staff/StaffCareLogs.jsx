import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/client";
import {
  CARE_LOGS_PATH, pickList, fmtDate, MOODS, MOOD_BADGE, titleCase,
} from "../../api/helpers";
import PageHeader from "../../components/PageHeader.jsx";

const todayStr = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  careDate: todayStr(),
  feeding: "",
  walking: "",
  grooming: "",
  medication: "",
  activityNotes: "",
  mood: "HAPPY",
  images: "", // photo links, one per line
});

const idOf = (v) => (v && typeof v === "object" ? v._id : v);

export default function StaffCareLogs() {
  const [bookings, setBookings] = useState([]);
  const [bookingId, setBookingId] = useState("");
  const [logs, setLogs] = useState([]);

  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);

  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const booking = bookings.find((b) => b._id === bookingId);
  const petId = idOf(booking?.pet);

  // Only pets that are currently checked in
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/bookings/all");
        const list = res.data.bookings || pickList(res.data);
        setBookings(list.filter((b) => b.bookingStatus === "CHECKED_IN"));
      } catch (e) {
        setError(errorMessage(e));
      } finally {
        setLoadingBookings(false);
      }
    })();
  }, []);

  const loadLogs = async (pid) => {
    if (!pid) return setLogs([]);
    setLoadingLogs(true);
    try {
      const res = await api.get(`${CARE_LOGS_PATH}/pet/${pid}`);
      const list = pickList(res.data);
      setLogs([...list].sort((a, b) => new Date(b.careDate) - new Date(a.careDate)));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    setEditingId(null);
    setForm(emptyForm());
    setMessage("");
    loadLogs(petId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const onChange = (e) => {
    setMessage("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const onEdit = (log) => {
    setMessage("");
    setEditingId(log._id);
    setForm({
      careDate: (log.careDate || "").slice(0, 10) || todayStr(),
      feeding: log.feeding || "",
      walking: log.walking || "",
      grooming: log.grooming || "",
      medication: log.medication || "",
      activityNotes: log.activityNotes || "",
      mood: log.mood || "UNKNOWN",
      images: (log.images || []).join("\n"),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!booking) return;

    const body = {
      careDate: form.careDate,
      feeding: form.feeding,
      walking: form.walking,
      grooming: form.grooming,
      medication: form.medication,
      activityNotes: form.activityNotes,
      mood: form.mood,
      images: form.images.split("\n").map((l) => l.trim()).filter(Boolean),
    };

    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (editingId) {
        await api.put(`${CARE_LOGS_PATH}/${editingId}`, body);
        setMessage("Care log updated.");
      } else {
        await api.post(CARE_LOGS_PATH, { ...body, booking: booking._id, pet: petId });
        setMessage("Care log saved. The owner can see it now.");
      }
      reset();
      loadLogs(petId);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (log) => {
    if (!window.confirm("Delete this care log?")) return;
    setError("");
    try {
      await api.delete(`${CARE_LOGS_PATH}/${log._id}`);
      loadLogs(petId);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="container py-5">
      <PageHeader icon="bi-journal-text" title="Daily care logs" subtitle="Record meals, walks and mood for pets that are staying." />

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="mb-4" style={{ maxWidth: 520 }}>
        <label htmlFor="booking" className="form-label fw-semibold">Pet currently staying</label>
        <select
          id="booking" className="form-select" value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
        >
          <option value="">Choose a checked-in pet</option>
          {bookings.map((b) => (
            <option key={b._id} value={b._id}>
              {b.pet?.name || "Pet"} in {b.suite?.name || "suite"} (owner: {b.owner?.name || "unknown"})
            </option>
          ))}
        </select>
        {!loadingBookings && bookings.length === 0 && (
          <div className="form-text">
            No pets are checked in. In Manage bookings, click Check in on a confirmed booking first.
          </div>
        )}
      </div>

      {booking && (
        <div className="row g-4">
          {/* ---------- Form ---------- */}
          <div className="col-lg-5">
            <form className="card border-0 shadow-sm p-4" onSubmit={onSubmit}>
              <h2 className="h5 mb-3">
                {editingId ? "Edit care log" : `New care log for ${booking.pet?.name || "pet"}`}
              </h2>

              {message && <div className="alert alert-success py-2" role="status">{message}</div>}

              <div className="row">
                <div className="col-6 mb-3">
                  <label htmlFor="careDate" className="form-label fw-semibold">Date</label>
                  <input
                    id="careDate" name="careDate" type="date" className="form-control"
                    value={form.careDate} onChange={onChange} required
                  />
                </div>
                <div className="col-6 mb-3">
                  <label htmlFor="mood" className="form-label fw-semibold">Mood</label>
                  <select id="mood" name="mood" className="form-select" value={form.mood} onChange={onChange}>
                    {MOODS.map((m) => (
                      <option key={m} value={m}>{titleCase(m)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {[
                ["feeding", "Feeding", "What and how much did they eat?"],
                ["walking", "Walking and play", "Walks, playtime"],
                ["grooming", "Grooming", "Bath, brushing"],
                ["medication", "Medication", "Medicine given and time"],
              ].map(([name, text, hint]) => (
                <div className="mb-3" key={name}>
                  <label htmlFor={name} className="form-label fw-semibold">{text}</label>
                  <textarea
                    id={name} name={name} rows="2" maxLength={1000} className="form-control"
                    placeholder={hint} value={form[name]} onChange={onChange}
                  />
                </div>
              ))}

              <div className="mb-3">
                <label htmlFor="activityNotes" className="form-label fw-semibold">Other notes</label>
                <textarea
                  id="activityNotes" name="activityNotes" rows="3" maxLength={2000}
                  className="form-control" value={form.activityNotes} onChange={onChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="images" className="form-label fw-semibold">Photo links (optional)</label>
                <textarea
                  id="images" name="images" rows="2" className="form-control"
                  placeholder="One link per line, starting with https://"
                  value={form.images} onChange={onChange}
                />
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save changes" : "Save care log"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-outline-primary" onClick={reset}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ---------- Logs so far ---------- */}
          <div className="col-lg-7">
            <h2 className="h5 mb-3">Care history for {booking.pet?.name || "this pet"}</h2>

            {loadingLogs && (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading</span>
              </div>
            )}
            {!loadingLogs && logs.length === 0 && (
              <p className="text-body-secondary">No care logs yet. Add the first one.</p>
            )}

            <ul className="list-group shadow-sm">
              {logs.map((log) => (
                <li className="list-group-item" key={log._id}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <strong>{fmtDate(log.careDate)}</strong>{" "}
                      <span className={`badge ${MOOD_BADGE[log.mood] || "text-bg-secondary"}`}>
                        {titleCase(log.mood)}
                      </span>
                      {log.staff?.name && (
                        <div className="small text-body-secondary">By {log.staff.name}</div>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(log)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(log)}>Delete</button>
                    </div>
                  </div>

                  <div className="small mt-2">
                    {log.feeding && <div><strong>Feeding:</strong> {log.feeding}</div>}
                    {log.walking && <div><strong>Walking:</strong> {log.walking}</div>}
                    {log.grooming && <div><strong>Grooming:</strong> {log.grooming}</div>}
                    {log.medication && <div><strong>Medication:</strong> {log.medication}</div>}
                    {log.activityNotes && <div><strong>Notes:</strong> {log.activityNotes}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}