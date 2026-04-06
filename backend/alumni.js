const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/search', async (req, res) => {
    const { q } = req.query;
    let query = `
        SELECT u.User_ID, u.Full_Name, a.Job_Title, a.Years_Experience, c.Company_Name 
        FROM Users u
        JOIN Alumni_Profiles a ON u.User_ID = a.User_ID
        LEFT JOIN Companies c ON a.Company_ID = c.Company_ID
        WHERE u.User_Type = 'Alumni'
    `;
    const params = [];
    
    if (q) {
        query += ` AND (u.Full_Name LIKE ? OR c.Company_Name LIKE ? OR a.Job_Title LIKE ?)`;
        const search = `%${q}%`;
        params.push(search, search, search);
    }

    try {
        const [alumni] = await db.execute(query, params);
        res.json(alumni);
    } catch (error) {
        res.status(500).json({ error: 'Search failed: ' + error.message });
    }
});

module.exports = router;
