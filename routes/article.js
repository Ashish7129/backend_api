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

    newArticle.save();
    res.status(201).json({
      article: {
        title: newArticle.title,
        description: newArticle.description,
        body: newArticle.body,
        userId: user.id,
        updatedAt: newArticle.updatedAt,
        createdAt: newArticle.createdAt,
        slug: newArticle.slug,
        author: {
          username: user.username,
          bio: user.bio,
          image: user.image
        }
      }
    });
  } catch (e) {
    res.status(400).send("Error");
  }
});

//GET THE ARTICLES
// route.get("/", async (req, res) => {
//   const limit = 20;
//   const offset = 0;
//   const author = await Article.author.findAll({
//     where: {
//       username: req.query.author
//     }
//   });
//   console.log(author.username);
//   for (let key of Object.keys(req.query)) {
//     switch (key) {
//       case "limit":
//         limit = parseInt(req.query.limit);
//         break;
//       case "offset":
//         offset = parseInt(req.query.offset);
//         break;
//       case "author":
//         const username = author.username;
//         break;
//     }
//   }
// });
module.exports = route;
