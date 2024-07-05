class UserService {
  constructor(userManager) {
    this.manager = userManager;
  }

  getUserById = async (id) => {
    try {
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
}

module.exports = { UserService };
