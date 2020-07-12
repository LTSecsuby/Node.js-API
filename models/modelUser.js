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
        login: String
    }],
    friendRequest: [{
        login: String
    }],
    contacts: [{}],
    profilePicture: Buffer
    },
    {timestamp: true}
);

module.exports = mongoose.model('User', userSchema);
