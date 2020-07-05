const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkAuth = require('../middleware/check-auth');

const User = require("../models/modelUser");
const Message = require("../models/modelMessage");

const SECRET_WORD = 'secret';



router.post("/friend/message", checkAuth, (req, res, next) => {

    let addMsg = false;

    User.findById(req.userData.userId)
        .exec()
        .then((user) => {
            if (user.addedFriends !== null) {
                user.addedFriends.find((elem) => {
                    if (elem.login === req.query.q) {
                        addMsg = true;
                    }
                });
            }
            if (addMsg) {

                User.find({login: req.query.q})
                    .exec().then((user) => {

                    const post = new Message({
                        _id: new mongoose.Types.ObjectId(),
                        ownerLogin: req.userData.login,
                        text: req.body.message,
                        owner: req.userData.userId,
                        recipient: user[0]._id
                    });

                    post
                        .save()
                        .then(() => {
                            User.findById(req.userData.userId)
                                .exec()
                                .then((user) => {
                                    res.send(user);
                                });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                message: "unknown error"
                            });
                        });
                })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
            if (!addMsg) res.send('message not add');
        });
});

router.get("/friend/messages", checkAuth, (req, res, next) => {

    let idFriend = '';
    let arrayMessagesFriend = [];

    User.find({login: req.query.q})
        .exec()
        .then(user => {
            user.find((elem) => {
                idFriend = elem._id;
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

    Message.find({recipient: req.userData.userId})
        .exec()
        .then(message => {
            message.find((elem) => {
                if (JSON.stringify(elem.owner) === JSON.stringify(idFriend)) {
                    arrayMessagesFriend.push(elem);
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

    User.findById(req.userData.userId)
        .exec()
        .then(user => {
            res.status(200).json({
                messages: arrayMessagesFriend
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get("/friend/messageLog", checkAuth, (req, res, next) => {

    let idFriend = '';
    let arrayMessageLog = [];

    User.find({login: req.query.q})
        .exec()
        .then(user => {
            user.find((elem) => {
                idFriend = elem._id;
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

    Message.find({owner: req.userData.userId})
        .exec()
        .then(message => {
            message.find((elem) => {
                if (JSON.stringify(elem.recipient) === JSON.stringify(idFriend)) {
                    arrayMessageLog.push(elem);
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

    User.findById(req.userData.userId)
        .exec()
        .then(user => {
            res.status(200).json({
                messages: arrayMessageLog
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get("/profile", checkAuth, (req, res, next) => {

    User.findById(req.userData.userId)
        .exec()
        .then(user => {
            res.status(200).json({
                user: user
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get("/friends", checkAuth, (req, res, next) => {
    let arrayFriends = [];

    User.findById(req.userData.userId)
        .exec()
        .then(user => {

            let size = 0;
            user.addedFriends.forEach(function (friend) {

                User.findOne({login: friend.login})
                    .then(friend => {
                        arrayFriends.push({login: friend.login});
                        size++;
                        if (user.addedFriends.length === size) {
                            res.status(200).json({
                                friends: arrayFriends
                            });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            });
        });
});

router.get("/search/contacts", checkAuth, (req, res, next) => {

    let textContact = req.query.q;
    let arrayContacts = [];

    User.find({})
        .exec()
        .then(user => {
            user.forEach( item => {
               if (item.login === req.userData.login) { return; }
               if (item.login.indexOf(textContact) === 0 && textContact.length > 0) {
                   arrayContacts.push({ login: item.login });
               }
            });
            res.status(200).json({
                contacts: arrayContacts
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post("/signup", (req, res, next) => {
    User.find({login: req.body.login})
        .exec()
        .then(user => {
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
                        user
                            .save()
                            .then(() => {
                                console.log(user.login)
                                res.status(201).json({
                                    login: user.login
                                });
                            })
                            .catch(err => {
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
    User.find({login: req.body.login})
        .exec().then()
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    User.find({login: req.body.login})
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "failed"
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "failed"
                    });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            login: user[0].login,
                            userId: user[0]._id
                        },
                        SECRET_WORD,
                        {
                            expiresIn: 60 * 20
                        }
                    );
                    return res.status(200).json({
                        message: "successful",
                        token: token,
                        user: user
                    });
                }
                res.status(401).json({
                    message: "failed"
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post("/friend", checkAuth, (req, res, next) => {

    let add = true;

    User.findOne({login: req.body.friend})
        .exec().then((user) => {
            user.friendRequest.find((elem) => {
                if (elem.login === req.userData.login) {
                    add = false;
                }
            });

            user.addedFriends.find((elem) => {
                if (elem.login === req.userData.login) {
                    add = false;
                }
            });

            if (req.body.friend === req.userData.login) {
                add = false;
            }

            if (add) {
                User.findOneAndUpdate({login: req.body.friend}, {$push: {friendRequest: {login: req.userData.login}}})
                    .exec().then(() => {
                    User.findById(req.userData.userId)
                        .exec().then(user => {
                        res.send(user);
                    });
                })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
            }
            if (!add) res.send('user not added');
        }
    )
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post("/friend/add", checkAuth, (req, res, next) => {

    let add = true;

    User.findById(req.userData.userId)
        .exec()
        .then((user) => {
            if (user.addedFriends !== null) {
                user.addedFriends.find((elem) => {
                    if (elem.login === req.body.friend) {
                        User.findByIdAndUpdate({_id: req.userData.userId}, {$pull: {friendRequest: {login: req.body.friend}}})
                            .exec().then();
                        add = false;
                    }
                });
            }
            if (add) {

                User.findOneAndUpdate({login: req.body.friend}, {$push: {addedFriends: {login: req.userData.login}}})
                    .exec().then();
                User.findByIdAndUpdate({_id: req.userData.userId}, {$pull: {friendRequest: {login: req.body.friend}}})
                    .exec().then();
                User.findByIdAndUpdate({_id: req.userData.userId}, {$push: {addedFriends: {login: req.body.friend}}})
                    .exec().then(() => {
                    User.findById(req.userData.userId)
                        .exec().then(user => {
                        res.send(user);
                    });
                })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
            if (!add) res.send('friend not added');
        });
});

router.post("/friend/skip", checkAuth, (req, res, next) => {

    let skip = true;

    User.findById(req.userData.userId)
        .exec()
        .then((user) => {
            if (user.addedFriends !== null) {
                user.addedFriends.find((elem) => {
                    if (elem.login === req.body.friend) {
                        skip = false;
                    }
                });
            }
            if (skip) {

                User.findByIdAndUpdate({_id: req.userData.userId}, {$pull: {friendRequest: {login: req.body.friend}}})
                    .exec().then(() => {
                    User.findById(req.userData.userId)
                        .exec().then(user => {
                        res.send(user);
                    });
                })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
            if (!skip) res.send('friend not skipped');
        });
});

router.delete("/friend", checkAuth, (req, res, next) => {

    let remove = false;

    User.findById(req.userData.userId)
        .exec()
        .then((user) => {
            if (user.addedFriends !== null) {
                user.addedFriends.find((elem) => {
                    if (elem.login === req.query.q) {
                        remove = true;
                    }
                });
            }
            if (remove) {

                User.findOneAndUpdate({login: req.query.q}, {$pull: {addedFriends: {login: req.userData.login}}})
                    .exec().then();
                User.findByIdAndUpdate({_id: req.userData.userId}, {$pull: {addedFriends: {login: req.query.q}}})
                    .exec().then(() => {
                    User.findById(req.userData.userId)
                        .exec().then(user => {
                        res.send(user);
                    });
                })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
            if (!remove) res.send('friend not delete');
        });
});

router.delete("/:userId", checkAuth, (req, res, next) => {
    //////delete her friends
    User.deleteOne({_id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User deleted"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;
