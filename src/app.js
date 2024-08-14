require("../envConfig");
const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const sessionMiddle = require("./session/mongoStorage");
const configRouters = require(`${__dirname}/routes/routers.js`);
const CartManager = require(`${__dirname}/dao/dbManagers/cartManager`);
const UserManager = require(`${__dirname}/dao/dbManagers/userManager`);
const ProductManager = require(`${__dirname}/dao/dbManagers/productManager`);
const passport = require("passport");
const initializePassport = require("./config/passport-local.config");
const { admin, superAdmin } = require("./utils/admin");
const { errorHandler } = require("./errors/errorHandler");
const { useLogger } = require("./utils/logger");
const swaggerSetup = require("./config/swagger");

console.log(process.env.NODE_ENV);

//Express config

const app = express();

app.use(sessionMiddle);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(`${__dirname}/../public`));

//Logger

app.use(useLogger);
app.use("/loggerTest", (req, res) => {
  req.logger.debug("debug");
  req.logger.http("http");
  req.logger.info("info");
  req.logger.warning("warning");
  req.logger.error("error");
  req.logger.fatal("fatal");
  res.send("Logger");
});

//Passport

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

//Handlebars config

app.engine(`handlebars`, handlebars.engine());
app.set(`views`, `${__dirname}/views`);
app.set(`view engine`, `handlebars`);

//Routers

configRouters(app);

//Swagger (/apidocs)

swaggerSetup(app);

//Errorhandler

app.use(errorHandler);

//Función de ejecución

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
