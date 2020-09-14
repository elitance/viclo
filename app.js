const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const fs = require('fs');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.use(express.static('css'));

app.get('/',(req,res) => {
    fs.readFile('html/index.html','utf8',(err,data) => {
        res.send(data);
    });
});

app.listen(3000);