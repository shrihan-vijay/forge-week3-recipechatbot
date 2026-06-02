const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/recipes", async (req, res) => {
  try {
    const search = req.query.search || "";

    const response = await axios.get(
      "https://api.spoonacular.com/recipes/complexSearch",
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          query: search,
          number: 12,
          addRecipeInformation: true,
        },
      }
    );

    res.status(200).json(response.data.results);
  } catch (error) {
    console.error("Spoonacular error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch Spoonacular recipes" });
  }
});

module.exports = router;