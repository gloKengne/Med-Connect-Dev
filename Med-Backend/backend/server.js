import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDb from "./config/db.js";
import testInsert from "./routes/testInsert.js";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/documentRoutes.js"
import listingdoctorsRoutes from "./routes/listingdoctors.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import doctorProfileRoutes from "./routes/doctor-profile.routes.js";
import patientProfileRoutes from "./routes/patient-profile.routes.js";
import messageRoutes from "./routes/message.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:4200",           // for local dev
    "https://your-frontend.netlify.app" // replace with your actual deployed frontend URL
  ],
  credentials: true
}));
app.use(bodyParser.json());

connectDb(); 

// File serving
app.use("/uploads", express.static("src/uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/doctors", listingdoctorsRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/doctors", doctorProfileRoutes);
app.use("/api/patients", patientProfileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/test", testInsert);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Server also available on your network IP`);
});
