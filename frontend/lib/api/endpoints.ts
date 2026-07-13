export const API = {
    AUTH: {
        REGISTER: "/api/v1/auth/register",
        LOGIN: "/api/v1/auth/login",
        WHOAMI: "/api/v1/auth/whoami",
        UPDATE: "/api/v1/auth/update",
        UPDATE_PASSWORD: "/api/v1/auth/update-password",
    },
    ADMIN: {
        USERS: "/api/v1/admin/users",
        USER: (id: string) => `/api/v1/admin/users/${id}`,
    },
    MEDICATIONS: {
        LIST: "/api/v1/medications",
        TODAY: "/api/v1/medications/today",
        DETAIL: (id: string) => `/api/v1/medications/${id}`,
        TAKEN: (id: string) => `/api/v1/medications/${id}/taken`,
    },
    EXERCISES: {
        LIST: "/api/v1/exercises",
        TODAY: "/api/v1/exercises/today",
        DETAIL: (id: string) => `/api/v1/exercises/${id}`,
        COMPLETE: (id: string) => `/api/v1/exercises/${id}/complete`,
    },
    DIET: {
        RECOMMENDATION: "/api/v1/diet/recommendation",
        ENTRIES: "/api/v1/diet/entries",
        ENTRY: (id: string) => `/api/v1/diet/entries/${id}`,
        ANALYZE_PHOTO: "/api/v1/diet/analyze-photo",
    },
};
