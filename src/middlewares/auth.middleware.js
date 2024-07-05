module.exports = {
  isNotLoggedIn: (req, res, next) => {
    const user = req.session.user;
    if (user) {
      req.logger.info("There is an active session ");
      return res.status(401).json({
        error: "not authenticated",
      });
    }
    next();
  },
  isLoggedIn: (req, res, next) => {
    const user = req.session.user;
    req.logger.info("You must log in");
    if (!user) {
      return res.status(401).json({
        error: "not authenticated",
      });
    }
    next();
  },
  isAdmin: (req, res, next) => {
    const user = req.session.user;
    req.logger.warning("You must be admin");
    if (user.role !== "admin") {
      return res.status(403).json({ error: "not authorized" });
    }
    next();
  },
  isUser: (req, res, next) => {
    const user = req.session.user;
    req.logger.warning("You must be user");
    if (user.role !== "user") {
      return res.status(403).json({ error: "not authorized" });
    }
    next();
  },
  productPermission: (req, res, next) => {
    const user = req.session.user;
    if (!user.premium && user.role !== "admin") {
      return res.status(403).json({ error: "not authorized" });
    }
    next();
  },
};
