const { Router } = require("express");
const passportCall = require("../utils/passportCall");
const { UserController } = require("../controllers/userController");
const { SessionController } = require("../controllers/sessionController");
const { UserService } = require("../services/userService");

const router = Router();

const withSessionController = (callback) => {
  return (req, res) => {
    const service = new UserService(req.app.get("userManager"));
    const controller = new SessionController(service);
    return callback(controller, req, res);
  };
};

const withUserController = (callback) => {
  return (req, res) => {
    const service = new UserService(req.app.get("userManager"));
    const controller = new UserController(service);
    return callback(controller, req, res);
  };
};

//Permite registrar un usuario

router.post(
  "/register",
  passportCall("register"),
  withSessionController((controller, req, res) => controller.register(req, res))
);

//Permite iniciar sesión

router.post(
  "/login",
  passportCall("login"),
  withSessionController((controller, req, res) => controller.login(req, res))
);

//Devuelve los datos del usuario logueado en un json

router.get(
  "/current",
  withUserController((controller, req, res) =>
    controller.getSessionUser(req, res)
  )
);

//Permite cerrar sesión

router.get(
  "/logout",
  withSessionController((controller, req, res) => controller.logout(req, res))
);

//Envía un email para recuperar la contraseña

router.post(
  "/email",
  withUserController((controller, req, res) =>
    controller.sendPasswordEmail(req, res)
  )
);

//Cambia la contraseña

router.post(
  "/restorePassword",
  withUserController((controller, req, res) =>
    controller.restorePassword(req, res)
  )
);

module.exports = router;
