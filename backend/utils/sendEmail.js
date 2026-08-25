// backend/utils/sendEmail.js

// Resolved once, with a real final fallback so a template never renders the
// literal string "undefined" if these env vars happen to be unset.
const SUPPORT_CONTACT =
  process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || 'our support team';

export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
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
    console.error('[sendEmail] Resend API rejected the request:', {
      status:  response.status,
      to,
      subject,
      body:    errorBody,
    });
    throw new Error(`Resend API error (${response.status}): ${errorBody}`);
  }
};

// ─── Shared HTML shell ──────────────────────────────────────────
// Matches the app's actual design system (see frontend/tailwind.config.js):
// primary-500 #5b5ff5 / primary-600 #4740e8 / primary-700 #3b32cc,
// accent-500 (emerald) #0fb894, rounded-4xl = 32px, rounded-2xl = 16px,
// and the same diagonal header gradient used on AuthBrandPanel
// (from-primary-600 via-primary-500 to-primary-700).
const emailShell = (bodyHTML) => `
  <div style="background-color: #f0f1ff; padding: 40px 16px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #e3e5ff; box-shadow: 0 24px 48px -12px rgba(91, 95, 245, 0.18);">

      <div style="background: #4740e8; background: linear-gradient(135deg, #4740e8 0%, #5b5ff5 55%, #3b32cc 100%); padding: 28px 40px;">
        <span style="color: #ffffff; font-size: 21px; font-weight: 700; letter-spacing: -0.01em;">⚡ Slotly</span>
      </div>
      <div style="height: 3px; background: #2dd4a7;"></div>

      <div style="padding: 40px;">
        ${bodyHTML}
      </div>

      <div style="padding: 20px 40px; background: #f8fafc; border-top: 1px solid #e3e5ff;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
          This is an automated message from Slotly. For help, contact us at
          <a href="mailto:${SUPPORT_CONTACT}" style="color: #5b5ff5; text-decoration: none;">${SUPPORT_CONTACT}</a>.
        </p>
        <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 12px;">
          © ${new Date().getFullYear()} Slotly. All rights reserved.
        </p>
      </div>

    </div>
  </div>
`;

const primaryButton = (href, label) => `
  <div style="text-align: center; margin: 32px 0;">
    <a href="${href}"
       style="background: #5b5ff5; color: #ffffff; padding: 14px 36px; border-radius: 16px;
              text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;
              box-shadow: 0 6px 16px -4px rgba(91, 95, 245, 0.4);">
      ${label}
    </a>
  </div>
`;

const fallbackLink = (href) => `
  <p style="margin: 0 0 4px; color: #64748b; font-size: 13px;">
    If the button doesn't work, copy and paste this link into your browser:
  </p>
  <p style="margin: 0 0 28px; word-break: break-all;">
    <a href="${href}" style="color: #5b5ff5; font-size: 13px; text-decoration: none;">${href}</a>
  </p>
`;

// Emerald accent reassurance box — matches the app's "accent" brand color,
// used for calm/safe framing rather than an alarming yellow warning tone.
const noticeBox = (text) => `
  <div style="background: #f0fdfa; border: 1px solid #a7f3e8; border-radius: 16px; padding: 14px 18px; margin-top: 8px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align: top; padding-right: 10px;">
        <span style="color: #0fb894; font-size: 15px;">&#10003;</span>
      </td>
      <td>
        <p style="margin: 0; color: #0a9578; font-size: 13px; line-height: 1.6;">${text}</p>
      </td>
    </tr></table>
  </div>
`;

// Email templates
export const getVerificationEmailHTML = (name, token, baseUrl) => {
  const link = `${baseUrl}/verify-email/${token}`;
  return emailShell(`
    <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.01em;">Confirm your email address</h2>
    <p style="margin: 0 0 8px; color: #475569; font-size: 15px; line-height: 1.7;">
      Hi ${name},
    </p>
    <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.7;">
      Thanks for creating a Slotly account. Please confirm your email address to activate it and
      start booking appointments.
    </p>
    ${primaryButton(link, 'Confirm email address')}
    ${fallbackLink(link)}
    <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
      This link expires in 24 hours. If you didn't create a Slotly account, you can safely ignore this email.
    </p>
  `);
};

export const getVerificationEmailText = (name, token, baseUrl) => `
Hi ${name},

Thanks for creating a Slotly account. Please confirm your email address to activate it and start booking appointments.

Confirm your email here: ${baseUrl}/verify-email/${token}
(This link expires in 24 hours.)

If you didn't create a Slotly account, you can safely ignore this email.

— The Slotly Team
Support: ${SUPPORT_CONTACT}
`;

export const getPasswordResetEmailHTML = (name, token, baseUrl) => {
  const link = `${baseUrl}/reset-password/${token}`;
  return emailShell(`
    <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.01em;">Reset your password</h2>
    <p style="margin: 0 0 8px; color: #475569; font-size: 15px; line-height: 1.7;">
      Hi ${name},
    </p>
    <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.7;">
      We received a request to reset the password for your Slotly account. Click the button below
      to choose a new one.
    </p>
    ${primaryButton(link, 'Reset password')}
    ${fallbackLink(link)}
    <p style="margin: 0 0 16px; color: #94a3b8; font-size: 13px; line-height: 1.6;">
      This link expires in 30 minutes.
    </p>
    ${noticeBox('<strong>Didn\'t request this?</strong> No action is needed — your password will stay the same and your account remains secure.')}
  `);
};

