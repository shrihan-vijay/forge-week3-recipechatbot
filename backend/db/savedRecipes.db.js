const {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  Timestamp,
} = require("firebase/firestore");

const { db } = require("../firebase");

const saveRecipe = async (savedRecipeData) => {
  const docRef = await addDoc(collection(db, "savedRecipes"), {
    ...savedRecipeData,
    savedAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    ...savedRecipeData,
  };
};

const getSavedRecipesByUser = async (userId) => {
  const q = query(
    collection(db, "savedRecipes"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

const deleteSavedRecipe = async (savedRecipeId) => {
  await deleteDoc(doc(db, "savedRecipes", savedRecipeId));
};

module.exports = {
  saveRecipe,
  getSavedRecipesByUser,
  deleteSavedRecipe,
};