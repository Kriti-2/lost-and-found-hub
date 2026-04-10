const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this if using another provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendMail = async (to, subject, text, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("⚠️ Email credentials not set in .env! Skipping real email, but proceeding.");
        return true; 
    }

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
