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
      try {
        if (product.id === ":pId") {
          throw new Error("invalid parameters");
        }
        const wantedProduct = await this.manager.getProductById(product.id);
        if (user.role === "user" && user.email !== wantedProduct[0].owner) {
          throw new Error("Not authorized");
        }
      } catch (err) {
        throw Error(err.message);
      }
      await this.manager.updateProduct(product);
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Elimina un producto

  deleteProduct = async (prodId, user) => {
    try {
      try {
        if (prodId === ":pId") {
          throw new Error("invalid parameters");
        }
        const wantedProduct = await this.manager.getProductById(prodId);
        if (user.role === "user" && user.email !== wantedProduct[0].owner) {
          throw new Error("Not authorized");
        }
      } catch (err) {
        throw Error(err.message);
      }
      await this.manager.deleteProduct(prodId);
    } catch (err) {
      throw Error(err.message);
    }
  };
}

module.exports = { ProductService };
