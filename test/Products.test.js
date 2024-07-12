const supertest = require("supertest");

const requester = supertest("http://localhost:8080");

describe("Testing de products", () => {
  let chai;
  let expect;

  before(async function () {
    chai = await import("chai");
    expect = chai.expect;
    this.timeout(10000);
  });

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
    expect(response.body.payload).to.have.property(_id);
  });

  it("Debe traer todos los productos", async () => {
    const { statusCode, ok, body } = await requester.get("/api/products");

    expect(statusCode).to.be.equal(200);
    expect(ok).to.be.true;
    expect(body).to.be.have.property("payload");
  });

  it("Debe traer un producto por id", async () => {
    const { statusCode, ok, body } = await requester.get(
      "/api/products/664ccd4838cb54ad7e41dcad"
    );

    expect(statusCode).to.be.equal(200);
    expect(ok).to.be.true;
    expect(body).to.be.have.property("payload");
  });
});
