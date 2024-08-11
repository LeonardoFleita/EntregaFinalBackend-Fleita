const { Router } = require("express");
const { UserController } = require("../controllers/userController");
const { UserService } = require("../services/userService");
const {
  isUser,
  isLoggedIn,
  isAdmin,
} = require("../middlewares/auth.middleware");
const { uploader } = require("../utils/uploader");

const router = Router();

const withController = (callback) => {
  return (req, res) => {
    const service = new UserService(req.app.get("userManager"));
    const controller = new UserController(service);
    return callback(controller, req, res);
  };
};

router.get(
  "/",
  withController((controller, req, res) => controller.getUsers(req, res))
);

router.get(
  "/:uId",
  withController((controller, req, res) => controller.getUserById(req, res))
);

router.post(
  "/premium/:uId",
  isLoggedIn,
  isAdmin,
  withController((controller, req, res) => controller.setPremiumUser(req, res))
);

router.post(
  "/:uId/documents",
  isLoggedIn,
  isUser,
  uploader.single("document"),
  withController((controller, req, res) => controller.uploadDocument(req, res))
);

router.delete(
  "/",
  isLoggedIn,
  isAdmin,
  withController((controller, req, res) => controller.deleteUsers(req, res))
);

router.delete(
  "/:uId",
  isLoggedIn,
  isAdmin,
  withController((controller, req, res) => controller.deleteUserById(req, res))
);

module.exports = router;
