const {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    getDoc,
    deleteDoc,
    doc,
    query,
    where,
    setDoc,
    arrayUnion,
    arrayRemove,
    Timestamp,
} = require("firebase/firestore");
const { db } = require("../firebase.js");

// Create or update a user document
const saveUser = async (userId, userData) => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        await setDoc(userRef, {
            uid: userId,
            username: userData.username || "",
            fullName: userData.fullName || "",
            email: userData.email || "",
            admin: userData.admin || false,
            createdAt: Timestamp.now(),
            savedRecipes: [],
        });
    } else {
        await setDoc(userRef, userData, { merge: true });
    }

    return { id: userId, ...userData };
};

// Get a user by their UID
const getUserById = async (userId) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};

// Get all users
const getAllUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get all admin users
const getAdminUsers = async () => {
    const q = query(collection(db, "users"), where("admin", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Update arbitrary fields on a user
const updateUser = async (userId, updates) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
};

// Delete a user document
const deleteUser = async (userId) => {
    await deleteDoc(doc(db, "users", userId));
};

// Add a recipe to a user's savedRecipes array
const saveRecipeToUser = async (userId, recipeId, isExternal) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        savedRecipes: arrayUnion({
            recipeId,
            isExternal,
            savedAt: Timestamp.now(),
        }),
    });
};

// Remove a recipe from a user's savedRecipes array
const unsaveRecipeFromUser = async (userId, savedRecipeEntry) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        savedRecipes: arrayRemove(savedRecipeEntry),
    });
};

module.exports = {
    saveUser,
    getUserById,
    getAllUsers,
    getAdminUsers,
    updateUser,
    deleteUser,
    saveRecipeToUser,
    unsaveRecipeFromUser,
};