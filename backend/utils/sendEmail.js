// backend/utils/sendEmail.js
// Email-safe HTML — table-based layout, no flexbox, no CSS grid,
// no external fonts, no box-shadow, no emojis in subject lines.
// Tested against Gmail, Outlook, Apple Mail spam filters.

const SUPPORT_CONTACT =
  process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "support@slotly.app";

const BASE_COLOR = "#5b5ff5"; // primary
const ACCENT_COLOR = "#0fb894"; // emerald
const BG_COLOR = "#f1f5f9";
const CARD_BG = "#ffffff";
const TEXT_DARK = "#0f172a";
const TEXT_MED = "#475569";
const TEXT_LIGHT = "#94a3b8";
const BORDER_COLOR = "#e2e8f0";

// ─── Send via Resend API ────────────────────────────────────────
export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Slotly <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text,
      reply_to: replyTo || SUPPORT_CONTACT,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[sendEmail] Resend API error:", {
      status: response.status,
      to,
      subject,
      body: errorBody,
    });
    throw new Error(`Resend API error (${response.status}): ${errorBody}`);
  }
};

// ─── Email shell — table-based, inbox-safe ──────────────────────
const emailShell = (bodyHTML) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Slotly</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; }
    body { margin: 0; padding: 0; background-color: ${BG_COLOR}; }
    a { color: ${BASE_COLOR}; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { width: 100% !important; }
      .email-body    { padding: 24px 20px !important; }
      .email-header  { padding: 20px 24px !important; }
      .email-footer  { padding: 16px 20px !important; }
      .info-card     { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BG_COLOR};">

  <!-- Preheader (hidden preview text) -->
  <span style="display:none;font-size:1px;color:${BG_COLOR};max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Slotly — Smart Queue &amp; Appointment System
  </span>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BG_COLOR};padding:32px 16px;">
    <tr>
      <td align="center">
        <table class="email-wrapper" role="presentation" border="0" cellpadding="0" cellspacing="0" width="560"
               style="background-color:${CARD_BG};border-radius:16px;border:1px solid ${BORDER_COLOR};overflow:hidden;">

          <!-- Header -->
          <tr>
            <td class="email-header" style="padding:24px 36px;background-color:${BASE_COLOR};">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="color:#ffffff;font-size:20px;font-weight:700;font-family:Arial,sans-serif;letter-spacing:-0.3px;">
                      Slotly
                    </span>
                    <span style="color:rgba(255,255,255,0.7);font-size:13px;font-family:Arial,sans-serif;margin-left:8px;">
                      Smart Queue &amp; Appointments
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent bar -->
          <tr>
            <td height="3" style="background-color:${ACCENT_COLOR};font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="padding:36px 36px 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="font-family:Arial,Helvetica,sans-serif;">
                  ${bodyHTML}
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer" style="padding:20px 36px;background-color:#f8fafc;border-top:1px solid ${BORDER_COLOR};">
              <p style="margin:0;color:${TEXT_LIGHT};font-size:12px;line-height:1.6;font-family:Arial,sans-serif;">
                This is an automated message from Slotly. For help, email us at
                <a href="mailto:${SUPPORT_CONTACT}" style="color:${BASE_COLOR};">${SUPPORT_CONTACT}</a>.
              </p>
              <p style="margin:6px 0 0;color:#cbd5e1;font-size:11px;font-family:Arial,sans-serif;">
                &copy; ${new Date().getFullYear()} Slotly. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;

// ─── Shared building blocks ─────────────────────────────────────

// CTA button — table-based so it renders in Outlook
const primaryButton = (href, label) => `
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:28px auto;">
    <tr>
      <td align="center" style="border-radius:10px;background-color:${BASE_COLOR};">
        <a href="${href}"
           style="display:inline-block;padding:13px 32px;color:#ffffff;font-family:Arial,sans-serif;
                  font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;
                  background-color:${BASE_COLOR};mso-padding-alt:0;letter-spacing:0.2px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>
`;

