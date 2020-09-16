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
app.use('/docs',require('./lib/docs'));

app.get('/',(req,res) => {
    fs.readFile('html/index.html','utf8',(err,data) => {
        let acc = template.login;
        if (req.cookies.un) acc = template.accPage;
        res.send(data.replace('$1',acc));
    });
});

app.get('/search',(req,res) => {
    const query = url.parse(req.url,true).query.q;
    let searchResults = new Array();
    db.query('select * from docs',(err,docs) => {
        docs.forEach((doc) => {
            template.parse(doc.keywords).forEach((keyword) => {
                if (keyword === query) searchResults.push([doc.id,doc.title,doc.content]);
            });
        });
        let acc = template.login;
        if (req.cookies.un) acc = template.accPage;
        if (!searchResults[0]) {
            res.send(template.html(query,acc,template.part('search',query)));
        } else {
            if (searchResults.length > 1) {
                res.send(template.html(query,acc,`<div class='content'><h1>Search results for '${query}'</h1>${template.listData(searchResults)}</div>`));
            } else {
                res.redirect(`/docs/${searchResults[0][0]}`);
            }
        }
    });
});

app.get('/contrib',(req,res) => {
    let acc = template.login;
    if (req.cookies.un) acc = template.accPage;
    res.send(template.html('Contributors',acc,template.part('contrib','')));
})

app.use((req,res) => {
    res.send(template.notFound);
});

app.listen(80,fs.readFileSync('profile.txt','utf8').split(',')[2]);