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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FortyTwoStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_42_1 = __importDefault(require("passport-42"));
const prisma_service_1 = require("../../prisma.service");
const auth_service_1 = require("../auth.service");
let FortyTwoStrategy = class FortyTwoStrategy extends (0, passport_1.PassportStrategy)(passport_42_1.default, '42') {
    constructor(prisma, service) {
        super({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
        });
        this.prisma = prisma;
        this.service = service;
    }
    authenticate(request, options) {
        const _super = Object.create(null, {
            authenticate: { get: () => super.authenticate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (request.query && request.query.error === 'access_denied') {
                return request.res.redirect('http://localhost:3000');
            }
            return _super.authenticate.call(this, request, options);
        });
    }
    validate(accessToken, refreshToken, profile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = {
                    id: profile._json.id,
                    username: profile._json.login,
                    avatar: profile._json.image.link,
                    firstName: profile._json.first_name,
                    lastName: profile._json.last_name,
                    twoFactorAuthEnabled: profile._json.twoFactorAuthEnabled,
                };
                const user = yield this.service.findOrCreate(dto);
                if (!user) {
                    throw new common_1.UnauthorizedException('User not found');
                }
                return user;
            }
            catch (error) {
                throw new common_1.UnauthorizedException('Failed to authenticate with FortyTwo');
            }
        });
    }
};
exports.FortyTwoStrategy = FortyTwoStrategy;
exports.FortyTwoStrategy = FortyTwoStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], FortyTwoStrategy);
//# sourceMappingURL=42strategy.js.map