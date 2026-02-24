export interface Artist {
    _id: string;
    name: string;
    imageUrl: string;
    isGroup: boolean;
    description?: string;
    bio?: string;
    membersCount?: number;
    tags?: string[];
    churchId?: {
        _id: string;
        name: string;
    };
    stats?: {
        albumsCount: number;
        songsCount: number;
    };
}

export interface Album {
    _id: string;
    title: string;
    coverImageUrl: string;
    artistId: Artist; // Populated
    churchId: {
        _id: string;
        name: string;
    };
    genre: string;
    releaseYear: string;
    tags: string[];
    isFeatured: boolean;
    stats?: {
        songsCount: number;
    };
}

export interface Song {
    _id: string;
    churchId: {
        _id: string;
        name: string;
    };
    title: string;
    lyrics: string;
    language: string;
    credits: {
        writer: string;
        composer: string;
        arranger: string;
    };
    originalCredits: string;
    audioUrl: string;
    thumbnailUrl: string;
    artistId: Artist;
    albumId?: Album;
    duration: number;
    genre: string;
    createdAt: string;
    updatedAt: string;
}


export interface AlbumDetail extends Album {
    songs: Song[];
}

export interface IChurch {
    _id: string;
    name: string;
    denomination: string;
    description?: string;
    address: {
        city: string;
        subCity: string;
        coordinates?: { lat: number; lng: number };
    };
    contactPhone: string;
    logoUrl?: string;
    coverImageUrl?: string;
    stats: {
        songsCount: number;
        albumsCount: number;
        singersCount: number;
    };
};

export interface ChurchDetailData extends IChurch {
    teams: Artist[]; // The choirs/artists belonging to this church
}

