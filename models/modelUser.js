const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    login: {
        type: String,
        required: true
    },
    name: {
        firstName: String,
        lastName: String
    },
    password: {
        type: String,
        required: true
    },
    addedFriends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    friendRequest: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    contacts: [{}],
    profilePicture: Buffer
    },
    {timestamp: true}
);

module.exports = mongoose.model('User', userSchema);
