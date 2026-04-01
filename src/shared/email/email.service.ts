import { env } from "../../configs/env";
import { SendOtpPayload } from "./email.types";
import { otpEmailTemplate } from "./email.templates";
import nodemailer, { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env.GMAIL_USER,
                pass: env.GMAIL_APP_PASSWORD,
            }
        })
    }

    return transporter;
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
    try {
        const transporterClient = getTransporter();
        const mailOptions = {
            from: `"Realtime Chat App" <${env.GMAIL_USER}>`,
            to,
            subject,
            html
        }
        const response = await transporterClient.sendMail(mailOptions);
        return response;
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to send email')
    }
}

export async function sendOtpInEmail({ to, otp, expiresInMinutes }: SendOtpPayload): Promise<void> {
    await sendEmail({
        to: to,
        subject: "Your verification code",
        html: otpEmailTemplate(otp, expiresInMinutes),
    });
}