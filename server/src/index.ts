import { createServer } from 'http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../shared/protocol';
import { RoomManager } from './room-manager';
import { GameEngine } from './game-engine';

const PORT = Number(process.env.PORT) || 3001;

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager();
const gameEngine = new GameEngine();

function emit(socketId: string, event: string, data: Record<string, unknown>): void {
  io.to(socketId).emit(event as keyof ServerToClientEvents, data as never);
}

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);

  // --- Room events ---

  socket.on('room:create', ({ playerName }) => {
    const room = roomManager.createRoom(socket.id, playerName);
    socket.join(room.code);
    socket.emit('room:created', { roomCode: room.code });
    console.log(`[room:create] ${playerName} created room ${room.code}`);
  });

  socket.on('room:join', ({ roomCode, playerName }) => {
    const result = roomManager.joinRoom(roomCode.toUpperCase(), socket.id, playerName);

    if ('error' in result) {
      socket.emit('room:error', { message: result.error });
      return;
    }

    const { room } = result;
    socket.join(room.code);

    // Notify the joiner
    socket.emit('room:joined', {
      roomCode: room.code,
      hostName: room.host.name,
      guestName: playerName,
    });

    // Notify the host
    io.to(room.host.socketId).emit('room:opponent-joined', {
      opponentName: playerName,
    });

    console.log(`[room:join] ${playerName} joined room ${room.code}`);
  });

  socket.on('room:leave', () => {
    const result = roomManager.leaveRoom(socket.id);
    if (!result) return;

    const { room, opponentSocketId } = result;
    socket.leave(room.code);

    if (opponentSocketId) {
      io.to(opponentSocketId).emit('room:opponent-left');
    }

    // Clean up game if in progress
    gameEngine.cleanup(room.code);
    console.log(`[room:leave] ${socket.id} left room ${room.code}`);
  });

  // --- Game events ---

  socket.on('game:select-level', ({ level }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || !roomManager.isHost(room, socket.id)) return;

    room.level = level;

    // Notify guest
    if (room.guest) {
      io.to(room.guest.socketId).emit('game:level-selected', { level });
    }

    // Start the game if both players are present
    if (room.guest && room.level) {
      gameEngine.startGame(room, emit);
    }
  });

  socket.on('game:answer', ({ answer }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;

    gameEngine.handleAnswer(room, socket.id, answer, emit);
  });

  // --- Disconnect handling ---

  socket.on('disconnect', () => {
    console.log(`[disconnect] ${socket.id}`);

    const result = roomManager.handleDisconnect(socket.id);
    if (!result) return;

    const { opponentSocketId } = result;
    if (opponentSocketId) {
      io.to(opponentSocketId).emit('connection:opponent-disconnected');
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Tennis Math server running on port ${PORT}`);
});
