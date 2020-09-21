const express = require('express');
const fs = require('fs');
const url = require('url');
const template = require('./lib/template');
const db = require('./lib/mysql');

const app = express();
const host = fs.readFileSync('profile.txt','utf8').split(',')[2];

app.use(require('body-parser').urlencoded({extended: false}));
app.use(require('compression')());
app.use(require('cookie-parser')());
app.use(require('helmet')());
require('./lib/session')(app);
app.use(express.static('public'));
app.use('/account',require('./routes/account'));
app.use('/docs',require('./routes/docs'));

app.get('/',(req,res) => {
    fs.readFile('html/index.html','utf8',(err,data) => {
        console.log(req.session.pw);
        res.send(data.replace('#$1',template.accLink(req.session.un)));
    });
});

app.get('/search',(req,res) => {
    const query = url.parse(req.url,true).query.q.toLowerCase();
    let searchResults = new Array();
    db.query('select * from docs',(err,docs) => {
        docs.forEach((doc) => {
            template.parse(doc.keywords).forEach((keyword) => {
                if (keyword === query) searchResults.push([doc.id,doc.title,doc.content]);
            });
        });
        if (!searchResults[0]) {
            res.send(template.html(query,template.accLink(req.session.un),template.part('noResult',[query])));
        } else {
            if (searchResults.length > 1) {
                res.send(template.html(query,template.accLink(req.session.un),`<div class='content'><h1>Search results for '${query}'</h1>${template.listData(searchResults)}</div>`));
            } else {
                res.redirect(`/docs/${searchResults[0][0]}`);
            }
        }
    });
});

app.get('/contributors',(req,res) => {
    res.send(template.html('Contributors',template.accLink(req.session.un),template.part('contrib')));
});

app.get('/contact',(req,res) => {
    res.send(template.html('Contact',template.accLink(req.session.un),template.part('contact')));
});

app.use((req,res) => {
    res.send(template.html('Not Found',template.accLink(req.session.un),template.part('notFound')));
});

app.listen(80);