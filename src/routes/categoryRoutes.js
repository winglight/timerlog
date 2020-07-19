const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');

const TimeCategory = mongoose.model('TimeCategory');

const router = express.Router();

router.use(requireAuth);

router.get('/categories', async (req, res) => {
  const categories = await TimeCategory.find({ userId: req.user._id });

  res.send(categories);
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await TimeCategory.findOneAndDelete({_id: req.params.id, userId: req.user._id});
    res.send({msg: 'Succeed to delete!'});
  }catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.post('/categories', async (req, res) => {
  const { _id, name, type, tags } = req.body;

  if (!name || !type) {
    return res
      .status(422)
      .send({ error: 'You must provide a name and type' });
  }

  try {
    if(_id){
        // console.log('cat: ' + JSON.stringify(cat));
      await TimeCategory.updateOne({_id: _id, userId: req.user._id}, { name: name, type: type, tags: tags });
      // await TimeCategory.findOneAndUpdate({_id: _id, userId: req.user._id}, { name: name, type: type });
        res.send({msg: 'Succeed to update!'});
    }else {
      const cat = new TimeCategory({name, type, tags, userId: req.user._id});
      await cat.save();
      res.send(cat);
    }

  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

module.exports = router;
