import { Request, Response } from "express";
import mongoose from "mongoose";
import Song from "../models/Song";
import Album from "../models/Album";
import Artist from "../models/Artist";

interface AuthRequest extends Request {
    user?: any;
}

// --- HELPER: Format Graph Data ---
const formatGraphData = (dbData: any[]) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const found = dbData.find(item => item._id === dateStr);
        last7Days.push({
            date: dateStr,
            count: found ? found.count : 0
        });
    }
    return last7Days;
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        const matchStage: any = { isDeleted: false };

        // 1. SECURITY: Determine Filter Scope
        if (user.role === 'church_admin') {

            // Safety Check: Does user have a church?
            if (!user.churchId) {
                return res.status(400).json({ success: false, message: "Church Admin has no assigned church" });
            }

            // CRITICAL FIX: Safely extract the ID string
            // Handle case where churchId might be populated (Object) or raw (String/ObjectId)
            const rawId = user.churchId._id || user.churchId;
            const churchIdString = String(rawId); // Force to string

            // Now safe to cast
            matchStage.churchId = new mongoose.Types.ObjectId(churchIdString);
        }

        // 2. PARALLEL QUERIES
        const [
            totalSongs,
            totalArtists,
            totalAlbums,
            recentSongs,
            totalPlaysObj,
            uploadStats
        ] = await Promise.all([
            // A. Counts
            Song.countDocuments(matchStage),
            Artist.countDocuments(matchStage),
            Album.countDocuments(matchStage),

            // B. Recent Activity
            Song.find(matchStage)
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("artistId", "name")
                .populate("albumId", "title")
                .populate("churchId", "name"),

            // C. Total Plays (Aggregation)
            Song.aggregate([
                { $match: matchStage },
                { $group: { _id: null, total: { $sum: "$stats.plays" } } }
            ]),

            // D. Graph Data
            Song.aggregate([
                {
                    $match: {
                        ...matchStage,
                        createdAt: {
                            $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        // 3. PROCESS DATA
        const totalPlays = totalPlaysObj[0]?.total || 0;

        // Storage Calc (Approximate)
        const estimatedSizeMB = totalSongs * 9;
        const storageGB = (estimatedSizeMB / 1024).toFixed(2);
        const graphData = formatGraphData(uploadStats);

        res.json({
            success: true,
            data: {
                counts: {
                    songs: totalSongs,
                    artists: totalArtists,
                    albums: totalAlbums,
                    plays: totalPlays,
                },
                storage: {
                    usedGB: storageGB,
                    limitGB: 5.0,
                    percentage: Math.min((parseFloat(storageGB) / 5.0) * 100, 100)
                },
                recentActivity: recentSongs,
                graph: graphData
            }
        });

    } catch (error: any) {
        console.error("Dashboard Stats Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};