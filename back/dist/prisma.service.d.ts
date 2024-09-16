import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, User } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    userExists(username: string): Promise<User>;
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
    getAllUsers(): Promise<{
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
}
