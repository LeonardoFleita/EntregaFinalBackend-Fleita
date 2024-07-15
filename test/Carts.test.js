const supertest = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config();

const requester = supertest.agent("http://localhost:8080");

describe("Testing de carts", () => {
  let chai;
  let expect;
  let cartId;
  let productId;

  before(async function () {
    chai = await import("chai");
    expect = chai.expect;
    this.timeout(10000);

    //Conexión a mongo

    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME,
    });
    this.connection = mongoose.connection;

    //Creación de un usuario para obtener un carrito

    const mockUser = {
      firstName: "test",
      lastName: "test",
      age: 25,
      email: "test@test.com.ar",
      password: "123",
    };

    await requester.post("/api/sessions/register").send(mockUser);

    const login = await requester
      .post("/api/sessions/login")
      .send({ email: mockUser.email, password: mockUser.password });

    const userId = login.body.userSession.id;

    //Seteo del usuario como premium para poder crear un producto
    await requester.post(`/api/users/premium/${userId}`);

    //Logout y login para reflejar los cambios
    await requester.get("/api/sessions/logout");
    await requester
      .post("/api/sessions/login")
      .send({ email: mockUser.email, password: mockUser.password });

    //Crear un producto

    const productMock = {
      title: "test",
      description: "test",
      price: 25,
      thumbnail: "",
      code: "test123",
      stock: 25,
      category: "test",
    };

    await requester.post("/api/products").send(productMock);

    //Obtener id del producto

    const products = await requester.get("/api/products");
    productId = products.body.payload[0]._id;

    //Logout y login para reflejar los cambios
    await requester.get("/api/sessions/logout");

    //Creación de un usuario para probar la interacción con su cart

    const mockUser2 = {
      firstName: "test2",
      lastName: "test2",
      age: 25,
      email: "test2@test.com.ar",
      password: "123",
    };

    await requester.post("/api/sessions/register").send(mockUser2);

    const login2 = await requester
      .post("/api/sessions/login")
      .send({ email: mockUser2.email, password: mockUser2.password });

    //obtener cart id
    cartId = login2.body.userSession.cart;
  });

  after(async function () {
    await this.connection.db.dropDatabase();
    await this.connection.close();
  });

  it("El endpoint /api/carts/:cId/producst/:pId debe agregar un producto al carrito", async () => {
    const cart = await requester.post(
      `/api/carts/${cartId}/products/${productId}`
    );
    expect(cart.ok).to.be.true;
    expect(cart.statusCode).to.be.equal(200);
    expect(cart.body).to.have.property("payload");
    expect(cart.body.payload).to.have.property("product");
    expect(cart.body.payload).to.have.property("quantity");
  });

  it("El endpoint /api/carts/:cId debe traer el carrito buscado", async () => {
    const cart = await requester.get(`/api/carts/${cartId}`);
    expect(cart.ok).to.be.true;
    expect(cart.statusCode).to.be.equal(200);
    expect(cart.body).to.have.property("payload");
    expect(cart.body.payload).to.have.property("_id");
  });

  it("El endpoint /api/carts/:cId debe limpiar el carrito", async () => {
    const cart = await requester.delete(`/api/carts/${cartId}`);
    expect(cart.ok).to.be.true;
    expect(cart.statusCode).to.be.equal(200);
  });
});
