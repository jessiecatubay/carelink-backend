import { Resend } from "resend";
import nodemailer from "nodemailer";
let resendClient = null;
let transporter = null;
function getResendClient() {
    if (!resendClient) {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not configured");
        }
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
}
function buildTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
        throw new Error("SMTP_HOST and SMTP_PORT must be configured");
    }
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        throw new Error("SMTP_USER and SMTP_PASSWORD must be configured");
    }
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
}
function getTransporter() {
    if (!transporter) {
        transporter = buildTransporter();
    }
    return transporter;
}
export async function sendEmail({ to, subject, html }) {
    const appName = process.env.APP_NAME || "CareLink";
    // Use Resend if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
        const resend = getResendClient();
        const rawFrom = process.env.RESEND_FROM ||
            process.env.SMTP_FROM ||
            "CareLink <onboarding@resend.dev>";
        const from = rawFrom.includes("<") ? rawFrom : `"${appName}" <${rawFrom}>`;
        const { data, error } = await resend.emails.send({
            from,
            to,
            subject,
            html,
        });
        if (error) {
            console.error("Resend API error:", error);
            throw new Error(`Failed to send email via Resend: ${error.message}`);
        }
        return data;
    }
    // Fallback to SMTP if configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        if (!process.env.SMTP_FROM) {
            throw new Error("SMTP_FROM must be configured");
        }
        return await getTransporter().sendMail({
            from: `"${appName}" <${process.env.SMTP_FROM}>`,
            to,
            subject,
            html,
        });
    }
    throw new Error("No email service configured. Please provide RESEND_API_KEY or SMTP settings.");
}
//# sourceMappingURL=mailer.js.map