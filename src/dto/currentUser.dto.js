const moment = require("moment-timezone");

class CurrentUserDto {
  constructor(user) {
    this.id = user._id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.role = user.role;
    this.cart = user.cart;
    this.premium = user.role === "user" ? user.premium : null;
    this.lastConnection = user.lastConnection
      ? moment(user.lastConnection)
          .tz("America/Argentina/Buenos_Aires")
          .format("YYYY-MM-DD HH:mm:ss")
      : null;
  }
}

module.exports = { CurrentUserDto };
