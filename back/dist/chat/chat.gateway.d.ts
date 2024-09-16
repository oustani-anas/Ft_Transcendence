import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    constructor(chatService: ChatService);
    server: Server;
    handleSendMessage(client: Socket, payload: any): Promise<void>;
    handleJoiningGroupChat(client: Socket, payload: any): Promise<void>;
    kick(client: Socket, payload: any): Promise<void>;
    Mute(client: Socket, payload: any): Promise<void>;
    Ban(client: Socket, payload: any): Promise<void>;
    Unmute(client: Socket, payload: any): Promise<void>;
    makeAdmin(client: Socket, payload: any): Promise<void>;
    removeAdmin(client: Socket, payload: any): Promise<void>;
    setRoomToPublic(client: Socket, payload: any): Promise<void>;
    setRoomToProtected(client: Socket, payload: any, roomName: string): Promise<void>;
    changePassword(): Promise<void>;
    leave(client: Socket, payload: any): Promise<void>;
    addSocketToThisUserRoom(client: Socket, roomId: any): Promise<void>;
    handleConnection(client: any): void;
    handleDisconnect(client: any): void;
}
