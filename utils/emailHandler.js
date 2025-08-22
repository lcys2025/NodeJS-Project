import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import QRCode from 'qrcode';

dotenv.config();

/**
 * Generates a QR code for the given URL and embeds it in the email.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} text - Plain text content of the email.
 * @param {string} html - HTML content of the email (optional).
 * @returns {Promise<void>} - Resolves when the email is sent successfully.
 */
export async function sendEmailWithQRCode({to, subject, text, html}) {
  const url = "https://lcys2025.github.io";
  const qrCodeDataUrl = await QRCode.toDataURL(url);
  const qrCodeHtml = `<img src="${qrCodeDataUrl}" alt="QR Code"/>`;
  const content = html ? `${html}${qrCodeHtml}` : qrCodeHtml;
 
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  });

  let mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    text,
    attachDataUrls: true,
    html: content,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}