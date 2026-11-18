import { Link } from "react-router-dom";

const highlights = [
  { icon: "bi-shield-lock", title: "Secure payments", text: "Razorpay checkout" },
  { icon: "bi-journal-check", title: "Daily care logs", text: "Every day of the stay" },
  { icon: "bi-heart-pulse", title: "Vet health records", text: "Medicines and vaccines" },
  { icon: "bi-people", title: "Four user roles", text: "Owner, staff, vet, admin" },
];

const services = [
  { icon: "bi-house-heart", title: "Pet boarding", text: "Comfortable private suites for dogs, cats and other pets." },
  { icon: "bi-heart-pulse", title: "Veterinary care", text: "Health checks, medicines and vaccines recorded by our vet." },
  { icon: "bi-journal-text", title: "Daily care updates", text: "Meals, walks, grooming and mood logged through the stay." },
  { icon: "bi-credit-card-2-front", title: "Online payment", text: "Pay in a few clicks. No cash, no queues, and a clear record." },
  { icon: "bi-shield-check", title: "Trained staff", text: "A caring team that looks after every guest by name." },
  { icon: "bi-calendar-check", title: "Easy booking", text: "Pick a suite and your dates, and we check availability for you." },
];

// Edit these three to match the suites you really offer
const tiers = [
  { cls: "tier-standard", icon: "bi-house-door", name: "Standard", text: "A clean, comfortable room with all the essentials." },
  { cls: "tier-premium", icon: "bi-stars", name: "Premium", text: "More space, extra playtime and camera access." },
  { cls: "tier-vip", icon: "bi-gem", name: "VIP", text: "Private play area, grooming and daily photo updates." },
];

const steps = [
  { title: "Create an account", text: "Register and add your pet's details." },
  { title: "Book and pay", text: "Choose a suite and dates, then pay securely online." },
  { title: "We care for your pet", text: "Our staff check your pet in and look after them daily." },
  { title: "Follow every update", text: "See care logs and health records from anywhere." },
];

const faqs = [
  {
    q: "How do I book a stay?",
    a: "Create an account, add your pet, then choose a suite and your dates on the Bookings page. You can pay online right after booking.",
  },
  {
    q: "How do I pay?",
    a: "Payments are made online through Razorpay. Your booking is confirmed as soon as the payment goes through.",
  },
  {
    q: "Can I see how my pet is doing while I am away?",
    a: "Yes. Our staff add a care log each day, and the vet adds a health record when needed. You can open both from the My pets page.",
  },
  {
    q: "Who can create staff and vet accounts?",
    a: "Only the admin. Customers register themselves as pet owners, so nobody can give themselves extra permissions.",
  },
];

