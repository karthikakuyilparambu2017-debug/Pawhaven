import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api, { errorMessage } from "../api/client";
import { fetchPets } from "../features/petsSlice";
import { HEALTH_LOGS_PATH, pickList, fmtDate } from "../api/helpers";
import PageHeader from "../components/PageHeader.jsx";

export default function PetHealthLogs() {
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
        const res = await api.get(`${HEALTH_LOGS_PATH}/pet/${petId}`);
        const list = pickList(res.data);
        setLogs([...list].sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate)));
      } catch (e) {
        setError(errorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [petId]);

  const upcoming = logs.find((l) => l.nextVisitDate && new Date(l.nextVisitDate) >= new Date());

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <Link to="/pets" className="small">Back to my pets</Link>
      <PageHeader icon="bi-heart-pulse" title={`Health records${pet ? ` for ${pet.name}` : ""}`} subtitle="Checkups, medicines and vaccines from our vet." />
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {loading && (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading</span>
        </div>
      )}
      {!loading && !error && logs.length === 0 && (
        <p className="text-body-secondary">
          No health records yet. Our vet adds a record after every checkup.
        </p>
      )}

      {upcoming && (
        <div className="alert alert-warning" role="status">
          Next vet visit: <strong>{fmtDate(upcoming.nextVisitDate)}</strong>
        </div>
      )}

      <div className="d-grid gap-3">
        {logs.map((log) => (
          <article className="card border-0 shadow-sm" key={log._id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <h2 className="h5 mb-2">{fmtDate(log.visitDate)}</h2>
                {log.vaccinationGiven && (
                  <span className="badge text-bg-success">
                    Vaccinated{log.vaccinationName ? `: ${log.vaccinationName}` : ""}
                  </span>
                )}
              </div>

              <p className="mb-1"><strong>Diagnosis:</strong> {log.diagnosis}</p>
              {log.symptoms && <p className="mb-1"><strong>Symptoms:</strong> {log.symptoms}</p>}
              {log.treatment && <p className="mb-1"><strong>Treatment:</strong> {log.treatment}</p>}

              {log.medicines?.length > 0 && (
                <div className="mb-1">
                  <strong>Medicines:</strong>
                  <ul className="mb-1">
                    {log.medicines.map((m, i) => (
                      <li key={i}>
                        {m.name}
                        {m.dosage ? `, ${m.dosage}` : ""}
                        {m.duration ? `, for ${m.duration}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {log.notes && <p className="mb-1"><strong>Notes:</strong> {log.notes}</p>}

              {log.attachments?.length > 0 && (
                <div className="mt-2">
                  {log.attachments.map((src, i) => (
                    <a key={src} href={src} target="_blank" rel="noreferrer" className="me-3 small">
                      Attachment {i + 1}
                    </a>
                  ))}
                </div>
              )}

              {log.veterinarian?.name && (
                <div className="small text-body-secondary mt-2">Seen by {log.veterinarian.name}</div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}