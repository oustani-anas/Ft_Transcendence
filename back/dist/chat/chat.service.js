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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const uuid_1 = require("uuid");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    createGroup(chatGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.create({ data: chatGroup });
        });
    }
    roomNameCheck(roomName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.count({
                where: { name: roomName }
            });
        });
    }
    getChatGroups() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.findMany({
                include: { members: true },
            });
        });
    }
    getRoom(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.findUnique({
                where: { id: groupId }
            });
        });
    }
    addUserToRoom(userId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.update({
                where: { id: groupId },
                data: {
                    members: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
        });
    }
    addRoomToUser(userId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.update({
                where: { id: userId },
                data: {
                    groups: {
                        connect: {
                            id: groupId,
                        },
                    },
                },
            });
        });
    }
    getGroupsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.findMany({
                where: {
                    members: {
                        some: {
                            id: userId,
                        }
                    }
                },
                include: { members: true }
            });
        });
    }
    getUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.findUnique({
                where: { id: userId },
                include: { groups: true }
            });
        });
    }
    getGroupWithMembers(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.findUnique({
                where: { id: groupId },
                include: { members: true },
            });
        });
    }
    addMessagesToRoom(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.update({
                where: { id: payload.roomId },
                data: {
                    messages: {
                        create: {
                            content: payload.message,
                            userId: payload.userId,
                        },
                    },
                },
            });
        });
    }
    getGroupMessages(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.message.findMany({
                where: { chatGroupId: roomId },
                include: { sender: true }
            });
        });
    }
    kickUserFromRoom(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this.getGroupWithMembers(roomId);
            const user = yield this.getUser(userId);
            if (!room || !user)
                return -1;
            const userIndex = room.members.findIndex((member) => member.id === user.id);
            if (userIndex === -1)
                return -1;
            return this.prisma.chatGroup.update({
                where: { id: roomId },
                data: {
                    members: {
                        disconnect: { id: userId }
                    }
                }
            });
        });
    }
    banUserFromRoom(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this.getGroupWithMembers(roomId);
            const user = yield this.getUser(userId);
            if (!room || !user)
                return;
            const userIndex = room.members.findIndex((member) => member.id === user.id);
            if (userIndex === -1)
                return;
            if ((yield this.checkIfBanned(userId, roomId)) === 1)
                return;
            return this.prisma.chatGroup.update({
                where: { id: roomId },
                data: {
                    members: {
                        disconnect: { id: userId }
                    },
                    bannedUssers: {
                        push: user.id
                    }
                }
            });
        });
    }
    checkIfMuted(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomData = yield this.getRoom(roomId);
            if (roomData) {
                const mutedUser = roomData.mutedUsers.find(user => userId === user.split(" ")[0]);
                if (mutedUser) {
                    const timestampIn60Seconds = new Date();
                    if (Number(mutedUser.split(" ")[1]) > timestampIn60Seconds.setSeconds(timestampIn60Seconds.getSeconds())) {
                        return 1;
                    }
                    else {
                        yield this.UnmuteUserFromRoom(userId, roomId);
                        return 0;
                    }
                }
                else
                    return 0;
            }
        });
    }
    checkIfBanned(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.count({
                where: {
                    AND: [
                        { id: roomId },
                        { bannedUssers: { has: userId } }
                    ]
                }
            });
        });
    }
    checkIfMember(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.count({
                where: {
                    AND: [
                        { id: roomId },
                        { members: { some: { id: userId } } }
                    ]
                }
            });
        });
    }
    checkIfAlreadyAdmin(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.count({
                where: { id: roomId, modes: { has: userId } },
            });
        });
    }
    MuteUserFromRoom(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this.getGroupWithMembers(roomId);
            const user = yield this.getUser(userId.split(" ")[0]);
            if (!room || !user)
                return;
            const userIndex = room.members.findIndex((member) => member.id === user.id);
            if (userIndex === -1)
                return;
            if ((yield this.checkIfMuted(userId.split(" ")[0], roomId)) < 1) {
                return this.prisma.chatGroup.update({
                    where: { id: roomId },
                    data: {
                        mutedUsers: {
                            push: userId
                        }
                    }
                });
            }
        });
    }
    UnmuteUserFromRoom(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this.getGroupWithMembers(roomId);
            const user = yield this.getUser(userId);
            if (!room || !user)
                return;
            const userIndex = room.members.findIndex((member) => member.id === user.id);
            if (userIndex === -1)
                return;
            const newMutedList = room.mutedUsers.filter((user) => user.split(" ")[0] != userId);
            return this.prisma.chatGroup.update({
                where: { id: roomId },
                data: {
                    mutedUsers: {
                        set: newMutedList
                    }
                }
            });
        });
    }
    makeAdminOnRoom(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this.getGroupWithMembers(roomId);
            const user = yield this.getUser(userId);
            if (!room || !user)
                return;
            const userIndex = room.members.findIndex((member) => member.id === user.id);
            if (userIndex === -1)
                return;
            if ((yield this.checkIfAlreadyAdmin(userId, roomId)) < 1) {
                return this.prisma.chatGroup.update({
                    where: { id: roomId },
                    data: {
                        modes: {
                            push: user.id
                        }
                    }
                });
            }
        });
    }
    removeAdminOnRoom(userId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this.getGroupWithMembers(roomId);
            const user = yield this.getUser(userId);
            if (!room || !user)
                return;
            const userIndex = room.members.findIndex((member) => member.id === user.id);
            if (userIndex === -1)
                return;
            const adminsList = room.modes.filter((user) => user != userId);
            return this.prisma.chatGroup.update({
                where: { id: roomId },
                data: {
                    modes: {
                        set: adminsList
                    }
                }
            });
        });
    }
    setRoomToPublic(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.update({
                where: { id: roomId },
                data: {
                    password: "",
                    status: "Public"
                }
            });
        });
    }
    setRoomToProtected(roomId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.update({
                where: { id: roomId },
                data: {
                    password: password,
                    status: "Protected"
                }
            });
        });
    }
    changeRoomPassword(roomId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.chatGroup.update({
                where: { id: roomId },
                data: { password: password }
            });
        });
    }
    isDMalreadyexist(userId1, userId2) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.chatGroup.findFirst({
                where: {
                    type: "DM",
                    AND: [
                        {
                            members: {
                                some: {
                                    id: userId1
                                }
                            }
                        },
                        {
                            members: {
                                some: {
                                    id: userId2
                                }
                            }
                        },
                    ]
                }
            });
        });
    }
    createDM(userId1, userId2) {
        return __awaiter(this, void 0, void 0, function* () {
            const user1 = yield this.getUser(userId1);
            const user2 = yield this.getUser(userId2);
            if (!user1 || !user2)
                return;
            const isDMalreadyexist = yield this.isDMalreadyexist(userId1, userId2);
            if (isDMalreadyexist)
                return;
            const uuid = (0, uuid_1.v4)();
            return this.prisma.chatGroup.create({
                data: {
                    name: (0, uuid_1.v4)(),
                    avatar: null,
                    status: null,
                    password: null,
                    owner: null,
                    type: "DM",
                    members: {
                        connect: [
                            { id: userId1 },
                            { id: userId2 }
                        ]
                    }
                },
            });
        });
    }
    addUserToPrivateRoom(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.chatGroup.create({
                data: {
                    name: payload.name,
                    avatar: payload.avatar,
                    status: payload.status,
                    owner: payload.owner,
                    type: "",
                    members: {
                        connect: payload.addingToPrivateRoomList.map((userId) => ({
                            id: userId,
                        })),
                    }
                },
            });
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map