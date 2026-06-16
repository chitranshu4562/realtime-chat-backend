import { env } from "../../config/env";
import { SendOtpPayload } from "./email.types";
import { otpEmailTemplate } from "./email.templates";

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}): Promise<void> {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "api-key": env.BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: { email: env.BREVO_SENDER_EMAIL, name: "Realtime Chat" },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(`Brevo error ${res.status}: ${JSON.stringify(body)}`);
    }
}

export async function sendOtpInEmail({ to, otp, expiresInMinutes }: SendOtpPayload): Promise<void> {
    await sendEmail({
        to,
        subject: "Your verification code",
        html: otpEmailTemplate(otp, expiresInMinutes),
    });
}
