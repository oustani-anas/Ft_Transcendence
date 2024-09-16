import Strategy from "passport-42";
import { PrismaService } from "src/prisma.service";
import { AuthService } from "../auth.service";
declare const FortyTwoStrategy_base: new (...args: any[]) => Strategy;
export declare class FortyTwoStrategy extends FortyTwoStrategy_base {
    private readonly prisma;
    private readonly service;
    constructor(prisma: PrismaService, service: AuthService);
    authenticate(request: any, options?: any): Promise<any>;
    validate(accessToken: string, refreshToken: string, profile: any): Promise<{
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
}
export {};
