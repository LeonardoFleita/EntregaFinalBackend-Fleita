const productsRouter = require(`${__dirname}/productsRouter`);
const cartsRouter = require(`${__dirname}/cartsRouter`);
const viewsRouter = require(`${__dirname}/viewsRouter`);
const sessionRouter = require(`${__dirname}/sessionRouter`);
const usersRouter = require(`${__dirname}/usersRouter`);

routers = {
  "/api/products": productsRouter,
  "/api/carts": cartsRouter,
  "/api/sessions": sessionRouter,
  "/api/users": usersRouter,
  "/": viewsRouter,
};

module.exports = (app) => {
  Object.keys(routers).forEach((path) => {
    app.use(path, routers[path]);
  });
};
