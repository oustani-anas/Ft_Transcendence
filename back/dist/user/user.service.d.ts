import { PrismaService } from 'src/prisma.service';
import { Socket } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class UserService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    private userSocketMap;
    addUserSocket(userId: string, socket: Socket): Promise<void>;
    removeUserSocket(userId: string, socket: Socket): Promise<void>;
    getUser(target: string): Promise<{
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
    updateProfile(status: string, userId: string): Promise<{
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
    userNameCheck(name: string): Promise<number>;
    createFriendRequest(target: string, sender: string): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createPlayRequest(target: string, sender: string): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    isAlreadySent(target: string, sender: string): Promise<number>;
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
    isRequestExistAndPending(notifId: string, myId: string): Promise<number>;
    isRequestExistAndPendingToPlay(notifId: string, myId: string): Promise<number>;
    isRequestExist(myId: string, receiverId: string): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deletePlayRequest(myId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    isPlayRequest(myId: string): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    pendFriendRequest(notifId: string, sender: string, target: string): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    pendPlayRequest(notifId: string, sender: string, target: string): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    acceptFriendRequest(notifId: string): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    declineFriendRequest(notifId: string): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    acceptInviteToPlay(notifId: string): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    declineInviteToPlay(notifId: string): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    makeFriends1(myId: string, senderId: string): Promise<{
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
    makeFriends2(myId: string, senderId: string): Promise<{
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
    checkIfFriend(myId: string, otherUser: string): Promise<number>;
    removeFriendRequest(requestId: string): Promise<{
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeFriendShip1(userId: string, otherUser: string): Promise<{
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
    removeFriendShip2(userId: string, otherUser: string): Promise<{
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
    blockedUsers(myId: string, targetId: string): Promise<{
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
    blockedByUsers(myId: string, targetId: string): Promise<{
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
    getIsBlocked(myId: string, targetId: string): Promise<number>;
    getIsBlockedBy(myId: string, targetId: string): Promise<number>;
    unblockBlockedUsers(myId: string, targetId: string): Promise<{
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
    removekBlockedByUsers(myId: string, targetId: string): Promise<{
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
    friendList(myId: any): Promise<{
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
    blocklist(myId: string): Promise<{
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
    getGameResult(myId: string): Promise<({
        user: {
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
        userId: string;
        opponentId: string;
        status: string;
        userScore: number;
        opponentScore: number;
    })[]>;
    getAchievements(myId: string, achievement: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getAllAchievements(myId: string): Promise<{
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
