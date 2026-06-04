const express = require("express");
const {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  query,
  where,
} = require("firebase/firestore");

const db = require("../firebase.js");
const { getRecipesByUser, deleteRecipe } = require("../db/recipe.db.js");

const router = express.Router();

// GET saved recipes with full recipe details
router.get("/saved/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const savedQuery = query(
      collection(db, "savedRecipes"),
      where("userId", "==", String(userId))
    );

    const savedSnapshot = await getDocs(savedQuery);

    const savedRecipes = await Promise.all(
      savedSnapshot.docs.map(async (savedDoc) => {
        const savedData = savedDoc.data();
        const recipeId = String(savedData.recipeId);
        const source = savedData.source;

        const collectionName = "recipes";

        const recipeRef = doc(db, collectionName, recipeId);
        const recipeSnapshot = await getDoc(recipeRef);

        if (!recipeSnapshot.exists()) {
          return null;
        }

        return {
          savedId: savedDoc.id,
          id: recipeSnapshot.id,
          recipeId,
          source,
          savedAt: savedData.savedAt,
          ...recipeSnapshot.data(),
        };
      })
    );

    res.status(200).json(savedRecipes.filter(Boolean));
  } catch (error) {
    console.error("Error fetching saved recipes:", error);
    res.status(500).json({ message: "Error fetching saved recipes" });
  }
});

// GET recipes created by user
router.get("/created/:userId", async (req, res) => {
  try {
    const recipes = await getRecipesByUser(req.params.userId);
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching created recipes:", error);
    res.status(500).json({ message: "Error fetching created recipes" });
  }
});

// DELETE saved recipe
router.delete("/saved/:savedId", async (req, res) => {
  try {
    await deleteDoc(doc(db, "savedRecipes", req.params.savedId));

    res.status(200).json({ message: "Saved recipe removed" });
  } catch (error) {
    console.error("Error removing saved recipe:", error);
    res.status(500).json({ message: "Error removing saved recipe" });
  }
});

// DELETE created recipe
router.delete("/created/:recipeId", async (req, res) => {
  try {
    await deleteRecipe(req.params.recipeId);

    res.status(200).json({ message: "Recipe deleted" });
  } catch (error) {
    console.error("Error deleting created recipe:", error);
    res.status(500).json({ message: "Error deleting created recipe" });
  }
});

module.exports = router;