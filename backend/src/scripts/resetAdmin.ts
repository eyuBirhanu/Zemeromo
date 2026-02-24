import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import connectDB from "../config/db"; // Ensure this path is correct

dotenv.config();

const resetAdmin = async () => {
    try {
        await connectDB();
        console.log("🔌 Connected to DB...");

        // 1. Delete existing admin (Clean slate)
        await User.findOneAndDelete({ phoneNumber: "+251900000000" });
        console.log("🗑️  Old admin deleted (if existed).");

        // 2. Create New Admin
        // IMPORTANT: Do NOT use bcrypt.hash here. 
        // Pass the PLAIN TEXT password. The User model's pre('save') hook will hash it.
        const adminUser = new User({
            username: "Super Admin",
            email: "admin@zemeromo.com",
            phoneNumber: "+251900000000",
            passwordHash: "password123", // <--- PLAIN TEXT HERE
            role: "super_admin",
            isActive: true,
            favorites: [],
            library: []
        });

        await adminUser.save();

        console.log("✅ NEW Admin Created!");
        console.log("👤 Phone: +251900000000");
        console.log("🔑 Pass:  password123");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        process.exit(1);
    }
};

resetAdmin();