import dotenv from "dotenv";
dotenv.config();  // load .env FIRST

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDb from "./config/db.js";
import testInsert from "./routes/testInsert.js";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/documentRoutes.js"

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// File serving
app.use("/uploads", express.static("src/uploads"));

// Routes
app.use("/api/documents", documentRoutes);


connectDb(); 

app.use("/api/auth", authRoutes);
app.use("/api/test", testInsert);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
