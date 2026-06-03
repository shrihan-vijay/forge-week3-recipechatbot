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

// Create a new tag (auto-generated ID)
const createTag = async (name) => {
    const newTag = {
        name,
        createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, "tags"), newTag);
    return { id: docRef.id, tagId: docRef.id, ...newTag };
};

// Create a tag with a specific ID (useful for seeding Spoonacular diet/cuisine/dishType tags)
const createTagWithId = async (tagId, name) => {
    const tagRef = doc(db, "tags", tagId);
    const existing = await getDoc(tagRef);
    if (!existing.exists()) {
        const newTag = { tagId, name, createdAt: Timestamp.now() };
        await setDoc(tagRef, newTag);
        return { id: tagId, ...newTag };
    }
    return { id: existing.id, ...existing.data() };
};

// Get a tag by its document ID
const getTagById = async (tagId) => {
    const tagDoc = await getDoc(doc(db, "tags", tagId));
    return tagDoc.exists() ? { id: tagDoc.id, ...tagDoc.data() } : null;
};

// Get a tag by name (for deduplication before creating)
const getTagByName = async (name) => {
    const q = query(collection(db, "tags"), where("name", "==", name));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() };
};

// Get all tags
const getAllTags = async () => {
    const snapshot = await getDocs(collection(db, "tags"));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Update a tag's name
const updateTag = async (tagId, updates) => {
    await updateDoc(doc(db, "tags", tagId), updates);
};

// Delete a tag
const deleteTag = async (tagId) => {
    await deleteDoc(doc(db, "tags", tagId));
};

module.exports = {
    createTag,
    createTagWithId,
    getTagById,
    getTagByName,
    getAllTags,
    updateTag,
    deleteTag,
};