export const getPasswordResetEmailText = (name, token, baseUrl) => `
Hi ${name},

We received a request to reset the password for your Slotly account.

Reset your password here: ${baseUrl}/reset-password/${token}
(This link expires in 30 minutes.)

Didn't request this? No action is needed — your password will stay the same and your account remains secure.

— The Slotly Team
Support: ${SUPPORT_CONTACT}
`;

// ─── Appointment email helpers ───────────────────────────────────

// Formats a date string like "Monday, 25 Aug 2026"
const fmtDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });

// Info row used inside appointment emails (label + value pair)
const infoRow = (label, value) => `
  <tr>
    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 140px; vertical-align: top;">${label}</td>
    <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; vertical-align: top;">${value}</td>
  </tr>
`;

// Appointment detail card — used by all 3 appointment templates
const appointmentCard = ({ service, department, date, timeSlot, queueToken, bookingReference, fee }) => `
  <div style="background: #f8faff; border: 1px solid #e3e5ff; border-radius: 20px; padding: 24px; margin: 24px 0;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
      <span style="font-size: 28px;">${department?.icon || '🏥'}</span>
      <div>
        <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">${service?.name || 'Appointment'}</p>
        <p style="margin: 0; font-size: 13px; color: #64748b;">${department?.name || ''}</p>
      </div>
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
      ${infoRow('📅 Date', fmtDate(date))}
      ${infoRow('⏰ Time', `${timeSlot?.start} – ${timeSlot?.end}`)}
      ${infoRow('🎫 Queue Token', `<span style="font-family: monospace; background: #ede9fe; color: #5b5ff5; padding: 2px 10px; border-radius: 8px;">${queueToken}</span>`)}
      ${infoRow('🔖 Booking Ref', bookingReference || '—')}
      ${fee > 0 ? infoRow('💳 Fee', `₹${fee}`) : ''}
    </table>
  </div>
`;

// ─── 1. Booking Confirmation ─────────────────────────────────────
export const getBookingConfirmationHTML = ({ name, appointment, baseUrl }) =>
  emailShell(`
    <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.01em;">
      Appointment Confirmed ✅
    </h2>
    <p style="margin: 0 0 4px; color: #475569; font-size: 15px; line-height: 1.7;">Hi ${name},</p>
    <p style="margin: 0 0 4px; color: #475569; font-size: 15px; line-height: 1.7;">
      Your appointment has been booked successfully. Here are your details:
    </p>

    ${appointmentCard(appointment)}

    ${primaryButton(`${baseUrl}/my-appointments`, 'View My Appointments')}

    ${noticeBox('Please arrive 5 minutes early. Show your queue token <strong>${appointment.queueToken}</strong> at the reception.')}

    <p style="margin: 20px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
      To cancel or reschedule, visit My Appointments in the Slotly app at least 1 hour before your slot.
    </p>
  `);

export const getBookingConfirmationText = ({ name, appointment, baseUrl }) => `
Hi ${name},

Your appointment has been confirmed on Slotly!

Service     : ${appointment.service?.name}
Department  : ${appointment.department?.name}
Date        : ${fmtDate(appointment.date)}
Time        : ${appointment.timeSlot?.start} – ${appointment.timeSlot?.end}
Queue Token : ${appointment.queueToken}
Booking Ref : ${appointment.bookingReference}
${appointment.fee > 0 ? `Fee         : ₹${appointment.fee}` : ''}

View your appointment: ${baseUrl}/my-appointments

Please arrive 5 minutes early and show your queue token at the reception.

— The Slotly Team
Support: ${SUPPORT_CONTACT}
`;

// ─── 2. Cancellation ─────────────────────────────────────────────
export const getAppointmentCancelledHTML = ({ name, appointment, reason, cancelledBy, baseUrl }) => {
  const byWhom = cancelledBy === 'admin' ? 'the clinic' : 'you';
  return emailShell(`
    <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.01em;">
      Appointment Cancelled ❌
    </h2>
    <p style="margin: 0 0 4px; color: #475569; font-size: 15px; line-height: 1.7;">Hi ${name},</p>
    <p style="margin: 0 0 4px; color: #475569; font-size: 15px; line-height: 1.7;">
      Your appointment has been cancelled by ${byWhom}.
      ${reason ? `<br><strong>Reason:</strong> ${reason}` : ''}
    </p>

    ${appointmentCard(appointment)}

    ${primaryButton(`${baseUrl}/book`, 'Book a New Appointment')}

    <p style="margin: 12px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
      If you didn't request this cancellation, please contact us immediately at
      <a href="mailto:${SUPPORT_CONTACT}" style="color: #5b5ff5; text-decoration: none;">${SUPPORT_CONTACT}</a>.
    </p>
  `);
};

