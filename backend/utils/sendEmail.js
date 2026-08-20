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

// Email templates
export const getVerificationEmailHTML = (name, token, baseUrl) => `
  <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #6366f1; border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 30px;">
      <h1 style="color: white; margin: 0; font-size: 28px;">⚡ Slotly</h1>
    </div>
    <h2 style="color: #1e293b;">Hi ${name}, please confirm your email address</h2>
    <p style="color: #64748b; line-height: 1.6;">
      Click the button below to confirm your email address and activate your account.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/verify-email/${token}"
         style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 12px;
                text-decoration: none; font-weight: 600; display: inline-block;">
        Confirm email address
      </a>
    </div>
    <p style="color: #94a3b8; font-size: 14px;">This link expires in 24 hours. If you didn't create a Slotly account, you can ignore this email.</p>
  </div>
`;

export const getVerificationEmailText = (name, token, baseUrl) => `
Hi ${name},

Please confirm your email address to activate your Slotly account.

Confirm your email here: ${baseUrl}/verify-email/${token}

This link expires in 24 hours. If you didn't create a Slotly account, you can ignore this email.
`;

export const getPasswordResetEmailHTML = (name, token, baseUrl) => `
  <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #6366f1; border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 30px;">
      <h1 style="color: white; margin: 0; font-size: 28px;">⚡ Slotly</h1>
    </div>
    <h2 style="color: #1e293b;">Hi ${name}, reset your password</h2>
    <p style="color: #64748b; line-height: 1.6;">
      We received a request to reset your password. Click the button below to set a new one.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/reset-password/${token}"
         style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 12px;
                text-decoration: none; font-weight: 600; display: inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color: #94a3b8; font-size: 14px;">This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
  </div>
`;

export const getPasswordResetEmailText = (name, token, baseUrl) => `
Hi ${name},

We received a request to reset your password.

Reset your password here: ${baseUrl}/reset-password/${token}

This link expires in 30 minutes. If you didn't request this, you can ignore this email.
`;
