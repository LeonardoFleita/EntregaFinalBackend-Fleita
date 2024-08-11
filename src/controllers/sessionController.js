const moment = require("moment-timezone");

class SessionController {
  constructor(userService) {
    this.service = userService;
  }

  date = () => {
    const dateAndHour = moment().tz("America/Argentina/Buenos_Aires").format();
    return dateAndHour;
  };

  //Métodos para la api

  register = async (req, res) => {
    res.json({ status: "success", message: "successful registration" });
  };

  login = async (req, res) => {
    const user = req.user;
    req.session.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      premium: user.premium,
      cart: user.cart ? user.cart._id : null,
    };
    if (user.role !== "admin") {
      let loginDate = this.date();
      const updatedUser = { ...user, lastConnection: loginDate };
      await this.service.updateUser(updatedUser);
    }
    const userSession = req.session.user;
    res.send({ status: "successful login", userSession });
  };

  logout = async (req, res) => {
    try {
      const userRole = req.session.user.role;
      if (userRole !== "admin") {
        const userId = req.session.user.id;
        const user = await this.service.getUserById(userId);
        let loginDate = this.date();
        const updatedUser = { ...user, lastConnection: loginDate };
        await this.service.updateUser(updatedUser);
      }
      req.session.destroy((err) => {
        if (err) {
          throw Error(err);
        }
        res.send("successful logout");
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  //Métodos para el front

  registerView = async (req, res) => {
    res.redirect("/login");
  };

  loginView = async (req, res) => {
    const user = req.user;
    req.session.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      premium: user.premium,
      cart: user.cart ? user.cart._id : null,
    };
    if (user.role !== "admin") {
      let loginDate = this.date();
      const updatedUser = { ...user, lastConnection: loginDate };
      await this.service.updateUser(updatedUser);
    }
    res.redirect("/");
  };

  logoutView = async (req, res) => {
    try {
      const userRole = req.session.user.role;
      if (userRole !== "admin") {
        const userId = req.session.user.id;
        const user = await this.service.getUserById(userId);
        let loginDate = this.date();
        const updatedUser = { ...user, lastConnection: loginDate };
        await this.service.updateUser(updatedUser);
      }
      req.session.destroy((err) => {
        if (err) {
          throw Error(err);
        }
        res.redirect("/login");
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // githubLogin = async (req, res) => {
  //   const user = req.user;
  //   req.session.user = { id: user._id.toString(), email: user.email };
  //   res.redirect("/");
  // };
}

module.exports = { SessionController };
