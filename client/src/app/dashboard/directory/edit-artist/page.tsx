"use client";
import { useParams } from "next/navigation";
import ArtistForm from "@/components/dashboard/forms/ArtistForm";

export default function EditArtistPage() {
    const params = useParams();
    return <ArtistForm artistId={params.id as string} />;
}