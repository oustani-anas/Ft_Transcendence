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
exports.UserGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const user_service_1 = require("./user.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_1 = require("@nestjs/jwt");
let UserGateway = class UserGateway {
    constructor(UserService, jwt) {
        this.UserService = UserService;
        this.jwt = jwt;
    }
    refreshNotifications(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.emit("refreshFrontNotifications");
        });
    }
    refreshfriendShip(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.emit("refreshFrontfriendShip");
            this.server.emit("refresh");
        });
    }
    refreshChat(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.emit("refreshChatFront");
        });
    }
    refreshStatus(client, type, id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.emit("refreshStatus", type, id);
        });
    }
    acceptRequest(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    declineRequest(client, payload) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    refreshAll(client) {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.emit("refreshAllInFront");
        });
    }
    customDisco(client) {
        return __awaiter(this, void 0, void 0, function* () {
            this.UserService.removeUserSocket(client.data.userId, client);
        });
    }
    handleConnection(client) {
        var _a;
        try {
            const token = (_a = client.handshake.auth.jwt_token) !== null && _a !== void 0 ? _a : client.handshake.headers.jwt_token;
            const payload = this.jwt.verify(token, {
                secret: `${process.env.SECRET_KEY}`
            });
            const userId = payload.sub;
            client.data.userId = userId;
            this.UserService.addUserSocket(userId, client);
        }
        catch (error) {
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        this.UserService.removeUserSocket(client.data.userId, client);
    }
};
exports.UserGateway = UserGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], UserGateway.prototype, "server", void 0);
__decorate([
    (0, event_emitter_1.OnEvent)('refreshNotifications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], UserGateway.prototype, "refreshNotifications", null);
__decorate([
    (0, event_emitter_1.OnEvent)('refreshfriendShip'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], UserGateway.prototype, "refreshfriendShip", null);
__decorate([
    (0, event_emitter_1.OnEvent)('refreshChat'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], UserGateway.prototype, "refreshChat", null);
__decorate([
    (0, event_emitter_1.OnEvent)('refreshStatus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UserGateway.prototype, "refreshStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('acceptRequest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], UserGateway.prototype, "acceptRequest", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('declineRequest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], UserGateway.prototype, "declineRequest", null);
__decorate([
    (0, event_emitter_1.OnEvent)('refreshAll'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], UserGateway.prototype, "refreshAll", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('customDisco'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], UserGateway.prototype, "customDisco", null);
exports.UserGateway = UserGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: true,
            methods: ["GET", "POST"],
        },
    }),
    __metadata("design:paramtypes", [user_service_1.UserService, jwt_1.JwtService])
], UserGateway);
//# sourceMappingURL=user.gateway.js.map