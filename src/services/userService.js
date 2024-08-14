class UserService {
  constructor(userManager) {
    this.manager = userManager;
  }

  //Trae todos los usuarios

  getUsers = async () => {
    try {
      const users = await this.manager.getUsers();
      return users;
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Busca un usuario por su id

  getUserById = async (id) => {
    try {
      if (id === ":uId") {
        throw new Error("invalid parameters");
      }
      return await this.manager.getUserById(id);
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Busca un usuario por su email

  getUserByEmail = async (email) => {
    try {
      return await this.manager.getUserByEmail(email);
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Actualiza un usuario

  updateUser = async (user) => {
    try {
      await this.manager.updateUser(user);
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Elimina múltiples usuarios

  deleteUsers = async (users) => {
    try {
      await this.manager.deleteUsers(users);
    } catch (err) {
      throw Error(err.message);
    }
  };

  //Elimina un usuario

  deleteUserById = async (userId) => {
    try {
      if (userId === ":uId") {
        throw new Error("invalid parameters");
      }
      await this.manager.deleteUserById(userId);
    } catch (err) {
      throw Error(err.message);
    }
  };
}

module.exports = { UserService };
