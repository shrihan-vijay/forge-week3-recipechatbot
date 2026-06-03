const express = require('express');
const {
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
} = require('../db/recipe.db.js');

const router = express.Router();

// Search approved recipes by title
router.get('/search', async (req, res) => {
    const { query } = req.query;
    if (!query?.trim()) {
        return res.status(400).json({ message: 'Search query is required' });
    }
    try {
        const recipes = await searchApprovedRecipes(query.trim());
        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error searching recipes:', error);
        res.status(500).json({ message: 'Error searching recipes' });
    }
});

// Get all approved recipes (public feed)
router.get('/', async (req, res) => {
    try {
        const recipes = await getApprovedRecipes();
        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error fetching approved recipes:', error);
        res.status(500).json({ message: 'Error fetching approved recipes' });
    }
});

// Get all recipes (admin use)
router.get('/all', async (req, res) => {
    try {
        const recipes = await getAllRecipes();
        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error fetching all recipes:', error);
        res.status(500).json({ message: 'Error fetching all recipes' });
    }
});

// Get all pending recipes (admin review queue)
router.get('/pending', async (req, res) => {
    try {
        const recipes = await getPendingRecipes();
        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error fetching pending recipes:', error);
        res.status(500).json({ message: 'Error fetching pending recipes' });
    }
});

// Get all recipes by a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const recipes = await getRecipesByUser(req.params.userId);
        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error fetching recipes by user:', error);
        res.status(500).json({ message: 'Error fetching recipes by user' });
    }
});

// Get all recipes with a specific tag
router.get('/tag/:tagId', async (req, res) => {
    try {
        const recipes = await getRecipesByTag(req.params.tagId);
        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error fetching recipes by tag:', error);
        res.status(500).json({ message: 'Error fetching recipes by tag' });
    }
});

// Get a single recipe by ID
router.get('/:recipeId', async (req, res) => {
    try {
        const recipe = await getRecipeById(req.params.recipeId);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        res.status(200).json(recipe);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ message: 'Error fetching recipe' });
    }
});

// Submit a new user recipe
router.post('/', async (req, res) => {
    const { title, userId, creatorName } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!userId?.trim()) return res.status(400).json({ message: 'User ID is required' });
    if (!creatorName?.trim()) return res.status(400).json({ message: 'Creator name is required' });

    try {
        const recipe = await createRecipe(req.body);
        res.status(201).json(recipe);
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ message: 'Error creating recipe', error: error.message });
    }
});

// Cache an external (Spoonacular) recipe
router.post('/external', async (req, res) => {
    const { recipeId } = req.body;

    if (!recipeId?.trim()) return res.status(400).json({ message: 'Recipe ID is required' });

    try {
        const recipe = await saveExternalRecipe(recipeId, req.body);
        res.status(201).json(recipe);
    } catch (error) {
        console.error('Error saving external recipe:', error);
        res.status(500).json({ message: 'Error saving external recipe', error: error.message });
    }
});

// Approve a pending recipe (admin)
router.patch('/:recipeId/approve', async (req, res) => {
    try {
        await approveRecipe(req.params.recipeId);
        res.status(200).json({ message: 'Recipe approved successfully' });
    } catch (error) {
        console.error('Error approving recipe:', error);
        res.status(500).json({ message: 'Error approving recipe', error: error.message });
    }
});

// Update recipe rating (called internally after a new comment)
router.patch('/:recipeId/rating', async (req, res) => {
    const { averageRating, ratingCount } = req.body;

    if (averageRating === undefined || ratingCount === undefined) {
        return res.status(400).json({ message: 'averageRating and ratingCount are required' });
    }

    try {
        await updateRecipeRating(req.params.recipeId, averageRating, ratingCount);
        res.status(200).json({ message: 'Rating updated successfully' });
    } catch (error) {
        console.error('Error updating recipe rating:', error);
        res.status(500).json({ message: 'Error updating recipe rating', error: error.message });
    }
});

// Update recipe fields
router.patch('/:recipeId', async (req, res) => {
    try {
        await updateRecipe(req.params.recipeId, req.body);
        res.status(200).json({ message: 'Recipe updated successfully' });
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ message: 'Error updating recipe', error: error.message });
    }
});

// Delete a recipe
router.delete('/:recipeId', async (req, res) => {
    try {
        await deleteRecipe(req.params.recipeId);
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ message: 'Error deleting recipe', error: error.message });
    }
});

module.exports = router;