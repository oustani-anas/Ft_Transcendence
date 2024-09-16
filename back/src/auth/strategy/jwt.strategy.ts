import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';

const extractCookie = (req: Request): string | null => {
  if (req.cookies && req.cookies.JWT_TOKEN ) {
    return req.cookies.JWT_TOKEN;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken() ]),
        secretOrKey: process.env.SECRET_KEY,
    });
  }

  async validate(payload: any) {
    try{
      const user = await this.prisma.user.findUnique({where: {id: payload.sub}});
      if (!user) {
        throw new UnauthorizedException('1');
      }
      return user;
    }
    catch (e) {
      throw new UnauthorizedException('2');
    }
  }
}