import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Configuración de CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*"); // O usa tu dominio específico en lugar de '*'
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin); // Alternativa común
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Manejar solicitud OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { email, subject, message } = req.body;

  // Verificación de parámetros
  if (!email || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields" });
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
          rejectUnauthorized: false,
        },
      });

      let info = await transporter.sendMail({
        from: '"OpenVino" <redeem@openvino.org>',
        to: email,
        subject: subject,
        text: "no-reply@openvino.org",
        html: message,
      });

      console.log("Mensaje enviado: %s", info.messageId);
    } catch (error) {
      console.log(error);
      throw new Error("Error sending email");
    }
  };

  if (req.method === "POST") {
    try {
      await sendEmailMessage(email, subject, message);

      await sendEmailMessage('Mica@costaflores.com',
        subject,
        "Nueva orden"`
            <p>Se ha realizado una transacción con los siguientes datos</p>
            <p><strong>Usuario:</strong> ${email}</p>
            <p><strong>Asunto:</strong> ${subject}</p>
            `
      );
      return res.status(200).json("Success");
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