export default function Home() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero-full" id="home">
        <div className="container">
          <span className="hero-pill mb-4">
            <i className="bi bi-patch-check-fill" /> Trusted pet boarding and care
          </span>
          <h1 className="mb-3">A safe, caring home for your pet while you travel</h1>
          <p className="hero-text mb-4">
            Book a suite, pay online and follow your pet's daily care and health updates,
            wherever you are.
          </p>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <Link to="/register" className="btn btn-sun btn-lg">Book a stay</Link>
            <a href="#services" className="btn btn-ghost btn-lg">Explore services</a>
          </div>

          <div className="hero-checks">
            <span><i className="bi bi-check-circle-fill" />Secure online payment</span>
            <span><i className="bi bi-check-circle-fill" />Daily care updates</span>
            <span><i className="bi bi-check-circle-fill" />Vet health records</span>
          </div>
        </div>
      </section>

      {/* ---------- Highlights bar ---------- */}
      <div className="stats-bar">
        <div className="container">
          <div className="row g-3">
            {highlights.map((h) => (
              <div className="col-6 col-lg-3" key={h.title}>
                <div className="stat-card">
                  <div className="icon-circle"><i className={`bi ${h.icon}`} /></div>
                  <div>
                    <div className="fw-bold">{h.title}</div>
                    <div className="small text-body-secondary">{h.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Services ---------- */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-head">
            <span className="section-pill">What we offer</span>
            <h2>Everything your pet needs</h2>
            <p>From a comfortable room to health checks and daily updates, all in one place.</p>
          </div>
          <div className="row g-4">
            {services.map((s) => (
              <div className="col-md-6 col-lg-4" key={s.title}>
                <article className="card border-0 shadow-sm h-100 lift">
                  <div className="card-body p-4">
                    <div className="icon-circle mb-3"><i className={`bi ${s.icon}`} /></div>
                    <h3 className="h5">{s.title}</h3>
                    <p className="text-body-secondary mb-0">{s.text}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Suites ---------- */}
      <section className="section section-alt" id="suites-preview">
        <div className="container">
          <div className="section-head">
            <span className="section-pill">Our suites</span>
            <h2>A room for every pet</h2>
            <p>Choose the level of comfort that suits your pet and your budget.</p>
          </div>
          <div className="row g-4">
            {tiers.map((t) => (
              <div className="col-md-4" key={t.name}>
                <div className={`tier-card ${t.cls} lift`}>
                  <i className={`bi ${t.icon} tier-icon`} />
                  <h3 className="h4">{t.name}</h3>
                  <p>{t.text}</p>
                  <div>
                    <Link to="/suites" className="btn btn-light btn-sm">See suites</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Product preview ---------- */}
      <section className="section" id="updates">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="section-pill">Peace of mind</span>
              <h2 className="mb-3">Know how your pet is doing, every day</h2>
              <p className="text-body-secondary mb-4">
                While your pet stays with us, our team records meals, walks and mood,
                and our vet records every checkup. You can read it all from your phone.
              </p>
              <ul className="list-unstyled mb-4">
                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2" />Daily care logs from our staff</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2" />Diagnosis, medicines and vaccines from the vet</li>
                <li><i className="bi bi-check-circle-fill text-success me-2" />Reminders of the next vet visit</li>
              </ul>
              <Link to="/register" className="btn btn-primary btn-lg">Get started</Link>
            </div>

            <div className="col-lg-6">
              <div className="preview-card">
                <div className="preview-top">
                  <span>Care update</span>
                  <span className="small fw-normal">Sample data</span>
                </div>
                <div className="preview-row"><span>Feeding</span><span>Ate both meals</span></div>
                <div className="preview-row"><span>Walking and play</span><span>30 minute walk</span></div>
                <div className="preview-row"><span>Mood</span><span className="badge text-bg-success">Happy</span></div>

                <div className="preview-top" style={{ background: "var(--paw-navy-dark)" }}>
                  <span>Health record</span>
                  <span className="small fw-normal">Sample data</span>
                </div>
                <div className="preview-row"><span>Diagnosis</span><span>Healthy, routine checkup</span></div>
                <div className="preview-row"><span>Vaccine</span><span>Rabies booster</span></div>
                <div className="preview-row"><span>Next visit</span><span>In 12 months</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="section section-alt" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <span className="section-pill">How it works</span>
            <h2>From sign-up to a happy pet</h2>
            <p>Four simple steps.</p>
          </div>
          <div className="row g-4">
            {steps.map((s, i) => (
              <div className="col-sm-6 col-lg-3" key={s.title}>
                <div className="step-num">{i + 1}</div>
                <h3 className="h6">{s.title}</h3>
                <p className="text-body-secondary mb-0">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section" id="faq">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="section-head">
            <span className="section-pill">Questions</span>
            <h2>Frequently asked questions</h2>
          </div>

          <div className="accordion" id="faqList">
            {faqs.map((f, i) => (
              <div className="accordion-item" key={f.q}>
                <h3 className="accordion-header">
                  <button
                    className={`accordion-button ${i === 0 ? "" : "collapsed"}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#faq${i}`}
                    aria-expanded={i === 0}
                    aria-controls={`faq${i}`}
                  >
                    {f.q}
                  </button>
                </h3>
                <div
                  id={`faq${i}`}
                  className={`accordion-collapse collapse ${i === 0 ? "show" : ""}`}
                  data-bs-parent="#faqList"
                >
                  <div className="accordion-body text-body-secondary">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Call to action ---------- */}
      <section className="contact-band" id="contact">
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 className="h3 mb-1">Ready to give your pet a happy stay?</h2>
            <p className="mb-0">Create an account and book your first suite in minutes.</p>
          </div>
          <Link to="/register" className="btn btn-sun btn-lg">Create account</Link>
        </div>
      </section>
    </>
  );
}