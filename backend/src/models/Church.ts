import mongoose, { Schema, Document } from "mongoose";

export interface IChurch extends Document {
    name: string;
    denomination: "Mekane Yesus" | "Kale Heywet" | "Mulu Wangel" | "Meserete Kristos" | "Assembly of God" | "Other";
    address: {
        city: string;
        subCity: string;
        coordinates?: { lat: number; lng: number };
    };
    description?: string;
    contactPhone: string;
    email?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    adminUserId?: mongoose.Types.ObjectId;
    status: "pending" | "verified" | "rejected";
    stats: {
        songsCount: number;
        albumsCount: number;
        singersCount: number;
    };
}

const ChurchSchema = new Schema<IChurch>({
    // REMOVED explicit _id definition. Mongoose handles it.
    name: { type: String, required: true, trim: true, unique: true },
    denomination: {
        type: String,
        enum: ["Mekane Yesus", "Kale Heywet", "Mulu Wangel", "Meserete Kristos", "Assembly of God", "Other"],
        default: "Other"
    },
    address: {
        city: { type: String, default: "Hossana" },
        subCity: { type: String, required: true },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    description: { type: String },
    contactPhone: { type: String, required: true },
    email: { type: String },
    logoUrl: { type: String },
    coverImageUrl: { type: String },
    adminUserId: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "verified"
    },
    stats: {
        songsCount: { type: Number, default: 0 },
        albumsCount: { type: Number, default: 0 },
        singersCount: { type: Number, default: 0 }
    }
}, { timestamps: true });

export default mongoose.model<IChurch>("Church", ChurchSchema);