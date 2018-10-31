const { Router } = require("express");
const { Article, User, Comment } = require("../db/index");
const auth = require("./auth");
const route = Router();
const { Sequelize } = require("sequelize");
const Op = Sequelize.Op;

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
  const comments = await Comment.findAll({
    where: {
      userId: article.userId
    }
  });
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
});

module.exports = route;
