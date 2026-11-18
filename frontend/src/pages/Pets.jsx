import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addPet, fetchPets, removePet } from "../features/petsSlice";
import Field from "../components/Field";

const SPECIES = ["DOG", "CAT", "BIRD", "RABBIT", "OTHER"];
const GENDERS = ["UNKNOWN", "MALE", "FEMALE"];
const VACCINATION = ["UNKNOWN", "UP_TO_DATE", "PENDING"];

const label = (v) =>
  (v || "").replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

const empty = {
  name: "",
  species: "DOG",
  breed: "",
  age: "",
  gender: "UNKNOWN",
  weight: "",
  vaccinationStatus: "UNKNOWN",
  medicalNotes: "",
};

export default function Pets() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.pets);

  const [form, setForm] = useState(empty);
  const [image, setImage] = useState(null);
  const [fileKey, setFileKey] = useState(0); // changing this clears the file input
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchPets());
  }, [dispatch]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    // Your route uses upload.single("image"), so we send FormData
    const data = new FormData();
    data.append("name", form.name);
    data.append("species", form.species);
    data.append("age", form.age);
    data.append("gender", form.gender);
    data.append("vaccinationStatus", form.vaccinationStatus);
    if (form.breed) data.append("breed", form.breed);
    if (form.weight) data.append("weight", form.weight);
    if (form.medicalNotes) data.append("medicalNotes", form.medicalNotes);
    if (image) data.append("image", image);

    setSaving(true);
    const res = await dispatch(addPet(data));
    setSaving(false);

    if (addPet.fulfilled.match(res)) {
      setForm(empty);
      setImage(null);
      setFileKey((k) => k + 1);
    }
  };

  const onRemove = (id, name) => {
    if (window.confirm(`Remove ${name}?`)) dispatch(removePet(id));
  };

  return (
    <>
      <div className="page-band">
        <div className="container">
          <h1>My pets</h1>
          <p>Add your pets once, then book stays and follow their care and health records.</p>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          {/* ---------- Add pet form ---------- */}
          <div className="col-lg-4">
            <form className="card border-0 shadow-sm p-4 sticky-form" onSubmit={onSubmit}>
              <h2 className="h5 mb-3">Add a pet</h2>

              {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

              <Field label="Name" id="name" value={form.name} onChange={onChange} minLength={2} maxLength={50} required />

              <div className="row">
                <div className="col-6 mb-3">
                  <label htmlFor="species" className="form-label fw-semibold">Species</label>
                  <select id="species" name="species" className="form-select" value={form.species} onChange={onChange}>
                    {SPECIES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <Field label="Breed" id="breed" value={form.breed} onChange={onChange} />
                </div>
              </div>

              <div className="row">
                <div className="col-6">
                  <Field label="Age (years)" id="age" type="number" min="0" step="0.1" value={form.age} onChange={onChange} required />
                </div>
                <div className="col-6">
                  <Field label="Weight (kg)" id="weight" type="number" min="0" step="0.1" value={form.weight} onChange={onChange} />
                </div>
              </div>

              <div className="row">
                <div className="col-6 mb-3">
                  <label htmlFor="gender" className="form-label fw-semibold">Gender</label>
                  <select id="gender" name="gender" className="form-select" value={form.gender} onChange={onChange}>
                    {GENDERS.map((g) => <option key={g} value={g}>{label(g)}</option>)}
                  </select>
                </div>
                <div className="col-6 mb-3">
                  <label htmlFor="vaccinationStatus" className="form-label fw-semibold">Vaccines</label>
                  <select id="vaccinationStatus" name="vaccinationStatus" className="form-select" value={form.vaccinationStatus} onChange={onChange}>
                    {VACCINATION.map((v) => <option key={v} value={v}>{label(v)}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="medicalNotes" className="form-label fw-semibold">Medical notes</label>
                <textarea
                  id="medicalNotes" name="medicalNotes" rows="2" maxLength={1000}
                  className="form-control" placeholder="Allergies, medicines, conditions"
                  value={form.medicalNotes} onChange={onChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="image" className="form-label fw-semibold">Photo (optional)</label>
                <input
                  key={fileKey} id="image" type="file" accept="image/*" className="form-control"
                  onChange={(e) => setImage(e.target.files[0] || null)}
                />
              </div>

              <button className="btn btn-primary w-100" disabled={saving}>
                {saving ? "Saving..." : "Save pet"}
              </button>
            </form>
          </div>

          {/* ---------- Pet list ---------- */}
          <div className="col-lg-8">
            {status === "loading" && items.length === 0 && (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading</span>
              </div>
            )}

            {status === "idle" && items.length === 0 && (
              <div className="empty-state">
                <i className="bi bi-heart" />
                No pets yet. Add your first pet with the form to start booking.
              </div>
            )}

            <div className="d-grid gap-3">
              {items.map((p) => (
                <article className="pet-card" key={p._id}>
                  <div className="pet-photo">
                    {p.image ? <img src={p.image} alt={p.name} /> : <i className="bi bi-heart-fill" />}
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <h2 className="h6 mb-0">{p.name}</h2>
                      <span className="badge text-bg-light border">{label(p.species)}</span>
                      {p.vaccinationStatus && p.vaccinationStatus !== "UNKNOWN" && (
                        <span className={`badge ${p.vaccinationStatus === "UP_TO_DATE" ? "text-bg-success" : "text-bg-warning"}`}>
                          Vaccines {label(p.vaccinationStatus).toLowerCase()}
                        </span>
                      )}
                    </div>
                    <div className="small text-body-secondary mt-1">
                      {[
                        p.breed,
                        p.age != null && `${p.age} yr`,
                        p.weight != null && `${p.weight} kg`,
                        p.gender && p.gender !== "UNKNOWN" && label(p.gender),
                      ].filter(Boolean).join(" · ")}
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <Link className="btn btn-sm btn-outline-primary" to={`/pets/${p._id}/care`}>
                      <i className="bi bi-journal-text me-1" />Care updates
                    </Link>
                    <Link className="btn btn-sm btn-outline-primary" to={`/pets/${p._id}/health`}>
                      <i className="bi bi-heart-pulse me-1" />Health records
                    </Link>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onRemove(p._id, p.name)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}