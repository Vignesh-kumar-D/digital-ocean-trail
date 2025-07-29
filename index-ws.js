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
process.on('SIGINT', () => {
  try {
    console.log('Received SIGINT. Shutting down gracefully...');
    wss.clients.forEach(function each(client) {
      client.terminate();
    });

    server.close(() => {
      console.log(' down again');
      shutdownDB();
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
});
wss.on('connection', function connection(ws) {
  const numClients = wss.clients.size;
  console.log(`New client connected. Total clients: ${numClients}`);
  wss.broadcast(`New client connected. Total clients: ${numClients}`);
  if (ws.readyState === ws.OPEN) {
    ws.send('Welcome to the WebSocket server!');
  }
  db.run(
    `INSERT INTO visitors (count, time) VALUES (${numClients}, datetime('now'))`
  );
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
// end websocket

// begin sqlite
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(':memory:');

db.serialize(function () {
  db.run(`
  CREATE TABLE visitors (
  count INTEGER,
  time TEXT
  )`);
});

function getCounts() {
  db.all('SELECT * FROM visitors', (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      console.log(row);
    });
  });
}

function shutdownDB() {
  getCounts();
  console.log('Shutting down database connection');
  db.close();
}
