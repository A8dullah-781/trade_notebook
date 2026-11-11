import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to, rawToken) {
  const link = `${process.env.CLIENT_URL}/verify?token=${rawToken}`;

  const { error } = await resend.emails.send({
    from: "Trade Notebook <onboarding@resend.dev>",
    to,
    subject: "Verify your email",
    html: `
      <p>Welcome to Trade Notebook.</p>
      <p>Click the link below to verify your email. It expires in 24 hours.</p>
      <p><a href="${link}">Verify my email</a></p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendResetEmailPass(to, rawToken) {
  const link = `${process.env.CLIENT_URL}/reset?token=${rawToken}`;

  const { error } = await resend.emails.send({
    from: "Trade Notebook <onboarding@resend.dev>",
    to,
    subject: "Reset your password",
    html: `
      <p>We got a request to reset your Trade Notebook password.</p>
      <p>Click the link below to choose a new password. It works once and expires in 1 hour.</p>
      <p><a href="${link}">Reset my password</a></p>
      <p>If you didn't ask for this, you can ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendChangeEmailLink(to, rawToken) {
  const link = `${process.env.CLIENT_URL}/verify?token=${rawToken}`;

  const { error } = await resend.emails.send({
    from: "Trade Notebook <onboarding@resend.dev>",
    to,
    subject: "Confirm your new email",
    html: `
      <p>We got a request to use this address for your Trade Notebook account.</p>
      <p>Click the link below to confirm. It works once and expires in 24 hours.</p>
      <p><a href="${link}">Confirm my new email</a></p>
      <p>If you didn't ask for this, you can ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}