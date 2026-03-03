import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import connectDB from "../config/db";

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        // 1. Validation: Ensure we have the secrets
        const adminPhone = process.env.ADMIN_PHONE;
        const adminEmail = process.env.ADMIN_EMAIL || "zemeromo@gmail.com";
        const adminPass = process.env.ADMIN_PASSWORD;

        if (!adminPhone || !adminPass) {
            console.error("❌ MISSING ENV VARS: Please set ADMIN_PHONE and ADMIN_PASSWORD in your .env file");
            process.exit(1);
        }

        // 2. Connect to Database
        if (mongoose.connection.readyState === 0) {
            await connectDB();
        }
        console.log("🔌 Connected to DB for Seeding...");

        const deleted = await User.deleteMany({
            $or: [
                { phoneNumber: adminPhone },
                { email: adminEmail },
                { role: "super_admin" }
            ]
        });

        if (deleted.deletedCount > 0) {
            console.log(`🗑️  Cleaned up ${deleted.deletedCount} old admin accounts.`);
        }

        // 4. Create New Admin
        const adminUser = new User({
            username: "Super Admin",
            email: adminEmail,
            phoneNumber: adminPhone,
            passwordHash: adminPass,
            role: "super_admin",

            isActive: true,
            verificationStatus: "verified",

            churchId: null,
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