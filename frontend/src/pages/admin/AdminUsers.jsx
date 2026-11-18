import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import api, { errorMessage } from "../../api/client";
import Field from "../../components/Field";
import PageHeader from "../../components/PageHeader";

const ROLES = ["PET_OWNER", "STAFF", "VETERINARIAN", "ADMIN"];
const ROLE_TEXT = {
  PET_OWNER: "Pet owner",
  STAFF: "Staff",
  VETERINARIAN: "Vet",
  ADMIN: "Admin",
};
const ROLE_BADGE = {
  PET_OWNER: "text-bg-light border",
  STAFF: "text-bg-info",
  VETERINARIAN: "text-bg-success",
  ADMIN: "text-bg-warning",
};

const empty = { name: "", email: "", password: "", role: "STAFF" };

// Finds the list of users inside a reply of any shape
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

export default function AdminUsers() {
  const { user: me } = useSelector((s) => s.auth);
  const myId = me?._id || me?.id;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");

  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(pickList(res.data));
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    setMessage("");
    setWarning("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const onEdit = (u) => {
    setMessage("");
    setWarning("");
    setEditingId(u._id);
    setForm({ name: u.name || "", email: u.email || "", password: "", role: u.role || "STAFF" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    setWarning("");

    try {
      if (editingId) {
        await api.patch(`/admin/users/${editingId}`, {
          name: form.name,
          email: form.email,
          role: form.role,
        });
        setMessage("User updated.");
      } else {
        const res = await api.post("/admin/users", form);
        if (res.data.emailSent === false) {
          setWarning(
            `Account created, but the email could not be sent. Please give ${form.email} the password yourself.`
          );
        } else {
          setMessage(`Account created. The login details were emailed to ${form.email}.`);
        }
      }
      reset();
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u) => {
    setError("");
    try {
      await api.patch(`/admin/users/${u._id}`, { isActive: !(u.isActive !== false) });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const onDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    setError("");
    try {
      await api.delete(`/admin/users/${u._id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        (roleFilter === "ALL" || u.role === roleFilter) &&
        (!q || (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q))
    );
  }, [users, roleFilter, search]);

  return (
    <div className="container py-5">
      <PageHeader
        icon="bi-people"
        title="Manage users"
        subtitle="Create staff and vet accounts and manage every user."
      />

      <div className="row g-4">
        {/* ---------- Form ---------- */}
        <div className="col-lg-4">
          <form className="card border-0 shadow-sm p-4" onSubmit={onSubmit}>
            <h2 className="h5 mb-3">{editingId ? "Edit user" : "Add a user"}</h2>

            {message && <div className="alert alert-success py-2" role="status">{message}</div>}
            {warning && <div className="alert alert-warning py-2" role="alert">{warning}</div>}
            {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

            <Field label="Full name" id="name" minLength={2} maxLength={100} value={form.name} onChange={onChange} required />
            <Field label="Email" id="email" type="email" value={form.email} onChange={onChange} required />

            {!editingId && (
              <Field
                label="Temporary password" id="password" type="text" minLength={6}
                value={form.password} onChange={onChange} required
              />
            )}

            <div className="mb-3">
              <label htmlFor="role" className="form-label fw-semibold">Role</label>
              <select id="role" name="role" className="form-select" value={form.role} onChange={onChange}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_TEXT[r]}</option>
                ))}
              </select>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-primary flex-grow-1" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save changes" : "Create user"}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline-primary" onClick={reset}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ---------- List ---------- */}
        <div className="col-lg-8">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <input
              className="form-control" style={{ maxWidth: 260 }} placeholder="Search name or email"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
            {["ALL", ...ROLES].map((r) => (
              <button
                key={r}
                className={`btn btn-sm ${roleFilter === r ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setRoleFilter(r)}
              >
                {r === "ALL" ? "All" : ROLE_TEXT[r]}
              </button>
            ))}
          </div>

          {loading && (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading</span>
            </div>
          )}
          {!loading && shown.length === 0 && (
            <p className="text-body-secondary">No users found.</p>
          )}

          <ul className="list-group shadow-sm">
            {shown.map((u) => {
              const active = u.isActive !== false;
              const isMe = u._id === myId;
              return (
                <li className="list-group-item" key={u._id}>
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div>
                      <strong>{u.name}</strong>{" "}
                      <span className={`badge ${ROLE_BADGE[u.role] || "text-bg-light"}`}>
                        {ROLE_TEXT[u.role] || u.role}
                      </span>{" "}
                      <span className={`badge ${active ? "text-bg-success" : "text-bg-secondary"}`}>
                        {active ? "Active" : "Deactivated"}
                      </span>
                      {isMe && <span className="badge text-bg-light border ms-1">You</span>}
                      <div className="small text-body-secondary">{u.email}</div>
                    </div>

                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(u)}>Edit</button>
                      <button
                        className="btn btn-sm btn-outline-secondary" disabled={isMe}
                        onClick={() => toggleActive(u)}
                      >
                        {active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger" disabled={isMe}
                        onClick={() => onDelete(u)}
                      >
                        Delete
                      </button>
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