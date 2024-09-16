"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRandomService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const user_service_1 = require("../user/user.service");
const jwt = __importStar(require("jsonwebtoken"));
const event_emitter_1 = require("@nestjs/event-emitter");
let GameRandomService = class GameRandomService {
    constructor(userService, prisma, eventEmitter) {
        this.userService = userService;
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.bSide = { top: 0, bottom: 0, left: 0, right: 0 };
        this.pSide = { top: 0, bottom: 0, left: 0, right: 0 };
    }
    addGameResult(players, userId, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const status = players[0].score > players[1].score ? "win" : "lose";
            const data = {
                userId: players[0].db_id,
                opponentId: players[1].db_id,
                status: status,
                userScore: players[0].score,
                opponentScore: players[1].score,
            };
            const status2 = players[1].score > players[0].score ? "win" : "lose";
            const data2 = {
                userId: players[1].db_id,
                opponentId: players[0].db_id,
                status: status2,
                userScore: players[1].score,
                opponentScore: players[0].score,
            };
            return (yield this.prisma.gameResult.create({ data: data })) && (yield this.prisma.gameResult.create({ data: data2 }));
        });
    }
    checkWinner(players, rooms, roomId, server) {
        if (!players[0] || !players[1])
            return true;
        if (players[0].score >= 5) {
            server.to(roomId).emit("winner", players[0].name);
            this.addGameResult(players, players[0].db_id, true);
            this.userService.updateProfile("Online", players[0].db_id);
            this.userService.updateProfile("Online", players[1].db_id);
            this.eventEmitter.emit("refreshStatus");
            return true;
        }
        else if (players[1].score >= 5) {
            server.to(roomId).emit("winner", players[1].name);
            this.addGameResult(players, players[1].db_id, false);
            this.userService.updateProfile("Online", players[0].db_id);
            this.userService.updateProfile("Online", players[1].db_id);
            this.eventEmitter.emit("refreshStatus");
            return true;
        }
        return false;
    }
    collision(ball, canvas, players) {
        if (!players[0] || !players[1])
            return;
        this.bSide.top = ball.y - ball.radius;
        this.bSide.bottom = ball.y + ball.radius;
        this.bSide.left = ball.x - ball.radius;
        this.bSide.right = ball.x + ball.radius;
        if (ball.x < canvas.width / 2) {
            this.pSide.top = players[0].y;
            this.pSide.bottom = players[0].y + players[0].height;
            this.pSide.left = players[0].x;
            this.pSide.right = players[0].x + players[0].width;
        }
        else {
            this.pSide.top = players[1].y;
            this.pSide.bottom = players[1].y + players[1].height;
            this.pSide.left = players[1].x;
            this.pSide.right = players[1].x + players[1].width;
        }
        return (this.bSide.right > this.pSide.left &&
            this.bSide.bottom > this.pSide.top &&
            this.bSide.left < this.pSide.right &&
            this.bSide.top < this.pSide.bottom);
    }
    handleArrowMove(data, socketId, players) {
        if (data === "up") {
            if (socketId === players[0].id) {
                if (players[0].y <= 350)
                    players[0].y += 20;
            }
            else {
                if (players[1].y <= 350)
                    players[1].y += 20;
            }
        }
        else if (data === "down") {
            if (socketId === players[0].id) {
                if (players[0].y > 0)
                    players[0].y -= 20;
            }
            else {
                if (players[1].y > 1)
                    players[1].y -= 20;
            }
        }
    }
    handleMouseMove(data, socketId, players) {
        if (!players[0])
            return;
        if (socketId === players[0].id) {
            players[0].y = data - players[0].height / 2;
        }
        else {
            players[1].y = data - players[1].height / 2;
        }
    }
    removePlayer(players, Id) {
        for (let i = 0; i < players.length; i++) {
            if (!players[i])
                continue;
            if (players[i].id === Id) {
                players.splice(i, 1);
                players.length = players.length;
                return;
            }
        }
    }
    deletePlayerFromPlayers(players, id) {
        const indexs = Object.keys(players);
        for (let i = 0; i < indexs.length; i++) {
            if (players[indexs[i]].length == 1 && players[indexs[i]][0].id == id)
                delete players[indexs[i]];
            else if (players[indexs[i]].length == 2) {
                if (players[indexs[i]][0].id == id)
                    delete players[indexs[i]];
                else if (players[indexs[i]][1].id == id)
                    delete players[indexs[i]];
            }
        }
        const index = Object.keys(players);
        if (index[0] !== '0') {
            let new_players = {};
            for (let i = 0; i < index.length; i++) {
                new_players[i.toString()] = players[index[i]];
            }
            return (new_players);
        }
        return players;
    }
    removeDataFromRooms(game, id, gameId, server) {
        for (let i = 0; i < game.length; i++) {
            if (game[i].players.length === 2) {
                if (game[i].players[0].id == id || game[i].players[1].id == id) {
                    if (game[i].players[0].score < 5 && game[i].players[1].score < 5) {
                        const roomId = Object.keys(game[i].rooms);
                        if (game[i].players[0].id === id) {
                            game[i].players[0].giveUp = true;
                            game[i].players[1].score = 5;
                            server.to(roomId[0]).emit("winner", game[i].players[1].name);
                        }
                        else {
                            game[i].players[1].giveUp = true;
                            game[i].players[0].score = 5;
                            server.to(roomId[0]).emit("winner", game[i].players[0].name);
                        }
                    }
                    this.userService.updateProfile("Online", game[i].players[0].db_id);
                    this.userService.updateProfile("Online", game[i].players[1].db_id);
                    this.eventEmitter.emit("refreshStatus");
                    game[i].players = game[i].players.filter(player => player.id !== id);
                    game.splice(i, 1);
                    break;
                }
            }
            else {
                if (game[i].players[0].id === id && game[i].players.length == 1) {
                    this.userService.updateProfile("Online", game[i].players[0].db_id);
                    this.eventEmitter.emit("refreshStatus");
                    game.splice(i, 1);
                    break;
                }
            }
        }
        for (let i = 0; i < game.length; i++) {
            game[i].nb = i;
        }
        gameId = game.length - 1;
        return gameId;
    }
    resetBall(ball, canvas) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
    }
    startTheGame(players, rooms, roomId, server, ball, canvas) {
        let check = 0;
        const intervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            if (canvas) {
                if (this.checkWinner(players, rooms, roomId, server) || players[0].giveUp || players[1].giveUp) {
                    clearInterval(intervalId);
                }
                const gameData = {
                    ball,
                    players,
                };
                server.to(roomId).emit('update', gameData);
                ball.x += ball.velocityX * ball.speed;
                ball.y += ball.velocityY * ball.speed;
                if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
                    ball.velocityY = -ball.velocityY;
                }
                let collisionResult = this.collision(ball, canvas, players);
                if (collisionResult) {
                    if (ball.x < canvas.width / 2)
                        ball.velocityX = Math.abs(ball.velocityX);
                    else
                        ball.velocityX = -1 * Math.abs(ball.velocityX);
                }
                if (players[0] && players[1]) {
                    if (ball.x - ball.radius < 0) {
                        players[1].score++;
                        this.resetBall(ball, canvas);
                    }
                    else if (ball.x + ball.radius > 900) {
                        players[0].score++;
                        this.resetBall(ball, canvas);
                    }
                }
                if (check == 0)
                    check++;
            }
        }), 1000 / 60);
    }
    ResetScore(players) {
        players[0].score = 0;
        players[1].score = 0;
    }
    findNbById(game, id) {
        for (let i = 0; i < game.length; i++) {
            for (const roomId of Object.keys(game[i].rooms)) {
                if (game[i].rooms[roomId].includes(id))
                    return i;
            }
        }
    }
    handle_id(db_id, g_id, socket_id, games) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let game of games) {
                if (!game.players)
                    return;
                if (game.players.length == 2) {
                    if (game.players[0].id == socket_id) {
                        game.players[0].db_id = db_id;
                        const user = yield this.userService.getUser(db_id);
                        game.players[0].name = user.username;
                        game.players[0].pic = user.avatar;
                        game.players[0].g_id = g_id;
                    }
                    else if (game.players[1].id == socket_id) {
                        game.players[1].db_id = db_id;
                        const user = yield this.userService.getUser(db_id);
                        game.players[1].name = user.username;
                        game.players[1].pic = user.avatar;
                        game.players[1].g_id = g_id;
                    }
                }
            }
        });
    }
    getUserInfosFromToken(token) {
        try {
            const decoded = jwt.verify(token, `${process.env.SECRET_KEY}`);
            return decoded;
        }
        catch (error) {
            console.error('JWT verification failed:', error.message);
            return null;
        }
    }
};
exports.GameRandomService = GameRandomService;
exports.GameRandomService = GameRandomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], GameRandomService);
//# sourceMappingURL=random-friend.service.js.map