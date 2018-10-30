const Sequelize = require("sequelize");
const { vendor, product, user, article } = require("./models");
var jwt = require("jsonwebtoken");
const secret = "Hello this is my jwtToken";
var bcrypt = require("bcryptjs");
var slug = require("slug");

const db = new Sequelize({
  dialect: "sqlite",
  storage: __dirname + "/store.db"
});

const Vendor = db.define("vendor", vendor);
const Product = db.define("product", product);
const User = db.define("user", user);
const Article = db.define("article", article);

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
Article.prototype.slugify = function() {
  this.slug =
    slug(this.title) +
    "-" +
    ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  return this.slug;
};
Product.belongsTo(Vendor);
Vendor.hasMany(Product);

Article.belongsTo(User);
User.hasMany(Article);

module.exports = {
  db,
  Vendor,
  Product,
  User,
  Article
};
