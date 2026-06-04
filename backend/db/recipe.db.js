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
const { createTagWithId, getTagByName } = require("./tags.db.js");

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
    // If caller provided rawTags (from Spoonacular), convert them to Firestore tag IDs
    let tagsToSave = recipeData.tags || [];
    const rawTags = recipeData.rawTags || [];

    if ((!tagsToSave || tagsToSave.length === 0) && rawTags && rawTags.length > 0) {
        const normalized = Array.from(new Set(rawTags.map(t => (t || '').trim().toLowerCase()).filter(Boolean)));
        const resolvedTagIds = [];

        for (const name of normalized) {
            try {
                const existingTag = await getTagByName(name);
                if (existingTag) {
                    resolvedTagIds.push(existingTag.id);
                } else {
                    const customTagId = `tag_${name.replace(/\s+/g, '_')}`;
                    const newTag = await createTagWithId(customTagId, name);
                    resolvedTagIds.push(newTag.id || newTag.tagId || customTagId);
                }
            } catch (err) {
                console.error(`Failed to resolve tag "${name}":`, err);
            }
        }

        if (resolvedTagIds.length > 0) tagsToSave = resolvedTagIds;
    }

    if (!existing.exists()) {
        await setDoc(recipeRef, {
            recipeId,
            isExternal: true,
            status: "approved",
            createdAt: Timestamp.now(),
            averageRating: 0,
            ratingCount: 0,
            tags: tagsToSave,
            ...recipeData,
        });
    } else {
        try {
            const existingData = existing.data() || {};
            const existingTags = existingData.tags || [];
            if ((!existingTags || existingTags.length === 0) && tagsToSave && tagsToSave.length > 0) {
                await updateDoc(recipeRef, { tags: tagsToSave });
            }
        } catch (err) {
            console.error(`Failed to update existing recipe ${recipeId} with tags:`, err);
        }
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

// Search approved recipes by title (case-insensitive, in-memory filter)
const searchApprovedRecipes = async (searchTerm) => {
    const q = query(collection(db, "recipes"), where("status", "==", "approved"));
    const snapshot = await getDocs(q);
    const term = searchTerm.toLowerCase();
    return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((r) => r.title && r.title.toLowerCase().includes(term));
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
    searchApprovedRecipes,
    updateRecipe,
    approveRecipe,
    updateRecipeRating,
    deleteRecipe,
};