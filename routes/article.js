const { Router } = require("express");
const { Article, User } = require("../db/index");
const auth = require("./auth");
const route = Router();

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
    newArticle.author = {
      username: user.username,
      bio: user.bio,
      image: user.image
    };
    newArticle.save();
    res.status(201).json({
      article: newArticle
    });
  } catch (e) {
    res.status(400).send("Error");
  }
});
module.exports = route;
