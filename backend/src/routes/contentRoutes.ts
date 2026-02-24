// import express from "express";
// import { protect, authorize } from "../middleware/auth";
// import { createAlbum, getAlbums, updateAlbum, deleteAlbum } from "../controllers/albumController";
// import { createArtist, getArtistById, getArtists, updateArtist } from "../controllers/artistController";
// import multer from "multer";
// import { uploadImage, uploadAudio } from "../middleware/upload";
// import {
//     createSong,
//     getSongs,
//     updateSong,
//     searchContent, logPlay
// } from "../controllers/songController";
// const router = express.Router();

// const uploadAudio = multer({ storage: audioStorage });


// // --- SONG ROUTES ---

// // Public Feed & Search
// router.get("/songs", getSongs);
// router.get("/search", searchContent);

// // Analytics
// router.post("/songs/:id/play", logPlay);

// // Create (Requires: Audio "audio", Image "thumbnail")
// router.post(
//     "/songs",
//     protect,
//     authorize("church_admin", "super_admin"),
//     uploadAudio.fields([
//         { name: "audio", maxCount: 1 },
//         { name: "thumbnail", maxCount: 1 }
//     ]),
//     createSong
// );

// // Edit
// router.put(
//     "/songs/:id",
//     protect,
//     authorize("church_admin", "super_admin"),
//     uploadAudio.fields([
//         { name: "audio", maxCount: 1 },
//         { name: "thumbnail", maxCount: 1 }
//     ]),
//     updateSong
// );



// // Album Routes
// router.route("/albums")
//     .get(getAlbums) // Public (can add middleware to check if Admin wants to see Drafts)
//     .post(protect, authorize("church_admin", "super_admin"), uploadImage.single("coverImage"), createAlbum);

// router.route("/albums/:id")
//     .put(protect, authorize("church_admin", "super_admin"), uploadImage.single("coverImage"), updateAlbum)
//     .delete(protect, authorize("church_admin", "super_admin"), deleteAlbum);


// router.route("/artists")
//     .get(getArtists) // Public
//     .post(protect, authorize("church_admin", "super_admin"), uploadImage.single("image"), createArtist);

// router.route("/artists/:id")
//     .get(getArtistById)
//     .put(protect, authorize("church_admin", "super_admin"), uploadImage.single("image"), updateArtist);

// export default router;