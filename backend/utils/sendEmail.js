// backend/utils/sendEmail.js

import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `Slotly <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

// Email templates
export const getVerificationEmailHTML = (name, token, baseUrl) => `
  <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #6366f1; border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 30px;">
      <h1 style="color: white; margin: 0; font-size: 28px;">⚡ Slotly</h1>
    </div>
    <h2 style="color: #1e293b;">Hi ${name}, verify your email</h2>
    <p style="color: #64748b; line-height: 1.6;">
      Click the button below to verify your email address and activate your account.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/verify-email/${token}"
         style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 12px;
                text-decoration: none; font-weight: 600; display: inline-block;">
        Verify Email
      </a>
    </div>
    <p style="color: #94a3b8; font-size: 14px;">This link expires in 24 hours.</p>
  </div>
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