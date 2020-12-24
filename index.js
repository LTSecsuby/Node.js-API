const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./routes/routerUsers');

const api = express();

mongoose.connect(`mongodb+srv://root:rootroot123@cluster0.51os8.mongodb.net/db?retryWrites=true&w=majority`, {useUnifiedTopology: true, useNewUrlParser: true});
//mongoose.connect('mongodb://localhost:27017/users-db', {useUnifiedTopology: true, useNewUrlParser: true});


api.use(bodyParser.urlencoded({ extended: false }));
api.use(bodyParser.json());

api.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

api.use("/user", userRoutes);

api.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

api.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


api.listen(8000, () => {
    console.log('server start');
});
















/*
api.get("/api/users", (req, res) => {
    User.find({})
        .then(users => {
            res.send(users);
        });
});

api.get("/api/users/user/:id", (req, res) => {
    User.findOne({_id: req.params.id})
        .then(user => {
            res.send(user);
        });
});

api.get("/api/users/user", (req, res) => {
    User.findOne({login: req.query.q})
        .then(user => {
            res.send(user);
        });
});

api.get("/api/users/user/:userId/posts/:recipientId", (req, res) => {

    Post.find({
        author: req.params.userId,
        recipient: req.params.recipientId
    })
        .then(posts => {
            res.send(posts);
        });
});

api.post("/api/users/user", (req, res) => {
    let newUser = new User(req.body);
    //newUser.idFriends.push({});
    newUser.save().then(result => {
        console.log(result);
    })
        .catch(err => console.log(err));

    res.status(201).json({
        createdUser: newUser
    })
});


api.put("/api/users/user", (req, res) => {

    let add = true;

    User.findOne({login: req.query.q})
        .then((user) => {
                user.friendRequest.find((elem) => {
                    if (elem.login === req.query.user || req.query.q === req.query.user) {
                        add = false;
                    }
                });

                user.addedFriends.find((elem) => {
                    if (elem.login === req.query.user) {
                        add = false;
                    }
                });

                if (add) {
                    User.findOneAndUpdate({login: req.query.q}, {$push: {friendRequest: {login: req.query.user}}})
                        .then(user => {
                            res.send(user);
                        });
                }
                if (!add) res.send('user not added');
            }
        );
});

api.put("/api/users/user/add", (req, res) => {

    let add = true;

    User.findOne({login: req.query.user})
        .then((user) => {
                if (user.addedFriends !== null) {
                    user.addedFriends.find((elem) => {
                        if (elem.login === req.query.q) {
                            add = false;
                        }
                    });
                }
                if (add) {
                    User.findOneAndUpdate({login: req.query.user}, {$push: {addedFriends: {login: req.query.q}}})
                        .then(() => {
                            User.findOneAndUpdate({login: req.query.user}, {$pull: {friendRequest: {login: req.query.q}}})
                                .then(user => {
                                    res.send(user);
                                });
                        });
                }
                if (!add) res.send('user not added');
            }
        );
});

api.put("/api/users/user/skip", (req, res) => {

    let skip = true;

    User.findOne({login: req.query.user})
        .then((user) => {
                if (user.addedFriends !== null) {
                    user.addedFriends.find((elem) => {
                        if (elem.login === req.query.q) {
                            skip = false;
                        }
                    });
                }
                if (skip) {
                    User.findOneAndUpdate({login: req.query.user}, {$pull: {friendRequest: {login: req.query.q}}})
                        .then(user => {
                            res.send(user);
                        });

                }
                if (!skip) res.send('user not skipped');
            }
        );
});
*/

/*api.post("/api/users/user/:userId/:recipientId", (req, res)=> {

    let newPost = new Post(req.body);
    newPost.author = req.params.userId;
    newPost.recipient = req.params.recipientId;
    newPost.save().then(result => {
        console.log(result);
    })
        .catch(err => console.log(err));
    res.status(201).json({
        createdPost: newPost
    })
});*/

/*api.post("/api/users/:id/post", (req, res)=> {

    let newUser = new User(req.body);
    newUser.save(function (err) {
        if (err) throw err;
        console.log('User successfully saved.');

        let newPost = new Post({
            title: 'It`s my first post',
            text: 'Hello world!!',
            author: newUser._id,
            recipient: ''
        });

        newPost.save(function (err) {
            if (err) throw err;
            console.log('Post successfully saved.');
        });
    });
});*/


/*const Schema = mongoose.Schema;
const UserSchema = new Schema({
   name: String,
   photos: {small: String},
   posts: [{body: String, date: Date}]
});
const User = mongoose.model('user', UserSchema);*/


/*

api.get("/api/users", (req, res)=> {
   User.find({})
       .then(user => {
          res.send({users: user});
       });
});

api.get("/api/users/:id", (req, res)=> {
    User.findOne({_id: req.params.id})
        .then(user => {
            res.send({users: [user]});
        });
});

api.get("/api/users/:id/posts", (req, res)=> {
    User.findOne({_id: req.params.id})
        .then(user => {
            res.send({posts: user.posts});
        });
});

api.post("/api/users", (req, res)=> {
   User.create(req.body)
       .then(user => {
          res.send(user);
       });
});

api.put("/api/users/:id/post", (req, res)=> {
    User.findByIdAndUpdate({_id: req.params.id}, req.body)
        .then(() => {
            User.findOne({_id: req.params.id})
                .then(user => {
                    res.send(user);
                });
        });
});

api.put("/api/users/:id", (req, res)=> {
   User.findByIdAndUpdate({_id: req.params.id}, req.body)
       .then(() => {
          User.findOne({_id: req.params.id})
              .then(user => {
                 res.send(user);
              });
       });
});

api.delete("/api/users/:id", (req, res)=> {
   User.deleteOne({_id: req.params.id})
       .then(user => {
          res.send(user);
       });
});
*/

