const LocalStrategy = require("passport-local").Strategy;
const { comparePassword } = require("./utils/bcrypt-wrapper");

function init(passport, getUserByEmail) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      const user = getUserByEmail(email);

      if (user == null) return done(null, false, { message: "email" });

      if (!comparePassword(password, user.password))
        return done(null, false, { message: "password" });

      return done(null, user);
    })
  );
  passport.serializeUser((user, done) => done(null, user.email));
  passport.deserializeUser((email, done) => done(null, getUserByEmail(email)));
}

module.exports = init;
