"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2, User, Mail, Building } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// Components
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Select from "@/components/ui/Select"; // Your custom select
import PhoneInput from "@/components/ui/PhoneInput";
import ImageUpload from "@/components/ui/ImageUpload"; // Assuming exists
import LocationPicker from "@/components/ui/LocationPicker"; // Assuming exists

// --- SCHEMAS ---

// 1. JOIN Existing Church Schema
const joinSchema = z.object({
    churchName: z.string().min(1, "Please select your church"),
    username: z.string().min(3, "Username required"),
    userPhone: z.string().min(10, "Phone required"),
    email: z.string().email().optional().or(z.literal("")),
    password: z.string().min(6, "Min 6 chars"),
});

// 2. CREATE New Church Schema
const createSchema = z.object({
    // Church
    name: z.string().min(3, "Church name required"),
    denomination: z.string().min(1, "Select denomination"),
    city: z.string().min(2, "City required"),
    subCity: z.string().min(2, "Sub-city required"),
    phone: z.string().min(10, "Church phone required"),
    description: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    // Admin
    username: z.string().min(3, "Admin name required"),
    userPhone: z.string().min(10, "Admin phone required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Min 6 chars"),
});

type JoinFormValues = z.infer<typeof joinSchema>;
type CreateFormValues = z.infer<typeof createSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [activeTab, setActiveTab] = useState<"join" | "create">("join");
    const [isLoading, setIsLoading] = useState(false);

    // Data for Dropdown
    const [churches, setChurches] = useState<{ value: string, label: string }[]>([]);
    const [logoFile, setLogoFile] = useState<File | null>(null);


    // --- FETCH CHURCHES ---
    useEffect(() => {
        const fetchChurches = async () => {
            try {
                // Fetch only verified churches for the "Join" dropdown
                const res = await api.get("/churches?status=verified");
                const options = res.data.data.map((c: any) => ({
                    value: c._id,
                    label: c.name,
                    subLabel: `${c.address.city}, ${c.address.subCity}`
                }));
                setChurches(options);
            } catch (err) {
                console.error("Failed to load churches");
            }
        };
        fetchChurches();
    }, []);

    // --- FORMS ---
    const joinForm = useForm<JoinFormValues>({ resolver: zodResolver(joinSchema) });
    const createForm = useForm<CreateFormValues>({
        resolver: zodResolver(createSchema),
        defaultValues: { city: "Hossana" }
    });

    // --- SUBMIT HANDLERS ---

    const onJoinSubmit = async (data: JoinFormValues) => {
        setIsLoading(true);
        try {
            // Call the new public route!
            await api.post("/auth/apply-admin", {
                churchId: data.churchName,
                username: data.username,
                phoneNumber: data.userPhone,
                email: data.email,
                password: data.password
            });

            toast.success("Request Sent!", { description: "Admin will verify your account." });
            router.push("/auth/login");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Join failed");
        } finally {
            setIsLoading(false);
        }
    };

    const onCreateSubmit = async (data: CreateFormValues) => {
        setIsLoading(true);
        try {
            // Because we have an image (Logo), we MUST use FormData, not JSON!
            const formData = new FormData();

            // Append Church Data
            formData.append("churchName", data.name);
            formData.append("denomination", data.denomination);
            formData.append("city", data.city);
            formData.append("subCity", data.subCity);
            formData.append("contactPhone", data.phone);
            if (data.description) formData.append("description", data.description);
            if (data.lat) formData.append("lat", data.lat.toString());
            if (data.lng) formData.append("lng", data.lng.toString());

            // Append Admin Data
            formData.append("username", data.username);
            formData.append("userPhone", data.userPhone);
            if (data.email) formData.append("email", data.email);
            formData.append("password", data.password);

            // Append Logo File
            if (logoFile) {
                formData.append("logo", logoFile);
            }

            const res = await api.post("/auth/register-church", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const { token, user } = res.data;
            login(token, user);

            toast.success("Church Registered!", { description: "Account is pending verification." });
            router.push("/dashboard");

        } catch (err: any) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title={activeTab === "join" ? "Join Ministry" : "Register Ministry"}
            subtitle={activeTab === "join"
                ? "Become an admin for an existing church."
                : "Plant your church's digital presence."}
        >

            {/* --- TABS --- */}
            <div className="grid grid-cols-2 p-1 bg-white/5 rounded-xl mb-8 border border-white/10">
                <button
                    onClick={() => setActiveTab("join")}
                    className={`text-sm font-bold py-2.5 rounded-lg transition-all ${activeTab === "join" ? "bg-accent text-dark-bg shadow-lg" : "text-gray-400 hover:text-white"}`}
                >
                    Join Existing
                </button>
                <button
                    onClick={() => setActiveTab("create")}
                    className={`text-sm font-bold py-2.5 rounded-lg transition-all ${activeTab === "create" ? "bg-accent text-dark-bg shadow-lg" : "text-gray-400 hover:text-white"}`}
                >
                    Register New
                </button>
            </div>

            {/* --- JOIN FORM --- */}
            {activeTab === "join" && (
                <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">

                    <Controller
                        control={joinForm.control}
                        name="churchName"
                        render={({ field }) => (
                            <Select
                                label="Select Church"
                                placeholder="Search for your church..."
                                options={churches}
                                value={field.value}
                                onChange={field.onChange}
                                error={joinForm.formState.errors.churchName?.message}
                            />
                        )}
                    />

                    <div className="text-center text-xs text-gray-500 -mt-2">
                        Can't find your church? <button type="button" onClick={() => setActiveTab("create")} className="text-accent hover:underline">Register it now</button>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <Input
                            label="Your Name" icon={<User size={18} />}
                            {...joinForm.register("username")} error={joinForm.formState.errors.username?.message}
                        />
                        <Controller
                            control={joinForm.control}
                            name="userPhone"
                            render={({ field }) => (
                                <PhoneInput label="Phone Number" value={field.value} onChange={field.onChange} error={joinForm.formState.errors.userPhone?.message} />
                            )}
                        />
                        <Input
                            label="Email (Optional)" icon={<Mail size={18} />}
                            {...joinForm.register("email")} error={joinForm.formState.errors.email?.message}
                        />
                        <PasswordInput
                            label="Password"
                            {...joinForm.register("password")} error={joinForm.formState.errors.password?.message}
                        />
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full btn-primary py-3.5 rounded-xl font-bold bg-white text-black hover:bg-gray-200 transition flex justify-center items-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin" /> : <>Request Access <ArrowRight size={18} /></>}
                    </button>
                </form>
            )}

            {/* --- CREATE FORM --- */}
            {activeTab === "create" && (
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">

                    {/* Church Details */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/10 pb-2">1. Church Details</h4>

                        {/* Logo Upload */}
                        <div className="mb-4">
                            <label className="text-xs font-medium text-gray-400 ml-1 mb-2 block">Church Logo</label>
                            <ImageUpload
                                label="Upload Logo"
                                onChange={setLogoFile}
                                previewUrl={undefined} // Pass existing if edit mode
                            />
                        </div>

                        <Input label="Church Name" icon={<Building size={18} />} {...createForm.register("name")} error={createForm.formState.errors.name?.message} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                control={createForm.control}
                                name="denomination"
                                render={({ field }) => (
                                    <Select
                                        label="Denomination"
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={[
                                            { label: "Mulu Wangel", value: "Mulu Wangel" },
                                            { label: "Kale Heywet", value: "Kale Heywet" },
                                            { label: "Mekane Yesus", value: "Mekane Yesus" },
                                            { label: "Meserete Kristos", value: "Meserete Kristos" },
                                            { label: "Assembly of God", value: "Assembly of God" },
                                            { label: "Other", value: "Other" },
                                        ]}
                                        error={createForm.formState.errors.denomination?.message}
                                    />
                                )}
                            />
                            <Controller
                                control={createForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <PhoneInput label="Church Contact" value={field.value} onChange={field.onChange} error={createForm.formState.errors.phone?.message} />
                                )}
                            />
                        </div>

                        {/* Location Section */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="City" {...createForm.register("city")} error={createForm.formState.errors.city?.message} />
                                <Input label="Sub-City" {...createForm.register("subCity")} error={createForm.formState.errors.subCity?.message} />
                            </div>

                            {/* Map Picker Integration */}
                            <label className="text-xs font-medium text-gray-400 ml-1 block mt-2">Pin Location on Map</label>
                            <div className="h-48 rounded-xl overflow-hidden border border-white/10">
                                <LocationPicker
                                    lat={createForm.watch('lat') || 9.0}
                                    lng={createForm.watch('lng') || 38.7}
                                    onLocationChange={(lat, lng) => {
                                        createForm.setValue("lat", lat);
                                        createForm.setValue("lng", lng);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Admin Details */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/10 pb-2">2. Head Admin</h4>
                        <Input label="Full Name" icon={<User size={18} />} {...createForm.register("username")} error={createForm.formState.errors.username?.message} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                control={createForm.control}
                                name="userPhone"
                                render={({ field }) => (
                                    <PhoneInput label="Personal Phone" value={field.value} onChange={field.onChange} error={createForm.formState.errors.userPhone?.message} />
                                )}
                            />
                            <Input label="Email" icon={<Mail size={18} />} {...createForm.register("email")} error={createForm.formState.errors.email?.message} />
                        </div>
                        <PasswordInput label="Create Password" {...createForm.register("password")} error={createForm.formState.errors.password?.message} />
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full btn-primary py-4 rounded-xl font-bold bg-accent text-dark-bg hover:bg-accent-hover transition flex justify-center items-center gap-2 shadow-glow">
                        {isLoading ? <Loader2 className="animate-spin" /> : <>Complete Registration <ArrowRight size={18} /></>}
                    </button>
                </form>
            )}

            <div className="pt-8 border-t border-white/5 text-center lg:text-left">
                <p className="text-sm text-gray-500">
                    Already have an account? <Link href="/auth/login" className="text-white font-semibold hover:text-accent">Login Here</Link>
                </p>
            </div>
        </AuthLayout>
    );
}