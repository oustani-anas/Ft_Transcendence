"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModule = void 0;
const common_1 = require("@nestjs/common");
const random_friend_gateway_1 = require("./random-friend.gateway");
const random_friend_service_1 = require("./random-friend.service");
const user_service_1 = require("../user/user.service");
const prisma_service_1 = require("../prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let GameModule = class GameModule {
};
exports.GameModule = GameModule;
exports.GameModule = GameModule = __decorate([
    (0, common_1.Module)({
        imports: [event_emitter_1.EventEmitterModule.forRoot()],
        providers: [random_friend_gateway_1.RandomFriendGateway, random_friend_service_1.GameRandomService, user_service_1.UserService, prisma_service_1.PrismaService],
    })
], GameModule);
//# sourceMappingURL=game.module.js.map