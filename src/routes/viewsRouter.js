const { Router } = require("express");
const {
  isNotLoggedIn,
  isLoggedIn,
  productPermission,
  isUser,
  isAdmin,
} = require("../middlewares/auth.middleware");
const { generateProduct } = require("../mocks/generateProducts");
const { CurrentUserDto } = require("../dto/currentUser.dto");

const router = Router();

//Función que verifica y retorna si el usuario está logueado y los datos del usuario

async function userSession(req) {
  const userManager = req.app.get("userManager");
  const admin = req.app.get("admin");
  const superAdmin = req.app.get("superAdmin");
  const userData = req.session.user;
  let user;
  let loggedIn;
  if (userData) {
    if (userData.id === admin._id) {
      user = admin;
    } else if (userData.id === superAdmin._id) {
      user = superAdmin;
    } else {
      user = await userManager.getUserById(userData.id);
    }
    loggedIn = true;
  } else {
    loggedIn = false;
  }
  const isAdmin = user?.role === "admin" ? true : false;
  const premium = user?.premium
    ? user.premium === true
      ? true
      : false
    : false;
  return { user, loggedIn, isAdmin, premium };
}

//Mocking

router.get(`/mockingproducts`, async (req, res) => {
  let products = [];
  for (let i = 0; i <= 100; i++) {
    products.push(generateProduct());
  }
  const { user, loggedIn, isAdmin, premium } = await userSession(req);

  res.render(`index`, {
    title: "Productos",
    products: products,
    scripts: ["index.js", "logout.js"],
    css: ["styles.scss"],
    endPoint: "Home",
    isAdmin,
    loggedIn,
    user,
    premium,
  });
});

//Index, retorna la vista de productos. Si no hay una sesión iniciada, en el header se puede acceder al login y registro de usuario, en caso que sí haya una sesión iniciada se mostrarán los datos del usuario y se podrá cerrar sesión

router.get(`/`, async (req, res) => {
  const productManager = req.app.get("productManager");
  const limit = req.query.limit;
  const page = req.query.page;
  const sort = req.query.sort;
  const category = req.query.category;
  const avaiability = req.query.avaiability;
  const products = await productManager.getProducts(
    limit,
    page,
    sort,
    category,
    avaiability
  );
  const { user, loggedIn, isAdmin, premium } = await userSession(req);

  res.render(`index`, {
    title: "Productos",
    products: products.docs,
    scripts: ["index.js", "logout.js"],
    css: ["styles.scss"],
    endPoint: "Home",
    isAdmin,
    loggedIn,
    user,
    premium,
  });
});

//Formulario para agregar productos a la base de datos

router.get("/addProducts", isLoggedIn, productPermission, async (req, res) => {
  const { user, loggedIn, isAdmin, premium } = await userSession(req);
  res.render(`addProducts`, {
    title: "Formulario",
    scripts: ["index.js", "logout.js", "productsForm.js"],
    css: ["styles.scss"],
    endPoint: "Agregar productos",
    isAdmin,
    loggedIn,
    user,
    premium,
  });
});

//Devuelve la vista del carrito seleccionado. Si el usuario no está logueado esta vista es inaccesible

router.get("/carts/:cId", isLoggedIn, async (req, res) => {
  const cartManager = req.app.get("cartManager");
  const cId = req.params.cId;
  const cart = await cartManager.getCartByIdPopulate(cId);
  const products = cart.products.map((p) => {
    return { ...p, totalPrice: p.product.price * p.quantity };
  });
  const { user, loggedIn, isAdmin, premium } = await userSession(req);
  res.render("cart", {
    title: "Carrito",
    products: products,
    scripts: ["index.js", "cart.js", "logout.js"],
    css: ["styles.scss"],
    endPoint: "Cart",
    user,
    isAdmin,
    loggedIn,
    premium,
  });
});

//Retorna la vista de login. Si hay una sessión iniciada no se podrá acceder a esta sección

router.get("/login", isNotLoggedIn, (req, res) => {
  res.render("login", {
    title: "Login",
    scripts: ["login.js"],
    css: ["styles.scss"],
    endPoint: "Login",
  });
});

//Retorna la vista de registro. Si hay una sessión iniciada no se podrá acceder a esta sección

router.get("/register", isNotLoggedIn, (req, res) => {
  res.render("register", {
    title: "Registro",
    scripts: ["register.js"],
    css: ["styles.scss"],
    endPoint: "Registro",
  });
});

//Retorna la vista que permite enviar email para restaurar la contraseña

router.get("/forgotPassword", isNotLoggedIn, (req, res) => {
  res.render("forgotPassword", {
    title: "Envío de email",
    scripts: ["restorePassword.js"],
    css: ["styles.scss"],
    endPoint: "Envío de email",
  });
});

//Retorna la vista que permite restaurar la contraseña

router.get("/restorePassword/:token", isNotLoggedIn, (req, res) => {
  const { token } = req.params;
  res.render("restorePassword", {
    title: "Restaurar contraseña",
    css: ["styles.scss"],
    token: token,
    endPoint: "Restaurar contraseña",
  });
});

//Formulario para que el usuario pueda cargar documentos

router.get("/users/:uId/documents", isLoggedIn, isUser, async (req, res) => {
  const { user, loggedIn, isAdmin, premium } = await userSession(req);
  res.render(`uploader`, {
    title: "Formulario",
    scripts: ["index.js", "documentForm.js", "logout.js"],
    css: ["styles.scss"],
    endPoint: "Agregar documentos",
    isAdmin,
    loggedIn,
    user,
    premium,
  });
});

//Ver usuarios

router.get("/users", async (req, res) => {
  const userManager = req.app.get("userManager");
  let users = await userManager.getUsers();
  users = users.map((u) => new CurrentUserDto(u));
  const { user, loggedIn, isAdmin, premium } = await userSession(req);
  res.render("users", {
    title: "Usuarios",
    scripts: ["users.js", "logout.js"],
    css: ["styles.scss"],
    endPoint: "Usuarios",
    isAdmin,
    loggedIn,
    user,
    users,
    premium,
  });
});

//Ver y modificar rol de un usuario

router.get("/manageUsers/:uId", isLoggedIn, isAdmin, async (req, res) => {
  const uId = req.params.uId;
  const userManager = req.app.get("userManager");
  let u = await userManager.getUserById(uId);
  u = new CurrentUserDto(u);
  const { user, loggedIn, isAdmin, premium } = await userSession(req);
  res.render(`manageUsers`, {
    title: "Gestión de usuarios",
    scripts: ["manageUsers.js", "logout.js"],
    css: ["styles.scss"],
    endPoint: "Gestionar usuarios",
    isAdmin,
    loggedIn,
    user,
    premium,
    u,
  });
});

//Compra

router.get("/purchase", isLoggedIn, isUser, async (req, res) => {
  const { user, loggedIn, isAdmin, premium } = await userSession(req);
  res.render("purchase", {
    title: "Gestión de usuarios",
    scripts: ["purchase.js", "logout.js"],
    css: ["styles.scss"],
    endPoint: "Gestionar usuarios",
    isAdmin,
    loggedIn,
    user,
    premium,
  });
});

module.exports = router;
