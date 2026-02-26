import mongoose, { Schema, Document, CallbackWithoutResultAndOptionalError } from "mongoose";
import bcrypt from "bcryptjs";

// 1. Define the Interface
export interface IPurchase {
    itemType: 'Album' | 'Song';
    itemId: mongoose.Types.ObjectId;
    purchasedAt: Date;
    pricePaid: number;
    transactionId?: mongoose.Types.ObjectId;
}

export interface IUser extends Document {
    username: string;
    email?: string;
    phoneNumber?: string;
    passwordHash?: string;
    googleId?: string;
    role: "super_admin" | "church_admin" | "user";
    churchId?: mongoose.Types.ObjectId;
    favorites: mongoose.Types.ObjectId[];
    library: IPurchase[];
    isActive: boolean;
    verificationStatus: "pending" | "verified" | "rejected";
    lastLogin: Date;
    resetPasswordToken?: String;
    resetPasswordExpire?: Date;
    avatarUrl?: string;
    comparePassword(password: string): Promise<boolean>;
}

const PurchaseSchema = new Schema({
    itemType: { type: String, enum: ['Album', 'Song'], required: true },
    itemId: { type: Schema.Types.ObjectId, required: true, refPath: 'library.itemType' },
    purchasedAt: { type: Date, default: Date.now },
    pricePaid: { type: Number, required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" }
}, { _id: false });

// 2. Define the Schema with the Generic <IUser>
const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phoneNumber: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, select: false },
    role: { type: String, enum: ["super_admin", "church_admin", "user"], default: "user" },
    churchId: { type: Schema.Types.ObjectId, ref: "Church" },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Song" }],
    library: [PurchaseSchema],
    isActive: { type: Boolean, default: true },
    verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending" // Normal users are verified by default. Church Admins will be 'pending'.
    },
    lastLogin: { type: Date },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    avatarUrl: { type: String }
}, { timestamps: true });

// ---------------------------------------------------------
// FIX: Simplified Middleware Signature
// ---------------------------------------------------------
UserSchema.pre("save", async function () {
    if (!this.isModified("passwordHash")) return;

    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash!, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.passwordHash) return false;
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model<IUser>("User", UserSchema);