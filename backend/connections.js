const express = require('express');
const router = express.Router();
const db = require('./db');

const authenticate = (req, res, next) => {
    const jwt = require('jsonwebtoken');
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123', (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    } else res.sendStatus(401);
};

// Send a connection request (Student -> Alumni)
router.post('/send', authenticate, async (req, res) => {
    if (req.user.type !== 'Student') return res.status(403).json({ error: 'Only students can send connection requests.' });
    const { alumniId } = req.body;
    try {
        await db.execute(
            'INSERT INTO Connection_Requests (Student_ID, Alumni_ID) VALUES (?, ?)',
            [req.user.id, alumniId]
        );
        res.status(201).json({ message: 'Connection request sent!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Request already sent to this alumni.' });
        }
        res.status(500).json({ error: 'Failed to send request: ' + error.message });
    }
});

// Get pending requests for an alumni
router.get('/pending', authenticate, async (req, res) => {
    if (req.user.type !== 'Alumni') return res.status(403).json({ error: 'Unauthorized' });
    try {
        const [requests] = await db.execute(`
            SELECT cr.Request_ID, cr.Status, u.User_ID, u.Full_Name, u.Email
            FROM Connection_Requests cr
            JOIN Users u ON cr.Student_ID = u.User_ID
            WHERE cr.Alumni_ID = ? AND cr.Status = 'Pending'
            ORDER BY cr.Request_ID DESC
        `, [req.user.id]);
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accept or Reject a request (Alumni only)
router.put('/:id', authenticate, async (req, res) => {
    if (req.user.type !== 'Alumni') return res.status(403).json({ error: 'Unauthorized' });
    const { status } = req.body; // 'Accepted' or 'Rejected'
    if (!['Accepted', 'Rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    try {
        const [result] = await db.execute(
            'UPDATE Connection_Requests SET Status = ? WHERE Request_ID = ? AND Alumni_ID = ?',
            [status, req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Request not found' });
        res.json({ message: `Request ${status.toLowerCase()} successfully.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get connection status between a student and alumni
router.get('/status/:alumniId', authenticate, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT Status FROM Connection_Requests WHERE Student_ID = ? AND Alumni_ID = ?',
            [req.user.id, req.params.alumniId]
        );
        res.json({ status: rows.length > 0 ? rows[0].Status : null });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get notifications for a user
router.get('/notifications', authenticate, async (req, res) => {
    try {
        const [notifs] = await db.execute(
            'SELECT * FROM Notifications WHERE User_ID = ? ORDER BY Created_At DESC LIMIT 20',
            [req.user.id]
        );
        res.json(notifs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticate, async (req, res) => {
    try {
        await db.execute('UPDATE Notifications SET Is_Read = TRUE WHERE Notif_ID = ? AND User_ID = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
