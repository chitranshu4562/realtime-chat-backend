export interface OtpData {
    otp: string;
    attempts: number;
    verified: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}