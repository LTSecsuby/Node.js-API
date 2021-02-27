const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkAuth = require('../middleware/check-auth');

const User = require("../models/modelUser");
//const Chat = require("../models/modelChat");
//const Msg = require("../models/modelMsg");
const Message = require("../models/modelMessage");

const SECRET_WORD = 'secret';


//работает!
router.post("/friend/message", checkAuth, (req, res, next) => {
    let addMsg = false;
    User.findById(req.userData.userId).exec().then((user) => {
        if (user.addedFriends.length !== 0) {
            user.addedFriends.find((id) => {
                console.log('ID', id);
                if (JSON.stringify(id) === JSON.stringify(req.body.friend_id)) {
                    addMsg = true;
                }
            });
        }
        if (addMsg) {
            User.findById(req.body.friend_id).exec().then((friend) => {
                const post = new Message({
                    _id: new mongoose.Types.ObjectId(),
                    text: req.body.message,
                    owner: user,
                    recipient: friend
                });
                post.save().then(() => {
                    const arrayMessagesFriend = [];
                    Message.find({}).exec().then(messages => {
                        messages.find((message) => {
                            if ((JSON.stringify(message.owner._id) === JSON.stringify(req.body.friend_id) && JSON.stringify(message.recipient._id) === JSON.stringify(req.userData.userId))
                                || (JSON.stringify(message.recipient._id) === JSON.stringify(req.body.friend_id) && JSON.stringify(message.owner._id) === JSON.stringify(req.userData.userId))) {
                                if (JSON.stringify(message.recipient._id) === JSON.stringify(req.userData.userId)) {
                                    message.markRead = true;
                                    message.save();
                                }
                                arrayMessagesFriend.push(message);
                            }
                        });
                        res.status(200).json(arrayMessagesFriend);
                    }).catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({
                        message: "unknown error"
                    });
                });
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
        }
    });
});
//работает!
router.post("/friend/messages", checkAuth, (req, res, next) => {
    const arrayMessagesFriend = [];
    Message.find({}).exec().then(messages => {
        messages.find((message) => {
            if ((JSON.stringify(message.owner._id) === JSON.stringify(req.body.friend_id) && JSON.stringify(message.recipient._id) === JSON.stringify(req.userData.userId))
                || (JSON.stringify(message.recipient._id) === JSON.stringify(req.body.friend_id) && JSON.stringify(message.owner._id) === JSON.stringify(req.userData.userId))) {
                if (JSON.stringify(message.recipient._id) === JSON.stringify(req.userData.userId)) {
                    message.markRead = true;
                    message.save();
                }
                arrayMessagesFriend.push(message);
            }
        });
        res.status(200).json(arrayMessagesFriend);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
//работает!
router.get("/friends", checkAuth, (req, res, next) => {
    const arrayFriends = [];
    let isFriend = false;
    User.find({}).exec().then(users => {
        users.find((user) => {
            if (JSON.stringify(user._id) === JSON.stringify(req.userData.userId)) { return; }
            isFriend = false;
            user.addedFriends.forEach(id => {
                console.log('ID', id);
                if (JSON.stringify(id) === JSON.stringify(req.userData.userId)) { isFriend = true; }
                if (isFriend) {
                    arrayFriends.push(user);
                }
            });
        });
        res.status(200).json(arrayFriends);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
//работает!
router.get("/profile", checkAuth, (req, res, next) => {
    User.findById(req.userData.userId).exec().then(user => {
        res.status(200).json({
            user: user
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
//работает!
router.get("/friend/requests", checkAuth, (req, res, next) => {
    let arrayRequests = [];
    User.findById(req.userData.userId).exec().then(user => {
        user.friendRequest.forEach(id => {
            User.findById(id).exec().then((friend) => {
                arrayRequests.push(friend);
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            }).finally(() => {
                res.status(200).json(arrayRequests);
            });
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.get("/search/contacts", checkAuth, (req, res, next) => {
    let textContact = req.query.q;
    let arrayContacts = [];
    let isFriendReq = false;
    User.find({}).exec().then(users => {
        users.forEach(item => {
            if (JSON.stringify(item._id) === JSON.stringify(req.userData.userId)) { return; }
            isFriendReq = false;
            item.friendRequest.forEach(id => {
                if (JSON.stringify(id) === JSON.stringify(req.userData.userId)) { isFriendReq = true; }
            });
            if (item.login.toLowerCase().indexOf(textContact.toLowerCase()) === 0 && textContact.length > 0 && !isFriendReq) {
                arrayContacts.push(item);
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }).finally(() => {
        res.status(200).json(arrayContacts);
    });
});
//работает!
router.post("/signup", (req, res, next) => {
    User.find({login: req.body.login}).exec().then(user => {
        if (user.length >= 1) {
            return res.status(409).json({
                message: "exists"
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        message: "unknown"
                    });
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        login: req.body.login,
                        password: hash
                    });
                    user.save().then(() => {
                        console.log(user.login);
                        res.status(201).json({
                            login: user.login
                        });
                    }).catch(err => {
                        console.log(err);
                        res.status(500).json({
                            message: "unknown"
                        });
                    });
                }
            });
        }
    });
});

router.post("/login", (req, res, next) => {
    User.find({login: req.body.login}).exec().then().catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    User.findOne({login: req.body.login}).exec().then(user => {
        if (user === null || user.length < 1) {
            return res.status(401).json({
                message: "failed"
            });
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result) {
                const token = jwt.sign({
                        login: user.login,
                        userId: user._id
                    }, SECRET_WORD, {
                    expiresIn: 60 * 20
                });
                return res.status(200).json({
                    message: "successful",
                    token: token,
                    user: user
                });
            } else {
                return res.status(401).json({
                    message: "failed"
                });
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
//работает!
router.post("/friend", checkAuth, (req, res, next) => {
    let add = true;
    User.findById(req.body.friend_id).exec().then((friend) => {
        friend.friendRequest.find((id) => {
            console.log('ID', id);
            if (JSON.stringify(id) === JSON.stringify(req.userData.userId)) { add = false; }
        });
        friend.addedFriends.find((id) => {
            console.log('ID', id);
            if (JSON.stringify(id) === JSON.stringify(req.userData.userId)) { add = false; }
        });
        if (JSON.stringify(req.body.friend_id) === JSON.stringify(req.userData.userId)) { add = false; }
        if (add) {
            User.findById(req.userData.userId).exec().then(user => {
                friend.friendRequest.push(user._id);
                friend.save().then(() => {
                    res.status(200).json(user);
                });
            }).catch(err => {
                res.status(500).json({
                    error: err
                });
            });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post("/friend/add", checkAuth, (req, res, next) => {
    const friendId = req.body.friend_id;
    const userId = req.userData.userId;
    if (friendId === userId) {
        res.status(409).json({
            error: 'you can t add yourself'
        });
    }
    User.findById(friendId).exec().then(friend => {
        if (!friend.addedFriends.includes(userId)) {
            friend.addedFriends.push(userId);
        }
        friend.save();
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    User.findById(userId).exec().then(user => {
        if (!user.addedFriends.includes(friendId)) {
            user.addedFriends.push(friendId);
        }
        if (user.friendRequest.includes(friendId)) {
            user.friendRequest.pull(friendId);
        }
        user.save().then(() => {
            res.status(200).json(user);
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post("/friend/skip", checkAuth, (req, res, next) => {
    User.findById(req.userData.userId).exec().then((user) => {
        if (user.friendRequest.length !== 0) {
            user.friendRequest = user.friendRequest.filter(id => JSON.stringify(id) !== JSON.stringify(req.body.friend_id));
            user.save().then(() => {
                res.status(200).json(user);
            });
        }
        res.status(200).json(user);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post("/friend/delete", checkAuth, (req, res, next) => {
    const friendId = req.body.friend_id;
    const userId = req.userData.userId;
    if (friendId === userId) {
        res.status(409).json({
            error: 'you can t delete yourself'
        });
    }
    User.findById(friendId).exec().then(friend => {
        if (friend.addedFriends.includes(userId)) {
            friend.addedFriends.pull(userId);
        }
        friend.save();
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    User.findById(userId).exec().then(user => {
        if (user.addedFriends.includes(friendId)) {
            user.addedFriends.pull(friendId);
        }
        user.save().then(() => {
            res.status(200).json(user);
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;
