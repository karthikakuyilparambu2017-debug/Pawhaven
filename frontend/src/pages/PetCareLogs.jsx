import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api, { errorMessage } from "../api/client";
import { fetchPets } from "../features/petsSlice";
import {
  CARE_LOGS_PATH, pickList, fmtDate, MOOD_BADGE, titleCase,
} from "../api/helpers";
import PageHeader from "../components/PageHeader.jsx";

export default function PetCareLogs() {
  const { petId } = useParams();
  const dispatch = useDispatch();
  const pets = useSelector((s) => s.pets.items);
  const pet = pets.find((p) => p._id === petId);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchPets());
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`${CARE_LOGS_PATH}/pet/${petId}`);
        const list = pickList(res.data);
        setLogs([...list].sort((a, b) => new Date(b.careDate) - new Date(a.careDate)));
      } catch (e) {
        setError(errorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [petId]);

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <Link to="/pets" className="small">Back to my pets</Link>
      <PageHeader icon="bi-journal-text" title={`Care updates${pet ? ` for ${pet.name}` : ""}`} subtitle="Daily updates from our care team." />

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {loading && (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading</span>
        </div>
      )}
      {!loading && !error && logs.length === 0 && (
        <p className="text-body-secondary">
          No updates yet. Our team adds a care log each day your pet stays with us.
        </p>
      )}

      <div className="d-grid gap-3">
        {logs.map((log) => (
          <article className="card border-0 shadow-sm" key={log._id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <h2 className="h5 mb-2">{fmtDate(log.careDate)}</h2>
                <span className={`badge ${MOOD_BADGE[log.mood] || "text-bg-secondary"}`}>
                  Mood: {titleCase(log.mood)}
                </span>
              </div>

              {log.feeding && <p className="mb-1"><strong>Feeding:</strong> {log.feeding}</p>}
              {log.walking && <p className="mb-1"><strong>Walking and play:</strong> {log.walking}</p>}
              {log.grooming && <p className="mb-1"><strong>Grooming:</strong> {log.grooming}</p>}
              {log.medication && <p className="mb-1"><strong>Medication:</strong> {log.medication}</p>}
              {log.activityNotes && <p className="mb-1"><strong>Notes:</strong> {log.activityNotes}</p>}

              {log.images?.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {log.images.map((src) => (
                    <a key={src} href={src} target="_blank" rel="noreferrer">
                      <img
                        src={src} alt="Care update"
                        style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 8 }}
                      />
                    </a>
                  ))}
                </div>
              )}

              {log.staff?.name && (
                <div className="small text-body-secondary mt-2">Updated by {log.staff.name}</div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}