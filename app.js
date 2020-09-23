const http = require('http');
const https = require('https');
const express = require('express');
const fs = require('fs');
const url = require('url');
const template = require('./lib/template');
const db = require('./lib/mysql');

const app = express();
const privateKey = fs.readFileSync('/Certbot/live/viclo.elitance.dev/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/Certbot/live/viclo.elitance.dev/cert.pem', 'utf8');
const ca = fs.readFileSync('/Certbot/live/viclo.elitance.dev/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca
};

app.use(express.urlencoded({extended: true}));
app.use(require('compression')());
app.use(require('cookie-parser')());
app.use(require('helmet')());
require('./lib/session')(app);
app.use(express.static('public'));
const passport = require('./lib/passport')(app);
app.use('/account',require('./routes/account')(passport));
app.use('/docs',require('./routes/docs'));

app.get('/',(req,res) => {
    fs.readFile('html/index.html','utf8',(err,data) => {
        console.log(req.user);
        res.send(data.replace('#$1',template.accLink(req.user)));
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
            res.send(template.html(query,template.part('noResult',[query]),req));
        } else {
            if (searchResults.length > 1) {
                res.send(template.html(query,`<div class='content'><h1>Search results for '${query}'</h1>${template.listData(searchResults)}</div>`,req));
            } else {
                res.redirect(`/docs/${searchResults[0][0]}`);
            }
        }
    });
});

app.get('/contributors',(req,res) => {
    res.send(template.html('Contributors',template.part('contrib'),req));
});

app.get('/contact',(req,res) => {
    res.send(template.html('Contact',template.part('contact'),req));
});

app.use((req,res) => {
    res.send(template.html('Not Found',template.part('notFound'),req));
});

if (process.argv[2] === '-p') {
    http.createServer(app).listen(80);
    https.createServer(credentials,app).listen(443,() => {console.log('Production server running!')});
} else if (!process.argv[2]) {
    app.listen(80,'localhost',() => {console.log('Development server running!')});
}