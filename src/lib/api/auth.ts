import { LoginResponse } from '@/types/auth';

interface LoginRequest {
    email: string;
    password: string;
}

interface ApiError {
    message: string;
    statusCode: number;
}

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data: LoginResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};



export const logout = async (userId : string , deviceId : string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId : userId,
                deviceId : deviceId
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        await response.json();

    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};