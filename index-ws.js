const express = require('express');
const server = require('http').createServer();
const app = express();
const PORT = 3000;

app.get('/', function (req, res) {
  res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);

server.listen(PORT, function () {
  console.log('Listening on ' + PORT);
});

// Begin Websocket

const webSocketServer = require('ws').Server;
const wss = new webSocketServer({ server });

wss.on('connection', function connection(ws) {
  const numClients = wss.clients.size;
  console.log(`New client connected. Total clients: ${numClients}`);
  wss.broadcast(`New client connected. Total clients: ${numClients}`);
  if (ws.readyState === ws.OPEN) {
    ws.send('Welcome to the WebSocket server!');
  }
  ws.on('close', function close() {
    console.log('Client disconnected');
    wss.broadcast(`Client disconnected. Total clients: ${wss.clients.size}`);
  });
});
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};
