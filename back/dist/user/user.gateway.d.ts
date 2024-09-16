import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
export declare class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private UserService;
    private jwt;
    constructor(UserService: UserService, jwt: JwtService);
    server: Server;
    refreshNotifications(client: Socket, payload: any): Promise<void>;
    refreshfriendShip(client: Socket, payload: any): Promise<void>;
    refreshChat(client: Socket, payload: any): Promise<void>;
    refreshStatus(client: any, type: string, id: string): Promise<void>;
    acceptRequest(client: Socket, payload: any): Promise<void>;
    declineRequest(client: Socket, payload: any): Promise<void>;
    refreshAll(client: Socket): Promise<void>;
    customDisco(client: Socket): Promise<void>;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
}
