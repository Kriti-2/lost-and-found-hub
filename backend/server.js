require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Note: To test locally easily without setting up MongoDB, you can use a free cluster
// Make sure to replace this URI if you have a local MongoDB running or an Atlas cluster
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lostandfoundhub';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected to', MONGO_URI))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/chat', chatRoutes);

// General error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: err.message || 'Something went wrong!', error: err.stack });
});

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("User Connected via Socket:", socket.id);

    socket.on("join_room", (roomId) => {
        socket.join(roomId);
    });

    socket.on("send_message", async (data) => {
        // data expects: { room: chatId, message: { sender, content, timestamp } }
        socket.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("GOOGLE_CLIENT_ID Loaded:", process.env.GOOGLE_CLIENT_ID ? "YES (Safe)" : "NO (Missing)");
});
