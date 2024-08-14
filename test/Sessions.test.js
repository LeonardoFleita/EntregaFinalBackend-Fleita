const supertest = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.test" });

const requester = supertest.agent("http://localhost:8080");

describe("Testing de sessions", () => {
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
  });

  after(async function () {
    await this.connection.db.dropDatabase();
    await this.connection.close();
  });

  const mockUser = {
    firstName: "test",
    lastName: "test",
    age: 25,
    email: "test@test.com.ar",
    password: "123",
  };

  it("El endpoint /api/sessions/register debe registrar un usuario", async () => {
    const register = await requester
      .post("/api/sessions/register")
      .send(mockUser);
    expect(register.ok).to.be.true;
    expect(register.statusCode).to.be.equal(200);
  });

  it("El endpoint /api/sessions/login debe loguearse correctamente", async () => {
    const login = await requester
      .post("/api/sessions/login")
      .send({ email: mockUser.email, password: mockUser.password });
    expect(login.ok).to.be.true;
    expect(login.statusCode).to.be.equal(200);
  });

  it("El endpoint /api/sessions/current debe traer los datos del usuario logueado", async () => {
    const current = await requester.get("/api/sessions/current");
    expect(current.ok).to.be.true;
    expect(current.body).to.have.property("user");
    expect(current.body.user).to.have.property("firstName");
    expect(current.body.user.firstName).to.be.equal("test");
  });
});
