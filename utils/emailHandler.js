import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const OAuth2 = google.auth.OAuth2;
const SCOPES = ["https://mail.google.com/"];

export const googleOAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost:3030/auth/google/callback"
);

const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) reject(err);
        resolve(token);
      });
    });

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken
      }
    });
  } catch (err) {
    console.error('Error creating transporter:', err);
    throw err;
  }
};

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};