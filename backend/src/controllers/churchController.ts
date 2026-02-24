import { Request, Response } from "express";
import Church from "../models/Church";
import User from "../models/User";
import Song from "../models/Song";
import Album from "../models/Album";
import Artist from "../models/Artist";

interface AuthRequest extends Request {
    user?: any;
    file?: any;
}

/**
 * @desc    Register/Create a Church
 * @access  Private (User can request, Super Admin can auto-verify)
 */
export const createChurch = async (req: AuthRequest, res: Response) => {
    try {
        const { name, denomination, city, subCity, contactPhone, description } = req.body;

        const exists = await Church.findOne({ name });
        if (exists) {
            return res.status(400).json({ success: false, message: "Church already registered" });
        }

        const isSuperAdmin = req.user.role === 'super_admin';
        const status = isSuperAdmin ? 'verified' : 'pending';

        const logoUrl = req.file ? req.file.path : "";

        const church = await Church.create({
            name,
            denomination,
            address: {
                city: city || "Hossana",
                subCity,
            },
            contactPhone,
            description,
            logoUrl,
            status,
            adminUserId: isSuperAdmin ? null : req.user.id
        });

        if (!isSuperAdmin) {
            await User.findByIdAndUpdate(req.user.id, {
                churchId: church._id,
                role: 'church_admin',
                verificationStatus: 'pending'
            });
        }

        res.status(201).json({
            success: true,
            message: isSuperAdmin ? "Church created and verified." : "Church application submitted for approval.",
            data: church
        });

    } catch (error: any) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const getChurches = async (req: AuthRequest, res: Response) => {
    try {
        const { status, search } = req.query;
        let query: any = {};

        const userRole = req.user ? req.user.role : 'guest';

        // Security: Public users ONLY see verified churches
        if (userRole !== 'super_admin') {
            query.status = 'verified';
        } else if (status) {
            // Super admin can filter by status (pending, verified)
            query.status = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { "address.city": { $regex: search, $options: "i" } }
            ];
        }

        const churches = await Church.find(query)
            .populate("adminUserId", "username email phoneNumber")
            .sort({ createdAt: -1 });

        const data = await Promise.all(churches.map(async (church) => {
            const [songs, albums, singers] = await Promise.all([
                Song.countDocuments({ churchId: church._id, isDeleted: false }),
                Album.countDocuments({ churchId: church._id, isDeleted: false }),
                Artist.countDocuments({ churchId: church._id, isDeleted: false })
            ]);

            return {
                ...church.toObject(),
                stats: { songs, albums, singers }
            };
        }));

        res.json({ success: true, count: data.length, data });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getChurchById = async (req: Request, res: Response) => {
    try {
        const church = await Church.findById(req.params.id);
        if (!church) return res.status(404).json({ success: false, message: "Church not found" });
        res.json({ success: true, data: church });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateChurch = async (req: AuthRequest, res: Response) => {
    try {
        const church = await Church.findById(req.params.id);
        if (!church) return res.status(404).json({ success: false, message: "Church not found" });

        if (req.user.role !== 'super_admin') {
            if (req.user.churchId?.toString() !== church._id.toString()) {
                return res.status(403).json({ success: false, message: "Not authorized" });
            }
        }

        const updates: any = {};
        const { name, denomination, contactPhone, description, status, adminUserId, city, subCity, lat, lng } = req.body;

        if (name) updates.name = name;
        if (denomination) updates.denomination = denomination;
        if (contactPhone) updates.contactPhone = contactPhone;
        if (description !== undefined) updates.description = description;

        if (city || subCity || lat !== undefined || lng !== undefined) {
            updates.address = {
                city: city || church.address.city,
                subCity: subCity || church.address.subCity,
                coordinates: {
                    lat: lat !== undefined ? Number(lat) : church.address.coordinates?.lat,
                    lng: lng !== undefined ? Number(lng) : church.address.coordinates?.lng
                }
            };
        }

        if (req.user.role === 'super_admin') {
            if (status) updates.status = status;
            if (adminUserId) updates.adminUserId = adminUserId;
        }

        if (req.file) {
            updates.logoUrl = req.file.path;
        }

        const updatedChurch = await Church.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: updatedChurch });

    } catch (error: any) {
        console.error("Update Church Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const deleteChurch = async (req: Request, res: Response) => {
    try {
        const church = await Church.findByIdAndDelete(req.params.id);
        if (!church) return res.status(404).json({ success: false, message: "Church not found" });
        res.json({ success: true, message: "Church deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const verifyChurch = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const churchId = req.params.id;

        const church = await Church.findByIdAndUpdate(churchId, { status }, { new: true });
        if (!church) return res.status(404).json({ message: "Church not found" });

        if (church.adminUserId) {
            await User.findByIdAndUpdate(church.adminUserId, { verificationStatus: status });
        }

        res.json({ success: true, message: `Church and Admin ${status}`, data: church });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};