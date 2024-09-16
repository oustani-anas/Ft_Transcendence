import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatService } from './chat/chat.service';
import { ChatController } from './chat/chat.controller';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { GameModule } from './random-friend/game.module';
import { PlayFriendModule } from './Play_with_friend/game.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ChatModule, AuthModule, UserModule,GameModule,PlayFriendModule],
  controllers: [AppController, ChatController],
  providers: [AppService, ChatService, UserService, PrismaService, JwtService],
})
export class AppModule {}
