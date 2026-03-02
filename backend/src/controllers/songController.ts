import { Request, Response } from "express";
import Song from "../models/Song";
import Album from "../models/Album";
import Artist from "../models/Artist";
import mongoose from "mongoose";

interface AuthRequest extends Request {
    user?: any;
    files?: { [fieldname: string]: Express.Multer.File[] };
}

/**
 * @desc    Add a New Song
 * @logic   If unverified, force status to "archived" (Draft). Audio is OPTIONAL.
 */
export const createSong = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const user = authReq.user;
        const {
            title, lyrics, artistId, albumId, genre, language,
            writer, composer, arranger, isCover, originalCredits, status, tags
        } = req.body;

        // --- 1. RESOLVE CHURCH ID ---
        let churchId: string | undefined;

        if (user.role === 'church_admin') {
            churchId = user.churchId;
        } else if (user.role === 'super_admin') {
            churchId = req.body.churchId;
            if (!churchId) {
                return res.status(400).json({ success: false, message: "Super Admin must assign a Church Owner." });
            }
        }

        if (!churchId) return res.status(403).json({ success: false, message: "Authorization Error: No Church ID found." });

        // --- 2. VERIFICATION LOGIC ---
        let finalStatus = status || "active";
        // If unverified church admin, force Draft mode
        if (user.role === 'church_admin' && user.verificationStatus !== 'verified') {
            finalStatus = "archived";
        }

        // --- 3. HANDLE FILES (OPTIONAL) ---
        const files = authReq.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const audioFile = files?.["audio"]?.[0];
        const imageFile = files?.["thumbnail"]?.[0];

        // 🚨 FIX: We allow creation if Audio OR Lyrics exists. Both missing = Error.
        if (!audioFile && (!lyrics || lyrics.trim().length === 0)) {
            return res.status(400).json({
                success: false,
                message: "You must provide either an Audio File or Lyrics."
            });
        }

        // --- 4. PARSE TAGS ---
        let parsedTags: string[] = [];
        if (tags) {
            parsedTags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim());
        }

        // --- 5. CREATE SONG ---
        const song = await Song.create({
            title,
            lyrics: lyrics || "", // Allow empty string if audio exists
            artistId,
            albumId,
            churchId,
            genre: genre || "Worship",
            language: language || "Amharic",

            // Audio is optional now
            audioUrl: audioFile ? audioFile.path : "",
            thumbnailUrl: imageFile ? imageFile.path : "",

            isCover: isCover === 'true' || isCover === true,
            originalCredits: originalCredits || "",
            credits: { writer, composer, arranger },
            tags: parsedTags,
            status: finalStatus,
            isDeleted: false,
            isFeatured: false
        });

        // --- 6. UPDATE STATS ---
        await Promise.all([
            Album.findByIdAndUpdate(albumId, { $inc: { "stats.songsCount": 1 } }),
            Artist.findByIdAndUpdate(artistId, { $inc: { "stats.songsCount": 1 } })
        ]);

        const message = finalStatus === "archived" && user.role === 'church_admin'
            ? "Song uploaded as Draft. Verify your account to publish."
            : "Song uploaded successfully";

        res.status(201).json({ success: true, data: song, message });

    } catch (error: any) {
        console.error("❌ Create Song Error:", error);
        res.status(500).json({ success: false, message: "Upload failed", error: error.message });
    }
};

export const getSongs = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { churchId, albumId, artistId, search, showDeleted, status, isFeatured } = req.query;
        let query: any = {};

        const user = authReq.user;
        const userRole = user ? user.role : 'guest';
        const userChurchId = user ? user.churchId : null;

        if (userRole === 'church_admin') {
            query.churchId = userChurchId;
            query.isDeleted = false;
            if (showDeleted === 'true') query.isDeleted = true;
        } else if (userRole === 'super_admin') {
            if (churchId) query.churchId = churchId;
            query.isDeleted = showDeleted === 'true';
        } else {
            query.status = "active";
            query.isDeleted = false;
            if (churchId) query.churchId = churchId;
        }

        if (albumId) query.albumId = albumId;
        if (artistId) query.artistId = artistId;
        if (status) query.status = status;
        if (isFeatured === 'true') query.isFeatured = true;

        if (search) query.$text = { $search: search as string };

        const songs = await Song.find(query)
            .populate("artistId", "name imageUrl")
            .populate("albumId", "title coverImageUrl")
            .populate("churchId", "name")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: songs.length, data: songs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Update Song
 */
