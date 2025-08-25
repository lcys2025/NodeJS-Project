const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Booking = require('./models/Booking');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/fitness-booking')
  .then(() => console.log('✅ MongoDB 已連接'))
  .catch(err => console.error('❌ MongoDB 連接失敗', err));

// 儲存預約
app.post('/api/bookings', async (req, res) => {
  const { trainer, course, date } = req.body;
  try {
    const existing = await Booking.findOne({ date });
    if (existing) {
      return res.status(400).json({ message: '此日期已被預約' });
    }
    const booking = new Booking({ trainer, course, date });
    await booking.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 取得已預約日期
app.get('/api/bookings', async (req, res) => {
  const bookings = await Booking.find({});
  const dates = bookings.map(b => b.date);
  res.json(dates);
});

app.listen(3000, () => {
  console.log('🌐 伺服器啟動於 http://localhost:3000');
});
