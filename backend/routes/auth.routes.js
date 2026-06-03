const express = require('express');
const {
    createAuthRecord,
    getAuthRecord,
    updatePassword,
    updateAuthUsername,
    deleteAuthRecord,
    getAuthRecordByUsername
} = require('../db/auth.db.js');
const { saveUser, getUserById } = require('../db/user.db.js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { username, password, email, fullName } = req.body;

    if (!username?.trim()) return res.status(400).json({ message: 'Username is required' });
    if (!password?.trim()) return res.status(400).json({ message: 'Password is required' });
    if (!email?.trim()) return res.status(400).json({ message: 'Email is required' });

    try {
        const existing = await getAuthRecordByUsername(username);
        if (existing) return res.status(409).json({ message: 'Username already taken' });

        const userId = crypto.randomUUID();
        const hashPassword = await bcrypt.hash(password, 10);

        await createAuthRecord(userId, username, hashPassword);
        const user = await saveUser(userId, { username, email, fullName: fullName || '' });

        res.status(201).json({ userId, username, email, fullName: fullName || '' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username?.trim()) return res.status(400).json({ message: 'Username is required' });
    if (!password?.trim()) return res.status(400).json({ message: 'Password is required' });

    try {
        const authRecord = await getAuthRecordByUsername(username);
        if (!authRecord) return res.status(401).json({ message: 'Invalid username or password' });

        const match = await bcrypt.compare(password, authRecord.hashPassword);
        if (!match) return res.status(401).json({ message: 'Invalid username or password' });

        const user = await getUserById(authRecord.userId);
        res.status(200).json(user);
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
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