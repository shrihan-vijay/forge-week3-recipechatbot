const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./firebase");
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js");
const recipeRoutes = require("./routes/recipe.routes.js");
const tagRoutes = require("./routes/tag.routes.js");
const commentRoutes = require("./routes/comment.routes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/recipe", recipeRoutes);
app.use("/tag", tagRoutes);
app.use("/comment", commentRoutes);

app.get("/", (req, res) => {
  res.send("Express backend is running and Firebase is connected");
});

module.exports = app;