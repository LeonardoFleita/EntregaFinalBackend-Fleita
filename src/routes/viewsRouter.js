const { Router } = require("express");
const {
  isNotLoggedIn,
  isLoggedIn,
  productPermission,
} = require("../middlewares/auth.middleware");
const { generateProduct } = require("../mocks/generateProducts");

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

  return { user, loggedIn };
}

//Mocking

router.get(`/mockingproducts`, async (req, res) => {
  let products = [];
  for (let i = 0; i <= 100; i++) {
    products.push(generateProduct());
  }
  const { user, loggedIn } = await userSession(req);

  res.render(`index`, {
    title: "Productos",
    products: products,
    scripts: ["index.js"],
    css: ["styles.css"],
    endPoint: "Home",
    login: true,
    loggedIn,
    user,
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
  const { user, loggedIn } = await userSession(req);

  const isAdmin = user?.role === "admin" ? true : false;
  const userCart = user ? user.cart?.toString() : null;

  res.render(`index`, {
    title: "Productos",
    products: products.docs,
    scripts: ["index.js"],
    css: ["styles.css"],
    endPoint: "Home",
    login: true,
    isAdmin,
    loggedIn,
    user,
    userCart,
  });
});

//Formulario para agregar productos a la base de datos

router.get("/addProducts", isLoggedIn, productPermission, async (req, res) => {
  const { user, loggedIn } = await userSession(req);
  res.render(`addProducts`, {
    title: "Formulario",
    scripts: ["index.js"],
    css: ["styles.css"],
    endPoint: "Agregar productos",
    login: true,
    loggedIn,
    user,
  });
});

//Devuelve la vista del carrito seleccionado. Si el usuario no está logueado esta vista es inaccesible

router.get("/carts/:cId", isLoggedIn, async (req, res) => {
  const cartManager = req.app.get("cartManager");
  const cId = req.params.cId;
  const cart = await cartManager.getCartByIdPopulate(cId);
  const products = cart[0].products.map((p) => {
    return { ...p, totalPrice: p.product.price * p.quantity };
  });
  const { user, loggedIn } = await userSession(req);
  res.render("cart", {
    title: "Carrito",
    products: products,
    css: ["styles.css"],
    endPoint: "Cart",
    login: true,
    user,
    loggedIn,
  });
});

//Retorna la vista de login. Si hay una sessión iniciada no se podrá acceder a esta sección

router.get("/login", isNotLoggedIn, (req, res) => {
  res.render("login", {
    title: "Login",
    css: ["styles.css"],
    endPoint: "Login",
    login: false,
  });
});

//Retorna la vista de registro. Si hay una sessión iniciada no se podrá acceder a esta sección

router.get("/register", isNotLoggedIn, (req, res) => {
  res.render("register", {
    title: "Registro",
    css: ["styles.css"],
    endPoint: "Registro",
    login: false,
  });
});

//Retorna la vista que permite enviar email para restaurar la contraseña

router.get("/forgotPassword", isNotLoggedIn, (req, res) => {
  res.render("forgotPassword", {
    title: "Envío de email",
    css: ["styles.css"],
    endPoint: "Envío de email",
    login: false,
  });
});

//Retorna la vista que permite restaurar la contraseña

router.get("/restorePassword/:token", isNotLoggedIn, (req, res) => {
  const { token } = req.params;
  res.render("restorePassword", {
    title: "Restaurar contraseña",
    css: ["styles.css"],
    token: token,
    endPoint: "Restaurar contraseña",
    login: false,
  });
});

module.exports = router;
