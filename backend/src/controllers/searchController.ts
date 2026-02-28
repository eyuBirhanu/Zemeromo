import { Request, Response } from "express";
import Song from "../models/Song";
import Album from "../models/Album";
import Artist from "../models/Artist";
import Church from "../models/Church";

/**
 * @desc    Global Search
 * @route   GET /api/search?q=keyword&type=song|artist|album|church|all
 */
export const searchContent = async (req: Request, res: Response) => {
    try {
        const { q, type } = req.query;

        // 1. Validation
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ success: false, message: "Search query required" });
        }

        const keyword = q.trim();
        // Allow 1 char searches? Maybe too heavy. Let's keep 2.
        if (keyword.length < 2) {
            return res.status(200).json({ success: true, data: [] }); // Return empty list instead of error for UI
        }

        // 2. Setup Regex
        const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(safeKeyword, 'i');

        // Normalize type input
        const filterType = (type as string)?.toLowerCase() || 'all';

        // 3. Conditional Searching
        let results: any[] = [];
        const limit = 10; // Limit per category

        const promises = [];

        // --- SEARCH SONGS ---
        if (filterType === 'all' || filterType === 'song') {
            promises.push(
                Song.find({
                    $or: [{ title: regex }, { lyrics: regex }, { tags: regex }],
                    isDeleted: false,
                    status: "active"
                })
                    .populate("artistId", "name imageUrl")
                    .select("title duration audioUrl thumbnailUrl lyrics artistId")
                    .limit(limit)
                    .lean() // Converts to plain JS object so we can add 'type'
                    .then(items => items.map(i => ({ ...i, type: 'Song' })))
            );
        }

        // --- SEARCH ARTISTS ---
        if (filterType === 'all' || filterType === 'artist') {
            promises.push(
                Artist.find({
                    $or: [{ name: regex }, { tags: regex }],
                    isDeleted: false,
                    isActive: true
                })
                    .select("name imageUrl isGroup churchId")
                    .populate("churchId", "name")
                    .limit(limit)
                    .lean()
                    .then(items => items.map(i => ({ ...i, type: 'Artist' })))
            );
        }

        // --- SEARCH ALBUMS ---
        if (filterType === 'all' || filterType === 'album') {
            promises.push(
                Album.find({
                    $or: [{ title: regex }, { tags: regex }],
                    isDeleted: false,
                    isPublished: true
                })
                    .populate("artistId", "name")
                    .select("title coverImageUrl releaseYear artistId")
                    .limit(limit)
                    .lean()
                    .then(items => items.map(i => ({ ...i, type: 'Album' })))
            );
        }

        // --- SEARCH CHURCHES ---
        if (filterType === 'all' || filterType === 'church') {
            promises.push(
                Church.find({
                    $or: [{ name: regex }, { "address.city": regex }],
                    status: "verified"
                })
                    .select("name logoUrl address denomination")
                    .limit(limit)
                    .lean()
                    .then(items => items.map(i => ({ ...i, type: 'Church' })))
            );
        }

        // 4. Await all selected queries
        const resultsArray = await Promise.all(promises);

        // 5. Flatten the array of arrays into one single list
        results = resultsArray.flat();

        // Optional: Shuffle if 'all' to make it look organic
        if (filterType === 'all') {
            results.sort(() => Math.random() - 0.5);
        }

        res.json({ success: true, data: results });

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ success: false, message: "Search failed" });
    }
};