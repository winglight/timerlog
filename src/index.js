require('./models/User');
require('./models/Track');
require('./models/TimeCategoryModel');
require('./models/TimeLogModel');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const trackRoutes = require('./routes/trackRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const logRoutes = require('./routes/logRoutes');
const requireAuth = require('./middlewares/requireAuth');

const app = express();

app.use(bodyParser.json());
app.use(authRoutes);
app.use(trackRoutes);
app.use(categoryRoutes);
app.use(logRoutes);

app.use(function(err, req, res, next) {
  // logic
  console.error(err.stack);
  res.status(500).send(err.message);
});
//gP5Ei%^7Vn5X
//mongodb+srv://admin:gP5Ei%^7Vn5X@cluster0.oer4n.mongodb.net/timelog?retryWrites=true&w=majority
//mongodb://localhost:27017/timelog?retryWrites=true&w=majority
var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_COBALT_URI || 'mongodb+srv://cluster0.oer4n.mongodb.net/timelog?retryWrites=true&w=majority';
mongoose.connect(mongoUri, {
  auth: {
    user: "admin",
    password: "gP5Ei%^7Vn5X"
  },
  useNewUrlParser: true,
  useCreateIndex: true
});
mongoose.connection.on('connected', () => {
  console.log('Connected to mongo instance');
});
mongoose.connection.on('error', err => {
  console.error('Error connecting to mongo', err);
});

app.get('/', requireAuth, (req, res) => {
  res.send(`Your email: ${req.user.email}`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
