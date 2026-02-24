"use client";
import { useParams } from "next/navigation";
import AlbumForm from "@/components/dashboard/forms/AlbumForm";

export default function EditAlbumPage() {
    const params = useParams();
    return <AlbumForm albumId={params.id as string} />;
}