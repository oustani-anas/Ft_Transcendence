import { ChatService } from './chat.service';
import { ChangeProtectedChannelPassword, ChangeToProtected, ChatChannelDTO } from './chat.dto';
import { UserService } from 'src/user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class ChatController {
    private readonly chatService;
    private readonly userService;
    private eventEmitter;
    constructor(chatService: ChatService, userService: UserService, eventEmitter: EventEmitter2);
    saltOrRounds: number;
    getChatGroups(): Promise<({
        members: {
            id: string;
            username: string;
            avatar: string;
            firstName: string;
            lastName: string;
            twoFactorAuthCode: string;
            twoFactorAuthEnabled: boolean;
            firstLogin: boolean;
            blockedByUsers: string[];
            blockedUsers: string[];
            status: string;
        }[];
    } & {
        id: string;
        name: string;
        avatar: string;
        password: string;
        status: string;
        owner: string;
        modes: string[];
        mutedUsers: string[];
        bannedUssers: string[];
        type: string;
    })[]>;
    createGroup(chatGroup: ChatChannelDTO): Promise<{
        id: string;
        name: string;
        avatar: string;
        password: string;
        status: string;
        owner: string;
        modes: string[];
        mutedUsers: string[];
        bannedUssers: string[];
        type: string;
    }>;
    uploadFile(file: any): any;
    getGroupsByUserId(userId: string): Promise<{
        success: boolean;
        data: ({
            members: {
                id: string;
                username: string;
                avatar: string;
                firstName: string;
                lastName: string;
                twoFactorAuthCode: string;
                twoFactorAuthEnabled: boolean;
                firstLogin: boolean;
                blockedByUsers: string[];
                blockedUsers: string[];
                status: string;
            }[];
        } & {
            id: string;
            name: string;
            avatar: string;
            password: string;
            status: string;
            owner: string;
            modes: string[];
            mutedUsers: string[];
            bannedUssers: string[];
            type: string;
        })[];
    }>;
    getGroupByGroupId(groupId: string, myId: string): Promise<{
        data: {
            members: {
                id: string;
                username: string;
                avatar: string;
                firstName: string;
                lastName: string;
                twoFactorAuthCode: string;
                twoFactorAuthEnabled: boolean;
                firstLogin: boolean;
                blockedByUsers: string[];
                blockedUsers: string[];
                status: string;
            }[];
        } & {
            id: string;
            name: string;
            avatar: string;
            password: string;
            status: string;
            owner: string;
            modes: string[];
            mutedUsers: string[];
            bannedUssers: string[];
            type: string;
        };
    }>;
    getMsgsByGroupId(groupId: string, myId: string): Promise<{
        message: ({
            sender: {
                id: string;
                username: string;
                avatar: string;
                firstName: string;
                lastName: string;
                twoFactorAuthCode: string;
                twoFactorAuthEnabled: boolean;
                firstLogin: boolean;
                blockedByUsers: string[];
                blockedUsers: string[];
                status: string;
            };
        } & {
            id: number;
            content: string;
            createdAt: Date;
            userId: string;
            chatGroupId: string;
        })[];
    }>;
    getIsMuted(userId: string, groupId: string): Promise<0 | 1>;
    getIfMember(userId: string, groupId: string): Promise<number>;
    getDm(myId: string, othersId: string): Promise<string>;
    addToPrivateRoom(payload: ChatChannelDTO): Promise<{
        id: string;
        name: string;
        avatar: string;
        password: string;
        status: string;
        owner: string;
        modes: string[];
        mutedUsers: string[];
        bannedUssers: string[];
        type: string;
    }>;
    changeRoomPassword(payload: ChangeProtectedChannelPassword): Promise<void>;
    changeRoomToProtected(request: any, payload: ChangeToProtected): Promise<void>;
}
