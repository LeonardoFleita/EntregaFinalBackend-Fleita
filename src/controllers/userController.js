const { CurrentUserDto } = require("../dto/currentUser.dto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { hashPassword, isValidPassword } = require("../utils/hashing");
const moment = require("moment-timezone");
const { transport } = require("../utils/transportMailing");

class UserController {
  constructor(userService) {
    this.service = userService;
  }

  getUsers = async (req, res) => {
    try {
      let users = await this.service.getUsers();
      users = users.map((u) => (u = new CurrentUserDto(u)));
      res.status(200).json({ status: "success", payload: users });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  getUserById = async (req, res) => {
    try {
      const uId = req.params.uId;
      let user = await this.service.getUserById(uId);
      user = new CurrentUserDto(user);
      res.status(200).json({ status: "success", payload: user });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  getSessionUser = async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        throw new Error("there is not session");
      }
      const admin = req.app.get("admin");
      const superAdmin = req.app.get("superAdmin");
      let user;
      if (admin.email === sessionUser.email && admin._id === sessionUser.id) {
        user = new CurrentUserDto(admin);
        return res.status(200).json({ user });
      }
      if (
        superAdmin.email === sessionUser.email &&
        superAdmin._id === sessionUser.id
      ) {
        user = new CurrentUserDto(superAdmin);
        return res.status(200).json({ user });
      }
      const userWanted = await this.service.getUserById(sessionUser.id);
      if (!userWanted) {
        throw new Error("not found");
      }
      user = new CurrentUserDto(userWanted);
      res.status(200).json({ user });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  };

  setPremiumUser = async (req, res) => {
    try {
      const userId = req.params.uId;
      let user = await this.service.getUserById(userId);
      const docStatus = user.documentStatus;
      if (!user.premium) {
        if (
          docStatus.identification &&
          docStatus.adressCertification &&
          docStatus.accountCertification
        ) {
          user.premium = true;
        } else {
          return res.status(400).json({ error: "falta documentación" });
        }
      } else {
        user.premium = false;
      }
      await this.service.updateUser(user);
      let updatedUser = await this.service.getUserById(userId);
      updatedUser = new CurrentUserDto(updatedUser);
      res.status(200).json({ status: "success", updatedUser });
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  };

  sendPasswordEmail = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        throw new Error("missing data");
      }
      const user = await this.service.getUserByEmail(email);
      if (!user) {
        throw new Error("not found");
      }
      const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      const restoreLink = `http://localhost:8080/restorePassword/${token}`;
      await transport.sendMail({
        from: process.env.GMAIL_ACCOUNT,
        to: user.email,
        subject: "Restore password",
        text: `Click on the next link to restore your password: ${restoreLink}`,
      });
      res.status(200).json({ status: "success", message: "Email sent" });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  restorePassword = async (req, res) => {
    try {
      const { password, token } = req.body;
      if (!password) {
        throw new Error("invalid parameters");
      }
      const verifiedToken = jwt.verify(token, process.env.SECRET_KEY);
      const email = verifiedToken.email;
      let user = await this.service.getUserByEmail(email);
      if (!user) {
        throw new Error("not found");
      }
      if (isValidPassword(password, user.password)) {
        throw new Error("You can't use the same password");
      }
      const hashedPassword = hashPassword(password);
      const updatedUser = { ...user, password: hashedPassword };
      await this.service.updateUser(updatedUser);
      res.redirect("/login");
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        req.logger.info("Token expired");
        return res.redirect("/forgotPassword");
      }
      res.status(404).json({ error: err.message });
    }
  };

  uploadDocument = async (req, res) => {
    try {
      const type = req.body.type;
      let name;
      if (req.body.name) {
        name = req.body.name;
      } else {
        switch (type) {
          case "profile":
            name = "profilePicture";
            break;
          case "identification":
            name = "identification";
            break;
          case "adress":
            name = "adressCertification";
            break;
          case "account":
            name = "accountCertification";
            break;
        }
      }
      if (!req.file || !name) {
        throw new Error("missing data");
      }
      const reference = req.file.path;
      const userId = req.params.uId;
      let user = await this.service.getUserById(userId);
      let updatedDocs = user.documents.map((doc) =>
        doc.name === name ? { name, reference } : doc
      );
      if (!updatedDocs.some((doc) => doc.name === name)) {
        updatedDocs.push({ name, reference });
      }
      user.documents = updatedDocs;
      if (user.documentStatus.hasOwnProperty(name)) {
        user.documentStatus[name] = true;
      }
      await this.service.updateUser(user);
      res.status(200).json({ status: "success", payload: "Archivo cargado" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  deleteUsers = async (req, res) => {
    try {
      const cartManager = req.app.get("cartManager");
      const users = await this.service.getUsers();
      const expiredUsers = users.filter(
        (u) => moment().diff(u.lastConnection, "days") > 2
      );
      let expiredUsersIds = expiredUsers.map((u) => u._id.toString());
      let expiredUsersEmails = expiredUsers.map((u) => u.email);
      let expiredCartsIds = expiredUsers.map((u) => u.cart.toString());
      expiredUsers.map(
        async (u) =>
          await transport.sendMail({
            from: process.env.GMAIL_ACCOUNT,
            to: u.email,
            subject: "Cuenta eliminada",
            text: `Hola ${u.firstName}, le informamos que su cuenta ha sido eliminada de nuestra base de datos por inactividad`,
          })
      );

      await cartManager.deleteCarts(expiredCartsIds);
      await this.service.deleteUsers(expiredUsersIds);
      res.status(200).send({
        status: "success",
        message: `Han sido eliminadas las cuentas pertenecientes a las siguientes direcciones de correo electrónico: ${expiredUsersEmails.join(
          ", "
        )}`,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  deleteUserById = async (req, res) => {
    try {
      const uId = req.params.uId;
      const user = await this.service.getUserById(uId);
      const cartManager = req.app.get("cartManager");
      await this.service.deleteUserById(uId);
      await cartManager.deleteCartById(user.cart);
      res
        .status(200)
        .json({ status: "success", message: "user succesfully deleted" });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };
}

module.exports = { UserController };
