import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db";
import Church from "../models/Church";
import Artist from "../models/Artist";
import Album from "../models/Album";
import Song from "../models/Song";

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();
        console.log("🌱 Starting Professional Seed...");

        // 1. CLEAR OLD DATA (Drop Collections)
        try { await Song.collection.drop(); } catch (e) { }
        try { await Album.collection.drop(); } catch (e) { }
        try { await Artist.collection.drop(); } catch (e) { }
        try { await Church.collection.drop(); } catch (e) { }
        console.log("🧹 Database Cleared.");

        // ---------------------------------------------------------
        // 1. CHURCHES
        // ---------------------------------------------------------
        const church1 = await Church.create({
            name: "Hossana Mulu Wangel",
            denomination: "Mulu Wangel",
            address: { city: "Hossana", subCity: "Sefer A" },
            contactPhone: "+251911000001",
            status: "verified",
            logoUrl: "https://images.unsplash.com/photo-1548625361-98770775df5d?q=80&w=1000"
        });

        const church2 = await Church.create({
            name: "Addis Ababa Mekane Yesus",
            denomination: "Mekane Yesus",
            address: { city: "Addis Ababa", subCity: "Amist Kilo" },
            contactPhone: "+251911000002",
            status: "verified",
            logoUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1000"
        });

        // ---------------------------------------------------------
        // 2. ARTISTS
        // ---------------------------------------------------------
        const artist1 = await Artist.create({
            name: "C Choir (Hossana)",
            churchId: church1._id,
            isGroup: true,
            imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000",
            tags: ["Worship", "Live", "Choir"]
        });

        const artist2 = await Artist.create({
            name: "Dawit Getachew",
            churchId: church2._id,
            isGroup: false,
            imageUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000",
            tags: ["Solo", "Studio"]
        });

        // ---------------------------------------------------------
        // 3. ALBUMS (Featured & Regular)
        // ---------------------------------------------------------
        const album1 = await Album.create({
            title: "Yemaynewot (Live)",
            artistId: artist1._id,
            churchId: church1._id,
            coverImageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000",
            releaseYear: "2016",
            genre: "Worship",
            isPublished: true,
            isFeatured: true, // <--- Featured Album
            price: 0
        });

        const album2 = await Album.create({
            title: "Kiber Yihun",
            artistId: artist2._id,
            churchId: church2._id,
            coverImageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000",
            releaseYear: "2015",
            genre: "Praise",
            isPublished: true,
            isFeatured: false, // Not Featured
            price: 150
        });

        // ---------------------------------------------------------
        // 4. SONGS (With Featured Logic)
        // ---------------------------------------------------------
        const songsData = [
            // Featured Songs
            { title: "Yemaynewot", duration: 340, album: album1, artist: artist1, church: church1, isFeatured: true },
            { title: "Kiber Yihun", duration: 310, album: album2, artist: artist2, church: church2, isFeatured: true },

            // Standard Songs
            { title: "Amlake", duration: 280, album: album1, artist: artist1, church: church1, isFeatured: false },
            { title: "Yesus", duration: 240, album: album2, artist: artist2, church: church2, isFeatured: false },
            { title: "Abet Fikreh", duration: 400, album: album1, artist: artist1, church: church1, isFeatured: false },
        ];

        for (const s of songsData) {
            await Song.create({
                title: s.title,
                lyrics: "Lyrics placeholder...",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                thumbnailUrl: s.album.coverImageUrl,
                duration: s.duration,
                albumId: s.album._id,
                churchId: s.church._id,
                artistId: s.artist._id,
                language: "Amharic",
                genre: s.album.genre,
                status: "active",
                isDeleted: false,
                isFeatured: s.isFeatured, // <--- CRITICAL: Setting this to true for some
                stats: { plays: Math.floor(Math.random() * 500) }
            });
        }

        console.log("✅ SEED COMPLETE!");
        console.log("   - 2 Churches");
        console.log("   - 2 Artists");
        console.log("   - 2 Albums (1 Featured)");
        console.log("   - 5 Songs (2 Featured)");

        process.exit();

    } catch (error) {
        console.error("❌ Data Seeding Failed:", error);
        process.exit(1);
    }
};

seedData();