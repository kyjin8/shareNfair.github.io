var createError = require('http-errors');
const express = require('express');
const session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const url = require('url');
const mime = require('mime');
const ejs = require('ejs');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var signupRouter = require('./routes/signup');
var usersRouter = require('./routes/users');
var boardRouter = require('./routes/board');
var chatRouter = require('./routes/chat');
var searchRouter = require('./routes/search');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/signup', signupRouter);
app.use('/users', usersRouter);
app.use('/board', boardRouter);
app.use('/chat', chatRouter);
app.use('/search', searchRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//image
app.use(function(req, res) {
  const parsedUrl = url.parse(request.url);
  const resource = parsedUrl.pathname;
  
  if(resource.indexOf('/images/') == 0){
    const imgPath = resource.substring(1);
    console.log('imgPath='+imgPath);
  
    const imgMime = mime.getType(imgPath);
    console.log('mime='+imgMime);
  
    fs.readFile(imgPath, function(error, data) {
      if(error){
        response.writeHead(500, {'Content-Type':'text/html'});
        response.end('500 Internal Server '+error);
      }else{
        // 6. Content-Type ??? 4????????? ????????? mime type ??? ??????
        response.writeHead(200, {'Content-Type':imgMime});
        response.end(data);
      }
    });
  } else {
    response.writeHead(404, {'Content-Type' : 'text/html'});
    response.end('404 Page Not Found');
  }
})

module.exports = app;