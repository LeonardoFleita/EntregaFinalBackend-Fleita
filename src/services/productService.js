const { transport } = require("../utils/transportMailing");

class ProductService {
  constructor(productManager) {
    this.manager = productManager;
  }

  //Trae los productos

  getProducts = async (limit, page, sort, category, avaiability) => {
    try {
      return await this.manager.getProducts(
        limit,
        page,
        sort,
        category,
        avaiability
      );
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Trae el producto buscado

  getProductById = async (prodId) => {
    try {
      if (prodId === ":pId") {
        throw new Error("invalid parameters");
      }
      return this.manager.getProductById(prodId);
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Crea un producto

  addProduct = async (
    title,
    description,
    price,
    thumbnail,
    code,
    stock,
    category,
    status,
    owner
  ) => {
    try {
      if (!title || !description || !price || !code || !stock || !category) {
        throw new Error("invalid product data");
      }
      return this.manager.addProduct(
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        category,
        status,
        owner
      );
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Modifica un producto

  updateProduct = async (product, user) => {
    try {
      if (product.id === ":pId") {
        throw new Error("invalid parameters");
      }
      const wantedProduct = await this.manager.getProductById(product.id);
      if (user.role === "user" && user.email !== wantedProduct.owner) {
        throw new Error("not authorized");
      }
      await this.manager.updateProduct(product);
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Elimina un producto

  deleteProduct = async (prodId, user) => {
    try {
      if (prodId === ":pId") {
        throw new Error("invalid parameters");
      }
      const wantedProduct = await this.manager.getProductById(prodId);
      if (user.role === "user" && user.email !== wantedProduct.owner) {
        throw new Error("not authorized");
      }
      if (wantedProduct.owner !== "admin") {
        await transport.sendMail({
          from: process.env.GMAIL_ACCOUNT,
          to: user.email,
          subject: "Producto eliminado",
          text: `Se ha eliminado el siguiente producto: ${wantedProduct.title}`,
        });
      }
      await this.manager.deleteProduct(prodId);
    } catch (err) {
      throw Error(err.message);
    }
  };
}

module.exports = { ProductService };
