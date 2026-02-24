export const CATEGORIES = ["All", "Worship", "Orthodox", "Praise", "Choir", "Instrumental"];

export const FEATURED_ALBUM = {
    id: "f1",
    title: "Zemare Meles",
    artist: "Yosef Kassa",
    description: "New Album • 2025",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop",
};

// export const ARTISTS = [
//     { id: "a1", name: "Bethelhem", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop" },
//     { id: "a2", name: "Yosef", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop" },
//     { id: "a3", name: "Hossana C", image: "https://images.unsplash.com/photo-1525926477800-7a3be5800fcb?q=80&w=1932&auto=format&fit=crop" },
//     { id: "a4", name: "Caleb", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
//     { id: "a5", name: "Fenan", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop" },
// ];

export const RECENT_SONGS = [
    {
        _id: '1',
        title: 'Yemewoded',
        artistId: { name: 'Hossana Choir' },
        thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        genre: 'Worship'
    },
    {
        _id: '2',
        title: 'Amazing Grace',
        artistId: { name: 'Bethelhem Tezera' },
        thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        genre: 'Hymn'
    },
    {
        _id: '3',
        title: 'Selam Leiki',
        artistId: { name: 'Yosef Kassa' },
        thumbnailUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2070&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        genre: 'Orthodox'
    },
    {
        _id: '4',
        title: 'Kiber Yigbaw',
        artistId: { name: 'Fenan Befkadu' },
        thumbnailUrl: 'https://images.unsplash.com/photo-1459749411177-04fb2a922855?q=80&w=2070&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        genre: 'Praise'
    }
];


// src/data/mockData.ts

export const CHURCHES = [
    { id: 'c1', name: 'Hossana Mulu Wangel', location: 'Sefer A', image: 'https://images.unsplash.com/photo-1548625361-e88c60eb83fe?w=800' },
    { id: 'c2', name: 'Hossana Kale Heywet', location: 'Sefer B', image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800' },
];

export const ARTISTS = [
    { id: 'a1', name: 'Yosef Kassa', churchId: 'c1', type: 'Singer', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800' },
    { id: 'a2', name: 'C Choir', churchId: 'c1', type: 'Choir', image: 'https://images.unsplash.com/photo-1525926477800-7a3be5800fcb?w=800' },
];

export const ALBUMS = [
    { id: 'al1', title: 'Zemare Meles', artistId: 'a1', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800', year: '2024' },
    { id: 'al2', title: 'Volume 4', artistId: 'a2', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', year: '2023' },
];

export const SONGS = [
    {
        _id: 's1',
        title: 'Yemewoded',
        albumId: 'al1',
        artistId: { name: 'Yosef Kassa' }, // Simplified for mock
        thumbnailUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        lyrics: "Yemewoded ken\nZare new le ene\n(Full lyrics would go here...)\n\nLine 2...\nLine 3...",
        genre: 'Worship'
    },
    {
        _id: 's2',
        title: 'Kiber Yigbaw',
        albumId: 'al1',
        artistId: { name: 'Yosef Kassa' },
        thumbnailUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        lyrics: "Kiber Yigbaw\nLe Amlakachin\n(Lyrics...)",
        genre: 'Praise'
    },
    {
        _id: 's3',
        title: 'Hossana',
        albumId: 'al2',
        artistId: { name: 'C Choir' },
        thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        lyrics: "Hossana bearyam\n(Lyrics...)",
        genre: 'Choir'
    }
];