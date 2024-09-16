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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const passport_1 = require("@nestjs/passport");
const chat_dto_1 = require("./chat.dto");
const user_service_1 = require("../user/user.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const bcrypt = __importStar(require("bcrypt"));
let ChatController = class ChatController {
    constructor(chatService, userService, eventEmitter) {
        this.chatService = chatService;
        this.userService = userService;
        this.eventEmitter = eventEmitter;
        this.saltOrRounds = 10;
    }
    getChatGroups() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatService.getChatGroups();
        });
    }
    createGroup(chatGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const isNameAlreadyExistes = yield this.chatService.roomNameCheck(chatGroup.name);
            if (isNameAlreadyExistes)
                throw new common_1.BadRequestException('Name already taken');
            if (chatGroup.password) {
                chatGroup.password = yield bcrypt.hash(chatGroup.password, this.saltOrRounds);
            }
            return yield this.chatService.createGroup(chatGroup);
        });
    }
    uploadFile(file) {
        return (file.path);
    }
    getGroupsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const groups = yield this.chatService.getGroupsByUserId(userId);
                for (let group of groups) {
                    if (group.type === 'DM') {
                        const otherMember = group.members.find(member => member.id !== userId);
                        if (otherMember) {
                            group.name = otherMember.username;
                            group.avatar = otherMember.avatar;
                        }
                        group.members = group.members.filter(member => member.id !== userId);
                    }
                }
                return { success: true, data: groups };
            }
            catch (error) {
                console.error('Error :', error.message);
            }
        });
    }
    getGroupByGroupId(groupId, myId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!(yield this.getIfMember(myId, groupId)))
                    return;
                const group = yield this.chatService.getGroupWithMembers(groupId);
                if (group.type === 'DM') {
                    const otherMember = group.members.find(member => member.id !== myId);
                    if (otherMember) {
                        group.name = otherMember.username;
                        group.avatar = otherMember.avatar;
                    }
                    group.members = group.members.filter(member => member.id !== myId);
                }
                return { data: group };
            }
            catch (error) {
                console.error('Error :', error.message);
            }
        });
    }
    getMsgsByGroupId(groupId, myId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomData = yield this.chatService.getGroupWithMembers(groupId);
            if (!roomData)
                throw new common_1.NotFoundException("Group not found");
            const userIndex = roomData.members.findIndex((member) => member.id === myId);
            if (userIndex === -1)
                throw new common_1.NotFoundException("Group not found");
            const message = yield this.chatService.getGroupMessages(groupId);
            return { message };
        });
    }
    getIsMuted(userId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isMuted = yield this.chatService.checkIfMuted(userId, groupId);
            return isMuted;
        });
    }
    getIfMember(userId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isMember = yield this.chatService.checkIfMember(userId, groupId);
            return isMember;
        });
    }
    getDm(myId, othersId) {
        return __awaiter(this, void 0, void 0, function* () {
            const groupId = yield this.chatService.isDMalreadyexist(myId, othersId);
            if (!groupId)
                return;
            return groupId.id;
        });
    }
    addToPrivateRoom(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const isNameAlreadyExistes = yield this.chatService.roomNameCheck(payload.name);
            if (isNameAlreadyExistes)
                throw new common_1.BadRequestException('Name already taken');
            return yield this.chatService.addUserToPrivateRoom(payload);
        });
    }
    changeRoomPassword(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomData = yield this.chatService.getRoom(payload.roomId);
            if (roomData && (yield bcrypt.compare(payload.password, roomData.password)))
                throw new common_1.BadRequestException("Can't set the new password to the cuurent one. Chose a different Password");
            payload.password = yield bcrypt.hash(payload.password, this.saltOrRounds);
            yield this.chatService.changeRoomPassword(payload.roomId, payload.password);
            this.eventEmitter.emit("changeRoomPassword");
        });
    }
    changeRoomToProtected(request, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomData = yield this.chatService.getRoom(payload.roomId);
            if (!roomData)
                return;
            const user = yield this.userService.getUser(payload.userId);
            if (!user)
                return;
            payload.password = yield bcrypt.hash(payload.password, this.saltOrRounds);
            yield this.chatService.setRoomToProtected(payload.roomId, payload.password);
            this.eventEmitter.emit('setRoomToProtected', "lkhwa", payload, payload.roomId);
        });
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('/getChatGroups'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChatGroups", null);
__decorate([
    (0, common_1.Post)('/createGroup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.ChatChannelDTO]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Post)('uploads'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/groupsImages',
            filename: (req, file, callback) => {
                const filename = path.parse(file.originalname).name + (0, uuid_1.v4)();
                const extension = path.parse(file.originalname).ext;
                callback(null, `${filename}${extension}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('/getGroupsByUserId'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getGroupsByUserId", null);
__decorate([
    (0, common_1.Get)('/getGroupByGroupId'),
    __param(0, (0, common_1.Query)('groupId')),
    __param(1, (0, common_1.Query)('myId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getGroupByGroupId", null);
__decorate([
    (0, common_1.Get)('/getMsgsByGroupId'),
    __param(0, (0, common_1.Query)('groupId')),
    __param(1, (0, common_1.Query)('myId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMsgsByGroupId", null);
__decorate([
    (0, common_1.Get)('/getIsMuted'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getIsMuted", null);
__decorate([
    (0, common_1.Get)('/checkIfMember'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getIfMember", null);
__decorate([
    (0, common_1.Get)('/getDm'),
    __param(0, (0, common_1.Query)('myId')),
    __param(1, (0, common_1.Query)('othersId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getDm", null);
__decorate([
    (0, common_1.Post)('/addToPrivateRoom'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.ChatChannelDTO]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addToPrivateRoom", null);
__decorate([
    (0, common_1.Post)('/changeRoomPassword'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.ChangeProtectedChannelPassword]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "changeRoomPassword", null);
__decorate([
    (0, common_1.Post)('/setRoomToProtected'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, chat_dto_1.ChangeToProtected]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "changeRoomToProtected", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('/chat'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [chat_service_1.ChatService, user_service_1.UserService, event_emitter_1.EventEmitter2])
], ChatController);
//# sourceMappingURL=chat.controller.js.map