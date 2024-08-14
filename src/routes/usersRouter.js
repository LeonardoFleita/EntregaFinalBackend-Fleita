const { Router } = require("express");
const { UserController } = require("../controllers/userController");
const { UserService } = require("../services/userService");
const {
  isUser,
  isLoggedIn,
  isAdmin,
} = require("../middlewares/auth.middleware");
const { userDocs } = require("../utils/uploader");

const router = Router();

const withController = (callback) => {
  return (req, res) => {
    const service = new UserService(req.app.get("userManager"));
    const controller = new UserController(service);
    return callback(controller, req, res);
  };
};

//Trae todos los usuarios

router.get(
  "/",
  withController((controller, req, res) => controller.getUsers(req, res))
);

//Trae un usuario

router.get(
  "/:uId",
  withController((controller, req, res) => controller.getUserById(req, res))
);

//Setea a un usuario como premium

router.post(
  "/premium/:uId",
  isLoggedIn,
  isAdmin,
  withController((controller, req, res) => controller.setPremiumUser(req, res))
);

//Carga documentos

router.post(
  "/:uId/documents",
  isLoggedIn,
  isUser,
  userDocs.single("document"),
  withController((controller, req, res) => controller.uploadDocument(req, res))
);

//Elimina usuarios inactivos

router.delete(
  "/",
  isLoggedIn,
  isAdmin,
  withController((controller, req, res) => controller.deleteUsers(req, res))
);

//Elimina un usuario

router.delete(
  "/:uId",
  isLoggedIn,
  isAdmin,
  withController((controller, req, res) => controller.deleteUserById(req, res))
);

//Actualiza un usuario a premium (sólo utilizado para testing, evitando así la carga de documentos necesarios para poder actualizar realmente a premium)
router.put(
  "/:uId",
  withController((controller, req, res) => controller.updateUser(req, res))
);

module.exports = router;
