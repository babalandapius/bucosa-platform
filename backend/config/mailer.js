import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendResetEmail = async (toEmail, resetToken) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: '"BUCoSA Platform" <no-reply@bucosa.ac.ug>',
    to: toEmail,
    subject: 'BUCoSA Password Reset Request',
    html: `<p>You requested a password reset. Click the link below to set a new password:</p>
           <a href="${resetUrl}">${resetUrl}</a>
           <p>This link will expire in 1 hour.</p>`,
  });
};