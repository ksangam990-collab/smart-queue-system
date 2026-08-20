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
