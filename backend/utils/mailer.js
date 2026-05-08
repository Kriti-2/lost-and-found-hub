const nodemailer = require('nodemailer');

const sendMail = async (to, subject, text, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("\n⚠️ Email credentials not set in .env!");
        console.log(`[LOCAL DEV OVERRIDE] Email to ${to}\nSubject: ${subject}\nContent: ${text}\n`);
        return true; 
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        const mailOptions = {
            from: `"L&F Hub SRMIST" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email successfully sent to ${to}`);
        return true;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return false;
    }
};

module.exports = { sendMail };
