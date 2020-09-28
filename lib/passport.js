const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const template = require("./template");
const db = require("./mysql");

module.exports = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    return done(null, user);
  });

  passport.deserializeUser((user, done) => {
    return done(null, user);
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: "un",
        passwordField: "pw",
      },
      (un, pw, done) => {
        db.query(
          "select * from account where un = ? and pw = ?",
          [un, template.crypto(pw)],
          (err, account) => {
            if (!account[0]) {
              return done(null, false, {
                message: "Incorrect username or password.",
              });
            } else {
              return done(null, { un, pw });
            }
          }
        );
      }
    )
  );

  return passport;
};
