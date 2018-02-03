var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//SQL setup
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host  : "localhost",
  user  : "admin",
  password: 'admin',
  database: 'fresh-prints_db',
  port: 3306
});

console.log("connecting to Fresh-Prints MySQL DB...");
connection.connect(function(err, results) {
        if (err) {
            console.log("ERROR: " + err.message);
            throw err;
        }
        console.log("connected to DB.");

        connection.query('CREATE TABLE IF NOT EXISTS Project (' +
            ' Project_id int NOT NULL AUTO_INCREMENT,' +
            ' Project_name VARCHAR(100) NOT NULL,' +
            ' Project_content VARCHAR(5000),' +
            ' PRIMARY KEY(Project_id))',
            function(err, result) {
                if (err) {
                    console.log(err);
                } else {}
            });

});
//Image Upload setup
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

// var index = require('./routes/index');
// var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', index);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');


//HTTP Server Routes

  app.post('/upload', upload.single('file'));

  app.get("/projectList", function(req, res) {
        connection.query('SELECT * from Project', function(err, rows, fields) {
            if (!err) {  
                res.json(rows);  
                res.end(); 
            } 
            else {console.log('Error while performing query');}
        });
    });

    app.post("/insertProject", function(req, res) {

          var returnProjectID = function() {
              connection.query('SELECT Project_id from Project where Project_name = "' + req.body.name + '"', function(err, rows, fields) { 
                  if (!err) {  
                      res.send(rows[0]);  
                      res.end(); 
                  } else console.log(err);
              })
          };

          if (req.body.projectid == null || req.body.projectid == "null") {
              connection.query('insert into Project (Project_name, Project_content) ' +
                  'values (?,?)', [req.body.name, req.body.content],
                  function(err, rows, fields) { 
                      if (!err) {  // return new project ID
                           
                          returnProjectID(); 
                      } 
                      else  console.log(err);
                  });
          } else {
              connection.query('UPDATE Project SET Project_name="' + req.body.name + '"' + ', Project_content=' + JSON.stringify(req.body.content) + ' WHERE Project_id=' +
                  req.body.projectid,
                  function(err, rows, fields) { 
                      if (!err) returnProjectID(); 
                      else console.log(err);
                  });
          }
      });
});

module.exports = app;
