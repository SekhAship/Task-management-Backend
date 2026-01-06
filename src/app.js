const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

// health check
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager Backend Running 🚀' });
});

// inject io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// routes
app.use('/api/tasks', taskRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
