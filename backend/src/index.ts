import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";


import authRoutes from "./routes/authRoutes";
import churchRoutes from "./routes/churchRoutes";
// import contentRoutes from "./routes/contentRoutes";
import userRoutes from "./routes/userRoutes";
import albumRoutes from "./routes/albumRoutes";
import artistRoutes from "./routes/artistRoutes";
import songRoutes from "./routes/songRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import bulkRoutes from "./routes/bulkRoutes";
import searchRoutes from "./routes/searchRoutes";

dotenv.config();
connectDB()

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/churches", churchRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bulk", bulkRoutes);
app.use("/api/search", searchRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Zemeromo Backend running on port ${PORT}`));