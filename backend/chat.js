const express = require('express');
const router = express.Router();
const db = require('./db');

// Get all unique contacts a user has messaged
router.get('/contacts/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [contacts] = await db.execute(`
            SELECT DISTINCT u.User_ID as id, u.Full_Name as name 
            FROM Users u 
            JOIN Messages m ON (u.User_ID = m.Sender_ID OR u.User_ID = m.Receiver_ID)
            WHERE (m.Sender_ID = ? OR m.Receiver_ID = ?) AND u.User_ID != ?
        `, [userId, userId, userId]);
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get history of messages between two users
router.get('/history/:userId1/:userId2', async (req, res) => {
    const { userId1, userId2 } = req.params;
    try {
        const [messages] = await db.execute(`
            SELECT * FROM Messages 
            WHERE (Sender_ID = ? AND Receiver_ID = ?) 
               OR (Sender_ID = ? AND Receiver_ID = ?)
            ORDER BY Sent_At ASC
        `, [userId1, userId2, userId2, userId1]);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Fetch chat failed: ' + error.message });
    }
});

module.exports = router;
