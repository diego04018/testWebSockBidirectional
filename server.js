const WebSocket = require('ws');
const fs = require('fs');
const wav = require('wav');
const server = require('http').createServer((req, res) => {
    if (req.method === 'GET' && req.url.includes('data.xml')) {
      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
   <Response>
   <Say>The stream has started.</Say>
  <Start>
      <Stream name="Example" url="wss://b037-190-150-170-130.ngrok-free.app" />
  </Start>
  <Pause length="10"/>
  <Say>The stream has ended.</Say>
</Response>`;
  
      res.writeHead(200, { 'Content-Type': 'application/xml' });
      res.end(xmlData);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
  
const ws = new WebSocket.Server({server});
const OUTPUT_FILE = 'output.wav';
const fileWriter = new wav.FileWriter(OUTPUT_FILE, {
  sampleRate: 8000,    // Adjust based on your stream's properties
  channels: 1
});
// Event listener for new connections
ws.on('connection', (ws) => {
    console.log('New client connected');
    
    // Listen for messages from the client
    ws.on('message', (data) => {
      console.log('Received data from client:', data);
      
      // If the data is from Twilio, process it accordingly.
      // For example: Parse the JSON payload
      try {
        const message = JSON.parse(data);
        console.log('Parsed message:', message);
  
        // Process audio data here if applicable
        if (message.event === 'media') {
          console.log('Received audio chunk:', message.media.payload);
          const decodedAudio = Buffer.from(message.media.payload.toString(), 'base64');
          fileWriter.write(decodedAudio);
          // Decode base64 audio payload if necessary
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        fileWriter.end();
    });

    // Handle errors
    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
      fileWriter.end();
    });

    // Send a welcome message when a client connects
    ws.send('Welcome to the WebSocket server!');
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});