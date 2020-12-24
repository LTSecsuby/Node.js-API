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
            user.addedFriends.find((elem) => {
                if (JSON.stringify(elem._id) === JSON.stringify(req.body.friend_id)) {
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
                    res.status(200).json(user);
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
router.get("/search/contacts", checkAuth, (req, res, next) => {

    let textContact = req.query.q;
    let arrayContacts = [];
    let isFriendReq = false;

    User.find({}).exec().then(users => {
        users.forEach(item => {
            if (JSON.stringify(item._id) === JSON.stringify(req.userData.userId)) { return; }
            isFriendReq = false;
            item.friendRequest.forEach(elem => {
                if (JSON.stringify(elem._id) === JSON.stringify(req.userData.userId)) { isFriendReq = true; }
            });
            if (item.login.toLowerCase().indexOf(textContact.toLowerCase()) === 0 && textContact.length > 0 && !isFriendReq) {
                arrayContacts.push(item);
            }
        });
        User.findById(req.userData.userId).exec().then(user => {
            user.contacts = arrayContacts;
            res.status(200).json(user);
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
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
//работает!
router.post("/login", (req, res, next) => {
    User.find({login: req.body.login}).exec().then().catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    User.findOne({login: req.body.login}).exec().then(user => {
        if (user.length < 1) {
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
        friend.friendRequest.find((elem) => {
            if (JSON.stringify(elem._id) === JSON.stringify(req.userData.userId)) { add = false; }
        });
        friend.addedFriends.find((elem) => {
            if (JSON.stringify(elem._id) === JSON.stringify(req.userData.userId)) { add = false; }
        });
        if (JSON.stringify(req.body.friend_id) === JSON.stringify(req.userData.userId)) { add = false; }
        if (add) {
            User.findById(req.userData.userId).exec().then(user => {
                friend.friendRequest.push(user);
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
//работает!
router.post("/friend/add", checkAuth, (req, res, next) => {
    let add = true;
    User.findById(req.userData.userId).exec().then((user) => {
        if (user.addedFriends.length !== 0) {
            user.addedFriends.find((elem) => {
                if (JSON.stringify(elem._id) === JSON.stringify(req.body.friend_id)) {
                    User.findById(req.body.friend_id).exec().then(friend => {
                        User.findByIdAndUpdate(req.userData.userId, {$pull: {friendRequest: friend}}).exec().then();
                        add = false;
                    });
                }
            });
        }
        if (add) {
            User.findByIdAndUpdate(req.body.friend_id, {$push: user}).exec().then((friend => {
                User.findByIdAndUpdate(req.userData.userId, {$pull: {friendRequest: friend}}).exec().then();
                User.findByIdAndUpdate(req.userData.userId, {$push: {addedFriends: friend}}).exec().then(() => {
                    User.findById(req.userData.userId).exec().then(user => {
                        res.status(200).json(user);
                    });
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
            }));
        }
        if (!add) res.send('friend not added');
    });
});
//работает!
router.post("/friend/skip", checkAuth, (req, res, next) => {
    User.findById(req.userData.userId).exec().then((user) => {
        if (user.friendRequest.length !== 0) {
            user.friendRequest = user.friendRequest.filter(elem => JSON.stringify(elem._id) !== JSON.stringify(req.body.friend_id));
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
//работает!
router.post("/friend/delete", checkAuth, (req, res, next) => {
    User.findById(req.userData.userId).exec().then((user) => {
        if (user.addedFriends.length !== 0) {
            User.findById(req.body.friend_id).exec().then((friend) => {
                friend.addedFriends = friend.addedFriends.filter(elem => JSON.stringify(elem._id) !== JSON.stringify(req.userData.userId));
                friend.save().then(() => {
                    user.addedFriends = user.addedFriends.filter(elem => JSON.stringify(elem._id) !== JSON.stringify(req.body.friend_id));
                    user.save().then(() => {
                        res.status(200).json(user);
                    });
                });
            }).catch(err => {
                console.log(err);
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

module.exports = router;
