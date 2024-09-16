import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";
import { code } from "./dtos/auth.dto";
export declare class AuthController {
    private readonly jwtService;
    private readonly prisma;
    constructor(jwtService: JwtService, prisma: PrismaService);
    login(): void;
    ft_redirect(req: any, res: any): Promise<any>;
    ft_logout(res: any): Promise<void>;
    generateTwoFactorAuthCode(req: any, res: any): Promise<any>;
    verifyTwoFactorAuthCode(req: any, res: any, code: code): Promise<any>;
    enableTwoFactorAuth(req: any, res: any, body: code): Promise<any>;
    disableTwoFactorAuth(req: any, res: any): Promise<any>;
}
