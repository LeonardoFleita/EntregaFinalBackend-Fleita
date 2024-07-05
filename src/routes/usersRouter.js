const { Router } = require("express");
const { UserController } = require("../controllers/userController");
const { UserService } = require("../services/userService");
const { isUser, isLoggedIn } = require("../middlewares/auth.middleware");

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

//Crear un nuevo usuario

// router.post("/", async (req, res) => {
//   try {
//     const userManager = req.app.get("userManager");
//     const cartManager = req.app.get("cartManager");
//     const user = req.body;
//     const cart = await cartManager.addCart();
//     await userManager.registerUser(
//       user.firstName,
//       user.lastName,
//       user.age,
//       user.email,
//       user.password,
//       cart
//     );
//     res.status(200).redirect("/login");
//   } catch (err) {
//     res.status(404).json({ error: err.message });
//   }
// });

module.exports = router;
