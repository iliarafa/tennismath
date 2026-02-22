import { customAlphabet } from 'nanoid';
import type { Level } from '../../shared/types';

// No ambiguous chars: O/0/I/1/L
const generateCode = customAlphabet('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 6);

export interface RoomPlayer {
  socketId: string;
  name: string;
  disconnectedAt: number | null;
}

export interface Room {
  code: string;
  host: RoomPlayer;
  guest: RoomPlayer | null;
  level: Level | null;
  gameInProgress: boolean;
}

const RECONNECT_TIMEOUT_MS = 30_000;

export class RoomManager {
  private rooms = new Map<string, Room>();
  private socketToRoom = new Map<string, string>();
  private reconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

  createRoom(socketId: string, playerName: string): Room {
    const code = generateCode();
    const room: Room = {
      code,
      host: { socketId, name: playerName, disconnectedAt: null },
      guest: null,
      level: null,
      gameInProgress: false,
    };
    this.rooms.set(code, room);
    this.socketToRoom.set(socketId, code);
    return room;
  }

  joinRoom(
    roomCode: string,
    socketId: string,
    playerName: string
  ): { room: Room } | { error: string } {
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found' };
    if (room.guest) return { error: 'Room is full' };

    room.guest = { socketId, name: playerName, disconnectedAt: null };
    this.socketToRoom.set(socketId, roomCode);
    return { room };
  }

  getRoomByCode(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  getRoomBySocket(socketId: string): Room | undefined {
    const code = this.socketToRoom.get(socketId);
    return code ? this.rooms.get(code) : undefined;
  }

  isHost(room: Room, socketId: string): boolean {
    return room.host.socketId === socketId;
  }

  getOpponentSocket(room: Room, socketId: string): string | null {
    if (room.host.socketId === socketId) {
      return room.guest?.socketId ?? null;
    }
    return room.host.socketId;
  }

  /**
   * Handle socket disconnect. Returns info about the disconnecting player,
   * or null if they weren't in a room.
   */
  handleDisconnect(socketId: string): {
    room: Room;
    opponentSocketId: string | null;
    wasHost: boolean;
  } | null {
    const room = this.getRoomBySocket(socketId);
    if (!room) return null;

    const wasHost = this.isHost(room, socketId);
    const player = wasHost ? room.host : room.guest;
    if (!player) return null;

    player.disconnectedAt = Date.now();
    const opponentSocketId = this.getOpponentSocket(room, socketId);

    // Set reconnection timer
    const timer = setTimeout(() => {
      this.removePlayer(room, wasHost);
    }, RECONNECT_TIMEOUT_MS);
    this.reconnectTimers.set(socketId, timer);

    return { room, opponentSocketId, wasHost };
  }

  /**
   * Attempt to reconnect a player by name to their room.
   * Returns the room if reconnected.
   */
  tryReconnect(
    newSocketId: string,
    playerName: string,
    roomCode: string
  ): { room: Room; wasHost: boolean } | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const checkPlayer = (p: RoomPlayer | null, isHost: boolean) => {
      if (p && p.name === playerName && p.disconnectedAt !== null) {
        // Clear reconnect timer
        const timer = this.reconnectTimers.get(p.socketId);
        if (timer) {
          clearTimeout(timer);
          this.reconnectTimers.delete(p.socketId);
        }
        // Update socket mapping
        this.socketToRoom.delete(p.socketId);
        p.socketId = newSocketId;
        p.disconnectedAt = null;
        this.socketToRoom.set(newSocketId, roomCode);
        return { room, wasHost: isHost };
      }
      return null;
    };

    return checkPlayer(room.host, true) ?? checkPlayer(room.guest, false);
  }

  leaveRoom(socketId: string): {
    room: Room;
    opponentSocketId: string | null;
  } | null {
    const room = this.getRoomBySocket(socketId);
    if (!room) return null;

    const opponentSocketId = this.getOpponentSocket(room, socketId);
    const wasHost = this.isHost(room, socketId);

    this.removePlayer(room, wasHost);
    this.socketToRoom.delete(socketId);

    return { room, opponentSocketId };
  }

  private removePlayer(room: Room, isHost: boolean): void {
    if (isHost) {
      if (room.guest) {
        // Promote guest to host
        room.host = room.guest;
        room.guest = null;
      } else {
        // No one left, delete room
        this.socketToRoom.delete(room.host.socketId);
        this.rooms.delete(room.code);
        return;
      }
    } else {
      if (room.guest) {
        this.socketToRoom.delete(room.guest.socketId);
      }
      room.guest = null;
    }
    room.gameInProgress = false;
    room.level = null;
  }

  deleteRoom(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    this.socketToRoom.delete(room.host.socketId);
    if (room.guest) {
      this.socketToRoom.delete(room.guest.socketId);
    }
    this.rooms.delete(code);
  }
}
