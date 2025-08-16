import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('services', { company_name: process.env.COMPANY_NAME });
});

export default router;
