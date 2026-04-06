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
    } else {
        res.sendStatus(401);
    }
};

// Create an available session (Alumni only)
router.post('/', authenticate, async (req, res) => {
    if (req.user.type !== 'Alumni') return res.status(403).json({ error: 'Only alumni can post sessions.' });
    
    const { topic, sessionTime, meetingLink } = req.body;
    try {
        await db.execute(
            'INSERT INTO Mentorship_Sessions (Alumni_ID, Topic, Session_Time, Meeting_Link, Status) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, topic, sessionTime, meetingLink, 'Available']
        );
        res.status(201).json({ message: 'Session created successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create session.', details: error.message });
    }
});

// Get all sessions (available and booked)
router.get('/', authenticate, async (req, res) => {
    try {
        const [sessions] = await db.execute(`
            SELECT s.Session_ID, s.Alumni_ID, s.Topic, s.Session_Time, s.Meeting_Link, s.Status, s.Student_ID, u.Full_Name as Alumni_Name
            FROM Mentorship_Sessions s
            JOIN Users u ON s.Alumni_ID = u.User_ID
            WHERE s.Status IN ('Available', 'Booked')
            ORDER BY s.Session_Time ASC
        `);
        res.json(sessions || []);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions: ' + error.message });
    }
});

// Book a session
router.post('/:id/book', authenticate, async (req, res) => {
    if (req.user.type !== 'Student') return res.status(403).json({ error: 'Only students can book sessions.' });
    
    const sessionId = req.params.id;
    const studentId = req.user.id;
    
    try {
        // Check if session already has a student booked
        const [existing] = await db.execute(
            'SELECT Student_ID FROM Mentorship_Sessions WHERE Session_ID = ? AND Student_ID IS NOT NULL',
            [sessionId]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'This session is already booked.' });
        }
        
        // Book the session by assigning the student_id and updating status
        await db.execute(
            'UPDATE Mentorship_Sessions SET Student_ID = ?, Status = ? WHERE Session_ID = ?',
            [studentId, 'Booked', sessionId]
        );
        res.json({ message: 'Session booked successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during booking: ' + error.message });
    }
});

// Get Alumni's hosted sessions and see attending students
router.get('/my-sessions', authenticate, async (req, res) => {
    if (req.user.type !== 'Alumni') return res.status(403).json({ error: 'Unauthorized' });
    try {
        const [sessions] = await db.execute(`
            SELECT s.*, u.Full_Name as Student_Name, u.Email as Student_Email 
            FROM Mentorship_Sessions s
            LEFT JOIN Users u ON s.Student_ID = u.User_ID
            WHERE s.Alumni_ID = ? 
            ORDER BY s.Session_Time
        `, [req.user.id]);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Student's booked sessions
router.get('/my-bookings', authenticate, async (req, res) => {
    if (req.user.type !== 'Student') return res.status(403).json({ error: 'Unauthorized' });
    try {
        const [bookings] = await db.execute(`
            SELECT s.*, u.Full_Name as Alumni_Name, c.Company_Name, a.Job_Title
            FROM Mentorship_Sessions s
            JOIN Users u ON s.Alumni_ID = u.User_ID
            LEFT JOIN Alumni_Profiles a ON u.User_ID = a.User_ID
            LEFT JOIN Companies c ON a.Company_ID = c.Company_ID
            WHERE s.Student_ID = ?
            ORDER BY s.Session_Time
        `, [req.user.id]);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
