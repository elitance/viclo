const url = require('url');
const db = require('./mysql');
const template = require('./template');

exports.login = (req,res) => {
    const query = url.parse(req.url,true).query;
    let html;
    if (!query.stat) {
        html = `
        <div>
            <h1>Login</h1>
            <form action="/account/login" method="POST">
                <p>
                    <label for="id">Username</label><br>
                    <input id="id" type="text" name="id" placeholder="Username"><br>
                </p>
                <p>
                    <label for="pw">Password</label><br>
                    <input id="pw" type="password" name="pw" placeholder="Password"><br>
                </p>
                <input type="submit" value="Login">
            </form>
            Don't have an account? <a href="/account/signup">Sign Up</a>!
        </div>   
        `;
    } else if (query.stat === 'fail') {
        html = `
        <div>
            <h1>Login</h1>
            <form action="/account/login" method="POST">
                <p>
                    <label for="id">Username</label><br>
                    <input id="id" type="text" name="un" placeholder="Username" required><br>
                </p>
                <p>
                    <label for="pw">Password</label><br>
                    <input id="pw" type="password" name="pw" placeholder="Password" required><br>
                </p>
                <input type="submit" value="Login">
            </form>
            <span class="fail">Username or password is incorrect. Try again.</span><br>
            Don't have an account? <a href="/account/signup">Sign Up</a>!
        </div>
        `
    } else if (query.stat === 'success') {
        res.send(template.html('Login',`<script>localStorage.setItem('login',JSON.stringify(true)); location.replace('/');</script>`));
    }
    res.send(template.html('Login',html));
}

exports.loginProc = (req,res) => {
    db.query('select * from account where un = ? and pw = ?',[req.body.un,req.body.pw],(err,data) => {
        if (!data[0]) {
            res.redirect('/account/login?stat=fail');
        } else {
            res.redirect('/account/login?stat=success');
        }
    })
}