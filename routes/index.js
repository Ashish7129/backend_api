const Router = require("express");
const route = Router();

route.use("/vendors", require("./vendors"));
route.use("/products", require("./products"));
route.use("/", require("./user"));

module.exports = route;
