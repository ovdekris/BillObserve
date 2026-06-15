const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"Spendly" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject: 'Resetowanie hasła – Spendly',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a2e;">
                <h2 style="margin-bottom: 8px;">Cześć, ${name}!</h2>
                <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w Spendly.</p>
                <p>Kliknij przycisk poniżej, aby ustawić nowe hasło. Link jest ważny przez <strong>1 godzinę</strong>.</p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetUrl}"
                       style="background-color: #6c63ff; color: white; padding: 14px 28px;
                              border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        Resetuj hasło
                    </a>
                </div>
                <p style="color: #888; font-size: 13px;">
                    Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość – nic się nie zmieni.
                </p>
                <p style="color: #888; font-size: 13px;">
                    Link: <a href="${resetUrl}" style="color: #6c63ff;">${resetUrl}</a>
                </p>
            </div>
        `
    });
};

module.exports = { sendPasswordResetEmail };
