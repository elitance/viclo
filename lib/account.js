const router = require('express').Router();
const url = require('url');
const db = require('./mysql');
const template = require('./template');

router.get('/login',(req,res) => {
    const query = url.parse(req.url,true).query;
    let fail = '';
    if (query.stat === 'fail') fail = '<span class="fail">Username or password is incorrect. Try again.</span><br>';
    res.send(template.html('Login',template.part('login',fail)));
});

router.post('/login',(req,res) => {
    db.query('select * from account where un = ? and pw = ?',[req.body.un,req.body.pw],(err,data) => {
        if (!data[0]) {
            res.redirect('/account/login?stat=fail');
        } else {
            res.send(`<script>localStorage.setItem('login','${req.body.un}'); location.replace('/');</script>`);
        }
    });
});

router.get('/signup',(req,res) => {
    const query = url.parse(req.url,true).query;
    let fail = '';
    if (query.stat === 'fail') fail = '<span class="fail">Account with the same username already exists.<br>Perhaps there is your doppelgänger somewhere!</span>';
    res.send(template.html('Sign Up',template.part('signup',fail)));
})

router.post('/signup',(req,res) => {
    db.query('select * from account where un = ?',[req.body.un],(err,un) => {
        if (!un[0]) {
            db.query('insert into account (un,pw) values (?, ?)',[req.body.un,req.body.pw],(err,data) => {
                res.redirect(`/account/login`);
            });
        } else {
            res.redirect('/account/signup?stat=fail');
        }
    });
});

module.exports = router;