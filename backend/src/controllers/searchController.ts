import { Request, Response } from "express";
import Song from "../models/Song";
import Album from "../models/Album";
import Artist from "../models/Artist";
import Church from "../models/Church";

/**
 * @desc    Global Search (Songs, Artists, Albums, Churches)
 * @route   GET /api/search?q=keyword
 * @access  Public
 */
export const searchContent = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;

        // 1. Validation
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ success: false, message: "Search query required" });
        }

        const keyword = q.trim();
        if (keyword.length < 2) {
            return res.status(400).json({ success: false, message: "Search term must be at least 2 characters" });
        }

        // 2. Create Regex (Case insensitive, partial match)
        // We escape special characters to prevent regex errors
        const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(safeKeyword, 'i');

        // 3. Execute Searches in Parallel (Fastest way)
        const [songs, albums, artists, churches] = await Promise.all([

            // A. Search Songs (Title, Lyrics, Tags)
            Song.find({
                $or: [
                    { title: regex },
                    { lyrics: regex },
                    { tags: regex },
                    { "credits.writer": regex } // Even search writer name
                ],
                isDeleted: false,
                status: "active"
            })
                .populate("artistId", "name imageUrl") // Needed for UI cards
                .select("title duration audioUrl thumbnailUrl lyrics")
                .limit(10),

            // B. Search Albums (Title, Genre, Tags)
            Album.find({
                $or: [
                    { title: regex },
                    { tags: regex },
                    { genre: regex }
                ],
                isDeleted: false,
                isPublished: true
            })
                .populate("artistId", "name")
                .select("title coverImageUrl releaseYear")
                .limit(10),

            // C. Search Artists (Name, Tags)
            Artist.find({
                $or: [
                    { name: regex },
                    { tags: regex }
                ],
                isDeleted: false,
                isActive: true
            })
                .select("name imageUrl isGroup")
                .limit(10),

            // D. Search Churches (Name, Location, Denomination)
            Church.find({
                $or: [
                    { name: regex },
                    { "address.city": regex },
                    { "address.subCity": regex },
                    { denomination: regex }
                ],
                status: "verified"
            })
                .select("name logoUrl address denomination")
                .limit(5)
        ]);

        // 4. Return Structured Response
        res.json({
            success: true,
            data: {
                songs,
                albums,
                artists,
                churches,
                totalResults: songs.length + albums.length + artists.length + churches.length
            }
        });

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ success: false, message: "Search failed" });
    }
};