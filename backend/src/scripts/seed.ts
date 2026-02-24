import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User";
import connectDB from "../config/db";

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();
        console.log("🔐 Seeding Super Admin...");

        const adminPhone = "+251900000000"; // Default Admin Phone
        const rawPassword = "password123"; // Default Password

        // 1. Hash Password Manually (since findOneAndUpdate bypasses middleware)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(rawPassword, salt);

        // 2. Upsert (Create if not exists, Update if exists)
        const admin = await User.findOneAndUpdate(
            { phoneNumber: adminPhone }, // Search criteria
            {
                username: "Master Admin",
                phoneNumber: adminPhone,
                passwordHash: passwordHash,
                role: "super_admin",
                isActive: true
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`✅ Super Admin Ready!`);
        console.log(`📱 Phone: ${adminPhone}`);
        console.log(`🔑 Password: ${rawPassword}`);

        process.exit();
    } catch (error) {
        console.error("❌ Admin Seeding Failed:", error);
        process.exit(1);
    }
};

seedAdmin();