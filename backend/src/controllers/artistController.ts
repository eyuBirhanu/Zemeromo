import { Request, Response } from "express";
import Artist from "../models/Artist";

interface AuthRequest extends Request {
    user?: any;
    file?: any;
}

/**
 * @desc    Create Artist
 * @logic   If Church Admin is NOT verified -> Force 'isActive: false' (Draft)
 */
export const createArtist = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, isGroup, tags, membersCount, isActive } = req.body;
        const user = req.user;

        // --- 1. RESOLVE CHURCH ID ---
        let targetChurchId;

        if (user.role === 'church_admin') {
            targetChurchId = user.churchId;
        } else if (user.role === 'super_admin') {
            targetChurchId = req.body.churchId;
            if (!targetChurchId) {
                return res.status(400).json({ success: false, message: "Super Admin must assign a Church ID" });
            }
        }

        // --- 2. FIX: VERIFICATION & ACTIVE LOGIC ---
        // By default, a new artist IS active.
        let finalIsActive = true;

        // If frontend explicitly sent a status, use it
        if (isActive !== undefined) {
            finalIsActive = isActive === 'true' || isActive === true;
        }

        // ONLY force to false (Draft) if the admin is pending verification
        if (user.role === 'church_admin' && user.verificationStatus !== 'verified') {
            finalIsActive = false;
        }

        // --- 3. IMAGE & TAGS ---
        const imageUrl = req.file ? req.file.path : "";

        let parsedTags: string[] = [];
        if (tags) {
            parsedTags = Array.isArray(tags)
                ? tags
                : tags.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0);
        }

        const artist = await Artist.create({
            name,
            description,
            churchId: targetChurchId,
            isGroup: isGroup === 'true' || isGroup === true,
            imageUrl,
            tags: parsedTags,
            membersCount: Number(membersCount) || 1,
            isActive: finalIsActive, // <--- Now defaults to TRUE safely
            isDeleted: false
        });

        const message = !finalIsActive && user.role === 'church_admin'
            ? "Artist created in DRAFT mode. Verify your account to publish."
            : "Artist created successfully";

        res.status(201).json({ success: true, message, data: artist });

    } catch (error) {
        console.error("Create Artist Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getArtists = async (req: AuthRequest, res: Response) => {
    try {
        const { search, churchId, isGroup, showDeleted } = req.query;
        let query: any = {};
        const user = req.user;
        const userRole = user ? user.role : 'guest';

        // --- ROLE FILTERS ---
        if (userRole === 'church_admin') {
            query.churchId = user.churchId;
            query.isDeleted = false;
        } else if (userRole === 'super_admin') {
            if (churchId) query.churchId = churchId;
            query.isDeleted = showDeleted === 'true';
        } else {
            // Guests see only ACTIVE and NON-DELETED
            query.isDeleted = false;
            query.isActive = true;
            if (churchId) query.churchId = churchId;
        }

        if (search) query.name = { $regex: search, $options: "i" };
        if (isGroup) query.isGroup = isGroup === 'true';

        const artists = await Artist.find(query)
            .populate("churchId", "name location")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: artists.length, data: artists });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getArtistById = async (req: Request, res: Response) => {
    try {
        const artist = await Artist.findById(req.params.id).populate("churchId");
        if (!artist) return res.status(404).json({ success: false, message: "Artist not found" });
        res.json({ success: true, data: artist });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Update Artist
 * @logic   Block if Church Admin is NOT verified
 */
export const updateArtist = async (req: AuthRequest, res: Response) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) return res.status(404).json({ success: false, message: "Artist not found" });

        const user = req.user;
        const isSuper = user.role === 'super_admin';

        // --- 1. OWNERSHIP CHECK ---
        if (!isSuper && artist.churchId?.toString() !== user.churchId) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // --- 2. VERIFICATION CHECK (NEW) ---
        // If Church Admin is trying to update, they MUST be verified
        if (!isSuper && user.verificationStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: "Your account is pending verification. You cannot edit profiles yet."
            });
        }

        const { name, description, isGroup, tags, isActive, isDeleted, membersCount } = req.body;

        if (name) artist.name = name;
        if (description) artist.description = description;
        if (membersCount) artist.membersCount = Number(membersCount);
        if (isGroup !== undefined) artist.isGroup = isGroup === 'true';

        // Only Super Admin or Verified Admin can change status
        if (isActive !== undefined) artist.isActive = isActive === 'true';

        // Only Super Admin handles hard restore
        if (isDeleted !== undefined && isSuper) artist.isDeleted = isDeleted === 'true';

        if (tags) {
            artist.tags = Array.isArray(tags)
                ? tags
                : tags.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0);
        }

        if (req.file) artist.imageUrl = req.file.path;

        await artist.save();
        res.json({ success: true, data: artist });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Delete Artist
 * @logic   Block if Church Admin is NOT verified
 */
export const deleteArtist = async (req: AuthRequest, res: Response) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) return res.status(404).json({ success: false, message: "Artist not found" });

        const user = req.user;

        // --- VERIFICATION CHECK ---
        if (user.role === 'church_admin' && user.verificationStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: "Your account is pending verification. You cannot delete profiles."
            });
        }

        if (user.role === 'church_admin') {
            if (artist.churchId?.toString() !== user.churchId) {
                return res.status(403).json({ success: false, message: "Not authorized" });
            }
            artist.isDeleted = true;
            artist.isActive = false;
            await artist.save();
            return res.json({ success: true, message: "Artist moved to trash" });
        }

        if (user.role === 'super_admin') {
            await artist.deleteOne();
            return res.json({ success: true, message: "Artist permanently deleted" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};