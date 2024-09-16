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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let UserService = class UserService {
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.userSocketMap = {};
    }
    addUserSocket(userId, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.userSocketMap[userId])
                this.userSocketMap[userId].push(socket);
            else
                this.userSocketMap[userId] = [socket];
            this.updateProfile("Online", userId);
            this.eventEmitter.emit("refreshStatus");
        });
    }
    removeUserSocket(userId, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.userSocketMap[userId]) {
                this.userSocketMap[userId] = this.userSocketMap[userId].filter((s) => s !== socket);
                if (this.userSocketMap[userId].length === 0) {
                    this.updateProfile("Offline", userId);
                    this.eventEmitter.emit('refreshStatus', "lkhwa", "logOut", this.userSocketMap[userId]);
                }
            }
        });
    }
    getUser(target) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.findUnique({
                where: { id: target }
            });
        });
    }
    updateProfile(status, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.getUser(userId)))
                return;
            return this.prisma.user.update({
                where: { id: userId },
                data: { status: status }
            });
        });
    }
    userNameCheck(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.count({
                where: { username: name }
            });
        });
    }
    createFriendRequest(target, sender) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.friendRequest.create({
                data: {
                    senderId: sender,
                    receiverId: target,
                    status: "Pending"
                },
            });
        });
    }
    createPlayRequest(target, sender) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.inviteToPlay.create({
                data: {
                    senderId: sender,
                    receiverId: target,
                    status: "Pending"
                },
            });
        });
    }
    isAlreadySent(target, sender) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.friendRequest.count({
                where: { receiverId: target, senderId: sender },
            });
        });
    }
    getMyNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.friendRequest.findMany({
                where: {
                    OR: [
                        { receiverId: userId },
                        { senderId: userId }
                    ]
                },
                include: {
                    sender: true,
                    receiver: true
                },
                orderBy: { updatedAt: 'desc' }
            });
        });
    }
    getInviteToPlay(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.inviteToPlay.findMany({
                where: {
                    OR: [
                        { receiverId: userId },
                        { senderId: userId }
                    ]
                },
                include: {
                    sender: true,
                    receiver: true
                }
            });
        });
    }
    isRequestExistAndPending(notifId, myId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.friendRequest.count({
                where: {
                    id: notifId,
                    status: "Pending",
                    OR: [
                        { receiverId: myId },
                        { senderId: myId }
                    ]
                },
            });
        });
    }
    isRequestExistAndPendingToPlay(notifId, myId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.inviteToPlay.count({
                where: {
                    id: notifId,
                    status: "Pending",
                    receiverId: myId
                },
            });
        });
    }
    isRequestExist(myId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.friendRequest.findFirst({
                where: {
                    OR: [
                        { receiverId: receiverId, senderId: myId, },
                        { receiverId: myId, senderId: receiverId, }
                    ]
                },
            });
        });
    }
    deletePlayRequest(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.inviteToPlay.deleteMany({
                where: {
                    senderId: myId
                },
            });
        });
    }
    isPlayRequest(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.inviteToPlay.findFirst({
                where: {
                    senderId: myId,
                },
            });
        });
    }
    pendFriendRequest(notifId, sender, target) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.friendRequest.update({
                where: { id: notifId },
                data: {
                    senderId: sender,
                    receiverId: target,
                    status: "Pending"
                }
            });
        });
    }
    pendPlayRequest(notifId, sender, target) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.inviteToPlay.update({
                where: { id: notifId },
                data: {
                    senderId: sender,
                    receiverId: target,
                    status: "Pending"
                }
            });
        });
    }
    acceptFriendRequest(notifId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.friendRequest.update({
                where: { id: notifId },
                data: {
                    status: "Accepted",
                }
            });
        });
    }
    declineFriendRequest(notifId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.friendRequest.update({
                where: { id: notifId },
                data: {
                    status: "Declined"
                }
            });
        });
    }
    acceptInviteToPlay(notifId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.inviteToPlay.update({
                where: { id: notifId },
                data: {
                    status: "Accepted"
                }
            });
        });
    }
    declineInviteToPlay(notifId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.inviteToPlay.update({
                where: { id: notifId },
                data: {
                    status: "Declined"
                }
            });
        });
    }
    makeFriends1(myId, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.update({
                where: { id: myId },
                data: {
                    friends: {
                        connect: {
                            id: senderId,
                        }
                    }
                }
            });
        });
    }
    makeFriends2(myId, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.update({
                where: { id: senderId },
                data: {
                    friends: {
                        connect: {
                            id: myId,
                        }
                    }
                }
            });
        });
    }
    checkIfFriend(myId, otherUser) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.count({
                where: {
                    id: myId,
                    friends: {
                        some: {
                            id: otherUser
                        }
                    }
                }
            });
        });
    }
    removeFriendRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.friendRequest.delete({
                where: { id: requestId }
            });
        });
    }
    removeFriendShip1(userId, otherUser) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.update({
                where: { id: userId },
                data: {
                    friends: {
                        disconnect: {
                            id: otherUser,
                        }
                    }
                }
            });
        });
    }
    removeFriendShip2(userId, otherUser) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.update({
                where: { id: userId },
                data: {
                    friends: {
                        disconnect: {
                            id: otherUser,
                        }
                    }
                }
            });
        });
    }
    blockedUsers(myId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.update({
                where: { id: myId },
                data: {
                    blockedUsers: {
                        push: targetId
                    }
                }
            });
        });
    }
    blockedByUsers(myId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.update({
                where: { id: targetId },
                data: {
                    blockedByUsers: {
                        push: myId
                    }
                }
            });
        });
    }
    getIsBlocked(myId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.count({
                where: { id: myId, blockedUsers: { has: targetId } },
            });
        });
    }
    getIsBlockedBy(myId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.count({
                where: { id: targetId, blockedByUsers: { has: myId } },
            });
        });
    }
    unblockBlockedUsers(myId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const myData = yield this.getUser(myId);
            const userIndex = myData.blockedUsers.findIndex((blockedUser) => blockedUser == targetId);
            if (userIndex === -1)
                return;
            const newBlockedList = myData.blockedUsers.filter((user) => user != targetId);
            return this.prisma.user.update({
                where: { id: myId },
                data: {
                    blockedUsers: newBlockedList
                }
            });
        });
    }
    removekBlockedByUsers(myId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const myData = yield this.getUser(targetId);
            const userIndex = myData.blockedByUsers.findIndex((blockedBy) => blockedBy == myId);
            if (userIndex === -1)
                return;
            const newBlockedByList = myData.blockedByUsers.filter((user) => user != myId);
            return this.prisma.user.update({
                where: { id: targetId },
                data: {
                    blockedByUsers: newBlockedByList
                }
            });
        });
    }
    friendList(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (myId === 'undifined')
                return;
            const user = yield this.prisma.user.findUnique({
                where: {
                    id: myId
                },
                include: {
                    friends: true
                }
            });
            if (!user)
                return;
            return user.friends;
        });
    }
    blocklist(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.findUnique({
                where: { id: myId },
            });
        });
    }
    getGameResult(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.gameResult.findMany({
                where: {
                    OR: [
                        { userId: myId },
                        { opponentId: myId }
                    ]
                },
                include: {
                    user: true,
                }
            });
        });
    }
    getAchievements(myId, achievement) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingRecord = yield this.prisma.achievement.findFirst({
                where: {
                    userId: myId
                },
            });
            if (!existingRecord)
                return;
            return this.prisma.achievement.updateMany({
                where: { id: existingRecord.id },
                data: {
                    [achievement]: true
                }
            });
        });
    }
    getAllAchievements(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.achievement.findFirst({
                where: { userId: myId }
            });
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, event_emitter_1.EventEmitter2])
], UserService);
//# sourceMappingURL=user.service.js.map