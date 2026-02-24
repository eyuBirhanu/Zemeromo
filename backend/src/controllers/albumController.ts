import { Request, Response } from "express";
import Album from "../models/Album";
import mongoose from "mongoose";

// Helper interface for Auth Request
interface AuthRequest extends Request {
    user?: any;
    file?: any; // Multer file
}

/**
 * @desc    Create a new Album
 * @logic   Unverified admins can create, but it forces 'isPublished: false'
 */
export const createAlbum = async (req: AuthRequest, res: Response) => {
    try {
        const { title, artistId, description, price, genre, releaseYear } = req.body;
        const user = req.user;

        // --- 1. RESOLVE CHURCH ID ---
        let targetChurchId;

        if (user.role === 'church_admin') {
            targetChurchId = user.churchId;
        } else if (user.role === 'super_admin') {
            targetChurchId = req.body.churchId;
            if (!targetChurchId) {
                return res.status(400).json({ success: false, message: "Super Admin must select a Church" });
            }
        } else {
            return res.status(403).json({ success: false, message: "Unauthorized role" });
        }

        // --- 2. VALIDATION ---
        if (!title || !artistId) {
            return res.status(400).json({ success: false, message: "Title and Artist are required" });
        }

        // --- 3. HANDLE IMAGE UPLOAD ---
        let coverImageUrl = "";
        if (req.file) {
            coverImageUrl = req.file.path; // Cloudinary URL
        } else {
            return res.status(400).json({ success: false, message: "Cover Image is required" });
        }

        // --- 4. CREATE ALBUM ---
        // Notice: 'isPublished' is always false on creation to ensure it acts as a Draft.
        const album = await Album.create({
            title,
            artistId,
            churchId: targetChurchId,
            description,
            price: Number(price) || 0,
            genre: genre || "Worship",
            releaseYear,
            coverImageUrl,
            isPublished: false,
            isFeatured: false,
            isDeleted: false
        });

        const message = (user.role === 'church_admin' && user.verificationStatus !== 'verified')
            ? "Album created as Draft. Verify your account to publish."
            : "Album created successfully.";

        return res.status(201).json({ success: true, message, data: album });

    } catch (error) {
        console.error("❌ Create Album Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};

export const getAlbums = async (req: AuthRequest, res: Response) => {
    try {
        const { churchId, artistId, showDeleted } = req.query;
        let query: any = {};

        const user = req.user;
        const userRole = user ? user.role : 'guest';
        const userChurchId = user ? user.churchId : null;

        // --- 1. CHURCH ADMIN ---
        if (userRole === 'church_admin') {
            if (!userChurchId) return res.json({ success: true, data: [] });
            query.churchId = userChurchId;
            query.isDeleted = false;
        }
        // --- 2. SUPER ADMIN ---
        else if (userRole === 'super_admin') {
            if (churchId) query.churchId = churchId;
            if (showDeleted === 'true') query.isDeleted = true;
        }
        // --- 3. GUEST / MOBILE APP ---
        else {
            query.isDeleted = false;
            query.isPublished = true; // <-- CRITICAL FIX: Guests only see published albums
            if (churchId) query.churchId = churchId;
        }

        // Common filter
        if (artistId) query.artistId = artistId;

        const albums = await Album.find(query)
            .populate({
                path: "artistId",
                select: "name imageUrl",
                populate: {
                    path: "churchId",
                    select: "name location adminUserId",
                    populate: {
                        path: "adminUserId",
                        select: "username email"
                    }
                }
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, count: albums.length, data: albums });

    } catch (error) {
        console.error("Get Albums Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getAlbumById = async (req: Request, res: Response) => {
    try {
        const album = await Album.findById(req.params.id)
            .populate("artistId", "name")
            .populate("churchId", "name");

        if (!album) return res.status(404).json({ success: false, message: "Album not found" });
        res.json({ success: true, data: album });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Update Album
 * @logic   Block if Church Admin is NOT verified
 */
export const updateAlbum = async (req: AuthRequest, res: Response) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ success: false, message: "Album not found" });

        const user = req.user;
        const isSuper = user.role === 'super_admin';
        const isOwner = user.role === 'church_admin' && album.churchId.toString() === user.churchId;

        // --- 1. OWNERSHIP CHECK ---
        if (!isOwner && !isSuper) {
            return res.status(403).json({ success: false, message: "Not authorized to edit this album" });
        }

        // --- 2. VERIFICATION CHECK ---
        if (!isSuper && user.verificationStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: "Your account is pending verification. You cannot edit albums yet."
            });
        }

        const { title, description, price, isPublished, isFeatured, genre, tags, releaseYear, isDeleted } = req.body;

        if (title) album.title = title;
        if (description) album.description = description;
        if (price) album.price = price;
        if (genre) album.genre = genre;
        if (releaseYear) album.releaseYear = releaseYear;
        if (isPublished !== undefined) album.isPublished = isPublished === 'true' || isPublished === true;
        if (isFeatured !== undefined) album.isFeatured = isFeatured === 'true' || isFeatured === true;
        if (tags) album.tags = tags;

        // RESTORE LOGIC (Super Admin Only)
        if (isDeleted !== undefined && isSuper) {
            album.isDeleted = isDeleted === 'true' || isDeleted === true;
        }

        if (req.file) {
            album.coverImageUrl = req.file.path;
        }

        await album.save();
        res.json({ success: true, data: album });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Delete Album
 * @logic   Block if Church Admin is NOT verified
 */
export const deleteAlbum = async (req: AuthRequest, res: Response) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ success: false, message: "Album not found" });

        const user = req.user;

        // --- VERIFICATION CHECK ---
        if (user.role === 'church_admin' && user.verificationStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: "Your account is pending verification. You cannot delete albums."
            });
        }

        if (user.role === 'church_admin') {
            if (album.churchId.toString() !== user.churchId) {
                return res.status(403).json({ success: false, message: "Not authorized" });
            }
            album.isDeleted = true;
            album.isPublished = false;
            await album.save();
            return res.json({ success: true, message: "Album moved to trash" });
        }

        if (user.role === 'super_admin') {
            await album.deleteOne();
            return res.json({ success: true, message: "Album permanently deleted" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};