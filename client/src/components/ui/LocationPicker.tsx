// client/src/components/ui/LocationPicker.tsx
"use client";

import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./MapPicker"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-64 bg-white/[0.05] animate-pulse flex items-center justify-center text-gray-500 rounded-xl">
            Loading Map...
        </div>
    ),
});

interface LocationPickerProps {
    lat?: number;
    lng?: number;
    onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ lat, lng, onLocationChange }: LocationPickerProps) {
    return (
        <div className="space-y-2 w-full">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-400 ml-1">Church Location</label>
                <div className="text-xs text-gray-500">
                    {lat ? `${lat.toFixed(4)}, ${lng?.toFixed(4)}` : "No location selected"}
                </div>
            </div>

            {/* 3. RENDER THE ACTUAL MAP */}
            <div className="w-full h-64 bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden relative">
                <MapPicker
                    lat={lat || 0}
                    lng={lng || 0}
                    onChange={onLocationChange}
                />

                {/* Overlay Inputs for manual entry */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm p-2 rounded-lg flex gap-2 z-[1000]">
                    <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs text-gray-400">Lat:</span>
                        <input
                            type="number"
                            value={lat || ""}
                            onChange={(e) => onLocationChange(parseFloat(e.target.value), lng || 0)}
                            className="bg-transparent text-white text-xs w-full outline-none"
                        />
                    </div>
                    <div className="w-px bg-white/20"></div>
                    <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs text-gray-400">Lng:</span>
                        <input
                            type="number"
                            value={lng || ""}
                            onChange={(e) => onLocationChange(lat || 0, parseFloat(e.target.value))}
                            className="bg-transparent text-white text-xs w-full outline-none"
                        />
                    </div>
                </div>
            </div>
            <p className="text-xs text-gray-500">Click on the map to pin the church location.</p>
        </div>
    );
}