export const getAppointmentCancelledText = ({ name, appointment, reason, cancelledBy, baseUrl }) => {
  const byWhom = cancelledBy === 'admin' ? 'the clinic' : 'you';
  return `
Hi ${name},

Your appointment has been cancelled by ${byWhom}.${reason ? `\nReason: ${reason}` : ''}

Service     : ${appointment.service?.name}
Department  : ${appointment.department?.name}
Date        : ${fmtDate(appointment.date)}
Time        : ${appointment.timeSlot?.start} – ${appointment.timeSlot?.end}
Queue Token : ${appointment.queueToken}

Book a new appointment: ${baseUrl}/book

— The Slotly Team
Support: ${SUPPORT_CONTACT}
`;
};

// ─── 3. Status Update (completed / no-show / re-confirmed) ──────
export const getAppointmentStatusHTML = ({ name, appointment, status, baseUrl }) => {
  const configs = {
    completed: {
      emoji: '🎉',
      title: 'Appointment Completed',
      body: 'Your appointment has been marked as completed. We hope everything went well!',
      cta: 'Leave Feedback',
      ctaUrl: `${baseUrl}/feedback`,
    },
    'no-show': {
      emoji: '⚠️',
      title: 'Appointment Missed',
      body: 'You were marked as a no-show for your appointment. If this is a mistake, please contact us.',
      cta: 'Book Again',
      ctaUrl: `${baseUrl}/book`,
    },
    confirmed: {
      emoji: '✅',
      title: 'Appointment Re-confirmed',
      body: 'Your appointment has been re-confirmed by the clinic. See you soon!',
      cta: 'View Appointment',
      ctaUrl: `${baseUrl}/my-appointments`,
    },
  };
  const c = configs[status] || configs.confirmed;
  return emailShell(`
    <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.01em;">
      ${c.emoji} ${c.title}
    </h2>
    <p style="margin: 0 0 4px; color: #475569; font-size: 15px; line-height: 1.7;">Hi ${name},</p>
    <p style="margin: 0 0 4px; color: #475569; font-size: 15px; line-height: 1.7;">${c.body}</p>

    ${appointmentCard(appointment)}

    ${primaryButton(c.ctaUrl, c.cta)}
  `);
};

export const getAppointmentStatusText = ({ name, appointment, status, baseUrl }) => {
  const titles = {
    completed: 'Your appointment has been completed.',
    'no-show': 'You were marked as a no-show for your appointment.',
    confirmed: 'Your appointment has been re-confirmed.',
  };
  return `
Hi ${name},

${titles[status] || `Your appointment status has been updated to: ${status}.`}

Service     : ${appointment.service?.name}
Department  : ${appointment.department?.name}
Date        : ${fmtDate(appointment.date)}
Time        : ${appointment.timeSlot?.start} – ${appointment.timeSlot?.end}
Queue Token : ${appointment.queueToken}

${status === 'completed' ? `Leave feedback: ${baseUrl}/feedback` : `View appointments: ${baseUrl}/my-appointments`}

— The Slotly Team
Support: ${SUPPORT_CONTACT}
`;
};

// ─── 4. Queue "Your Turn Is Coming" Alert ───────────────────────
export const getQueueAlertHTML = ({ name, appointment, position, estimatedMinutes, baseUrl }) =>
  emailShell(`
    <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.01em;">
      ⏰ Your Turn Is Coming Soon!
    </h2>
    <p style="margin: 0 0 4px; color: #475569; font-size: 15px; line-height: 1.7;">Hi ${name},</p>
    <p style="margin: 0 0 4px; color: #475569; font-size: 15px; line-height: 1.7;">
      You are <strong style="color: #5b5ff5;">${position} position${position > 1 ? 's' : ''} away</strong> from being called.
      Please make your way to the clinic now — estimated wait is around
      <strong>${estimatedMinutes} minute${estimatedMinutes !== 1 ? 's' : ''}</strong>.
    </p>

    <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px; padding: 16px 20px; margin: 20px 0; display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 28px;">🏃</span>
      <p style="margin: 0; color: #9a3412; font-size: 14px; line-height: 1.6;">
        Head to <strong>${appointment.department?.name || 'the clinic'}</strong> now and keep your
        token <strong style="font-family: monospace; background: #fef3c7; padding: 1px 6px; border-radius: 6px;">${appointment.queueToken}</strong> ready.
      </p>
    </div>

    ${appointmentCard(appointment)}

    ${primaryButton(`${baseUrl}/live-queue`, 'Track My Position Live')}
  `);

export const getQueueAlertText = ({ name, appointment, position, estimatedMinutes, baseUrl }) => `
Hi ${name},

You are ${position} position${position > 1 ? 's' : ''} away from being called at ${appointment.department?.name || 'the clinic'}.

Please head there now — estimated wait: ${estimatedMinutes} minute${estimatedMinutes !== 1 ? 's' : ''}.

Your token  : ${appointment.queueToken}
Service     : ${appointment.service?.name}
Department  : ${appointment.department?.name}

Track live: ${baseUrl}/live-queue

-- The Slotly Team
Support: ${SUPPORT_CONTACT}
`;
