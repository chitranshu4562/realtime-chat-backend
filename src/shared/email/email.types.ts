export interface SendOtpPayload {
    to: string;
    otp: string;
    expiresInMinutes: number;
}