"use client";

import { useParams } from "next/navigation";
import ChurchForm from "@/components/dashboard/forms/ChurchForm";

export default function EditChurchPage() {
    const params = useParams();
    return <ChurchForm churchId={params.id as string} />;
}