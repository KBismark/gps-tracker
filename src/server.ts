import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import http from 'http'
import {Server} from 'socket.io'

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {})

// Store active users with their locations
const activeUsers = new Map();


io.on('connection', (socket) => {
  
  // Send current active users to the newly connected user
  socket.emit('active-users', Array.from(activeUsers.entries()).map(([id, data]) => ({
    id,
    ...data
  })));
  
  // Handle location updates
  socket.on('location-update', (data) => {
    const { latitude, longitude, username, timestamp } = data;
    
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      socket.emit('error', { message: 'Invalid location data' });
      return;
    }
    
    activeUsers.set(socket.id, {
      latitude,
      longitude,
      username: username || `TestUser-${socket.id.substring(0, 6)}`,
      timestamp: timestamp || Date.now()
    });
    
    // Broadcast to all other users
    socket.broadcast.emit('user-location-update', {
      id: socket.id,
      latitude,
      longitude,
      username: username || `TestUser-${socket.id.substring(0, 6)}`,
      timestamp: timestamp || Date.now()
    });
  });
  
  socket.on('disconnect', () => {
    activeUsers.delete(socket.id);
    
    // Broadcast user disconnection
    socket.broadcast.emit('user-disconnected', { id: socket.id });
  });
  
  socket.on('set-username', (username) => {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      userData.username = username;
      activeUsers.set(socket.id, userData);
    }
  });
});


/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);


const angularApp = new AngularNodeAppEngine();
/**
 * Handle all other requests by rendering the Angular application.
 */
app.use(/^\/(?!socket\.io).*$/, (req, res, next) => {
  if (req.url.startsWith('/socket.io')){
    return next()
  }
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
