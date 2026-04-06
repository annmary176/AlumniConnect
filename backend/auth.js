const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

// Register
router.post('/register', async (req, res) => {
    const { fullName, email, password, userType, companyName, jobTitle, yearsExperience, graduationYear } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Start transaction for Alumni if they need company inserted
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Insert User
            const [userResult] = await connection.execute(
                'INSERT INTO Users (Full_Name, Email, Password_Hash, User_Type) VALUES (?, ?, ?, ?)',
                [fullName, email, hashedPassword, userType]
            );
            const userId = userResult.insertId;

            if (userType === 'Alumni') {
                // Check if Company exists or insert
                let companyId = null;
                if (companyName) {
                    const [companySearch] = await connection.execute('SELECT Company_ID FROM Companies WHERE Company_Name = ?', [companyName]);
                    if (companySearch.length > 0) {
                        companyId = companySearch[0].Company_ID;
                    } else {
                        const [compResult] = await connection.execute('INSERT INTO Companies (Company_Name) VALUES (?)', [companyName]);
                        companyId = compResult.insertId;
                    }
                }

                // Insert Alumni Profile
                await connection.execute(
                    'INSERT INTO Alumni_Profiles (User_ID, Company_ID, Job_Title, Years_Experience, Graduation_Year) VALUES (?, ?, ?, ?, ?)',
                    [userId, companyId, jobTitle, yearsExperience || 0, graduationYear]
                );
            }

            await connection.commit();
            res.status(201).json({ message: 'User registered successfully', userId });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM Users WHERE Email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.Password_Hash);
        
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign(
            { id: user.User_ID, type: user.User_Type }, 
            process.env.JWT_SECRET || 'secret123', 
            { expiresIn: '1d' }
        );
        res.json({ token, user: { id: user.User_ID, name: user.Full_Name, type: user.User_Type } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
