import nodemailer from 'nodemailer'
  export default async function handler(req, res) {
    const sendEmailMessage = async (email) => {
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
            from: '"Me" <redeem@openvino.org>',
            to: email,
            subject: "Redeem exitoso!",
            text: "Hello world?",
            html: "<b>Próximamente nos contactaremos contigo para coordinar la entrega de tu vino. Si tienes dudas nos puedes escribir a info@costaflores.com </b>"
          });
    
          console.log("Mensaje enviado: %s", info.messageId);
        } catch (error) {
          console.log(error);
        }
      }
  
    if (req.method === "POST") {
      try {
        const response = await sendEmailMessage(req.body.email);
        return res.status(200).json("Success");
      } catch (error) {
        console.log(error);
        return res.status(500).json(error.message);
      }
    }
  }
  