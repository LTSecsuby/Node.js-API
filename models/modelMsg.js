const mongoose = require('mongoose');

const msgSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    text: {
        type: String,
        required: true
    },
    currentChat: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
    },
    {timestamp: true}
);
//mongoose.set('useFindAndModify', false);

module.exports = mongoose.model('Msg', msgSchema);
