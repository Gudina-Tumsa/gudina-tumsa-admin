
export interface LoginResponse {
    data: {
        user: UserResponse;
        session: {
            token: string;
            refreshToken: string;
            deviceId: string;
            createdAt: Date;
            expiresAt: Date;
        };
    };
}

export interface UserResponse {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    phone?: string;
    role: string;
    languagePreference?: string;
    readingPreferences?: string[];
    isActive: boolean;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}