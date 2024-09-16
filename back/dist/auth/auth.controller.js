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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma.service");
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode = __importStar(require("qrcode"));
const console_1 = require("console");
const auth_dto_1 = require("./dtos/auth.dto");
let AuthController = class AuthController {
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    login() { }
    ft_redirect(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("youwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwt awa");
            const payload = { sub: req.user.id };
            if (req.user.firstLogin) {
                const token = yield this.jwtService.signAsync(payload);
                res.cookie("JWT_TOKEN", token);
                yield this.prisma.user.update({
                    where: { id: req.user.id },
                    data: { firstLogin: false },
                });
                return res.redirect(`${process.env.CLIENT_URL}/Settings`);
            }
            else if (req.user.twoFactorAuthEnabled) {
                res.cookie("USER_ID", req.user.id);
                return res.redirect(`${process.env.CLIENT_URL}/QRcode`);
            }
            const token = yield this.jwtService.signAsync(payload);
            res.cookie("JWT_TOKEN", token);
            return res.redirect(`${process.env.CLIENT_URL}/Profile`);
        });
    }
    ft_logout(res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.clearCookie("JWT_TOKEN");
            res.status(200).json({ redirect: `${process.env.CLIENT_URL}` });
        });
    }
    generateTwoFactorAuthCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            if (!user.twoFactorAuthCode) {
                user.twoFactorAuthCode = speakeasy_1.default.generateSecret();
                yield this.prisma.user.update({
                    where: { id: user.id },
                    data: { twoFactorAuthCode: user.twoFactorAuthCode.base32 },
                });
            }
            if (user.twoFactorAuthCode) {
                const otpauthUrl = speakeasy_1.default.otpauthURL({
                    secret: user.twoFactorAuthCode,
                    label: "MyApp",
                    issuer: "MyCompany",
                    encoding: "base32",
                });
                const qrCodeImageUrl = yield qrcode.toDataURL(otpauthUrl);
                return res.json({ qrCodeImageUrl });
            }
        });
    }
    verifyTwoFactorAuthCode(req, res, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findFirst({
                where: { id: req.cookies.USER_ID },
            });
            const isVerified = speakeasy_1.default.totp.verify({
                secret: user.twoFactorAuthCode,
                encoding: "base32",
                token: code.code,
            });
            (0, console_1.log)("isVerified", isVerified);
            if (isVerified) {
                const payload = { sub: req.cookies.USER_ID };
                const token = yield this.jwtService.signAsync(payload);
                res.cookie("JWT_TOKEN", token);
                return res.json({ message: "User is verified" });
            }
            else {
                return res.status(400).json({ message: "Invalid token" });
            }
        });
    }
    enableTwoFactorAuth(req, res, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            (0, console_1.log)("userMosaaaaaaaaaaapahah", user);
            if (user.twoFactorAuthEnabled) {
                return res.json({
                    status: true,
                    message: "Two-factor authentication is already enabled",
                });
            }
            const isVerified = speakeasy_1.default.totp.verify({
                secret: user.twoFactorAuthCode,
                encoding: "base32",
                token: body.code,
            });
            if (isVerified) {
                yield this.prisma.user.update({
                    where: { id: user.id },
                    data: { twoFactorAuthEnabled: true },
                });
                return res.json({
                    status: true,
                    message: "Two-factor authentication is enabled",
                });
            }
            else {
                return res.status(400).json();
            }
        });
    }
    disableTwoFactorAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            if (!user.twoFactorAuthEnabled) {
                return res.json({
                    message: "Two-factor authentication is already disabled",
                });
            }
            yield this.prisma.user.update({
                where: { id: user.id },
                data: { twoFactorAuthEnabled: false },
            });
            return res.json({ message: "Two-factor authentication is disabled" });
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)("42"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("42")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)("redirect"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("42")),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "ft_redirect", null);
__decorate([
    (0, common_1.Get)("logout"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "ft_logout", null);
__decorate([
    (0, common_1.Post)("generateTwoFactorAuthCode"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generateTwoFactorAuthCode", null);
__decorate([
    (0, common_1.Post)("verifyTwoFactorAuthCode"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, auth_dto_1.code]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyTwoFactorAuthCode", null);
__decorate([
    (0, common_1.Post)("enableTwoFactorAuth"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, auth_dto_1.code]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enableTwoFactorAuth", null);
__decorate([
    (0, common_1.Post)("disableTwoFactorAuth"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disableTwoFactorAuth", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map