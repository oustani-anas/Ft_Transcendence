import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Canvas } from './game-data.interface';
import { GameRandomService } from './random-friend.service';
import { UserService } from 'src/user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class RandomFriendGateway implements OnGatewayDisconnect {
    private readonly gameService;
    private readonly userService;
    private eventEmitter;
    constructor(gameService: GameRandomService, userService: UserService, eventEmitter: EventEmitter2);
    server: Server;
    private game;
    private id;
    private rooms;
    private ball;
    private canvas;
    private players;
    private ids;
    connectedUsers: Map<string, any>;
    handleConnection(socket: Socket): Promise<void>;
    handleEvent(data: Canvas, client: Socket): void;
    handleArrowMove(data: string, socket: Socket): void;
    handleMouseMove(data: number, socket: Socket): void;
    PlayAgain(data: number, socket: Socket): Promise<void>;
    handle_id(id: string, client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
}
