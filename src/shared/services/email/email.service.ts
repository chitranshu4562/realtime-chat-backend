import {Resend} from "resend";
import {env} from "../../../config/env";
import {SendOtpPayload} from "./email.types";
import {otpEmailTemplate} from "./email.templates";

let resendClient: Resend | null = null;

function getResendClient() {
    if (!resendClient) {
        resendClient = new Resend(env.RESEND_API_KEY);
    }
    return resendClient;
}

export async function sendEmail(
    {
        to,
        subject,
        html
    }: {
        to: string;
        subject: string;
        html: string;
    }
): Promise<void> {
    const client = getResendClient();
    const {error} = await client.emails.send({
        from: env.SENDER_EMAIL,
        to,
        subject,
        html,
    });
    if (error) {
        throw new Error("Failed to send email");
    }
}

export async function sendOtpInEmail({to, otp, expiresInMinutes}: SendOtpPayload): Promise<void> {
    await sendEmail({
        to: to,
        subject: "Your verification code",
        html: otpEmailTemplate(otp, expiresInMinutes),
    });
}