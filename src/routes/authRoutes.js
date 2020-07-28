const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');
const TimeCategory = mongoose.model('TimeCategory');

const fs = require('fs');
const initUserCats = async (userId) => {
  let data = fs.readFileSync('./src/models/init_categories.json');
  let cats = JSON.parse(data);
  cats.forEach((item) => {
    item.userId = userId;
  });
  TimeCategory.insertMany(cats);
}

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = new User({ email, password });
    await user.save();

    await initUserCats(user._id);

    const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY');
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send({ error: 'Must provide email and password' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.send({ error: 'Invalid password or email' });
  }

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY');
    const lastStatTime = user.lastStatTime;
    res.send({ token, lastStatTime });
  } catch (err) {
    return res.status(422).send({ error: 'Invalid password or email' });
  }
});

module.exports = router;
