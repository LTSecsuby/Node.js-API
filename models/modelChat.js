const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    chatName: {
        type: String,
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    arrayMsg: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Msg',
        required: false
    }],
    created: {
        type: Date,
        default: Date.now
    }
    },
    {timestamp: true}
);
//mongoose.set('useFindAndModify', false);

module.exports = mongoose.model('Chat', chatSchema);
