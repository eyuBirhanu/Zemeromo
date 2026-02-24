import mongoose, { Schema, Document } from "mongoose";

export interface ISong extends Document {
    title: string;
    lyrics: string;
    audioUrl: string;
    duration: number;
    thumbnailUrl: string;

    artistId: mongoose.Types.ObjectId;
    albumId: mongoose.Types.ObjectId;
    churchId: mongoose.Types.ObjectId;

    isCover: boolean;
    originalCredits: string;

    credits: {
        writer?: string;
        composer?: string;
        arranger?: string;
    };

    genre: string;
    tags: string[];
    language: string; // <--- The problem field

    status: "active" | "archived";
    isFeatured: boolean;
    isDeleted: boolean;

    stats: {
        plays: number;
        downloads: number;
        favorites: number;
        shares: number;
    };
}

const SongSchema = new Schema<ISong>({
    title: { type: String, required: true, trim: true }, // Removed 'index: true' here to group it below
    lyrics: { type: String, required: true },
    audioUrl: { type: String, required: true },
    duration: { type: Number, default: 0 },
    thumbnailUrl: { type: String },

    artistId: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
    albumId: { type: Schema.Types.ObjectId, ref: "Album", required: true },
    churchId: { type: Schema.Types.ObjectId, ref: "Church", required: true },

    isCover: { type: Boolean, default: false },
    originalCredits: { type: String, default: "" },

    credits: {
        writer: String,
        composer: String,
        arranger: String
    },

    genre: { type: String, default: "Worship" },
    tags: [{ type: String }],

    // We store "Amharic" here, but we tell MongoDB to ignore it for indexing logic below
    language: { type: String, default: "Amharic" },

    status: {
        type: String,
        enum: ["active", "archived"],
        default: "active"
    },
    isFeatured: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },

    stats: {
        plays: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 },
        favorites: { type: Number, default: 0 },
        shares: { type: Number, default: 0 }
    }
}, { timestamps: true });

SongSchema.index(
    { title: 'text', lyrics: 'text', tags: 'text' },
    { language_override: 'dummy_lang' }
);

export default mongoose.model<ISong>("Song", SongSchema);