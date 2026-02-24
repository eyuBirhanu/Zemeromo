import { z } from "zod";

// Max file size: 10MB for Audio, 2MB for Image
const MAX_AUDIO_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export const SongSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    artistId: z.string().min(1, "Please select an Artist"),
    albumId: z.string().min(1, "Please select an Album"),
    genre: z.string().min(1, "Genre is required"),
    lyrics: z.string().min(20, "Lyrics should be longer than this"),
    youtubeUrl: z.string().url("Invalid URL").optional().or(z.literal("")),

    // File validation is tricky in React Hook Form, we handle it slightly differently
    // but we can validate the metadata here if needed.
});

export type SongFormValues = z.infer<typeof SongSchema>;

export const ArtistSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    isGroup: z.boolean().default(false), // false = Solo, true = Choir
    socialLinks: z.object({
        facebook: z.string().optional(),
        telegram: z.string().optional(),
        youtube: z.string().optional(),
    }).optional(),
    tags: z.string().optional(), // Comma separated string for input
});

export type ArtistFormValues = z.infer<typeof ArtistSchema>;