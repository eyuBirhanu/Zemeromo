import api from "@/lib/api";
import { z } from "zod";

// 1. Define the Validation Schema (Zod)
export const loginSchema = z.object({
    phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// Extract the Type from Zod
export type LoginFormData = z.infer<typeof loginSchema>;

// 2. The API Call Logic
export const AuthService = {
    login: async (data: LoginFormData) => {
        // This throws an error if the status is 401/400/500
        const response = await api.post("/auth/login", data);
        return response.data;
    },
};