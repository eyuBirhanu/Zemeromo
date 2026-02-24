import mongoose, { Schema, Document } from "mongoose";

export interface IArtist extends Document {
    name: string;
    description?: string;
    churchId?: mongoose.Types.ObjectId;
    imageUrl: string;
    isGroup: boolean; // True = Choir, False = Solo
    membersCount?: number;
    isActive: boolean;
    isDeleted: boolean;
    tags: string[];

    // Cached Stats (Read optimized)
    stats: {
        albumsCount: number;
        songsCount: number;
    };
}

const ArtistSchema = new Schema<IArtist>({
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String },
    churchId: { type: Schema.Types.ObjectId, ref: "Church" },
    imageUrl: { type: String, default: "" },
    isGroup: { type: Boolean, default: false },
    membersCount: { type: Number },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    tags: [{ type: String }],

    stats: {
        albumsCount: { type: Number, default: 0 },
        songsCount: { type: Number, default: 0 }
    }
}, { timestamps: true });

export default mongoose.model<IArtist>("Artist", ArtistSchema);