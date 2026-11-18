import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api, { errorMessage } from "../api/client";
import { updateProfile } from "../features/authSlice";
import Avatar from "../components/Avatar";
import PageHeader from "../components/PageHeader";

const ROLE_TEXT = {
  PET_OWNER: "Pet owner",
  STAFF: "Staff",
  VETERINARIAN: "Veterinarian",
  ADMIN: "Admin",
};

const MAX_SIZE = 5 * 1024 * 1024; // same limit as the backend

function Msg({ m }) {
  return m ? <div className={`alert alert-${m.type} py-2`} role="alert">{m.text}</div> : null;
}

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  // ----- photo -----
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileKey, setFileKey] = useState(0); // changing this clears the file input
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoMsg, setPhotoMsg] = useState(null);

  // ----- name -----
  const [name, setName] = useState(user?.name || "");
  const [nameBusy, setNameBusy] = useState(false);
  const [nameMsg, setNameMsg] = useState(null);

  // ----- password -----
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    setName(user?.name || "");
  }, [user?.name]);

  // Show a preview of the chosen picture before saving
  useEffect(() => {
    if (!file) return setPreview("");
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onPick = (e) => {
    setPhotoMsg(null);
    const picked = e.target.files[0];
    if (!picked) return setFile(null);

    if (!picked.type.startsWith("image/")) {
      setPhotoMsg({ type: "danger", text: "Please choose an image file." });
      setFileKey((k) => k + 1);
      return setFile(null);
    }
    if (picked.size > MAX_SIZE) {
      setPhotoMsg({ type: "danger", text: "The picture must be smaller than 5 MB." });
      setFileKey((k) => k + 1);
      return setFile(null);
    }
    setFile(picked);
  };

  const onSavePhoto = async () => {
    if (!file) return;
    setPhotoBusy(true);
    setPhotoMsg(null);

    const data = new FormData();
    data.append("image", file);

    const res = await dispatch(updateProfile(data));
    setPhotoBusy(false);

    if (updateProfile.fulfilled.match(res)) {
      setFile(null);
      setFileKey((k) => k + 1);
      setPhotoMsg({ type: "success", text: "Photo updated." });
    } else {
      setPhotoMsg({ type: "danger", text: res.payload || "Could not upload the photo." });
    }
  };

  const onRemovePhoto = async () => {
    if (!window.confirm("Remove your profile photo?")) return;
    setPhotoBusy(true);
    setPhotoMsg(null);

    const data = new FormData();
    data.append("removeImage", "true");

    const res = await dispatch(updateProfile(data));
    setPhotoBusy(false);

    if (updateProfile.fulfilled.match(res)) {
      setPhotoMsg({ type: "success", text: "Photo removed." });
    } else {
      setPhotoMsg({ type: "danger", text: res.payload || "Could not remove the photo." });
    }
  };

  const onSaveName = async (e) => {
    e.preventDefault();
    setNameBusy(true);
    setNameMsg(null);

    const data = new FormData();
    data.append("name", name);

    const res = await dispatch(updateProfile(data));
    setNameBusy(false);

    if (updateProfile.fulfilled.match(res)) {
      setNameMsg({ type: "success", text: "Your details were saved." });
    } else {
      setNameMsg({ type: "danger", text: res.payload || "Could not save your details." });
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (pw.next !== pw.confirm) {
      return setPwMsg({ type: "danger", text: "The new passwords do not match." });
    }

    setPwBusy(true);
    try {
      await api.patch("/auth/change-password", {
        currentPassword: pw.current,
        newPassword: pw.next,
      });
      setPw({ current: "", next: "", confirm: "" });
      setPwMsg({ type: "success", text: "Password changed. Use it the next time you log in." });
    } catch (err) {
      setPwMsg({ type: "danger", text: errorMessage(err) });
    } finally {
      setPwBusy(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-5">
      <PageHeader
        icon="bi-person-circle"
        title="My profile"
        subtitle="Update your photo, your name and your password."
      />

      <div className="row g-4">
        {/* ---------- Photo ---------- */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 text-center">
            <div className="d-flex justify-content-center mb-3">
              {preview ? (
                <img
                  src={preview} alt="New profile preview"
                  style={{ width: 110, height: 110, objectFit: "cover", borderRadius: "50%" }}
                />
              ) : (
                <Avatar user={user} size="avatar-lg" />
              )}
            </div>

            <h2 className="h5 mb-0">{user.name}</h2>
            <div className="text-body-secondary small mb-3">{ROLE_TEXT[user.role] || user.role}</div>

            <Msg m={photoMsg} />

            <input
              key={fileKey} type="file" accept="image/*" className="form-control mb-3"
              aria-label="Choose a profile photo" onChange={onPick}
            />

            <div className="d-grid gap-2">
              <button className="btn btn-primary" disabled={!file || photoBusy} onClick={onSavePhoto}>
                {photoBusy ? "Saving..." : "Save photo"}
              </button>
              {user.profileImage && (
                <button className="btn btn-outline-danger" disabled={photoBusy} onClick={onRemovePhoto}>
                  Remove photo
                </button>
              )}
            </div>
            <div className="form-text mt-2">JPG, PNG or WebP, up to 5 MB.</div>
          </div>
        </div>

        {/* ---------- Details and password ---------- */}
        <div className="col-lg-8 d-grid gap-4 align-content-start">
          <form className="card border-0 shadow-sm p-4" onSubmit={onSaveName}>
            <h2 className="h5 mb-3">Personal details</h2>
            <Msg m={nameMsg} />

            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-semibold">Full name</label>
              <input
                id="name" className="form-control" value={name} minLength={2} maxLength={100}
                autoComplete="off" onChange={(e) => { setNameMsg(null); setName(e.target.value); }} required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label fw-semibold">Email</label>
                <input id="email" className="form-control locked-field" value={user.email || ""} readOnly />
                <div className="form-text">Your email is your login, so it cannot be changed here.</div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="role" className="form-label fw-semibold">Role</label>
                <input id="role" className="form-control locked-field" value={ROLE_TEXT[user.role] || user.role} readOnly />
                <div className="form-text">Only the admin can change roles.</div>
              </div>
            </div>

            <div>
              <button className="btn btn-primary" disabled={nameBusy || !name.trim() || name === user.name}>
                {nameBusy ? "Saving..." : "Save details"}
              </button>
            </div>
          </form>

          <form className="card border-0 shadow-sm p-4" onSubmit={onChangePassword} autoComplete="off">
            <h2 className="h5 mb-1">Change password</h2>
            <p className="text-body-secondary small mb-3">
              If you signed up with Google and never set a password, use
              <strong> Forgot your password?</strong> on the login page to create one.
            </p>
            <Msg m={pwMsg} />

            <div className="mb-3">
              <label htmlFor="current" className="form-label fw-semibold">Current password</label>
              <input
                id="current" type="password" className="form-control" autoComplete="off"
                value={pw.current} onChange={(e) => { setPwMsg(null); setPw({ ...pw, current: e.target.value }); }} required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="next" className="form-label fw-semibold">New password</label>
                <input
                  id="next" type="password" className="form-control" minLength={6} autoComplete="new-password"
                  value={pw.next} onChange={(e) => { setPwMsg(null); setPw({ ...pw, next: e.target.value }); }} required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="confirm" className="form-label fw-semibold">Confirm new password</label>
                <input
                  id="confirm" type="password" className="form-control" minLength={6} autoComplete="new-password"
                  value={pw.confirm} onChange={(e) => { setPwMsg(null); setPw({ ...pw, confirm: e.target.value }); }} required
                />
              </div>
            </div>

            <div>
              <button className="btn btn-primary" disabled={pwBusy}>
                {pwBusy ? "Changing..." : "Change password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}