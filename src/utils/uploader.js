const multer = require("multer");

const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder;
    let type = req.body.type;
    if (
      type === "profile" ||
      type === "identification" ||
      type === "account" ||
      type === "adress"
    ) {
      folder = `profiles`;
    } else if (type === `product`) {
      folder = `products`;
    } else {
      folder = `documents`;
    }
    cb(null, `${__dirname}/../../public/files/${folder}`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/../../public/files/products`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const userDocs = multer({ storage: userStorage });
const productDocs = multer({ storage: productStorage });

module.exports = { userDocs, productDocs };
