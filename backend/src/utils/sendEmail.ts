import nodemailer from "nodemailer";

interface EmailOptions {
    email: string;
    subject: string;
    message: string;
}

const sendEmail = async (options: EmailOptions) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
            user: process.env.SMTP_EMAIL, // Your church/app email
            pass: process.env.SMTP_PASSWORD, // App password (e.g., Gmail App Password)
        },
    });

    // 2. Define email options
    const mailOptions = {
        from: `Zemeromo <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    // 3. Send email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;