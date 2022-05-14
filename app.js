const express = require("express");
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const app = express();

dotenv.config({ path: './.env' });


const mysql = require("mysql");

const db = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    user     : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASS,
    database : process.env.DATABASE
});


//parse url-encoded bodies sent from html forms
app.use(express.urlencoded({ extended: false}));
//parse JSON bodies sent from api clients
app.use(express.json());
app.use(cookieParser());


app.set('view engine', 'hbs');


const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));


db.connect(function(error) {
    if(error) {
        console.log('Error connecting database')
    } else {
        console.log("MYSQL Connected...")
    }
});

//define routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(5002, () => {
    console.log("Server at 5002");
})