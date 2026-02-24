"use client";

import ArtistForm from "@/components/dashboard/forms/ArtistForm";
import { useParams } from "next/navigation";

export default function EditArtistPage() {
    const params = useParams();

    return <ArtistForm artistId={params.id as string} />;
}
