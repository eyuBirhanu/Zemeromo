import { Request, Response } from "express";
import User from "../models/User";
import Song from "../models/Song"; // Assuming you have this
import Album from "../models/Album"; // Assuming you have this
import Artist from "../models/Artist";

/**
 * @desc    Get All Church Admins (Filtered)
 * @route   GET /api/users/admins
 */
export const getChurchAdmins = async (req: Request, res: Response) => {
    try {
        // 1. Fetch Church Admins
        const admins = await User.find({ role: "church_admin" })
            .populate("churchId", "name location")
            .select("-passwordHash")
            .sort({ createdAt: -1 });

        // 2. Attach Stats (Songs, Albums, Artists Count)
        const adminsWithStats = await Promise.all(admins.map(async (admin: any) => {
            const churchId = admin.churchId?._id;

            // If they aren't assigned to a church, stats are 0
            if (!churchId) return { ...admin.toObject(), stats: { songs: 0, albums: 0, singers: 0 } };

            // Run counts in parallel for speed
            const [songCount, albumCount, artistCount] = await Promise.all([
                Song.countDocuments({ churchId }),
                Album.countDocuments({ churchId }),
                Artist.countDocuments({ churchId })
            ]);

            return {
                ...admin.toObject(),
                stats: {
                    songs: songCount,
                    albums: albumCount,
                    singers: artistCount
                }
            };
        }));

        res.json({ success: true, data: adminsWithStats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
/**
 * @desc    Toggle Admin Status (Active/Inactive)
 * @route   PATCH /api/users/:id/status
 */
export const toggleUserStatus = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Toggle
        user.isActive = !user.isActive;
        await user.save();

        res.json({ success: true, message: `User is now ${user.isActive ? 'Active' : 'Inactive'}`, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Delete Admin (Safe Delete)
 * @route   DELETE /api/users/:id
 */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        // DECISION: Deleting an Admin should NOT delete the songs. 
        // Songs belong to the Church, not the specific person.
        // We just remove the access.

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "Admin removed successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Get Admin Stats (For Details Page)
 * @route   GET /api/users/:id/stats
 */
export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).populate("churchId");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Count songs/albums uploaded by this user's church
        // Assuming Songs have a 'churchId' or 'uploadedBy' field
        const songCount = await Song.countDocuments({ churchId: user.churchId });
        const albumCount = await Album.countDocuments({ churchId: user.churchId });

        res.json({
            success: true,
            data: {
                user,
                stats: {
                    songs: songCount,
                    albums: albumCount,
                    // Add 'singers' count if you have a Singer model
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};