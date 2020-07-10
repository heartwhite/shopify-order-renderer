var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
const xlsx = require('xlsx');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'build')));

app.post('/upload', (req, res) => {
  // app.use(express.static('public'));
  const newWB = xlsx.utils.book_new();
  const newWS = xlsx.utils.json_to_sheet(req.body.dataArray);

  xlsx.utils.book_append_sheet(newWB, newWS, 'New Data');

  const stream = xlsx.stream.to_csv(newWS);
  stream.pipe(fs.createWriteStream(`./build/${req.body.name}.csv`));

  res.send('it is ok');
  setTimeout(() => {
    fs.unlinkSync(`./build/${req.body.name}.csv`, function (err) {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log('File deleted!');
    });
  }, 60000);
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

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
