const express = require("express");
const { addDoc, collection, Timestamp } = require("firebase/firestore");
const { db } = require("../firebase");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const docRef = await addDoc(collection(db, "savedRecipes"), {
      ...req.body,
      savedAt: Timestamp.now(),
    });

    res.status(201).json({
      id: docRef.id,
      ...req.body,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save recipe" });
  }
});

module.exports = router;