// Fallback link for buttons
const fallbackLink = (href) => `
  <p style="margin:0 0 4px;color:${TEXT_LIGHT};font-size:12px;font-family:Arial,sans-serif;">
    If the button does not work, copy and paste this link into your browser:
  </p>
  <p style="margin:0 0 24px;word-break:break-all;font-family:Arial,sans-serif;">
    <a href="${href}" style="color:${BASE_COLOR};font-size:12px;">${href}</a>
  </p>
`;

// Info notice box
const noticeBox = (text) => `
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
         style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-top:8px;">
    <tr>
      <td style="padding:14px 16px;">
        <p style="margin:0;color:#166534;font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">
          ${text}
        </p>
      </td>
    </tr>
  </table>
`;

// Warning box (for alerts)
const warningBox = (text) => `
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
         style="background-color:#fff7ed;border:1px solid #fed7aa;border-radius:10px;margin:20px 0;">
    <tr>
      <td style="padding:14px 16px;">
        <p style="margin:0;color:#9a3412;font-size:14px;line-height:1.6;font-family:Arial,sans-serif;">
          ${text}
        </p>
      </td>
    </tr>
  </table>
`;

// ─── Date formatter ─────────────────────────────────────────────
const fmtDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ─── Appointment detail card ────────────────────────────────────
const appointmentCard = ({
  service,
  department,
  date,
  timeSlot,
  queueToken,
  bookingReference,
  fee,
}) => `
  <table class="info-card" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
         style="background-color:#f8faff;border:1px solid #e3e5ff;border-radius:12px;padding:20px;margin:20px 0;">
    <tr>
      <td style="padding:20px;">

        <!-- Service name row -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14px;">
          <tr>
            <td>
              <p style="margin:0;font-size:16px;font-weight:700;color:${TEXT_DARK};font-family:Arial,sans-serif;">
                ${service?.name || "Appointment"}
              </p>
              <p style="margin:2px 0 0;font-size:13px;color:${TEXT_MED};font-family:Arial,sans-serif;">
                ${department?.name || ""}
              </p>
            </td>
          </tr>
        </table>

        <!-- Divider -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14px;">
          <tr><td height="1" style="background-color:${BORDER_COLOR};font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>

        <!-- Detail rows -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="130" style="padding:6px 0;color:${TEXT_MED};font-size:13px;font-family:Arial,sans-serif;vertical-align:top;">Date</td>
            <td style="padding:6px 0;color:${TEXT_DARK};font-size:13px;font-weight:700;font-family:Arial,sans-serif;vertical-align:top;">${fmtDate(date)}</td>
          </tr>
          <tr>
            <td width="130" style="padding:6px 0;color:${TEXT_MED};font-size:13px;font-family:Arial,sans-serif;vertical-align:top;">Time</td>
            <td style="padding:6px 0;color:${TEXT_DARK};font-size:13px;font-weight:700;font-family:Arial,sans-serif;vertical-align:top;">${timeSlot?.start} - ${timeSlot?.end}</td>
          </tr>
          <tr>
            <td width="130" style="padding:6px 0;color:${TEXT_MED};font-size:13px;font-family:Arial,sans-serif;vertical-align:top;">Queue Token</td>
            <td style="padding:6px 0;font-family:Arial,sans-serif;vertical-align:top;">
              <span style="background-color:#ede9fe;color:${BASE_COLOR};padding:2px 10px;border-radius:6px;font-size:13px;font-weight:700;">
                ${queueToken}
              </span>
            </td>
          </tr>
          <tr>
            <td width="130" style="padding:6px 0;color:${TEXT_MED};font-size:13px;font-family:Arial,sans-serif;vertical-align:top;">Booking Ref</td>
            <td style="padding:6px 0;color:${TEXT_DARK};font-size:13px;font-weight:700;font-family:Arial,sans-serif;vertical-align:top;">${bookingReference || "-"}</td>
          </tr>
          ${
            fee > 0
              ? `
          <tr>
            <td width="130" style="padding:6px 0;color:${TEXT_MED};font-size:13px;font-family:Arial,sans-serif;vertical-align:top;">Fee</td>
            <td style="padding:6px 0;color:${TEXT_DARK};font-size:13px;font-weight:700;font-family:Arial,sans-serif;vertical-align:top;">Rs. ${fee}</td>
          </tr>`
              : ""
          }
        </table>

      </td>
    </tr>
  </table>
`;

