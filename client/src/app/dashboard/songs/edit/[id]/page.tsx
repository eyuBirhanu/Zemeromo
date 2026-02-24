"use client"
import SongForm from "@/components/dashboard/forms/SongForm";
import { useParams } from "next/navigation";

export default function EditSongPage() {
    const params = useParams();

    return (
        <SongForm songId={params.id as string} />
    );
}