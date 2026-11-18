// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import { fetchSuites } from "../features/suitesSlice";

// const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
// const label = (v) => (v || "").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

// export default function Suites() {
//   const dispatch = useDispatch();
//   const { user, checked } = useSelector((s) => s.auth);
//   const { items, status, error } = useSelector((s) => s.suites);

//   // Your backend only lists suites for logged-in users
//   useEffect(() => {
//     if (user) dispatch(fetchSuites());
//   }, [dispatch, user]);

//   if (!checked) {
//     return (
//       <div className="text-center py-5">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading</span>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="container py-5 text-center" style={{ maxWidth: 520 }}>
//         <h1 className="h2 mb-3">Our suites</h1>
//         <p className="text-body-secondary">
//           Log in to see our suites, their prices and what is included.
//         </p>
//         <div className="d-flex gap-2 justify-content-center">
//           <Link to="/login" className="btn btn-primary">Log in</Link>
//           <Link to="/register" className="btn btn-outline-primary">Create account</Link>
//         </div>
//       </div>
//     );
//   }

//   const available = items.filter((s) => s.isAvailable !== false);

//   return (
//     <div className="container py-5">
//       <h1 className="h2 mb-4">Suites</h1>

//       {status === "loading" && (
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading</span>
//         </div>
//       )}
//       {error && <div className="alert alert-danger">{error}</div>}
//       {status === "idle" && !error && available.length === 0 && (
//         <p className="text-body-secondary">No suites are available right now.</p>
//       )}

//       <div className="row g-4">
//         {available.map((s) => (
//           <div className="col-12 col-sm-6 col-lg-4" key={s._id}>
//             <article className="card h-100 border-0 shadow-sm">
//               {s.image && (
//                 <img className="card-img-top suite-thumb" src={s.image} alt={s.name} />
//               )}
//               <div className="card-body d-flex flex-column">
//                 <div className="d-flex justify-content-between align-items-start gap-2">
//                   <h2 className="h5">{s.name}</h2>
//                   <span className="badge text-bg-warning">{label(s.type)}</span>
//                 </div>

//                 <p className="small text-body-secondary mb-2">
//                   Fits {s.capacity} pet{s.capacity > 1 ? "s" : ""}
//                 </p>
//                 {s.description && <p className="text-body-secondary">{s.description}</p>}

//                 {s.amenities?.length > 0 && (
//                   <div className="d-flex flex-wrap gap-1 mb-3">
//                     {s.amenities.map((a) => (
//                       <span key={a} className="badge rounded-pill text-bg-light border">{a}</span>
//                     ))}
//                   </div>
//                 )}

//                 <p className="mt-auto mb-3">
//                   <strong>{money(s.pricePerDay)}</strong> per day
//                 </p>

//                 {user.role === "PET_OWNER" && (
//                   <Link className="btn btn-primary" to="/bookings" state={{ suiteId: s._id }}>
//                     Book this suite
//                   </Link>
//                 )}
//               </div>
//             </article>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchSuites } from "../features/suitesSlice";

const PAGE_SIZE = 6;
const TYPES = ["ALL", "STANDARD", "PREMIUM", "VIP"];

