const nodemailer = require('nodemailer');

// Create transporter once at module load instead of per-email for connection reuse
let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return null;
    }

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        pool: true,       // Use pooled connections for better throughput
        maxConnections: 3  // Limit concurrent connections
    });

    return transporter;
};

const sendMail = async (to, subject, text, html) => {
    const transport = getTransporter();

    if (!transport) {
        console.warn("\n⚠️ Email credentials not set in .env!");
        console.log(`[LOCAL DEV OVERRIDE] Email to ${to}\nSubject: ${subject}\nContent: ${text}\n`);
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
        await transport.sendMail(mailOptions);
        console.log(`✅ Email successfully sent to ${to}`);
        return true;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return false;
    }
};

module.exports = { sendMail };
