import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addSuite, editSuite, fetchSuites, removeSuite } from "../../features/suitesSlice";
import Field from "../../components/Field";
import PageHeader from "../../components/PageHeader.jsx";
const TYPES = ["STANDARD", "PREMIUM", "VIP"];
const label = (v) => (v || "").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const empty = {
  name: "",
  description: "",
  type: "STANDARD",
  capacity: 1,
  pricePerDay: "",
  amenities: "",
  image: "",
  isAvailable: true,
};

export default function AdminSuites() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.suites);

  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(fetchSuites());
  }, [dispatch]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMessage("");
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const onEdit = (s) => {
    setMessage("");
    setEditingId(s._id);
    setForm({
      name: s.name || "",
      description: s.description || "",
      type: s.type || "STANDARD",
      capacity: s.capacity ?? 1,
      pricePerDay: s.pricePerDay ?? "",
      amenities: (s.amenities || []).join(", "),
      image: s.image || "",
      isAvailable: s.isAvailable !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const body = {
      name: form.name,
      description: form.description,
      type: form.type,
      capacity: Number(form.capacity),
      pricePerDay: Number(form.pricePerDay),
      amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      isAvailable: form.isAvailable,
    };
    if (form.image.trim()) body.image = form.image.trim();

    setSaving(true);
    const res = editingId
      ? await dispatch(editSuite({ id: editingId, body }))
      : await dispatch(addSuite(body));
    setSaving(false);

    if (res.type.endsWith("/fulfilled")) {
      setMessage(editingId ? "Suite updated." : "Suite added.");
      reset();
    }
  };

  const onDelete = (s) => {
    if (window.confirm(`Delete "${s.name}"? This cannot be undone.`)) {
      dispatch(removeSuite(s._id));
    }
  };

  const toggleAvailable = (s) => {
    dispatch(editSuite({ id: s._id, body: { isAvailable: !(s.isAvailable !== false) } }));
  };

  return (
    <div className="container py-5">
     <PageHeader icon="bi-house-door" title="Manage suites" subtitle="Add, edit, hide or delete the suites owners can book." />

      <div className="row g-4">
        <div className="col-lg-4">
          <form className="card border-0 shadow-sm p-4" onSubmit={onSubmit}>
            <h2 className="h5 mb-3">{editingId ? "Edit suite" : "Add a suite"}</h2>

            {message && <div className="alert alert-success py-2" role="status">{message}</div>}
            {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

            <Field label="Suite name" id="name" maxLength={100} value={form.name} onChange={onChange} required />

            <div className="mb-3">
              <label htmlFor="type" className="form-label fw-semibold">Type</label>
              <select id="type" name="type" className="form-select" value={form.type} onChange={onChange}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{label(t)}</option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="col-6">
                <Field label="Capacity" id="capacity" type="number" min="1" value={form.capacity} onChange={onChange} required />
              </div>
              <div className="col-6">
                <Field label="Price per day (₹)" id="pricePerDay" type="number" min="0" value={form.pricePerDay} onChange={onChange} required />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label fw-semibold">Description</label>
              <textarea
                id="description" name="description" rows="3" maxLength={1000}
                className="form-control" value={form.description} onChange={onChange}
              />
            </div>

            <Field
              label="Amenities (separate with commas)" id="amenities"
              placeholder="AC, Webcam, Play area"
              value={form.amenities} onChange={onChange}
            />

            <Field
              label="Image URL (optional)" id="image" type="url"
              placeholder="https://..."
              value={form.image} onChange={onChange}
            />

            <div className="form-check mb-3">
              <input
                id="isAvailable" name="isAvailable" type="checkbox"
                className="form-check-input" checked={form.isAvailable} onChange={onChange}
              />
              <label htmlFor="isAvailable" className="form-check-label">Available for booking</label>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-primary flex-grow-1" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save changes" : "Add suite"}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline-primary" onClick={reset}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="col-lg-8">
          {status === "loading" && (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading</span>
            </div>
          )}
          {status === "idle" && items.length === 0 && (
            <p className="text-body-secondary">No suites yet. Add your first suite with the form.</p>
          )}

          <ul className="list-group shadow-sm">
            {items.map((s) => {
              const available = s.isAvailable !== false;
              return (
                <li className="list-group-item" key={s._id}>
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div className="d-flex gap-3">
                      {s.image ? (
                        <img
                          src={s.image} alt={s.name}
                          style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }}
                        />
                      ) : (
                        <div className="icon-circle" aria-hidden="true">🛏️</div>
                      )}
                      <div>
                        <strong>{s.name}</strong>{" "}
                        <span className="badge text-bg-warning">{label(s.type)}</span>{" "}
                        <span className={`badge ${available ? "text-bg-success" : "text-bg-secondary"}`}>
                          {available ? "Available" : "Hidden"}
                        </span>
                        <div className="small text-body-secondary">
                          {money(s.pricePerDay)} per day · fits {s.capacity}
                        </div>
                        {s.amenities?.length > 0 && (
                          <div className="small text-body-secondary">{s.amenities.join(", ")}</div>
                        )}
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-1 flex-shrink-0">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(s)}>Edit</button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleAvailable(s)}>
                        {available ? "Hide" : "Show"}
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(s)}>Delete</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}