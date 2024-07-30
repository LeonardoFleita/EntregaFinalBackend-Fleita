const { Router } = require("express");
const { UserController } = require("../controllers/userController");
const { UserService } = require("../services/userService");
const { isUser, isLoggedIn } = require("../middlewares/auth.middleware");
const { uploader } = require("../utils/uploader");

const router = Router();

const withController = (callback) => {
  return (req, res) => {
    const service = new UserService(req.app.get("userManager"));
    const controller = new UserController(service);
    return callback(controller, req, res);
  };
};

router.post(
  "/premium/:uId",
  isLoggedIn,
  isUser,
  withController((controller, req, res) => controller.setPremiumUser(req, res))
);

router.post(
  "/:uId/documents",
  isLoggedIn,
  isUser,
  uploader.single("document"),
  withController((controller, req, res) => controller.uploadDocument(req, res))
);

module.exports = router;
