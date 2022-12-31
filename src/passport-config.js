const LocalStrategy = require("passport-local").Strategy;
const { comparePassword } = require("./utils/utils");

module.exports = (passport, getUserByEmail) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        const user = await getUserByEmail(email);

        if (user == null) return done(null, false, { message: "email" });

        if (!comparePassword(password, user.password))
          return done(null, false, { message: "password" });

        return done(null, user);
      }
    )
  );
  passport.serializeUser((user, done) => done(null, user.email));
  passport.deserializeUser(async (email, done) =>
    done(null, await getUserByEmail(email))
  );
};
