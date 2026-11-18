export default function PageHeader({ icon, title, subtitle }) {
  return (
    <div className="page-head">
      <span className="icon-circle" aria-hidden="true">
        <i className={`bi ${icon}`} />
      </span>
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}