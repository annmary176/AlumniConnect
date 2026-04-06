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

// Post a job (Alumni only)
router.post('/', authenticate, async (req, res) => {
    if (req.user.type !== 'Alumni') return res.status(403).json({ error: 'Only alumni can post jobs.' });
    const { title, description, skillsRequired } = req.body;
    
    try {
        const [profile] = await db.execute('SELECT Company_ID FROM Alumni_Profiles WHERE User_ID = ?', [req.user.id]);
        if (!profile.length || !profile[0].Company_ID) return res.status(400).json({ error: 'Company not linked to your profile' });

        await db.execute(
            'INSERT INTO Job_Opportunities (Alumni_ID, Company_ID, Title, Description, Skills_Required) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, profile[0].Company_ID, title, description, skillsRequired]
        );
        res.status(201).json({ message: 'Job posted successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Error posting job: ' + error.message });
    }
});

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const [jobs] = await db.execute(`
            SELECT j.*, c.Company_Name, u.Full_Name as Alumni_Name 
            FROM Job_Opportunities j
            JOIN Companies c ON j.Company_ID = c.Company_ID
            JOIN Users u ON j.Alumni_ID = u.User_ID
            ORDER BY j.Posted_At DESC
        `);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching jobs: ' + error.message });
    }
});

// Delete a job (Alumni only - can only delete their own jobs)
router.delete('/:id', authenticate, async (req, res) => {
    if (req.user.type !== 'Alumni') return res.status(403).json({ error: 'Only alumni can delete jobs.' });
    
    const jobId = req.params.id;
    
    try {
        // Verify the job belongs to the user
        const [job] = await db.execute('SELECT Alumni_ID FROM Job_Opportunities WHERE Job_ID = ?', [jobId]);
        if (!job.length) return res.status(404).json({ error: 'Job not found' });
        
        console.log('Deleting job:', { jobId, jobAlumniId: job[0].Alumni_ID, userId: req.user.id });
        
        if (job[0].Alumni_ID !== req.user.id) {
            return res.status(403).json({ error: `You can only delete your own jobs. (Your ID: ${req.user.id}, Job Author: ${job[0].Alumni_ID})` });
        }
        
        await db.execute('DELETE FROM Job_Opportunities WHERE Job_ID = ?', [jobId]);
        res.json({ message: 'Job deleted successfully!' });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ error: 'Error deleting job: ' + error.message });
    }
});

module.exports = router;
