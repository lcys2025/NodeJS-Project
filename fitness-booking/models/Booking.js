const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  trainer: { type: String, required: true },
  course: { type: String, required: true },
  date: { type: String, required: true, unique: true } // 防止重複預約
});

module.exports = mongoose.model('Booking', bookingSchema);
