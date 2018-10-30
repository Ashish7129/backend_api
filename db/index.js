const Sequelize = require("sequelize");
const { vendor, product, user } = require("./models");
var jwt = require("jsonwebtoken");
const secret = "Hello this is my jwtToken";
var bcrypt = require("bcryptjs");

const db = new Sequelize({
  dialect: "sqlite",
  storage: __dirname + "/store.db"
});

const Vendor = db.define("vendor", vendor);
const Product = db.define("product", product);
const User = db.define("user", user);
User.prototype.generateToken = function() {
  return jwt.sign(
    {
      id: this.id
    },
    secret,
    {
      expiresIn: 86400
    }
  );
};
User.prototype.validpassword = function(pass) {
  if (bcrypt.compareSync(pass, this.password)) {
    return true;
  }
  return false;
};

Product.belongsTo(Vendor);
Vendor.hasMany(Product);

module.exports = {
  db,
  Vendor,
  Product,
  User
};
