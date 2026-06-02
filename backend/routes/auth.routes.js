const express = require('express');
const {
    createAuthRecord,
    getAuthRecord,
    updatePassword,
    updateAuthUsername,
    deleteAuthRecord,
} = require('../db/auth.db.js');

const router = express.Router();

// Register a new auth record
router.post('/register', async (req, res) => {
    const { userId, username, hashPassword } = req.body;

    if (!userId?.trim()) return res.status(400).json({ message: 'User ID is required' });
    if (!username?.trim()) return res.status(400).json({ message: 'Username is required' });
    if (!hashPassword?.trim()) return res.status(400).json({ message: 'Password is required' });

    try {
        const record = await createAuthRecord(userId, username, hashPassword);
        res.status(201).json(record);
    } catch (error) {
        console.error('Error creating auth record:', error);
        res.status(500).json({ message: 'Error creating auth record', error: error.message });
    }
});

// Get auth record by userId (for login / password verification)
router.get('/:userId', async (req, res) => {
    try {
        const record = await getAuthRecord(req.params.userId);
        if (!record) return res.status(404).json({ message: 'Auth record not found' });
        res.status(200).json(record);
    } catch (error) {
        console.error('Error fetching auth record:', error);
        res.status(500).json({ message: 'Error fetching auth record' });
    }
});

// Update hashed password
router.patch('/:userId/password', async (req, res) => {
    const { hashPassword } = req.body;

    if (!hashPassword?.trim()) return res.status(400).json({ message: 'New password is required' });

    try {
        await updatePassword(req.params.userId, hashPassword);
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Error updating password', error: error.message });
    }
});

// Update username in auth record
router.patch('/:userId/username', async (req, res) => {
    const { username } = req.body;

    if (!username?.trim()) return res.status(400).json({ message: 'Username is required' });

    try {
        await updateAuthUsername(req.params.userId, username);
        res.status(200).json({ message: 'Username updated successfully' });
    } catch (error) {
        console.error('Error updating auth username:', error);
        res.status(500).json({ message: 'Error updating auth username', error: error.message });
    }
});

// Delete auth record
router.delete('/:userId', async (req, res) => {
    try {
        await deleteAuthRecord(req.params.userId);
        res.status(200).json({ message: 'Auth record deleted successfully' });
    } catch (error) {
        console.error('Error deleting auth record:', error);
        res.status(500).json({ message: 'Error deleting auth record', error: error.message });
    }
});

module.exports = router;