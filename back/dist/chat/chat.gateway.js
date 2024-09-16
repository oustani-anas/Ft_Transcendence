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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const bcrypt = __importStar(require("bcrypt"));
const jsonwebtoken_1 = require("jsonwebtoken");
let ChatGateway = class ChatGateway {
    constructor(chatService) {
        this.chatService = chatService;
    }
    handleSendMessage(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, jsonwebtoken_1.verify)(payload.token, `${process.env.SECRET_KEY}`);
                const roomData = yield this.chatService.getRoom(payload.roomId);
                if (!roomData)
                    return;
                const user = yield this.chatService.getUser(payload.userId);
                if (!user)
                    return;
                if ((yield this.chatService.checkIfBanned(payload.userId, payload.roomId)) === 1)
                    return;
                if ((yield this.chatService.checkIfMuted(payload.userId, payload.roomId)) === 1)
                    return;
                yield this.chatService.addMessagesToRoom(payload);
                const message = yield this.chatService.getGroupMessages(payload.roomId);
                this.server.to(payload.roomId).emit('getAllMessages', message, payload.roomId);
            }
            catch (error) {
                return;
            }
        });
    }
    handleJoiningGroupChat(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, jsonwebtoken_1.verify)(payload.token, `${process.env.SECRET_KEY}`);
                if ((yield this.chatService.checkIfBanned(payload.userId, payload.groupId)) === 1) {
                    client.emit("banned", `You are banned on that channel`);
                    return;
                }
                if ((yield this.chatService.checkIfMember(payload.userId, payload.groupId)) === 1) {
                    client.emit("alreadyJoined", `You are already on that channel`);
                    return;
                }
                const groupData = yield this.chatService.getRoom(payload.groupId);
                if (payload.password && !(yield bcrypt.compare(payload.password, groupData.password))) {
                    client.emit("joinFailed", "Wrong Password");
                    return;
                }
                yield this.chatService.addRoomToUser(payload.userId, payload.groupId);
                yield this.chatService.addUserToRoom(payload.userId, payload.groupId);
                client.join(payload.groupId);
                client.emit("joinSuccessfull", `You Joined ${payload.roomName}`);
                this.server.emit("refresh");
            }
            catch (error) {
                return;
            }
        });
    }
    kick(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, jsonwebtoken_1.verify)(payload.token, `${process.env.SECRET_KEY}`);
                payload.message = `announcement ${payload.username} has kicked ${payload.target_username} from this room`;
                if ((yield this.chatService.kickUserFromRoom(payload.target, payload.roomId)) === -1)
                    return;
                yield this.handleSendMessage(client, payload);
                this.server.to(payload.roomId).emit("refresh");
                const roomData = yield this.chatService.getRoom(payload.roomId);
                client.to(payload.roomId).emit("redirectToChatPage", payload.target, roomData.name, payload.roomId, "kicked");
            }
            catch (error) {
                return;
            }
        });
    }
    Mute(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, jsonwebtoken_1.verify)(payload.token, `${process.env.SECRET_KEY}`);
                payload.message = `announcement ${payload.username} has muted ${payload.target_username}`;
                const timestampIn60Seconds = new Date();
                timestampIn60Seconds.setSeconds(timestampIn60Seconds.getSeconds() + 60);
                yield this.chatService.MuteUserFromRoom(`${payload.target} ${timestampIn60Seconds.getTime()}`, payload.roomId);
                yield this.handleSendMessage(client, payload);
                this.server.to(payload.roomId).emit("refresh");
            }
            catch (error) {
                return;
            }
        });
    }
    Ban(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, jsonwebtoken_1.verify)(payload.token, `${process.env.SECRET_KEY}`);
                payload.message = `announcement ${payload.username} has banned ${payload.target_username}`;
                yield this.chatService.banUserFromRoom(payload.target, payload.roomId);
                yield this.handleSendMessage(client, payload);
                this.server.to(payload.roomId).emit("refresh");
                const roomData = yield this.chatService.getRoom(payload.roomId);
                client.to(payload.roomId).emit("redirectToChatPage", payload.target, roomData.name, payload.roomId, "banned");
            }
            catch (error) {
                return;
            }
        });
    }
    Unmute(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, jsonwebtoken_1.verify)(payload.token, `${process.env.SECRET_KEY}`);
                if ((yield this.chatService.checkIfMuted(payload.target, payload.roomId)) !== 1) {
                    this.server.to(payload.roomId).emit("alreadyUnmuted", payload.userId);
                    return;
                }
                payload.message = `announcement ${payload.username} has unmuted ${payload.target_username}`;
                yield this.chatService.UnmuteUserFromRoom(payload.target, payload.roomId);
                yield this.handleSendMessage(client, payload);
                this.server.to(payload.roomId).emit("refresh");
            }
            catch (error) {
                return;
            }
        });
    }
    makeAdmin(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, jsonwebtoken_1.verify)(payload.token, `${process.env.SECRET_KEY}`);
                payload.message = `announcement ${payload.target_username} in now an admin on this room`;
                yield this.chatService.makeAdminOnRoom(payload.target, payload.roomId);
                yield this.handleSendMessage(client, payload);
                this.server.to(payload.roomId).emit("refresh");
            }
            catch (error) {
                return;
            }
        });
    }
    removeAdmin(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, jsonwebtoken_1.verify)(payload.token, `${process.env.SECRET_KEY}`);
                payload.message = `announcement ${payload.target_username} in no longer an admin on this room`;
                yield this.chatService.removeAdminOnRoom(payload.target, payload.roomId);
                yield this.handleSendMessage(client, payload);
                this.server.to(payload.roomId).emit("refresh");
            }
            catch (error) {
                return;
            }
        });
    }
    setRoomToPublic(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, jsonwebtoken_1.verify)(payload.token, `${process.env.SECRET_KEY}`);
                const roomData = yield this.chatService.getRoom(payload.roomId);
                if (!roomData)
                    return;
                yield this.chatService.setRoomToPublic(payload.roomId);
                yield this.handleSendMessage(client, payload);
                this.server.to(payload.roomId).emit('refresh', "Public", roomData.name);
                this.server.emit('refreshJoinComp');
            }
            catch (error) {
                return;
            }
        });
    }
    setRoomToProtected(client, payload, roomName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, jsonwebtoken_1.verify)(payload.token, `${process.env.SECRET_KEY}`);
                const roomData = yield this.chatService.getRoom(payload.roomId);
                if (!roomData)
                    return;
                yield this.handleSendMessage(client, payload);
                this.server.to(payload.roomId).emit('refresh', "Protected", roomName);
                this.server.emit('refreshJoinComp');
            }
            catch (error) {
                return;
            }
        });
    }
    changePassword() {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.emit('refreshJoinComp');
        });
    }
    leave(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, jsonwebtoken_1.verify)(payload.token, `${process.env.SECRET_KEY}`);
                payload.message = `announcement ${payload.username} has left the room`;
                yield this.chatService.kickUserFromRoom(payload.userId, payload.roomId);
                yield this.handleSendMessage(client, payload);
                this.server.emit('left');
            }
            catch (error) {
                return;
            }
        });
    }
    addSocketToThisUserRoom(client, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            client.join(roomId);
        });
    }
    handleConnection(client) {
    }
    handleDisconnect(client) {
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinGroupChat'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoiningGroupChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('kick'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "kick", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mute'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Mute", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ban'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Ban", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unmute'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Unmute", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('makeAdmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "makeAdmin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('removeAdmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "removeAdmin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('setRoomToPublic'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "setRoomToPublic", null);
__decorate([
    (0, event_emitter_1.OnEvent)('setRoomToProtected'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "setRoomToProtected", null);
__decorate([
    (0, event_emitter_1.OnEvent)('changeRoomPassword'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "changePassword", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "leave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('addSocketToThisUserRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "addSocketToThisUserRoom", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: true,
            methods: ["GET", "POST"],
        },
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map