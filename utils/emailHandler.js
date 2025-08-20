import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends an email using the provided parameters.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} text - Plain text content of the email.
 * @param {string} html - HTML content of the email (optional).
 * @returns {Promise<void>} - Resolves when the email is sent successfully.
 */
export async function sendEmail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.verify();

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    text,
    html,
  });
}