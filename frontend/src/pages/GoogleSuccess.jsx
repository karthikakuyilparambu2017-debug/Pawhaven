import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMe } from "../features/authSlice";

const HOME = {
  ADMIN: "/admin/dashboard",
  STAFF: "/staff/care-logs",
  VETERINARIAN: "/vet/health-logs",
  PET_OWNER: "/pets",
};

export default function GoogleSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    dispatch(fetchMe())
      .unwrap()
      .then((user) => navigate(HOME[user?.role] || "/pets", { replace: true }))
      .catch(() => navigate("/login?error=google", { replace: true }));
  }, [dispatch, navigate]);

  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Signing you in</span>
      </div>
      <p className="mt-3 text-body-secondary">Signing you in with Google...</p>
    </div>
  );
}