export const updateSong = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const songId = req.params.id;
        const user = authReq.user;

        // 1. Find Song
        const song = await Song.findById(songId);
        if (!song) return res.status(404).json({ success: false, message: "Song not found" });

        // 2. Security Check
        const isSuper = user.role === 'super_admin';

        if (!isSuper && user.verificationStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: "Your account is pending verification. You cannot edit songs."
            });
        }

        // Strict String Comparison
        const songChurchId = song.churchId.toString();
        const userChurchId = user.churchId ? user.churchId.toString() : "";

        if (!isSuper && songChurchId !== userChurchId) {
            return res.status(403).json({ success: false, message: "Unauthorized to edit this song" });
        }

        // 3. Update Text Fields
        const body = req.body;
        if (body.title) song.title = body.title;
        if (body.lyrics) song.lyrics = body.lyrics;
        if (body.genre) song.genre = body.genre;
        if (body.language) song.language = body.language;
        if (body.status) song.status = body.status;
        if (body.originalCredits) song.originalCredits = body.originalCredits;

        if (body.isCover !== undefined) song.isCover = String(body.isCover) === 'true';
        if (body.isFeatured !== undefined) song.isFeatured = String(body.isFeatured) === 'true';

        if (body.writer || body.composer) {
            song.credits = {
                writer: body.writer || song.credits?.writer,
                composer: body.composer || song.credits?.composer,
                arranger: body.arranger || song.credits?.arranger
            };
        }

        if (body.tags) {
            song.tags = Array.isArray(body.tags)
                ? body.tags
                : String(body.tags).split(',').map((t: string) => t.trim()).filter(t => t.length > 0);
        }

        if (body.isDeleted !== undefined && isSuper) {
            song.isDeleted = String(body.isDeleted) === 'true';
        }

        // 4. Handle Files (Safely)
        const files = authReq.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        if (files) {
            if (files["audio"] && files["audio"].length > 0) {
                console.log("🎵 Updating Audio...");
                song.audioUrl = files["audio"][0].path;
            }
            if (files["thumbnail"] && files["thumbnail"].length > 0) {
                console.log("🖼️ Updating Thumbnail...");
                song.thumbnailUrl = files["thumbnail"][0].path;
            }
        }

        await song.save();
        res.json({ success: true, data: song, message: "Song updated" });

    } catch (error: any) {
        console.error("❌ Update Song Error Stack:", error.stack);
        res.status(500).json({
            success: false,
            message: "Server Error during update",
            error: error.message
        });
    }
};

/**
 * @desc    Delete Song
 */
export const deleteSong = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const song = await Song.findById(req.params.id);
        if (!song) return res.status(404).json({ success: false, message: "Song not found" });

        const user = authReq.user;

        if (user.role === 'church_admin' && user.verificationStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: "Your account is pending verification. You cannot delete songs."
            });
        }

        if (user.role === 'church_admin') {
            if (song.churchId.toString() !== user.churchId) {
                return res.status(403).json({ success: false, message: "Not authorized" });
            }
            song.isDeleted = true;
            song.status = "archived";
            await song.save();
            return res.json({ success: true, message: "Song moved to trash" });
        }

        if (user.role === 'super_admin') {
            const artistId = song.artistId;
            const albumId = song.albumId;

            await song.deleteOne();

            await Promise.all([
                Album.findByIdAndUpdate(albumId, { $inc: { "stats.songsCount": -1 } }),
                Artist.findByIdAndUpdate(artistId, { $inc: { "stats.songsCount": -1 } })
            ]);

            return res.json({ success: true, message: "Song permanently deleted" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getSongById = async (req: Request, res: Response) => {
    try {
        const song = await Song.findById(req.params.id)
            .populate("artistId", "name imageUrl")
            .populate("albumId", "title coverImageUrl")
            .populate("churchId", "name");

        if (!song) return res.status(404).json({ success: false, message: "Song not found" });
        res.json({ success: true, data: song });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};