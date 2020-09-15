const url = require('url');
const nodemailer = require('nodemailer');
const fs = require('fs');
const db = require('./mysql');
const template = require('./template');

exports.login = (req,res) => {
    const query = url.parse(req.url,true).query;
    let fail = '';
    if (query.stat === 'fail') {
        fail = '<span class="fail">Username or password is incorrect. Try again.</span><br>';
    } else if (query.stat === 'success') {
        res.send(template.html('Login',`<script>localStorage.setItem('login',JSON.stringify(true)); location.replace('/');</script>`));
        return;
    }
    res.send(template.html('Login',`
    <div class='content'>
        <h1>Login</h1>
        <form action="/account/login" method="POST">
            <p>
                <label for="id">Username</label><br>
                <input id="id" type="text" name="un" placeholder="Username"><br>
            </p>
            <p>
                <label for="pw">Password</label><br>
                <input id="pw" type="password" name="pw" placeholder="Password"><br>
            </p>
            <input type="submit" value="Login">
        </form>
        ${fail}
        Don't have an account? <a href="/account/signup">Sign Up</a>!
        <script>
            if (JSON.parse(localStorage.getItem('login'))) {
                document.querySelector('.content').innerHTML = '<h1>Login</h1>You are already logged in.';
            }
        </script>
    </div>
    `));
}

exports.loginProc = (req,res) => {
    db.query('select * from account where un = ? and pw = ?',[req.body.un,req.body.pw],(err,data) => {
        if (!data[0]) {
            res.redirect('/account/login?stat=fail');
        } else {
            res.redirect('/account/login?stat=success');
        }
    });
}

exports.signup = (req,res) => {
    const query = url.parse(req.url,true).query;
    let fail = '';
    if (query.stat === 'fail') {
        fail = 'Account with the same username already exists. Perhaps there is your doppelgänger somewhere!';
    }
    res.send(template.html('Sign Up',`
    <div class='content'>
        <h1>Sign Up</h1>
        <form action="/account/signup" method="POST">
            <p>
                <label for="id">Username</label><br>
                <input id="id" type="text" name="un" placeholder="Enter your username" pattern="[A-Za-z0-9.]+"><br>
            </p>
            <p>
                <label for="pw">Password</label><br>
                <input id="pw" type="password" name="pw" placeholder="Enter your password"><br>
                <span style="margin-left: 15px;">At least 6 letters and one number required.</span>
            </p>
            <p>
                <label for="c-pw">Confirm Password</label><br>
                <input id="c-pw" type="password" name="cPw" placeholder="Confirm your password"><br>
            <p>
            <input type="submit" value="Login" class="unav">
            <script>
                const pw = document.querySelectorAll('input[type=password]');
                const regex = /^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d^a-zA-Z0-9].{5,50}$/;
                pw.forEach((input) => {
                    input.addEventListener('input',(e) => {
                        if (pw[0].value === pw[1].value && pw[0].value !== '' && pw[1].value !== '') {
                            if (regex.test(pw[0].value) && regex.test(pw[1].value)) {
                                document.querySelector('input[type=submit]').classList.remove('unav');
                            }
                        } else {
                            document.querySelector('input[type=submit]').classList.add('unav');
                        }
                    })
                });
            </script>
        </form>
        ${fail}
    </div>
    `));
}

exports.signupConfirm = (req,res) => {
    db.query('select * from account where un = ?',[req.body.un],(err,un) => {
        if (!un[0]) {
            db.query('insert into account (un,pw) values (?, ?)',[req.body.un,req.body.pw],(err,data) => {
                res.redirect(`/account/login`);
            });
        } else {
            res.redirect('/account/signup?stat=fail');
        }
    });
}