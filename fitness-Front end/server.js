const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Booking = require('./models/Booking');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

mongoose.connect('mongodb://localhost:27017/fitnessApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/api/bookings', async (req, res) => {
  const { coach, course, date, time } = req.body;
  const booking = new Booking({ coach, course, date, time });
  await booking.save();
  res.json({ message: '預約成功！' });
});

app.listen(3000, () => {
  console.log('伺服器啟動於 http://localhost:3000');
});
