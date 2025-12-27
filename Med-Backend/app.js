import express from "express";
import doctorRoutes from "./routes/doctor.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();
app.use(express.json());

app.use("/api/doctors", doctorRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;
