const {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    setDoc,
    Timestamp,
} = require("firebase/firestore");
const db = require("../firebase.js");

// Create a new user-submitted recipe
const createRecipe = async (recipeData) => {
    const newRecipe = {
        isExternal: false,
        title: recipeData.title || "",
        description: recipeData.description || "",
        ingredients: recipeData.ingredients || [],
        instructions: recipeData.instructions || [],
        readyInMinutes: recipeData.readyInMinutes || 0,
        imageUrl: recipeData.imageUrl || "",
        userId: recipeData.userId,
        creatorName: recipeData.creatorName || "",
        status: "pending",
        createdAt: Timestamp.now(),
        tags: recipeData.tags || [],
        averageRating: 0,
        ratingCount: 0,
        ...recipeData,
    };
    const docRef = await addDoc(collection(db, "recipes"), newRecipe);
    return { id: docRef.id, ...newRecipe };
};

// Save or cache an external (Spoonacular) recipe by its external ID
const saveExternalRecipe = async (recipeId, recipeData) => {
    const recipeRef = doc(db, "recipes", recipeId);
    const existing = await getDoc(recipeRef);
    if (!existing.exists()) {
        await setDoc(recipeRef, {
            recipeId,
            isExternal: true,
            status: "approved",
            createdAt: Timestamp.now(),
            averageRating: 0,
            ratingCount: 0,
            ...recipeData,
        });
    }
    return { id: recipeId, ...recipeData };
};

// Get a single recipe by Firestore document ID
const getRecipeById = async (recipeId) => {
    const recipeDoc = await getDoc(doc(db, "recipes", recipeId));
    return recipeDoc.exists() ? { id: recipeDoc.id, ...recipeDoc.data() } : null;
};

// Get all recipes (admin use)
const getAllRecipes = async () => {
    const snapshot = await getDocs(collection(db, "recipes"));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get all approved recipes (public feed)
const getApprovedRecipes = async () => {
    const q = query(collection(db, "recipes"), where("status", "==", "approved"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get all pending recipes (admin review queue)
const getPendingRecipes = async () => {
    const q = query(collection(db, "recipes"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get all recipes submitted by a specific user
const getRecipesByUser = async (userId) => {
    const q = query(collection(db, "recipes"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get recipes by a tag ID
const getRecipesByTag = async (tagId) => {
    const q = query(collection(db, "recipes"), where("tags", "array-contains", tagId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Update arbitrary fields on a recipe
const updateRecipe = async (recipeId, updates) => {
    const recipeRef = doc(db, "recipes", recipeId);
    await updateDoc(recipeRef, updates);
};

// Approve a pending recipe
const approveRecipe = async (recipeId) => {
    await updateDoc(doc(db, "recipes", recipeId), { status: "approved" });
};

// Update a recipe's average rating (called after a new comment/rating is saved)
const updateRecipeRating = async (recipeId, newAverageRating, newRatingCount) => {
    await updateDoc(doc(db, "recipes", recipeId), {
        averageRating: newAverageRating,
        ratingCount: newRatingCount,
    });
};

// Delete a recipe
const deleteRecipe = async (recipeId) => {
    await deleteDoc(doc(db, "recipes", recipeId));
};

module.exports = {
    createRecipe,
    saveExternalRecipe,
    getRecipeById,
    getAllRecipes,
    getApprovedRecipes,
    getPendingRecipes,
    getRecipesByUser,
    getRecipesByTag,
    updateRecipe,
    approveRecipe,
    updateRecipeRating,
    deleteRecipe,
};