import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './strategy/42strategy';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: 'dontTellAnyone',
      signOptions: { expiresIn: '6000000000s' },
    }),
    PassportModule.register({ session: false }),
  ],
  providers: [AuthService, JwtStrategy, PrismaService,FortyTwoStrategy],
  controllers: [AuthController]
})
export class AuthModule {}