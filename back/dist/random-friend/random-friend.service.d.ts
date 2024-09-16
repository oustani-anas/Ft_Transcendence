import { Ball, Canvas, Game, Player } from './game-data.interface';
import { Server } from 'socket.io';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class GameRandomService {
    private readonly userService;
    private readonly prisma;
    private eventEmitter;
    private bSide;
    private pSide;
    eventService: any;
    jwtService: any;
    constructor(userService: UserService, prisma: PrismaService, eventEmitter: EventEmitter2);
    addGameResult(players: Player[], userId: string, result: boolean): Promise<{
        id: string;
        userId: string;
        opponentId: string;
        status: string;
        userScore: number;
        opponentScore: number;
    }>;
    checkWinner(players: Player[], rooms: {
        [roomId: string]: string[];
    }, roomId: string, server: Server): boolean;
    collision(ball: Ball, canvas: Canvas, players: Player[]): boolean;
    handleArrowMove(data: string, socketId: string, players: Player[]): void;
    handleMouseMove(data: number, socketId: string, players: Player[]): void;
    removePlayer(players: Player[], Id: string): void;
    deletePlayerFromPlayers(players: {
        [id: number]: Player[];
    }, id: string): {
        [id: number]: Player[];
    };
    removeDataFromRooms(game: Game[], id: string, gameId: number, server: Server): number;
    resetBall(ball: Ball, canvas: Canvas): void;
    startTheGame(players: Player[], rooms: {
        [roomId: string]: string[];
    }, roomId: string, server: Server, ball: Ball, canvas: Canvas): void;
    ResetScore(players: Player[]): void;
    findNbById(game: Game[], id: string): number;
    handle_id(db_id: string, g_id: string, socket_id: string, games: Game[]): Promise<void>;
    getUserInfosFromToken(token: string): any;
}
