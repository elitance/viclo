const router = require('express').Router();
const url = require('url');
const db = require('./mysql');
const template = require('./template');

router.get('/',(req,res) => {
    const query = url.parse(req.url,true).query;
    let fail = '';
    if (!req.cookies.un) {
        res.redirect('/account/login');
        return;        
    }
    if (query.stat === 'fail') {
        fail = '<span class="fail">Verification failed. Try again.</span>';
    }
    res.send(template.html('Manage Account',template.accPage,template.part('manage',req.cookies.un).replace('$2',fail)));
});

router.post('/',(req,res) => {
    db.query('select * from account where un = ?',[req.body.un],(err,data) => {
        const prevUn = req.cookies.un;
        if (req.body.nPw !== '') {
            if (data[0].pw === req.body.pw) {
                db.query('update account set pw = ?, set un = ? where un = ?',[req.body.nPw,req.body.un,prevUn],(err,data) => {
                    db.query('update docs set author = ? where author = ?',[req.body.un,prevUn],(err,data) => {
                        res.cookie('un',req.body.un,{httpOnly: true,maxAge: 9000000});
                        res.redirect('/');
                    });
                });
            } else if (data[0].pw !== req.body.pw) {
                res.redirect('/account?stat=fail');
            }
        } else {
            if (data[0].pw === req.body.pw) {
                db.query('update account set un = ? where un = ?',[req.body.un,prevUn],(err,data) => {
                    db.query('update docs set author = ? where author = ?',[req.body.un,prevUn],(err,data) => {
                        res.redirect('/');
                    });
                });
            } else {
                res.redirect('/account?stat=fail');
            }
        }
    });
});

router.get('/login',(req,res) => {
    const query = url.parse(req.url,true).query;
    let fail = '';
    let acc = template.login;
    if (query.stat === 'fail') fail = '<span class="fail">Username or password is incorrect. Try again.</span><br>';
    if (req.cookies.un) {
        res.send(template.html('Login',template.accPage,template.part('already','')));
        return;
    }
    res.send(template.html('Login',acc,template.part('login',fail)));
});

router.post('/login',(req,res) => {
    db.query('select * from account where un = ? and pw = ?',[req.body.un,req.body.pw],(err,data) => {
        if (!data[0]) {
            res.redirect('/account/login?stat=fail');
        } else {
            let options = {httpOnly: true};
            if (req.body.keep === 'on') options.maxAge = 9000000;
            res.status(302).cookie('un',req.body.un,options).redirect('/');
        }
    });
});

router.get('/signup',(req,res) => {
    const query = url.parse(req.url,true).query;
    let fail = '';
    if (query.stat === 'fail') fail = '<span class="fail">Account with the same username already exists.<br>Perhaps there is your doppelgänger somewhere!</span>';
    if (req.cookies.un) {
        res.send(template.html('Sign Up',template.accPage,template.part('already','')));
        return;
    } 
    res.send(template.html('Sign Up',template.login,template.part('signup',fail)));
})

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
        res.send(template.verify('/account',`<input type='hidden' name='un' value='${req.cookies.un}'><input type='hidden' name='nPw' value='${req.body.nPw}'>`));
    } else {
        res.send(template.verify('/account/delete',`<input type='hidden' name='un' value='${req.cookies.un}'>`));
    }
});

router.post('/delete',(req,res) => {
    db.query('select * from account where un = ?',[req.body.un],(err,data) => {
        if (data[0].pw === req.body.pw) {
            db.query('delete from account where un = ?',[req.body.un],(err,data) => {
                res.clearCookie('un');
                res.redirect('/');
            });
        } else {
            res.redirect('/account?stat=fail');
        }
    });
});

module.exports = router;