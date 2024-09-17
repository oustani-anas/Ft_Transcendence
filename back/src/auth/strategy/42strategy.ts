import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-42";
import { PrismaService } from "src/prisma.service";
import { AuthDto } from "../dtos/auth.dto";
import { AuthService } from "../auth.service";


@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor(private readonly prisma: PrismaService,
        private readonly service: AuthService) {
        super({
            clientID: process.env.CLIENT_ID, // matnssach t7etha f ".env" !!!!!
            clientSecret: process.env.CLIENT_SECRET, // matnssach t7etha f ".env" !!!!!
            callbackURL: process.env.CALLBACK_URL,
        });
    }

    async authenticate(request: any, options?: any): Promise<any> {
        if (request.query && request.query.error === 'access_denied') {
          return request.res.redirect('http://localhost:3000');
        }
        return super.authenticate(request, options);
      }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        try {
            
            const dto: AuthDto = {
                id: profile._json.id,
                username: profile._json.login,
                avatar: profile._json.image.link,
                firstName: profile._json.first_name,
                lastName: profile._json.last_name,
                twoFactorAuthEnabled: profile._json.twoFactorAuthEnabled,
            };
            const user = await this.service.findOrCreate(dto);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            return user;
        } catch (error) {
            // console.error('Error in FortyTwo authentication:', error);
            throw new UnauthorizedException('Failed to authenticate with FortyTwo');
        }
    }
}