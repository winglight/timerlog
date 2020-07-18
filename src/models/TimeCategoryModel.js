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
    yearDuration: {
        type: Number,
        min: 0,
        default: 0
    },
    durations: [Number],
}, { timestamps: { createdAt: 'created_at' } });

mongoose.model('TimeCategory', timeCategoryModel);
