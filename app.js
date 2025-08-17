import createError from "http-errors";
import express, { json, urlencoded } from "express";
import session from "express-session";
import path, { join } from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { fileURLToPath } from 'url';

import dotenv from "dotenv";

import mongoose from "mongoose";
import { initializeDB } from "./database/init.js";

import indexRouter from "./routes/index.js";
import aboutRouter from "./routes/about.route.js";
import servicesRouter from "./routes/services.route.js";
import trainersRouter from "./routes/trainers.route.js";
import authRouter from "./routes/auth.route.js";
import contactRouter from "./routes/contact.route.js";
import userRouter from "./routes/user.route.js";
import bookingRouter from "./routes/booking.route.js";
import bookingPageRouter from "./routes/bookingPage.route.js";
import dashboardRouter from "./routes/dashboard.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// use .env variables
dotenv.config();

// judge if mongodb uri is defined
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI not defined!");
  process.exit(1);
}

// connect mongodb and add success and failed callback
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connect mongodb successfully!")
  }).catch((err) => {
    console.log("failed to connect mongodb!, error: ", err);
    process.exit(1);
  })

// listen for connection events
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", async () => {
  console.log("MongoDB connection is open");
  await initializeDB();  // FIX_ME: Initialize "testing" documents (e.g. trainers)
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'your_secret_key', // A strong, unique secret for signing the session ID cookie
  resave: false, // Prevents resaving the session if it hasn't been modified
  saveUninitialized: false, // Avoids saving new, uninitialized sessions to the store
  cookie: {
    secure: false, // Set to true if using HTTPS in production
    maxAge: 3600000 // Session expiration time in milliseconds (e.g., 1 hour)
  }
}));
// Add after session middleware
app.use((req, res, next) => {
  // Make user available to all views
  res.locals.user = req.session.user || null;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/services', servicesRouter);
app.use('/trainers', trainersRouter);
app.use('/auth', authRouter);
app.use('/contact', contactRouter);
app.use('/user', userRouter);
app.use('/booking', bookingRouter);
app.use('/book', bookingPageRouter);
app.use('/user/bookings', bookingPageRouter);
app.use('/dashboard', dashboardRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (res.headersSent) return;
  
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.status === 404) {
    return res.status(404).render('404');
  }
  
  res.status(err.status || 500).render('error');
});

export default app;
