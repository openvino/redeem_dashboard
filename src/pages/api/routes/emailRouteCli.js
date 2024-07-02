import { exec } from 'child_process';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { recipient, subject, message } = req.body;

        if (!recipient, !subject, !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Construir el comando de mailx
        const command = echo`${message}` | mailx - s`${subject} ${recipient}`;
        // Ejecutar el comando
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${stderr}`);
                return res.status(500).json({ error: 'Failed to send email' });
            }

            res.status(200).json({ message: 'Email sent successfully' });
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}