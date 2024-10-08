const CartModel = require(`../models/cart.model`);
const ProductModel = require("../models/product.model");

class CartManager {
  constructor() {}

  //Trae todos los carritos

  getCarts = async () => {
    try {
      const carts = await CartModel.find();
      return carts.map((c) => c.toObject({ virtuals: true }));
    } catch (err) {
      return [];
    }
  };

  //Crea un nuevo carrito

  addCart = async () => {
    try {
      return await CartModel.create({ products: [] });
    } catch (err) {
      throw new Error(err.message);
    }
  };

  //Busca un carrito por su id

  getCartById = async (cartId) => {
    try {
      const findedCart = await CartModel.findOne({ _id: cartId });
      if (!findedCart) {
        throw new Error(`not found`);
      }
      return findedCart;
    } catch (err) {
      throw Error("not found");
    }
  };

  //Hice el siguiente método exclusivo para la petición get del router para no tener que modificar datos en los métodos que utilizan getCartById

  getCartByIdPopulate = async (cartId) => {
    try {
      const findedCart = await CartModel.findOne({ _id: cartId })
        .populate("products.product")
        .lean();
      if (!findedCart) {
        throw new Error(`not found`);
      }
      return findedCart;
    } catch (err) {
      throw Error("not found");
    }
  };

  //Agrega un producto al carrito

  addProductToCart = async (cartId, productId, user) => {
    try {
      try {
        await this.getCartById(cartId);
        let findedProduct = await ProductModel.findOne({ _id: productId });
        if (!findedProduct) {
          throw new Error("not found");
        }
        if (findedProduct.owner === user.email) {
          throw new Error("not authorized");
        }
      } catch (err) {
        throw Error(err.message);
      }
      let previousProduct = await CartModel.find({
        _id: cartId,
        "products.product": productId,
      });
      if (previousProduct.length < 1) {
        await CartModel.updateOne(
          { _id: cartId },
          {
            $push: {
              products: { product: productId, quantity: 1 },
            },
          }
        );
      } else {
        await CartModel.updateOne(
          { _id: cartId, "products.product": productId },
          {
            $inc: {
              "products.$.quantity": 1,
            },
          }
        );
      }
      return { product: productId, quantity: 1 };
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Limpiar carrito

  cleanCart = async (cartId) => {
    try {
      await CartModel.updateOne({ _id: cartId }, { $set: { products: [] } });
      return await CartModel.find({ _id: cartId });
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Eliminar producto del carrito

  deleteProductFromCart = async (cartId, productId) => {
    try {
      let findedCart = await this.getCartById(cartId);
      if (!findedCart) {
        throw Error();
      }
      let products = findedCart.products;
      let findedProduct = products.find(
        (p) => p.product.toString() === productId
      );
      if (!findedProduct) {
        throw new Error("not found");
      }
      await CartModel.findOneAndUpdate(
        { _id: cartId },
        { $pull: { products: { product: productId } } }
      );
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Actualiza productos del carrito

  updateProductsFromCart = async (cartId, data) => {
    try {
      try {
        await this.getCartById(cartId);
      } catch (err) {
        throw new Error(err.message);
      }
      await CartModel.updateOne({ _id: cartId }, { $set: { products: data } });
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Actualiza la cantidad de un producto del carrito

  updateQuantityProductFromCart = async (cartId, productId, data) => {
    try {
      let findedCart = await this.getCartById(cartId);
      if (!findedCart) {
        throw Error();
      }
      let products = findedCart.products;
      let findedProduct = products.find(
        (p) => p.product.toString() === productId
      );
      if (!findedProduct) {
        throw new Error("not found");
      }
      const updated = await CartModel.findOneAndUpdate(
        { _id: cartId },
        { $set: { "products.$[elem].quantity": data.quantity } },
        { arrayFilters: [{ "elem.product": productId }], new: true }
      );
      return updated;
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Elimina carritos

  deleteCarts = async (carts) => {
    try {
      try {
        const wantedCarts = await CartModel.find({ _id: { $in: carts } });
        if (wantedCarts.length < carts.length) {
          throw Error();
        }
      } catch (err) {
        throw new Error("not found");
      }
      await CartModel.deleteMany({ _id: { $in: carts } });
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Eliminar un carrito

  deleteCartById = async (cartId) => {
    try {
      await this.getCartById(cartId);
      await CartModel.deleteOne({ _id: cartId });
    } catch (err) {
      throw Error(err.message);
    }
  };
}

module.exports = CartManager;
