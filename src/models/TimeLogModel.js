const mongoose = require('mongoose');

const timeLogModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: {
        type: String,
        default: ''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeCategory'
    },
    catName: {
        type: String,
        default: ''
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: Date.now
    },
    date: {
        type: String,
        default: ''
    },
    duration: {
        type: Number,
        min: 0,
        default: 0
    },
    tags: [String],
}, { timestamps: { createdAt: 'created_at' } });

mongoose.model('TimeLog', timeLogModel);