var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose"); // using mongoose in database
// this is step 1
var session = require("express-session"); // this is step 7
// this is used to memorize the login history

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var apiIndexRouter = require("./api/routes/index");
var apiUserRouter = require("./api/routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "All@is##mfwhamf///",
    resave: false,
    saveUninitialized: true,
  }) //setting up the session in the sever
); // this is part of step 7 in index.js

mongoose.connect(
  "mongodb+srv://shinthant:shin2003@cluster0.lickxmu.mongodb.net/?retryWrites=true&w=majority"
);
var db = mongoose.connection;
db.on("error", console.error.bind("MongoDB connection errror at blogger002"));

// step1 >>  apply connection the mongodb in database
// mongoose.connect("mongodb://127.0.0.1/blogger002db");
// var db = mongoose.connection;
// db.on("error", console.error.bind("MongoDB connection errror at blogger002"));

app.use(function (req, res, next) {
  res.locals.user = req.session.user; // receive data from the index.js // session/router.post.login
  res.locals.active = req.path;
  next();
}); // this is part of step 7 >> memorizing the logined email

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", apiIndexRouter);
app.use("/api/users", apiUserRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
