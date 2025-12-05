import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import type { ChallengeDto } from 'src/challenge/challenge-dto';

export type JwtPayload = { sub: number; username: string; isAdmin: boolean };

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) return client.disconnect();

    try {
      const payload: JwtPayload = this.jwtService.verify(token);
      const userId = payload.sub;
      client.data.userId = userId;

      client.join(`user_${userId}`);

      console.log(`User ${userId} connected to realtime`);
    } catch {
      console.log(`Socket connection rejected for ${client.id}: Invalid token`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendChallengeToUser(userId: number, data: ChallengeDto) {
    this.server.to(`user_${userId}`).emit('newChallenge', data);
  }
}
