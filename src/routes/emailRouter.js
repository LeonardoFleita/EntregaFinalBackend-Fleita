const { Router } = require("express");
const { UserService } = require("../services/userService");
const { UserController } = require("../controllers/userController");

const router = Router();

const withController = (callback) => {
  return (req, res) => {
    const service = new UserService(req.app.get("userManager"));
    const controller = new UserController(service);
    return callback(controller, req, res);
  };
};

router.post(
  "/",
  withController((controller, req, res) =>
    controller.sendPasswordEmail(req, res)
  )
);

router.post(
  "/restorePassword",
  withController((controller, req, res) => controller.restorePassword(req, res))
);

module.exports = router;
