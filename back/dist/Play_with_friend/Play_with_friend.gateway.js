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
exports.PlayFriendGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const Play_with_friend_service_1 = require("./Play_with_friend.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const user_service_1 = require("../user/user.service");
let status = new Map();
let PlayFriendGateway = class PlayFriendGateway {
    constructor(gameService, userService, eventEmitter) {
        this.gameService = gameService;
        this.userService = userService;
        this.eventEmitter = eventEmitter;
        this.game = [];
        this.id = 0;
        this.rooms = {};
        this.ball = { color: "WHITE", radius: 15, speed: 0.9, velocityX: 5, velocityY: 5, x: 450, y: 225 };
        this.canvas = { height: 0, width: 0 };
        this.players = [];
        this.ids = [];
        this.opponents = [];
        this.connectedUsers = new Map();
        this.acc_rqst = new Map();
        this.acc_r = [];
    }
    ;
    handleConnection(socket) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = socket.handshake.query.token;
            const senderId = socket.handshake.query.id;
            const tar = socket.handshake.query.tar;
            if (token && token == "token_data") {
                this.acc_rqst.set(tar, senderId);
                return;
            }
            else if (token && token == "token_d") {
                const send = socket.handshake.query.send;
                status.set(send, "yes");
                for (const [key, val] of this.acc_rqst.entries()) {
                    if (val === tar) {
                        this.acc_rqst.delete(key);
                    }
                }
                this.acc_rqst.set(send, tar);
                return;
            }
            const token_id = this.gameService.getUserInfosFromToken(token);
            let user;
            if (token_id)
                user = yield this.userService.getUser(token_id.sub);
            const existingUser = Array.from(this.connectedUsers.values());
            if (!user)
                return;
            if (existingUser.includes(token_id.sub) || user.status === "inGame") {
                socket.emit("already_in_game");
                socket.disconnect();
                return;
            }
            this.connectedUsers.set(socket.id, token_id.sub);
            const index = this.gameService.findIndexBySenderId(this.game, senderId, this.acc_rqst);
            if (index != -1 && (status.get(token_id.sub) === "yes")) {
                status.set(token_id.sub, "no");
                const availibleRoomId = Object.keys(this.game[index].rooms).find(roomId => this.game[index].rooms[roomId].length == 1);
                if (!availibleRoomId)
                    return;
                this.game[index].rooms[availibleRoomId].push(socket.id);
                socket.join(availibleRoomId);
                this.server.to(availibleRoomId).emit("start");
                this.game[index].players.push({ id: socket.id, playerNb: 2, x: 880, y: 175, score: 0, width: 20, height: 100, name: "player2", giveUp: false, db_id: "", pic: "", g_id: "", opponent_id: "" });
                this.userService.updateProfile("inGame", this.connectedUsers.get(this.game[index].players[0].id));
                this.userService.updateProfile("inGame", this.connectedUsers.get(this.game[index].players[1].id));
                this.eventEmitter.emit("refreshStatus");
                this.gameService.handle_id(senderId, "", socket.id, this.game);
                this.gameService.removeInviteToPlay(this.game[index].players);
                this.game[index].players[0].db_id = senderId;
                this.gameService.startTheGame(this.game[index].players, this.game[index].rooms, availibleRoomId, this.server, this.game[index].ball, this.canvas);
            }
            else {
                const newRoomId = socket.id;
                this.rooms[newRoomId] = [socket.id];
                socket.join(newRoomId);
                this.players.push({ id: newRoomId, playerNb: 1, x: 0, y: 175, score: 0, width: 20, height: 100, name: "player1", giveUp: false, db_id: senderId, pic: "", g_id: "", opponent_id: tar });
                const index = Object.keys(this.players);
                let newBall = Object.assign({}, this.ball);
                const newGame = {
                    nb: this.id,
                    ball: newBall,
                    players: [],
                    rooms: this.rooms,
                };
                newGame.players.push(this.players[index[0]]);
                this.game.push(newGame);
                this.players = [];
                this.rooms = {};
                this.id++;
                this.gameService.handle_id(senderId, "", socket.id, this.game);
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
    handle_id(id, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const g_id = "";
            this.gameService.handle_id(id, g_id, client.id, this.game);
        });
    }
    handle_status_yes(data, client) {
        status.set(data, "yes");
    }
    handleDisconnect(client) {
        this.connectedUsers.delete(client.id);
        this.id = this.gameService.removeDataFromRooms(this.game, client.id, this.id, this.server, this.acc_rqst);
        this.players = [];
        this.rooms = {};
        const indexs = Object.keys(this.game);
        for (let i = 0; i < this.game.length; i++) {
            this.game[indexs[i]].nb = i;
        }
        this.id = this.game.length;
    }
};
exports.PlayFriendGateway = PlayFriendGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], PlayFriendGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('connecte'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], PlayFriendGateway.prototype, "handleConnection", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('canvas_data'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], PlayFriendGateway.prototype, "handleEvent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('arrow_move'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], PlayFriendGateway.prototype, "handleArrowMove", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mouse_move'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], PlayFriendGateway.prototype, "handleMouseMove", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('user_id'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], PlayFriendGateway.prototype, "handle_id", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('checker_y'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], PlayFriendGateway.prototype, "handle_status_yes", null);
exports.PlayFriendGateway = PlayFriendGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ path: '/play', cors: true }),
    __metadata("design:paramtypes", [Play_with_friend_service_1.GameService, user_service_1.UserService, event_emitter_1.EventEmitter2])
], PlayFriendGateway);
//# sourceMappingURL=Play_with_friend.gateway.js.map