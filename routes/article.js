const { Router } = require("express");
const { Article, User, Comment } = require("../db/index");
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
      userId: req.payload.id
    },
    include: [
      {
        model: User,
        attributes: ["username", "bio", "image"]
      }
    ]
  });
  if (!article) {
    res.status(404).send("Article Not Found");
  }
  if (typeof req.body.article.title !== undefined) {
    article.title = req.body.article.title;
    article.slug = article.slugify();
  }
  if (typeof req.body.article.body !== undefined) {
    article.body = req.body.article.body;
  }
  if (typeof req.body.article.description !== undefined) {
    article.description = req.body.article.description;
  }
  await article.save();
  res.json({ article: article.toJson() });
});

//DELETE /api/articles/:slug
route.delete("/:slug", auth.required, async (req, res) => {
  const article = await Article.findOne({
    where: {
      slug: req.params.slug,
      userId: req.payload.id
    }
  });
  if (!article) {
    res.status(404).send("Article Not Found");
  }
  await article.destroy();
  res.status(201).send("Deleted");
});

//POST /api/articles/:slug/comments(Auth required)
route.post("/:slug/comments", auth.required, async (req, res) => {
  const article = await Article.findOne({
    where: {
      slug: req.params.slug
    }
  });
  if (!article) {
    return res.sendStatus(404).send("Not Found");
  }
  try {
    const comment = await Comment.create({
      body: req.body.comment.body,
      articleId: article.id,
      userId: req.payload.id
    });
    await comment.save();
    const newComment = await Comment.findOne({
      where: {
        id: comment.id
      },
      include: [
        {
          model: User,
          attributes: ["username", "bio", "image"]
        }
      ]
    });
    res.status(201).json({
      comment: newComment.toJson()
    });
  } catch (e) {
    res.status(400).send("Error");
  }
});
//GET / api / articles /: slug / comments (Auth optional)

route.get("/:slug/comments", auth.optional, async (req, res) => {
  const article = await Article.findOne({
    where: {
      slug: req.params.slug
    }
  });
  if (!article) {
    res.status(404).send("Article Not Found");
  }
  try {
    const comments = await Comment.findAll({
      where: {
        userId: article.userId
      },
      include: [
        {
          model: User,
          attributes: ["username", "bio", "image"]
        }
      ]
    });
    console.log(comments);
    if (!comments) {
      res.status(404).send("Comments Not Found");
    }
    let allComments = [];
    for (let comment of comments) {
      allComments.push(comment.toJson());
    }

    res.status(201).json({
      comments: allComments
    });
  } catch (e) {
    res.status(400).send("Error");
  }
});

//DELETE / api / articles /: slug / comments /: id (Auth required)

route.delete("/:slug/comments/:id", auth.required, async (req, res) => {
  const article = await Article.findOne({ where: { slug: req.params.slug } });
  if (!article) {
    res.status(404).send("Article Not Found");
  }
  const comment = await Comment.findOne({
    where: {
      userId: req.payload.id,
      articleId: article.id,
      id: req.params.id
    }
  });
  if (!comment) {
    res.status(404).send("Comment Not Found");
  }
  await comment.destroy();
  res.status(201).send("Deleted");
});

module.exports = route;
