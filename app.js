const express = require('express');
const fs = require('fs');
const url = require('url');
const template = require('./lib/template');
const db = require('./lib/mysql');

const app = express();

app.use(require('body-parser').urlencoded({extended: false}));
app.use(require('compression')());
app.use(require('cookie-parser')());
app.use(express.static('public'));
app.use('/account',require('./lib/account'));

app.get('/',(req,res) => {
    fs.readFile('html/index.html','utf8',(err,data) => {
        let acc = template.login;
        if (req.cookies.un) acc = template.accPage;
        res.send(data.replace('$1',acc));
    });
});

app.get('/search',(req,res) => {
    const query = url.parse(req.url,true).query.q;
    db.query('select * from docs where title = ?',[query],(err,doc) => {
        if (!doc[0]) {
            let acc = template.login;
            if (req.cookies.un) acc = template.accPage;
            res.send(template.html(query,acc,template.part('search',query)));
        }
    });
});

app.use((req,res) => {
    res.send(template.notFound);
});

app.listen(3000);