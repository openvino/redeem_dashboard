import nodemailer from 'nodemailer'
export default async function handler(req, res) {

    const { email, subject, message, secret_key } = req.body;

    if (!email || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (secret_key !== process.env.NEXT_PUBLIC_SECRET_KEY) {
        return res.status(401).json({ message: 'Invalid secret key' });
    }

    const sendEmailMessage = async (email, subject, message) => {
        try {
            let transporter = nodemailer.createTransport({
                host: "127.0.0.1",
                port: 1025,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.NEXT_PUBLIC_EMAIL_USER, // generated ethereal user
                    pass: process.env.NEXT_PUBLIC_EMAIL_PASS, // generated ethereal password
                },

                tls: {
                    rejectUnauthorized: false
                }
            })

            let info = await transporter.sendMail({
                from: '"Openvino" <redeem@openvino.org>',
                to: email,
                subject: subject,
                text: "Openvino",
                html: message
            });

            console.log("Mensaje enviado: %s", info.messageId);
        } catch (error) {
            console.log(error);
        }
    }

    if (req.method === "POST") {
        try {
            const response = await sendEmailMessage(email, subject, message);
            return res.status(200).json("Success");
        } catch (error) {
            console.log(error);
            return res.status(500).json(error.message);
        }
    }
}
