const { Router } = require("express");
const { Article, User, Comment } = require("../db/index");
const auth = require("./auth");
const route = Router();
const { Sequelize } = require("sequelize");
const Op = Sequelize.Op;


module.exports = route;
