const express = require('express');
const {
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
} = require('../db/comments.db.js');

const router = express.Router({ mergeParams: true }); // mergeParams to access :recipeId from parent router

// Get all comments for a recipe
router.get('/', async (req, res) => {
    try {
        const comments = await getCommentsByRecipe(req.params.recipeId);
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// Get a single comment
router.get('/:commentId', async (req, res) => {
    try {
        const comment = await getCommentById(req.params.recipeId, req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        res.status(200).json(comment);
    } catch (error) {
        console.error('Error fetching comment:', error);
        res.status(500).json({ message: 'Error fetching comment' });
    }
});

// Add a comment to a recipe
router.post('/', async (req, res) => {
    const { userId, username, rating, text } = req.body;

    if (!userId?.trim()) return res.status(400).json({ message: 'User ID is required' });
    if (!username?.trim()) return res.status(400).json({ message: 'Username is required' });
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });
    if (rating === undefined || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    try {
        const comment = await addComment(req.params.recipeId, { userId, username, rating, text });
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
});

// Update a comment
router.patch('/:commentId', async (req, res) => {
    try {
        await updateComment(req.params.recipeId, req.params.commentId, req.body);
        res.status(200).json({ message: 'Comment updated successfully' });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Error updating comment', error: error.message });
    }
});

// Delete a comment
router.delete('/:commentId', async (req, res) => {
    try {
        await deleteComment(req.params.recipeId, req.params.commentId);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
});

// Get all replies for a comment
router.get('/:commentId/replies', async (req, res) => {
    try {
        const replies = await getRepliesByComment(req.params.recipeId, req.params.commentId);
        res.status(200).json(replies);
    } catch (error) {
        console.error('Error fetching replies:', error);
        res.status(500).json({ message: 'Error fetching replies' });
    }
});

// Add a reply to a comment
router.post('/:commentId/replies', async (req, res) => {
    const { userId, username, text } = req.body;

    if (!userId?.trim()) return res.status(400).json({ message: 'User ID is required' });
    if (!username?.trim()) return res.status(400).json({ message: 'Username is required' });
    if (!text?.trim()) return res.status(400).json({ message: 'Reply text is required' });

    try {
        const reply = await addReply(req.params.recipeId, req.params.commentId, { userId, username, text });
        res.status(201).json(reply);
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ message: 'Error adding reply', error: error.message });
    }
});

// Toggle upvote on a reply
router.patch('/:commentId/replies/:replyId/upvote', async (req, res) => {
    const { userId } = req.body;

    if (!userId?.trim()) return res.status(400).json({ message: 'User ID is required' });

    try {
        const result = await toggleReplyUpvote(
            req.params.recipeId,
            req.params.commentId,
            req.params.replyId,
            userId
        );
        if (!result) return res.status(404).json({ message: 'Reply not found' });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error toggling upvote:', error);
        res.status(500).json({ message: 'Error toggling upvote', error: error.message });
    }
});

// Update a reply
router.patch('/:commentId/replies/:replyId', async (req, res) => {
    try {
        await updateReply(req.params.recipeId, req.params.commentId, req.params.replyId, req.body);
        res.status(200).json({ message: 'Reply updated successfully' });
    } catch (error) {
        console.error('Error updating reply:', error);
        res.status(500).json({ message: 'Error updating reply', error: error.message });
    }
});

// Delete a reply
router.delete('/:commentId/replies/:replyId', async (req, res) => {
    try {
        await deleteReply(req.params.recipeId, req.params.commentId, req.params.replyId);
        res.status(200).json({ message: 'Reply deleted successfully' });
    } catch (error) {
        console.error('Error deleting reply:', error);
        res.status(500).json({ message: 'Error deleting reply', error: error.message });
    }
});

module.exports = router;