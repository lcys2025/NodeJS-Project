const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  coach: String,
  course: String,
  date: String,
  time: String
});

module.exports = mongoose.model('Booking', bookingSchema);
