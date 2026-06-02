const express = require('express');
const axios = require('axios');
const { saveExternalRecipe, getRecipeById } = require('../db/recipe.db.js');
const { createTagWithId, getTagByName } = require('../db/tags.db.js');

const router = express.Router();

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// process spoonacular tags
const syncSpoonacularTags = async (spoonacularRecipe) => {
    const rawTags = new Set([
        ...(spoonacularRecipe.cuisines || []),
        ...(spoonacularRecipe.diets || []),
        ...(spoonacularRecipe.dishTypes || [])
    ]);

    const firestoreTagIds = [];

    for (const tagName of rawTags) {
        if (!tagName) continue;

        const normalizedName = tagName.trim().toLowerCase();
        
        try {
            const existingTag = await getTagByName(normalizedName);
            
            if (existingTag) {
                firestoreTagIds.push(existingTag.id);
            } else {
                const customTagId = `tag_${normalizedName.replace(/\s+/g, '_')}`;
                const newTag = await createTagWithId(customTagId, normalizedName);
                firestoreTagIds.push(newTag.id);
            }
        } catch (error) {
            console.error(`Failed to sync tag "${tagName}":`, error);
        }
    }

    return firestoreTagIds;
};

// format data from spoonacular recipes
const mapSpoonacularToSchema = (data) => {
    return {
        title: data.title || "",
        description: data.summary || "",
        readyInMinutes: data.readyInMinutes || 0,
        imageUrl: data.image || "",
        ingredients: data.extendedIngredients 
            ? data.extendedIngredients.map(ing => ing.original) 
            : [],
        instructions: data.analyzedInstructions?.[0]?.steps
            ? data.analyzedInstructions[0].steps.map(step => step.step)
            : data.instructions ? [data.instructions] : []
    };
};

// search spoonacular recipes
router.get('/search', async (req, res) => {
    const { query, number } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Search query parameter is required' });
    }

    try {
        const response = await axios.get(`${SPOONACULAR_BASE_URL}/complexSearch`, {
            params: {
                apiKey: SPOONACULAR_API_KEY,
                query: query,
                number: number || 10,
                addRecipeInformation: true
            }
        });

        const mappedRecipes = response.data.results.map(recipe => ({
            id: String(recipe.id),
            isExternal: true,
            ...mapSpoonacularToSchema(recipe),
            rawTags: [ // Temporary tag presentation strings just for search results UI
                ...(recipe.cuisines || []),
                ...(recipe.diets || []),
                ...(recipe.dishTypes || [])
            ]
        }));

        res.status(200).json(mappedRecipes);
    } catch (error) {
        console.error('Error searching Spoonacular:', error.response?.data || error.message);
        res.status(500).json({ message: 'Error fetching recipes from external provider' });
    }
});

// get recipe details (and sync tags)
router.get('/:id', async (req, res) => {
    const spoonacularId = req.params.id;

    try {
        const cachedRecipe = await getRecipeById(spoonacularId);
        if (cachedRecipe) {
            return res.status(200).json(cachedRecipe);
        }

        const response = await axios.get(`${SPOONACULAR_BASE_URL}/${spoonacularId}/information`, {
            params: { apiKey: SPOONACULAR_API_KEY }
        });

        const rawData = response.data;

        const syncedTagIds = await syncSpoonacularTags(rawData);

        const structuredData = {
            ...mapSpoonacularToSchema(rawData),
            tags: syncedTagIds
        };

        const savedRecipe = await saveExternalRecipe(spoonacularId, structuredData);

        res.status(200).json(savedRecipe);
    } catch (error) {
        console.error('Error fetching recipe details:', error.response?.data || error.message);
        if (error.response?.status === 404) {
            return res.status(404).json({ message: 'External recipe not found' });
        }
        res.status(500).json({ message: 'Error retrieving recipe details' });
    }
});

module.exports = router;