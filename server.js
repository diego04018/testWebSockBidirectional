const WebSocket = require('ws');
const server = require('http').createServer((req, res) => {
    if (req.method === 'GET' && req.url.includes('data.xml')) {
      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
   <Response>
   <Say>The stream has started.</Say>
   <Connect>
       <Stream url="wss://b037-190-150-170-130.ngrok-free.app" />
   </Connect>
</Response>`;
  
      res.writeHead(200, { 'Content-Type': 'application/xml' });
      res.end(xmlData);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
  
const ws = new WebSocket.Server({server});

// Event listener for new connections
ws.on('connection', (ws) => {
    console.log('New client connected');
    
    // Listen for messages from the client
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
  
        // Checks for bidirectional dtmf mess
        if (message.event === 'dtmf') {
          console.log('Received dtmf:', message);
        } else if (message.event === 'stop') {
          console.log('Received stop:', message);
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // Handle errors
    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });

    // Send a welcome message when a client connects
    ws.send('Welcome to the WebSocket server!');
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});