const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    text: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    markRead: {
        type: Boolean,
        default: false
    }
    },
    {timestamp: true}
);
//mongoose.set('useFindAndModify', false);

module.exports = mongoose.model('Message', messageSchema);
