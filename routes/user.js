const { Router } = require("express");
const { User } = require("../db/index");
var bcrypt = require("bcryptjs");
var auth = require("./auth");

const route = Router();

//GET CURRENT USER
route.get("/user", auth.required, async (req, res) => {
  const user = await User.findByPk(req.payload.id);
  if (user) {
    //console.log(user);
    //user.token = getTokenFromHeader(req);
    res.status(200).json({ user: user });
  } else {
    res.status(401);
  }
});

//LOGIN THE USER
route.post("/users/login", async (req, res) => {
  if (!req.body.email) {
    res.status(422).json({ errors: { email: "can't be blank" } });
  }
  if (!req.body.password) {
    res.status(422).json({ errors: { password: "can't be blank" } });
  } else {
    const user = await User.findOne({ where: { email: req.body.email } });
    console.log(user);
    if (!user || !user.validpassword(req.body.password)) {
      res.status(422).json({ errors: { "email or password": "is invalid" } });
    } else {
      user.token = user.generateToken();
      user.save();
      res.status(201).json({ user: user });
    }
  }
});

//CREATE THE NEW USER
route.post("/users", async (req, res) => {
  // ideally use try catch here too
  try {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    newUser.token = newUser.generateToken();
    newUser.save();
    res.status(201).json({
      user: newUser
    });
  } catch (e) {
    res.status(500).send("There was a problem adding the information");
  }
});

//UPDATE THE USER
route.put("/user", auth.required, async (req, res, next) => {
  const user = await User.findByPk(req.payload.id);
  console.log(user);
  if (!user) {
    return res.sendStatus(401);
  }

  // only update fields that were actually passed...
  if (typeof req.body.username !== undefined) {
    user.username = req.body.user.username;
  }
  if (typeof req.body.email !== undefined) {
    user.email = req.body.user.email;
  }
  if (typeof req.body.bio !== undefined) {
    user.bio = req.body.user.bio;
  }
  if (typeof req.body.image !== undefined) {
    user.image = req.body.user.image;
  }
  if (typeof req.body.password !== undefined) {
    user.password = bcrypt.hashSync(req.body.user.password, 8);
  }
  await user.save();
  console.log(user);
  //user.token = getTokenFromHeader(req);
  return res.status(201).json({ user: user });
});

//GET / api / profiles /: username
route.get("/profile/:username", auth.optional, async (req, res) => {
  const user = await User.findOne({ where: { username: req.params.username } });
  console.log(user);
  if (user.image == null) {
    user.image = "https://static.productionready.io/images/smiley-cyrus.jpg";
    user.save();
  }
  res.status(201).json({
    profile: {
      username: user.username,
      bio: user.bio,
      image: user.image
    }
  });
});

module.exports = route;
