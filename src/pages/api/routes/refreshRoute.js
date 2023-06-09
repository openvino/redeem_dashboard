export default async function handler(req, res) {
  const data = req.body;
  const event = {
    data: JSON.stringify(data),
  };
  try {
    res.sseSend(event); // Enviar evento SSE al cliente
    res.status(200).json("message sent");
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
}

// const { exec } = require("child_process");

// export default async function handler(req, res) {
//   if (req.method === "POST") {
//     // Ejecutar el comando de construcción de la aplicación
//     exec("npm run build", (error, stdout, stderr) => {
//       if (error) {
//         console.error(`Error en el proceso de construcción: ${error}`);
//         return res
//           .status(500)
//           .json({ message: "Error en el proceso de construcción" });
//       }

//       console.log(`Resultado del proceso de construcción:\n${stdout}`);

//       // Reiniciar el servidor Next.js
//       process.exit();
//     });

//     return res.status(200).json({ message: "Build en proceso" });
//   } else {
//     return res.status(404).json({ message: "Ruta no encontrada" });
//   }
// }

// const { spawn } = require("child_process");

// export default async function handler(req, res) {
//   if (req.method === "POST") {
//     // Ejecutar el comando de construcción de la aplicación
//     const buildProcess = spawn("npm", ["run", "build"]);

//     buildProcess.stdout.on("data", (data) => {
//       console.log(`stdout: ${data}`);
//     });

//     buildProcess.stderr.on("data", (data) => {
//       console.error(`stderr: ${data}`);
//     });

//     buildProcess.on("close", (code) => {
//       console.log(`Child process exited with code ${code}`);

//       // Reiniciar el servidor Next.js
//       process.exit();
//     });

//     return res.status(200).json({ message: "Build en proceso" });
//   } else {
//     return res.status(404).json({ message: "Ruta no encontrada" });
//   }
// }
