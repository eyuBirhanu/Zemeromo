import { Request, Response } from "express";
import Album from "../models/Album";
import Song from "../models/Song";
import { Api } from "../utils/response";

// --- ALBUMS ---

export const createAlbum = async (req: Request, res: Response) => {
    try {
        // Ensure the user has a church ID (setup during their account creation)
        const user = (req as any).user;
        if (!user.churchId && user.role !== "super_admin") {
            return Api.error(res, "You must be assigned to a church to create albums", 403);
        }

        const coverImageUrl = req.file?.path;

        const album = await Album.create({
            ...req.body,
            churchId: user.churchId, // Auto-assign to their church
            coverImageUrl,
        });

        return Api.success(res, album, "Album created successfully", 201);
    } catch (error: any) {
        return Api.error(res, "Failed to create album", 500, error.message);
    }
};

// --- SONGS ---

export const addSong = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        // Multer gives us files via req.files (plural) if we upload multiple
        // We expect: "audio" (mp3) and optionally "thumbnail" (image)
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const audioUrl = files["audio"]?.[0]?.path;
        const thumbnailUrl = files["thumbnail"]?.[0]?.path;

        if (!audioUrl) {
            return Api.error(res, "Audio file is required", 400);
        }

        // Fallback Logic: If no thumbnail, we rely on the Album's cover later.
        // We just save what we have.

        const song = await Song.create({
            ...req.body,
            churchId: user.churchId,
            audioUrl,
            thumbnailUrl,
        });

        return Api.success(res, song, "Song added successfully", 201);
    } catch (error: any) {
        return Api.error(res, "Failed to upload song", 500, error.message);
    }
};

// Get Songs for the Mobile App (Feed)
export const getRecentSongs = async (req: Request, res: Response) => {
    try {
        const songs = await Song.find()
            .populate("albumId", "title coverImageUrl") // Get Album info
            .populate("churchId", "name") // Get Church info
            .sort({ createdAt: -1 }) // Newest first
            .limit(20);

        return Api.success(res, songs, "Feed fetched");
    } catch (error) {
        return Api.error(res, "Server Error", 500);
    }
};

export const syncContent = async (req: Request, res: Response) => {
    try {
        const { lastSyncDate } = req.query;

        // If it's the first time, fetch everything. 
        // If they have a date, fetch only what's new/updated since then.
        const query = lastSyncDate
            ? { updatedAt: { $gt: new Date(lastSyncDate as string) } }
            : {};

        const newSongs = await Song.find(query).populate("albumId").populate("churchId");
        const newAlbums = await Album.find(query);

        // We send a timestamp so the app knows when it last synced
        return Api.success(res, {
            songs: newSongs,
            albums: newAlbums,
            syncTimestamp: new Date().toISOString()
        }, "Sync successful");
    } catch (error) {
        return Api.error(res, "Sync failed", 500);
    }
};

// 2. Search (By Title, Lyrics, Artist)
export const searchContent = async (req: Request, res: Response) => {
    try {
        const { q } = req.query; // q = query string
        if (!q) return Api.error(res, "Search query required", 400);

        const regex = new RegExp(q as string, 'i'); // Case insensitive

        // Search in Songs (Title OR Lyrics)
        const songs = await Song.find({
            $or: [
                { title: regex },
                { lyrics: regex }, // This enables searching by lyrics snippet!
                { tags: regex }
            ]
        }).populate("churchId", "name");

        // Search in Albums (Title or Artist)
        const albums = await Album.find({
            $or: [
                { title: regex },
                { artist: regex }
            ]
        });

        return Api.success(res, { songs, albums }, "Search results");
    } catch (error) {
        return Api.error(res, "Search failed", 500);
    }
};

// 3. Increment Play Count (Analytics)
export const logPlay = async (req: Request, res: Response) => {
    try {
        const { songId } = req.params;
        // We assume the user is just listening, so we increment the view
        // We don't need to await this strictly if we want speed, but for data safety:
        await Song.findByIdAndUpdate(songId, { $inc: { views: 1 } }); // $inc means increment
        return Api.success(res, null, "View counted");
    } catch (error) {
        // Don't crash the app just because a stat failed
        console.error("Stat error", error);
        return res.status(200).send();
    }
};