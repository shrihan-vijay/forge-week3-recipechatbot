const {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
} = require("firebase/firestore");
const db = require("../firebase.js");

// Add a comment (and rating) to a recipe
const addComment = async (recipeId, commentData) => {
    const commentsRef = collection(db, "recipes", recipeId, "comments");
    const newComment = {
        userId: commentData.userId,
        username: commentData.username,
        rating: commentData.rating,
        text: commentData.text,
        createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(commentsRef, newComment);
    return { id: docRef.id, ...newComment };
};

// Get all comments for a recipe
const getCommentsByRecipe = async (recipeId) => {
    const snapshot = await getDocs(collection(db, "recipes", recipeId, "comments"));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get a single comment
const getCommentById = async (recipeId, commentId) => {
    const commentDoc = await getDoc(doc(db, "recipes", recipeId, "comments", commentId));
    return commentDoc.exists() ? { id: commentDoc.id, ...commentDoc.data() } : null;
};

// Update a comment (e.g. edit text or rating)
const updateComment = async (recipeId, commentId, updates) => {
    await updateDoc(doc(db, "recipes", recipeId, "comments", commentId), updates);
};

// Delete a comment
const deleteComment = async (recipeId, commentId) => {
    await deleteDoc(doc(db, "recipes", recipeId, "comments", commentId));
};

// Add a reply to a comment
const addReply = async (recipeId, commentId, replyData) => {
    const repliesRef = collection(db, "recipes", recipeId, "comments", commentId, "replies");
    const newReply = {
        userId: replyData.userId,
        username: replyData.username,
        text: replyData.text,
        createdAt: Timestamp.now(),
        upvotes: 0,
        upvotedBy: {},
    };
    const docRef = await addDoc(repliesRef, newReply);
    return { id: docRef.id, ...newReply };
};

// Get all replies for a comment
const getRepliesByComment = async (recipeId, commentId) => {
    const snapshot = await getDocs(
        collection(db, "recipes", recipeId, "comments", commentId, "replies")
    );
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Toggle an upvote on a reply
// Adds the upvote if the user hasn't upvoted, removes it if they have
const toggleReplyUpvote = async (recipeId, commentId, replyId, userId) => {
    const replyRef = doc(db, "recipes", recipeId, "comments", commentId, "replies", replyId);
    const replyDoc = await getDoc(replyRef);
    if (!replyDoc.exists()) return null;

    const data = replyDoc.data();
    const upvotedBy = data.upvotedBy || {};
    const hasUpvoted = upvotedBy[userId] === true;

    const updatedUpvotedBy = { ...upvotedBy, [userId]: !hasUpvoted };
    const updatedUpvotes = hasUpvoted ? (data.upvotes || 1) - 1 : (data.upvotes || 0) + 1;

    await updateDoc(replyRef, {
        upvotes: updatedUpvotes,
        upvotedBy: updatedUpvotedBy,
    });

    return { upvotes: updatedUpvotes, upvotedBy: updatedUpvotedBy };
};

// Update a reply's text
const updateReply = async (recipeId, commentId, replyId, updates) => {
    await updateDoc(
        doc(db, "recipes", recipeId, "comments", commentId, "replies", replyId),
        updates
    );
};

// Delete a reply
const deleteReply = async (recipeId, commentId, replyId) => {
    await deleteDoc(
        doc(db, "recipes", recipeId, "comments", commentId, "replies", replyId)
    );
};

module.exports = {
    addComment,
    getCommentsByRecipe,
    getCommentById,
    updateComment,
    deleteComment,
    addReply,
    getRepliesByComment,
    toggleReplyUpvote,
    updateReply,
    deleteReply,
};