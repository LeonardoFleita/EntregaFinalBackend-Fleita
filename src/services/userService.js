class UserService {
  constructor(userManager) {
    this.manager = userManager;
  }

  getUsers = async () => {
    try {
      const users = await this.manager.getUsers();
      return users;
    } catch (err) {
      throw Error(err.message);
    }
  };

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

  getUserByEmail = async (email) => {
    try {
      return await this.manager.getUserByEmail(email);
    } catch (err) {
      throw Error(err.message);
    }
  };

  updateUser = async (user) => {
    try {
      await this.manager.updateUser(user);
    } catch (err) {
      throw Error(err.message);
    }
  };

  deleteUsers = async (users) => {
    try {
      await this.manager.deleteUsers(users);
    } catch (err) {
      throw Error(err.message);
    }
  };

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
