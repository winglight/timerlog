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
  let { startDate, endDate } = req.body;
  if(!startDate){
    startDate = moment().startOf('day').toDate();
  }else {
    startDate = moment(startDate).startOf('day').toDate()
  }
  if(!endDate){
    endDate = moment().endOf('day').toDate();
  }else {
    endDate = moment(endDate).endOf('day').toDate();
  }

  console.log(startDate, endDate);
    const logs = await TimeLog.find({
      userId: req.user._id, startTime: { $gte: startDate,  $lte: endDate}
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
            "month3":
                { $cond: [{$and:[ { $gte: ["$startTime", today.startOf('month').subtract(2, 'month').toDate()]}, {$lt: ["$startTime", today.endOf('month').toDate()]}]}, true, false] },
            "month6":
                { $cond: [{$and:[ { $gte: ["$startTime", today.startOf('month').subtract(5, 'month').toDate()]}, {$lt: ["$startTime", today.endOf('month').toDate()]}]}, true, false] },
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
            "month3Duration": { "$sum": { "$cond": [{ "$eq": ["$month3", true] }, "$duration", 0] } },
            "month6Duration": { "$sum": { "$cond": [{ "$eq": ["$month6", true] }, "$duration", 0] } },
            "yearDuration": { "$sum": { "$cond": [{ "$eq": ["$year", true] }, "$duration", 0] } },
            "allDuration": { "$sum": "$duration" },
          }
        },
      ],
      resultArray = await TimeLog.aggregate(pipeline);

  return resultArray;
}

const getTotalTagsValues = async (userId, catId) => {
  const today = moment();
  const conditions = {
    "userId": { "$eq": userId }
  };
  if(catId){
    conditions.category = catId;
  }

  const pipeline = [
        { "$match": conditions},
        {
          $project: {
            "_id":0,
            "tags": "$tags",
            "duration": "$duration",
            "today":
                { $cond: [{$and:[ { $gte: ["$startTime", today.startOf('day').toDate()]}, {$lt: ["$startTime", today.endOf('day').toDate()]}]}, true, false] },
            "week":
                { $cond: [{$and:[ { $gte: ["$startTime", today.startOf('week').toDate()]}, {$lt: ["$startTime", today.endOf('week').toDate()]}]}, true, false] },
            "month":
                { $cond: [{$and:[ { $gte: ["$startTime", today.startOf('month').toDate()]}, {$lt: ["$startTime", today.endOf('month').toDate()]}]}, true, false] },
            "month3":
                { $cond: [{$and:[ { $gte: ["$startTime", today.startOf('month').subtract(3, 'month').toDate()]}, {$lt: ["$startTime", today.endOf('month').toDate()]}]}, true, false] },
            "month6":
                { $cond: [{$and:[ { $gte: ["$startTime", today.startOf('month').subtract(6, 'month').toDate()]}, {$lt: ["$startTime", today.endOf('month').toDate()]}]}, true, false] },
            "year":
                { $cond: [{$and:[ { $gte: ["$startTime", today.startOf('year').toDate()]}, {$lt: ["$startTime", today.endOf('year').toDate()]}]}, true, false] },

          }
        },
        {$unwind:"$tags"},
        {
          "$group": {
            "_id": "$tags",
            "todayDuration": { "$sum": { "$cond": [{ "$eq": ["$today", true] }, "$duration", 0] } },
            "weekDuration": { "$sum": { "$cond": [{ "$eq": ["$week", true] }, "$duration", 0] } },
            "monthDuration": { "$sum": { "$cond": [{ "$eq": ["$month", true] }, "$duration", 0] } },
            "month3Duration": { "$sum": { "$cond": [{ "$eq": ["$month3", true] }, "$duration", 0] } },
            "month6Duration": { "$sum": { "$cond": [{ "$eq": ["$month6", true] }, "$duration", 0] } },
            "yearDuration": { "$sum": { "$cond": [{ "$eq": ["$year", true] }, "$duration", 0] } },
            "allDuration": { "$sum": "$duration" },
          }
        },
      ],
      resultArray = await TimeLog.aggregate(pipeline);

  return resultArray;
}

const getCatDurations = async (userId) => {
  const today = moment();

  const pipeline = [
        { "$match": {
            "userId": { "$eq": userId },
            "startTime": { "$gte": today.startOf('day').toDate(),
            "$lt": today.endOf('day').toDate()},
          }},
        {
          "$group": {
            "_id": "$category",
            "durations": { "$push": "$duration" },
          }
        },
      ],
      resultArray = await TimeLog.aggregate(pipeline);

  return resultArray;
}

