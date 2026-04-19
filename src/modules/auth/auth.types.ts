export interface OtpData {
    otp: string;
    attempts: number;
    verified: boolean;
}

export interface AuthData {
    user: {
        id: number;
        email: string;
        name: string | null;
        phoneNumber: string;
    },
    tokens: AuthTokens,
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}