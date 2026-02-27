import { Request, Response } from "express";
import Church from "../models/Church";
import Artist from "../models/Artist";
import Album from "../models/Album";
import Song from "../models/Song";

interface AuthRequest extends Request {
    user?: any;
    files?: any;
}

const normalize = (str: string) => str.trim();

/**
 * @desc    Upload Multiple Files (Audio/Images) and get URLs
 * @route   POST /api/bulk/media
 */
export const uploadBulkMedia = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        const uploadedData = files.map(file => ({
            originalName: file.originalname,
            url: file.path, // Cloudinary URL
            size: file.size, // Size in bytes
            type: file.mimetype.startsWith("audio") ? "audio" : "image"
        }));

        res.json({
            success: true,
            count: uploadedData.length,
            data: uploadedData
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Bulk Upload Failed", error });
    }
};

/**
 * @desc    Import Hierarchical JSON
 * @route   POST /api/bulk/import
 */
export const importJSON = async (req: AuthRequest, res: Response) => {
    const payload = req.body;
    const stats = { churches: 0, artists: 0, albums: 0, songs: 0, errors: [] as string[] };

    if (!Array.isArray(payload)) {
        return res.status(400).json({ success: false, message: "Payload must be an array" });
    }

    try {
        for (const cData of payload) {
            // Check if Church exists by Name
            let church = await Church.findOne({ name: cData.name });

            if (!church) {
                church = await Church.create({
                    name: normalize(cData.name),
                    denomination: cData.denomination || "Other",
                    address: {
                        city: cData.city || "Hossana",
                        subCity: cData.subCity || "Main"
                    },
                    contactPhone: cData.phone || "0000000000",
                    description: cData.description,
                    logoUrl: cData.logoUrl || "",
                    status: "verified",
                    // FIX 2: req.user is now valid due to AuthRequest
                    adminUserId: req.user.id
                });
                stats.churches++;
            }

            if (cData.artists && Array.isArray(cData.artists)) {
                for (const aData of cData.artists) {
                    let artist = await Artist.findOne({ name: aData.name, churchId: church._id });

                    if (!artist) {
                        artist = await Artist.create({
                            name: normalize(aData.name),
                            churchId: church._id,
                            isGroup: aData.isGroup !== false,
                            imageUrl: aData.imageUrl || "",
                            description: aData.description,
                            isActive: true
                        });
                        stats.artists++;
                    }

                    if (aData.albums && Array.isArray(aData.albums)) {
                        for (const alData of aData.albums) {
                            let album = await Album.findOne({ title: alData.title, artistId: artist._id });

                            if (!album) {
                                album = await Album.create({
                                    title: normalize(alData.title),
                                    artistId: artist._id,
                                    churchId: church._id,
                                    releaseYear: alData.releaseYear,
                                    genre: alData.genre || "Worship",
                                    coverImageUrl: alData.coverImageUrl || "",
                                    description: alData.description,
                                    isPublished: true
                                });
                                stats.albums++;
                            }

                            if (alData.songs && Array.isArray(alData.songs)) {
                                for (const sData of alData.songs) {
                                    const songExists = await Song.findOne({ title: sData.title, albumId: album._id });

                                    if (!songExists) {
                                        // FIX 3: Optional Audio and Lyrics handled here
                                        await Song.create({
                                            title: normalize(sData.title),
                                            // Defaults to empty string if missing in JSON
                                            lyrics: sData.lyrics || "",
                                            audioUrl: sData.audioUrl || "",
                                            fileSize: sData.fileSize || 0,

                                            artistId: artist._id,
                                            albumId: album._id,
                                            churchId: church._id,
                                            genre: album.genre,
                                            language: sData.language || "Amharic",
                                            status: "active"
                                        });
                                        stats.songs++;

                                        // Increment counts
                                        await Album.findByIdAndUpdate(album._id, { $inc: { "stats.songsCount": 1 } });
                                        await Artist.findByIdAndUpdate(artist._id, { $inc: { "stats.songsCount": 1 } });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        res.json({ success: true, message: "Import Completed", stats });

    } catch (error: any) {
        console.error("Bulk Import Error:", error);
        // Better error logging
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
            details: error.errors // Shows specific validation errors if any remain
        });
    }
};