const getLogDurations = async (conditions) => {
  const today = moment();

  const pipeline = [
        { "$match": conditions},
        {
          "$group": {
            "_id": "$date",
            "durations": { "$sum": "$duration" },
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
          month3Duration: item.month3Duration,
          month6Duration: item.month6Duration,
          yearDuration: item.yearDuration,
          allDuration: item.allDuration,
        }
      });
    });
    //reset durations of categories
    await TimeCategory.updateMany({userId: req.user._id}, {
      $set: {
        durations: [],
      }
    });
//update durations
    const stats2 = await getCatDurations(req.user._id);
    console.log('stats2: ' + JSON.stringify(stats2));
    stats2.map(async (item) => {
      await TimeCategory.findByIdAndUpdate(item._id, {
        $set: {
          durations: item.durations,
        }
      });
    });
    //update user last stats time
    await User.findByIdAndUpdate(req.user._id, {$set: {lastStatTime: moment().toDate()}});
  }

    res.send(await TimeCategory.find({ userId: req.user._id }));
});

router.get('/logstatsdetail/:catId', async (req, res) => {
    const stats = await getTotalTagsValues(req.user._id, req.params.catId);
    res.send(stats);
});

router.get('/logsdaily', async (req, res) => {
  let { startTime, type, category, tag } = req.query;
  // console.log('startTime: ' + startTime);
  startTime = moment(startTime).startOf('day').toDate();
  const conditions = {
    userId: req.user._id, startTime: { $gte: startTime}
  };
  if(type && type !== 'all'){
    const types = await TimeCategory.find({ userId: req.user._id, type: type });
    conditions.category = {$in: types.map(({_id}) => _id)};
  }else {
    if (category && category !== 'all') {
      conditions.category =  category;
    }else {
      if (tag && tag !== 'all') {
        conditions.tags = tag;
      }
    }
  }
  console.log('conditions: ' + JSON.stringify(conditions));

  const logs = await getLogDurations(conditions);

  res.send(logs);
});

router.get('/logs/:catId', async (req, res) => {
  let { startDate, endDate } = req.body;
  if(!startDate){
    startDate = moment().startOf('day').toDate();
  }else {
    startDate = moment(startDate).startOf('day').toDate()
  }
  if(!endDate){
    endDate = moment().endOf('day').toDate();
  }else {
    endDate = moment(endDate).endOf('day').toDate();
  }
  console.log(startDate, endDate, req.params.catId);
    const logs = await TimeLog.find({
      userId: req.user._id,
      category: req.params.catId, startTime: { $gte: startDate,  $lte: endDate}
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
  const { _id, category, startTime, endTime, tags  } = req.body;

  const date = moment(startTime).format('YYYY-MM-DD');
  const duration = moment(endTime).diff(moment(startTime), "minutes");

  if (!category || !startTime || !endTime) {
    return res
      .status(422)
      .send({ error: 'You must provide a category and startTime and endTime' });
  }

  try {
    const lappedLog = await TimeLog.findOne({startTime: { $lte: moment(startTime).toDate()}, endTime: { $gt: moment(startTime).toDate()}});
    if( lappedLog !== null){
      return res
          .status(422)
          .send({ error: 'You can\'t set a startTime overlapped with another log!' });
    }
    if(_id){
        // console.log('cat: ' + JSON.stringify(cat));
      await TimeLog.updateOne({_id: _id, userId: req.user._id, category: category,
        startTime: startTime, endTime: endTime, date: date, duration: duration, tags: tags });
      // await TimeCategory.findOneAndUpdate({_id: _id, userId: req.user._id}, { name: name, type: type });
        res.send({msg: 'Succeed to update!'});
    }else {
      const log = new TimeLog({userId: req.user._id, category: category,
        startTime: startTime, endTime: endTime, date: date, duration: duration, tags: tags});
      await log.save();

      const dayDuration = moment().isSame(moment(startTime), 'day') ? duration : 0;
      const weekDuration = moment().isSame(moment(startTime), 'week') ? duration : 0;
      const monthDuration = moment().isSame(moment(startTime), 'month') ? duration : 0;
      const yearDuration = moment().isSame(moment(startTime), 'year') ? duration : 0;

      await TimeCategory.findByIdAndUpdate(category, { $inc: { todayDuration: dayDuration, weekDuration: weekDuration, monthDuration: monthDuration, yearDuration: yearDuration },
      $push: {durations: duration}});

      const cat = await TimeCategory.findById(category);

          res.send({cat, log});
    }

  } catch (err) {
    console.log(err);
    res.status(422).send({ error: err.message });
  }
});

module.exports = router;
