const supertest = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.test" });

const requester = supertest.agent("http://localhost:8080");

describe("Testing de products", () => {
  let chai;
  let expect;

  before(async function () {
    chai = await import("chai");
    expect = chai.expect;
    this.timeout(20000);

    //Conexión a mongo

    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME,
    });
    this.connection = mongoose.connection;

    //Creación de un usuario, seteo del mismo como premium y logueo, ya que sólo un usuario logueado y premium puede crear productos

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

    //Seteo del usuario como premium
    await requester.put(`/api/users/${userId}`);

    //Logout y login para reflejar los cambios
    await requester.get("/api/sessions/logout");
    await requester
      .post("/api/sessions/login")
      .send({ email: mockUser.email, password: mockUser.password });
  });

  after(async function () {
    await this.connection.db.dropDatabase();
    await this.connection.close();
  });

  //Crear un producto

  it("El endpoint POST /api/products debe crear un producto correctamente", async () => {
    const productMock = {
      title: "test",
      description: "test",
      price: 25,
      thumbnail: "",
      code: "test123",
      stock: 25,
      category: "test",
    };

    const response = await requester.post("/api/products").send(productMock);
    expect(response.statusCode).to.be.equal(200);
    expect(response.ok).to.be.true;
    expect(response.body.payload).to.have.property("title");
  });

  //Traer todos los productos

  it("Debe traer todos los productos", async () => {
    const { statusCode, ok, body } = await requester.get("/api/products");

    expect(statusCode).to.be.equal(200);
    expect(ok).to.be.true;
    expect(body).to.be.have.property("payload");
  });

  //Traer un producto con su id

  it("Debe traer un producto por su id", async () => {
    const products = await requester.get("/api/products");

    expect(products.statusCode).to.be.equal(200);
    expect(products.ok).to.be.true;
    expect(products.body).to.be.have.property("payload");

    const productId = products.body.payload[0]._id;

    const prod = await requester.get(`/api/products/${productId}`);
    expect(prod.ok).to.be.true;
    expect(prod.statusCode).to.be.equal(200);
    expect(prod.body).to.be.have.property("payload");
  });
});
