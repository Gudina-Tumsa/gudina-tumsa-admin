// features/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserResponse, LoginResponse } from '@/types/auth';

interface UserState {
    user: UserResponse | null;
    session: {
        token: string | null;
        refreshToken: string | null;
        deviceId: string | null;
        expiresAt: Date | null;
    } | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: UserState = {
    user: null,
    session: null,
    status: 'idle',
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<LoginResponse>) => {

            state.status = 'succeeded';
            state.user = action.payload.data.user;
            state.session = {
                token: action.payload.data.session.token,
                refreshToken: action.payload.data.session.refreshToken,
                deviceId: action.payload.data.session.deviceId,
                expiresAt: action.payload.data.session.expiresAt,
            };
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.status = 'failed';
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.session = null;
            state.status = 'idle';
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<Partial<UserResponse>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        refreshToken: (state, action: PayloadAction<{ token: string; refreshToken: string; expiresAt: Date }>) => {
            if (state.session) {
                state.session.token = action.payload.token;
                state.session.refreshToken = action.payload.refreshToken;
                state.session.expiresAt = action.payload.expiresAt;
            }
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    updateUser,
    refreshToken,
} = userSlice.actions;

export default userSlice.reducer;