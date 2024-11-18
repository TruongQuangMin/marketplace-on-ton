import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class WishlistGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private clients = new Map<string, Socket>();
  
    handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
      const userId = client.handshake.query.userId as string;
  
      if (userId) {
        this.clients.set(userId, client);
      }
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
      const userId = [...this.clients.entries()]
        .find(([, socket]) => socket.id === client.id)?.[0];
  
      if (userId) {
        this.clients.delete(userId);
      }
    }
  
    notifyUser(userId: string, message: any) {
      const client = this.clients.get(userId);
      if (client) {
        client.emit('wishlist_notification', message);
      }
    }
  }
  