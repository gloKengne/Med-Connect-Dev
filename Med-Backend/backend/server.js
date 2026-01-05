import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDb from "./config/db.js";
import testInsert from "./routes/testInsert.js";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/documentRoutes.js"
import listingdoctorsRoutes from "./routes/listingdoctors.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import doctorProfileRoutes from "./routes/doctor-profile.routes.js";
import patientProfileRoutes from "./routes/patient-profile.routes.js";
import dashboardRoutes from './routes/dashboardRoutes.js';
import messageRoutes from './routes/message.routes.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, specify your exact origins
    methods: ["GET", "POST"]
  }
});

// Make io accessible in routes
app.set('io', io);

app.use(cors());
app.use(bodyParser.json());

connectDb(); 

// File serving
app.use("/uploads", express.static("src/uploads"));

// Socket.IO connection handling
const userSockets = new Map(); // Store userId -> socketId mapping

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their userId
  socket.on('join', (userId) => {
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

// Make userSockets accessible in controllers
app.set('userSockets', userSockets);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/doctors", listingdoctorsRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/doctors", doctorProfileRoutes);
app.use("/api/patients", patientProfileRoutes);
app.use("/api/test", testInsert);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/messages', messageRoutes);



app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Server also available on your network IP`);
});