import { PrismaService } from 'src/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserService } from './user.service';
import { ChatService } from 'src/chat/chat.service';
import { UserDto } from './user.dto';
export declare class UserController {
    private readonly prisma;
    private eventEmitter;
    private UserService;
    private readonly ChatService;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2, UserService: UserService, ChatService: ChatService);
    Getme(req: any, res: any, headers: any): Promise<any>;
    Getdyali(userId: any): Promise<{
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
    }>;
    changeUsername(req: any, res: any, userDto: UserDto): Promise<any>;
    getUserByUserId(user: string): Promise<{
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
    }>;
    getAllUsers(input: string): Promise<{
        id: string;
        username: string;
        avatar: string;
        firstName: string;
        lastName: string;
        blockedByUsers: string[];
        blockedUsers: string[];
        status: string;
    }[]>;
    sendFriendRequest(req: any): Promise<void>;
    sendPlayAgain(req: any): Promise<void>;
    acceptFriendRequest(req: any): Promise<void>;
    declineFriendRequest(req: any): Promise<void>;
    acceptInviteToPlay(req: any): Promise<void>;
    declineInviteToPlay(req: any): Promise<void>;
    getMyNotifications(userId: string): Promise<({
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
        receiver: {
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
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getInviteToPlay(userId: string): Promise<({
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
        receiver: {
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
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    requestStatus(myId: string, receiverId: string): Promise<0 | {
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    checkIfFriend(myId: string, otherUser: string): Promise<number>;
    blockUser(req: any): Promise<void>;
    UnblockUser(req: any): Promise<void>;
    Accept(req: any): Promise<void>;
    displayFriends(userId: string): Promise<{
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
    }[]>;
    myBlockList(myId: string): Promise<string[]>;
    lastGames(userId: string): Promise<any>;
    achievements(userId: string): Promise<number>;
    getAllAchievements(userId: string): Promise<{
        id: string;
        userId: string;
        achiev1: boolean;
        achiev2: boolean;
        achiev3: boolean;
        achiev4: boolean;
        achiev5: boolean;
        achiev6: boolean;
    }>;
}
