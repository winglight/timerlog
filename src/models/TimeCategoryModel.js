const mongoose = require('mongoose');

const timeCategoryModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['PRODUCTIVE', 'NEUTRAL', 'REST', 'WASTE'],
        default: ''
    },
    planMinutes: {
        type: Number,
        min: 0,
        default: 30
    },
    archived: {
        type: Boolean,
        default: false
    },
    todayDuration: {
        type: Number,
        min: 0,
        default: 0
    },
    weekDuration: {
        type: Number,
        min: 0,
        default: 0
    },
    monthDuration: {
        type: Number,
        min: 0,
        default: 0
    },
    month3Duration: {
        type: Number,
        min: 0,
        default: 0
    },
    month6Duration: {
        type: Number,
        min: 0,
        default: 0
    },
    yearDuration: {
        type: Number,
        min: 0,
        default: 0
    },
    allDuration: {
        type: Number,
        min: 0,
        default: 0
    },
    durations: [Number], //当天此类别日志的分钟数组
    tags: [String],
}, { timestamps: { createdAt: 'created_at' } });

mongoose.model('TimeCategory', timeCategoryModel);
