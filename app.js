var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);//1st 1 returns a fn, now that fn is called immediiately with the arg(session)

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';

const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err)//another way to handle errors, pass a 2nd arg
);//1st arg handles the resolved case, 2nd handles rejected case.

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890'));//Sign the cookie that is sent from the server to the client|Conflict btw cookieP and ExpressS, which has its own cookies
//After the client has sent authentication credentials then we'll send to the client a cookie and well set it up here so the client can use that cookie instead to gain access
app.use(session({//this session middleware will automatically add a prop called SESSION to the REQ message
  name: 'session-id',
  secret: '12345-67890',
  saveUninitialized: false,//If no change is made to the session, then at end of req it wont get saved due to being an empty session, also no cookie will be sent to client
  resave: false,//once session has been created, updated and saved it'll continue to be resaved whenever a req is made for that session, even if no updates in req. This keeps session active, so it doesnt get deleted
  store: new FileStore()//save info to hard disk instead of the running app memory
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);

//This is where we'll add authentication //If we pass the err to next(), express will handle sending the err and auth req back to the client //Because we set the res header to the req auth, the server will send the err message and ALSO will CHALLENGE the client for credentials.
//If client responds ot the the challenge, the res will comeback to this auth fn and the process will begin again.
function auth(req, res, next) {
  console.log(req.session)
  // console.log(req.headers);
  if (!req.session.user) {
    // const authHeader = req.headers.authorization; Now handled by through the user router
    // if (!authHeader) {
      const err = new Error('You are not authenticated!');
      // res.setHeader('WWW-Authenticate', 'Basic');No need to reAuthenticate?
      err.status = 401;
      return next(err);
  } else {
    if (req.session.user === 'authenticated') {
      return next();//Grant ACCESS
    } else {
      const err = new Error('You are not authenticated!!');
      // res.setHeader('WWW-Authenticate', 'Basic'); No need to challenge again
      err.status = 401;
      return next(err);
    }
  }
}

app.use(auth);
//Now that we have a way to have users register we want them to be able to access the USERS router before they get challenged to authenticate. So if they have no accout they can create ONE and ask for the indexRouter
app.use(express.static(path.join(__dirname, 'public')));//1st middleware function where we send smt to the client, USED to be now it's usersRouter?
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
