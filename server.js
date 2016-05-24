const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();

var db;
var username = false;
var storage =  multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({ storage : storage}).single('userEntry');

app.use(express.static(__dirname));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/dev_html'));
app.use(express.static('uploads'));

app.use(bodyParser.urlencoded({extended: true}));
// puts data from form into req.body

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

MongoClient.connect('mongodb://test:test@ds013202.mlab.com:13202/test1', function (err, database) {
    //start the server
    if (err) return console.log(err);
    db = database;

    //do this in here so that the app only starts if we have a db connection
    app.listen(3000, function () {
        console.log('listening on 3000')
    })
});


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

/*Better way to login*/
app.post('/login', function (req, res) {

    db.collection('users').find().toArray(function (err, array) {
        for (var i = 0; i < array.length; i++) {
            if ((array[i].username == req.body.username)
                && (array[i].password == req.body.password)) {
                result = true;
            }
        }
        else
            res.status(500).send("login failed");
    })
});

app.get('/whoami', (req, res) => {
    res.send(username);
});

app.get('/logout', (req, res) => {
    //TODO error when not logged in?
    username = false;
    res.status(200).send("logged out");
});

app.post('/getEntry', (req, res) => {
    //TODO why the fuck is this an array
    db.collection('entries').find( {"username": {$eq: req.body.username}, "eventName": {$eq: req.body.eventName} } ).toArray((err, result) => {
        if (err) return console.log(err);
      res.send(result);
    })
});

app.post('/getAllEntries', (req, res) => {
    db.collection('entries').find( {"eventName": req.body.eventName}, (err, result) => {
        res.send(result);
    })
});

app.post('/submitEntry', (req, res) => {
    upload(req,res,function(err) {
        if(err) {
                return res.end("Error uploading file.");
        }

        db.collection('entries').save(req.file, (err, result) => {
            if (err) return console.log(err)

        })
            //TODO do something reasonable 
            res.end("File is uploaded");
    });
});

app.post('/createEvent', (req, res) => {
    db.collection('events').save(req.body, function (err, result) {
        if (err) return console.log(err)

        console.log('New event created');
        res.redirect('/');//TODO get rid of this?
    })
});

app.get('/getAllEvents', (req, res) => {
    db.collection('events').find().toArray((err, result) => {
        if (err) return console.log(err);
      res.send(result);
    })
});

app.post("/upload", multer({dest: "./uploads/"}).array("uploads[]", 12), function (req, res) {
    res.send(req.files);
});


app.post('/register', function (req, res) {
    db.collection('users').save(req.body, function (err, result) {
        if (err) return console.log(err)

        console.log('New user registered');
        res.redirect('/');
    })
});

// 404 catch
app.all('*', (req, res) => {
    console.log(`[TRACE] Server 404 request: ${req.originalUrl}`);
    res.status(200).sendFile(__dirname + '/index.html');
});