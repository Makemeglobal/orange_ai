const passport = require("passport")
exports.jwtAuth = (req, res, next, allow = false) => {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      
      if (err) return next(err);
      if (!user && !allow)
        return res.status(401).json({ message: "unauthorized" });
      req.user = user;
      next();
    })(req, res);
  };