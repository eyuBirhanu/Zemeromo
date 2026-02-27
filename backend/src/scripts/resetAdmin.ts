import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import connectDB from "../config/db";

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        // 1. Validation
        if (!process.env.SUPER_ADMIN_PHONE || !process.env.SUPER_ADMIN_PASS) {
            console.error("❌ MISSING ENV VARS: Please set SUPER_ADMIN_PHONE and SUPER_ADMIN_PASS in .env");
            process.exit(1);
        }

        // 2. Connect
        await connectDB();
        console.log("🔌 Connected to DB for Seeding...");

        const adminPhone = process.env.SUPER_ADMIN_PHONE;
        const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@zemeromo.et";
        const adminPass = process.env.SUPER_ADMIN_PASS;

        // 3. Clean Slate: Remove existing admin with these credentials
        const deleted = await User.deleteMany({
            $or: [
                { phoneNumber: adminPhone },
                { email: adminEmail },
                { role: "super_admin" } // Optional: Wipes ALL super admins to ensure only one exists
            ]
        });

        if (deleted.deletedCount > 0) {
            console.log(`🗑️  Cleaned up ${deleted.deletedCount} old admin accounts.`);
        }

        // 4. Create New Admin
        // NOTE: We pass plain text password. The User model 'pre-save' hook hashes it.
        const adminUser = new User({
            username: "Zemeromo Super Admin",
            email: adminEmail,
            phoneNumber: adminPhone,
            passwordHash: adminPass,
            role: "super_admin",
            isActive: true,
            verificationStatus: "verified", // Crucial for access
            favorites: [],
            library: []
        });

        await adminUser.save();

        console.log("✅ ------------------------------------------------");
        console.log("✅ SUPER ADMIN SEEDED SUCCESSFULLY");
        console.log("✅ ------------------------------------------------");
        console.log(`👤 Username: Super Admin`);
        console.log(`📞 Phone:    ${adminPhone}`);
        console.log(`📧 Email:    ${adminEmail}`);
        console.log(`🔑 Password: [Hidden from Logs] (Check .env)`);
        console.log("✅ ------------------------------------------------");

        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    }
};

seedSuperAdmin();