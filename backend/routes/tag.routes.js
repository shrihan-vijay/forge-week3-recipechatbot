const express = require('express');
const {
    createTag,
    createTagWithId,
    getTagById,
    getTagByName,
    getAllTags,
    updateTag,
    deleteTag,
} = require('../db/tags.db.js');

const router = express.Router();

// Get all tags
router.get('/', async (req, res) => {
    try {
        const tags = await getAllTags();
        res.status(200).json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ message: 'Error fetching tags' });
    }
});

// Get a tag by name
router.get('/name/:name', async (req, res) => {
    try {
        const tag = await getTagByName(req.params.name);
        if (!tag) return res.status(404).json({ message: 'Tag not found' });
        res.status(200).json(tag);
    } catch (error) {
        console.error('Error fetching tag by name:', error);
        res.status(500).json({ message: 'Error fetching tag by name' });
    }
});

// Get a tag by ID
router.get('/:tagId', async (req, res) => {
    try {
        const tag = await getTagById(req.params.tagId);
        if (!tag) return res.status(404).json({ message: 'Tag not found' });
        res.status(200).json(tag);
    } catch (error) {
        console.error('Error fetching tag:', error);
        res.status(500).json({ message: 'Error fetching tag' });
    }
});

// Create a new tag (auto-generated ID)
router.post('/', async (req, res) => {
    const { name } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: 'Tag name is required' });

    try {
        // Prevent duplicates
        const existing = await getTagByName(name.trim());
        if (existing) return res.status(409).json({ message: 'Tag already exists', tag: existing });

        const tag = await createTag(name.trim());
        res.status(201).json(tag);
    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ message: 'Error creating tag', error: error.message });
    }
});

// Create a tag with a specific ID (for seeding Spoonacular tags)
router.post('/seed', async (req, res) => {
    const { tagId, name } = req.body;

    if (!tagId?.trim()) return res.status(400).json({ message: 'Tag ID is required' });
    if (!name?.trim()) return res.status(400).json({ message: 'Tag name is required' });

    try {
        const tag = await createTagWithId(tagId.trim(), name.trim());
        res.status(201).json(tag);
    } catch (error) {
        console.error('Error seeding tag:', error);
        res.status(500).json({ message: 'Error seeding tag', error: error.message });
    }
});

// Update a tag
router.patch('/:tagId', async (req, res) => {
    const { name } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: 'Tag name is required' });

    try {
        await updateTag(req.params.tagId, { name: name.trim() });
        res.status(200).json({ message: 'Tag updated successfully' });
    } catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).json({ message: 'Error updating tag', error: error.message });
    }
});

// Delete a tag
router.delete('/:tagId', async (req, res) => {
    try {
        await deleteTag(req.params.tagId);
        res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({ message: 'Error deleting tag', error: error.message });
    }
});

module.exports = router;