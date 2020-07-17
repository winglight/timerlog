var moment = require('moment'); // require

const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');

const TimeCategory = mongoose.model('TimeCategory');
const TimeLog = mongoose.model('TimeLog');
const User = mongoose.model('User');

const router = express.Router();

router.use(requireAuth);

router.get('/logs', async (req, res) => {
  const { startDate, endDate } = req.body;

    const logs = await TimeLog.find({
      userId: req.user._id, startTime: moment(startDate).toDate(), endTime: moment(endDate).toDate()
    });

    res.send(logs);
});

const getTotalValues = async (userId) => {
  const today = moment();

  const pipeline = [
        { "$match": {
            "userId": { "$eq": userId }
          }},
        {
          $project: {
            "_id":0,
            "category": "$category",
            "duration": "$duration",
            "today":
                { $cond: [{$and:[ { $gte: ["$startTime", today.startOf('day').toDate()]}, {$lt: ["$startTime", today.endOf('day').toDate()]}]}, true, false] },
            "week":
                { $cond: [{$and:[ { $gte: ["$startTime", today.startOf('week').toDate()]}, {$lt: ["$startTime", today.endOf('week').toDate()]}]}, true, false] },
            "month":
                { $cond: [{$and:[ { $gte: ["$startTime", today.startOf('month').toDate()]}, {$lt: ["$startTime", today.endOf('month').toDate()]}]}, true, false] },
            "year":
                { $cond: [{$and:[ { $gte: ["$startTime", today.startOf('year').toDate()]}, {$lt: ["$startTime", today.endOf('year').toDate()]}]}, true, false] },

          }
        },
        {
          "$group": {
            "_id": "$category",
            "todayDuration": { "$sum": { "$cond": [{ "$eq": ["$today", true] }, "$duration", 0] } },
            "weekDuration": { "$sum": { "$cond": [{ "$eq": ["$week", true] }, "$duration", 0] } },
            "monthDuration": { "$sum": { "$cond": [{ "$eq": ["$month", true] }, "$duration", 0] } },
            "yearDuration": { "$sum": { "$cond": [{ "$eq": ["$year", true] }, "$duration", 0] } },
          }
        },
      ],
      resultArray = await TimeLog.aggregate(pipeline);

  return resultArray;
}

router.get('/logstats', async (req, res) => {
  if (req.user.lastStatTime == null || req.user.lastStatTime < moment().startOf('day').toDate()) {
    const stats = await getTotalValues(req.user._id);
    stats.map(async (item) => {
      await TimeCategory.findByIdAndUpdate(item._id, {
        $set: {
          todayDuration: item.todayDuration,
          weekDuration: item.weekDuration,
          monthDuration: item.monthDuration,
          yearDuration: item.yearDuration
        }
      });
    });
    //update user last stats time
    await User.findByIdAndUpdate(req.user._id, {$set: {lastStatTime: moment().toDate()}});
  }

    res.send(await TimeCategory.find({ userId: req.user._id }));
});

router.get('/logs/:catId', async (req, res) => {
  const { startDate, endDate } = req.body;

    const logs = await TimeLog.find({
      userId: req.user._id,
      category: req.params.catId, startTime: { $gte: moment(startDate).startOf('day').toDate(),  $lte: moment(endDate).endOf('day').toDate()}
    });

    res.send(logs);
});

router.delete('/logs/:id', async (req, res) => {
  try {
    await TimeLog.findOneAndDelete({_id: req.params.id, userId: req.user._id});
    res.send({msg: 'Succeed to delete!'});
  }catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.post('/logs', async (req, res) => {
  const { _id, category, startDate, endDate  } = req.body;

  const date = moment(startDate).format('YYYY-MM-DD');
  const duration = moment(endDate).diff(moment(startDate), "minutes");

  if (!category || !startDate || !endDate) {
    return res
      .status(422)
      .send({ error: 'You must provide a category and startDate and endDate' });
  }

  try {
    if(_id){
        // console.log('cat: ' + JSON.stringify(cat));
      await TimeLog.updateOne({_id: _id, userId: req.user._id, category: category,
        startDate: startDate, endDate: endDate, date: date, duration: duration });
      // await TimeCategory.findOneAndUpdate({_id: _id, userId: req.user._id}, { name: name, type: type });
        res.send({msg: 'Succeed to update!'});
    }else {
      const log = new TimeLog({userId: req.user._id, category: category,
        startDate: startDate, endDate: endDate, date: date, duration: duration});
      await log.save();

      const dayDuration = moment().isSame(moment(startDate), 'day') ? duration : 0;
      const weekDuration = moment().isSame(moment(startDate), 'week') ? duration : 0;
      const monthDuration = moment().isSame(moment(startDate), 'month') ? duration : 0;
      const yearDuration = moment().isSame(moment(startDate), 'year') ? duration : 0;

      await TimeCategory.findByIdAndUpdate(category, { $inc: { todayDuration: dayDuration, weekDuration: weekDuration, monthDuration: monthDuration, yearDuration: yearDuration }});

      const cat = TimeCategory.findById(category);

          res.send({log});
    }

  } catch (err) {
    console.log(err);
    res.status(422).send({ error: err.message });
  }
});

module.exports = router;
