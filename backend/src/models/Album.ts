import mongoose, { Schema, Document } from "mongoose";

export interface IAlbum extends Document {
    title: string;
    description?: string;
    artistId: mongoose.Types.ObjectId;
    churchId: mongoose.Types.ObjectId;
    coverImageUrl: string;
    releaseYear?: string;
    genre: string;
    tags: string[];
    price: number;

    // Status Flags
    isPublished: boolean; // Visible in app?
    isFeatured: boolean;  // Show on Home Carousel?

    isDeleted: boolean;

    // Analytics (Cached)
    stats: {
        totalPlays: number;
        totalDownloads: number;
        favoritesCount: number;
        songsCount: number; // Useful to show "8 Songs" without querying
    };
}

const AlbumSchema = new Schema<IAlbum>({
    title: { type: String, required: true, trim: true },
    description: { type: String },
    artistId: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
    churchId: { type: Schema.Types.ObjectId, ref: "Church", required: true },
    coverImageUrl: { type: String, required: true },
    releaseYear: { type: String },
    genre: { type: String, default: "Worship" },
    tags: [{ type: String }],
    price: { type: Number, default: 0 },

    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false }, // NEW
    isDeleted: { type: Boolean, default: false, index: true },
    stats: {
        totalPlays: { type: Number, default: 0 },
        totalDownloads: { type: Number, default: 0 },
        favoritesCount: { type: Number, default: 0 },
        songsCount: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Text Search Index
AlbumSchema.index({ title: 'text', 'tags': 'text' });

export default mongoose.model<IAlbum>("Album", AlbumSchema);