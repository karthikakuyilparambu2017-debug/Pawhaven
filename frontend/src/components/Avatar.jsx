export default function Avatar({ user, size = "" }) {
  const initial = (user?.name || "?").trim().charAt(0).toUpperCase();

  return (
    <span className={`avatar ${size}`} aria-hidden="true">
      {user?.profileImage ? <img src={user.profileImage} alt="" /> : initial}
    </span>
  );
}