// ═══════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════

// ─── 1. Email Verification ──────────────────────────────────────
export const getVerificationEmailHTML = (name, token, baseUrl) => {
  const link = `${baseUrl}/verify-email/${token}`;
  return emailShell(`
    <h2 style="margin:0 0 16px;color:${TEXT_DARK};font-size:22px;font-weight:700;font-family:Arial,sans-serif;letter-spacing:-0.3px;">
      Confirm your email address
    </h2>
    <p style="margin:0 0 8px;color:${TEXT_MED};font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
      Hi ${name},
    </p>
    <p style="margin:0 0 24px;color:${TEXT_MED};font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
      Thanks for creating a Slotly account. Please confirm your email address to activate it and start booking appointments.
    </p>
    ${primaryButton(link, "Confirm Email Address")}
    ${fallbackLink(link)}
    <p style="margin:0;color:${TEXT_LIGHT};font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">
      This link expires in 24 hours. If you did not create a Slotly account, you can safely ignore this email.
    </p>
  `);
};

export const getVerificationEmailText = (name, token, baseUrl) => `
Hi ${name},

Thanks for creating a Slotly account. Please confirm your email address to activate it and start booking appointments.

Confirm your email here: ${baseUrl}/verify-email/${token}
(This link expires in 24 hours.)

If you did not create a Slotly account, you can safely ignore this email.

- The Slotly Team
Support: ${SUPPORT_CONTACT}
`;

// ─── 2. Password Reset ──────────────────────────────────────────
export const getPasswordResetEmailHTML = (name, token, baseUrl) => {
  const link = `${baseUrl}/reset-password/${token}`;
  return emailShell(`
    <h2 style="margin:0 0 16px;color:${TEXT_DARK};font-size:22px;font-weight:700;font-family:Arial,sans-serif;letter-spacing:-0.3px;">
      Reset your password
    </h2>
    <p style="margin:0 0 8px;color:${TEXT_MED};font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
      Hi ${name},
    </p>
    <p style="margin:0 0 24px;color:${TEXT_MED};font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
      We received a request to reset the password for your Slotly account. Click the button below to choose a new one.
    </p>
    ${primaryButton(link, "Reset Password")}
    ${fallbackLink(link)}
    <p style="margin:0 0 16px;color:${TEXT_LIGHT};font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">
      This link expires in 30 minutes.
    </p>
    ${noticeBox("Did not request this? No action is needed. Your password will stay the same and your account remains secure.")}
  `);
};

export const getPasswordResetEmailText = (name, token, baseUrl) => `
Hi ${name},

We received a request to reset the password for your Slotly account.

Reset your password here: ${baseUrl}/reset-password/${token}
(This link expires in 30 minutes.)

Did not request this? No action is needed. Your password will stay the same and your account remains secure.

- The Slotly Team
Support: ${SUPPORT_CONTACT}
`;

