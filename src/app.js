require("dotenv").config();
const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const sessionMiddle = require("./session/mongoStorage");
const productsRouter = require(`${__dirname}/routes/productsRouter`);
const cartsRouter = require(`${__dirname}/routes/cartsRouter`);
const CartManager = require(`${__dirname}/dao/dbManagers/cartManager`);
const viewsRouter = require(`${__dirname}/routes/viewsRouter`);
const sessionRouter = require(`${__dirname}/routes/sessionRouter`);
const usersRouter = require(`${__dirname}/routes/usersRouter`);
const emailRouter = require(`${__dirname}/routes/emailRouter`);
const UserManager = require(`${__dirname}/dao/dbManagers/userManager`);
const ProductManager = require(`${__dirname}/dao/dbManagers/productManager`);
const passport = require("passport");
const initializePassport = require("./config/passport-local.config");
const initializePassportGithub = require("./config/passport-github.config");
const { admin, superAdmin } = require("./utils/admin");
const { errorHandler } = require("./errors/errorHandler");
const { useLogger } = require("./utils/logger");
const swaggerJSDoc = require("swagger-jsdoc");
const { serve, setup } = require("swagger-ui-express");

const app = express();

app.use(sessionMiddle);

app.use(useLogger);

initializePassport();
initializePassportGithub();
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(`${__dirname}/../public`));

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Backend project Coderhouse",
      description: "API for ecommerce",
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};
const specs = swaggerJSDoc(swaggerOptions);

app.use("/apidocs", serve, setup(specs));

app.engine(`handlebars`, handlebars.engine());
app.set(`views`, `${__dirname}/views`);
app.set(`view engine`, `handlebars`);

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/users", usersRouter);
app.use("/api/email", emailRouter);

app.use(`/`, viewsRouter);

app.use("/loggerTest", (req, res) => {
  req.logger.debug("debug");
  req.logger.http("http");
  req.logger.info("info");
  req.logger.warning("warning");
  req.logger.error("error");
  req.logger.fatal("fatal");
  res.send("Logger");
});

app.use(errorHandler);

const execute = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME,
    });

    app.set("productManager", new ProductManager());
    app.set("cartManager", new CartManager());
    app.set("userManager", new UserManager());
    app.set("admin", admin);
    app.set("superAdmin", superAdmin);

    app.listen(8080, () => {
      console.log("Servidor listo");
    });
  } catch (err) {
    console.error(err);
  }
};

execute();
