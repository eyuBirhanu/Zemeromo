import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    currency: string; // "ETB"
    provider: "telebirr" | "chapa" | "google_play" | "manual";
    providerTxRef?: string; // The ID from Telebirr
    status: "pending" | "completed" | "failed";

    // What did they buy?
    itemId: mongoose.Types.ObjectId;
    itemType: "Album" | "Donation";
}

const TransactionSchema = new Schema<ITransaction>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "ETB" },
    provider: { type: String, enum: ["telebirr", "chapa", "google_play", "manual"], required: true },
    providerTxRef: { type: String },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },

    itemId: { type: Schema.Types.ObjectId, required: true, refPath: 'itemType' },
    itemType: { type: String, required: true, enum: ['Album', 'Donation'] }
}, { timestamps: true });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);