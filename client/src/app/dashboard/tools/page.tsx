"use client";

import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/useUpload";
import { toast } from "sonner";
import {
    Copy, Upload, Database, FileAudio, CheckCircle,
    FileJson, Trash2, RefreshCw, Terminal, Download
} from "lucide-react";
import api from "@/lib/api";
import AccessDenied from "@/components/dashboard/AccessDenied";
import { useAuth } from "@/context/AuthContext";


export default function ToolsPage() {
    // --- MEDIA UPLOADER STATE ---
    const { progress, isUploading, uploadFiles } = useUpload();
    const [uploadedItems, setUploadedItems] = useState<any[]>([]);

    const { user } = useAuth();

    // --- JSON IMPORT STATE ---
    const [jsonInput, setJsonInput] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [importStats, setImportStats] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- 1. PERSISTENCE (Restore data on page load) ---
    useEffect(() => {
        const savedItems = localStorage.getItem("zemeromo_uploads");
        if (savedItems) {
            setUploadedItems(JSON.parse(savedItems));
        }
    }, []);

    // --- 2. HANDLERS ---

    // Handle Media Upload
    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        try {
            const files = Array.from(e.target.files);
            const res = await uploadFiles("/bulk/media", files);

            // Append new items to existing list instead of replacing
            const newItems = [...uploadedItems, ...res.data];
            setUploadedItems(newItems);

            // Save to local storage
            localStorage.setItem("zemeromo_uploads", JSON.stringify(newItems));
            toast.success(`${files.length} files uploaded!`);
        } catch (err) {
            toast.error("Upload failed");
        }
    };

    // Handle JSON File Import (Read file content into textarea)
    const handleJsonFileRead = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setJsonInput(event.target.result as string);
                toast.success("JSON loaded from file");
            }
        };
        reader.readAsText(file);
    };

    // Handle Bulk Import to Backend
    const handleImport = async () => {
        try {
            setIsImporting(true);
            const parsed = JSON.parse(jsonInput);
            const res = await api.post("/bulk/import", parsed);
            setImportStats(res.data.stats);
            toast.success("Bulk Import Complete!");
        } catch (err: any) {
            toast.error("Import Failed", { description: err.message || "Invalid JSON syntax" });
        } finally {
            setIsImporting(false);
        }
    };

    // Helper: Copy Text
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    // Helper: Clear History
    const clearHistory = () => {
        if (confirm("Clear upload history?")) {
            setUploadedItems([]);
            localStorage.removeItem("zemeromo_uploads");
        }
    };

    if (user?.role !== "super_admin") {
        return <AccessDenied />
    }

    // The Placeholder / Guide JSON
    const JSON_TEMPLATE = `[
  {
    "name": "Hossana Mekane Yesus",       
    "city": "Hossana",
    "artists": [
      {
        "name": "Choir A",    
        "isGroup": true,      
        "albums": [
          {
            "title": "Album Title", 
            "coverImageUrl": "Paste Link from Converter",
            "songs": [
              {
                "title": "Song Title", 
                "audioUrl": "Paste Link from Converter",
                "lyrics": "Paste lyrics here...", 
                "fileSize": 1024000
              }
            ]
          }
        ]
      }
    ]
  }
]`;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-white">Developer Tools</h1>
                    <p className="text-gray-400 text-sm mt-1">Bulk Operations & Asset Management</p>
                </div>
            </div>

            {/* --- TOOL 1: MEDIA CONVERTER --- */}
            <section className="bg-[#1a1f2b] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-accent flex items-center gap-2">
                        <Upload size={20} /> 1. Asset Converter
                    </h2>
                    {uploadedItems.length > 0 && (
                        <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                            <Trash2 size={14} /> Clear History
                        </button>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Upload Area */}
                    <div className="md:col-span-1 border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-accent/50 transition-colors bg-black/20 flex flex-col items-center justify-center min-h-[200px]">
                        <input
                            type="file"
                            multiple
                            onChange={handleMediaUpload}
                            className="hidden"
                            id="bulk-upload"
                            accept="audio/*,image/*"
                        />
                        <label htmlFor="bulk-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                            {isUploading ? (
                                <div className="w-full max-w-[150px]">
                                    <LoaderWithProgress progress={progress} />
                                </div>
                            ) : (
                                <>
                                    <FileAudio size={40} className="text-gray-500 mb-3" />
                                    <span className="text-white font-bold block">Select Files</span>
                                    <span className="text-xs text-gray-500 mt-2">MP3, JPG, PNG supported</span>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Results Area */}
                    <div className="md:col-span-2 bg-black/40 rounded-xl border border-white/5 flex flex-col h-[250px]">
                        <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <span className="text-xs font-mono text-gray-400">UPLOADED ASSETS ({uploadedItems.length})</span>
                            <span className="text-[10px] text-green-500">Auto-saved to browser</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {uploadedItems.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">
                                    No assets uploaded yet...
                                </div>
                            ) : (
                                uploadedItems.slice().reverse().map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-white/[0.02] hover:bg-white/[0.05] rounded border border-white/5 group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${item.type === 'audio' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                {item.type}
                                            </span>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-xs text-gray-300 truncate w-[300px]">{item.originalName}</span>
                                                <span className="text-[10px] text-gray-600 font-mono">{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => copyToClipboard(item.url)}
                                                className="p-1.5 bg-accent/10 text-accent hover:bg-accent hover:text-dark-bg rounded transition-colors text-xs font-bold"
                                            >
                                                Copy Link
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TOOL 2: JSON IMPORTER --- */}
            <section className="bg-[#1a1f2b] border border-white/10 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
                    <Database size={20} /> 2. JSON Bulk Seeder
                </h2>

                <div className="grid lg:grid-cols-2 gap-6 h-[600px]">

                    {/* LEFT: IDE Editor */}
                    <div className="flex flex-col h-full bg-[#0d1117] rounded-xl border border-white/20 overflow-hidden relative">
                        {/* Editor Toolbar */}
                        <div className="bg-[#161b22] p-2 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal size={14} className="text-gray-400" />
                                <span className="text-xs text-gray-400 font-mono">schema.json</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleJsonFileRead}
                                    accept=".json"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs flex items-center gap-1 text-gray-400 hover:text-white px-2 py-1 bg-white/5 rounded"
                                >
                                    <FileJson size={12} /> Load File
                                </button>
                                <button
                                    onClick={() => setJsonInput("")}
                                    className="text-xs flex items-center gap-1 text-gray-400 hover:text-red-400 px-2 py-1 bg-white/5 rounded"
                                >
                                    <RefreshCw size={12} /> Clear
                                </button>
                            </div>
                        </div>

                        {/* Text Area */}
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="flex-1 w-full bg-transparent p-4 font-mono text-sm text-[#c9d1d9] focus:outline-none resize-none leading-relaxed"
                            placeholder="// Paste your JSON structure here..."
                            spellCheck={false}
                        />

                        {/* Action Bar */}
                        <div className="p-4 border-t border-white/10 bg-[#161b22]">
                            <button
                                onClick={handleImport}
                                disabled={isImporting || !jsonInput}
                                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isImporting ? <RefreshCw className="animate-spin" size={18} /> : <Database size={18} />}
                                {isImporting ? "Processing Data..." : "Execute Bulk Import"}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Guide & Stats */}
                    <div className="flex flex-col gap-4 h-full overflow-y-auto">

                        {/* Reference Card */}
                        <div className="bg-[#0d1117] rounded-xl border border-white/10 overflow-hidden flex-1 flex flex-col">
                            <div className="bg-[#161b22] p-2 border-b border-white/10 flex justify-between items-center">
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider px-2">Reference Schema</span>
                                <button
                                    onClick={() => copyToClipboard(JSON_TEMPLATE)}
                                    className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors"
                                >
                                    COPY TEMPLATE
                                </button>
                            </div>
                            <pre className="p-4 text-xs font-mono text-gray-400 overflow-auto flex-1 custom-scrollbar">
                                <code className="language-json">{JSON_TEMPLATE}</code>
                            </pre>
                        </div>

                        {/* Stats Card (Appears after import) */}
                        {importStats && (
                            <div className="bg-green-900/20 border border-green-500/30 p-5 rounded-xl animate-in slide-in-from-right fade-in">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-500/20 rounded-full text-green-400">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Import Successful</h3>
                                        <p className="text-xs text-green-400">Database has been updated.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    <StatBox label="Churches" value={importStats.churches} />
                                    <StatBox label="Artists" value={importStats.artists} />
                                    <StatBox label="Albums" value={importStats.albums} />
                                    <StatBox label="Songs" value={importStats.songs} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

// Simple Helper Components
const StatBox = ({ label, value }: { label: string, value: number }) => (
    <div className="bg-black/40 p-2 rounded-lg border border-white/5">
        <div className="text-lg font-bold text-white">{value}</div>
        <div className="text-[10px] text-gray-500 uppercase">{label}</div>
    </div>
);

const LoaderWithProgress = ({ progress }: { progress: number }) => (
    <div className="w-full text-center">
        <p className="text-accent text-xs mb-2 font-mono">UPLOADING... {progress}%</p>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden w-full">
            <div
                className="h-full bg-accent transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    </div>
);