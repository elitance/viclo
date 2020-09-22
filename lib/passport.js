module.exports = (app) => {
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const template = require('./template');

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user,done) => {
        done(null,user.un);
    });

    // passport.deserializeUser((i))

    passport.use(new LocalStrategy({
        usernameField: 'un',
        passwordField: 'pw'
    },(un,pw,done) => {
        
    }));
}