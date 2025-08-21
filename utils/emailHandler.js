import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import QRCode from 'qrcode';

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
    debug: true,
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

/**
 * Generates a QR code for the given URL and embeds it in the email.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} text - Plain text content of the email.
 * @param {string} html - HTML content of the email (optional).
 * @returns {Promise<void>} - Resolves when the email is sent successfully.
 */
export async function sendEmailWithQRCode({ to, subject, text, html }) {
  const loginUrl = 'https://lcys2025.github.io';
  const qrCodeDataUrl = await QRCode.toDataURL(loginUrl);

  const qrCodeHtml = `<div style="text-align: center;">
    <p>Scan the QR code below to log in:</p>
    <img src="${qrCodeDataUrl}" alt="Login QR Code" />
  </div>`;
  console.log(html);
  const combinedHtml = html ? `${html}${qrCodeHtml}` : qrCodeHtml;
  
  await sendEmail({
    to,
    subject,
    text,
    html: combinedHtml,
  });
}