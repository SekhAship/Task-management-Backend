const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all for dev simplicity/assignment
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Inject io into request object
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/tasks', taskRoutes);

// Socket Connection Handler
io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
