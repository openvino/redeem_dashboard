const express = require("express");
const WebSocket = require("ws");

const app = express();
const port = 8081;

// Create a new WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", (message) => {
    console.log("Received message:", message);
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

// Attach the WebSocket server to the Express server
const server = app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

// Upgrade incoming HTTP requests to WebSocket
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// Define a route to handle the POST request
app.post("/api/sendMessage", (req, res) => {
  try {
    const message = "Notification updated!";

    // Send the message to all connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
