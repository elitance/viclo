const router = require('express').Router();
const url = require('url');
const db = require('./mysql');
const template = require('./template');

router.get('/',(req,res) => {
    const query = url.parse(req.url,true).query;
    let stat = '';
    if (!req.session.un) {
        res.redirect('/account/login');
        return;
    }
    if (query.stat === 'fail') {
        stat = '<span class="fail">Verification failed. Try again.</span>';
    } else if (query.stat === 'success') {
        stat = '<span class="success">Username & password successfully changed.</span>'
    } else if (query.stat === 'overlap') {
        stat = '<span class="fail">Account with the same username exists. Try another username.</span>';
    }
    res.send(template.html('Manage Account',template.accLink(req.session.un),template.part('manage',[req.session.un,stat])));
});

router.post('/',(req,res) => {
    if (req.body.nPw !== '') {
        if (req.session.pw === req.body.pw) {
            db.query('select * from account where un = ?',[req.body.un],(err,data) => {
                if (!data[0] || data[0].un === req.session.un) {
                    db.query('update account set pw = ?, un = ? where un = ?',[req.body.nPw,req.body.un,req.session.un],(err,data) => {
                        template.editAuthor(req.session.un,req.body.un);
                        req.session.un = req.body.un;
                        req.session.pw = req.body.nPw;
                        res.redirect('/account?stat=success');
                    });
                } else {
                    res.redirect('/account?stat=overlap');
                }
            });
        } else {
            res.redirect('/account?stat=fail');
        }
    } else {
        if (req.session.pw === req.body.pw) {
            db.query('select * from account where un = ?',[req.body.un],(err,data) => {
                if (!data[0]) {
                    db.query('update account set un = ? where un = ?',[req.body.un,req.session.un],(err,data) => {                            
                        template.editAuthor(req.session.un,req.body.un);
                        req.session.un = req.body.un;
                        res.redirect('/account?stat=success');
                    });
                } else {
                    res.redirect('/account?stat=overlap');
                }
            });
        } else {
            res.redirect('/account?stat=fail');
        }
    }
});

router.get('/login',(req,res) => {
    const query = url.parse(req.url,true).query;
    let fail = '';
    if (query.stat === 'fail') fail = '<span class="fail">Username or password is incorrect. Try again.</span><br>';
    if (req.session.un) {
        res.send(template.html('Login',template.accLink(req.session.un),template.part('already')));
        return;
    }
    res.send(template.html('Login',template.accLink(req.session.un),template.part('login',[fail])));
});

router.post('/login',(req,res) => {
    db.query('select * from account where un = ? and pw = ?',[req.body.un,req.body.pw],(err,data) => {
        if (!data[0]) {
            res.redirect('/account/login?stat=fail');
        } else {
            if (req.body.keep === 'on') req.session.cookie.maxAge = 31536000000;
            req.session.un = req.body.un;
            req.session.pw = req.body.pw;
            res.redirect('/');
        }
    });
});

router.get('/signup',(req,res) => {
    const query = url.parse(req.url,true).query;
    let fail = '';
    if (query.stat === 'fail') fail = '<span class="fail">Account with the same username already exists.<br>Perhaps there is your doppelgänger somewhere!</span>';
    if (req.session.un) {
        res.send(template.html('Sign Up',template.accLink(req.session.un),template.part('already')));
        return;
    } 
    res.send(template.html('Sign Up',template.accLink(req.session.un),template.part('signup',[fail])));
});

router.post('/signup',(req,res) => {
    db.query('select * from account where un = ?',[req.body.un],(err,un) => {
        if (!un[0]) {
            db.query('insert into account (un,pw) values (?, ?)',[req.body.un,req.body.pw],(err,data) => {
                res.redirect('/account/login');
            });
        } else {
            res.redirect('/account/signup?stat=fail');
        }
    });
});

router.get('/logout',(req,res) => {
    res.clearCookie('un');
    res.redirect('/');
});

router.post('/verify',(req,res) => {
    if (req.body.manage) {
        res.send(template.verify('/account',`<input type='hidden' name='un' value='${req.body.un}'><input type='hidden' name='nPw' value='${req.body.nPw}'>`));
    } else {
        res.send(template.verify('/account/delete',`<input type='hidden' name='un' value='${req.session.un}'>`));
    }
});

router.post('/delete',(req,res) => {
    if (req.session.pw === req.body.pw) {
        db.query('delete from account where un = ?',[req.body.un],(err,data) => {
            template.editAuthor(req.session.un,'[Deleted Account]');
            res.clearCookie('un');
            res.redirect('/');
        });
    } else {
        res.redirect('/account?stat=fail');
    }
});

module.exports = router;