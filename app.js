// app.js

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the database.');
    }
});

db.run('CREATE TABLE IF NOT EXISTS Volleyball_Price (date DATE NOT NULL, price INT NOT NULL, PRIMARY KEY(date))');

app.get('/api/overview', (req, res) => {
    db.all('SELECT * FROM Volleyball_Price ORDER BY date DESC LIMIT 10', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api', (req, res) => {
    let date_value = req.query.date;
    let sql = 'SELECT * FROM Volleyball_Price WHERE date = ?';
    db.all(sql, [date_value], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send(rows);
    });
});

app.get('/api/insert', (req, res) => {
    let price = req.query.price;
    let date = req.query.date;
    let sql = 'INSERT OR REPLACE INTO Volleyball_Price (date, price) VALUES (?, ?)';
    db.run(sql, [date, price], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send('Data inserted successfully');
    });
});

app.get('/api/dates', (req, res) => {
    db.all('SELECT DISTINCT date FROM Volleyball_Price', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const dates = rows.map(row => row.date);
        res.json({ dates });
    });
});

module.exports = app;
