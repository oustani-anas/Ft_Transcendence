"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.RandomFriendGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const random_friend_service_1 = require("./random-friend.service");
const user_service_1 = require("../user/user.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let RandomFriendGateway = class RandomFriendGateway {
    constructor(gameService, userService, eventEmitter) {
        this.gameService = gameService;
        this.userService = userService;
        this.eventEmitter = eventEmitter;
        this.game = [];
        this.id = -1;
        this.rooms = {};
        this.ball = { color: "WHITE", radius: 15, speed: 0.9, velocityX: 5, velocityY: 5, x: 450, y: 225 };
        this.canvas = { height: 0, width: 0 };
        this.players = {};
        this.ids = [];
        this.connectedUsers = new Map();
    }
    ;
    handleConnection(socket) {
        return __awaiter(this, void 0, void 0, function* () {
            const availibleRoomId = Object.keys(this.rooms).find(roomId => this.rooms[roomId].length == 1);
            const token = socket.handshake.query.token;
            const token_id = this.gameService.getUserInfosFromToken(token);
            const user = yield this.userService.getUser(token_id.sub);
            if (!user)
                return;
            const existingUser = Array.from(this.connectedUsers.values());
            if (existingUser.includes(token_id.sub) || user.status === "inGame") {
                socket.emit("already_in_game");
                socket.disconnect();
                return;
            }
            this.connectedUsers.set(socket.id, token_id.sub);
            if (availibleRoomId) {
                let newBall = Object.assign({}, this.ball);
                this.rooms[availibleRoomId].push(socket.id);
                socket.join(availibleRoomId);
                this.server.to(availibleRoomId).emit("start");
                this.id = this.game.length;
                if (this.players[this.id] && this.players[this.id].length == 1)
                    this.players[this.id].push({ id: socket.id, playerNb: 2, x: 880, y: 175, score: 0, width: 20, height: 100, name: "player2", giveUp: false, db_id: token_id.sub, pic: "", g_id: "" });
                const newGame = {
                    nb: this.id,
                    ball: newBall,
                    players: this.players[this.id],
                    rooms: this.rooms
                };
                this.userService.updateProfile("inGame", this.connectedUsers.get(this.players[this.id][0].id));
                this.eventEmitter.emit("refreshStatus");
                this.userService.updateProfile("inGame", this.connectedUsers.get(this.players[this.id][1].id));
                this.eventEmitter.emit("refreshStatus");
                this.game.push(newGame);
                this.rooms = Object.fromEntries(Object.entries(this.rooms)
                    .filter(([roomId, players]) => !players.includes(socket.id)));
                this.gameService.startTheGame(this.game[this.id].players, this.game[this.id].rooms, availibleRoomId, this.server, this.game[this.id].ball, this.canvas);
            }
            else {
                this.id++;
                const newRoomId = socket.id;
                this.rooms[newRoomId] = [socket.id];
                socket.join(newRoomId);
                if (!this.players[this.id]) {
                    this.players[this.id] = [];
                }
                if (this.players[this.id].length == 0)
                    this.players[this.id].push({ id: socket.id, playerNb: 1, x: 0, y: 175, score: 0, width: 20, height: 100, name: "player1", giveUp: false, db_id: token_id.sub, pic: "", g_id: "" });
            }
        });
    }
    handleEvent(data, client) {
        this.canvas.height = data.height;
        this.canvas.width = data.width;
    }
    handleArrowMove(data, socket) {
        const id = this.gameService.findNbById(this.game, socket.id);
        this.gameService.handleArrowMove(data, socket.id, this.game[id].players);
    }
    handleMouseMove(data, socket) {
        const id = this.gameService.findNbById(this.game, socket.id);
        this.gameService.handleMouseMove(data, socket.id, this.game[id].players);
    }
    PlayAgain(data, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            this.gameService.resetBall(this.ball, this.canvas);
            this.gameService.ResetScore(this.players[this.id]);
        });
    }
    handle_id(id, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const g_id = "";
            this.gameService.handle_id(id, g_id, client.id, this.game);
        });
    }
    handleDisconnect(client) {
        this.connectedUsers.delete(client.id);
        this.players = this.gameService.deletePlayerFromPlayers(this.players, client.id);
        this.rooms = Object.fromEntries(Object.entries(this.rooms)
            .filter(([roomId, players]) => !players.includes(client.id)));
        this.id = this.gameService.removeDataFromRooms(this.game, client.id, this.id, this.server);
    }
};
exports.RandomFriendGateway = RandomFriendGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RandomFriendGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('connecte'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RandomFriendGateway.prototype, "handleConnection", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('canvas_data'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RandomFriendGateway.prototype, "handleEvent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('arrow_move'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RandomFriendGateway.prototype, "handleArrowMove", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mouse_move'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RandomFriendGateway.prototype, "handleMouseMove", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('play_again'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RandomFriendGateway.prototype, "PlayAgain", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('user_id'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RandomFriendGateway.prototype, "handle_id", null);
exports.RandomFriendGateway = RandomFriendGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ path: '/game', cors: true }),
    __metadata("design:paramtypes", [random_friend_service_1.GameRandomService, user_service_1.UserService, event_emitter_1.EventEmitter2])
], RandomFriendGateway);
//# sourceMappingURL=random-friend.gateway.js.map