const { hashPassword } = require("../../utils/hashing");
const UserModel = require("../models/user.model");

class UserManager {
  constructor() {}

  //Traer todos los usuarios

  getUsers = async () => {
    try {
      let users = await UserModel.find();
      users = users.map((u) => u.toObject());
      return users;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  //Crea un nuevo usuario

  registerUser = async (
    firstName,
    lastName,
    age,
    email,
    password,
    cart,
    role
  ) => {
    try {
      let user = await UserModel.create({
        firstName,
        lastName,
        age,
        email,
        password: hashPassword(password),
        cart,
        role,
      });
      return user;
    } catch (err) {
      throw Error(err);
    }
  };

  //Busca un usuario por id

  getUserById = async (id) => {
    try {
      const user = await UserModel.findOne({ _id: id }).lean();
      if (!user) {
        throw new Error("not found");
      }
      return user;
    } catch (err) {
      throw Error("not found");
    }
  };

  //Busca un usuario por email

  getUserByEmail = async (email) => {
    try {
      const user = await UserModel.findOne({ email });
      return user ? user.toObject() : null;
    } catch (err) {
      throw Error(err);
    }
  };

  //Actualiza un usuario

  updateUser = async (user) => {
    try {
      await UserModel.updateOne({ _id: user._id }, { $set: { ...user } });
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Eliminar múltiples usuarios

  deleteUsers = async (users) => {
    try {
      try {
        const wantedUsers = await UserModel.find({ _id: { $in: users } });
        if (wantedUsers.length < users.length) {
          throw Error();
        }
      } catch (err) {
        throw new Error("not found");
      }
      await UserModel.deleteMany({ _id: { $in: users } });
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Eliminar un usuario
  deleteUserById = async (userId) => {
    try {
      await this.getUserById(userId);
      await UserModel.deleteOne({ _id: userId });
    } catch (err) {
      throw Error(err.message);
    }
  };
}

module.exports = UserManager;
