const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const docs = require('./lib/docs');
const acc = require('./lib/account');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.use(express.static('public'));

app.get('/',(req,res) => {
    docs.home(req,res);
});

app.get('/search',(req,res) => {
    docs.search(req,res);
});

app.get('/account',(req,res) => {
    res.redirect('/account/login');
});

app.get('/account/login',(req,res) => {
    acc.login(req,res);
});

app.post('/account/login',(req,res) => {
    acc.loginProc(req,res);
});

app.get('/account/signup',(req,res) => {
    acc.signup(req,res);
});

app.post('/account/signup',(req,res) => {
    acc.signupConfirm(req,res);
});

app.listen(3000);