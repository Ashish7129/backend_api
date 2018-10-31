const { Router } = require("express");
const { Article, User } = require("../db/index");
const auth = require("./auth");
const route = Router();
const { Sequelize } = require("sequelize");
const Op = Sequelize.Op;

//POST /api/articles
route.post("/", auth.required, async (req, res) => {
  const user = await User.findOne({ where: { id: req.payload.id } });
  console.log(user.id);
  if (!user) {
    return res.sendStatus(401);
  }
  try {
    const newArticle = await Article.create({
      title: req.body.article.title,
      description: req.body.article.description,
      body: req.body.article.description,
      userId: user.id
    });
    newArticle.slug = newArticle.slugify();
    await newArticle.save();
    const newArticl = await Article.findOne({
      where: {
        slug: newArticle.slug
      },
      include: [
        {
          model: User,
          attributes: ["username", "bio", "image"]
        }
      ]
    });
    res.status(201).json({
      article: newArticl.toJson()
    });
  } catch (e) {
    res.status(400).send("Error");
  }
});
//GET THE ARTICLE USING SLUG
route.get("/:slug", async (req, res) => {
  const article = await Article.findOne({
    where: {
      slug: req.params.slug
    },
    include: [
      {
        model: User,
        attributes: ["username", "bio", "image"]
      }
    ]
  });
  res.json({ article: article.toJson() });
});

//GET THE ARTICLES
route.get("/", async (req, res) => {
  let limit = 20;
  let offset = 0;
  let whereClause = [];
  for (let key of Object.keys(req.query)) {
    switch (key) {
      case "limit":
        limit = parseInt(req.query.limit);
        break;
      case "offset":
        offset = parseInt(req.query.offset);
        break;
      case "author":
        const author = await User.findOne({
          where: {
            username: req.query.author
          }
        });
        if (!author) {
          res.status(401).send("Articles not found");
        }
        whereClause.push({
          userId: author.id
        });
        break;
    }
  }
  const articles = await Article.findAll({
    where: {
      [Op.and]: whereClause
    },
    include: [User],
    order: [["createdAt", "DESC"]],
    limit: limit,
    offset: offset
  });
  let allArticles = [];
  for (let article of articles) {
    allArticles.push(article.toJson());
  }
  res.status(201).json({
    articles: allArticles,
    articlesCount: allArticles.length
  });
});

//PUT / api / articles /: slug
route.put("/:slug", auth.required, async (req, res) => {
  const article = await Article.findOne({
    where: {
      slug: req.params.slug,
      userId:req.payload.id
    }
  });
  article.
});
//DELETE /api/articles/:slug
route.delete("/:slug", auth.required, async (req, res) => {});
module.exports = route;
