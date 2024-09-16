import { PrismaService } from '../prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    createGroup(chatGroup: any): Promise<{
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
    roomNameCheck(roomName: string): Promise<number>;
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
    getRoom(groupId: string): Promise<{
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
    addUserToRoom(userId: string, groupId: string): Promise<{
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
    addRoomToUser(userId: string, groupId: string): Promise<{
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
    getGroupsByUserId(userId: string): Promise<({
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
    getUser(userId: string): Promise<{
        groups: {
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
        }[];
    } & {
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
    getGroupWithMembers(groupId: string): Promise<{
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
    }>;
    addMessagesToRoom(payload: any): Promise<{
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
    getGroupMessages(roomId: string): Promise<({
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
    })[]>;
    kickUserFromRoom(userId: string, roomId: string): Promise<{
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
    } | -1>;
    banUserFromRoom(userId: string, roomId: string): Promise<{
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
    checkIfMuted(userId: string, roomId: string): Promise<0 | 1>;
    checkIfBanned(userId: string, roomId: string): Promise<number>;
    checkIfMember(userId: string, roomId: string): Promise<number>;
    checkIfAlreadyAdmin(userId: string, roomId: string): Promise<number>;
    MuteUserFromRoom(userId: string, roomId: string): Promise<{
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
    UnmuteUserFromRoom(userId: string, roomId: string): Promise<{
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
    makeAdminOnRoom(userId: string, roomId: string): Promise<{
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
    removeAdminOnRoom(userId: string, roomId: string): Promise<{
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
    setRoomToPublic(roomId: string): Promise<{
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
    setRoomToProtected(roomId: string, password: string): Promise<{
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
    changeRoomPassword(roomId: string, password: string): Promise<{
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
    isDMalreadyexist(userId1: string, userId2: string): Promise<{
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
    createDM(userId1: string, userId2: string): Promise<{
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
    addUserToPrivateRoom(payload: any): Promise<{
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
}
