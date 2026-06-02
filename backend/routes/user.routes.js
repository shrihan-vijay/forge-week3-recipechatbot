const express = require('express');
const {
    saveUser,
    getUserById,
    getUserByUsername,
    getAllUsers,
    getAdminUsers,
    updateUser,
    deleteUser,
    saveRecipeToUser,
    unsaveRecipeFromUser,
} = require('../db/users.db.js');

const router = express.Router();

// Get all users (admin use)
router.get('/all', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Error fetching all users' });
    }
});

// Get all admin users
router.get('/admins', async (req, res) => {
    try {
        const admins = await getAdminUsers();
        res.status(200).json(admins);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ message: 'Error fetching admin users' });
    }
});

// Get a user by ID
router.get('/:userId', async (req, res) => {
    try {
        const user = await getUserById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

// Create or update a user
router.post('/', async (req, res) => {
    const { userId, username, email, admin } = req.body;

    if (!userId?.trim()) return res.status(400).json({ message: 'User ID is required' });
    if (!username?.trim()) return res.status(400).json({ message: 'Username is required' });
    if (!email?.trim()) return res.status(400).json({ message: 'Email is required' });

    try {
        const user = await saveUser(userId, { username, email, admin });
        res.status(201).json(user);
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Error saving user', error: error.message });
    }
});

// Update user fields
router.patch('/:userId', async (req, res) => {
    try {
        await updateUser(req.params.userId, req.body);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// Save a recipe to a user's savedRecipes
router.post('/:userId/saved-recipes', async (req, res) => {
    const { recipeId, isExternal } = req.body;

    if (!recipeId?.trim()) return res.status(400).json({ message: 'Recipe ID is required' });
    if (isExternal === undefined) return res.status(400).json({ message: 'isExternal is required' });

    try {
        await saveRecipeToUser(req.params.userId, recipeId, isExternal);
        res.status(200).json({ message: 'Recipe saved successfully' });
    } catch (error) {
        console.error('Error saving recipe to user:', error);
        res.status(500).json({ message: 'Error saving recipe to user', error: error.message });
    }
});

// Remove a recipe from a user's savedRecipes
router.delete('/:userId/saved-recipes', async (req, res) => {
    const { recipeId, isExternal, savedAt } = req.body;

    if (!recipeId?.trim()) return res.status(400).json({ message: 'Recipe ID is required' });

    try {
        await unsaveRecipeFromUser(req.params.userId, { recipeId, isExternal, savedAt });
        res.status(200).json({ message: 'Recipe removed successfully' });
    } catch (error) {
        console.error('Error removing saved recipe:', error);
        res.status(500).json({ message: 'Error removing saved recipe', error: error.message });
    }
});

// Delete a user
router.delete('/:userId', async (req, res) => {
    try {
        await deleteUser(req.params.userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

module.exports = router;