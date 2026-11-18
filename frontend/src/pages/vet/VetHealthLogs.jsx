import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/client";
import { HEALTH_LOGS_PATH, pickList, fmtDate } from "../../api/helpers";
import PageHeader from "../../components/PageHeader.jsx";

const todayStr = () => new Date().toISOString().slice(0, 10);
const blankMedicine = () => ({ name: "", dosage: "", duration: "" });

const emptyForm = () => ({
  visitDate: todayStr(),
  diagnosis: "",
  symptoms: "",
  treatment: "",
  medicines: [blankMedicine()],
  vaccinationGiven: false,
  vaccinationName: "",
  nextVisitDate: "",
  notes: "",
  attachments: "", // links, one per line
});

const idOf = (v) => (v && typeof v === "object" ? v._id : v);

export default function VetHealthLogs() {
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

  // Pets that are currently checked in
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
      const res = await api.get(`${HEALTH_LOGS_PATH}/pet/${pid}`);
      const list = pickList(res.data);
      setLogs([...list].sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate)));
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
    const { name, value, type, checked } = e.target;
    setMessage("");
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const setMedicine = (i, field, value) => {
    const medicines = form.medicines.map((m, idx) => (idx === i ? { ...m, [field]: value } : m));
    setForm({ ...form, medicines });
  };
  const addMedicine = () => setForm({ ...form, medicines: [...form.medicines, blankMedicine()] });
  const removeMedicine = (i) => {
    const medicines = form.medicines.filter((_, idx) => idx !== i);
    setForm({ ...form, medicines: medicines.length ? medicines : [blankMedicine()] });
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const onEdit = (log) => {
    setMessage("");
    setEditingId(log._id);
    setForm({
      visitDate: (log.visitDate || "").slice(0, 10) || todayStr(),
      diagnosis: log.diagnosis || "",
      symptoms: log.symptoms || "",
      treatment: log.treatment || "",
      medicines: log.medicines?.length
        ? log.medicines.map((m) => ({ name: m.name || "", dosage: m.dosage || "", duration: m.duration || "" }))
        : [blankMedicine()],
      vaccinationGiven: !!log.vaccinationGiven,
      vaccinationName: log.vaccinationName || "",
      nextVisitDate: (log.nextVisitDate || "").slice(0, 10),
      notes: log.notes || "",
      attachments: (log.attachments || []).join("\n"),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!booking) return;

    const body = {
      visitDate: form.visitDate,
      diagnosis: form.diagnosis,
      symptoms: form.symptoms,
      treatment: form.treatment,
      // empty rows are dropped, because your backend requires a name on every medicine
      medicines: form.medicines
        .filter((m) => m.name.trim())
        .map((m) => ({ name: m.name.trim(), dosage: m.dosage.trim(), duration: m.duration.trim() })),
      vaccinationGiven: form.vaccinationGiven,
      vaccinationName: form.vaccinationGiven ? form.vaccinationName : "",
      nextVisitDate: form.nextVisitDate || null,
      notes: form.notes,
      attachments: form.attachments.split("\n").map((l) => l.trim()).filter(Boolean),
    };

    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (editingId) {
        await api.put(`${HEALTH_LOGS_PATH}/${editingId}`, body);
        setMessage("Health record updated.");
      } else {
        await api.post(HEALTH_LOGS_PATH, { ...body, pet: petId, booking: booking._id });
        setMessage("Health record saved. The owner can see it now.");
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
    if (!window.confirm("Delete this health record?")) return;
    setError("");
    try {
      await api.delete(`${HEALTH_LOGS_PATH}/${log._id}`);
      loadLogs(petId);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="container py-5">
      <PageHeader icon="bi-heart-pulse" title="Health records" subtitle="Record diagnosis, medicines and vaccines for pets that are staying." />

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
              {b.pet?.name || "Pet"}{b.pet?.species ? ` (${b.pet.species.toLowerCase()})` : ""} in{" "}
              {b.suite?.name || "suite"}
            </option>
          ))}
        </select>
        {!loadingBookings && bookings.length === 0 && !error && (
          <div className="form-text">No pets are checked in right now.</div>
        )}
      </div>

      {booking && (
        <div className="row g-4">
          {/* ---------- Form ---------- */}
          <div className="col-lg-6">
            <form className="card border-0 shadow-sm p-4" onSubmit={onSubmit}>
              <h2 className="h5 mb-3">
                {editingId ? "Edit health record" : `New record for ${booking.pet?.name || "pet"}`}
              </h2>

              {message && <div className="alert alert-success py-2" role="status">{message}</div>}

              <div className="mb-3">
                <label htmlFor="visitDate" className="form-label fw-semibold">Visit date</label>
                <input
                  id="visitDate" name="visitDate" type="date" className="form-control"
                  value={form.visitDate} onChange={onChange} required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="diagnosis" className="form-label fw-semibold">Diagnosis</label>
                <textarea
                  id="diagnosis" name="diagnosis" rows="2" maxLength={2000} className="form-control"
                  value={form.diagnosis} onChange={onChange} required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="symptoms" className="form-label fw-semibold">Symptoms</label>
                <textarea
                  id="symptoms" name="symptoms" rows="2" maxLength={2000} className="form-control"
                  value={form.symptoms} onChange={onChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="treatment" className="form-label fw-semibold">Treatment</label>
                <textarea
                  id="treatment" name="treatment" rows="2" maxLength={2000} className="form-control"
                  value={form.treatment} onChange={onChange}
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="form-label fw-semibold mb-0">Medicines</span>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={addMedicine}>
                    Add medicine
                  </button>
                </div>

                {form.medicines.map((m, i) => (
                  <div className="row g-2 mb-2" key={i}>
                    <div className="col-5">
                      <input
                        className="form-control" placeholder="Name" aria-label={`Medicine ${i + 1} name`}
                        maxLength={200} value={m.name} onChange={(e) => setMedicine(i, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-3">
                      <input
                        className="form-control" placeholder="Dosage" aria-label={`Medicine ${i + 1} dosage`}
                        maxLength={200} value={m.dosage} onChange={(e) => setMedicine(i, "dosage", e.target.value)}
                      />
                    </div>
                    <div className="col-3">
                      <input
                        className="form-control" placeholder="Duration" aria-label={`Medicine ${i + 1} duration`}
                        maxLength={200} value={m.duration} onChange={(e) => setMedicine(i, "duration", e.target.value)}
                      />
                    </div>
                    <div className="col-1 d-flex align-items-center">
                      <button
                        type="button" className="btn btn-sm btn-outline-danger"
                        aria-label={`Remove medicine ${i + 1}`} onClick={() => removeMedicine(i)}
                      >
                        x
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-check mb-2">
                <input
                  id="vaccinationGiven" name="vaccinationGiven" type="checkbox"
                  className="form-check-input" checked={form.vaccinationGiven} onChange={onChange}
                />
                <label htmlFor="vaccinationGiven" className="form-check-label">Vaccination given today</label>
              </div>

              {form.vaccinationGiven && (
                <div className="mb-3">
                  <label htmlFor="vaccinationName" className="form-label fw-semibold">Vaccine name</label>
                  <input
                    id="vaccinationName" name="vaccinationName" maxLength={200} className="form-control"
                    value={form.vaccinationName} onChange={onChange}
                  />
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="nextVisitDate" className="form-label fw-semibold">Next visit (optional)</label>
                <input
                  id="nextVisitDate" name="nextVisitDate" type="date" className="form-control"
                  value={form.nextVisitDate} onChange={onChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label fw-semibold">Notes</label>
                <textarea
                  id="notes" name="notes" rows="2" maxLength={2000} className="form-control"
                  value={form.notes} onChange={onChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="attachments" className="form-label fw-semibold">Report or photo links (optional)</label>
                <textarea
                  id="attachments" name="attachments" rows="2" className="form-control"
                  placeholder="One link per line, starting with https://"
                  value={form.attachments} onChange={onChange}
                />
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save changes" : "Save record"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-outline-primary" onClick={reset}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ---------- History ---------- */}
          <div className="col-lg-6">
            <h2 className="h5 mb-3">Health history for {booking.pet?.name || "this pet"}</h2>

            {loadingLogs && (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading</span>
              </div>
            )}
            {!loadingLogs && logs.length === 0 && (
              <p className="text-body-secondary">No health records yet.</p>
            )}

            <ul className="list-group shadow-sm">
              {logs.map((log) => (
                <li className="list-group-item" key={log._id}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <strong>{fmtDate(log.visitDate)}</strong>
                      {log.vaccinationGiven && (
                        <span className="badge text-bg-success ms-2">
                          Vaccinated{log.vaccinationName ? `: ${log.vaccinationName}` : ""}
                        </span>
                      )}
                      {log.veterinarian?.name && (
                        <div className="small text-body-secondary">By {log.veterinarian.name}</div>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(log)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(log)}>Delete</button>
                    </div>
                  </div>

                  <div className="small mt-2">
                    <div><strong>Diagnosis:</strong> {log.diagnosis}</div>
                    {log.symptoms && <div><strong>Symptoms:</strong> {log.symptoms}</div>}
                    {log.treatment && <div><strong>Treatment:</strong> {log.treatment}</div>}
                    {log.medicines?.length > 0 && (
                      <div>
                        <strong>Medicines:</strong>{" "}
                        {log.medicines
                          .map((m) => [m.name, m.dosage, m.duration].filter(Boolean).join(" - "))
                          .join("; ")}
                      </div>
                    )}
                    {log.nextVisitDate && <div><strong>Next visit:</strong> {fmtDate(log.nextVisitDate)}</div>}
                    {log.notes && <div><strong>Notes:</strong> {log.notes}</div>}
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