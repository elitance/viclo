const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const fs = require('fs');
const docs = require('./lib/docs');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.use(express.static('css'));

app.get('/',(req,res) => {
    fs.readFile('html/index.html','utf8',(err,data) => {
        res.send(data);
    });
});

app.get('/search',(req,res) => {
    docs.search(req,res);
})

app.listen(3000);