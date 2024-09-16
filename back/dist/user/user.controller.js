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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const prisma_service_1 = require("../prisma.service");
const fuse_js_1 = __importDefault(require("fuse.js"));
const event_emitter_1 = require("@nestjs/event-emitter");
const user_service_1 = require("./user.service");
const chat_service_1 = require("../chat/chat.service");
const user_dto_1 = require("./user.dto");
let UserController = class UserController {
    constructor(prisma, eventEmitter, UserService, ChatService) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.UserService = UserService;
        this.ChatService = ChatService;
    }
    Getme(req, res, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                return yield res.send({ info: true, user: user });
            }
            catch (e) {
                return yield res.send({ info: false, message: "Error while getting user" });
            }
        });
    }
    Getdyali(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.userExists(userId);
        });
    }
    changeUsername(req, res, userDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const isNameAlreadyExistes = yield this.UserService.userNameCheck(userDto.username);
            const user = yield this.UserService.getUser(userDto.id);
            if (user.username !== userDto.username && isNameAlreadyExistes)
                throw new common_1.UnauthorizedException('Name already taken');
            try {
                const user = req.user;
                yield this.prisma.user.update({
                    where: { id: userDto.id },
                    data: { username: userDto.username, firstName: userDto.firstName, lastName: userDto.lastName, avatar: userDto.avatar }
                });
                return yield res.send({ info: true, message: "Username updated successfully" });
            }
            catch (e) {
                return yield res.send({ info: false, message: "Error while updating username" });
            }
        });
    }
    getUserByUserId(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user || user === "undefined")
                return;
            const users = yield this.prisma.getUserByUserId(user);
            if (!users)
                throw new common_1.NotFoundException("User not found");
            return users;
        });
    }
    getAllUsers(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.prisma.getAllUsers();
            const options = {
                keys: ['username', 'firstName', 'lastName'],
                threshold: 0.2
            };
            const fuse = new fuse_js_1.default(users, options);
            const filtered = fuse.search(input).map((elem) => elem.item);
            const modifiedFiltered = filtered.map(user => {
                const { twoFactorAuthCode, twoFactorAuthEnabled, firstLogin } = user, rest = __rest(user, ["twoFactorAuthCode", "twoFactorAuthEnabled", "firstLogin"]);
                return rest;
            });
            return modifiedFiltered;
        });
    }
    sendFriendRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.UserService.getUser(req.target);
            if (!user)
                return;
            const isRequestExist = yield this.UserService.isRequestExist(req.target, req.sender);
            if (isRequestExist && isRequestExist.status === "Declined")
                yield this.UserService.pendFriendRequest(isRequestExist.id, req.sender, req.target);
            else
                yield this.UserService.createFriendRequest(req.target, req.sender);
            this.eventEmitter.emit("refreshNotifications");
            this.eventEmitter.emit("refreshfriendShip");
        });
    }
    sendPlayAgain(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.UserService.getUser(req.target);
            if (!user)
                return;
            const isRequestExist = yield this.UserService.isPlayRequest(req.sender);
            if (isRequestExist)
                yield this.UserService.deletePlayRequest(req.sender);
            yield this.UserService.createPlayRequest(req.target, req.sender);
            this.eventEmitter.emit("refreshNotifications");
            this.eventEmitter.emit("refreshfriendShip");
        });
    }
    acceptFriendRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const isExiste = yield this.UserService.isRequestExistAndPending(req.notif.id, req.myId);
            if (isExiste !== 1)
                return;
            yield this.UserService.acceptFriendRequest(req.notif.id);
            yield this.UserService.makeFriends1(req.myId, req.notif.senderId);
            yield this.UserService.makeFriends2(req.myId, req.notif.senderId);
            yield this.ChatService.createDM(req.myId, req.notif.senderId);
            this.eventEmitter.emit("refreshNotifications");
            this.eventEmitter.emit("refreshfriendShip");
        });
    }
    declineFriendRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const isExiste = yield this.UserService.isRequestExistAndPending(req.notif.id, req.myId);
            if (isExiste !== 1)
                return;
            yield this.UserService.declineFriendRequest(req.notif.id);
            this.eventEmitter.emit("refreshNotifications");
            this.eventEmitter.emit("refreshfriendShip");
        });
    }
    acceptInviteToPlay(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const isExiste = yield this.UserService.isRequestExistAndPendingToPlay(req.notif.id, req.myId);
            if (isExiste !== 1)
                return;
            yield this.UserService.acceptInviteToPlay(req.notif.id);
            this.eventEmitter.emit("refreshNotifications");
            this.eventEmitter.emit("refreshfriendShip");
        });
    }
    declineInviteToPlay(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const isExiste = yield this.UserService.isRequestExistAndPendingToPlay(req.notif.id, req.myId);
            if (isExiste !== 1)
                return;
            yield this.UserService.declineInviteToPlay(req.notif.id);
            this.eventEmitter.emit("refreshNotifications");
            this.eventEmitter.emit("refreshfriendShip");
        });
    }
    getMyNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const myNotifications = yield this.UserService.getMyNotifications(userId);
            return myNotifications;
        });
    }
    getInviteToPlay(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const myNotifications = yield this.UserService.getInviteToPlay(userId);
            return myNotifications;
        });
    }
    requestStatus(myId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield this.UserService.isRequestExist(myId, receiverId);
            if (!request)
                return 0;
            return request;
        });
    }
    checkIfFriend(myId, otherUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkIfFriend = yield this.UserService.checkIfFriend(myId, otherUser);
            return (checkIfFriend);
        });
    }
    blockUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.UserService.getUser(req.target);
            if (!user)
                return;
            const isRequestExist = yield this.UserService.isRequestExist(req.myId, req.target);
            if (isRequestExist) {
                const checkIfFriend = yield this.UserService.checkIfFriend(req.myId, req.target);
                if (checkIfFriend) {
                    yield this.UserService.removeFriendShip1(isRequestExist.senderId, isRequestExist.receiverId);
                    yield this.UserService.removeFriendShip2(isRequestExist.receiverId, isRequestExist.senderId);
                }
                yield this.UserService.removeFriendRequest(isRequestExist.id);
            }
            ;
            yield this.UserService.blockedUsers(req.myId, req.target);
            yield this.UserService.blockedByUsers(req.myId, req.target);
            this.eventEmitter.emit("refreshfriendShip");
            this.eventEmitter.emit("refreshNotifications");
        });
    }
    UnblockUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.UserService.getUser(req.target);
            if (!user)
                return;
            const isBlocked = yield this.UserService.getIsBlocked(req.myId, req.target);
            const isBlockedBy = yield this.UserService.getIsBlockedBy(req.myId, req.target);
            if (!isBlocked || !isBlockedBy)
                return;
            yield this.UserService.unblockBlockedUsers(req.myId, req.target);
            yield this.UserService.removekBlockedByUsers(req.myId, req.target);
            this.eventEmitter.emit("refreshfriendShip");
            this.eventEmitter.emit("refreshNotifications");
        });
    }
    Accept(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.UserService.getUser(req.target);
            if (!user)
                return;
            const isRequestExist = yield this.UserService.isRequestExist(req.myId, req.receiverId);
            req.notif = isRequestExist;
            if (isRequestExist)
                this.acceptFriendRequest(req);
        });
    }
    displayFriends(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId || userId === "undefined")
                return;
            const friendsList = yield this.UserService.friendList(userId);
            if (!friendsList)
                return;
            return friendsList;
        });
    }
    myBlockList(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            const blocklist = yield this.UserService.blocklist(myId);
            const combinedBlockedUsers = [...blocklist.blockedByUsers, ...blocklist.blockedUsers];
            return combinedBlockedUsers;
        });
    }
    lastGames(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastGames = yield this.UserService.getGameResult(userId);
            return lastGames;
        });
    }
    achievements(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameResult = yield this.UserService.getGameResult(userId);
            let check = 0;
            for (let i = 0; i < gameResult.length; i++) {
                if (gameResult[i].userId === userId && gameResult[i].status === "win") {
                    check++;
                }
            }
            if (check >= 3) {
                this.UserService.getAchievements(userId, "achiev1");
            }
            if (check >= 5) {
                this.UserService.getAchievements(userId, "achiev2");
            }
            if (check >= 7) {
                this.UserService.getAchievements(userId, "achiev3");
            }
            if (check >= 15) {
                this.UserService.getAchievements(userId, "achiev4");
            }
            if (check >= 20) {
                this.UserService.getAchievements(userId, "achiev5");
            }
            if (check >= 25) {
                this.UserService.getAchievements(userId, "achiev6");
            }
            return check;
        });
    }
    getAllAchievements(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const allAchievements = yield this.UserService.getAllAchievements(userId);
            return allAchievements;
        });
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "Getme", null);
__decorate([
    (0, common_1.Get)('dyali'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "Getdyali", null);
__decorate([
    (0, common_1.Post)('changeInfos'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, user_dto_1.UserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changeUsername", null);
__decorate([
    (0, common_1.Get)('getUserByUserId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserByUserId", null);
__decorate([
    (0, common_1.Get)('getAllUsers'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Post)('sendFriendRequest'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "sendFriendRequest", null);
__decorate([
    (0, common_1.Post)('sendPlayAgain'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "sendPlayAgain", null);
__decorate([
    (0, common_1.Post)('acceptFriendRequest'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "acceptFriendRequest", null);
__decorate([
    (0, common_1.Post)('declineFriendRequest'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "declineFriendRequest", null);
__decorate([
    (0, common_1.Post)('acceptInviteToPlay'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "acceptInviteToPlay", null);
__decorate([
    (0, common_1.Post)('declineInviteToPlay'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "declineInviteToPlay", null);
__decorate([
    (0, common_1.Get)('getMyNotifications'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyNotifications", null);
__decorate([
    (0, common_1.Get)('getInviteToPlay'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getInviteToPlay", null);
__decorate([
    (0, common_1.Get)('requestStatus'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)('myId')),
    __param(1, (0, common_1.Query)('receiverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "requestStatus", null);
__decorate([
    (0, common_1.Get)('checkIfFriend'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)('myId')),
    __param(1, (0, common_1.Query)('receiverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "checkIfFriend", null);
__decorate([
    (0, common_1.Post)('blockUser'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Post)('UnblockUser'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "UnblockUser", null);
__decorate([
    (0, common_1.Post)('accept'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "Accept", null);
__decorate([
    (0, common_1.Get)('userFreinds'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "displayFriends", null);
__decorate([
    (0, common_1.Get)('myBlockList'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)("myId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "myBlockList", null);
__decorate([
    (0, common_1.Get)('lastGames'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "lastGames", null);
__decorate([
    (0, common_1.Get)('achievements'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "achievements", null);
__decorate([
    (0, common_1.Get)('getAllAchievements'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllAchievements", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, event_emitter_1.EventEmitter2, user_service_1.UserService, chat_service_1.ChatService])
], UserController);
//# sourceMappingURL=user.controller.js.map