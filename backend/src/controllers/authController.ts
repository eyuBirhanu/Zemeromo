import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail";
import Church, { IChurch } from "../models/Church";

const generateToken = (user: any) => {
    const churchIdValue = user.churchId?._id ? user.churchId._id : user.churchId;

    return jwt.sign(
        { id: user._id, role: user.role, churchId: churchIdValue },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "30d" }
    );
};

/**
 * @desc    Register a new general user
 * @route   POST /api/auth/register
 */
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password, phoneNumber } = req.body;

        // 1. Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phoneNumber }]
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists with that email or phone." });
        }

        // 2. Create User (Password hashing happens in Model Middleware)
        const user = await User.create({
            username,
            email,
            phoneNumber,
            passwordHash: password, // Logic will hash this automatically
            role: "user"
        });

        // 3. Return Token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};

/**
 * @desc    Create a Church Admin (Only Super Admin can do this usually)
 * @route   POST /api/auth/register-church-admin
 */
export const createChurchAdmin = async (req: Request, res: Response) => {
    try {
        // FIX 1: Extract 'churchId' instead of 'churchName' to match the frontend
        const { phoneNumber, email, username, password, churchId } = req.body;

        // FIX 2: Find the church by its ID
        const church = await Church.findById(churchId);
        if (!church) {
            return res.status(404).json({ success: false, message: "Church not found in the database." });
        }

        // Check for existing phone number
        if (phoneNumber) {
            const existingUser = await User.findOne({ phoneNumber });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "User already exists with that phone number." });
            }
        }

        // Check for existing email
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "User already exists with that email." });
            }
        }

        // Create the Admin User
        const user = await User.create({
            phoneNumber,
            email,
            username,
            passwordHash: password,
            role: "church_admin",
            churchId: church._id,
            // FIX 3: Since a Super Admin is creating them from the dashboard, 
            // they should be automatically verified.
            verificationStatus: "verified",
            isActive: true
        });

        // Link the new admin to the Church
        church.adminUserId = user._id as any;
        await church.save();

        res.status(201).json({
            success: true,
            message: `Admin created successfully for ${church.name}`,
            user: { id: user._id, phoneNumber: user.phoneNumber, username: user.username }
        });

    } catch (error) {
        console.error("Create Admin Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};


/**
 * @desc    Public Application to JOIN an existing church as Admin
 * @route   POST /api/auth/apply-admin
 */
export const applyForChurchAdmin = async (req: Request, res: Response) => {
    try {
        const { churchId, username, phoneNumber, email, password } = req.body;

        const church = await Church.findById(churchId);
        if (!church) return res.status(404).json({ success: false, message: "Church not found." });

        // Check if user exists
        if (phoneNumber && await User.findOne({ phoneNumber })) {
            return res.status(400).json({ success: false, message: "Phone number already registered." });
        }
        if (email && await User.findOne({ email })) {
            return res.status(400).json({ success: false, message: "Email already registered." });
        }

        // Create user in PENDING state
        await User.create({
            username, email, phoneNumber,
            passwordHash: password,
            role: "church_admin",
            churchId: church._id,
            verificationStatus: "pending", // Requires Super Admin approval
            isActive: true
        });

        res.status(201).json({ success: true, message: "Application submitted successfully! Please wait for approval." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};

/**
 * @desc    Public Application to CREATE a new church + Admin account
 * @route   POST /api/auth/register-church
 */
export const registerNewChurchAndAdmin = async (req: Request, res: Response) => {
    try {
        const {
            churchName, denomination, city, subCity, contactPhone, description, lat, lng,
            username, userPhone, email, password
        } = req.body;

        // 1. Check for duplicates
        if (await Church.findOne({ name: churchName })) {
            return res.status(400).json({ success: false, message: "Church name already registered." });
        }
        if (userPhone && await User.findOne({ phoneNumber: userPhone })) {
            return res.status(400).json({ success: false, message: "Admin phone number already registered." });
        }
        if (email && await User.findOne({ email })) {
            return res.status(400).json({ success: false, message: "Admin email already registered." });
        }

        // 2. Handle Image
        const logoUrl = req.file ? req.file.path : "";

        // 3. Create Church (PENDING)
        const church = await Church.create({
            name: churchName,
            denomination,
            contactPhone,
            description,
            logoUrl,
            address: {
                city: city || "Hossana",
                subCity,
                coordinates: { lat: Number(lat) || 0, lng: Number(lng) || 0 }
            },
            status: "pending" // Requires Super Admin approval
        });

        // 4. Create Admin (PENDING)
        const user = await User.create({
            username, email, phoneNumber: userPhone,
            passwordHash: password,
            role: "church_admin",
            churchId: church._id,
            verificationStatus: "pending", // Requires Super Admin approval
            isActive: true
        });

        // Link Admin to Church
        church.adminUserId = user._id as any;
        await church.save();

        // 5. Generate Token so they can log in (but dashboard will be restricted due to pending status)
        const token = generateToken(user); // Assuming generateToken is defined in this file

        res.status(201).json({
            success: true,
            message: "Church and Admin registered successfully! Pending approval.",
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                verificationStatus: user.verificationStatus
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};


type PopulatedUser = IUser & {
    churchId?: IChurch;
};

/**
 * @desc    Login User
 * @route   POST /api/auth/login
 */
export const loginUser = async (req: Request, res: Response) => {
    try {
        let { email, phoneNumber, password } = req.body;

        // Clean inputs
        if (email) email = email.trim().toLowerCase();
        if (phoneNumber) phoneNumber = phoneNumber.trim();

        const criteria = [];
        if (email) criteria.push({ email });
        if (phoneNumber) criteria.push({ phoneNumber });

        if (criteria.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide email or phone number." });
        }
        const user = await User.findOne({ $or: criteria })
            .select("+passwordHash")
            .populate("churchId", "name") as PopulatedUser;

        if (!user) {
            console.log("Login Failed: User not found");
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        // 2. Check Password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log("Login Failed: Wrong password");
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        // 3. Check if Banned
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Account has been suspended." });
        }

        // 4. Update Last Login
        user.lastLogin = new Date();
        await user.save();

        // 5. Send Response
        const token = generateToken(user);
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                churchId: user.churchId,
                avatarUrl: user.avatarUrl,
                churchName: user.churchId?.name,
                verificationStatus: user.verificationStatus,
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};

/**
 * @desc    Forgot Password - Generates token & sends email
 * @route   POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            // We return 200 even if user doesn't exist for security (prevents email enumeration)
            return res.status(200).json({ success: true, message: "If an account exists, an email was sent." });
        }

        // 1. Generate Token
        const resetToken = crypto.randomBytes(20).toString("hex");

        // 2. Hash token and set to database (Expires in 15 mins)
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        // 3. Create reset URL (Frontend URL)
        const frontendUrl = process.env.FRONTEND_URL || "https://zemeromo.et";
        const resetUrl = `${frontendUrl}/auth/reset-password/${resetToken}`;

        const message = `
            <h2>Zemeromo Password Reset</h2>
            <p>You requested a password reset. Please click the link below to set a new password:</p>
            <a href="${resetUrl}" style="background:#1E3A8A; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        `;

        // 4. Send Email
        try {
            await sendEmail({ email: user.email!, subject: "Zemeromo - Password Reset", message });
            res.status(200).json({ success: true, message: "Email sent" });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: "Email could not be sent" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Reset Password
 * @route   PUT /api/auth/reset-password/:token
 */
export const resetPassword = async (req: Request, res: Response) => {
    try {
        // 1. Get hashed token
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        // 2. Find user by token AND check if token is not expired
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });

        // 3. Set new password
        user.passwordHash = req.body.password; // Pre-save hook will hash this!
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};