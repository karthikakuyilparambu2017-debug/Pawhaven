import transporter from "../config/mailer.js";

// ---------- Welcome email (pet owner registers) ----------

export async function sendWelcomeEmail(user) {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: user.email,
    subject: "Welcome to PawHaven ",

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to PawHaven, ${user.name}! </h2>

        <p>
          Thank you for registering with PawHaven.
        </p>

        <p>
          Your account has been successfully created.
        </p>

        <p>
          We look forward to taking care of your furry friend!
        </p>

        <br />

        <p>
          Regards,<br />
          <strong>PawHaven Team</strong>
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// ---------- Account created by the admin (staff and vet) ----------

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const ROLE_TEXT = {
  STAFF: "Staff",
  VETERINARIAN: "Veterinarian",
  ADMIN: "Admin",
  PET_OWNER: "Pet owner",
};

export async function sendAccountCreatedEmail({ name, email, role }, temporaryPassword) {
  const loginUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/login`;
  const roleText = ROLE_TEXT[role] || role;

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Your PawHaven account is ready",

    text:
      `Hello ${name},\n\n` +
      `The PawHaven admin has created a ${roleText} account for you.\n\n` +
      `Login page: ${loginUrl}\n` +
      `Email: ${email}\n` +
      `Temporary password: ${temporaryPassword}\n\n` +
      `Please log in and change your password as soon as possible.\n` +
      `If you did not expect this email, you can ignore it.\n\n` +
      `PawHaven Team`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1b2a3b;">
        <h2 style="color: #12304f;">Your PawHaven account is ready</h2>

        <p>Hello ${escapeHtml(name)},</p>

        <p>
          The PawHaven admin has created a <strong>${escapeHtml(roleText)}</strong>
          account for you.
        </p>

        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 6px 16px 6px 0; color: #5c6b7c;">Email</td>
            <td style="padding: 6px 0;"><strong>${escapeHtml(email)}</strong></td>
          </tr>
          <tr>
            <td style="padding: 6px 16px 6px 0; color: #5c6b7c;">Temporary password</td>
            <td style="padding: 6px 0;"><strong>${escapeHtml(temporaryPassword)}</strong></td>
          </tr>
        </table>

        <p>
          <a href="${loginUrl}"
             style="background: #12304f; color: #ffffff; padding: 10px 20px;
                    border-radius: 8px; text-decoration: none; display: inline-block;">
            Log in to PawHaven
          </a>
        </p>

        <p>Please log in and change your password as soon as possible.</p>
        <p style="color: #5c6b7c; font-size: 13px;">
          If you did not expect this email, you can ignore it.
        </p>

        <p>Regards,<br /><strong>PawHaven Team</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}