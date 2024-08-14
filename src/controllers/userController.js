const { CurrentUserDto } = require("../dto/currentUser.dto");
const jwt = require("jsonwebtoken");
const { hashPassword, isValidPassword } = require("../utils/hashing");
const moment = require("moment-timezone");
const { transport } = require("../utils/transportMailing");

class UserController {
  constructor(userService) {
    this.service = userService;
  }

  #handleError(res, err) {
    if (err.message === "not found") {
      return res.status(404).json({ error: "Not found" });
    }

    if (err.message === "invalid parameters") {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    if (err.message === "not authorized") {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (err.message === "not authenticated") {
      return res.status(401).json({ error: "authenticated" });
    }

    return res.status(500).json({ error: err.message });
  }

  //Trae todos los usuarios

  getUsers = async (req, res) => {
    try {
      let users = await this.service.getUsers();
      users = users.map((u) => (u = new CurrentUserDto(u)));
      res.status(200).json({ status: "success", payload: users });
    } catch (err) {
      return this.#handleError(res, err);
    }
  };

  //Busca un usuario por su id

  getUserById = async (req, res) => {
    try {
      const uId = req.params.uId;
      let user = await this.service.getUserById(uId);
      user = new CurrentUserDto(user);
      res.status(200).json({ status: "success", payload: user });
    } catch (err) {
      return this.#handleError(res, err);
    }
  };

  //Trae los datos del usuario que tiene la sesión activa

  getSessionUser = async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        throw new Error("not authenticated");
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
      return this.#handleError(res, err);
    }
  };

  //Setea a un usuario como premium

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
          return res.status(400).json({ error: "missing data" });
        }
      } else {
        user.premium = false;
      }
      await this.service.updateUser(user);
      let updatedUser = await this.service.getUserById(userId);
      updatedUser = new CurrentUserDto(updatedUser);
      res.status(200).json({ status: "success", updatedUser });
    } catch (err) {
      return this.#handleError(res, err);
    }
  };

  //Envía link para reestablecer la contraseña

  sendPasswordEmail = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        throw new Error("invalid parameters");
      }
      const user = await this.service.getUserByEmail(email);
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
      return this.#handleError(res, err);
    }
  };

  //Restaura la contraseña

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
      return this.#handleError(res, err);
    }
  };

  //Carga documentos

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
        throw new Error("invalid parameters");
      }
      let reference;
      if (type === "product") {
        reference = `/files/products/${req.file.filename}`;
      } else if (type === "other") {
        reference = `/files/documents/${req.file.filename}`;
      } else {
        reference = `/files/profiles/${req.file.filename}`;
      }
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
      res.status(200).json({ status: "success", message: "File uploaded" });
    } catch (err) {
      return this.#handleError(res, err);
    }
  };

  //Elimina usuarios inactivos

  deleteUsers = async (req, res) => {
    try {
      const cartManager = req.app.get("cartManager");
      const users = await this.service.getUsers();
      const expiredUsers = users.filter(
        (u) => moment().diff(u.lastConnection, "days") > 2
      );
      if (expiredUsers.length < 1) {
        return res
          .status(200)
          .json({ status: "info", message: "there are not inactive users" });
      }
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
        message: `The following accounts has been deleted: ${expiredUsersEmails.join(
          ", "
        )}`,
      });
    } catch (err) {
      return this.#handleError(res, err);
    }
  };

  //Elimina un usuario

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
      return this.#handleError(res, err);
    }
  };

  //Actualiza un usuario a premium (sólo utilizado para testing, evitando así la carga de documentos necesarios para poder actualizar realmente a premium)

  updateUser = async (req, res) => {
    try {
      const userId = req.params.uId;
      let user = await this.service.getUserById(userId);
      user.premium = true;
      await this.service.updateUser(user);
      res.status(200).json({ status: "success", payload: user });
    } catch (err) {
      return this.#handleError(res, err);
    }
  };
}

module.exports = { UserController };
