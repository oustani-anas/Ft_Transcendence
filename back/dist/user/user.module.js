"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const user_controller_1 = require("./user.controller");
const prisma_service_1 = require("../prisma.service");
const user_gateway_1 = require("./user.gateway");
const event_emitter_1 = require("@nestjs/event-emitter");
const chat_module_1 = require("../chat/chat.module");
const jwt_1 = require("@nestjs/jwt");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [event_emitter_1.EventEmitterModule.forRoot(), chat_module_1.ChatModule],
        providers: [user_gateway_1.UserGateway, prisma_service_1.PrismaService, user_service_1.UserService, jwt_1.JwtService],
        controllers: [user_controller_1.UserController]
    })
], UserModule);
//# sourceMappingURL=user.module.js.map