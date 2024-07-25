const ProductModel = require("../models/product.model");

class ProductManager {
  constructor() {}

  //El filtro de avaiability devuelve los productos que tengan un stock igual o superior al número solicitado en params. El sort funciona con "asc" y "desc"

  getProducts = async (limit, page, sort, category, avaiability) => {
    try {
      limit = limit ? parseInt(limit) : 10;
      page = page ? parseInt(page) : 1;
      let filter = {};
      category && (filter = { ...filter, category });
      avaiability &&
        (filter = { ...filter, stock: { $gte: parseInt(avaiability) } });
      let paginateOptions = { limit, page, lean: true };
      if (sort && (sort === "asc" || sort === "desc")) {
        paginateOptions.sort = { price: sort === "desc" ? -1 : 1 };
      }
      const products = await ProductModel.paginate(filter, paginateOptions);
      return products;
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Buscar un producto con su id

  getProductById = async (prodId) => {
    try {
      const findedProduct = await ProductModel.findOne({ _id: prodId });
      if (!findedProduct) {
        throw new Error(`not found`);
      }
      return findedProduct;
    } catch (err) {
      throw Error("not found");
    }
  };

  //Crear un nuevo producto

  addProduct = async (
    title,
    description,
    price,
    thumbnail,
    code,
    stock,
    category,
    status = true,
    owner = "admin"
  ) => {
    try {
      await ProductModel.create({
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        category,
        status,
        owner,
      });
    } catch (err) {
      throw Error(err);
    }
  };

  //Actualizar un producto

  updateProduct = async (product) => {
    try {
      await ProductModel.updateOne({ _id: product.id }, { $set: product });
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Eliminar producto

  deleteProduct = async (prodId) => {
    try {
      await ProductModel.deleteOne({ _id: prodId });
    } catch (err) {
      throw Error(err.message);
    }
  };
}

module.exports = ProductManager;
