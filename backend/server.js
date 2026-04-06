require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const db = require('./db');
        const [result] = await db.execute('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Routes
app.use('/api/auth', require('./auth'));
app.use('/api/sessions', require('./sessions'));
app.use('/api/graph', require('./graph'));
app.use('/api/jobs', require('./jobs'));
app.use('/api/alumni', require('./alumni'));
app.use('/api/chat', require('./chat'));
app.use('/api/connections', require('./connections'));

// Socket.io for Real-time chat
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Join a private room based on user ID for direct messaging
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
    });

    // Send message to specific user
    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, content } = data;
        
        try {
            const db = require('./db');
            const [result] = await db.execute(
                'INSERT INTO Messages (Sender_ID, Receiver_ID, Content) VALUES (?, ?, ?)',
                [senderId, receiverId, content]
            );
            
            const messageObj = {
                Message_ID: result.insertId,
                Sender_ID: senderId,
                Receiver_ID: receiverId,
                Content: content,
                Sent_At: new Date().toISOString()
            };

            // Emit to both sender and receiver rooms directly for instant chat!
            io.to(`user_${senderId}`).emit('receiveMessage', messageObj);
            io.to(`user_${receiverId}`).emit('receiveMessage', messageObj);
        } catch (error) {
            console.error('Socket message error:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server with Socket.io running on port ${PORT}`);
});