const TIER = {
  STANDARD: { cls: "tier-standard", icon: "bi-house-door" },
  PREMIUM: { cls: "tier-premium", icon: "bi-stars" },
  VIP: { cls: "tier-vip", icon: "bi-gem" },
};

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const label = (v) => (v || "").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function Suites() {
  const dispatch = useDispatch();
  const { user, checked } = useSelector((s) => s.auth);
  const { items, status, error } = useSelector((s) => s.suites);

  const [q, setQ] = useState("");
  const [type, setType] = useState("ALL");
  const [sort, setSort] = useState("recommended");
  const [page, setPage] = useState(1);

  // Your backend only lists suites for logged-in users
  useEffect(() => {
    if (user) dispatch(fetchSuites());
  }, [dispatch, user]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = items
      .filter((s) => s.isAvailable !== false)
      .filter((s) => type === "ALL" || s.type === type)
      .filter(
        (s) =>
          !term ||
          (s.name || "").toLowerCase().includes(term) ||
          (s.description || "").toLowerCase().includes(term) ||
          (s.amenities || []).some((a) => a.toLowerCase().includes(term))
      );

    if (sort === "low") out = [...out].sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === "high") out = [...out].sort((a, b) => b.pricePerDay - a.pricePerDay);
    return out;
  }, [items, q, type, sort]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  if (!checked) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="page-band">
          <div className="container">
            <h1>Our suites</h1>
            <p>Comfortable rooms for every pet.</p>
          </div>
        </div>
        <div className="container py-5 text-center" style={{ maxWidth: 520 }}>
          <div className="icon-circle mx-auto mb-3"><i className="bi bi-lock" /></div>
          <h2 className="h4">Log in to see our suites</h2>
          <p className="text-body-secondary">
            Create a free account to see the suites, their prices and what is included.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Link to="/login" className="btn btn-primary">Log in</Link>
            <Link to="/register" className="btn btn-outline-primary">Create account</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-band">
        <div className="container">
          <h1>Our suites</h1>
          <p>Choose the room that suits your pet and your dates.</p>
        </div>
      </div>

      <div className="container py-4">
        {/* ---------- Search, filter, sort ---------- */}
        <div className="filter-bar">
          <div className="row g-3 align-items-center">
            <div className="col-lg-4">
              <div className="search-box">
                <i className="bi bi-search" />
                <input
                  className="form-control" placeholder="Search by name or amenity"
                  aria-label="Search suites" value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div className="col-lg-5 d-flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t} type="button"
                  className={`chip ${type === t ? "active" : ""}`}
                  onClick={() => { setType(t); setPage(1); }}
                >
                  {t === "ALL" ? "All" : label(t)}
                </button>
              ))}
            </div>

            <div className="col-lg-3">
              <select
                className="form-select" aria-label="Sort suites" value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {status === "loading" && items.length === 0 && (
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading</span>
          </div>
        )}

        {status === "idle" && !error && (
          <p className="text-body-secondary small mb-3">
            {list.length} suite{list.length === 1 ? "" : "s"} found
          </p>
        )}

        {status === "idle" && !error && list.length === 0 && (
          <div className="text-center py-5 text-body-secondary">
            <i className="bi bi-search fs-1 d-block mb-2" />
            No suites match your search. Try another word or filter.
          </div>
        )}

        {/* ---------- Suite cards ---------- */}
        <div className="row g-4">
          {shown.map((s) => {
            const tier = TIER[s.type] || TIER.STANDARD;
            const amenities = s.amenities || [];
            return (
              <div className="col-12 col-md-6 col-lg-4" key={s._id}>
                <article className="suite-card lift">
                  <div className="suite-media">
                    {s.image ? (
                      <img src={s.image} alt={s.name} />
                    ) : (
                      <div className={`suite-fallback ${tier.cls}`}>
                        <i className={`bi ${tier.icon}`} />
                      </div>
                    )}
                    <span className="suite-type">{label(s.type)}</span>
                    <span className="suite-price">
                      {money(s.pricePerDay)} <small>/ day</small>
                    </span>
                  </div>

                  <div className="p-3 p-lg-4 d-flex flex-column flex-grow-1">
                    <h2 className="h5 mb-1">{s.name}</h2>
                    <div className="small text-body-secondary mb-2">
                      <i className="bi bi-people me-1" />
                      Fits {s.capacity} pet{s.capacity > 1 ? "s" : ""}
                    </div>

                    {s.description && (
                      <p className="text-body-secondary small mb-3">{s.description}</p>
                    )}

                    {amenities.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {amenities.slice(0, 4).map((a) => (
                          <span key={a} className="amenity">{a}</span>
                        ))}
                        {amenities.length > 4 && (
                          <span className="amenity">+{amenities.length - 4} more</span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto">
                      {user.role === "PET_OWNER" ? (
                        <Link className="btn btn-primary w-100" to="/bookings" state={{ suiteId: s._id }}>
                          Book this suite
                        </Link>
                      ) : (
                        <div className="small text-body-secondary">Owners can book this suite.</div>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {/* ---------- Pagination ---------- */}
        {pages > 1 && (
          <nav className="mt-4 d-flex justify-content-center" aria-label="Suites pages">
            <ul className="pagination mb-0">
              <li className={`page-item ${current === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(current - 1)}>Previous</button>
              </li>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <li key={n} className={`page-item ${n === current ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setPage(n)}>{n}</button>
                </li>
              ))}
              <li className={`page-item ${current === pages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(current + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}