// ─── 3. Booking Confirmation ────────────────────────────────────
export const getBookingConfirmationHTML = ({ name, appointment, baseUrl }) =>
  emailShell(`
    <h2 style="margin:0 0 8px;color:${TEXT_DARK};font-size:22px;font-weight:700;font-family:Arial,sans-serif;letter-spacing:-0.3px;">
      Appointment Confirmed
    </h2>
    <p style="margin:0 0 4px;color:${TEXT_MED};font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">Hi ${name},</p>
    <p style="margin:0 0 4px;color:${TEXT_MED};font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
      Your appointment has been booked successfully. Here are your details:
    </p>
    ${appointmentCard(appointment)}
    ${primaryButton(`${baseUrl}/my-appointments`, "View My Appointments")}
    ${noticeBox(`Please arrive 5 minutes early. Show your queue token <strong>${appointment.queueToken}</strong> at the reception.`)}
    <p style="margin:20px 0 0;color:${TEXT_LIGHT};font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">
      To cancel, visit My Appointments in the Slotly app at least 1 hour before your slot.
    </p>
  `);

export const getBookingConfirmationText = ({ name, appointment, baseUrl }) => `
Hi ${name},

Your appointment has been confirmed on Slotly.

Service     : ${appointment.service?.name}
Department  : ${appointment.department?.name}
Date        : ${fmtDate(appointment.date)}
Time        : ${appointment.timeSlot?.start} - ${appointment.timeSlot?.end}
Queue Token : ${appointment.queueToken}
Booking Ref : ${appointment.bookingReference}
${appointment.fee > 0 ? `Fee         : Rs. ${appointment.fee}` : ""}

View your appointment: ${baseUrl}/my-appointments

Please arrive 5 minutes early and show your queue token at the reception.

- The Slotly Team
Support: ${SUPPORT_CONTACT}
`;

// ─── 4. Appointment Cancelled ───────────────────────────────────
export const getAppointmentCancelledHTML = ({
  name,
  appointment,
  reason,
  cancelledBy,
  baseUrl,
}) => {
  const byWhom = cancelledBy === "admin" ? "the clinic" : "you";
  return emailShell(`
    <h2 style="margin:0 0 8px;color:${TEXT_DARK};font-size:22px;font-weight:700;font-family:Arial,sans-serif;letter-spacing:-0.3px;">
      Appointment Cancelled
    </h2>
    <p style="margin:0 0 4px;color:${TEXT_MED};font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">Hi ${name},</p>
    <p style="margin:0 0 4px;color:${TEXT_MED};font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
      Your appointment has been cancelled by ${byWhom}.
      ${reason ? `<br /><strong>Reason:</strong> ${reason}` : ""}
    </p>
    ${appointmentCard(appointment)}
    ${primaryButton(`${baseUrl}/book`, "Book a New Appointment")}
    <p style="margin:12px 0 0;color:${TEXT_LIGHT};font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">
      If you did not request this cancellation, please contact us at
      <a href="mailto:${SUPPORT_CONTACT}" style="color:${BASE_COLOR};">${SUPPORT_CONTACT}</a>.
    </p>
  `);
};

export const getAppointmentCancelledText = ({
  name,
  appointment,
  reason,
  cancelledBy,
  baseUrl,
}) => {
  const byWhom = cancelledBy === "admin" ? "the clinic" : "you";
  return `
Hi ${name},

Your appointment has been cancelled by ${byWhom}.${reason ? `\nReason: ${reason}` : ""}

Service     : ${appointment.service?.name}
Department  : ${appointment.department?.name}
Date        : ${fmtDate(appointment.date)}
Time        : ${appointment.timeSlot?.start} - ${appointment.timeSlot?.end}
Queue Token : ${appointment.queueToken}

Book a new appointment: ${baseUrl}/book

- The Slotly Team
Support: ${SUPPORT_CONTACT}
`;
};

