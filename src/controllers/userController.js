const { CurrentUserDto } = require("../dto/currentUser.dto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { hashPassword, isValidPassword } = require("../utils/hashing");

class UserController {
  constructor(userService) {
    this.service = userService;
  }

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
      const user = await this.service.getUserById(userId);
      const newUserData = { ...user, premium: !user.premium };
      await this.service.updateUser(newUserData);
      let updatedUser = await this.service.getUserById(userId);
      updatedUser = new CurrentUserDto(updatedUser);
      res.status(200).json({ updatedUser });
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  };

  sendPasswordEmail = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await this.service.getUserByEmail(email);
      if (!user) {
        throw new Error("not found");
      }
      const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      const restoreLink = `http://localhost:8080/restorePassword/${token}`;

      const transport = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        auth: {
          user: process.env.GMAIL_ACCOUNT,
          pass: process.env.GMAIL_PASSWORD,
        },
      });

      await transport.sendMail({
        from: process.env.GMAIL_ACCOUNT,
        to: user.email,
        subject: "Restore password",
        text: `Click on the next link to restore your password: ${restoreLink}`,
      });

      res.status(200).send("Email sent");
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
}

module.exports = { UserController };
