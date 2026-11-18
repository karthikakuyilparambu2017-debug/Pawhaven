export default function Field({ label, id, ...props }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold">{label}</label>
      <input id={id} name={id} className="form-control" {...props} />
    </div>
  );
}