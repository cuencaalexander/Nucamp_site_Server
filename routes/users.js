const express = require('express');
const User = require('../models/user');
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
//ALL THIS ROUTES ARE /USER/..SIGNUP OR LOGIN, ETC
router.post('/signup', (req, res, next) => {
  User.findOne({ username: req.body.username })//checking if there are already any existing docs with the same name that the client has entered/requested in req.body
    .then(user => {
      if (user) {//if truthy then a user with that name was found, the user doc was probably returned
        const err = new Error(`User ${req.body.username} already exists!`)
        err.status = 403;
        return next(err);
      } else {//we create a user doc
        User.create({//we dont pass admin, THF its default values is used. Leaving it out blocks the user from sending the admin:true so they dont become admins.
          username: req.body.username,
          password: req.body.password
        })
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ status: 'Registration Succesful!', user: user });
          })
          .catch(err => next(err));
      }
    })
    .catch(err => next(err));//if err doesnt mean no user was found, its just an err. Just pass that err to the Express err handler
});
//(route, middlewre fn)
router.post('/login', (req, res, next) => {
  //check if user is already logged in, that is is its been authenticated already
  if (!req.session.user) {//req.session already filled in if the req headers contained a cookie w an exisiting session ID
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }//authHeader returns the encoded res "Basic YDKSNDNSKL...", the second part is ENCODED in base64 string. First we decode the 2nd part of this String by using ", base64" into a string of utf8?.
    //THen we get a string admin:pass...
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];
//check the user name and pass the user is sending us against the user doc we have in db
    User.findOne({username: username})//findOne method in the users collection
    .then(user => {
      if(!username) {
        const err = new Error(`User ${username} does not exist!`);
        err.status = 401;
        return next(err);
      } else if (user.password !== password) {
        const err = new Error('Your password is incorrect!');
        err.status = 401;
        return next(err)
      } else if (user.username === username && user.password === password) {
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated!')
      }
    })
    .catch(err => next(err));
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.send('You are already authenticated!')
  }
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();//the session file and its ID will be be destroyed on the server side.If client trues to auth w that sessionID the server wont recognizeit as a a valid session
    res.clearCookie('session-id');//(session we configures in app.js) will clear that cookie stored on the client.
    res.redirect('/');//redirects client to root path, localho..
  } else {
    const err = new Error('You are not logged in!')
    err.status = 401;
    return next(err);
  }
});

module.exports = router;
