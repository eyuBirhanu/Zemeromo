import api from "@/lib/api";

export const dashboardService = {
    // Get all churches (for the dropdown)
    getAllChurches: async () => {
        const response = await api.get("/churches");
        return response.data;
    },

    // Create the admin
    createChurchAdmin: async (userData: any) => {
        const response = await api.post("/auth/register-church-admin", userData);
        return response.data;
    },

    // NEW: Get all users (filtered by role usually, or handle on backend)
    getUsers: async () => {
        const response = await api.get("/users");
        return response.data;
    }
};