// ─── 5. Status Update ───────────────────────────────────────────
export const getAppointmentStatusHTML = ({
  name,
  appointment,
  status,
  baseUrl,
}) => {
  const configs = {
    completed: {
      title: "Appointment Completed",
      body: "Your appointment has been marked as completed. We hope everything went well.",
      cta: "Leave Feedback",
      ctaUrl: `${baseUrl}/feedback`,
    },
    "no-show": {
      title: "Appointment Missed",
      body: "You were marked as a no-show for your appointment. If this is a mistake, please contact us.",
      cta: "Book Again",
      ctaUrl: `${baseUrl}/book`,
    },
    confirmed: {
      title: "Appointment Confirmed",
      body: "Your appointment has been confirmed by the clinic. See you soon.",
      cta: "View Appointment",
      ctaUrl: `${baseUrl}/my-appointments`,
    },
  };
  const c = configs[status] || configs.confirmed;
  return emailShell(`
    <h2 style="margin:0 0 8px;color:${TEXT_DARK};font-size:22px;font-weight:700;font-family:Arial,sans-serif;letter-spacing:-0.3px;">
      ${c.title}
    </h2>
    <p style="margin:0 0 4px;color:${TEXT_MED};font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">Hi ${name},</p>
    <p style="margin:0 0 4px;color:${TEXT_MED};font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">${c.body}</p>
    ${appointmentCard(appointment)}
    ${primaryButton(c.ctaUrl, c.cta)}
  `);
};

export const getAppointmentStatusText = ({
  name,
  appointment,
  status,
  baseUrl,
}) => {
  const titles = {
    completed: "Your appointment has been completed.",
    "no-show": "You were marked as a no-show for your appointment.",
    confirmed: "Your appointment has been confirmed.",
  };
  return `
Hi ${name},

${titles[status] || `Your appointment status has been updated to: ${status}.`}

Service     : ${appointment.service?.name}
Department  : ${appointment.department?.name}
Date        : ${fmtDate(appointment.date)}
Time        : ${appointment.timeSlot?.start} - ${appointment.timeSlot?.end}
Queue Token : ${appointment.queueToken}

${status === "completed" ? `Leave feedback: ${baseUrl}/feedback` : `View appointments: ${baseUrl}/my-appointments`}

- The Slotly Team
Support: ${SUPPORT_CONTACT}
`;
};

// ─── 6. Queue Alert ─────────────────────────────────────────────
export const getQueueAlertHTML = ({
  name,
  appointment,
  position,
  estimatedMinutes,
  baseUrl,
}) =>
  emailShell(`
    <h2 style="margin:0 0 8px;color:${TEXT_DARK};font-size:22px;font-weight:700;font-family:Arial,sans-serif;letter-spacing:-0.3px;">
      Your Turn Is Coming Soon
    </h2>
    <p style="margin:0 0 4px;color:${TEXT_MED};font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">Hi ${name},</p>
    <p style="margin:0 0 4px;color:${TEXT_MED};font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
      You are <strong style="color:${BASE_COLOR};">${position} position${position > 1 ? "s" : ""} away</strong> from being called.
      Please make your way to the clinic now. Estimated wait is around
      <strong>${estimatedMinutes} minute${estimatedMinutes !== 1 ? "s" : ""}</strong>.
    </p>
    ${warningBox(`Please head to <strong>${appointment.department?.name || "the clinic"}</strong> now and keep your token <strong>${appointment.queueToken}</strong> ready.`)}
    ${appointmentCard(appointment)}
    ${primaryButton(`${baseUrl}/live-queue`, "Track My Position Live")}
  `);

export const getQueueAlertText = ({
  name,
  appointment,
  position,
  estimatedMinutes,
  baseUrl,
}) => `
Hi ${name},

You are ${position} position${position > 1 ? "s" : ""} away from being called at ${appointment.department?.name || "the clinic"}.

Please head there now. Estimated wait: ${estimatedMinutes} minute${estimatedMinutes !== 1 ? "s" : ""}.

Your token  : ${appointment.queueToken}
Service     : ${appointment.service?.name}
Department  : ${appointment.department?.name}

Track live: ${baseUrl}/live-queue

- The Slotly Team
Support: ${SUPPORT_CONTACT}
`;
