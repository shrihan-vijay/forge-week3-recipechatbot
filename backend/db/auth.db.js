const {
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
} = require("firebase/firestore");
const { db } = require("../firebase.js");

// Create an auth record (call this alongside saveUser when registering)
// hashPassword should already be hashed before being passed in — never store plaintext
const createAuthRecord = async (userId, username, hashPassword) => {
    const authRef = doc(db, "auth", userId);
    const authDoc = await getDoc(authRef);

    if (!authDoc.exists()) {
        await setDoc(authRef, {
            userId,
            username,
            hashPassword,
        });
    }

    return { userId, username };
};

// Get an auth record by userId (used during login to retrieve hashed password)
const getAuthRecord = async (userId) => {
    const authDoc = await getDoc(doc(db, "auth", userId));
    return authDoc.exists() ? { id: authDoc.id, ...authDoc.data() } : null;
};

// Update hashed password (e.g. password reset flow)
const updatePassword = async (userId, newHashPassword) => {
    await updateDoc(doc(db, "auth", userId), { hashPassword: newHashPassword });
};

// Update username in auth record (keep in sync with users collection)
const updateAuthUsername = async (userId, newUsername) => {
    await updateDoc(doc(db, "auth", userId), { username: newUsername });
};

// Delete auth record (call alongside deleteUser)
const deleteAuthRecord = async (userId) => {
    await deleteDoc(doc(db, "auth", userId));
};

module.exports = {
    createAuthRecord,
    getAuthRecord,
    updatePassword,
    updateAuthUsername,
    deleteAuthRecord,
};