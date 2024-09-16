import { SubscribeMessage, WebSocketGateway, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, WsException } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from './user.service';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway(
  {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
    },
  }
)

export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private UserService: UserService, private jwt: JwtService) { }
  @WebSocketServer()
  server: Server;

  // async afterInit(client: Socket) {
  //   client.use(async (request: any, next) => {
  //     const token = request.handshake.auth.jwt_token ?? request.handshake.headers.jwt_token;
  //     try {
  //       const payload = await this.jwt.verify(token, {
  //         secret: 'dontTellAnyone'
  //       })
  //     }
  //     catch (error) {
  //       // throw new WsException('Invalid Token');
  //     }
  //     next()
  //   })
  // }

  @OnEvent('refreshNotifications')
  async refreshNotifications(client: Socket, payload: any) {
    this.server.emit("refreshFrontNotifications");
  }

  @OnEvent('refreshfriendShip')
  async refreshfriendShip(client: Socket, payload: any) {
    this.server.emit("refreshFrontfriendShip");
    this.server.emit("refresh");

  }

  @OnEvent('refreshChat')
  async refreshChat(client: Socket, payload: any) {
    this.server.emit("refreshChatFront");
  }

  @OnEvent('refreshStatus')
  async refreshStatus(client: any, type: string, id: string) {
    // if  (type === "logOut")
    //   client.broadcast.emit("refreshStatus");
    // else
      this.server.emit("refreshStatus", type, id);
  }

  
  @SubscribeMessage('acceptRequest')
  async acceptRequest(client: Socket, payload: any) {
    
  }
  
  @SubscribeMessage('declineRequest')
  async declineRequest(client: Socket, payload: any) {
    
  }
  
  @OnEvent('refreshAll')
  async refreshAll(client: Socket) {
    this.server.emit("refreshAllInFront");
  }
  
  @SubscribeMessage('customDisco')
  async customDisco(client: Socket) {
    this.UserService.removeUserSocket(client.data.userId, client);
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.jwt_token ?? client.handshake.headers.jwt_token;
      const payload = this.jwt.verify(token, {
        secret: 'dontTellAnyone'
      });
      const userId = payload.sub;
      client.data.userId = userId;
      this.UserService.addUserSocket(userId, client);
    } catch (error) {
      client.disconnect(true);
    }
  }


  handleDisconnect(client: Socket) {
    this.UserService.removeUserSocket(client.data.userId, client);
  }
}

