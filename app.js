import createError from "http-errors";
import express, { json, urlencoded } from "express";
import path, { join } from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { fileURLToPath } from 'url';

import mongoose from "mongoose";
import dotenv from "dotenv";

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";;

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
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("connect mongodb successfully!")
}).catch((err) => {
  console.log("failed to connect mongodb!, error: ", err);
  process.exit(1);
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
