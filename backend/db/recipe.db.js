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

// Save an official Spoonacular recipe into recipes collection
const saveExternalRecipe = async (recipeId, recipeData = {}) => {
    const recipeRef = doc(db, "recipes", String(recipeId));
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
            recipeId: String(recipeId),
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

    return {
        id: String(recipeId),
        recipeId: String(recipeId),
        isExternal: true,
        ...recipeData,
    };
};

// Save a recipe reference for a user
const saveRecipeForUser = async (userId, recipeId, source) => {
    const cleanUserId = String(userId);
    const cleanRecipeId = String(recipeId);
    const cleanSource = String(source);

    const savedRecipeId = `${cleanUserId}_${cleanSource}_${cleanRecipeId}`;
    const savedRecipeRef = doc(db, "savedRecipes", savedRecipeId);

    const savedRecipe = {
        userId: cleanUserId,
        recipeId: cleanRecipeId,
        source: cleanSource,
        savedAt: Timestamp.now(),
    };

    await setDoc(savedRecipeRef, savedRecipe, { merge: true });

    return {
        id: savedRecipeId,
        ...savedRecipe,
    };
};

// Get saved recipe references for a user
const getSavedRecipesByUser = async (userId) => {
    const q = query(
        collection(db, "savedRecipes"),
        where("userId", "==", String(userId))
    );

    const snapshot = await getDocs(q);

    const recipes = await Promise.all(
        snapshot.docs.map(async (savedDoc) => {
            const savedData = savedDoc.data();

            const recipeDoc = await getDoc(
                doc(db, "recipes", String(savedData.recipeId))
            );

            if (!recipeDoc.exists()) {
                return {
                    savedId: savedDoc.id,
                    ...savedData,
                };
            }

            return {
                savedId: savedDoc.id,
                ...savedData,
                id: recipeDoc.id,
                ...recipeDoc.data(),
            };
        })
    );

    return recipes;
};

// Get a single community recipe by Firestore document ID
const getRecipeById = async (recipeId) => {
  const recipeDoc = await getDoc(doc(db, "recipes", String(recipeId)));
  return recipeDoc.exists() ? { id: recipeDoc.id, ...recipeDoc.data() } : null;
};

// Get all recipes, admin use
const getAllRecipes = async () => {
    const snapshot = await getDocs(collection(db, "recipes"));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get all approved community recipes
const getApprovedRecipes = async () => {
    const snapshot = await getDocs(collection(db, "recipes"));

    return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((recipe) => recipe.status === "approved")
        .filter((recipe) => recipe.isExternal !== true);
};

// Get all pending recipes
const getPendingRecipes = async () => {
    const q = query(collection(db, "recipes"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get all recipes submitted by a specific user
const getRecipesByUser = async (userId) => {
    const q = query(
        collection(db, "recipes"),
        where("userId", "==", String(userId))
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get recipes by a tag ID
const getRecipesByTag = async (tagId) => {
    const q = query(
        collection(db, "recipes"),
        where("tags", "array-contains", tagId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Update arbitrary fields on a recipe
const updateRecipe = async (recipeId, updates) => {
    const recipeRef = doc(db, "recipes", String(recipeId));
    await updateDoc(recipeRef, updates);
};

// Approve a pending recipe
const approveRecipe = async (recipeId) => {
    await updateDoc(doc(db, "recipes", String(recipeId)), {
        status: "approved",
    });
};

// Update a recipe's average rating
const updateRecipeRating = async (recipeId, newAverageRating, newRatingCount) => {
    await updateDoc(doc(db, "recipes", String(recipeId)), {
        averageRating: newAverageRating,
        ratingCount: newRatingCount,
    });
};

// Delete a recipe
const deleteRecipe = async (recipeId) => {
    await deleteDoc(doc(db, "recipes", String(recipeId)));
};

// Search approved community recipes by title
const searchApprovedRecipes = async (searchTerm) => {
    const snapshot = await getDocs(collection(db, "recipes"));
    const term = searchTerm.toLowerCase();

    return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((recipe) => recipe.status === "approved")
        .filter((recipe) => recipe.isExternal !== true)
        .filter((recipe) =>
            recipe.title && recipe.title.toLowerCase().includes(term)
        );
};

const getOfficialRecipes = async () => {
  const snapshot = await getDocs(collection(db, "recipes"));

  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((recipe) => recipe.isExternal === true);
};

module.exports = {
    createRecipe,
    saveExternalRecipe,
    saveRecipeForUser,
    getSavedRecipesByUser,
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
    getOfficialRecipes,
};