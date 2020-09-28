const router = require('express').Router();
const url = require('url');
const db = require('../lib/mysql');
const template = require('../lib/template');

module.exports = (passport) => {
   router.get('/', (req, res) => {
      const query = url.parse(req.url, true).query;
      let stat = '';
      if (!req.user) {
         res.redirect('/account/login');
         return;
      }
      if (query.stat === 'fail') {
         stat = '<span class="fail">Verification failed. Try again.</span>';
      } else if (query.stat === 'success') {
         stat = '<span class="success">Username & password successfully changed.</span>';
      } else if (query.stat === 'overlap') {
         stat = '<span class="fail">Account with the same username exists. Try another username.</span>';
      }
      res.send(template.html('Manage Account', template.part('manage', [req.user.un, stat]), req));
   });

   router.post('/', (req, res) => {
      if (req.body.nPw !== '') {
         if (req.user.pw === req.body.pw) {
            db.query('select * from account where un = ?', [req.body.un], (err, data) => {
               if (!data[0] || data[0].un === req.user.un) {
                  db.query('update account set pw = ?, un = ? where un = ?', [template.crypto(req.body.nPw), req.body.un, req.user.un], (err, data) => {
                     template.editAuthor(req.user.un, req.body.un);
                     req.user.un = req.body.un;
                     req.user.pw = req.body.nPw;
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
         if (req.user.pw === req.body.pw) {
            db.query('select * from account where un = ?', [req.body.un], (err, data) => {
               if (!data[0]) {
                  db.query('update account set un = ? where un = ?', [req.body.un, req.user.un], (err, data) => {
                     template.editAuthor(req.user.un, req.body.un);
                     req.user.un = req.body.un;
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

   router.get('/login', (req, res) => {
      const query = url.parse(req.url, true).query;
      let fail = '';
      if (query.stat === 'fail') fail = '<span class="fail">Username or password is incorrect. Try again.</span><br>';
      if (req.user) {
         res.send(template.html('Login', template.part('already'), req));
         return;
      }
      res.send(template.html('Login', template.part('login', [fail]), req));
   });

   router.post(
      '/login',
      (req, res, next) => {
         if (req.body.keep === 'on') req.session.cookie.maxAge = 31536000000;
         next();
      },
      passport.authenticate('local', {
         successRedirect: '/',
         failureRedirect: '/account/login?stat=fail',
      })
   );

   router.get('/signup', (req, res) => {
      const query = url.parse(req.url, true).query;
      let fail = '';
      if (query.stat === 'fail') fail = '<span class="fail">Account with the same username already exists.<br>Perhaps there is your doppelgänger somewhere!</span>';
      if (req.user) {
         res.send(template.html('Sign Up', template.part('already'), req));
         return;
      }
      res.send(template.html('Sign Up', template.part('signup', [fail]), req));
   });

   router.post('/signup', (req, res) => {
      db.query('select * from account where un = ?', [req.body.un], (err, un) => {
         if (!un[0]) {
            db.query('insert into account (un, pw, about) values (?, ?, ?)', [req.body.un, template.crypto(req.body.pw), req.body.about], (err, data) => {
               res.redirect('/account/login');
            });
         } else {
            res.redirect('/account/signup?stat=fail');
         }
      });
   });

   router.get('/logout', (req, res) => {
      req.logout();
      req.session.destroy();
      res.redirect('/');
   });

   router.get('/user/:un', (req, res) => {
      db.query('select * from account where un = ?', [req.params.un], (err, account) => {
         if (!account[0]) {
            res.send(template.html('Not Found', template.part('notFound'), req));
         } else {
            let about = `No description for <a href="/account/user/${req.params.un}">@${req.params.un}</a>.`;
            if (account[0].about) about = account[0].about;
            res.send(template.html(req.params.un, template.part('user', [req.params.un, about]), req));
         }
      });
   });

   router.post('/verify', (req, res) => {
      if (req.body.manage) {
         res.send(template.verify('/account', `<input type='hidden' name='un' value='${req.body.un}'><input type='hidden' name='nPw' value='${req.body.nPw}'>`));
      } else {
         res.send(template.verify('/account/delete', `<input type='hidden' name='un' value='${req.user.un}'>`));
      }
   });

   router.post('/delete', (req, res) => {
      if (req.user.pw === req.body.pw) {
         db.query('delete from account where un = ?', [req.body.un], (err, data) => {
            template.editAuthor(req.user.un, '[Deleted Account]');
            res.clearCookie('un');
            res.redirect('/');
         });
      } else {
         res.redirect('/account?stat=fail');
      }
   });

   return router;
};
